import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import * as jose from "jose";
import * as cookie from "cookie";
import { randomBytes } from "node:crypto";
import { Session, Paths } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { env } from "./lib/env";
import {
  signSessionToken,
  toAuthenticatedUser,
  verifySessionToken,
} from "./lib/session";

const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const STATE_COOKIE = "google_oauth_state";
const googleJwks = jose.createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

function getConfigurationError(): string | null {
  if (!env.googleClientId) return "GOOGLE_CLIENT_ID is missing from .env.";
  if (!env.googleClientSecret) {
    return "GOOGLE_CLIENT_SECRET is missing from .env.";
  }
  if (!env.appSecret) return "APP_SECRET is missing from .env.";
  return null;
}

function getRedirectUri(requestUrl: string): string {
  return new URL(Paths.googleOAuthCallback, requestUrl).toString();
}

export function createGoogleOAuthStartHandler() {
  return (c: Context) => {
    const configError = getConfigurationError();
    if (configError) {
      console.error(`[config] Google sign-in unavailable: ${configError}`);
      return c.text(`Google sign-in is not configured: ${configError}`, 503);
    }

    const state = randomBytes(32).toString("hex");
    const options = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, STATE_COOKIE, state, {
      ...options,
      maxAge: 10 * 60,
    });

    const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_URL);
    authorizationUrl.searchParams.set("client_id", env.googleClientId);
    authorizationUrl.searchParams.set(
      "redirect_uri",
      getRedirectUri(c.req.url)
    );
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email profile");
    authorizationUrl.searchParams.set("state", state);

    return c.redirect(authorizationUrl.toString(), 302);
  };
}

async function exchangeCodeForIdToken(
  code: string,
  redirectUri: string
): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Google token exchange failed (${response.status}): ${detail}`
    );
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("id_token" in result) ||
    typeof result.id_token !== "string"
  ) {
    throw new Error("Google token response did not include an ID token.");
  }
  return result.id_token;
}

async function verifyGoogleIdToken(idToken: string) {
  const { payload } = await jose.jwtVerify(idToken, googleJwks, {
    issuer: GOOGLE_ISSUERS,
    audience: env.googleClientId,
  });
  if (
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    payload.email_verified !== true
  ) {
    throw new Error("Google ID token is missing a verified email or user ID.");
  }

  return {
    unionId: payload.sub,
    clientId: "google" as const,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : null,
    avatar: typeof payload.picture === "string" ? payload.picture : null,
  };
}

export function createGoogleOAuthCallbackHandler() {
  return async (c: Context) => {
    const configError = getConfigurationError();
    if (configError) {
      console.error(`[config] Google sign-in unavailable: ${configError}`);
      return c.text(`Google sign-in is not configured: ${configError}`, 503);
    }

    const state = c.req.query("state");
    const expectedState = getCookie(c, STATE_COOKIE);
    const code = c.req.query("code");
    const oauthError = c.req.query("error");
    const cookieOptions = getSessionCookieOptions(c.req.raw.headers);
    deleteCookie(c, STATE_COOKIE, { path: cookieOptions.path });

    if (oauthError) {
      return c.redirect("/login?error=google_sign_in_cancelled", 302);
    }
    if (!state || !expectedState || state !== expectedState || !code) {
      return c.text(
        "Google sign-in could not be verified. Please try again.",
        400
      );
    }

    try {
      const redirectUri = getRedirectUri(c.req.url);
      const idToken = await exchangeCodeForIdToken(code, redirectUri);
      const session = await verifyGoogleIdToken(idToken);
      const sessionToken = await signSessionToken(session);
      setCookie(c, Session.cookieName, sessionToken, {
        ...cookieOptions,
        maxAge: Session.maxAgeMs / 1000,
      });
      return c.redirect("/", 302);
    } catch (error) {
      console.error("[Google OAuth] Callback failed:", error);
      return c.redirect("/login?error=google_sign_in_failed", 302);
    }
  };
}

export async function authenticateRequest(headers: Headers) {
  const token = cookie.parse(headers.get("cookie") ?? "")[Session.cookieName];
  const session = await verifySessionToken(token ?? "");
  return session ? toAuthenticatedUser(session) : null;
}
