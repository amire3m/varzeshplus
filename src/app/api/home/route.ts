import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, gameQuestions, programs, sportEvents, news, liveEvents } from "@/db/schema";
import { eq, and, or, gt, lt, desc, sql } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";
import { getCurrentUser } from "@/lib/auth";

/* داده صفحه اصلی: بازی‌های فعال + مسابقات پیش رو + پخش زنده + اخبار */

export async function GET() {
  seedDatabase();
  const now = new Date().toISOString();

  const activeGames = db
    .select({
      id: games.id, title: games.title, description: games.description,
      gameType: games.gameType, prize: games.prize,
      startsAt: games.startsAt, endsAt: games.endsAt,
      programTitle: programs.title,
      programSlug: programs.slug,
      participants: sql<number>`(SELECT COUNT(*) FROM game_participations gp WHERE gp.game_id = ${games.id})`,
    })
    .from(games)
    .leftJoin(programs, eq(programs.id, games.programId))
    .where(eq(games.status, "published"))
    .all()
    .filter((g) => {
      const started = !g.startsAt || g.startsAt <= now;
      const notEnded = !g.endsAt || g.endsAt > now;
      return started && notEnded;
    })
    .map((g) => ({
      ...g,
      participants: Number(g.participants),
      endsIn: g.endsAt ? Math.max(0, new Date(g.endsAt).getTime() - Date.now()) : null,
    }));

  const upcomingEvents = db
    .select()
    .from(sportEvents)
    .where(or(eq(sportEvents.status, "upcoming"), eq(sportEvents.status, "live")))
    .orderBy(sportEvents.startTime)
    .limit(8)
    .all();

  const latestNews = db
    .select({ id: news.id, title: news.title, summary: news.summary, isBreaking: news.isBreaking, publishedAt: news.publishedAt, category: news.category })
    .from(news)
    .where(eq(news.status, "published"))
    .orderBy(desc(news.publishedAt))
    .limit(6)
    .all();

  const live = db.select().from(liveEvents).orderBy(desc(liveEvents.startedAt)).limit(1).all()[0] ?? null;

  const user = await getCurrentUser();

  return NextResponse.json({
    success: true,
    games: activeGames,
    events: upcomingEvents,
    news: latestNews,
    live: live ? { id: live.id, title: live.title, status: live.status, commentatorActive: live.commentatorActive } : null,
    user: user ? { id: user.id, displayName: user.displayName, points: user.points, coins: user.coins, level: user.level } : null,
  });
}
