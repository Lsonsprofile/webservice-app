import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { AuthenticatedUser } from "./lib/session";
import { authenticateRequest } from "./google-auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: AuthenticatedUser;
};

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  ctx.user = (await authenticateRequest(opts.req.headers)) ?? undefined;
  return ctx;
}
