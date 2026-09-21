import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getSiteData } from "@/lib/content";
import { keywordList, targetKeywords } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { principals } = await getSiteData();
  const principal = principals.find((item) => item.slug === slug);
  return principal ? { title: principal.seoTitle || principal.name, description: principal.seoDescription || principal.description, keywords: keywordList(principal.seoKeywords, targetKeywords), alternates: { canonical: `/principals/${principal.slug}` } } : { title: "Principal not found" };
}

export default async function PrincipalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { principals, products } = await getSiteData();
  const principal = principals.find((item) => item.slug === slug);
  if (!principal) notFound();
  const relatedProducts = products.filter((product) => product.principalId ? product.principalId === principal.slug : product.eyebrow.toLowerCase().includes(principal.shortName.toLowerCase()));
  return <><SiteHeader /><main className="detail-page principal-detail"><div className="shell"><Link className="back-link" href="/principals">← All principals</Link><div className="principal-detail-head"><div className={`principal-badge blue ${principal.logo ? "has-logo" : ""}`}>{principal.logo ? <Image unoptimized src={principal.logo} alt={principal.name} fill sizes="300px" className="principal-logo" /> : <><span>{principal.shortName}</span><small>{principal.name}</small><b>{principal.year}</b></>}</div><div><span className="eyebrow">{principal.eyebrow}</span><h1>{principal.title}</h1><p className="detail-lead">{principal.description}</p></div></div><section className="principal-detail-body"><h2>Products and market support</h2><div className="catalog-grid">{relatedProducts.map((product) => <Link className="catalog-card" href={`/products/${product.id}`} key={product.id}><div className="catalog-art">{product.image && <Image unoptimized src={product.image} alt={product.title} fill sizes="(max-width: 800px) 100vw, 33vw" />}</div><span className="eyebrow">{product.category}</span><h2>{product.title}</h2><p>{product.summary}</p></Link>)}</div></section></div></main><SiteFooter /></>;
}
