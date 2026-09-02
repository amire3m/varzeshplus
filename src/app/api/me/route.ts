import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, gameParticipations, games, userBadges, badges } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, maskPhone } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  seedDatabase();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "وارد نشده‌اید" }, { status: 401 });

  const history = db
    .select({
      gameId: games.id, gameTitle: games.title, gameType: games.gameType,
      score: gameParticipations.weightedScore, at: gameParticipations.createdAt,
    })
    .from(gameParticipations)
    .innerJoin(games, eq(games.id, gameParticipations.gameId))
    .where(eq(gameParticipations.userId, user.id))
    .orderBy(desc(gameParticipations.createdAt))
    .limit(50)
    .all();

  const myBadges = db
    .select({ code: badges.code, title: badges.title, description: badges.description, color: badges.color, icon: badges.icon, awardedAt: userBadges.awardedAt })
    .from(userBadges)
    .innerJoin(badges, eq(badges.id, userBadges.badgeId))
    .where(eq(userBadges.userId, user.id))
    .all();

  const allBadges = db.select().from(badges).all();
  const ownedCodes = new Set(myBadges.map((b) => b.code));

  return NextResponse.json({
    success: true,
    user: {
      id: user.id, displayName: user.displayName, phoneMasked: maskPhone(user.phone),
      points: user.points, coins: user.coins, xp: user.xp, level: user.level,
      createdAt: user.createdAt,
    },
    history,
    badges: myBadges,
    lockedBadges: allBadges.filter((b) => !ownedCodes.has(b.code)).map((b) => ({ code: b.code, title: b.title, description: b.description, color: b.color })),
  });
}
