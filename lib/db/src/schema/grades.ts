import { pgTable, serial, text, integer, numeric, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gradesTable = pgTable("grades", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  value: numeric("value", { precision: 4, scale: 2 }).notNull(),
  type: text("type").notNull().default("orale"),
  description: text("description"),
  date: date("date").notNull(),
  teacherId: integer("teacher_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGradeSchema = createInsertSchema(gradesTable).omit({ id: true, createdAt: true });
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof gradesTable.$inferSelect;
