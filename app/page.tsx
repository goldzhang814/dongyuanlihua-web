import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getSiteData } from "@/lib/content";
import type { Metadata } from "next";
import { targetKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  title: "KCLKA Shoe Machinery & Acetate Tow Supplier Bangladesh",
  description: "Doniva is a Shenzhen import export company and authorized Bangladesh partner for KCLKA shoe machinery and Xinyang diacetate fiber tow.",
  keywords: targetKeywords,
  alternates: { canonical: "/" },
};

const productCards = [
  { number: "01", slug: "shoe-machinery", eyebrow: "KCLKA OFFICIAL AGENT", title: "Footwear Machinery", copy: "Complete EVA, PVC, TPR and PU production systems for modern shoe factories and export lines.", tone: "machinery", href: "/products?category=shoe-machinery" },
  { number: "02", slug: "shoe-materials", eyebrow: "JIAPINYUN PARTNERSHIP", title: "Material Supply", copy: "Industrial components, fittings and sourced materials from China’s footwear manufacturing hubs.", tone: "materials", href: "/products?category=shoe-materials" },
  { number: "03", slug: "acetate-tow", eyebrow: "XINYANG EXPORT AGENT", title: "Acetate Tow", copy: "Diacetate fiber tow for cigarette filters, hygiene products and high-precision filtration uses.", tone: "tow", href: "/products?category=acetate-tow" },
];

const stats = [["44+", "Years of experience"], ["500+", "Global clients served"], ["70+", "Markets reached"], ["99%+", "Export reliability"]];

