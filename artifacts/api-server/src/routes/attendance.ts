import { Router } from "express";
import { db, attendanceTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { resolveStudentScope, parseId } from "../lib/requestHelpers";
import {
  CreateAttendanceBody,
  UpdateAttendanceBody,
  ListAttendanceQueryParams,
  GetAttendanceSummaryQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/summary", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const parsed = GetAttendanceSummaryQueryParams.safeParse(req.query);
    const user = await getOrCreateUser(auth.userId!);
    const requested = parsed.success ? parsed.data.studentId : undefined;
    const studentId = resolveStudentScope(user, requested) ?? user.id;

    const records = await db
      .select()
      .from(attendanceTable)
      .where(eq(attendanceTable.studentId, studentId));
    const total = records.length;
    const presenti = records.filter((r) => r.status === "presente").length;
    const assenti = records.filter((r) => r.status === "assente").length;
    const ritardi = records.filter((r) => r.status === "ritardo").length;
    const usciteAnticipate = records.filter(
      (r) => r.status === "uscita_anticipata",
    ).length;

    res.json({
      total,
      presenti,
      assenti,
      ritardi,
      usciteAnticipate,
      percentualePresenza:
        total > 0 ? Math.round((presenti / total) * 100) : 100,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting attendance summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const parsed = ListAttendanceQueryParams.safeParse(req.query);
    const user = await getOrCreateUser(auth.userId!);
    const filters: any[] = [];

    if (parsed.success) {
      const scoped = resolveStudentScope(user, parsed.data.studentId);
      if (scoped !== undefined)
        filters.push(eq(attendanceTable.studentId, scoped));
      if (parsed.data.classId)
        filters.push(eq(attendanceTable.classId, parsed.data.classId));
      if (parsed.data.date)
        filters.push(eq(attendanceTable.date, parsed.data.date));
    } else {
      const scoped = resolveStudentScope(user, undefined);
      if (scoped !== undefined)
        filters.push(eq(attendanceTable.studentId, scoped));
    }

    const records =
      filters.length > 0
        ? await db
            .select()
            .from(attendanceTable)
            .where(and(...filters))
        : await db.select().from(attendanceTable);

    res.json(
      records.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    );
  } catch (err) {
    req.log.error({ err }, "Error listing attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireRole(["teacher", "segreteria", "admin"]), async (req: any, res: any) => {
  try {
    const parsed = CreateAttendanceBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });
    const record = await db.transaction(async (tx) => {
      const [r] = await tx
        .insert(attendanceTable)
        .values(parsed.data)
        .returning();
      return r;
    });
    res
      .status(201)
      .json({ ...record, createdAt: record.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireRole(["teacher", "segreteria", "admin"]), async (req: any, res: any) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const parsed = UpdateAttendanceBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });
    const [record] = await db
      .update(attendanceTable)
      .set(parsed.data)
      .where(eq(attendanceTable.id, id))
      .returning();
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json({ ...record, createdAt: record.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
