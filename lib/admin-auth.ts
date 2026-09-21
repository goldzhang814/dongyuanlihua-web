import { createHmac, timingSafeEqual } from "node:crypto";

const cookieName = "dongyuan_admin_session";
const sessionSecret = process.env.ADMIN_SESSION_SECRET || "local-development-session-secret";
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "change-me-now";

function sign(value: string) {
  return createHmac("sha256", sessionSecret).update(value).digest("hex");
}

export function validateCredentials(username: string, password: string) {
  return username === adminUsername && password === adminPassword;
}

export function createSession() {
  const value = `${adminUsername}:${Date.now()}`;
  return `${value}.${sign(value)}`;
}

export function isValidSession(value: string | undefined) {
  if (!value) return false;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return false;
  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function getSessionFromRequest(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  return match?.[1];
}

export function sessionCookie(value: string, maxAge = 60 * 60 * 8) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${cookieName}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

export function expiredSessionCookie() {
  return `${cookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}