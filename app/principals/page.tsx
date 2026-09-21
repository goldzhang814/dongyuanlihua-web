import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader, PageIntro } from "@/components/site-chrome";
import { getSiteData } from "@/lib/content";
import { targetKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Our Chinese Manufacturing Principals",
  description: "Meet Doniva's manufacturing principals: KCLKA footwear machinery and Xinyang Special Fiber acetate tow for Bangladesh buyers.",
  keywords: ["KCLKA shoe machine agent Bangladesh", "Acetate tow supplier Bangladesh", ...targetKeywords],
  alternates: { canonical: "/principals" },
};

export default async function PrincipalsPage() {
  const { principals } = await getSiteData();
  return <><SiteHeader /><PageIntro eyebrow="OUR PRINCIPALS / 05" title={<>Manufacturers with <em>weight behind them.</em></>} copy="We build focused market relationships with established Chinese manufacturers whose capabilities can stand up to real production requirements." /><main className="principal-page shell">{principals.map((principal, index) => <section className="principal-feature" key={principal.id}><div className={`principal-badge ${index % 2 ? "green" : "blue"}`}><span>{principal.shortName}</span><small>{principal.name}</small><b>{principal.year}</b></div><div><span className="eyebrow">{principal.eyebrow}</span><h2>{principal.title}</h2><p>{principal.description}</p><Link className="text-link" href={`/principals/${principal.slug}`}>View principal details <b>↗</b></Link></div></section>)}</main><SiteFooter /></>;
}
