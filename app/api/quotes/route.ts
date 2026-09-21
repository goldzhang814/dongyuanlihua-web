import { NextResponse } from "next/server";
import { createQuote, ValidationError } from "@/lib/content-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  try {
    await createQuote(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save your inquiry";
    const status = error instanceof ValidationError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
