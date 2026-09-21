import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, news, principals } = await getSiteData();
  const routes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/about-us"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/products"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/principals"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/news"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.8 },
    ...products.map((product) => ({ url: absoluteUrl(`/products/${product.slug || product.id}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...principals.map((principal) => ({ url: absoluteUrl(`/principals/${principal.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...news.map((article) => ({ url: absoluteUrl(`/news/${article.slug || article.id}`), lastModified: article.date, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
  return routes;
}
