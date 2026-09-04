import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import { TEAMS } from "@/lib/football/leagues";
import mapping from "@/lib/football/tm-teams.json";

/** پروفایل واقعی بازیکن با player_id واقعی TM — ?id=406635 */

type MappingFile = Record<string, Record<string, number>>;
const MAP = mapping as unknown as MappingFile;

// tmClubId → teamSlug پروژه
const tmClubToSlug = new Map<number, string>();
for (const teams of Object.values(MAP)) {
  for (const [slug, tmId] of Object.entries(teams)) tmClubToSlug.set(tmId, slug);
}
const teamBySlug = new Map(TEAMS.map((t) => [t.slug, t]));

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

    // تیم پروژه (برای لینک به صفحه تیم + هم‌تیمی‌ها)
    const ourSlug = player.club_id !== null ? tmClubToSlug.get(player.club_id) ?? null : null;
    const ourTeam = ourSlug ? teamBySlug.get(ourSlug) ?? null : null;

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

    // تخمین مبلغ انتقال (Ball-On-lite — شفاف و ساده، نه جادو)
    // پایه: ارزش بازار فعلی؛ اگر نبود از عملکرد فصل آخر تخمین زده می‌شود
    const latest = seasonStats.find((s) => (s.minutes ?? 0) > 500) ?? seasonStats[0];
    const mins = latest?.minutes ?? 0;
    const ga = (latest?.goals ?? 0) + (latest?.assists ?? 0);
    const per90 = mins > 0 ? ga / (mins / 90) : 0;
    let birthYear: number | null = null;
    try { birthYear = player.date_of_birth ? new Date(player.date_of_birth).getFullYear() : null; } catch { birthYear = null; }
    const ageNow = birthYear ? new Date().getFullYear() - birthYear : null;
    const pos = (player.position || "").toLowerCase();
    const posFactor = /attack|forward|winger|striker/.test(pos) ? 1.15 : /midfield/.test(pos) ? 1.0 : /defen|back/.test(pos) ? 0.9 : /goalkeeper|keeper/.test(pos) ? 0.8 : 1.0;
    const ageFactor = ageNow === null ? 1 : Math.min(1.1, Math.max(0.35, 1 - 0.07 * Math.abs(ageNow - 26)));
    const perfFactor = Math.min(1.8, Math.max(0.6, 0.6 + per90 * 0.35));
    const base = player.market_value_in_eur ?? (mins > 0 ? Math.round((ga * 1_500_000 + mins * 800)) : null);
    const estimatedFee = base === null ? null : Math.round(base * ageFactor * perfFactor * posFactor);
    const estimatedFactors = [
      { label: "مبنای ارزش بازار", text: base === null ? "نامشخص" : `€${(base / 1_000_000).toFixed(1)}M` },
      { label: "سن", text: ageNow === null ? "نامشخص" : `${ageNow} سال (ضریب ${ageFactor.toFixed(2)})` },
      { label: "عملکرد فصل", text: mins > 0 ? `${ga} گل+پاس در ${mins} دقیقه (ضریب ${perfFactor.toFixed(2)})` : "بدون دقایق ثبت‌شده" },
      { label: "پست", text: `${player.position ?? "—"} (ضریب ${posFactor})` },
    ];

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
        clubId: player.club_id,
        ourTeam: ourTeam ? { slug: ourTeam.slug, name: ourTeam.name, logo: ourTeam.logo, color: ourTeam.color } : null,
      },
      history: history.slice(-24),
      transfers,
      seasonStats,
      estimatedFee: estimatedFee === null ? null : { value: estimatedFee, factors: estimatedFactors },
    });
  } catch (e) {
    console.error("player-by-id error:", e);
    return NextResponse.json({ success: true, covered: false });
  }
}
