import { Router } from "express";
import { db, assignmentsTable, subjectsTable, classesTable } from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { CreateAssignmentBody, UpdateAssignmentBody, ListAssignmentsQueryParams } from "@workspace/api-zod";

const router = Router();

const enrichAssignment = async (a: any) => {
  const subjects = await db.select().from(subjectsTable).where(eq(subjectsTable.id, a.subjectId)).limit(1);
  const classes = await db.select().from(classesTable).where(eq(classesTable.id, a.classId)).limit(1);
  return {
    ...a,
    subjectName: subjects[0]?.name ?? "Unknown",
    className: classes[0]?.name ?? "Unknown",
    createdAt: a.createdAt.toISOString(),
  };
};

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = ListAssignmentsQueryParams.safeParse(req.query);
    const filters: any[] = [];

    if (parsed.success) {
      if (parsed.data.classId) filters.push(eq(assignmentsTable.classId, parsed.data.classId));
      if (parsed.data.subjectId) filters.push(eq(assignmentsTable.subjectId, parsed.data.subjectId));
      if (parsed.data.upcoming) filters.push(gte(assignmentsTable.dueDate, new Date().toISOString().split("T")[0]));
    }

    const assignments = filters.length > 0
      ? await db.select().from(assignmentsTable).where(and(...filters))
      : await db.select().from(assignmentsTable);

    const enriched = await Promise.all(assignments.map(enrichAssignment));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error listing assignments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const parsed = CreateAssignmentBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const [assignment] = await db.insert(assignmentsTable).values({
      ...parsed.data,
      teacherId: user.id,
    }).returning();

    res.status(201).json(await enrichAssignment(assignment));
  } catch (err) {
    req.log.error({ err }, "Error creating assignment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const [assignment] = await db.select().from(assignmentsTable).where(eq(assignmentsTable.id, id)).limit(1);
    if (!assignment) return res.status(404).json({ error: "Not found" });
    res.json(await enrichAssignment(assignment));
  } catch (err) {
    req.log.error({ err }, "Error getting assignment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = UpdateAssignmentBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [assignment] = await db.update(assignmentsTable).set(parsed.data).where(eq(assignmentsTable.id, id)).returning();
    res.json(await enrichAssignment(assignment));
  } catch (err) {
    req.log.error({ err }, "Error updating assignment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(assignmentsTable).where(eq(assignmentsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting assignment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
