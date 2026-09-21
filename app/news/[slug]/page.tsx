import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getSiteData } from "@/lib/content";
import { cleanJsonLd, keywordList, siteUrl, targetKeywords } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { news } = await getSiteData();
  const article = news.find((item) => item.id === slug || item.slug === slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    keywords: keywordList(article.seoKeywords, targetKeywords),
    alternates: { canonical: `/news/${article.slug || article.id}` },
    openGraph: { type: "article", publishedTime: article.date, section: article.category },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { news } = await getSiteData();
  const article = news.find((item) => item.id === slug || item.slug === slug);
  if (!article) notFound();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteUrl}/news/${article.id}#article`,
    headline: article.title,
    description: article.excerpt,
    articleSection: article.category,
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: `${siteUrl}/news/${article.id}`,
    author: { "@type": "Organization", name: "Doniva", url: siteUrl },
    publisher: { "@type": "Organization", name: "Doniva", url: siteUrl },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "News", item: `${siteUrl}/news` },
      { "@type": "ListItem", position: 2, name: article.title, item: `${siteUrl}/news/${article.id}` },
    ],
  };
  return <><SiteHeader /><main className="article-page"><div className="shell article-wrap"><Link className="back-link" href="/news">← All news</Link><span className="eyebrow">{article.category} · {article.date}</span><h1>{article.title}</h1><p className="article-lead">{article.excerpt}</p><div className="article-body"><p>{article.content}</p><p>For current specifications, availability and export requirements, contact the Doniva team. We will match your brief with the right factory-side information and next steps.</p></div><Link className="button button-orange" href="/contact">Discuss your requirement <span>↗</span></Link></div></main><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJsonLd(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJsonLd(breadcrumbSchema) }} /></>;
}
