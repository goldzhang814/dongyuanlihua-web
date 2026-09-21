import { promises as fs } from "node:fs";
import path from "node:path";
import type { SiteData } from "@/types/content";
import { createPocketBaseQuote, createPocketBaseRecord, createPocketBaseUpload, deletePocketBaseRecord, getPocketBaseData, isPocketBaseConfigured, updatePocketBaseRecord, uploadPocketBaseFile } from "@/lib/pocketbase";
import { slugify, uniqueSlug } from "@/lib/slug";

export const collections = ["navigation", "products", "productCategories", "principals", "news", "newsCategories", "faqs", "quotes"] as const;
export type Collection = (typeof collections)[number];

export class ValidationError extends Error {}

type Item = Record<string, unknown>;

const dataPath = path.join(process.cwd(), "content", "data.json");
const navSourceValues = ["manual", "productCategories", "principals", "newsCategories"];

export async function getContentData(): Promise<SiteData> {
  if (isPocketBaseConfigured) return getPocketBaseData();
  const data = JSON.parse(await fs.readFile(dataPath, "utf8")) as Partial<SiteData>;
  return {
    navigation: data.navigation || [],
    products: data.products || [],
    productCategories: data.productCategories || [],
    principals: data.principals || [],
    news: data.news || [],
    newsCategories: data.newsCategories || [],
    faqs: data.faqs || [],
    quotes: data.quotes || [],
  };
}

async function readJsonFile(): Promise<Record<string, unknown>> {
  return JSON.parse((await fs.readFile(dataPath, "utf8")).replace(/^\uFEFF/, "")) as Record<string, unknown>;
}

function formatJsonItem(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(formatJsonItem).join(", ")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return "{ }";
    return `{ ${entries.map(([key, entry]) => `${JSON.stringify(key)}: ${formatJsonItem(entry)}`).join(", ")} }`;
  }
  return JSON.stringify(value) ?? "null";
}

async function writeJsonFile(data: Record<string, unknown>) {
  const lines = ["{"];
  const keys = Object.keys(data);
  keys.forEach((key, index) => {
    const value = data[key];
    const comma = index < keys.length - 1 ? "," : "";
    if (Array.isArray(value)) {
      lines.push(`  ${JSON.stringify(key)}: [`);
      value.forEach((item, itemIndex) => {
        lines.push(`    ${formatJsonItem(item)}${itemIndex < value.length - 1 ? "," : ""}`);
      });
      lines.push(`  ]${comma}`);
    } else {
      lines.push(`  ${JSON.stringify(key)}: ${formatJsonItem(value)}${comma}`);
    }
  });
  lines.push("}");
  await fs.writeFile(dataPath, `${lines.join("\n")}\n`, "utf8");
}

async function jsonList(collection: Collection) {
  const raw = await readJsonFile();
  const list = (raw[collection] as Item[] | undefined) || [];
  return { raw, list };
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((entry) => String(entry).trim()).filter(Boolean) : [];
}

function validateItem(collection: Collection, item: Item, items: Item[], selfId?: string) {
  const id = String(item.id || "");
  if (items.some((entry) => String(entry.id) === id && String(entry.id) !== selfId)) return `ID "${id}" already exists in this collection`;
  if (collection === "navigation") {
    if (!asText(item.key)) return "Key is required";
    if (!asText(item.label)) return "Label is required";
    if (!asText(item.href)) return "Link is required";
    if (item.source && !navSourceValues.includes(String(item.source))) return `Source must be one of: ${navSourceValues.join(", ")}`;
    const parent = asText(item.parent);
    if (parent && parent !== id && !items.some((entry) => String(entry.key) === parent && !asText(entry.parent))) return `Parent menu "${parent}" does not exist as a top-level item`;
  }
  if (collection === "products") {
    if (!asText(item.title)) return "Title is required";
    if (!asText(item.categoryId)) return "Select a product category";
    if (asText(item.description).length > 200000) return "Description is too long";
    item.specs = asList(item.specs);
  }
  if (collection === "news") {
    if (!asText(item.title)) return "Title is required";
    if (!asText(item.date)) return "Date is required";
  }
  if (collection === "principals" && !asText(item.name)) return "Name is required";
  if ((collection === "productCategories" || collection === "newsCategories") && !asText(item.name)) return "Name is required";
  if (collection === "faqs" && !asText(item.question)) return "Question is required";
  return null;
}

function normalizeNewItem(collection: Collection, input: Item, data: SiteData): Item {
  const items = data[collection] as unknown as Item[];
  const takenIds = items.map((item) => String(item.id));
  const item: Item = { ...input };
  if (collection === "navigation") {
    item.id = uniqueSlug(asText(item.id) || asText(item.key) || slugify(asText(item.label) || "menu"), takenIds);
    item.key = String(item.id);
    item.parent = asText(item.parent);
    item.sort = Number(item.sort) || (items.reduce((max, entry) => Math.max(max, Number(entry.sort) || 0), 0) + 10);
    item.enabled = item.enabled !== false;
    item.source = navSourceValues.includes(String(item.source)) ? item.source : "manual";
    return item;
  }
  const base = asText(item.id as string) || asText(item.slug as string);
  const seed = base || asText(item.title as string) || asText(item.name as string) || asText(item.question as string);
  item.id = uniqueSlug(slugify(seed || collection.slice(0, -1)), takenIds);
  if (collection === "products") item.specs = asList(item.specs);
  if (collection === "news") item.date = asText(item.date) || new Date().toISOString().slice(0, 10);
  return item;
}

