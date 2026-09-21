import { NextResponse } from "next/server";
import { getSessionFromRequest, isValidSession } from "@/lib/admin-auth";
import { collections, deleteItem, updateItem, ValidationError, type Collection } from "@/lib/content-store";

type Context = { params: Promise<{ collection: string; id: string }> };

const asCollection = (value: string): Collection | null =>
  (collections as readonly string[]).includes(value) ? value as Collection : null;

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed";
  const status = error instanceof ValidationError ? 400 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, { params }: Context) {
  if (!isValidSession(getSessionFromRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { collection: name, id } = await params;
  const collection = asCollection(name);
  if (!collection || !id) return NextResponse.json({ error: "Unknown collection or item" }, { status: 400 });
  const body = await request.json().catch(() => null) as { patch?: Record<string, unknown> } | null;
  if (!body || typeof body.patch !== "object" || !body.patch) return NextResponse.json({ error: "Patch payload required" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, data: await updateItem(collection, id, body.patch) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  if (!isValidSession(getSessionFromRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { collection: name, id } = await params;
  const collection = asCollection(name);
  if (!collection || !id) return NextResponse.json({ error: "Unknown collection or item" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, data: await deleteItem(collection, id) });
  } catch (error) {
    return errorResponse(error);
  }
}
