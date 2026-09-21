import type { SiteData } from "@/types/content";
import { getContentData } from "@/lib/content-store";

export async function getSiteData(): Promise<SiteData> {
  return getContentData();
}