export async function createItem(collection: Collection, input: Item): Promise<SiteData> {
  if (collection === "quotes") throw new ValidationError("Quotes are created through the public contact form");
  const data = await getContentData();
  const item = normalizeNewItem(collection, input, data);
  const items = data[collection] as unknown as Item[];
  const error = validateItem(collection, item, items);
  if (error) throw new ValidationError(error);
  if (collection === "products") validatePrincipalLink(item, data);
  if (collection === "products" && !asText(item.category)) {
    const category = data.productCategories.find((entry) => entry.slug === item.categoryId);
    if (category) item.category = category.name;
  }
  if (collection === "news" && !asText(item.category)) {
    const category = data.newsCategories.find((entry) => entry.slug === item.categoryId);
    if (category) item.category = category.name;
  }
  if (isPocketBaseConfigured) {
    await createPocketBaseRecord(collection, collection === "navigation" ? item : { ...item, slug: item.id });
  } else {
    const { raw, list } = await jsonList(collection);
    list.push(item);
    raw[collection] = list;
    await writeJsonFile(raw);
  }
  return getContentData();
}

export async function updateItem(collection: Collection, id: string, patch: Item): Promise<SiteData> {
  if (collection === "quotes") throw new ValidationError("Quotes cannot be edited");
  const data = await getContentData();
  const items = data[collection] as unknown as Item[];
  const index = items.findIndex((item) => String(item.id) === id);
  if (index < 0) throw new ValidationError("Item not found");
  let merged: Item;
  if (collection === "navigation") {
    merged = { ...items[index], ...patch, id, key: id };
    merged.sort = Number(merged.sort) || 0;
    merged.enabled = merged.enabled === true || merged.enabled === "true";
  } else {
    const newId = asText(patch.slug as string) || asText(patch.id as string) || id;
    merged = { ...items[index], ...patch, id: newId };
    if (collection === "products") merged.specs = asList(merged.specs);
  }
  const error = validateItem(collection, merged, items, id);
  if (error) throw new ValidationError(error);
  if (collection === "products") validatePrincipalLink(merged, data);
  if (isPocketBaseConfigured) {
    const rest = { ...merged };
    delete rest.id;
    await updatePocketBaseRecord(collection, id, collection === "navigation" ? rest : { ...rest, slug: merged.id });
  } else {
    const { raw, list } = await jsonList(collection);
    const target = list.findIndex((item) => String(item.id) === id);
    if (target < 0) throw new ValidationError("Item not found");
    list[target] = merged;
    raw[collection] = list;
    await writeJsonFile(raw);
  }
  return getContentData();
}

function validatePrincipalLink(item: Item, data: SiteData) {
  const principalId = asText(item.principalId);
  if (principalId && !data.principals.some((principal) => principal.slug === principalId)) {
    throw new ValidationError(`Principal "${principalId}" does not exist`);
  }
}

export async function deleteItem(collection: Collection, id: string): Promise<SiteData> {
  const data = await getContentData();
  const items = data[collection] as unknown as Item[];
  if (!items.some((item) => String(item.id) === id)) throw new ValidationError("Item not found");
  if (collection === "navigation" && items.some((item) => asText(item.parent) === id)) throw new ValidationError("Remove its submenu items before deleting this menu");
  if (isPocketBaseConfigured) {
    await deletePocketBaseRecord(collection, id);
  } else {
    const { raw, list } = await jsonList(collection);
    const target = list.findIndex((item) => String(item.id) === id);
    if (target < 0) throw new ValidationError("Item not found");
    list.splice(target, 1);
    raw[collection] = list;
    await writeJsonFile(raw);
  }
  return getContentData();
}

export async function upsertItems(collection: Collection, inputs: Item[]): Promise<SiteData> {
  if (!Array.isArray(inputs) || !inputs.length) throw new ValidationError("Nothing to save");
  for (const input of inputs) {
    const data = await getContentData();
    const items = data[collection] as unknown as Item[];
    const id = String(input.id || "");
    if (id && items.some((item) => String(item.id) === id)) await updateItem(collection, id, input);
    else await createItem(collection, input);
  }
  return getContentData();
}

export async function createQuote(input: Item): Promise<void> {
  const name = asText(input.name).slice(0, 100);
  const email = asText(input.email).slice(0, 200);
  if (!name) throw new ValidationError("Name is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("A valid email address is required");
  const quote: Item = {
    name,
    company: asText(input.company).slice(0, 200),
    email,
    interest: asText(input.interest).slice(0, 100),
    message: asText(input.message).slice(0, 5000),
    createdAt: new Date().toISOString(),
  };
  if (isPocketBaseConfigured) {
    await createPocketBaseQuote(quote);
    return;
  }
  const { raw, list } = await jsonList("quotes");
  quote.id = `quote-${Date.now()}`;
  list.push(quote);
  raw.quotes = list;
  await writeJsonFile(raw);
}

const uploadTargets = { products: { field: "image", label: "Product image" }, principals: { field: "logo", label: "Principal logo" } } as const;

export function uploadTargetFor(collection: string) {
  return uploadTargets[collection as keyof typeof uploadTargets] || null;
}

export async function uploadImage(collection: string, id: string, file: File): Promise<string> {
  const target = uploadTargetFor(collection);
  if (!target) throw new ValidationError(`Upload is not supported for ${collection}`);
  if (!isPocketBaseConfigured) throw new ValidationError("Image upload requires PocketBase; set POCKETBASE_URL in .env.local");
  return uploadPocketBaseFile(collection, id, target.field, file);
}

export async function uploadInlineImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new ValidationError("Only image files are supported");
  if (file.size > 8 * 1024 * 1024) throw new ValidationError("Image must be smaller than 8 MB");
  if (!isPocketBaseConfigured) throw new ValidationError("Image upload requires PocketBase; set POCKETBASE_URL in .env.local");
  return createPocketBaseUpload(file);
}
