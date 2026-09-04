import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import mapping from "@/lib/football/tm-teams.json";

/**
 * احتمالات مسابقه — Dixon-Coles-lite روی نتایج واقعی tm_games
 * ?homeSlug=&awaySlug=&league=  یا  ?homeTmId=&awayTmId=&comp=
 * خروجی: برد/مساوی/باخت + گل موردانتظار + محتمل‌ترین نتیجه + توضیح «چرا»
 */

const COMP_BY_SLUG: Record<string, string> = {
  "premier-league": "GB1", "la-liga": "ES1", "serie-a": "IT1", "bundesliga": "L1",
  "ligue-1": "FR1", "eredivisie": "NL1", "primeira-liga": "PO1", "super-lig": "TR1",
  "saudi-pro-league": "SA1", "brasileirao": "BRA1", "mls": "MLS1",
};

type MappingFile = Record<string, Record<string, number>>;
const MAP = mapping as unknown as MappingFile;
const slugToTm = new Map<string, number>();
for (const teams of Object.values(MAP)) {
  for (const [slug, tmId] of Object.entries(teams)) slugToTm.set(slug, tmId);
}

function getDb(): Database.Database {
  const g = globalThis as typeof globalThis & { __tmDb?: Database.Database };
  if (!g.__tmDb) g.__tmDb = new Database(path.join(process.cwd(), "local.db"), { readonly: true });
  return g.__tmDb;
}

function poisson(lam: number, k: number): number {
  let p = Math.exp(-lam);
  for (let i = 1; i <= k; i++) p *= lam / i;
  return p;
}

// کش فیت هر لیگ (دیتاست استاتیک است)
const fitCache = new Map<string, any>();

function fitLeague(db: Database.Database, comp: string) {
  const hit = fitCache.get(comp);
  if (hit) return hit;
  // ۳ فصل اخیر، فقط بازی‌های تمام‌شده با نتیجه
  const rows = db.prepare(
    `SELECT g.home_club_id AS h, g.away_club_id AS a, c1.own_goals AS hg, c2.own_goals AS ag
     FROM tm_games g
     JOIN tm_club_games c1 ON c1.game_id = g.game_id AND c1.club_id = g.home_club_id
     JOIN tm_club_games c2 ON c2.game_id = g.game_id AND c2.club_id = g.away_club_id
     WHERE g.competition_id = ? AND g.season >= 2023
       AND c1.own_goals IS NOT NULL AND c2.own_goals IS NOT NULL`
  ).all(comp) as Array<{ h: number; a: number; hg: number; ag: number }>;

  const t: Record<number, { hp: number; hgf: number; hga: number; ap: number; agf: number; aga: number }> = {};
  let totHg = 0, totAg = 0;
  for (const r of rows) {
    totHg += r.hg; totAg += r.ag;
    const H = (t[r.h] ??= { hp: 0, hgf: 0, hga: 0, ap: 0, agf: 0, aga: 0 });
    H.hp++; H.hgf += r.hg; H.hga += r.ag;
    const A = (t[r.a] ??= { hp: 0, hgf: 0, hga: 0, ap: 0, agf: 0, aga: 0 });
    A.ap++; A.agf += r.ag; A.aga += r.hg;
  }
  const n = Math.max(1, rows.length);
  const fit = { teams: t, avgH: totHg / n, avgA: totAg / n, sample: rows.length };
  fitCache.set(comp, fit);
  return fit;
}

function strength(played: number, gf: number, ga: number, avgGF: number, avgGA: number) {
  // shrinkage به سمت ۱ برای نمونه‌های کوچک
  const w = played / (played + 8);
  return {
    atk: 1 + w * (gf / Math.max(1, played) / Math.max(0.01, avgGF) - 1),
    def: 1 + w * (ga / Math.max(1, played) / Math.max(0.01, avgGA) - 1),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let homeTm = Number(searchParams.get("homeTmId"));
  let awayTm = Number(searchParams.get("awayTmId"));
  let comp = searchParams.get("comp") || "";
  const league = searchParams.get("league") || "";
  const homeSlug = searchParams.get("homeSlug") || "";
  const awaySlug = searchParams.get("awaySlug") || "";

  if ((!homeTm || !awayTm || !comp) && league && homeSlug && awaySlug) {
    comp = COMP_BY_SLUG[league] ?? "";
    homeTm = slugToTm.get(homeSlug) ?? 0;
    awayTm = slugToTm.get(awaySlug) ?? 0;
  }
  if (!homeTm || !awayTm || !comp) {
    return NextResponse.json({ success: false, error: "شناسه تیم‌ها یا لیگ لازم است" }, { status: 400 });
  }

  try {
    const db = getDb();
    const fit = fitLeague(db, comp);
    if (fit.sample < 50) return NextResponse.json({ success: true, covered: false });

    const H = fit.teams[homeTm] ?? { hp: 0, hgf: 0, hga: 0, ap: 0, agf: 0, aga: 0 };
    const A = fit.teams[awayTm] ?? { hp: 0, hgf: 0, hga: 0, ap: 0, agf: 0, aga: 0 };
    const sH = strength(H.hp, H.hgf, H.hga, fit.avgH, fit.avgA);
    const sA = strength(A.ap, A.agf, A.aga, fit.avgA, fit.avgH);

    const xH = Math.min(6, Math.max(0.05, sH.atk * sA.def * fit.avgH));
    const xA = Math.min(6, Math.max(0.05, sA.atk * sH.def * fit.avgA));

    let pH = 0, pD = 0, pA = 0;
    let best = { h: 0, a: 0, p: 0 };
    for (let h = 0; h <= 8; h++) {
      for (let a = 0; a <= 8; a++) {
        const p = poisson(xH, h) * poisson(xA, a);
        if (h > a) pH += p; else if (h === a) pD += p; else pA += p;
        if (p > best.p) best = { h, a, p };
      }
    }
    const tot = pH + pD + pA || 1;

    const pct = (v: number) => Math.round((v / tot) * 100);
    return NextResponse.json({
      success: true,
      covered: true,
      home: pct(pH), draw: pct(pD), away: pct(pA),
      xgHome: +xH.toFixed(2), xgAway: +xA.toFixed(2),
      likely: `${best.h}-${best.a}`,
      sample: fit.sample,
      why: [
        { label: "قدرت هجومی میزبان", value: +sH.atk.toFixed(2) },
        { label: "قدرت دفاعی میهمان", value: +sA.def.toFixed(2) },
        { label: "قدرت هجومی میهمان", value: +sA.atk.toFixed(2) },
        { label: "قدرت دفاعی میزبان", value: +sH.def.toFixed(2) },
      ],
    });
  } catch {
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
