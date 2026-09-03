import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { TEAMS } from "@/lib/football/leagues";
import mapping from "@/lib/football/tm-teams.json";

/**
 * بهترین‌های واقعی لیگ از tm_appearances (Transfermarkt)
 * ?league=slug&key=goals|assists|minutes&season=2025
 * خروجی رتبه‌دار برای تب «آمار» — فقط دیتای واقعی، بدون mock
 */

type MappingFile = Record<string, Record<string, number>>;
const MAP = mapping as unknown as MappingFile;

const tmToSlug: Record<number, string> = {};
const slugToComp: Record<string, string> = {};
const COMP_BY_SLUG: Record<string, string> = {
  "premier-league": "GB1", "la-liga": "ES1", "serie-a": "IT1", "bundesliga": "L1",
  "ligue-1": "FR1", "eredivisie": "NL1", "primeira-liga": "PO1", "super-lig": "TR1",
  "saudi-pro-league": "SA1", "brasileirao": "BRA1", "mls": "MLS1",
  // ایران پوشش TM ندارد
};
for (const [league, teams] of Object.entries(MAP)) {
  slugToComp[league] = COMP_BY_SLUG[league];
  for (const [, tmId] of Object.entries(teams)) tmToSlug[tmId] = league;
}

const teamBySlug = new Map(TEAMS.map((t) => [t.slug, t]));

function getTmDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  return g.__tmDb;
}

const KEY_COLS: Record<string, string> = { goals: "goals", assists: "assists", minutes: "minutes_played" };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leagueSlug = searchParams.get("league") || "";
  const key = KEY_COLS[searchParams.get("key") || "goals"] ? (searchParams.get("key") || "goals") : "goals";
  const comp = COMP_BY_SLUG[leagueSlug];
  if (!comp) return NextResponse.json({ success: true, covered: false, items: [] });

  const seasonParam = searchParams.get("season");
  const currentSeason = 2025; // فصل 2025/26
  const season = seasonParam ? Number(seasonParam) : currentSeason;

  try {
    const tm = getTmDb();
    // فصل TM: در games یک فصل = از جولای تا جون؛ در appearances فقط date داریم → با LIKE سال
    const rows = tm.prepare(`
      SELECT a.player_id,
             MAX(p.pretty_name) as name,
             MAX(p.position) as position,
             MAX(p.market_value_in_eur) as mv,
             MAX(p.image_url) as image_url,
             MAX(c.name) as club_name,
             MAX(c.club_id) as club_id,
             SUM(a.goals) as goals,
             SUM(a.assists) as assists,
             SUM(a.minutes_played) as minutes,
             COUNT(*) as games,
             SUM(a.yellow_cards) as yellows,
             SUM(a.red_cards) as reds
      FROM tm_appearances a
      LEFT JOIN tm_players p ON p.player_id = a.player_id
      LEFT JOIN tm_clubs c ON c.club_id = a.player_club_id
      WHERE a.competition_id = ? AND strftime('%Y', a.date) IN (?, ?)
      GROUP BY a.player_id
      ORDER BY SUM(a.${KEY_COLS[key]}) DESC
      LIMIT 10
    `).all(comp, String(season), String(season + 1)) as Array<{
      player_id: number; name: string | null; position: string | null; mv: number | null; image_url: string | null;
      club_name: string | null; club_id: number | null; goals: number | null; assists: number | null;
      minutes: number | null; games: number | null; yellows: number | null; reds: number | null;
    }>;

    const items = rows.map((r, i) => {
      const clubSlug = r.club_id ? Object.entries(MAP).find(([, teams]) => Object.values(teams).includes(r.club_id!))?.[0] : undefined;
      const ourSlug = Object.entries(MAP).find(([, teams]) => Object.values(teams).includes(r.club_id!))?.[1]
        ? Object.entries(Object.fromEntries(Object.entries(MAP).map(([lg, t]) => [lg, Object.entries(t)])))
          .flatMap(([lg, entries]) => entries.filter(([, id]) => id === r.club_id).map(([slug]) => ({ lg, slug })))
        : [];
      const ourTeam = ourSlug[0] ? teamBySlug.get(ourSlug[0].slug) : undefined;
      return {
        rank: i + 1,
        playerId: r.player_id,
        name: r.name ?? `بازیکن ${r.player_id}`,
        position: r.position,
        marketValue: r.mv,
        clubName: r.club_name,
        ourTeam: ourTeam ? { slug: ourTeam.slug, name: ourTeam.name, logo: ourTeam.logo, color: ourTeam.color } : null,
        goals: r.goals ?? 0,
        assists: r.assists ?? 0,
        minutes: r.minutes ?? 0,
        games: r.games ?? 0,
        yellows: r.yellows ?? 0,
        reds: r.reds ?? 0,
      };
    });

    return NextResponse.json({ success: true, covered: true, season, key, items });
  } catch (e) {
    console.error("players-top error:", e);
    return NextResponse.json({ success: true, covered: false, items: [] });
  }
}
