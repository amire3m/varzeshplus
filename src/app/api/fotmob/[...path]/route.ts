import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const segments = (path ?? []).join("/");
  const search = new URL(req.url).search; // includes ?
  const target = `https://pub.fotmob.com/prod/${segments}${search}`;

  try {
    const r = await fetch(target, {
      headers: {
        "User-Agent": "VarzeshPlus/1.0",
        Accept: "application/json, text/plain, */*",
      },
      next: { revalidate: 60 },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`fotmob ${r.status}`);
    const ct = r.headers.get("content-type") ?? "";
    const data = ct.includes("application/json") ? await r.json() : await r.text();
    return Response.json(
      { data, source: "fotmob", cachedAt: new Date().toISOString(), target },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (e) {
    return Response.json(
      { data: null, source: "fallback", cachedAt: new Date().toISOString(), target, error: String(e) },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      }
    );
  }
}
