import { readFile } from "node:fs/promises";
import path from "node:path";

const required = ["POCKETBASE_URL", "POCKETBASE_ADMIN_EMAIL", "POCKETBASE_ADMIN_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const baseUrl = process.env.POCKETBASE_URL.replace(/\/$/, "");
const sourcePath = path.join(process.cwd(), "content", "data.json");
const source = JSON.parse(await readFile(sourcePath, "utf8"));

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: { Authorization: token, "content-type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${options.method || "GET"} ${pathname} failed (${response.status}): ${detail.slice(0, 500)}`);
  }
  return response.status === 204 ? null : response.json();
}

const authResponse = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ identity: process.env.POCKETBASE_ADMIN_EMAIL, password: process.env.POCKETBASE_ADMIN_PASSWORD }),
});
if (!authResponse.ok) throw new Error(`PocketBase authentication failed (${authResponse.status})`);
const { token } = await authResponse.json();

const definitions = [
  { source: "productCategories", collection: "product_categories", key: "slug", payload: (item) => ({ slug: item.slug || item.id, name: item.name, description: item.description || "" }) },
  { source: "newsCategories", collection: "news_categories", key: "slug", payload: (item) => ({ slug: item.slug || item.id, name: item.name, description: item.description || "" }) },
  { source: "principals", collection: "principals", key: "slug", payload: (item) => ({ slug: item.slug || item.id, name: item.name, shortName: item.shortName || "", eyebrow: item.eyebrow || "", title: item.title || "", description: item.description || "", year: item.year || "", seoTitle: item.seoTitle || "", seoDescription: item.seoDescription || "", seoKeywords: item.seoKeywords || "" }) },
  { source: "products", collection: "products", key: "slug", payload: (item) => ({ slug: item.slug || item.id, categoryId: item.categoryId || "", category: item.category || "", eyebrow: item.eyebrow || "", title: item.title || "", summary: item.summary || "", description: item.description || "", seoTitle: item.seoTitle || "", seoDescription: item.seoDescription || "", seoKeywords: item.seoKeywords || "", json: item.specs || [] }) },
  { source: "news", collection: "news", key: "slug", payload: (item) => ({ slug: item.slug || item.id, date: item.date || "", categoryId: item.categoryId || "", category: item.category || "", title: item.title || "", excerpt: item.excerpt || "", content: item.content || "", seoTitle: item.seoTitle || "", seoDescription: item.seoDescription || "", seoKeywords: item.seoKeywords || "" }) },
  { source: "faqs", collection: "faqs", key: "slug", payload: (item) => ({ slug: item.slug || item.id, question: item.question, answer: item.answer }) },
  { source: "navigation", collection: "navigation", key: "key", payload: (item) => ({ key: item.key || item.id, label: item.label, href: item.href, parent: item.parent || "", sort: Number(item.sort || 0), enabled: item.enabled !== false, source: item.source || "manual" }) },
];

for (const definition of definitions) {
  const items = source[definition.source] || [];
  const schema = await request(`/api/collections/${definition.collection}`);
  const fields = new Set((schema.fields || []).map((field) => field.name));
  for (const item of items) {
    const fullPayload = definition.payload(item);
    const unsupported = Object.keys(fullPayload).filter((field) => !fields.has(field));
    if (unsupported.length) console.warn(`Skipping fields not yet present in ${definition.collection}: ${unsupported.join(", ")}`);
    const payload = Object.fromEntries(Object.entries(fullPayload).filter(([field]) => fields.has(field)));
    const value = String(payload[definition.key]).replace(/"/g, '\\"');
    const existing = await request(`/api/collections/${definition.collection}/records?filter=${encodeURIComponent(`${definition.key}="${value}"`)}&perPage=1`);
    const record = existing.items?.[0];
    if (record) {
      await request(`/api/collections/${definition.collection}/records/${record.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      console.log(`Updated ${definition.collection}: ${value}`);
    } else {
      await request(`/api/collections/${definition.collection}/records`, { method: "POST", body: JSON.stringify(payload) });
      console.log(`Created ${definition.collection}: ${value}`);
    }
  }
}

console.log("PocketBase content migration complete.");
