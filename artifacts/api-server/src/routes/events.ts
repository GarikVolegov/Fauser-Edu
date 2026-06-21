import { Router } from "express";
import { db, eventsTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { CreateEventBody, UpdateEventBody, ListEventsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = ListEventsQueryParams.safeParse(req.query);
    const filters: any[] = [];

    if (parsed.success) {
      if (parsed.data.from) filters.push(gte(eventsTable.startDate, parsed.data.from));
      if (parsed.data.to) filters.push(lte(eventsTable.startDate, parsed.data.to));
    }

    const events = filters.length > 0
      ? await db.select().from(eventsTable).where(and(...filters))
      : await db.select().from(eventsTable);

    res.json(events.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error listing events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const parsed = CreateEventBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const [event] = await db.insert(eventsTable).values({
      ...parsed.data,
      createdById: user.id,
    }).returning();

    res.status(201).json({ ...event, createdAt: event.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = UpdateEventBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [event] = await db.update(eventsTable).set(parsed.data).where(eq(eventsTable.id, id)).returning();
    res.json({ ...event, createdAt: event.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(eventsTable).where(eq(eventsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting event");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
