import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { TEAMS, LEAGUES } from "@/lib/football/leagues";

function getTmDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  return g.__tmDb;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ success: true, teams: [], leagues: [], players: [] });

  const qLower = q.toLowerCase();

  // تیم‌ها — نام فارسی + انگلیسی
  const teams = TEAMS.filter(
    (t) => t.name.includes(q) || t.shortName.includes(q) || t.slug.toLowerCase().includes(qLower)
  ).slice(0, 8).map((t) => ({ slug: t.slug, name: t.name, englishName: (t as any).englishName ?? t.shortName, logo: t.logo, color: t.color }));

  // لیگ‌ها
  const leagues = LEAGUES.filter(
    (l) => l.name.includes(q) || l.englishName.toLowerCase().includes(qLower) || l.slug.toLowerCase().includes(qLower)
  ).slice(0, 6).map((l) => ({ slug: l.slug, name: l.name, englishName: l.englishName, logo: l.logo }));

  // بازیکنان — از tm_players
  let players: Array<{ id: number; name: string; position: string | null; club: string | null; mv: number | null }> = [];
  try {
    const tm = getTmDb();
    const rows = tm.prepare(
      `SELECT p.player_id AS id, p.pretty_name AS name, p.position, c.name AS club, p.market_value_in_eur AS mv
       FROM tm_players p LEFT JOIN tm_clubs c ON c.club_id = p.club_id
       WHERE lower(p.pretty_name) LIKE ? COLLATE NOCASE ORDER BY p.market_value_in_eur DESC LIMIT 10`
    ).all(`%${qLower}%`) as typeof players;
    players = rows;
  } catch { /* fallback: mock search via leagues data is enough */ }

  return NextResponse.json({ success: true, teams, leagues, players });
}
