import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { TEAMS } from "@/lib/football/leagues";
import mapping from "@/lib/football/tm-teams.json";

/**
 * بازی‌های واقعی لیگ از tm_games (Transfermarkt)
 * ?league=slug&season=2025 → بازی‌های آن فصل + جدول محاسبه‌شده از نتایج
 */

type MappingFile = Record<string, Record<string, number>>;
const MAP = mapping as unknown as MappingFile;
const COMP_BY_SLUG: Record<string, string> = {
  "premier-league": "GB1", "la-liga": "ES1", "serie-a": "IT1", "bundesliga": "L1",
  "ligue-1": "FR1", "eredivisie": "NL1", "primeira-liga": "PO1", "super-lig": "TR1",
  "saudi-pro-league": "SA1", "brasileirao": "BRA1", "mls": "MLS1",
};

const tmIdToTeam = new Map<number, typeof TEAMS[number]>();
for (const [lg, teams] of Object.entries(MAP)) {
  for (const [slug, tmId] of Object.entries(teams)) {
    const t = TEAMS.find((x) => x.slug === slug);
    if (t) tmIdToTeam.set(tmId, t);
  }
}

function getTmDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  return g.__tmDb;
}

type GameRow = {
  game_id: number; competition_id: string; season: number; round: string | null; date: string | null;
  home_club_id: number; away_club_id: number; home_goals: number | null; away_goals: number | null; stadium: string | null; status: string | null;
};

function teamOf(tmId: number | null) {
  if (tmId === null) return null;
  const t = tmIdToTeam.get(tmId);
  return t ? { slug: t.slug, name: t.name, logo: t.logo, color: t.color, shortName: t.shortName } : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leagueSlug = searchParams.get("league") || "";
  const comp = COMP_BY_SLUG[leagueSlug];
  if (!comp) return NextResponse.json({ success: true, covered: false, games: [], standings: [] });

  const seasonParam = searchParams.get("season");
  const season = seasonParam ? Number(seasonParam) : 2025;

  try {
    const tm = getTmDb();
    const games = tm.prepare(`
      SELECT g.*, cg.own_goals AS cg_own, cg.opponent_goals AS cg_opp
      FROM tm_games g
      LEFT JOIN tm_club_games cg ON cg.game_id = g.game_id AND cg.club_id = g.home_club_id
      WHERE g.competition_id = ? AND g.season IN (?, ?) ORDER BY g.date ASC
    `).all(comp, season, season + 1) as Array<GameRow & { cg_own: number | null; cg_opp: number | null }>;

    // اهداف واقعی از club_games (games.csv اهداف ندارد)
    const mapped = games.map((g) => {
      const homeGoals = g.cg_own !== null && g.cg_own !== undefined ? g.cg_own : g.home_goals;
      const awayGoals = g.cg_opp !== null && g.cg_opp !== undefined ? g.cg_opp : g.away_goals;
      return {
        gameId: g.game_id,
        date: g.date,
        round: g.round,
        home: teamOf(g.home_club_id) ?? { tmName: null, tmId: g.home_club_id },
        away: teamOf(g.away_club_id) ?? { tmName: null, tmId: g.away_club_id },
        homeGoals,
        awayGoals,
        status: homeGoals !== null ? "finished" : "upcoming",
      };
    });

    // جدول از نتایج واقعی (اهداف از club_games) — فقط تیم‌های ما
    const standings: Array<{ teamId: number; played: number; win: number; draw: number; loss: number; gf: number; ga: number; pts: number }> = [];
    const acc = new Map<number, { played: number; win: number; draw: number; loss: number; gf: number; ga: number; pts: number }>();
    for (const g of games) {
      const homeGoals = g.cg_own !== null && g.cg_own !== undefined ? g.cg_own : g.home_goals;
      const awayGoals = g.cg_opp !== null && g.cg_opp !== undefined ? g.cg_opp : g.away_goals;
      if (homeGoals === null || awayGoals === null) continue;
      if (!tmIdToTeam.has(g.home_club_id) || !tmIdToTeam.has(g.away_club_id)) continue;
      for (const [me, opp, gf, ga] of [[g.home_club_id, g.away_club_id, homeGoals, awayGoals], [g.away_club_id, g.home_club_id, awayGoals, homeGoals]] as const) {
        const a = acc.get(me) ?? { played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 };
        a.played++; a.gf += gf; a.ga += ga;
        if (gf > ga) { a.win++; a.pts += 3; } else if (gf === ga) { a.draw++; a.pts += 1; } else a.loss++;
        acc.set(me, a);
      }
    }
    for (const [teamId, a] of acc) standings.push({ teamId, ...a });
    standings.sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf);

    return NextResponse.json({
      success: true, covered: true, season,
      games: mapped,
      standings: standings.map((s, i) => ({ rank: i + 1, ...s, team: tmIdToTeam.get(s.teamId) ? { slug: tmIdToTeam.get(s.teamId)!.slug, name: tmIdToTeam.get(s.teamId)!.name, logo: tmIdToTeam.get(s.teamId)!.logo, color: tmIdToTeam.get(s.teamId)!.color, shortName: tmIdToTeam.get(s.teamId)!.shortName } : null })),
    });
  } catch (e) {
    console.error("league-games error:", e);
    return NextResponse.json({ success: true, covered: false, games: [], standings: [] });
  }
}
