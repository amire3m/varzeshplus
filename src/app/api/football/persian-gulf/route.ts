import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { VICTORY_TEAM_NAME_FA } from "@/lib/football/victory-teams";

export const dynamic = "force-dynamic";

/**
 * لیگ خلیج فارس — دیتای واقعی victoryapi (ذخیره‌شده در real-data.json توسط scripts/download-football)
 * standings: جدول واقعی | fixtures: بازی‌های واقعی
 * خروجی هم‌شکل league-games تا UI یکسان باشد.
 */

type Fixture = { id: number; time: string; homeId: number; awayId: number; homeName: string; awayName: string };
type StandRow = { rank: number; teamId: number; slug: string; name: string; played: number; pts: number; win?: number; draw?: number; loss?: number; gf?: number; ga?: number };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const season = Number(searchParams.get("season") || 2025);

  const p = path.join(process.cwd(), "src", "lib", "football", "data", "real-data.json");
  if (!fs.existsSync(p)) return NextResponse.json({ success: false }, { status: 404 });
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const pg = data.persianGulf;
  if (!pg) return NextResponse.json({ success: true, covered: false });

  const games: Array<{
    gameId: number; date: string | null; round: string | null;
    home: { slug?: string; name: string; logo?: string; color?: string };
    away: { slug?: string; name: string; logo?: string; color?: string };
    homeGoals: number | null; awayGoals: number | null; status: string;
  }> = [];

  // fixtures واقعی — نتیجه اگر در standings/stage بود. victoryapi فقط زمان/نام می‌دهد؛ نتیجه‌ها در fixtures خود API
  for (const f of (pg.fixtures ?? []) as Fixture[]) {
    const slugH = (VICTORY_TEAM_NAME_FA as Record<string, string>)[String(f.homeId)];
    const slugA = (VICTORY_TEAM_NAME_FA as Record<string, string>)[String(f.awayId)];
    games.push({
      gameId: f.id, date: f.time || null, round: null,
      home: { slug: slugH, name: f.homeName },
      away: { slug: slugA, name: f.awayName },
      homeGoals: null, awayGoals: null, status: "upcoming",
    });
  }
  // نام فارسی از standings
  for (const g of games) {
    const rowH = (pg.standings ?? []).find((s: StandRow) => VICTORY_TEAM_NAME_FA[String(s.teamId)] === g.home.slug);
    const rowA = (pg.standings ?? []).find((s: StandRow) => VICTORY_TEAM_NAME_FA[String(s.teamId)] === g.away.slug);
    if (rowH) g.home.name = rowH.name;
    if (rowA) g.away.name = rowA.name;
  }

  return NextResponse.json({
    success: true, covered: true, season,
    games,
    standings: (pg.standings ?? []).map((s: StandRow) => ({
      rank: s.rank, teamId: s.teamId, played: s.played, win: s.win ?? 0, draw: s.draw ?? 0, loss: s.loss ?? 0,
      gf: s.gf ?? 0, ga: s.ga ?? 0, pts: s.pts,
      team: { slug: VICTORY_TEAM_NAME_FA[String(s.teamId)] ?? s.slug, name: s.name, logo: `https://www.victoryapi.ir/flags/png/teams/${s.teamId}.png`, color: "#0b7a3e", shortName: s.name },
    })),
    source: pg.source ?? "victoryapi",
  });
}
