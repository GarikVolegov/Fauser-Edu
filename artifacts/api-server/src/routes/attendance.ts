import { Router } from "express";
import { db, attendanceTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
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
    let studentId: number | undefined;

    if (parsed.success && parsed.data.studentId) {
      studentId = parsed.data.studentId;
    } else {
      const user = await getOrCreateUser(auth.userId!);
      studentId = user.id;
    }

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
      if (parsed.data.studentId)
        filters.push(eq(attendanceTable.studentId, parsed.data.studentId));
      else if (user.role === "student")
        filters.push(eq(attendanceTable.studentId, user.id));
      if (parsed.data.classId)
        filters.push(eq(attendanceTable.classId, parsed.data.classId));
      if (parsed.data.date)
        filters.push(eq(attendanceTable.date, parsed.data.date));
    } else if (user.role === "student") {
      filters.push(eq(attendanceTable.studentId, user.id));
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

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = CreateAttendanceBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });
    const [record] = await db
      .insert(attendanceTable)
      .values(parsed.data)
      .returning();
    res
      .status(201)
      .json({ ...record, createdAt: record.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = UpdateAttendanceBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });
    const [record] = await db
      .update(attendanceTable)
      .set(parsed.data)
      .where(eq(attendanceTable.id, id))
      .returning();
    res.json({ ...record, createdAt: record.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating attendance");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
