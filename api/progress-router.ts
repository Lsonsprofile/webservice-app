import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  markSectionComplete,
  unmarkSectionComplete,
  getUserProgress,
  saveQuizResult,
  getUserQuizResults,
} from "./queries/progress";

const idSchema = z.string().min(1).max(128);

export const progressRouter = createRouter({
  // All sections the signed-in learner has completed.
  mine: authedQuery.query(({ ctx }) => getUserProgress(ctx.user.id)),

  myQuizResults: authedQuery.query(({ ctx }) => getUserQuizResults(ctx.user.id)),

  completeSection: authedQuery
    .input(z.object({ moduleId: idSchema, sectionId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      await markSectionComplete(ctx.user.id, input.moduleId, input.sectionId);
      return { ok: true as const };
    }),

  resetSection: authedQuery
    .input(z.object({ sectionId: idSchema }))
    .mutation(async ({ ctx, input }) => {
      await unmarkSectionComplete(ctx.user.id, input.sectionId);
      return { ok: true as const };
    }),

  submitQuiz: authedQuery
    .input(
      z.object({
        moduleId: idSchema,
        score: z.number().int().min(0),
        totalQuestions: z.number().int().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.score > input.totalQuestions) {
        throw new Error("score cannot exceed totalQuestions");
      }
      await saveQuizResult(
        ctx.user.id,
        input.moduleId,
        input.score,
        input.totalQuestions,
      );
      return { ok: true as const };
    }),
});
