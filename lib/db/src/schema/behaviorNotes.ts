import { pgTable, serial, integer, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const behaviorNotesTable = pgTable("behavior_notes", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  type: text("type").notNull().default("nota"),
  description: text("description").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBehaviorNoteSchema = createInsertSchema(behaviorNotesTable).omit({ id: true, createdAt: true });
export type InsertBehaviorNote = z.infer<typeof insertBehaviorNoteSchema>;
export type BehaviorNote = typeof behaviorNotesTable.$inferSelect;
