import { NextResponse } from "next/server";
import { db } from "@/db";
import { scorePredictions, users } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";

/**
 * پیش‌بینی نتیجه بازی‌های واقعی — ۳ امتیاز نتیجه دقیق، ۱ امتیاز سمت درست
 * GET → پیش‌بینی‌های من (با امتیاز زنده) + لیدربورد
 * POST { fixtureKey, league, home, away, date, predHome, predAway } → ثبت/ویرایش (قبل از شروع)
 */

type ResultMap = Record<string, { home: number; away: number }>;

async function fetchResults(): Promise<ResultMap> {
  const map: ResultMap = {};
  for (const lg of ["eng.1", "esp.1"]) {
    try {
      const res = await fetch(`https://worldcup26.ir/get/soccer/${lg}/fixtures?pageSize=100`, {
        headers: { "User-Agent": "VarzeshPlus/1.0" },
      }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      const events = res?.events ?? [];
      for (const e of events) {
        const comp = e?.competitions?.[0];
        if (!comp) continue;
        if (comp.status?.type?.state !== "post") continue;
        const h = comp.competitors?.find((c: any) => c.homeAway === "home");
        const a = comp.competitors?.find((c: any) => c.homeAway === "away");
        if (h?.score === undefined || a?.score === undefined || h.score === "" || a.score === "") continue;
        map[`${lg === "eng.1" ? "premier-league" : "la-liga"}:${e.id}`] = { home: Number(h.score), away: Number(a.score) };
      }
    } catch { /* ignore league */ }
  }
  return map;
}

function calcPoints(ph: number, pa: number, rh: number, ra: number): number {
  if (ph === rh && pa === ra) return 3;
  const po = Math.sign(ph - pa);
  const ro = Math.sign(rh - ra);
  return po === ro ? 1 : 0;
}

export async function GET() {
  seedDatabase();
  const user = await getCurrentUser();
  const results = await fetchResults();

  let mine: any[] = [];
  let myTotal = 0;
  if (user) {
    const rows = db.select().from(scorePredictions).where(eq(scorePredictions.userId, user.id)).orderBy(desc(scorePredictions.createdAt)).limit(100).all();
    mine = rows.map((p) => {
      const r = results[`${p.league}:${p.fixtureKey}`] ?? results[p.fixtureKey];
      const settled = !!r;
      const points = settled ? calcPoints(p.predHome, p.predAway, r.home, r.away) : p.points;
      return {
        fixtureKey: p.fixtureKey, league: p.league, home: p.home, away: p.away,
        date: p.matchDate, predHome: p.predHome, predAway: p.predAway,
        actual: settled ? r : null, points: settled ? points : null, pending: !settled,
      };
    });
    // به‌روزرسانی امتیازهای قطعی‌شده
    for (const m of mine) {
      if (m.actual) {
        const row = rows.find((r) => r.fixtureKey === m.fixtureKey);
        if (row && row.points !== m.points) {
          db.update(scorePredictions).set({ points: m.points }).where(eq(scorePredictions.id, row.id)).run();
        }
      }
    }
    myTotal = mine.reduce((s, m) => s + (m.points ?? 0), 0);
  }

  const board = db.select({
    userId: scorePredictions.userId,
    name: users.displayName,
    total: sql<number>`SUM(${scorePredictions.points})`,
    count: sql<number>`COUNT(*)`,
  })
    .from(scorePredictions)
    .innerJoin(users, eq(users.id, scorePredictions.userId))
    .groupBy(scorePredictions.userId)
    .orderBy(desc(sql`SUM(${scorePredictions.points})`))
    .limit(10)
    .all();

  return NextResponse.json({
    success: true,
    authed: !!user,
    mine,
    myTotal,
    leaderboard: board.map((b, i) => ({ rank: i + 1, name: b.name || "کاربر ورزش‌پلاس", total: b.total ?? 0, count: b.count ?? 0, me: user ? b.userId === user.id : false })),
  });
}

export async function POST(req: Request) {
  seedDatabase();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "برای ثبت پیش‌بینی وارد شوید", needLogin: true }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { fixtureKey, league, home, away, date, predHome, predAway } = body ?? {};
  const ph = Number(predHome);
  const pa = Number(predAway);
  if (!fixtureKey || !league || !home || !away || !Number.isInteger(ph) || !Number.isInteger(pa) || ph < 0 || pa < 0 || ph > 20 || pa > 20) {
    return NextResponse.json({ success: false, error: "ورودی نامعتبر است" }, { status: 400 });
  }
  if (!["premier-league", "la-liga"].includes(league)) {
    return NextResponse.json({ success: false, error: "لیگ نامعتبر است" }, { status: 400 });
  }
  if (date) {
    const t = new Date(date).getTime();
    if (!Number.isNaN(t) && t <= Date.now()) {
      return NextResponse.json({ success: false, error: "مهلت پیش‌بینی این بازی تمام شده" }, { status: 400 });
    }
  }
  const key = String(fixtureKey);
  const existing = db.select().from(scorePredictions)
    .where(and(eq(scorePredictions.userId, user.id), eq(scorePredictions.fixtureKey, key)))
    .all()[0];
  if (existing) {
    db.update(scorePredictions).set({ predHome: ph, predAway: pa }).where(eq(scorePredictions.id, existing.id)).run();
  } else {
    db.insert(scorePredictions).values({
      userId: user.id, fixtureKey: key, league, home: String(home).slice(0, 80), away: String(away).slice(0, 80),
      matchDate: date ? String(date) : null, predHome: ph, predAway: pa, points: 0,
      createdAt: new Date().toISOString(),
    }).run();
  }
  return NextResponse.json({ success: true });
}
