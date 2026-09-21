const required = ["POCKETBASE_URL", "POCKETBASE_ADMIN_EMAIL", "POCKETBASE_ADMIN_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);

const baseUrl = process.env.POCKETBASE_URL.replace(/\/$/, "");
const text = (name, required = false) => ({ system: false, name, type: "text", required, presentable: false });
const uniqueIndex = (collection, field) => `CREATE UNIQUE INDEX idx_${collection}_${field} ON ${collection} (${field})`;

const collections = [
  { name: "product_categories", fields: [text("slug", true), text("name", true), text("description")], indexes: [uniqueIndex("product_categories", "slug")] },
  { name: "news_categories", fields: [text("slug", true), text("name", true), text("description")], indexes: [uniqueIndex("news_categories", "slug")] },
  { name: "principals", fields: [text("slug", true), text("name", true), text("shortName"), text("eyebrow"), text("title"), text("description"), text("seoTitle"), text("seoDescription"), text("seoKeywords"), text("year"), { system: false, name: "logo", type: "file", required: false, presentable: false, maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] }], indexes: [uniqueIndex("principals", "slug")] },
  { name: "products", fields: [text("slug", true), text("categoryId", true), text("category"), text("eyebrow"), text("title", true), text("summary"), text("description"), text("seoTitle"), text("seoDescription"), text("seoKeywords"), { system: false, name: "json", type: "json", required: false, presentable: false, maxSize: 2000000 }, { system: false, name: "image", type: "file", required: false, presentable: false, maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] }], indexes: [uniqueIndex("products", "slug")] },
  { name: "news", fields: [text("slug", true), text("date", true), text("categoryId"), text("category"), text("title", true), text("excerpt"), text("content"), text("seoTitle"), text("seoDescription"), text("seoKeywords")], indexes: [uniqueIndex("news", "slug")] },
  { name: "faqs", fields: [text("slug", true), text("question", true), text("answer")], indexes: [uniqueIndex("faqs", "slug")] },
  { name: "navigation", fields: [text("key", true), text("label", true), text("href", true), text("parent"), { system: false, name: "sort", type: "number", required: false, presentable: false, onlyInt: true }, { system: false, name: "enabled", type: "bool", required: false, presentable: false }, text("source")], indexes: [uniqueIndex("navigation", "key")] },
  { name: "quotes", fields: [text("name", true), text("company"), text("email", true), text("interest"), text("message"), text("createdAt")], indexes: [] },
];

const authResponse = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ identity: process.env.POCKETBASE_ADMIN_EMAIL, password: process.env.POCKETBASE_ADMIN_PASSWORD }),
});
if (!authResponse.ok) throw new Error(`PocketBase authentication failed (${authResponse.status})`);
const { token } = await authResponse.json();

async function api(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: { Authorization: token, "content-type": "application/json", ...(options.headers || {}) },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${options.method || "GET"} ${pathname} failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
  return response.status === 204 ? null : response.json();
}

for (const definition of collections) {
  const existing = await api(`/api/collections/${definition.name}`);
  if (!existing) {
    await api("/api/collections", { method: "POST", body: JSON.stringify({ name: definition.name, type: "base", fields: definition.fields, indexes: definition.indexes }) });
    console.log(`Created collection: ${definition.name}`);
    continue;
  }

  const existingFields = new Set((existing.fields || []).map((field) => field.name));
  const newFields = definition.fields.filter((field) => !existingFields.has(field.name));
  const existingIndexes = existing.indexes || [];
  const newIndexes = definition.indexes.filter((index) => !existingIndexes.includes(index));
  if (newFields.length || newIndexes.length) {
    await api(`/api/collections/${definition.name}`, { method: "PATCH", body: JSON.stringify({ fields: [...existing.fields, ...newFields], indexes: [...existingIndexes, ...newIndexes] }) });
    console.log(`Updated collection: ${definition.name}${newFields.length ? ` (+ ${newFields.map((field) => field.name).join(", ")})` : ""}`);
  } else {
    console.log(`Collection unchanged: ${definition.name}`);
  }
}

console.log("PocketBase schema migration complete.");
