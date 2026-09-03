import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { TEAMS } from "@/lib/football/leagues";
import mapping from "@/lib/football/tm-teams.json";

/** دیتای واقعی یک مسابقه از TM — ?gameId= */

type MappingFile = Record<string, Record<string, number>>;
const MAP = mapping as unknown as MappingFile;

const tmIdToTeam = new Map<number, typeof TEAMS[number]>();
for (const teams of Object.values(MAP)) {
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

function teamInfo(tmId: number | null, clubName: string | null) {
  const ours = tmId === null ? null : tmIdToTeam.get(tmId) ?? null;
  return {
    tmId,
    name: ours?.name ?? clubName ?? "—",
    logo: ours?.logo ?? null,
    color: ours?.color ?? "#8FA1B5",
    slug: ours?.slug ?? null,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameId = Number(searchParams.get("gameId"));
  if (!gameId) return NextResponse.json({ success: false, error: "gameId لازم است" }, { status: 400 });

  try {
    const tm = getTmDb();
    const game = tm.prepare(`SELECT * FROM tm_games WHERE game_id = ?`).get(gameId) as {
      game_id: number; competition_id: string; season: number; round: string | null; date: string | null;
      home_club_id: number; away_club_id: number; stadium: string | null; attendance: number | null;
    } | undefined;
    if (!game) return NextResponse.json({ success: true, covered: false });

    const homeClub = tm.prepare(`SELECT name FROM tm_clubs WHERE club_id = ?`).get(game.home_club_id) as { name: string } | undefined;
    const awayClub = tm.prepare(`SELECT name FROM tm_clubs WHERE club_id = ?`).get(game.away_club_id) as { name: string } | undefined;

    // اهداف واقعی از club_games
    const hg = tm.prepare(`SELECT own_goals, opponent_goals FROM tm_club_games WHERE game_id = ? AND club_id = ?`).get(gameId, game.home_club_id) as { own_goals: number | null; opponent_goals: number | null } | undefined;

    const lineups = tm.prepare(`SELECT club_id, player_id, player_name, is_starting, position, jersey_number FROM tm_lineups WHERE game_id = ?`).all(gameId) as Array<{
      club_id: number; player_id: number; player_name: string; is_starting: number | null; position: string | null; jersey_number: number | null;
    }>;

    const events = tm.prepare(`SELECT minute, type, player_id, player_name, assist_id, assist_name, description FROM tm_events WHERE game_id = ?`).all(gameId) as Array<{
      minute: string | null; type: string; player_id: number | null; player_name: string | null; assist_id: number | null; assist_name: string | null; description: string | null;
    }>;
    events.sort((a, b) => (parseFloat(a.minute ?? "0") || 0) - (parseFloat(b.minute ?? "0") || 0));

    // آمار بازیکنان این بازی از appearances
    const apps = tm.prepare(`
      SELECT a.player_id, a.player_club_id, p.pretty_name as player_name, a.goals, a.assists, a.minutes_played, a.yellow_cards, a.red_cards
      FROM tm_appearances a LEFT JOIN tm_players p ON p.player_id = a.player_id
      WHERE a.game_id = ?
    `).all(gameId) as Array<{
      player_id: number; player_club_id: number; player_name: string | null; goals: number | null; assists: number | null;
      minutes_played: number | null; yellow_cards: number | null; red_cards: number | null;
    }>;

    return NextResponse.json({
      success: true,
      covered: true,
      game: {
        gameId: game.game_id,
        competitionId: game.competition_id,
        season: game.season,
        round: game.round,
        date: game.date,
        stadium: game.stadium,
        attendance: game.attendance,
        home: teamInfo(game.home_club_id, homeClub?.name ?? null),
        away: teamInfo(game.away_club_id, awayClub?.name ?? null),
        homeGoals: hg?.own_goals ?? null,
        awayGoals: hg?.opponent_goals ?? null,
      },
      lineups: {
        home: lineups.filter((l) => l.club_id === game.home_club_id),
        away: lineups.filter((l) => l.club_id === game.away_club_id),
      },
      events,
      playerStats: apps,
    });
  } catch (e) {
    console.error("match-data error:", e);
    return NextResponse.json({ success: true, covered: false });
  }
}
