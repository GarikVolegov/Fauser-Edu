import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

export const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.clerkId = userId;
  next();
};

export const getOrCreateUser = async (clerkId: string, email?: string, firstName?: string, lastName?: string) => {
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  if (existing.length > 0) return existing[0];

  const [newUser] = await db.insert(usersTable).values({
    clerkId,
    email: email ?? "",
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    role: "student",
  }).returning();
  return newUser;
};

export default router;
