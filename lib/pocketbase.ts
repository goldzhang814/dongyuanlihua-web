import type { Product, NewsArticle, Faq, SiteData, ProductCategory, Principal, NewsCategory, NavigationItem, Quote } from "@/types/content";

const pocketBaseUrl = (process.env.POCKETBASE_URL || "http://127.0.0.1:8090").replace(/\/$/, "");
let adminToken = "";

export const isPocketBaseConfigured = Boolean(process.env.POCKETBASE_URL && process.env.POCKETBASE_ADMIN_EMAIL && process.env.POCKETBASE_ADMIN_PASSWORD);

export const pocketBaseCollectionName = (collection: string) =>
  collection === "productCategories" ? "product_categories" : collection === "newsCategories" ? "news_categories" : collection;

async function authenticate() {
  if (adminToken) return adminToken;
  const response = await fetch(`${pocketBaseUrl}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identity: process.env.POCKETBASE_ADMIN_EMAIL, password: process.env.POCKETBASE_ADMIN_PASSWORD }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PocketBase authentication failed: ${response.status}`);
  const result = await response.json() as { token: string };
  adminToken = result.token;
  return adminToken;
}

async function pocketBaseRequest(pathname: string, init: RequestInit = {}) {
  const response = await fetch(`${pocketBaseUrl}${pathname}`, {
    ...init,
    headers: { Authorization: await authenticate(), ...(init.headers || {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = response.statusText;
    const raw = await response.text().catch(() => "");
    try {
      const errorBody = JSON.parse(raw) as { data?: Record<string, { message?: string }>; message?: string };
      const messages = Object.values(errorBody.data || {}).map((field) => field.message).filter(Boolean);
      if (messages.length) detail = messages.join("; ");
      else if (errorBody.message) detail = errorBody.message;
    } catch {
      if (raw) detail = raw.slice(0, 200);
    }
    throw new Error(`PocketBase request failed (${response.status}): ${detail}`);
  }
  return response;
}

async function optionalPocketBaseRequest(pathname: string) {
  try {
    return await pocketBaseRequest(pathname);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Dynamic server usage")) throw error;
    console.warn(`[pocketbase] optional request failed: ${pathname}`, error instanceof Error ? error.message : error);
    return null;
  }
}

type RecordList<T> = { items: T[] };
type PocketRecord = { id: string; [key: string]: unknown };

function fileUrl(collection: string, record: PocketRecord, field = "image") {
  const filename = typeof record[field] === "string" ? record[field] as string : "";
  return filename ? `${pocketBaseUrl}/api/files/${collection}/${record.id}/${encodeURIComponent(filename)}` : "";
}

export async function getPocketBaseData(): Promise<SiteData> {
  const [productsResponse, newsResponse, faqsResponse, productCategoriesResponse, principalsResponse, newsCategoriesResponse, navigationResponse, quotesResponse] = await Promise.all([
    pocketBaseRequest("/api/collections/products/records?perPage=200&sort=-created"),
    pocketBaseRequest("/api/collections/news/records?perPage=200&sort=-date"),
    pocketBaseRequest("/api/collections/faqs/records?perPage=200&sort=created"),
    optionalPocketBaseRequest("/api/collections/product_categories/records?perPage=200"),
    optionalPocketBaseRequest("/api/collections/principals/records?perPage=200"),
    optionalPocketBaseRequest("/api/collections/news_categories/records?perPage=200"),
    optionalPocketBaseRequest("/api/collections/navigation/records?perPage=200&sort=sort"),
    optionalPocketBaseRequest("/api/collections/quotes/records?perPage=200"),
  ]);
  const byCreated = (a: PocketRecord, b: PocketRecord) => String(a.created || "").localeCompare(String(b.created || ""));
  const products = (await productsResponse.json() as RecordList<PocketRecord>).items.map((record) => ({ ...record, id: String(record.slug), image: fileUrl("products", record), specs: record.specs ?? record.json ?? [] })) as unknown as Product[];
  const news = (await newsResponse.json() as RecordList<PocketRecord>).items.map((record) => ({ ...record, id: String(record.slug) })) as unknown as NewsArticle[];
  const faqs = (await faqsResponse.json() as RecordList<PocketRecord>).items.map((record) => ({ ...record, id: String(record.slug) })) as unknown as Faq[];
  const productCategories = productCategoriesResponse ? (await productCategoriesResponse.json() as RecordList<PocketRecord>).items.sort(byCreated).map((record) => ({ ...record, id: String(record.slug) })) as unknown as ProductCategory[] : [];
  const principals = principalsResponse ? (await principalsResponse.json() as RecordList<PocketRecord>).items.sort(byCreated).map((record) => ({ ...record, id: String(record.slug), logo: fileUrl("principals", record, "logo") })) as unknown as Principal[] : [];
  const newsCategories = newsCategoriesResponse ? (await newsCategoriesResponse.json() as RecordList<PocketRecord>).items.sort(byCreated).map((record) => ({ ...record, id: String(record.slug) })) as unknown as NewsCategory[] : [];
  const navigation = navigationResponse ? (await navigationResponse.json() as RecordList<PocketRecord>).items.map((record) => ({ ...record, id: String(record.key || record.slug || record.id), sort: Number(record.sort || 0), enabled: record.enabled === true || record.enabled === "true" })) as unknown as NavigationItem[] : [];
  const quotes = quotesResponse ? (await quotesResponse.json() as RecordList<PocketRecord>).items.sort((a, b) => byCreated(b, a)).map((record) => ({ id: record.id, name: String(record.name || ""), company: String(record.company || ""), email: String(record.email || ""), interest: String(record.interest || ""), message: String(record.message || ""), createdAt: String(record.createdAt || record.created || "") })) as Quote[] : [];
  return { navigation, products, productCategories, principals, news, newsCategories, faqs, quotes };
}

const recordFields: Record<string, string[]> = {
  navigation: ["key", "label", "href", "parent", "sort", "enabled", "source"],
  products: ["slug", "categoryId", "category", "eyebrow", "title", "summary", "description", "seoTitle", "seoDescription", "seoKeywords", "json"],
  productCategories: ["slug", "name", "description"],
  principals: ["slug", "name", "shortName", "eyebrow", "title", "description", "seoTitle", "seoDescription", "seoKeywords", "year"],
  news: ["slug", "date", "categoryId", "category", "title", "excerpt", "content", "seoTitle", "seoDescription", "seoKeywords"],
  newsCategories: ["slug", "name", "description"],
  faqs: ["slug", "question", "answer"],
  quotes: ["name", "company", "email", "interest", "message", "createdAt"],
};

function recordPayload(collection: string, item: Record<string, unknown>, forCreate: boolean) {
  const allowedFields = recordFields[collection] || [];
  const payload: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in item) payload[field] = item[field];
  }
  if (collection === "products") {
    payload.json = item.specs ?? payload.json ?? [];
  }
  if (collection === "navigation") {
    payload.sort = Number(payload.sort || 0);
    payload.enabled = payload.enabled === true || payload.enabled === "true";
    delete payload.slug;
  }
  if (forCreate && collection !== "navigation") {
    const slug = String(payload.slug || item.id || "").trim();
    if (slug) payload.slug = slug;
  }
  return payload;
}

const idField = (collection: string) => collection === "navigation" ? "key" : collection === "quotes" ? "id" : "slug";

let sourceFieldPromise: Promise<void> | null = null;

async function ensureNavigationSourceField() {
  if (!sourceFieldPromise) {
    sourceFieldPromise = (async () => {
      const response = await pocketBaseRequest("/api/collections/navigation");
      const collection = await response.json() as { fields: Array<{ name: string } & Record<string, unknown>> };
      if (collection.fields.some((field) => field.name === "source")) return;
      await pocketBaseRequest("/api/collections/navigation", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fields: [...collection.fields, { system: false, name: "source", type: "text", required: false, presentable: false }] }),
      });
    })();
    sourceFieldPromise.catch(() => {
      sourceFieldPromise = null;
    });
  }
  return sourceFieldPromise;
}

