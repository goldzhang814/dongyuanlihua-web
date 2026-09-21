import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader, PageIntro } from "@/components/site-chrome";
import { getSiteData } from "@/lib/content";
import { targetKeywords } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Footwear Machinery, Shoe Materials and Acetate Tow",
  description: "Explore authorized shoe machinery, footwear materials and diacetate fiber tow supplied by Dongyuan Lihua to Bangladesh and South Asia.",
  keywords: ["China shoe machinery export", "Acetate tow supplier Bangladesh", ...targetKeywords],
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { products, productCategories } = await getSiteData();
  const category = (await searchParams).category;
  const visibleProducts = category ? products.filter((product) => product.categoryId === category || product.id === category) : products;
  const categoryName = productCategories.find((item) => item.slug === category)?.name;
  return <><SiteHeader /><PageIntro eyebrow="PRODUCTS / 01" title={<>{categoryName || "Industrial supply with"} <em>{categoryName ? "" : "production in mind."}</em></>} copy="Explore our three core business lines, selected for manufacturers and procurement teams across Bangladesh and South Asia." /><main className="inner-section shell"><div className="catalog-grid">{visibleProducts.map((product, index) => <Link className={`catalog-card product-${index + 1}`} href={`/products/${product.id}`} key={product.id}><span className="catalog-index">0{index + 1}</span><div className="catalog-art">{product.image && <Image unoptimized src={product.image} alt={product.title} fill sizes="(max-width: 800px) 100vw, 33vw" />}</div><span className="eyebrow">{product.eyebrow}</span><h2>{product.title}</h2><p>{product.summary}</p><span className="text-link">View product details <b>↗</b></span></Link>)}</div></main><SiteFooter /></>;
}
