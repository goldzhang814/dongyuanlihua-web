import type { SiteData } from "@/types/content";

export type MenuItem = { label: string; href: string };
export type MenuGroup = { key: string; label: string; href: string; items: MenuItem[] };

type NavigationInput = Pick<SiteData, "navigation" | "productCategories" | "principals" | "newsCategories">;

const navSources = {
  productCategories: { href: (slug: string) => `/products/${slug}` },
  principals: { href: (slug: string) => `/principals/${slug}` },
  newsCategories: { href: (slug: string) => `/news?category=${slug}` },
} as const;

function fallbackGroups(input: NavigationInput): MenuGroup[] {
  const products = input.productCategories.length ? input.productCategories : [{ id: "shoe-machinery", slug: "shoe-machinery", name: "Shoe Machinery" }, { id: "shoe-materials", slug: "shoe-materials", name: "Shoe Materials" }, { id: "acetate-tow", slug: "acetate-tow", name: "Acetate Tow" }];
  const brands = input.principals.length ? input.principals : [{ id: "kclka", slug: "kclka", name: "KCLKA" }, { id: "xinyang", slug: "xinyang", name: "Xinyang Special Fiber" }];
  const news = input.newsCategories.length ? input.newsCategories : [{ id: "company", slug: "company", name: "Company News" }, { id: "industry", slug: "industry", name: "Industry News" }];
  return [
    { key: "products", label: "Products", href: "/products", items: [{ label: "View all", href: "/products" }, ...products.map((item) => ({ label: item.name, href: `/products/${item.slug}` }))] },
    { key: "principals", label: "Principals", href: "/principals", items: [{ label: "View all", href: "/principals" }, ...brands.map((item) => ({ label: item.name, href: `/principals/${item.slug}` }))] },
    { key: "news", label: "News", href: "/news", items: [{ label: "View all", href: "/news" }, ...news.map((item) => ({ label: item.name, href: `/news?category=${item.slug}` }))] },
  ];
}

export function buildNavigation(input: NavigationInput): MenuGroup[] {
  if (!input.navigation.length) return fallbackGroups(input);
  const enabled = input.navigation.filter((item) => item.enabled).sort((a, b) => a.sort - b.sort);
  return enabled.filter((item) => !item.parent).map((parent) => {
    const items = enabled.filter((item) => item.parent === parent.key).map((item) => ({ label: item.label, href: item.href }));
    const source = parent.source && parent.source !== "manual" ? parent.source : null;
    if (source) {
      const collections = { productCategories: input.productCategories, principals: input.principals, newsCategories: input.newsCategories }[source];
      const seen = new Set(items.map((item) => item.href));
      for (const entry of collections) {
        const href = navSources[source].href(entry.slug);
        if (!seen.has(href)) {
          items.push({ label: entry.name, href });
          seen.add(href);
        }
      }
    }
    return { key: parent.key, label: parent.label, href: parent.href, items };
  });
}
