import { Router } from "express";
import { db, behaviorNotesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { resolveStudentScope, parseId } from "../lib/requestHelpers";

const router = Router();

async function enrichNote(n: typeof behaviorNotesTable.$inferSelect) {
  const [student] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, n.studentId))
    .limit(1);
  const [teacher] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, n.teacherId))
    .limit(1);
  return {
    ...n,
    studentName: student
      ? `${student.firstName} ${student.lastName}`
      : "Unknown",
    teacherName: teacher
      ? `${teacher.firstName} ${teacher.lastName}`
      : "Unknown",
    createdAt: n.createdAt.toISOString(),
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
      filters.push(eq(behaviorNotesTable.studentId, scoped));

    const records =
      filters.length > 0
        ? await db
            .select()
            .from(behaviorNotesTable)
            .where(and(...filters))
        : await db.select().from(behaviorNotesTable);

    res.json(await Promise.all(records.map(enrichNote)));
  } catch (err) {
    req.log.error({ err }, "Error listing behavior notes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireRole(["teacher", "admin"]), async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { studentId, type, description, date } = req.body;

    if (!studentId || !type || !description || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [record] = await db
      .insert(behaviorNotesTable)
      .values({ studentId, teacherId: user.id, type, description, date })
      .returning();

    res.status(201).json(await enrichNote(record));
  } catch (err) {
    req.log.error({ err }, "Error creating behavior note");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireRole(["teacher", "admin"]), async (req: any, res: any) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const deleted = await db
      .delete(behaviorNotesTable)
      .where(eq(behaviorNotesTable.id, id))
      .returning();
    if (deleted.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting behavior note");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
