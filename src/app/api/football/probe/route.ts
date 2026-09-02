import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const file = "en.1.json";
  const season = "2024-25";
  const p = path.join(process.cwd(), "src", "lib", "football", "data", season, file);
  const out: Record<string, unknown> = {
    filePath: p,
    cwd: process.cwd(),
    exists: fs.existsSync(p),
  };
  if (fs.existsSync(p)) {
    try {
      const raw = fs.readFileSync(p, "utf8");
      const data = JSON.parse(raw);
      out.matches = (data as { matches?: unknown[] }).matches?.length;
      out.first = (data as { matches?: Array<{ team1: string }> }).matches?.[0]?.team1;
    } catch (e) {
      out.err = String(e);
    }
  }
  // شبیه‌سازی readLocal
  try {
    const p2 = path.join(process.cwd(), "src", "lib", "football", "data", season, file);
    if (fs.existsSync(p2)) {
      const raw2 = fs.readFileSync(p2, "utf8");
      const data2 = JSON.parse(raw2) as { matches: unknown[] };
      out.readLocalOk = !!(data2.matches?.length);
    } else out.readLocalOk = false;
  } catch (e) { out.readLocalErr = String(e); }
  return NextResponse.json(out);
}
