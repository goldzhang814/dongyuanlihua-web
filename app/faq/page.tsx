import type { Metadata } from "next";
import { SiteFooter, SiteHeader, PageIntro } from "@/components/site-chrome";
import { getSiteData } from "@/lib/content";
import { cleanJsonLd, siteUrl, targetKeywords } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Industrial Sourcing FAQ",
  description: "Answers about KCLKA shoe machinery, footwear materials, acetate tow, Bangladesh agency support and industrial sourcing.",
  keywords: targetKeywords,
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const { faqs } = await getSiteData();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/faq#faqpage`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
  return <><SiteHeader /><PageIntro eyebrow="FAQ / 03" title={<>Clear answers for <em>serious buyers.</em></>} copy="Straight answers to the questions procurement teams ask before moving from research to quotation." /><main className="inner-section shell"><div className="faq-page-list">{faqs.map((faq) => <details open key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></main><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJsonLd(faqSchema) }} /></>;
}
