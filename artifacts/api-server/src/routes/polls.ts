import { Router } from "express";
import {
  db,
  pollsTable,
  pollOptionsTable,
  pollVotesTable,
  usersTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

async function enrichPoll(p: typeof pollsTable.$inferSelect, userId: number) {
  const options = await db
    .select()
    .from(pollOptionsTable)
    .where(eq(pollOptionsTable.pollId, p.id));
  const votes = await db
    .select()
    .from(pollVotesTable)
    .where(eq(pollVotesTable.pollId, p.id));
  const [author] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, p.authorId))
    .limit(1);
  const myVote = votes.find((v) => v.userId === userId);

  return {
    ...p,
    authorName: author ? `${author.firstName} ${author.lastName}` : "Unknown",
    options: options.map((o) => ({
      id: o.id,
      text: o.text,
      voteCount: votes.filter((v) => v.optionId === o.id).length,
    })),
    totalVotes: votes.length,
    myVoteOptionId: myVote?.optionId ?? null,
    expiresAt: p.expiresAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const polls = await db.select().from(pollsTable);
    res.json(await Promise.all(polls.map((p) => enrichPoll(p, user.id))));
  } catch (err) {
    req.log.error({ err }, "Error listing polls");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireRole(["teacher", "segreteria", "admin"]), async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { question, options, classId, expiresAt } = req.body;
    if (!question || !options?.length)
      return res.status(400).json({ error: "Missing fields" });

    const [poll] = await db
      .insert(pollsTable)
      .values({
        authorId: user.id,
        question,
        classId: classId ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    await Promise.all(
      options.map((text: string) =>
        db
          .insert(pollOptionsTable)
          .values({ pollId: poll.id, text })
          .returning(),
      ),
    );

    res.status(201).json(await enrichPoll(poll, user.id));
  } catch (err) {
    req.log.error({ err }, "Error creating poll");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/vote", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const pollId = parseInt(req.params.id);
    const { optionId } = req.body;

    const existing = await db
      .select()
      .from(pollVotesTable)
      .where(
        and(
          eq(pollVotesTable.pollId, pollId),
          eq(pollVotesTable.userId, user.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(pollVotesTable)
        .set({ optionId })
        .where(eq(pollVotesTable.id, existing[0].id));
    } else {
      await db
        .insert(pollVotesTable)
        .values({ pollId, optionId, userId: user.id });
    }

    const [poll] = await db
      .select()
      .from(pollsTable)
      .where(eq(pollsTable.id, pollId))
      .limit(1);
    res.json(await enrichPoll(poll, user.id));
  } catch (err) {
    req.log.error({ err }, "Error voting on poll");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireRole(["teacher", "segreteria", "admin"]), async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const [poll] = await db
      .update(pollsTable)
      .set({ status })
      .where(eq(pollsTable.id, id))
      .returning();
    res.json(await enrichPoll(poll, user.id));
  } catch (err) {
    req.log.error({ err }, "Error updating poll");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
