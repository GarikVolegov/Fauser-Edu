import { pgTable, serial, integer, text, date, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fieldTripsTable = pgTable("field_trips", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  destination: text("destination").notNull(),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("draft"),
  classId: integer("class_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fieldTripParticipantsTable = pgTable("field_trip_participants", {
  id: serial("id").primaryKey(),
  fieldTripId: integer("field_trip_id").notNull(),
  studentId: integer("student_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFieldTripSchema = createInsertSchema(fieldTripsTable).omit({ id: true, createdAt: true });
export type InsertFieldTrip = z.infer<typeof insertFieldTripSchema>;
export type FieldTrip = typeof fieldTripsTable.$inferSelect;
export type FieldTripParticipant = typeof fieldTripParticipantsTable.$inferSelect;
