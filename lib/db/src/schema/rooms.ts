import { pgTable, serial, integer, text, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roomsTable = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(30),
  type: text("type").notNull().default("aula"),
  equipment: text("equipment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const roomBookingsTable = pgTable("room_bookings", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  purpose: text("purpose").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoomSchema = createInsertSchema(roomsTable).omit({ id: true, createdAt: true });
export const insertRoomBookingSchema = createInsertSchema(roomBookingsTable).omit({ id: true, createdAt: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof roomsTable.$inferSelect;
export type RoomBooking = typeof roomBookingsTable.$inferSelect;
