import { NextResponse } from "next/server";
import { createSession, expiredSessionCookie, getSessionFromRequest, isValidSession, sessionCookie, validateCredentials } from "@/lib/admin-auth";

export async function GET(request: Request) {
  return NextResponse.json({ authenticated: isValidSession(getSessionFromRequest(request)) });
}

export async function POST(request: Request) {
  const body = await request.json() as { username?: string; password?: string };
  if (!body.username || !body.password || !validateCredentials(body.username, body.password)) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.headers.set("Set-Cookie", sessionCookie(createSession()));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.headers.set("Set-Cookie", expiredSessionCookie());
  return response;
}