import { NextResponse } from "next/server";
import { db } from "@/db";
import { managerSaves, managerPlayers, managerInbox, managerMatches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { simulateMatch, inboxTitleForResult } from "@/lib/manager";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "وارد شوید" }, { status: 401 });
  const { id } = await params;
  const save = db.select().from(managerSaves).where(eq(managerSaves.id, Number(id))).all()[0];
  if (!save || save.userId !== user.id) return NextResponse.json({ success: false, error: "یافت نشد" }, { status: 404 });
  const players = db.select().from(managerPlayers).where(eq(managerPlayers.saveId, save.id)).all();
  const inbox = db.select().from(managerInbox).where(eq(managerInbox.saveId, save.id)).all().sort((a, b) => b.id - a.id);
  const matches = db.select().from(managerMatches).where(eq(managerMatches.saveId, save.id)).all().sort((a, b) => a.week - b.week);
  const nextMatch = matches.find((m) => m.status === "upcoming");
  return NextResponse.json({ success: true, save, players, inbox, matches, nextMatch });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "وارد شوید" }, { status: 401 });
  const { id } = await params;
  const saveId = Number(id);
  const save = db.select().from(managerSaves).where(eq(managerSaves.id, saveId)).all()[0];
  if (!save || save.userId !== user.id) return NextResponse.json({ success: false, error: "یافت نشد" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === "toggleStarter") {
    const { playerId } = body;
    const p = db.select().from(managerPlayers).where(eq(managerPlayers.id, Number(playerId))).all()[0];
    if (!p || p.saveId !== saveId) return NextResponse.json({ success: false }, { status: 400 });
    const starters = db.select().from(managerPlayers).where(and(eq(managerPlayers.saveId, saveId), eq(managerPlayers.isStarter, true))).all();
    if (!p.isStarter && starters.length >= 11) return NextResponse.json({ success: false, error: "حداکثر ۱۱ بازیکن اصلی" }, { status: 400 });
    db.update(managerPlayers).set({ isStarter: !p.isStarter }).where(eq(managerPlayers.id, p.id)).run();
    return NextResponse.json({ success: true });
  }
  if (action === "train") {
    const { playerId } = body;
    const p = db.select().from(managerPlayers).where(eq(managerPlayers.id, Number(playerId))).all()[0];
    if (!p || p.saveId !== saveId) return NextResponse.json({ success: false }, { status: 400 });
    if (p.rating >= 90) return NextResponse.json({ success: false, error: "سقف امتیاز" }, { status: 400 });
    if (save.budget < 50000) return NextResponse.json({ success: false, error: "بودجه ناکافی (۵۰,۰۰۰)" }, { status: 400 });
    db.update(managerPlayers).set({ rating: Math.min(90, p.rating + 1) }).where(eq(managerPlayers.id, p.id)).run();
    db.update(managerSaves).set({ budget: save.budget - 50000, updatedAt: new Date().toISOString() }).where(eq(managerSaves.id, saveId)).run();
    db.insert(managerInbox).values({ saveId, title: "تمرین انجام شد", body: `${p.name} یک امتیاز پیشرفت کرد (${p.rating} → ${Math.min(90, p.rating + 1)})`, category: "training", createdAt: new Date().toISOString() }).run();
    return NextResponse.json({ success: true });
  }
  if (action === "simulate") {
    const nextMatch = db.select().from(managerMatches).where(and(eq(managerMatches.saveId, saveId), eq(managerMatches.status, "upcoming"))).all().sort((a, b) => a.week - b.week)[0];
    if (!nextMatch) return NextResponse.json({ success: false, error: "بازی‌ای باقی نمانده" }, { status: 400 });
    const starters = db.select().from(managerPlayers).where(and(eq(managerPlayers.saveId, saveId), eq(managerPlayers.isStarter, true))).all();
    if (starters.length !== 11) return NextResponse.json({ success: false, error: "۱۱ بازیکن اصلی را انتخاب کنید" }, { status: 400 });
    const myRating = Math.round(starters.reduce((s, p) => s + p.rating, 0) / 11);
    const oppRating = 70 + Math.floor(Math.random() * 12); // 70-82
    const { myGoals, oppGoals, events, result } = simulateMatch(myRating, oppRating);
    const isHome = nextMatch.homeTeam === save.teamName;
    const homeScore = isHome ? myGoals : oppGoals;
    const awayScore = isHome ? oppGoals : myGoals;
    db.update(managerMatches).set({ homeScore, awayScore, events: JSON.stringify(events), status: "played" }).where(eq(managerMatches.id, nextMatch.id)).run();
    const oppName = isHome ? nextMatch.awayTeam : nextMatch.homeTeam;
    let points = save.points, wins = save.wins, draws = save.draws, losses = save.losses;
    if (result === "win") { points += 3; wins += 1; }
    else if (result === "draw") { points += 1; draws += 1; }
    else losses += 1;
    db.update(managerSaves).set({
      week: save.week + 1,
      points, wins, draws, losses,
      goalsFor: save.goalsFor + myGoals,
      goalsAgainst: save.goalsAgainst + oppGoals,
      updatedAt: new Date().toISOString(),
    }).where(eq(managerSaves.id, saveId)).run();
    const inboxTitle = inboxTitleForResult(result, oppName);
    const inboxBody = `هفته ${save.week}: ${nextMatch.homeTeam} ${homeScore} - ${awayScore} ${nextMatch.awayTeam}\n${events.join("\n")}`;
    db.insert(managerInbox).values({ saveId, title: inboxTitle, body: inboxBody, category: "result", createdAt: new Date().toISOString() }).run();
    return NextResponse.json({ success: true, result: { homeScore, awayScore, events, result, oppName } });
  }
  if (action === "markRead") {
    db.update(managerInbox).set({ isRead: true }).where(eq(managerInbox.saveId, saveId)).run();
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: "action نامعتبر" }, { status: 400 });
}
