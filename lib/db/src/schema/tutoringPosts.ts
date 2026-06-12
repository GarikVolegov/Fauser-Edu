import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tutoringPostsTable = pgTable("tutoring_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  type: text("type").notNull().default("cerca"),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"),
  classId: integer("class_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTutoringPostSchema = createInsertSchema(tutoringPostsTable).omit({ id: true, createdAt: true });
export type InsertTutoringPost = z.infer<typeof insertTutoringPostSchema>;
export type TutoringPost = typeof tutoringPostsTable.$inferSelect;
