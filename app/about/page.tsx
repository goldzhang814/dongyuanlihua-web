import type { Metadata } from "next";
import { SiteFooter, SiteHeader, PageIntro } from "@/components/site-chrome";
import { targetKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Dongyuan Lihua",
  description: "Dongyuan Lihua (Shenzhen) International Development Co., Ltd. — a licensed import-export enterprise and the authorized Bangladesh market agent for KCLKA shoe machinery and Xinyang Special Fiber acetate tow.",
  keywords: ["Shenzhen import export company", "China industrial sourcing company", ...targetKeywords],
  alternates: { canonical: "/about-us" },
};

export default function AboutPage() {
  return <><SiteHeader /><PageIntro eyebrow="ABOUT US / 04" title={<>A direct line to <em>better supply.</em></>} copy="Dongyuan Lihua is a Shenzhen-based international trading company focused on authorized Chinese industrial equipment and materials for South Asian manufacturers." /><main className="about-page">
    <section className="shell about-copy"><div><span className="eyebrow">COMPANY PROFILE</span><h2>Not a middleman. A <em>market-side partner.</em></h2></div><div>
      <p>Dongyuan Lihua (Shenzhen) International Development Co., Ltd. is a licensed import-export enterprise headquartered in Shenzhen, China — the nation&apos;s leading hub for machinery and electronics trade. Established in March 2021 and registered under Unified Social Credit Code 91440300MA5GNDYLXT, we specialize in representing top-tier Chinese manufacturers in South Asian markets, with a strategic focus on Bangladesh.</p>
      <p>Our business is built on official agency relationships, not middleman speculation. We are the authorized Bangladesh market agent for Jinjiang KCLKA Shoe Machinery and the designated export agent for Hubei Xinyang Special Fiber&apos;s acetate tow products. These partnerships are backed by signed agreements and direct factory coordination.</p>
      <p>We connect procurement teams with KCLKA shoe machinery, Jiapinyun footwear materials and Xinyang Special Fiber acetate tow — and support every order with clear communication, export documentation and after-sales coordination.</p>
    </div></section>
    <section className="credential-band"><div className="shell credential-grid"><div><span className="eyebrow">OUR CREDENTIALS</span><h2>Transparent by design.</h2></div><dl>
      <div><dt>Business Registration</dt><dd>Unified Social Credit Code 91440300MA5GNDYLXT</dd></div>
      <div><dt>Legal Representative</dt><dd>Ms. Liu Peiyao</dd></div>
      <div><dt>Customs Registration</dt><dd>Shenzhen Customs Code 4403961HB4</dd></div>
      <div><dt>Business Scope</dt><dd>Import &amp; export of machinery, electronic products, footwear materials, and industrial goods</dd></div>
      <div><dt>Registered Address</dt><dd>A-2610, Xinian Center, 6021 Shennan Avenue, Futian District, Shenzhen, China</dd></div>
      <div><dt>Operating Address</dt><dd>A-2610, Xinian Center, 6021 Shennan Avenue, Futian District, Shenzhen, China</dd></div>
    </dl></div></section>
    <section className="mission-band"><div className="shell"><span className="eyebrow">OUR MISSION</span><p className="mission-statement">To connect Bangladeshi manufacturers with world-class Chinese industrial equipment and materials through transparent, authorized, and fully supported trade relationships.</p><p className="mission-tagline">We don&apos;t just ship products — <em>we deliver supply chain confidence.</em></p></div></section>
  </main><SiteFooter /></>;
}
