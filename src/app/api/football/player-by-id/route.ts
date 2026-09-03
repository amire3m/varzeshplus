import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

/** پروفایل واقعی بازیکن با player_id واقعی TM — ?id=406635 */

function getTmDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  return g.__tmDb;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ success: false, error: "id لازم است" }, { status: 400 });

  try {
    const tm = getTmDb();
    const player = tm.prepare(`
      SELECT player_id, pretty_name, position, sub_position, date_of_birth, height_in_cm, foot,
             market_value_in_eur, highest_market_value_in_eur, contract_expiration_date,
             country_of_citizenship, image_url, club_id
      FROM tm_players WHERE player_id = ?
    `).get(id) as {
      player_id: number; pretty_name: string; position: string | null; sub_position: string | null; date_of_birth: string | null;
      height_in_cm: number | null; foot: string | null; market_value_in_eur: number | null; highest_market_value_in_eur: number | null;
      contract_expiration_date: string | null; country_of_citizenship: string | null; image_url: string | null; club_id: number | null;
    } | undefined;
    if (!player) return NextResponse.json({ success: true, covered: false });

    const clubName = player.club_id
      ? (tm.prepare(`SELECT name FROM tm_clubs WHERE club_id = ?`).get(player.club_id) as { name: string } | undefined)?.name ?? null
      : null;

    const history = tm.prepare(`SELECT date, market_value_in_eur as v FROM tm_valuations WHERE player_id = ? ORDER BY date ASC`).all(id) as Array<{ date: string; v: number | null }>;

    const transfers = tm.prepare(`
      SELECT transfer_date, from_club_name, to_club_name, transfer_fee, market_value_in_eur
      FROM tm_transfers WHERE player_id = ? ORDER BY transfer_date DESC LIMIT 12
    `).all(id) as Array<{ transfer_date: string; from_club_name: string; to_club_name: string; transfer_fee: string | null; market_value_in_eur: number | null }>;

    // آمار فصل‌به‌فصل واقعی از appearances
    const seasonStats = tm.prepare(`
      SELECT strftime('%Y', date) as yr, competition_id,
             COUNT(*) as games, SUM(goals) as goals, SUM(assists) as assists, SUM(minutes_played) as minutes,
             SUM(yellow_cards) as yellows, SUM(red_cards) as reds
      FROM tm_appearances WHERE player_id = ?
      GROUP BY yr, competition_id ORDER BY yr DESC, competition_id LIMIT 12
    `).all(id) as Array<{ yr: string; competition_id: string; games: number; goals: number | null; assists: number | null; minutes: number | null; yellows: number | null; reds: number | null }>;

    return NextResponse.json({
      success: true,
      covered: true,
      player: {
        id: player.player_id,
        prettyName: player.pretty_name,
        position: player.position,
        subPosition: player.sub_position,
        dateOfBirth: player.date_of_birth,
        height: player.height_in_cm,
        foot: player.foot,
        marketValueEur: player.market_value_in_eur,
        highestMarketValueEur: player.highest_market_value_in_eur,
        contractUntil: player.contract_expiration_date,
        citizenship: player.country_of_citizenship,
        imageUrl: player.image_url,
        tmClubName: clubName,
      },
      history: history.slice(-24),
      transfers,
      seasonStats,
    });
  } catch (e) {
    console.error("player-by-id error:", e);
    return NextResponse.json({ success: true, covered: false });
  }
}
