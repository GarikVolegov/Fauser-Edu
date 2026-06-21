import { Router } from "express";
import {
  db,
  quizzesTable,
  quizQuestionsTable,
  quizChoicesTable,
  quizResponsesTable,
  subjectsTable,
  usersTable,
  classesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

async function enrichQuiz(q: typeof quizzesTable.$inferSelect) {
  const [subject] = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.id, q.subjectId))
    .limit(1);
  const [cls] = await db
    .select()
    .from(classesTable)
    .where(eq(classesTable.id, q.classId))
    .limit(1);
  const [teacher] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, q.teacherId))
    .limit(1);
  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, q.id));
  return {
    ...q,
    subjectName: subject?.name ?? "Unknown",
    className: cls ? `${(cls as any).anno}${(cls as any).sezione}` : "Unknown",
    teacherName: teacher
      ? `${teacher.firstName} ${teacher.lastName}`
      : "Unknown",
    questionsCount: questions.length,
    createdAt: q.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const filters: any[] = [];
    if (req.query.classId)
      filters.push(
        eq(quizzesTable.classId, parseInt(req.query.classId as string)),
      );
    if (req.query.subjectId)
      filters.push(
        eq(quizzesTable.subjectId, parseInt(req.query.subjectId as string)),
      );
    if (user.role === "student")
      filters.push(eq(quizzesTable.classId, user.classId ?? 0));

    const quizzes =
      filters.length > 0
        ? await db
            .select()
            .from(quizzesTable)
            .where(and(...filters))
        : await db.select().from(quizzesTable);

    res.json(await Promise.all(quizzes.map(enrichQuiz)));
  } catch (err) {
    req.log.error({ err }, "Error listing quizzes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { title, subjectId, classId, duration = 30 } = req.body;
    if (!title || !subjectId || !classId)
      return res.status(400).json({ error: "Missing fields" });

    const [quiz] = await db
      .insert(quizzesTable)
      .values({
        title,
        subjectId,
        classId,
        teacherId: user.id,
        duration,
        status: "draft",
      })
      .returning();
    res.status(201).json(await enrichQuiz(quiz));
  } catch (err) {
    req.log.error({ err }, "Error creating quiz");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const [quiz] = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, id))
      .limit(1);
    if (!quiz) return res.status(404).json({ error: "Not found" });

    const [subject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, quiz.subjectId))
      .limit(1);
    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, quiz.classId))
      .limit(1);
    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, id));
    const questionsWithChoices = await Promise.all(
      questions.map(async (q) => {
        const choices = await db
          .select()
          .from(quizChoicesTable)
          .where(eq(quizChoicesTable.questionId, q.id));
        return { ...q, choices };
      }),
    );

    res.json({
      ...quiz,
      subjectName: subject?.name ?? "Unknown",
      className: cls
        ? `${(cls as any).anno}${(cls as any).sezione}`
        : "Unknown",
      duration: quiz.duration,
      status: quiz.status,
      questions: questionsWithChoices,
      createdAt: quiz.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting quiz");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const [quiz] = await db
      .update(quizzesTable)
      .set({ status })
      .where(eq(quizzesTable.id, id))
      .returning();
    res.json(await enrichQuiz(quiz));
  } catch (err) {
    req.log.error({ err }, "Error updating quiz");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/questions", requireAuth, async (req: any, res: any) => {
  try {
    const quizId = parseInt(req.params.id);
    const {
      text,
      type = "multiple_choice",
      points = 1,
      choices = [],
    } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    const existing = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, quizId));
    const [question] = await db
      .insert(quizQuestionsTable)
      .values({ quizId, text, type, order: existing.length + 1, points })
      .returning();

    const savedChoices = await Promise.all(
      choices.map((c: any) =>
        db
          .insert(quizChoicesTable)
          .values({
            questionId: question.id,
            text: c.text,
            isCorrect: c.isCorrect ?? false,
          })
          .returning()
          .then((r) => r[0]),
      ),
    );

    res.status(201).json({ ...question, choices: savedChoices });
  } catch (err) {
    req.log.error({ err }, "Error adding question");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/submit", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const quizId = parseInt(req.params.id);
    const { answers } = req.body;

    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, quizId));
    let score = 0;
    let totalPoints = 0;

    for (const q of questions) {
      totalPoints += q.points;
      const studentAnswer = answers[q.id];
      if (q.type === "multiple_choice" && studentAnswer) {
        const correctChoice = await db
          .select()
          .from(quizChoicesTable)
          .where(
            and(
              eq(quizChoicesTable.questionId, q.id),
              eq(quizChoicesTable.isCorrect, true),
            ),
          )
          .limit(1);
        if (
          correctChoice[0] &&
          String(correctChoice[0].id) === String(studentAnswer)
        ) {
          score += q.points;
        }
      }
    }

    const [response] = await db
      .insert(quizResponsesTable)
      .values({
        quizId,
        studentId: user.id,
        answers: JSON.stringify(answers),
        score,
      })
      .returning();

    const [quiz] = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, quizId))
      .limit(1);

    res.json({
      ...response,
      quizTitle: quiz?.title ?? "Unknown",
      studentName: `${user.firstName} ${user.lastName}`,
      totalPoints,
      percentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
      submittedAt: response.submittedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error submitting quiz");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/responses", requireAuth, async (req: any, res: any) => {
  try {
    const quizId = parseInt(req.params.id);
    const responses = await db
      .select()
      .from(quizResponsesTable)
      .where(eq(quizResponsesTable.quizId, quizId));
    const [quiz] = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, quizId))
      .limit(1);
    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, quizId));
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const enriched = await Promise.all(
      responses.map(async (r) => {
        const [student] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, r.studentId))
          .limit(1);
        return {
          ...r,
          quizTitle: quiz?.title ?? "Unknown",
          studentName: student
            ? `${student.firstName} ${student.lastName}`
            : "Unknown",
          totalPoints,
          percentage:
            totalPoints > 0
              ? Math.round(((r.score ?? 0) / totalPoints) * 100)
              : 0,
          submittedAt: r.submittedAt.toISOString(),
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error listing quiz responses");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
