import { NextResponse } from "next/server";
import { db } from "@/db";
import { fantasyTeams, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";

/**
 * فانتزی لیگ برتر — دیتای زنده FPL API رسمی (رایگان، بدون کلید)
 * قوانین: ۱۵ بازیکن، سقف £100m، ترکیب ۲-۵-۵-۳، حداکثر ۳ بازیکن از هر باشگاه
 * GET → تیم من (با امتیاز فصل) + لیدربورد
 * POST { playerIds: number[15] } → ذخیره تیم
 */

type FplPlayer = {
  id: number; web_name: string; first_name: string; second_name: string;
  team: number; element_type: number; now_cost: number; total_points: number;
  goals_scored: number; assists: number; clean_sheets: number; minutes: number;
};
type FplTeam = { id: number; name: string; short_name: string };

let bootCache: { at: number; players: Map<number, FplPlayer>; teams: Map<number, FplTeam>; gw: string } | null = null;
const BOOT_TTL = 15 * 60_000;

async function bootstrap() {
  if (bootCache && Date.now() - bootCache.at < BOOT_TTL) return bootCache;
  const d = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/", {
    headers: { "User-Agent": "VarzeshPlus/1.0" },
  }).then((r) => {
    if (!r.ok) throw new Error(`FPL ${r.status}`);
    return r.json();
  });
  const players = new Map<number, FplPlayer>();
  for (const p of d.elements ?? []) players.set(p.id, p);
  const teams = new Map<number, FplTeam>();
  for (const t of d.teams ?? []) teams.set(t.id, t);
  const cur = (d.events ?? []).find((e: any) => e.is_current);
  bootCache = { at: Date.now(), players, teams, gw: cur ? cur.name : "" };
  return bootCache;
}

const POS_FA: Record<number, string> = { 1: "دروازه‌بان", 2: "مدافع", 3: "هافبک", 4: "مهاجم" };

function enrich(p: FplPlayer, teams: Map<number, FplTeam>) {
  const t = teams.get(p.team);
  return {
    id: p.id, name: p.web_name, fullName: `${p.first_name} ${p.second_name}`.trim(),
    teamId: p.team, team: t?.short_name ?? "", teamName: t?.name ?? "",
    pos: p.element_type, posFa: POS_FA[p.element_type] ?? "",
    cost: p.now_cost / 10, points: p.total_points,
    goals: p.goals_scored, assists: p.assists, cs: p.clean_sheets, minutes: p.minutes,
  };
}

export async function GET(req: Request) {
  seedDatabase();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const pos = Number(searchParams.get("pos") || 0);
  try {
    const boot = await bootstrap();
    let mine: number[] = [];
    let myPoints = 0;
    let myValue = 0;
    let myTeam: ReturnType<typeof enrich>[] = [];
    const user = await getCurrentUser();
    if (user) {
      const row = db.select().from(fantasyTeams).where(eq(fantasyTeams.userId, user.id)).all()[0];
      if (row) {
        try { mine = JSON.parse(row.players); } catch { mine = []; }
        for (const id of mine) {
          const p = boot.players.get(id);
          if (p) {
            myPoints += p.total_points; myValue += p.now_cost / 10;
            myTeam.push(enrich(p, boot.teams));
          }
        }
      }
    }
    // جست‌وجوی بازیکن (برای picker)
    let search: ReturnType<typeof enrich>[] = [];
    if (q.length >= 2) {
      for (const p of boot.players.values()) {
        if (pos && p.element_type !== pos) continue;
        if (p.web_name.toLowerCase().includes(q) || `${p.first_name} ${p.second_name}`.toLowerCase().includes(q)) {
          search.push(enrich(p, boot.teams));
          if (search.length >= 20) break;
        }
      }
      search.sort((a, b) => b.points - a.points);
    }
    // لیدربورد
    const teams = db.select().from(fantasyTeams).all();
    const board = teams.map((t) => {
      let ids: number[] = [];
      try { ids = JSON.parse(t.players); } catch { /* ignore */ }
      let pts = 0;
      for (const id of ids) pts += boot.players.get(id)?.total_points ?? 0;
      return { userId: t.userId, points: pts, count: ids.length };
    }).filter((b) => b.count === 15).sort((a, b) => b.points - a.points).slice(0, 10);
    const withNames = await Promise.all(board.map(async (b, i) => {
      const u = db.select().from(users).where(eq(users.id, b.userId)).all()[0];
      return { rank: i + 1, name: u?.displayName || "کاربر ورزش‌پلاس", points: b.points, me: user ? b.userId === user.id : false };
    }));

    return NextResponse.json({
      success: true, authed: !!user, gw: boot.gw,
      mine, myPoints: Math.round(myPoints * 10) / 10, myValue: Math.round(myValue * 10) / 10,
      myTeam, search, leaderboard: withNames,
    });
  } catch {
    return NextResponse.json({ success: false, error: "سرویس FPL در دسترس نیست" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  seedDatabase();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "برای ذخیره تیم وارد شوید", needLogin: true }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ids: number[] = Array.isArray(body?.playerIds) ? body.playerIds.map(Number).filter((n: number) => Number.isInteger(n)) : [];
  if (ids.length !== 15 || new Set(ids).size !== 15) {
    return NextResponse.json({ success: false, error: "تیم باید دقیقاً ۱۵ بازیکن متفاوت داشته باشد" }, { status: 400 });
  }
  try {
    const boot = await bootstrap();
    const picked = ids.map((id) => boot.players.get(id)).filter(Boolean) as FplPlayer[];
    if (picked.length !== 15) return NextResponse.json({ success: false, error: "بازیکن نامعتبر است" }, { status: 400 });
    const counts = [0, 0, 0, 0, 0];
    const perClub: Record<number, number> = {};
    let cost = 0;
    for (const p of picked) {
      counts[p.element_type] = (counts[p.element_type] ?? 0) + 1;
      perClub[p.team] = (perClub[p.team] ?? 0) + 1;
      cost += p.now_cost;
    }
    if (!(counts[1] === 2 && counts[2] === 5 && counts[3] === 5 && counts[4] === 3)) {
      return NextResponse.json({ success: false, error: "ترکیب باید ۲-۵-۵-۳ باشد (دروازه‌بان-مدافع-هافبک-مهاجم)" }, { status: 400 });
    }
    if (Object.values(perClub).some((c) => c > 3)) {
      return NextResponse.json({ success: false, error: "حداکثر ۳ بازیکن از هر باشگاه" }, { status: 400 });
    }
    if (cost > 1000) {
      return NextResponse.json({ success: false, error: `سقف بودجه £100m — تیم شما £${(cost / 10).toFixed(1)}m است` }, { status: 400 });
    }
    const now = new Date().toISOString();
    const existing = db.select().from(fantasyTeams).where(eq(fantasyTeams.userId, user.id)).all()[0];
    if (existing) {
      db.update(fantasyTeams).set({ players: JSON.stringify(ids), updatedAt: now }).where(eq(fantasyTeams.id, existing.id)).run();
    } else {
      db.insert(fantasyTeams).values({ userId: user.id, players: JSON.stringify(ids), createdAt: now, updatedAt: now }).run();
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
