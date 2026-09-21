import { NextResponse } from "next/server";
import { getSessionFromRequest, isValidSession } from "@/lib/admin-auth";
import { getContentData, uploadImage, uploadTargetFor, ValidationError } from "@/lib/content-store";

export async function POST(request: Request) {
  if (!isValidSession(getSessionFromRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const collection = String(form.get("collection") || "products");
  const id = String(form.get("id") || form.get("slug") || "");
  const file = form.get("file") ?? form.get("image") ?? form.get("logo");
  const target = uploadTargetFor(collection);
  if (!target) return NextResponse.json({ error: `Upload is not supported for ${collection}` }, { status: 400 });
  if (!id || !(file instanceof File)) return NextResponse.json({ error: "Item id and image file are required" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Image must be smaller than 8 MB" }, { status: 400 });
  try {
    const url = await uploadImage(collection, id, file);
    return NextResponse.json({ ok: true, url, data: await getContentData() });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Image upload failed";
    const isMimeError = /mime type must be one of/i.test(raw);
    const friendly = isMimeError
      ? "This file is not a valid image: its content does not match an image format. If it is a PDF or a phone photo (HEIC) renamed to .jpg, convert it to JPG or PNG and try again."
      : raw;
    const status = error instanceof ValidationError || isMimeError ? 400 : 500;
    return NextResponse.json({ error: friendly }, { status });
  }
}
