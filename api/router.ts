import { authRouter } from "./auth-router";
import { progressRouter } from "./progress-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  progress: progressRouter,
});

export type AppRouter = typeof appRouter;
