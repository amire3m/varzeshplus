import { NextResponse } from "next/server";
import { db } from "@/db";
import { managerSaves, managerPlayers, managerInbox, managerMatches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { TEAMS } from "@/lib/football/leagues";
import { generateSquad, generateFixtures } from "@/lib/manager";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "وارد شوید" }, { status: 401 });
  const saves = db.select().from(managerSaves).where(eq(managerSaves.userId, user.id)).orderBy(desc(managerSaves.updatedAt)).all();
  return NextResponse.json({ success: true, saves });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "وارد شوید" }, { status: 401 });
  const { teamSlug } = await req.json().catch(() => ({}));
  if (!teamSlug) return NextResponse.json({ success: false, error: "تیم را انتخاب کنید" }, { status: 400 });
  const team = TEAMS.find((t) => t.slug === teamSlug);
  if (!team) return NextResponse.json({ success: false, error: "تیم یافت نشد" }, { status: 404 });

  const now = new Date().toISOString();
  const save = db.insert(managerSaves).values({
    userId: user.id,
    teamSlug: team.slug,
    teamName: team.name,
    season: 1,
    week: 1,
    budget: 5000000,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    createdAt: now,
    updatedAt: now,
  }).returning().all()[0];

  const squad = generateSquad(team.slug);
  for (const p of squad) {
    db.insert(managerPlayers).values({ saveId: save.id, name: p.name, position: p.position, age: p.age, rating: p.rating, value: p.value, salary: p.salary, isStarter: p.isStarter }).run();
  }
  const fixtures = generateFixtures(team.slug, team.name);
  fixtures.forEach((f, idx) => {
    db.insert(managerMatches).values({ saveId: save.id, week: idx + 1, homeTeam: f.homeTeam, awayTeam: f.awayTeam, status: "upcoming" }).run();
  });
  db.insert(managerInbox).values({ saveId: save.id, title: `به ${team.name} خوش آمدید!`, body: `شما هدایت ${team.name} را به عهده گرفتید. ترکیب را بچینید، تمرین دهید و فصل را شروع کنید. بودجه اولیه: ۵,۰۰۰,۰۰۰`, category: "news", createdAt: now }).run();
  db.insert(managerInbox).values({ saveId: save.id, title: "هفته ۱ — آماده مسابقه", body: `حریف هفته اول: ${fixtures[0].homeTeam === team.name ? fixtures[0].awayTeam : fixtures[0].homeTeam}. ترکیب را نهایی کنید.`, category: "result", createdAt: now }).run();

  return NextResponse.json({ success: true, save });
}
