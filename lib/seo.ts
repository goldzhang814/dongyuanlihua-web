export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://doniva.cn";

export const siteName = "Doniva";
export const siteDescription = "Doniva connects Bangladesh and South Asia with authorized Chinese shoe machinery, footwear materials and acetate tow.";
export const targetKeywords = [
  "KCLKA shoe machine agent Bangladesh",
  "Acetate tow supplier Bangladesh",
  "China shoe machinery export",
  "Diacetate fiber tow export",
  "Shenzhen import export company",
];

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, siteUrl).toString();
}

export function cleanJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function keywordList(value?: string, fallback: string[] = targetKeywords) {
  const keywords = value?.split(",").map((keyword) => keyword.trim()).filter(Boolean);
  return keywords?.length ? keywords : fallback;
}
