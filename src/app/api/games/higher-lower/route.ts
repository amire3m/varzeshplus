import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

/**
 * بیشتر یا کمتر — ارزش بازار کدام بازیکن بیشتر است؟ (دیتای واقعی tm_players)
 * GET → جفت بدون مقدار | POST { pick, aId, bId } → نتیجه + مقادیر
 */

const COMPS = ["GB1", "ES1", "IT1", "L1", "FR1", "NL1", "PO1", "TR1", "SA1", "BRA1", "MLS1"];

function getDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  return g.__tmDb;
}

const SEL = `SELECT p.player_id AS id, p.pretty_name AS name, p.position, p.market_value_in_eur AS mv, c.name AS club
  FROM tm_players p JOIN tm_clubs c ON c.club_id = p.club_id`;

export async function GET() {
  try {
    const db = getDb();
    const ph = COMPS.map(() => "?").join(",");
    const pair = db.prepare(
      `${SEL} WHERE c.competition_id IN (${ph}) AND p.market_value_in_eur >= 1000000 ORDER BY RANDOM() LIMIT 2`
    ).all(...COMPS) as Array<{ id: number; name: string; position: string | null; club: string }>;
    if (pair.length < 2) return NextResponse.json({ success: false, error: "دیتا آماده نیست" }, { status: 503 });
    const strip = (p: { id: number; name: string; position: string | null; club: string }) => ({
      id: p.id, name: p.name, position: p.position, club: p.club,
    });
    return NextResponse.json({ success: true, a: strip(pair[0]), b: strip(pair[1]) });
  } catch {
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { pick, aId, bId } = await req.json().catch(() => ({}));
    if (!pick || !aId || !bId) return NextResponse.json({ success: false, error: "ورودی ناقص" }, { status: 400 });
    const db = getDb();
    const rows = db.prepare(`SELECT player_id AS id, market_value_in_eur AS mv FROM tm_players WHERE player_id IN (?, ?)`).all(Number(aId), Number(bId)) as Array<{ id: number; mv: number | null }>;
    if (rows.length < 2) return NextResponse.json({ success: false, error: "بازیکن یافت نشد" }, { status: 404 });
    const a = rows.find((r) => r.id === Number(aId))!;
    const b = rows.find((r) => r.id === Number(bId))!;
    const correct = a.mv === b.mv ? true : Number(pick) === (a.mv! > b.mv! ? a.id : b.id);
    return NextResponse.json({ success: true, correct, aMv: a.mv, bMv: b.mv });
  } catch {
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
