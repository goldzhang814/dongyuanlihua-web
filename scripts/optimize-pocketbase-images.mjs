// Batch-optimize PocketBase images: download -> resize/convert to WebP -> re-upload.
// Existing file fields keep working because PocketBase swaps the stored file on PATCH.
// The "uploads" collection is skipped: its file URLs are embedded in rich-text HTML.
// Run: node --env-file=.env.production scripts/optimize-pocketbase-images.mjs
import sharp from "sharp";

const required = ["POCKETBASE_URL", "POCKETBASE_ADMIN_EMAIL", "POCKETBASE_ADMIN_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);

const baseUrl = process.env.POCKETBASE_URL.replace(/\/$/, "");
const skipCollections = new Set(["uploads", "_superusers", "_auths"]);

const authResponse = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ identity: process.env.POCKETBASE_ADMIN_EMAIL, password: process.env.POCKETBASE_ADMIN_PASSWORD }),
});
if (!authResponse.ok) throw new Error(`PocketBase authentication failed (${authResponse.status})`);
const { token } = await authResponse.json();
console.log(`Authenticated against ${baseUrl}`);

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: { Authorization: token, ...(options.body instanceof FormData ? {} : { "content-type": "application/json" }), ...(options.headers || {}) },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${options.method || "GET"} ${pathname} failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  return response.status === 204 ? null : response.json();
}

const collections = await request("/api/collections?perPage=200");
const targets = [];
for (const collection of collections.items || []) {
  if (skipCollections.has(collection.name)) continue;
  for (const field of collection.fields || []) {
    if (field.type === "file") targets.push({ collection: collection.name, field: field.name });
  }
}
console.log("file fields:", targets.map((t) => `${t.collection}.${t.field}`).join(", "));

let optimized = 0;
let skipped = 0;
for (const target of targets) {
  const list = await request(`/api/collections/${target.collection}/records?perPage=200`);
  for (const record of list.items || []) {
    const filename = record[target.field];
    if (typeof filename !== "string" || !filename) { skipped += 1; continue; }
    if (/\.webp$/i.test(filename)) { skipped += 1; continue; }
    const fileResponse = await fetch(`${baseUrl}/api/files/${target.collection}/${record.id}/${encodeURIComponent(filename)}`, { headers: { Authorization: token } });
    if (!fileResponse.ok) { console.log(`  ! cannot download ${target.collection}/${record.id}/${filename}`); continue; }
    const input = Buffer.from(await fileResponse.arrayBuffer());
    const output = await sharp(input).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    if (output.length >= input.length) { skipped += 1; console.log(`  - keep ${target.collection}/${filename} (already small)`); continue; }
    const base = filename.replace(/\.[^.]+$/, "");
    const form = new FormData();
    form.append(target.field, new Blob([output], { type: "image/webp" }), `${base}.webp`);
    await request(`/api/collections/${target.collection}/records/${record.id}`, { method: "PATCH", body: form });
    optimized += 1;
    console.log(`  ✓ ${target.collection}/${filename} ${(input.length / 1024).toFixed(0)}KB -> ${(output.length / 1024).toFixed(0)}KB`);
  }
}
console.log(`Done. optimized=${optimized} skipped=${skipped}`);
