import { Router } from "express";
import { db, appointmentsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

async function enrichAppointment(a: typeof appointmentsTable.$inferSelect) {
  const [teacher] = await db.select().from(usersTable).where(eq(usersTable.id, a.teacherId)).limit(1);
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, a.studentId)).limit(1);
  return {
    ...a,
    teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown",
    studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const filters: any[] = [];

    if (req.query.teacherId) filters.push(eq(appointmentsTable.teacherId, parseInt(req.query.teacherId as string)));
    if (req.query.studentId) filters.push(eq(appointmentsTable.studentId, parseInt(req.query.studentId as string)));
    if (req.query.date) filters.push(eq(appointmentsTable.date, req.query.date as string));

    if (filters.length === 0) {
      if (user.role === "student") filters.push(eq(appointmentsTable.studentId, user.id));
      else if (user.role === "teacher") filters.push(eq(appointmentsTable.teacherId, user.id));
    }

    const records = filters.length > 0
      ? await db.select().from(appointmentsTable).where(and(...filters))
      : await db.select().from(appointmentsTable);

    res.json(await Promise.all(records.map(enrichAppointment)));
  } catch (err) {
    req.log.error({ err }, "Error listing appointments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { teacherId, studentId, date, timeSlot, notes } = req.body;
    if (!teacherId || !studentId || !date || !timeSlot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const conflict = await db
      .select()
      .from(appointmentsTable)
      .where(and(
        eq(appointmentsTable.teacherId, teacherId),
        eq(appointmentsTable.date, date),
        eq(appointmentsTable.timeSlot, timeSlot),
      ))
      .limit(1);

    if (conflict.length > 0 && conflict[0].status !== "cancelled") {
      return res.status(409).json({ error: "Time slot already booked" });
    }

    const [record] = await db
      .insert(appointmentsTable)
      .values({ teacherId, studentId, date, timeSlot, notes, status: "requested" })
      .returning();

    const enriched = await enrichAppointment(record);

    await db.insert(notificationsTable).values({
      userId: teacherId,
      type: "appointment",
      title: "Nuova richiesta colloquio",
      message: `${enriched.studentName} ha richiesto un colloquio per ${date} alle ${timeSlot}`,
      referenceId: record.id,
      referenceType: "appointment",
    });

    res.status(201).json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error creating appointment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Status must be confirmed or cancelled" });
    }

    const [record] = await db
      .update(appointmentsTable)
      .set({ status })
      .where(eq(appointmentsTable.id, id))
      .returning();

    const enriched = await enrichAppointment(record);

    const notifTitle = status === "confirmed" ? "Colloquio confermato" : "Colloquio annullato";
    const notifMessage = status === "confirmed"
      ? `Il colloquio con ${enriched.teacherName} per ${record.date} alle ${record.timeSlot} è stato confermato`
      : `Il colloquio con ${enriched.teacherName} per ${record.date} alle ${record.timeSlot} è stato annullato`;

    await db.insert(notificationsTable).values({
      userId: record.studentId,
      type: "appointment",
      title: notifTitle,
      message: notifMessage,
      referenceId: record.id,
      referenceType: "appointment",
    });

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error updating appointment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
