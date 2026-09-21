import type { Metadata } from "next";
import { SiteFooter, SiteHeader, PageIntro } from "@/components/site-chrome";
import { QuoteForm } from "@/components/quote-form";
import { cleanJsonLd, siteUrl, targetKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Dongyuan Lihua",
  description: "Contact Dongyuan Lihua in Shenzhen for shoe machinery, footwear materials, acetate tow and China-to-Bangladesh sourcing support.",
  keywords: ["China shoe machinery export", "Acetate tow supplier Bangladesh", "Shenzhen import export company", ...targetKeywords],
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${siteUrl}/contact#contactpage`,
    url: `${siteUrl}/contact`,
    name: "Contact Dongyuan Lihua",
    mainEntity: {
      "@type": "Organization",
      name: "Dongyuan Lihua",
      email: "olivia@dongyuanlihua.com",
      telephone: "+86 135 4415 3386",
      address: { "@type": "PostalAddress", streetAddress: "1-201-5, Baichuan Zhihui Plaza, 466 Zhangbei Avenue, Longgang District", addressLocality: "Shenzhen", addressRegion: "Guangdong", addressCountry: "CN" },
    },
  };

  return <><SiteHeader /><PageIntro eyebrow="CONTACT / 06" title={<>Let&apos;s move your <em>next order forward.</em></>} copy="Tell us what you need to source, compare or ship. We respond within 24 business hours." /><main className="contact-page shell"><div className="contact-layout"><div><span className="eyebrow">DIRECT CONTACT</span><h2>Talk to the team closest to the supply.</h2><div className="contact-details"><a href="mailto:olivia@dongyuanlihua.com">olivia@dongyuanlihua.com</a><a href="tel:+8613544153386">+86 135 4415 3386 · WhatsApp</a><span>1-201-5, Baichuan Zhihui Plaza<br />466 Zhangbei Avenue, Longgang District, Shenzhen, China</span></div></div><QuoteForm /></div></main><SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJsonLd(contactSchema) }} /></>;
}
