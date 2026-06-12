import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const justificationsTable = pgTable("justifications", {
  id: serial("id").primaryKey(),
  attendanceId: integer("attendance_id").notNull(),
  studentId: integer("student_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJustificationSchema = createInsertSchema(justificationsTable).omit({ id: true, createdAt: true, reviewedAt: true, reviewedBy: true });
export type InsertJustification = z.infer<typeof insertJustificationSchema>;
export type Justification = typeof justificationsTable.$inferSelect;
