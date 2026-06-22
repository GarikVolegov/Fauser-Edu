import { Router } from "express";
import {
  db,
  appointmentsTable,
  usersTable,
  notificationsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { parseId, canSetAppointmentStatus } from "../lib/requestHelpers";

const router = Router();

async function enrichAppointment(a: typeof appointmentsTable.$inferSelect) {
  const [teacher] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, a.teacherId))
    .limit(1);
  const [student] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, a.studentId))
    .limit(1);
  return {
    ...a,
    teacherName: teacher
      ? `${teacher.firstName} ${teacher.lastName}`
      : "Unknown",
    studentName: student
      ? `${student.firstName} ${student.lastName}`
      : "Unknown",
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const filters: any[] = [];

    const qTeacher =
      typeof req.query.teacherId === "string"
        ? parseId(req.query.teacherId)
        : null;
    const qStudent =
      typeof req.query.studentId === "string"
        ? parseId(req.query.studentId)
        : null;
    const qDate = typeof req.query.date === "string" ? req.query.date : null;

    if (user.role === "student") {
      // Students only ever see their own appointments.
      filters.push(eq(appointmentsTable.studentId, user.id));
    } else if (user.role === "teacher") {
      // Teachers see their own; optionally narrowed to one student.
      filters.push(eq(appointmentsTable.teacherId, user.id));
      if (qStudent !== null)
        filters.push(eq(appointmentsTable.studentId, qStudent));
    } else {
      // segreteria / admin: full access with optional filters.
      if (qTeacher !== null)
        filters.push(eq(appointmentsTable.teacherId, qTeacher));
      if (qStudent !== null)
        filters.push(eq(appointmentsTable.studentId, qStudent));
    }
    if (qDate) filters.push(eq(appointmentsTable.date, qDate));

    const records =
      filters.length > 0
        ? await db
            .select()
            .from(appointmentsTable)
            .where(and(...filters))
        : await db.select().from(appointmentsTable);

    res.json(await Promise.all(records.map(enrichAppointment)));
  } catch (err) {
    req.log.error({ err }, "Error listing appointments");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Slot availability without leaking other students' identities/notes:
// returns only the occupied (non-cancelled) time slots for a teacher+date.
router.get("/availability", requireAuth, async (req: any, res: any) => {
  try {
    const teacherId =
      typeof req.query.teacherId === "string"
        ? parseId(req.query.teacherId)
        : null;
    const date = typeof req.query.date === "string" ? req.query.date : null;
    if (teacherId === null || !date) {
      return res.status(400).json({ error: "teacherId and date are required" });
    }
    const rows = await db
      .select({
        timeSlot: appointmentsTable.timeSlot,
        status: appointmentsTable.status,
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.teacherId, teacherId),
          eq(appointmentsTable.date, date),
        ),
      );
    const occupied = rows
      .filter((r) => r.status !== "cancelled")
      .map((r) => r.timeSlot);
    res.json({ occupied });
  } catch (err) {
    req.log.error({ err }, "Error getting appointment availability");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { teacherId, studentId, date, timeSlot, notes } = req.body;
    if (!teacherId || !studentId || !date || !timeSlot) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (user.role === "student" && user.id !== parseInt(String(studentId))) {
      return res
        .status(403)
        .json({ error: "Students can only book for themselves" });
    }

    const conflict = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.teacherId, teacherId),
          eq(appointmentsTable.date, date),
          eq(appointmentsTable.timeSlot, timeSlot),
        ),
      )
      .limit(1);

    if (conflict.length > 0 && conflict[0].status !== "cancelled") {
      return res.status(409).json({ error: "Time slot already booked" });
    }

    const [record] = await db
      .insert(appointmentsTable)
      .values({
        teacherId,
        studentId,
        date,
        timeSlot,
        notes,
        status: "requested",
      })
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
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be confirmed or cancelled" });
    }

    const [existing] = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, id))
      .limit(1);
    if (!existing) return res.status(404).json({ error: "Not found" });

    if (!canSetAppointmentStatus(user, existing, status)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [record] = await db
      .update(appointmentsTable)
      .set({ status })
      .where(eq(appointmentsTable.id, id))
      .returning();

    const enriched = await enrichAppointment(record);

    const notifTitle =
      status === "confirmed" ? "Colloquio confermato" : "Colloquio annullato";
    const notifMessage =
      status === "confirmed"
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
