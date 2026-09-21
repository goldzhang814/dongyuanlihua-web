import Link from "next/link";
import type { ReactNode } from "react";
import { getSiteData } from "@/lib/content";
import { buildNavigation } from "@/lib/navigation";
import { SiteHeaderNav } from "@/components/site-header-nav";

export async function SiteHeader() {
  const siteData = await getSiteData();
  return <SiteHeaderNav groups={buildNavigation(siteData)} />;
}

export function SiteFooter() {
  return <footer><div className="shell footer-grid"><div className="footer-brand"><Link className="brand light" href="/"><span className="brand-mark">DL</span><span>DONGYUAN<br /><b>LIHUA</b></span></Link><p>Authorized industrial supply from Shenzhen to South Asia.</p></div><div><span className="footer-label">EXPLORE</span><Link href="/about-us">About us</Link><Link href="/products">Products</Link><Link href="/principals">Our principals</Link><Link href="/news">News</Link></div><div><span className="footer-label">CONTACT</span><a href="mailto:olivia@dongyuanlihua.com">olivia@dongyuanlihua.com</a><a href="tel:+8675528716856">+86 755 2871 6856</a><a href="https://wa.me/8613544153386">WhatsApp ↗</a></div><div><span className="footer-label">OFFICE</span><p>A-2610, Xinian Center<br />6021 Shennan Avenue, Futian District, Shenzhen, China</p></div></div><div className="shell footer-bottom"><span>© 2026 Dongyuan Lihua International Development Co., Ltd.</span><span>USCC 91440300MA5GNDYLXT</span></div></footer>;
}

export function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: ReactNode; copy: string }) {
  return <section className="inner-hero"><div className="shell"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div></section>;
}
