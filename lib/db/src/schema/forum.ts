import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const forumThreadsTable = pgTable("forum_threads", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  authorId: integer("author_id").notNull(),
  classId: integer("class_id"),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumPostsTable = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull(),
  authorId: integer("author_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertForumThreadSchema = createInsertSchema(forumThreadsTable).omit({ id: true, createdAt: true });
export const insertForumPostSchema = createInsertSchema(forumPostsTable).omit({ id: true, createdAt: true });
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumThread = typeof forumThreadsTable.$inferSelect;
export type ForumPost = typeof forumPostsTable.$inferSelect;
