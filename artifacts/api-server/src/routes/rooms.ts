import { Router } from "express";
import { db, roomsTable, roomBookingsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const rooms = await db.select().from(roomsTable);
    res.json(
      rooms.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    );
  } catch (err) {
    req.log.error({ err }, "Error listing rooms");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireRole(["segreteria", "admin"]), async (req: any, res: any) => {
  try {
    const { name, capacity, type, equipment } = req.body;
    if (!name) return res.status(400).json({ error: "Missing name" });
    const [room] = await db
      .insert(roomsTable)
      .values({
        name,
        capacity: capacity ?? 30,
        type: type ?? "aula",
        equipment,
      })
      .returning();
    res.status(201).json({ ...room, createdAt: room.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating room");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bookings", requireAuth, async (req: any, res: any) => {
  try {
    const filters: any[] = [];
    if (req.query.roomId)
      filters.push(
        eq(roomBookingsTable.roomId, parseInt(req.query.roomId as string)),
      );
    if (req.query.date)
      filters.push(eq(roomBookingsTable.date, req.query.date as string));

    const bookings =
      filters.length > 0
        ? await db
            .select()
            .from(roomBookingsTable)
            .where(and(...filters))
        : await db.select().from(roomBookingsTable);

    const rooms = await db.select().from(roomsTable);
    const users = await db.select().from(usersTable);
    const roomMap = new Map(rooms.map((r) => [r.id, r.name]));
    const userMap = new Map(
      users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]),
    );

    res.json(
      bookings.map((b) => ({
        ...b,
        roomName: roomMap.get(b.roomId) ?? "Unknown",
        teacherName: userMap.get(b.teacherId) ?? "Unknown",
        createdAt: b.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Error listing room bookings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bookings", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { roomId, date, startTime, endTime, purpose } = req.body;
    if (!roomId || !date || !startTime || !endTime || !purpose)
      return res.status(400).json({ error: "Missing fields" });

    const conflict = await db
      .select()
      .from(roomBookingsTable)
      .where(
        and(
          eq(roomBookingsTable.roomId, roomId),
          eq(roomBookingsTable.date, date),
        ),
      )
      .then((bookings) =>
        bookings.find(
          (b) => !(endTime <= b.startTime || startTime >= b.endTime),
        ),
      );

    if (conflict)
      return res.status(409).json({ error: "Time slot already booked" });

    const [booking] = await db
      .insert(roomBookingsTable)
      .values({ roomId, teacherId: user.id, date, startTime, endTime, purpose })
      .returning();
    const [room] = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, booking.roomId))
      .limit(1);
    res.status(201).json({
      ...booking,
      roomName: room?.name ?? "Unknown",
      teacherName: `${user.firstName} ${user.lastName}`,
      createdAt: booking.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating room booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bookings/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(roomBookingsTable).where(eq(roomBookingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting room booking");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
