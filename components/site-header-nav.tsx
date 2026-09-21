"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MenuGroup } from "@/lib/navigation";

export function SiteHeaderNav({ groups }: { groups: MenuGroup[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const close = () => {
    setMenuOpen(false);
    setOpenGroup(null);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return <>
    <div className="topline"><span>SHENZHEN 路 CHINA</span><span>AUTHORIZED INDUSTRIAL SUPPLY FOR SOUTH ASIA</span><a href="mailto:olivia@dongyuanlihua.com">olivia@dongyuanlihua.com</a></div>
    <nav className="nav shell" aria-label="Main navigation">
      <Link className="brand" href="/" aria-label="Dongyuan Lihua home"><span className="brand-mark">DL</span><span>DONGYUAN<br /><b>LIHUA</b></span></Link>
      <button type="button" className={`menu-button ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-controls="site-navigation" aria-expanded={menuOpen}><span className="menu-button-box"><span /><span /><span /></span></button>
      <div id="site-navigation" className={`nav-links ${menuOpen ? "open" : ""}`}>
        {groups.map((menu) => {
          const submenuOpen = openGroup === menu.key;
          return <div className={`nav-menu ${submenuOpen ? "submenu-open" : ""}`} key={menu.key}>
            <div className="nav-menu-link">
              <Link href={menu.href} onClick={close}>{menu.label}</Link>
              <button type="button" className="submenu-toggle" onClick={() => setOpenGroup(submenuOpen ? null : menu.key)} aria-label={`${submenuOpen ? "Collapse" : "Expand"} ${menu.label} menu`} aria-expanded={submenuOpen}><span>⌄</span></button>
            </div>
            <div className="nav-submenu">{menu.items.filter((item) => item.label.trim().toLowerCase() !== "view all").map((item) => <Link href={item.href} onClick={close} key={item.href}>{item.label}</Link>)}</div>
          </div>;
        })}
        <Link href="/about-us" onClick={close}>About us</Link>
        <Link href="/faq" onClick={close}>FAQs</Link>
        <Link className="nav-cta" href="/contact" onClick={close}>Get a quote <span>→</span></Link>
      </div>
    </nav>
    <button type="button" className={`nav-backdrop ${menuOpen ? "open" : ""}`} aria-label="Close navigation" tabIndex={menuOpen ? 0 : -1} onClick={close} />
  </>;
}
