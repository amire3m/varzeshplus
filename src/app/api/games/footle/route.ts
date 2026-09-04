import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

/**
 * Footle — حدس بازیکن مرموز روزانه (دیتای واقعی tm_players)
 * GET ?q=... → پیشنهاد نام (autocomplete)
 * POST { name } → ارزیابی حدس در برابر جواب امروز
 * POST { reveal: true } → نمایش جواب (پایان بازی)
 */

const COMPS = ["GB1", "ES1", "IT1", "L1", "FR1", "NL1", "PO1", "TR1", "SA1", "BRA1", "MLS1"];

function getDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  return g.__tmDb;
}

function daySeed(): number {
  const d = new Date();
  const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

function candidates(db: Database.Database) {
  const ph = COMPS.map(() => "?").join(",");
  return db.prepare(
    `SELECT p.player_id AS id, p.pretty_name AS name, p.position, p.date_of_birth AS dob,
            p.country_of_citizenship AS nat, p.market_value_in_eur AS mv,
            c.club_id AS clubId, c.name AS club
     FROM tm_players p JOIN tm_clubs c ON c.club_id = p.club_id
     WHERE c.competition_id IN (${ph}) AND p.market_value_in_eur >= 10000000
     ORDER BY p.player_id`
  ).all(...COMPS) as any[];
}

function ageOf(dob: string | null): number | null {
  if (!dob) return null;
  const b = new Date(dob).getTime();
  if (Number.isNaN(b)) return null;
  return Math.floor((Date.now() - b) / (365.25 * 86400_000));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ success: true, items: [] });
  try {
    const db = getDb();
    const ph = COMPS.map(() => "?").join(",");
    const rows = db.prepare(
      `SELECT p.player_id AS id, p.pretty_name AS name, c.name AS club
       FROM tm_players p JOIN tm_clubs c ON c.club_id = p.club_id
       WHERE c.competition_id IN (${ph}) AND lower(p.pretty_name) LIKE ?
       ORDER BY p.market_value_in_eur DESC LIMIT 12`
    ).all(...COMPS, `%${q.toLowerCase()}%`);
    return NextResponse.json({ success: true, items: rows });
  } catch (e) {
    return NextResponse.json({ success: false, items: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const db = getDb();
    const pool = candidates(db);
    if (!pool.length) return NextResponse.json({ success: false, error: "دیتا آماده نیست" }, { status: 503 });
    const answer = pool[daySeed() % pool.length];

    if (body?.reveal) {
      return NextResponse.json({
        success: true,
        answer: { id: answer.id, name: answer.name, club: answer.club, position: answer.position },
      });
    }

    const name = String(body?.name || "").trim().toLowerCase();
    if (!name) return NextResponse.json({ success: false, error: "نام بازیکن لازم است" }, { status: 400 });
    const ph = COMPS.map(() => "?").join(",");
    const guess = db.prepare(
      `SELECT p.player_id AS id, p.pretty_name AS name, p.position, p.date_of_birth AS dob,
              p.country_of_citizenship AS nat, p.market_value_in_eur AS mv,
              c.club_id AS clubId, c.name AS club
       FROM tm_players p JOIN tm_clubs c ON c.club_id = p.club_id
       WHERE c.competition_id IN (${ph}) AND lower(p.pretty_name) = ? LIMIT 1`
    ).get(...COMPS, name) as any;
    if (!guess) return NextResponse.json({ success: false, error: "بازیکن پیدا نشد — از پیشنهادها انتخاب کن" }, { status: 404 });

    const gAge = ageOf(guess.dob);
    const aAge = ageOf(answer.dob);
    const correct = guess.id === answer.id;
    return NextResponse.json({
      success: true,
      correct,
      playerId: guess.id,
      feedback: {
        name: guess.name,
        club: guess.club,
        clubMatch: guess.clubId === answer.clubId,
        position: guess.position,
        positionMatch: guess.position === answer.position,
        age: gAge,
        ageDir: gAge === null || aAge === null ? "unknown" : gAge === aAge ? "match" : gAge > aAge ? "down" : "up",
        nat: guess.nat,
        natMatch: !!guess.nat && guess.nat === answer.nat,
        mv: guess.mv,
        mvDir: guess.mv == null || answer.mv == null ? "unknown" : guess.mv === answer.mv ? "match" : guess.mv > answer.mv ? "down" : "up",
      },
      ...(correct ? { answer: { id: answer.id, name: answer.name, club: answer.club } } : {}),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
