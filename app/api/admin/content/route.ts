import { NextResponse } from "next/server";
import { getSessionFromRequest, isValidSession } from "@/lib/admin-auth";
import { getContentData } from "@/lib/content-store";
import { isPocketBaseConfigured } from "@/lib/pocketbase";

export async function GET(request: Request) {
  if (!isValidSession(getSessionFromRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: await getContentData(), backend: isPocketBaseConfigured ? "pocketbase" : "local" });
}
