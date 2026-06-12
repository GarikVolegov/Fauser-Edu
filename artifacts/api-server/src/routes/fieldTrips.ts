import { Router } from "express";
import { db, fieldTripsTable, fieldTripParticipantsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

async function enrichTrip(t: typeof fieldTripsTable.$inferSelect, userId: number) {
  const [teacher] = await db.select().from(usersTable).where(eq(usersTable.id, t.teacherId)).limit(1);
  const participants = await db.select().from(fieldTripParticipantsTable).where(eq(fieldTripParticipantsTable.fieldTripId, t.id));
  const myPart = participants.find(p => p.studentId === userId);
  return {
    ...t,
    teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown",
    budget: t.budget ? parseFloat(String(t.budget)) : null,
    participantCount: participants.filter(p => p.status === "approved").length,
    myStatus: myPart?.status ?? null,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const trips = await db.select().from(fieldTripsTable);
    res.json(await Promise.all(trips.map(t => enrichTrip(t, user.id))));
  } catch (err) {
    req.log.error({ err }, "Error listing field trips");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { title, description, date, destination, budget, classId } = req.body;
    if (!title || !date || !destination) return res.status(400).json({ error: "Missing fields" });

    const [trip] = await db.insert(fieldTripsTable).values({
      teacherId: user.id,
      title,
      description: description ?? null,
      date,
      destination,
      budget: budget ? String(budget) : null,
      classId: classId ?? null,
      status: "draft",
    }).returning();

    res.status(201).json(await enrichTrip(trip, user.id));
  } catch (err) {
    req.log.error({ err }, "Error creating field trip");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const [trip] = await db.update(fieldTripsTable).set({ status }).where(eq(fieldTripsTable.id, id)).returning();
    res.json(await enrichTrip(trip, user.id));
  } catch (err) {
    req.log.error({ err }, "Error updating field trip status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/join", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const fieldTripId = parseInt(req.params.id);

    const existing = await db.select().from(fieldTripParticipantsTable)
      .where(and(eq(fieldTripParticipantsTable.fieldTripId, fieldTripId), eq(fieldTripParticipantsTable.studentId, user.id)))
      .limit(1);

    if (existing.length > 0) return res.status(409).json({ error: "Already joined" });

    const [part] = await db.insert(fieldTripParticipantsTable).values({ fieldTripId, studentId: user.id, status: "pending" }).returning();
    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    res.status(201).json({ ...part, studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown", createdAt: part.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error joining field trip");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/participants/:studentId", requireAuth, async (req: any, res: any) => {
  try {
    const fieldTripId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);
    const { status } = req.body;

    const [part] = await db.update(fieldTripParticipantsTable)
      .set({ status })
      .where(and(eq(fieldTripParticipantsTable.fieldTripId, fieldTripId), eq(fieldTripParticipantsTable.studentId, studentId)))
      .returning();

    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, studentId)).limit(1);
    res.json({ ...part, studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown", createdAt: part.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating participant status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/participants", requireAuth, async (req: any, res: any) => {
  try {
    const fieldTripId = parseInt(req.params.id);
    const parts = await db.select().from(fieldTripParticipantsTable).where(eq(fieldTripParticipantsTable.fieldTripId, fieldTripId));
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
    res.json(parts.map(p => ({ ...p, studentName: userMap.get(p.studentId) ?? "Unknown", createdAt: p.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error listing participants");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
