import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

/** ارزش بازار بازیکن از Transfermarkt — ?name= (انگلیسی از NAME_MAP) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") || "").trim();
  if (!name) return NextResponse.json({ success: false, error: "name لازم است" }, { status: 400 });

  let tm: Database.Database;
  try {
    const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
    if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
    tm = g.__tmDb;
  } catch {
    return NextResponse.json({ success: true, found: false });
  }

  try {
    const player = tm.prepare(`SELECT player_id, pretty_name, position, sub_position, date_of_birth, height_in_cm, foot, market_value_in_eur, highest_market_value_in_eur, contract_expiration_date, country_of_citizenship, club_id FROM tm_players WHERE lower(pretty_name) = lower(?) LIMIT 1`).get(name) as {
      player_id: number; pretty_name: string; position: string | null; sub_position: string | null; date_of_birth: string | null;
      height_in_cm: number | null; foot: string | null; market_value_in_eur: number | null;
      highest_market_value_in_eur: number | null; contract_expiration_date: string | null; country_of_citizenship: string | null; club_id: number | null;
    } | undefined;

    if (!player) return NextResponse.json({ success: true, found: false });

    const clubName = player.club_id
      ? (tm.prepare(`SELECT name FROM tm_clubs WHERE club_id = ?`).get(player.club_id) as { name: string } | undefined)?.name ?? null
      : null;

    const history = tm.prepare(
      `SELECT date, market_value_in_eur as v FROM tm_valuations WHERE player_id = ? ORDER BY date ASC`
    ).all(player.player_id) as Array<{ date: string; v: number | null }>;

    // تاریخچه انتقالات واقعی بازیکن — Transfermarkt
    const transfers = tm.prepare(
      `SELECT transfer_date, from_club_name, to_club_name, transfer_fee, market_value_in_eur
       FROM tm_transfers WHERE player_id = ? ORDER BY transfer_date DESC LIMIT 10`
    ).all(player.player_id) as Array<{
      transfer_date: string; from_club_name: string; to_club_name: string; transfer_fee: string | null; market_value_in_eur: number | null;
    }>;

    // آمار جمعی از appearances — اگر جدول بود (فعلاً import نشده، آماده برای آینده)
    return NextResponse.json({
      success: true,
      found: true,
      player: {
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
        tmClubName: clubName,
      },
      history: history.slice(-24),
      transfers,
    });
  } catch (e) {
    return NextResponse.json({ success: true, found: false });
  }
}
