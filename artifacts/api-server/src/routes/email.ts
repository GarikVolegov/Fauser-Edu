import { Router } from "express";
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";
import { db, emailAccountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { encrypt, decrypt } from "../lib/crypto";

const router = Router();

router.get("/account", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const [account] = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.userId, user.id)).limit(1);
    if (!account) return res.status(404).json({ error: "No email account configured" });
    res.json({
      id: account.id,
      userId: account.userId,
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      smtpHost: account.smtpHost,
      smtpPort: account.smtpPort,
      username: account.username,
      useSsl: account.useSsl,
      updatedAt: account.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting email account");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/account", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { imapHost, imapPort, smtpHost, smtpPort, username, password, useSsl } = req.body;
    if (!imapHost || !smtpHost || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const passwordEncrypted = encrypt(String(password));
    const existing = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.userId, user.id)).limit(1);

    let account;
    if (existing.length > 0) {
      [account] = await db.update(emailAccountsTable).set({
        imapHost: String(imapHost),
        imapPort: Number(imapPort ?? 993),
        smtpHost: String(smtpHost),
        smtpPort: Number(smtpPort ?? 587),
        username: String(username),
        passwordEncrypted,
        useSsl: useSsl !== false,
        updatedAt: new Date(),
      }).where(eq(emailAccountsTable.userId, user.id)).returning();
    } else {
      [account] = await db.insert(emailAccountsTable).values({
        userId: user.id,
        imapHost: String(imapHost),
        imapPort: Number(imapPort ?? 993),
        smtpHost: String(smtpHost),
        smtpPort: Number(smtpPort ?? 587),
        username: String(username),
        passwordEncrypted,
        useSsl: useSsl !== false,
      }).returning();
    }

    res.json({
      id: account.id,
      userId: account.userId,
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      smtpHost: account.smtpHost,
      smtpPort: account.smtpPort,
      username: account.username,
      useSsl: account.useSsl,
      updatedAt: account.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error saving email account");
    res.status(500).json({ error: "Internal server error" });
  }
});

async function getAccountForUser(userId: number) {
  const [account] = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.userId, userId)).limit(1);
  return account ?? null;
}

function makeImapClient(account: { imapHost: string; imapPort: number; useSsl: boolean; username: string; passwordEncrypted: string }) {
  return new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.useSsl,
    auth: { user: account.username, pass: decrypt(account.passwordEncrypted) },
    logger: false,
  });
}

router.get("/inbox", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const account = await getAccountForUser(user.id);
    if (!account) return res.status(424).json({ error: "No email account configured" });

    const limit = Math.min(parseInt(String(req.query.limit ?? "30")), 100);
    const client = makeImapClient(account);

    await client.connect();
    const mailbox = await client.mailboxOpen("INBOX");
    const total = mailbox.exists;
    const messages: any[] = [];

    if (total > 0) {
      const from = Math.max(1, total - limit + 1);
      const range = `${from}:${total}`;

      for await (const msg of client.fetch(range, { envelope: true, flags: true })) {
        const envelope = msg.envelope;
        messages.push({
          uid: msg.uid,
          subject: envelope?.subject ?? "(nessun oggetto)",
          from: envelope?.from?.[0]?.address ?? "",
          date: envelope?.date?.toISOString() ?? new Date().toISOString(),
          seen: msg.flags?.has("\\Seen") ?? false,
        });
      }
    }

    await client.logout();
    res.json(messages.reverse());
  } catch (err: any) {
    req.log.error({ err }, "Error fetching inbox");
    res.status(500).json({ error: err?.message ?? "Failed to fetch inbox" });
  }
});

router.get("/message/:uid", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const account = await getAccountForUser(user.id);
    if (!account) return res.status(424).json({ error: "No email account configured" });

    const uid = parseInt(req.params.uid);
    const client = makeImapClient(account);

    await client.connect();
    await client.mailboxOpen("INBOX");

    let result: any = null;
    for await (const msg of client.fetch({ uid }, { envelope: true, flags: true, source: true }, { uid: true })) {
      const source = msg.source;
      const envelope = msg.envelope;
      if (source) {
        const parsed = await (simpleParser as any)(source);
        result = {
          uid: msg.uid,
          subject: envelope?.subject ?? "(nessun oggetto)",
          from: envelope?.from?.[0]?.address ?? "",
          to: envelope?.to?.[0]?.address ?? "",
          date: envelope?.date?.toISOString() ?? new Date().toISOString(),
          text: parsed?.text ?? null,
          html: typeof parsed?.html === "string" ? parsed.html : null,
          seen: msg.flags?.has("\\Seen") ?? false,
        };
      }
    }

    await client.logout();
    if (!result) return res.status(404).json({ error: "Message not found" });
    res.json(result);
  } catch (err: any) {
    req.log.error({ err }, "Error fetching message");
    res.status(500).json({ error: err?.message ?? "Failed to fetch message" });
  }
});

router.post("/send", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const account = await getAccountForUser(user.id);
    if (!account) return res.status(424).json({ error: "No email account configured" });

    const { to, subject, text } = req.body;
    if (!to || !subject || !text) return res.status(400).json({ error: "Missing fields" });

    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpPort === 465,
      auth: { user: account.username, pass: decrypt(account.passwordEncrypted) },
    });

    await transporter.sendMail({ from: account.username, to, subject, text });
    res.json({ ok: true });
  } catch (err: any) {
    req.log.error({ err }, "Error sending email");
    res.status(500).json({ error: err?.message ?? "Failed to send email" });
  }
});

export default router;
