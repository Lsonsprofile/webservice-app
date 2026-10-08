import { and, eq } from "drizzle-orm";
import { getDb } from "./connection";
import { sectionProgress, quizResults } from "../../db/schema";

export async function markSectionComplete(
  userId: number,
  moduleId: string,
  sectionId: string,
) {
  const db = getDb();
  await db
    .insert(sectionProgress)
    .values({ userId, moduleId, sectionId })
    .onDuplicateKeyUpdate({ set: { completedAt: new Date() } });
}

export async function unmarkSectionComplete(userId: number, sectionId: string) {
  const db = getDb();
  await db
    .delete(sectionProgress)
    .where(
      and(
        eq(sectionProgress.userId, userId),
        eq(sectionProgress.sectionId, sectionId),
      ),
    );
}

export async function getUserProgress(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(sectionProgress)
    .where(eq(sectionProgress.userId, userId));
}

export async function saveQuizResult(
  userId: number,
  moduleId: string,
  score: number,
  totalQuestions: number,
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(quizResults)
    .where(
      and(eq(quizResults.userId, userId), eq(quizResults.moduleId, moduleId)),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(quizResults).values({ userId, moduleId, score, totalQuestions });
  } else if (score > existing[0].score) {
    await db
      .update(quizResults)
      .set({ score, totalQuestions, createdAt: new Date() })
      .where(eq(quizResults.id, existing[0].id));
  }
}

export async function getUserQuizResults(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, userId));
}
