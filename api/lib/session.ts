import * as jose from "jose";
import { env } from "./env";

const JWT_ALG = "HS256";

export type SessionPayload = {
  unionId: string;
  clientId: "google";
  name: string | null;
  email: string;
  avatar: string | null;
};

export type AuthenticatedUser = SessionPayload & {
  id: null;
  role: "user";
};

export async function signSessionToken(
  payload: SessionPayload
): Promise<string> {
  if (!env.appSecret) {
    throw new Error("APP_SECRET is not configured.");
  }

  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  if (!token || !env.appSecret) return null;

  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    if (
      typeof payload.unionId !== "string" ||
      payload.clientId !== "google" ||
      typeof payload.email !== "string" ||
      !(typeof payload.name === "string" || payload.name === null) ||
      !(typeof payload.avatar === "string" || payload.avatar === null)
    ) {
      return null;
    }
    return {
      unionId: payload.unionId,
      clientId: "google",
      name: payload.name,
      email: payload.email,
      avatar: payload.avatar,
    };
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}

export function toAuthenticatedUser(
  session: SessionPayload
): AuthenticatedUser {
  return { ...session, id: null, role: "user" };
}
