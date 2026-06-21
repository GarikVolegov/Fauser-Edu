import {
  pgTable,
  serial,
  integer,
  text,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const competenciesTable = pgTable("competencies", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studentCompetenciesTable = pgTable("student_competencies", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  competencyId: integer("competency_id").notNull(),
  level: integer("level").notNull().default(0),
  teacherId: integer("teacher_id").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCompetencySchema = createInsertSchema(
  competenciesTable,
).omit({ id: true, createdAt: true });
export const insertStudentCompetencySchema = createInsertSchema(
  studentCompetenciesTable,
).omit({ id: true, createdAt: true });
export type InsertCompetency = z.infer<typeof insertCompetencySchema>;
export type Competency = typeof competenciesTable.$inferSelect;
export type StudentCompetency = typeof studentCompetenciesTable.$inferSelect;
