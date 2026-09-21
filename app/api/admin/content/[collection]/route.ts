import { NextResponse } from "next/server";
import { getSessionFromRequest, isValidSession } from "@/lib/admin-auth";
import { collections, createItem, upsertItems, ValidationError, type Collection } from "@/lib/content-store";

type Context = { params: Promise<{ collection: string }> };

const asCollection = (value: string): Collection | null =>
  (collections as readonly string[]).includes(value) ? value as Collection : null;

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed";
  const status = error instanceof ValidationError ? 400 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request, { params }: Context) {
  if (!isValidSession(getSessionFromRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { collection: name } = await params;
  const collection = asCollection(name);
  if (!collection) return NextResponse.json({ error: "Unknown collection" }, { status: 400 });
  const body = await request.json().catch(() => null) as { item?: Record<string, unknown> } | null;
  if (!body || typeof body.item !== "object" || !body.item) return NextResponse.json({ error: "Item payload required" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, data: await createItem(collection, body.item) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  if (!isValidSession(getSessionFromRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { collection: name } = await params;
  if (name !== "navigation") return NextResponse.json({ error: "Bulk save is only supported for navigation" }, { status: 400 });
  const body = await request.json().catch(() => null) as { items?: Record<string, unknown>[] } | null;
  if (!body || !Array.isArray(body.items) || !body.items.length) return NextResponse.json({ error: "Items payload required" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, data: await upsertItems("navigation", body.items) });
  } catch (error) {
    return errorResponse(error);
  }
}
