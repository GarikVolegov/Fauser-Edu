import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const classMessagesTable = pgTable("class_messages", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClassMessageSchema = createInsertSchema(
  classMessagesTable,
).omit({ id: true, createdAt: true });
export type InsertClassMessage = z.infer<typeof insertClassMessageSchema>;
export type ClassMessage = typeof classMessagesTable.$inferSelect;
