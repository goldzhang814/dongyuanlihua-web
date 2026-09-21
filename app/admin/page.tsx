"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NavigationItem } from "@/types/content";
import { apiFetch, commitAdminData, jsonInit, refreshAdminData, clearAdminData, useAdminData } from "@/components/admin/api";
import { LoginScreen } from "@/components/admin/login-screen";
import { ItemCard, type Patch } from "@/components/admin/fields";
import { CategoryFields, FaqFields, NewsFields, PrincipalFields, ProductFields, type EditorContext } from "@/components/admin/item-editors";
import { NavigationEditor } from "@/components/admin/navigation-editor";
import { QuotesPanel } from "@/components/admin/quotes-panel";

type Collection = "navigation" | "products" | "productCategories" | "principals" | "news" | "newsCategories" | "faqs" | "quotes";

const allCollections: Collection[] = ["quotes", "navigation", "products", "productCategories", "principals", "news", "newsCategories", "faqs"];
const collectionLabels: Record<Collection, string> = { navigation: "Navigation", products: "Products", productCategories: "Product categories", principals: "Principals", news: "News", newsCategories: "News categories", faqs: "FAQs", quotes: "Quotes" };

const messageOf = (error: unknown) => (error instanceof Error ? error.message : "Request failed");

export default function AdminPage() {
  const state = useAdminData();
  const [collection, setCollection] = useState<Collection>("products");
  const [edits, setEdits] = useState<Record<string, Patch>>({});
  const [drafts, setDrafts] = useState<Record<string, Patch>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ text: string; error?: boolean }>({ text: "Loading content..." });
  const [navBusy, setNavBusy] = useState(false);
  const [navError, setNavError] = useState("");

  useEffect(() => {
    refreshAdminData().catch(() => undefined);
  }, []);

  function setBusyFlag(key: string, value: boolean) {
    setBusy((current) => ({ ...current, [key]: value }));
  }

  function setError(key: string, message: string) {
    setErrors((current) => ({ ...current, [key]: message }));
  }

  function editItem(id: string, patch: Patch) {
    setEdits((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
    setError(id, "");
  }

  function editDraft(tempId: string, patch: Patch) {
    setDrafts((current) => ({ ...current, [tempId]: { ...current[tempId], ...patch } }));
    setError(tempId, "");
  }

  async function saveItem(id: string) {
    const patch = edits[id];
    if (!patch) return;
    const newSlug = typeof patch.slug === "string" ? patch.slug.trim() : "";
    if (newSlug && newSlug !== id && !window.confirm(`Change the URL slug from "${id}" to "${newSlug}"? Existing links to the old address will stop working.`)) return;
    setBusyFlag(id, true);
    setStatus({ text: "Saving..." });
    try {
      const body = await apiFetch<{ data: Parameters<typeof commitAdminData>[0] }>(`/api/admin/content/${collection}/${encodeURIComponent(id)}`, jsonInit("PATCH", { patch }));
      commitAdminData(body.data);
      setEdits((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setStatus({ text: "Saved" });
    } catch (error) {
      setError(id, messageOf(error));
      setStatus({ text: messageOf(error), error: true });
    } finally {
      setBusyFlag(id, false);
    }
  }

  async function deleteItem(id: string) {
    if (!window.confirm(`Delete "${id}"? This cannot be undone.`)) return;
    setBusyFlag(id, true);
    try {
      const body = await apiFetch<{ data: Parameters<typeof commitAdminData>[0] }>(`/api/admin/content/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" });
      commitAdminData(body.data);
      setEdits((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setStatus({ text: `Deleted ${id}` });
    } catch (error) {
      setError(id, messageOf(error));
      setStatus({ text: messageOf(error), error: true });
    } finally {
      setBusyFlag(id, false);
    }
  }

  function defaultItem(name: Collection, source: Parameters<typeof commitAdminData>[0]): Patch {
    switch (name) {
      case "products": {
        const first = source.productCategories[0];
        return { slug: "", title: "New product", categoryId: first?.slug || "", category: first?.name || "", eyebrow: "NEW PRODUCT", summary: "", description: "", specs: [], image: "" };
      }
      case "news": {
        const first = source.newsCategories[0];
        return { slug: "", title: "New article", date: new Date().toISOString().slice(0, 10), categoryId: first?.slug || "", category: first?.name || "", excerpt: "", content: "" };
      }
      case "principals":
        return { slug: "", name: "New principal", shortName: "NP", eyebrow: "", title: "", description: "", year: String(new Date().getFullYear()), logo: "" };
      case "productCategories":
      case "newsCategories":
        return { slug: "", name: "New category", description: "" };
      default:
        return { question: "New question", answer: "" };
    }
  }

  function addItem() {
    if (state?.status !== "ready") return;
    const tempId = `draft-${Date.now()}`;
    setDrafts((current) => ({ ...current, [tempId]: defaultItem(collection, state.data) }));
  }

  async function saveDraft(tempId: string) {
    const item = drafts[tempId];
    if (!item) return;
    setBusyFlag(tempId, true);
    setStatus({ text: "Creating..." });
    try {
      const body = await apiFetch<{ data: Parameters<typeof commitAdminData>[0] }>(`/api/admin/content/${collection}`, jsonInit("POST", { item }));
      commitAdminData(body.data);
      setDrafts((current) => {
        const next = { ...current };
        delete next[tempId];
        return next;
      });
      setStatus({ text: "Item created" });
    } catch (error) {
      setError(tempId, messageOf(error));
      setStatus({ text: messageOf(error), error: true });
    } finally {
      setBusyFlag(tempId, false);
    }
  }

  function discardDraft(tempId: string) {
    if (!window.confirm("Discard this new item? It has not been saved yet.")) return;
    setDrafts((current) => {
      const next = { ...current };
      delete next[tempId];
      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[tempId];
      return next;
    });
  }

  async function upload(collectionName: string, id: string, file: File) {
    const form = new FormData();
    form.append("collection", collectionName);
    form.append("id", id);
    form.append("file", file);
    const body = await apiFetch<{ url: string; data: Parameters<typeof commitAdminData>[0] }>("/api/admin/upload", { method: "POST", body: form });
    commitAdminData(body.data);
    setStatus({ text: "Image uploaded" });
  }

  async function saveNavigation(items: NavigationItem[], removed: NavigationItem[]) {
    setNavBusy(true);
    setNavError("");
    setStatus({ text: "Saving navigation..." });
    try {
      const isChildOfRemoved = (item: NavigationItem) => removed.some((parent) => parent.id === item.parent);
      const orderedRemoved = [...removed].sort((a, b) => Number(isChildOfRemoved(a)) - Number(isChildOfRemoved(b)));
      for (const item of orderedRemoved) {
        const body = await apiFetch<{ data: Parameters<typeof commitAdminData>[0] }>(`/api/admin/content/navigation/${encodeURIComponent(item.id)}`, { method: "DELETE" });
        commitAdminData(body.data);
      }
      const body = await apiFetch<{ data: Parameters<typeof commitAdminData>[0] }>("/api/admin/content/navigation", jsonInit("PATCH", { items }));
      commitAdminData(body.data);
      setStatus({ text: "Navigation saved" });
    } catch (error) {
      setNavError(messageOf(error));
      setStatus({ text: messageOf(error), error: true });
    } finally {
      setNavBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => undefined);
    clearAdminData();
    setEdits({});
    setDrafts({});
  }

  if (state === null || state.status === "error") {
    if (state?.status === "error") return <LoginScreen onLogin={() => refreshAdminData()} />;
    return <main className="admin-login"><p className="admin-loading">Loading...</p></main>;
  }

  const { data, backend } = state;

  const context: EditorContext = {
    productCategories: data.productCategories,
    newsCategories: data.newsCategories,
    uploadable: backend === "pocketbase",
    upload,
  };

  const renderFields = (item: Record<string, unknown>, change: (patch: Patch) => void, isNew: boolean) => {
    switch (collection) {
      case "products": return <ProductFields item={item} onChange={change} context={context} isNew={isNew} />;
      case "news": return <NewsFields item={item} onChange={change} context={context} />;
      case "productCategories":
      case "newsCategories": return <CategoryFields item={item} onChange={change} />;
      case "principals": return <PrincipalFields item={item} onChange={change} context={context} isNew={isNew} />;
      default: return <FaqFields item={item} onChange={change} />;
    }
  };

  const items = data[collection] as Array<Record<string, unknown> & { id: string }>;
  const draftEntries = Object.entries(drafts);

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <div className="admin-logo">DL <span>CONTENT DESK</span></div>
      <p>{backend === "pocketbase" ? "PocketBase content source" : "Local data file source"}</p>
      {allCollections.map((name) => <button className={collection === name ? "active" : ""} onClick={() => { setCollection(name); setStatus({ text: collectionLabels[name] }); }} key={name}>{collectionLabels[name]}<b>{data[name].length}</b></button>)}
      <Link href="/">← View website</Link>
      <button className="admin-logout" onClick={logout}>Sign out</button>
    </aside>
    <section className="admin-main">
      <header className="admin-header"><div><span className="eyebrow">ADMIN / CONTENT</span><h1>{collectionLabels[collection]}</h1></div><span className={`admin-status${status.error ? " is-error" : ""}`}>● {status.text}</span></header>
      {collection === "navigation"
        ? <NavigationEditor items={data.navigation} saving={navBusy} error={navError} onSave={saveNavigation} />
        : collection === "quotes"
          ? <QuotesPanel quotes={data.quotes} busy={busy} errors={errors} onDelete={(id) => deleteItem(id)} />
          : <>
          <div className="admin-toolbar"><button className="button button-orange" onClick={addItem}>+ Add item</button></div>
          <div className="admin-list">
            {items.map((raw, index) => {
              const id = raw.id;
              const item = { ...raw, ...edits[id] } as Record<string, unknown>;
              return <ItemCard key={id} id={id} index={index} dirty={Boolean(edits[id])} busy={Boolean(busy[id])} error={errors[id] || ""} onSave={() => saveItem(id)} onDelete={() => deleteItem(id)}>
                {renderFields(item, (patch) => editItem(id, patch), false)}
              </ItemCard>;
            })}
            {draftEntries.map(([tempId, draft], offset) => {
              const item = { ...draft, id: tempId } as Record<string, unknown>;
              return <ItemCard key={tempId} id={`${tempId} (new)`} index={items.length + offset} dirty busy={Boolean(busy[tempId])} error={errors[tempId] || ""} onSave={() => saveDraft(tempId)} onDelete={() => discardDraft(tempId)}>
                {renderFields(item, (patch) => editDraft(tempId, patch), true)}
              </ItemCard>;
            })}
          </div>
        </>}
    </section>
  </main>;
}
