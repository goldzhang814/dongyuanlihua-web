import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader, PageIntro } from "@/components/site-chrome";
import { getSiteData } from "@/lib/content";
import { targetKeywords } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Industrial Sourcing News and Insights",
  description: "Market insights, company news and practical sourcing guidance for footwear and industrial buyers in Bangladesh and South Asia.",
  keywords: targetKeywords,
  alternates: { canonical: "/news" },
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { news, newsCategories } = await getSiteData();
  const category = (await searchParams).category;
  const visibleNews = category ? news.filter((article) => article.categoryId === category) : news;
  const categoryName = newsCategories.find((item) => item.slug === category)?.name;
  return <><SiteHeader /><PageIntro eyebrow="NEWS / 02" title={<>Signals from the <em>{categoryName || "trade floor."}</em></>} copy="Company updates, market context and practical guidance for industrial buyers working across China and South Asia." /><main className="inner-section shell"><div className="news-grid">{visibleNews.map((article) => <article className="news-card" key={article.id}><div className="news-meta"><span>{article.category}</span><time>{article.date}</time></div><h2>{article.title}</h2><p>{article.excerpt}</p><Link className="text-link" href={`/news/${article.id}`}>Read article <b>↗</b></Link></article>)}</div></main><SiteFooter /></>;
}