async function findRecordBySlug(collection: string, slug: string) {
  const name = pocketBaseCollectionName(collection);
  const field = idField(collection);
  const response = await pocketBaseRequest(`/api/collections/${name}/records?filter=${encodeURIComponent(`${field}="${slug}"`)}&perPage=1`);
  return (await response.json() as RecordList<PocketRecord>).items[0] || null;
}

export async function createPocketBaseRecord(collection: string, item: Record<string, unknown>) {
  const name = pocketBaseCollectionName(collection);
  const payload = recordPayload(collection, item, true);
  if (collection !== "navigation" && collection !== "quotes" && !payload.slug && item.id) payload.slug = String(item.id);
  const response = await pocketBaseRequest(`/api/collections/${name}/records`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  return response.json();
}

let quotesCollectionPromise: Promise<void> | null = null;

const textField = (name: string, required = false) => ({ system: false, name, type: "text", required, presentable: false });

async function ensureQuotesCollection() {
  if (!quotesCollectionPromise) {
    quotesCollectionPromise = (async () => {
      let fields: Array<Record<string, unknown> & { name: string }> | null = null;
      try {
        const response = await pocketBaseRequest("/api/collections/quotes");
        fields = (await response.json() as { fields: Array<Record<string, unknown> & { name: string }> }).fields;
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("(404)")) throw error;
      }
      if (!fields) {
        await pocketBaseRequest("/api/collections", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: "quotes",
            type: "base",
            fields: [textField("name", true), textField("company"), textField("email", true), textField("interest"), textField("message"), textField("createdAt")],
          }),
        });
        return;
      }
      if (!fields.some((field) => field.name === "createdAt")) {
        await pocketBaseRequest("/api/collections/quotes", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ fields: [...fields, textField("createdAt")] }),
        });
      }
    })();
    quotesCollectionPromise.catch(() => {
      quotesCollectionPromise = null;
    });
  }
  return quotesCollectionPromise;
}

export async function createPocketBaseQuote(item: Record<string, unknown>) {
  await ensureQuotesCollection();
  const response = await pocketBaseRequest("/api/collections/quotes/records", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(recordPayload("quotes", item, true)) });
  return response.json();
}

export async function updatePocketBaseRecord(collection: string, slug: string, patch: Record<string, unknown>) {
  if (collection === "navigation") await ensureNavigationSourceField();
  const record = await findRecordBySlug(collection, slug);
  if (!record) throw new Error("Record not found");
  const name = pocketBaseCollectionName(collection);
  const payload = recordPayload(collection, { slug, ...patch }, false);
  await pocketBaseRequest(`/api/collections/${name}/records/${record.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
}

export async function deletePocketBaseRecord(collection: string, slug: string) {
  const record = await findRecordBySlug(collection, slug);
  if (!record) throw new Error("Record not found");
  const name = pocketBaseCollectionName(collection);
  await pocketBaseRequest(`/api/collections/${name}/records/${record.id}`, { method: "DELETE" });
}

export async function uploadPocketBaseFile(collection: string, slug: string, field: string, file: File) {
  const record = await findRecordBySlug(collection, slug);
  if (!record) throw new Error("Record not found");
  const name = pocketBaseCollectionName(collection);
  const form = new FormData();
  form.append(field, file, file.name);
  await pocketBaseRequest(`/api/collections/${name}/records/${record.id}`, { method: "PATCH", body: form });
  return fileUrl(name, { ...record, [field]: file.name }, field);
}
