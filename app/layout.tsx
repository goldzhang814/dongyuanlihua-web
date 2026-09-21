import type { Metadata } from "next";
import "./globals.css";
import { cleanJsonLd, siteDescription, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Authorized Industrial Supply for South Asia`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} | Authorized Industrial Supply for South Asia`,
    description: siteDescription,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: `${siteName} | Authorized Industrial Supply for South Asia`,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const organization = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Dongyuan Lihua (Shenzhen) International Development Co., Ltd.",
        alternateName: siteName,
        url: siteUrl,
        email: "olivia@dongyuanlihua.com",
        telephone: "+86 135 4415 3386",
        description: siteDescription,
        areaServed: ["Bangladesh", "South Asia"],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Shenzhen",
          addressRegion: "Guangdong",
          addressCountry: "CN",
        },
        knowsAbout: ["Footwear machinery", "Shoe manufacturing materials", "Cellulose acetate tow", "Industrial sourcing"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: siteDescription,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: cleanJsonLd(organization) }} />
      </body>
    </html>
  );
}
