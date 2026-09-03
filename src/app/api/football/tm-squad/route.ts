import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { TEAMS } from "@/lib/football/leagues";
import mapping from "@/lib/football/tm-teams.json";

/**
 * اسکواد واقعی تیم از TM — ?teamSlug=arsenal&season=2025
 * بازیکنان فعلی (club_id فعلی) + آمار واقعی فصل از appearances
 */

type MappingFile = Record<string, Record<string, number>>;
const MAP = mapping as unknown as MappingFile;

const slugToTm = new Map<string, number>();
for (const teams of Object.values(MAP)) {
  for (const [slug, tmId] of Object.entries(teams)) slugToTm.set(slug, tmId);
}

function getTmDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  return g.__tmDb;
}

const COMP_BY_SLUG: Record<string, string> = {
  "premier-league": "GB1", "la-liga": "ES1", "serie-a": "IT1", "bundesliga": "L1",
  "ligue-1": "FR1", "eredivisie": "NL1", "primeira-liga": "PO1", "super-lig": "TR1",
  "saudi-pro-league": "SA1", "brasileirao": "BRA1", "mls": "MLS1",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamSlug = searchParams.get("teamSlug") || "";
  const season = Number(searchParams.get("season") || 2025);
  const tmClubId = slugToTm.get(teamSlug);
  if (!tmClubId) return NextResponse.json({ success: true, covered: false, players: [] });

  const comp = COMP_BY_SLUG[Object.keys(COMP_BY_SLUG).find((k) => k === teamSlug.replace("-", "-")) ?? ""] ?? null;
  const leagueSlug = Object.keys(MAP).find((lg) => MAP[lg][teamSlug] !== undefined);
  const competitionId = leagueSlug ? COMP_BY_SLUG[leagueSlug] : null;

  try {
    const tm = getTmDb();
    const players = tm.prepare(`
      SELECT player_id, pretty_name, position, sub_position, date_of_birth, height_in_cm, foot,
             market_value_in_eur, contract_expiration_date, country_of_citizenship, image_url
      FROM tm_players WHERE club_id = ? ORDER BY
        CASE position WHEN 'Goalkeeper' THEN 1 WHEN 'Defence' THEN 2 WHEN 'Midfield' THEN 3 ELSE 4 END,
        pretty_name
    `).all(tmClubId) as Array<{
      player_id: number; pretty_name: string; position: string | null; sub_position: string | null; date_of_birth: string | null;
      height_in_cm: number | null; foot: string | null; market_value_in_eur: number | null; contract_expiration_date: string | null;
      country_of_citizenship: string | null; image_url: string | null;
    }>;

    // آمار واقعی فصل هر بازیکن (در لیگ داخلی)
    const stats = new Map<number, { goals: number; assists: number; minutes: number; games: number; yellows: number; reds: number }>();
    if (competitionId) {
      const rows = tm.prepare(`
        SELECT player_id, SUM(goals) g, SUM(assists) a, SUM(minutes_played) m, COUNT(*) n, SUM(yellow_cards) y, SUM(red_cards) r
        FROM tm_appearances WHERE player_club_id = ? AND competition_id = ? AND strftime('%Y', date) IN (?, ?)
        GROUP BY player_id
      `).all(tmClubId, competitionId, String(season), String(season + 1)) as Array<{ player_id: number; g: number | null; a: number | null; m: number | null; n: number; y: number | null; r: number | null }>;
      for (const r of rows) stats.set(r.player_id, { goals: r.g ?? 0, assists: r.a ?? 0, minutes: r.m ?? 0, games: r.n, yellows: r.y ?? 0, reds: r.r ?? 0 });
    }

    return NextResponse.json({
      success: true,
      covered: true,
      season,
      players: players.map((p) => ({
        playerId: p.player_id,
        name: p.pretty_name,
        position: p.position,
        subPosition: p.sub_position,
        dateOfBirth: p.date_of_birth,
        height: p.height_in_cm,
        foot: p.foot,
        marketValue: p.market_value_in_eur,
        contractUntil: p.contract_expiration_date,
        citizenship: p.country_of_citizenship,
        imageUrl: p.image_url,
        seasonStats: stats.get(p.player_id) ?? null,
      })),
    });
  } catch (e) {
    console.error("tm-squad error:", e);
    return NextResponse.json({ success: true, covered: false, players: [] });
  }
}
