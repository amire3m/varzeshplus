import { NextResponse } from "next/server";
import { db } from "@/db";
import { programs, games, sportEvents } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

/* صفحه برنامه: اطلاعات برنامه + بازی‌های منتشرشده آن + رویداد داغ مرتبط */

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  seedDatabase();
  const { slug } = await ctx.params;
  const program = db.select().from(programs).where(eq(programs.slug, slug)).limit(1).all()[0];
  if (!program) return NextResponse.json({ success: false, error: "برنامه یافت نشد" }, { status: 404 });

  const now = new Date().toISOString();
  const programGames = db
    .select({
      id: games.id, title: games.title, description: games.description,
      gameType: games.gameType, prize: games.prize, startsAt: games.startsAt, endsAt: games.endsAt,
    })
    .from(games)
    .where(and(eq(games.programId, program.id), eq(games.status, "published")))
    .all()
    .filter((g) => (!g.startsAt || g.startsAt <= now) && (!g.endsAt || g.endsAt > now));

  const hotEvent = db.select().from(sportEvents).where(or(eq(sportEvents.status, "live"), eq(sportEvents.isHot, true))).limit(1).all()[0] ?? null;

  return NextResponse.json({
    success: true,
    program: {
      id: program.id, title: program.title, slug: program.slug,
      description: program.description, onAirDay: program.onAirDay, onAirTime: program.onAirTime,
    },
    games: programGames,
    hotEvent,
  });
}
