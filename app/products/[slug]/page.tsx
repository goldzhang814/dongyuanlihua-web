import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getSiteData } from "@/lib/content";
import { cleanJsonLd, keywordList, siteUrl, targetKeywords } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getSiteData();
  const product = products.find((item) => item.id === slug || item.slug === slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.description,
    keywords: keywordList(product.seoKeywords, [product.category, "Bangladesh", "South Asia", ...targetKeywords]),
    alternates: { canonical: `/products/${product.slug || product.id}` },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await getSiteData();
  const product = products.find((item) => item.id === slug || item.slug === slug);
  if (!product) notFound();
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/products/${product.id}#product`,
    name: product.title,
    category: product.category,
    description: product.description,
    url: `${siteUrl}/products/${product.id}`,
    brand: { "@type": "Brand", name: product.eyebrow },
    manufacturer: { "@type": "Organization", name: "Dongyuan Lihua" },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Products", item: `${siteUrl}/products` },
      { "@type": "ListItem", position: 2, name: product.title, item: `${siteUrl}/products/${product.id}` },
    ],
  };
  return <><SiteHeader /><main className="detail-page"><div className="shell"><Link className="back-link" href="/products">← All products</Link><div className="detail-layout"><div className={`detail-art product-${products.indexOf(product) + 1}`}>{product.image && <Image unoptimized src={product.image} alt={product.title} fill sizes="(max-width: 800px) 100vw, 45vw" className="detail-product-image" />}<span>{product.category}</span></div><article className="detail-copy"><span className="eyebrow">{product.eyebrow}</span><h1>{product.title}</h1><p className="detail-lead">{product.description}</p><h2>Key applications and support</h2><ul>{product.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul><Link className="button button-orange" href="/contact">Request a quotation <span>↗</span></Link></article></div></div></main><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJsonLd(productSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJsonLd(breadcrumbSchema) }} /></>;
}
