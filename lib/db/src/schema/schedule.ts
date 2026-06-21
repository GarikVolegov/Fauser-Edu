import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scheduleTable = pgTable("schedule", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  hour: integer("hour").notNull(),
  subjectId: integer("subject_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  room: text("room"),
});

export const insertScheduleSchema = createInsertSchema(scheduleTable).omit({ id: true });
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof scheduleTable.$inferSelect;
