import { proxyPocketBaseFile } from "@/lib/pocketbase";

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyPocketBaseFile(path);
}

export const dynamic = "force-dynamic";
