import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emailAccountsTable = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  imapHost: text("imap_host").notNull(),
  imapPort: integer("imap_port").notNull().default(993),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull().default(587),
  username: text("username").notNull(),
  passwordEncrypted: text("password_encrypted").notNull(),
  useSsl: boolean("use_ssl").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmailAccountSchema = createInsertSchema(emailAccountsTable).omit({ id: true, updatedAt: true });
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type EmailAccount = typeof emailAccountsTable.$inferSelect;
