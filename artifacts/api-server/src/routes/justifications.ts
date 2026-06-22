import { Router } from "express";
import {
  db,
  justificationsTable,
  attendanceTable,
  usersTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { resolveStudentScope, parseId } from "../lib/requestHelpers";

const router = Router();

async function enrichJustification(j: typeof justificationsTable.$inferSelect) {
  const [student] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, j.studentId))
    .limit(1);
  const [attendance] = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.id, j.attendanceId))
    .limit(1);
  let reviewerName: string | null = null;
  if (j.reviewedBy) {
    const [reviewer] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, j.reviewedBy))
      .limit(1);
    if (reviewer) reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
  }
  return {
    ...j,
    studentName: student
      ? `${student.firstName} ${student.lastName}`
      : "Unknown",
    attendanceDate: attendance?.date ?? null,
    reviewerName,
    createdAt: j.createdAt.toISOString(),
    reviewedAt: j.reviewedAt?.toISOString() ?? null,
  };
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const filters: any[] = [];

    const requestedStudentId =
      typeof req.query.studentId === "string"
        ? parseId(req.query.studentId)
        : undefined;
    const scoped = resolveStudentScope(user, requestedStudentId ?? undefined);
    if (scoped !== undefined)
      filters.push(eq(justificationsTable.studentId, scoped));

    const records =
      filters.length > 0
        ? await db
            .select()
            .from(justificationsTable)
            .where(and(...filters))
        : await db.select().from(justificationsTable);

    res.json(await Promise.all(records.map(enrichJustification)));
  } catch (err) {
    req.log.error({ err }, "Error listing justifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { attendanceId, studentId, reason } = req.body;
    if (!attendanceId || !studentId || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (user.role === "student" && user.id !== parseInt(studentId)) {
      return res.status(403).json({ error: "Students can only justify their own attendance" });
    }

    const existing = await db
      .select()
      .from(justificationsTable)
      .where(eq(justificationsTable.attendanceId, attendanceId))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Justification already submitted for this attendance record",
      });
    }

    const [record] = await db
      .insert(justificationsTable)
      .values({ attendanceId, studentId, reason, status: "pending" })
      .returning();

    res.status(201).json(await enrichJustification(record));
  } catch (err) {
    req.log.error({ err }, "Error creating justification");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireRole(["teacher", "segreteria", "admin"]), async (req: any, res: any) => {
  try {
    const user = req.user; // from requireRole
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be approved or rejected" });
    }

    const record = await db.transaction(async (tx) => {
      const [r] = await tx
        .update(justificationsTable)
        .set({ status, reviewedBy: user.id, reviewedAt: new Date() })
        .where(eq(justificationsTable.id, id))
        .returning();
      return r;
    });

    if (!record) return res.status(404).json({ error: "Not found" });

    res.json(await enrichJustification(record));
  } catch (err) {
    req.log.error({ err }, "Error reviewing justification");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
