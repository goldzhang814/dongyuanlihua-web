"use client";

import type { NewsArticle, NewsCategory, Principal, Product, ProductCategory } from "@/types/content";
import { Field, ImageUpload, SelectField, type Patch } from "@/components/admin/fields";

export type EditorContext = {
  productCategories: ProductCategory[];
  newsCategories: NewsCategory[];
  principals: Principal[];
  uploadable: boolean;
  upload: (collection: string, id: string, file: File) => Promise<void>;
};

const text = (value: unknown) => (typeof value === "string" ? value : value == null ? "" : String(value));
const list = (value: unknown) => (Array.isArray(value) ? value.map((entry) => String(entry)) : []);

export function ProductFields({ item, onChange, context, isNew }: { item: Record<string, unknown>; onChange: (patch: Patch) => void; context: EditorContext; isNew: boolean }) {
  const product = item as unknown as Product;
  const categories = context.productCategories;
  return <>
    <Field label="Slug (URL segment)" value={text(product.slug || product.id)} onChange={(value) => onChange({ slug: value })} placeholder="eva-injection-machine" />
    <ImageUpload label="Product image" value={product.image || ""} uploadable={context.uploadable && !isNew} hint="Image upload requires PocketBase. You can use a local path such as /products/machine.jpg." onChange={(value) => onChange({ image: value })} upload={(file) => context.upload("products", product.id, file)} />
    <SelectField label="Product category" value={product.categoryId || ""} options={[{ value: "", label: "Select a category" }, ...categories.map((category) => ({ value: category.slug, label: category.name }))]} onChange={(value) => {
      const category = categories.find((entry) => entry.slug === value);
      onChange({ categoryId: value, category: category?.name || "" });
    }} />
    <SelectField label="Principal (brand)" value={product.principalId || ""} options={[{ value: "", label: "No principal" }, ...context.principals.map((principal) => ({ value: principal.slug, label: principal.name }))]} onChange={(value) => onChange({ principalId: value })} />
    <Field label="Eyebrow" value={text(product.eyebrow)} onChange={(value) => onChange({ eyebrow: value })} />
    <Field label="Title" value={text(product.title)} onChange={(value) => onChange({ title: value })} />
    <Field label="Summary" value={text(product.summary)} onChange={(value) => onChange({ summary: value })} textarea />
    <Field label="Description" value={text(product.description)} onChange={(value) => onChange({ description: value })} textarea />
    <Field label="SEO title" value={text(product.seoTitle)} onChange={(value) => onChange({ seoTitle: value })} />
    <Field label="SEO description" value={text(product.seoDescription)} onChange={(value) => onChange({ seoDescription: value })} textarea />
    <Field label="SEO keywords (comma separated)" value={text(product.seoKeywords)} onChange={(value) => onChange({ seoKeywords: value })} />
    <Field label="Specifications (one per line)" value={list(product.specs).join("\n")} onChange={(value) => onChange({ specs: value.split("\n").map((entry) => entry.trim()).filter(Boolean) })} textarea />
  </>;
}

export function NewsFields({ item, onChange, context }: { item: Record<string, unknown>; onChange: (patch: Patch) => void; context: EditorContext }) {
  const article = item as unknown as NewsArticle;
  const categories = context.newsCategories;
  return <>
    <Field label="Slug (URL segment)" value={text(article.slug || article.id)} onChange={(value) => onChange({ slug: value })} placeholder="sourcing-guide-2026" />
    <Field label="Date" value={text(article.date)} onChange={(value) => onChange({ date: value })} placeholder="2026-09-20" />
    <SelectField label="News category" value={article.categoryId || ""} options={[{ value: "", label: "Select a category" }, ...categories.map((category) => ({ value: category.slug, label: category.name }))]} onChange={(value) => {
      const category = categories.find((entry) => entry.slug === value);
      onChange({ categoryId: value, category: category?.name || "" });
    }} />
    <Field label="Title" value={text(article.title)} onChange={(value) => onChange({ title: value })} />
    <Field label="Excerpt" value={text(article.excerpt)} onChange={(value) => onChange({ excerpt: value })} textarea />
    <Field label="Content" value={text(article.content)} onChange={(value) => onChange({ content: value })} textarea />
    <Field label="SEO title" value={text(article.seoTitle)} onChange={(value) => onChange({ seoTitle: value })} />
    <Field label="SEO description" value={text(article.seoDescription)} onChange={(value) => onChange({ seoDescription: value })} textarea />
    <Field label="SEO keywords (comma separated)" value={text(article.seoKeywords)} onChange={(value) => onChange({ seoKeywords: value })} />
  </>;
}

export function CategoryFields({ item, onChange }: { item: Record<string, unknown>; onChange: (patch: Patch) => void }) {
  const category = item as unknown as ProductCategory;
  return <>
    <Field label="Slug (URL segment)" value={text(category.slug || category.id)} onChange={(value) => onChange({ slug: value })} placeholder="shoe-machinery" />
    <Field label="Name" value={text(category.name)} onChange={(value) => onChange({ name: value })} />
    <Field label="Description" value={category.description || ""} onChange={(value) => onChange({ description: value })} textarea />
  </>;
}

export function PrincipalFields({ item, onChange, context, isNew }: { item: Record<string, unknown>; onChange: (patch: Patch) => void; context: EditorContext; isNew: boolean }) {
  const principal = item as unknown as Principal;
  return <>
    <Field label="Slug (URL segment)" value={text(principal.slug || principal.id)} onChange={(value) => onChange({ slug: value })} placeholder="kclka" />
    <Field label="Name" value={text(principal.name)} onChange={(value) => onChange({ name: value })} />
    <Field label="Short name" value={text(principal.shortName)} onChange={(value) => onChange({ shortName: value })} />
    <ImageUpload label="Principal logo" value={principal.logo || ""} uploadable={context.uploadable && !isNew} hint="Logo upload requires PocketBase." onChange={(value) => onChange({ logo: value })} upload={(file) => context.upload("principals", principal.id, file)} />
    <Field label="Eyebrow" value={text(principal.eyebrow)} onChange={(value) => onChange({ eyebrow: value })} />
    <Field label="Title" value={text(principal.title)} onChange={(value) => onChange({ title: value })} />
    <Field label="Description" value={text(principal.description)} onChange={(value) => onChange({ description: value })} textarea />
    <Field label="SEO title" value={text(principal.seoTitle)} onChange={(value) => onChange({ seoTitle: value })} />
    <Field label="SEO description" value={text(principal.seoDescription)} onChange={(value) => onChange({ seoDescription: value })} textarea />
    <Field label="SEO keywords (comma separated)" value={text(principal.seoKeywords)} onChange={(value) => onChange({ seoKeywords: value })} />
    <Field label="Year" value={principal.year || ""} onChange={(value) => onChange({ year: value })} />
  </>;
}

export function FaqFields({ item, onChange }: { item: Record<string, unknown>; onChange: (patch: Patch) => void }) {
  const faq = item as { question: string; answer: string };
  return <>
    <Field label="Question" value={text(faq.question)} onChange={(value) => onChange({ question: value })} />
    <Field label="Answer" value={text(faq.answer)} onChange={(value) => onChange({ answer: value })} textarea />
  </>;
}
