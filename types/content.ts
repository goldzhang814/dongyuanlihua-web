type SeoFields = {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
};

export type Product = SeoFields & {
  id: string;
  slug?: string;
  image?: string;
  categoryId?: string;
  principalId?: string;
  category: string;
  eyebrow: string;
  title: string;
  summary: string;
  description: string;
  specs: string[];
};

export type NewsArticle = SeoFields & {
  id: string;
  slug?: string;
  categoryId?: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
};

export type Faq = { id: string; question: string; answer: string };
export type Quote = { id: string; name: string; company?: string; email: string; interest?: string; message?: string; createdAt?: string };
export type ProductCategory = { id: string; name: string; slug: string; description?: string; image?: string };
export type Principal = SeoFields & { id: string; name: string; slug: string; shortName: string; eyebrow: string; title: string; description: string; year?: string; logo?: string };
export type NewsCategory = { id: string; name: string; slug: string; description?: string };
export type NavSource = "manual" | "productCategories" | "principals" | "newsCategories";
export type NavigationItem = { id: string; key: string; label: string; href: string; parent: string; sort: number; enabled: boolean; source?: NavSource };
export type SiteData = {
  navigation: NavigationItem[];
  products: Product[];
  productCategories: ProductCategory[];
  principals: Principal[];
  news: NewsArticle[];
  newsCategories: NewsCategory[];
  faqs: Faq[];
  quotes: Quote[];
};
