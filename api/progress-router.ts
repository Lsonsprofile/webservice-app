import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  markSectionComplete,
  unmarkSectionComplete,
  getUserProgress,
  saveQuizResult,
  getUserQuizResults,
} from "./queries/progress";

const idSchema = z.string().min(1).max(128);

function requireDatabaseUserId(userId: number | null) {
  if (userId === null) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Progress persistence is unavailable until a database is configured.",
    });
  }
  return userId;
}

export const progressRouter = createRouter({
  // All sections the signed-in learner has completed.
  mine: authedQuery.query(({ ctx }) =>
    getUserProgress(requireDatabaseUserId(ctx.user.id))
  ),

  myQuizResults: authedQuery.query(({ ctx }) =>
    getUserQuizResults(requireDatabaseUserId(ctx.user.id))
  ),

  completeSection: authedQuery
    .input(z.object({ moduleId: idSchema, sectionId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      await markSectionComplete(
        requireDatabaseUserId(ctx.user.id),
        input.moduleId,
        input.sectionId
      );
      return { ok: true as const };
    }),

  resetSection: authedQuery
    .input(z.object({ sectionId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      await unmarkSectionComplete(
        requireDatabaseUserId(ctx.user.id),
        input.sectionId
      );
      return { ok: true as const };
    }),

  submitQuiz: authedQuery
    .input(
      z.object({
        moduleId: idSchema,
        score: z.number().int().min(0),
        totalQuestions: z.number().int().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.score > input.totalQuestions) {
        throw new Error("score cannot exceed totalQuestions");
      }
      await saveQuizResult(
        requireDatabaseUserId(ctx.user.id),
        input.moduleId,
        input.score,
        input.totalQuestions
      );
      return { ok: true as const };
    }),
});
