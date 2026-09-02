import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { TEAMS } from "@/lib/football/leagues";
import mapping from "@/lib/football/tm-teams.json";

/**
 * نقل‌وانتقالات واقعی از Transfermarkt (tm_transfers) — join با تیم‌های پروژه
 * ?league=slug → فقط آن لیگ. fallback: mock که در کلاینت هست.
 */

type MappingFile = Record<string, Record<string, number>>;
const MAP = mapping as unknown as MappingFile;

// slug → tmClubId برای کل پروژه + reverse map برای رندر
const slugToTm: Record<string, number> = {};
const tmToSlug: Record<number, string> = {};
for (const [league, teams] of Object.entries(MAP)) {
  for (const [slug, tmId] of Object.entries(teams)) {
    slugToTm[slug] = tmId;
    tmToSlug[tmId] = slug;
  }
}

const teamBySlug = new Map(TEAMS.map((t) => [t.slug, t]));

function getTmDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) {
    g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  }
  return g.__tmDb;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leagueSlug = searchParams.get("league");
  if (!leagueSlug) return NextResponse.json({ success: false, error: "league لازم است" }, { status: 400 });

  const leagueMap = MAP[leagueSlug];
  if (!leagueMap) return NextResponse.json({ success: true, items: [], covered: false });

  const tmIds = Object.values(leagueMap);
  const ph = tmIds.map(() => "?").join(",");
  let rows: Array<{
    player_id: number; transfer_date: string; from_club_id: number; from_club_name: string;
    to_club_id: number; to_club_name: string; transfer_fee: string | null; market_value_in_eur: number | null; player_name: string;
  }> = [];
  try {
    rows = getTmDb().prepare(
      `SELECT * FROM tm_transfers WHERE to_club_id IN (${ph}) OR from_club_id IN (${ph}) ORDER BY transfer_date DESC LIMIT 40`
    ).all(...tmIds, ...tmIds) as typeof rows;
  } catch {
    return NextResponse.json({ success: true, items: [], covered: true });
  }

  const items = rows.map((t) => {
    const fromSlug = tmToSlug[t.from_club_id];
    const toSlug = tmToSlug[t.to_club_id];
    const fromTeam = fromSlug ? teamBySlug.get(fromSlug) : undefined;
    const toTeam = toSlug ? teamBySlug.get(toSlug) : undefined;
    return {
      playerId: t.player_id,
      playerName: t.player_name,
      date: t.transfer_date,
      fee: formatFee(t.transfer_fee),
      marketValue: t.market_value_in_eur,
      from: { tmId: t.from_club_id, name: t.from_club_name, ourTeam: fromTeam ? { slug: fromTeam.slug, name: fromTeam.name, logo: fromTeam.logo, color: fromTeam.color } : null },
      to: { tmId: t.to_club_id, name: t.to_club_name, ourTeam: toTeam ? { slug: toTeam.slug, name: toTeam.name, logo: toTeam.logo, color: toTeam.color } : null },
    };
  });

  return NextResponse.json({ success: true, items, covered: true, source: "transfermarkt" });
}

function formatFee(fee: string | null): string {
  if (!fee) return "انتقال آزاد";
  const n = Number(fee);
  if (Number.isNaN(n) || n === 0) return "انتقال آزاد";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `€${Math.round(n / 1_000)}K`;
  return `€${n}`;
}