export default async function Home() {
  const { productCategories } = await getSiteData();
  const categoryImage = (slug: string) => productCategories.find((category) => category.slug === slug)?.image || "";
  return <main>
    <SiteHeader />

    <section className="hero" id="home"><div className="hero-grid" /><div className="hero-visual" aria-hidden="true"><div className="machine-orbit"><span /><span /><span /></div><div className="hero-label">INDUSTRIAL<br /><strong>SUPPLY</strong></div><div className="hero-serial">DL / 2026 / CN</div></div><div className="shell hero-content"><div className="kicker"><span className="orange-dot" /> China-to-South-Asia sourcing partner</div><h1>Industrial strength for <em>Bangladesh growth.</em></h1><p>Doniva works with trusted Chinese manufacturers to deliver reliable machinery, materials and export coordination for factories, distributors and industrial buyers across South Asia.</p><div className="hero-actions"><a className="button button-orange" href="#products">Explore products <span>↗</span></a><a className="button button-ghost" href="#about">Why Doniva <span>↓</span></a></div><div className="hero-foot"><span>SCROLL TO DISCOVER</span><span className="line" /><span>01 — 06</span></div></div></section>

    <section className="trust-strip"><div className="shell trust-inner"><span className="trust-label">OFFICIAL<br />RELATIONSHIPS</span><span className="trust-logo kclka-logo" aria-label="KCLKA New Kaijia"><span className="logo-mark">K</span><span>KCLKA<small>NEW KAIJIA</small></span></span><span className="trust-logo xinyang xinyang-logo" aria-label="Xinyang Special Fiber"><span className="logo-mark">XY</span><span>XINYANG<small>SPECIAL FIBER</small></span></span><span className="trust-logo jiapinyun jiapinyun-logo" aria-label="Jiapinyun Technology"><span className="logo-mark">JY</span><span>JIAPINYUN<small>TECHNOLOGY</small></span></span><span className="trust-code">CUSTOMS REGISTERED<br /><b>4403961HB4</b></span></div></section>

    <section className="section shell" id="products"><div className="section-heading"><div><span className="eyebrow">01 / OUR BUSINESS</span><h2>Three core sectors.<br /><em>One dependable partner.</em></h2></div><p>From factory floor to final shipment, we simplify sourcing with clear communications, quality control and export-ready execution.</p></div><div className="product-grid">{productCards.map((product) => <a className={`product-card ${product.tone}`} href={product.href} key={product.number}><div className={`product-art ${categoryImage(product.slug) ? "has-img" : ""}`}>{categoryImage(product.slug) ? <img className="product-art-img" src={categoryImage(product.slug)} alt={product.title} /> : null}<span className="product-number">{product.number}</span><span className="art-detail" /></div><div className="product-copy"><span className="eyebrow">{product.eyebrow}</span><h3>{product.title}</h3><p>{product.copy}</p><span className="text-link">View category <b>↗</b></span></div></a>)}</div></section>

    <section className="statement" id="about"><div className="shell statement-grid"><div className="statement-visual"><span>BUILT FOR<br /><b>THE NEXT<br />SHIPMENT</b></span><i>SHENZHEN<br />LONGGANG</i></div><div className="statement-copy"><span className="eyebrow">02 / WHY US</span><h2>Trade with the confidence of a <em>local partner.</em></h2><p>Doniva is a Shenzhen-based import-export company built around direct relationships with leading Chinese manufacturers. We coordinate the right supply chain, documentation and support behind every order.</p><div className="benefits"><div><b>01</b><strong>Official agency</strong><span>Documented partnerships and stable factory cooperation.</span></div><div><b>02</b><strong>Market readiness</strong><span>Solutions designed specifically for Bangladesh and South Asia.</span></div><div><b>03</b><strong>After-sales support</strong><span>Responsive communication, parts and technical guidance.</span></div></div><a className="text-link dark-link" href="#contact">Meet your China-side team <b>↗</b></a></div></div></section>

    <section className="stats-band"><div className="shell stats-grid">{stats.map(([value, label]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>

    <section className="principals section shell" id="principals"><div className="section-heading compact"><div><span className="eyebrow">03 / OUR PRINCIPALS</span><h2>Brands with<br /><em>proven capability.</em></h2></div><p>We represent manufacturers with the scale, documentation and export experience to support long-term industrial growth.</p></div><div className="principal-row"><div className="principal-badge blue"><span>KCLKA</span><small>NEW KAIJIA · SHOE MACHINERY</small><b>2003</b></div><div className="principal-content"><span className="eyebrow">JINJIANG KAIJIA MACHINE MANUFACTURING</span><h3>Complete footwear machinery, officially represented in Bangladesh.</h3><p>200+ employees · 40,000–60,000㎡ facilities · exports to 70+ countries</p></div><a className="circle-arrow" href="#contact">↗</a></div><div className="principal-row second"><div className="principal-badge green"><span>XY</span><small>XINYANG SPECIAL FIBER</small><b>2002</b></div><div className="principal-content"><span className="eyebrow">HUBEI XINYANG SPECIAL FIBER</span><h3>Diacetate fiber tow for dependable filter production.</h3><p>National high-tech enterprise · NEEQ: 836228 · 99%+ export revenue ratio</p></div><a className="circle-arrow" href="#contact">↗</a></div></section>

    <section className="faq-band" id="faq"><div className="shell faq-inner"><div><span className="eyebrow">04 / QUICK ANSWERS</span><h2>Need a straight<br /><em>answer?</em></h2></div><div className="faq-list"><details open><summary>Who is the KCLKA agent in Bangladesh?</summary><p>Doniva is the officially authorized KCLKA shoe machinery agent for the Bangladesh market.</p></details><details><summary>Where can I source acetate tow?</summary><p>We supply Xinyang Special Fiber diacetate fiber tow for cigarette filter rods and other precision filtration applications.</p></details><details><summary>Can you support a complete shoe line?</summary><p>Yes. We can coordinate KCLKA machinery, Jiapinyun materials and overseas installation support.</p></details></div></div></section>

    <section className="contact-cta" id="contact"><div className="shell contact-inner"><span className="eyebrow">05 / START A CONVERSATION</span><h2>Tell us what you&apos;re<br /><em>building next.</em></h2><p>Share your product, quantity or technical requirement. Our team responds within 24 business hours.</p><div className="contact-actions"><a className="button button-orange" href="/contact">Request a quote <span>↗</span></a><a className="button button-light" href="https://wa.me/8613544153386">Chat on WhatsApp <span>↗</span></a></div></div></section>

    <SiteFooter />
    <a className="whatsapp" href="https://wa.me/8613544153386" aria-label="Chat on WhatsApp">WA</a>
  </main>;
}
