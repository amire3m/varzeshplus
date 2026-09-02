import { db } from "@/db";
import { scoreWeights, gameParticipations, users, userBadges, badges, games } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { nowISO, maskPhone } from "@/lib/auth";

/* موتور امتیازدهی مرکزی — مستقل از منبع بازی، متصل به شناسه کاربری مرکزی */

export function getWeightFor(gameType: string): { weight: number; maxPossibleRaw: number } {
  const row = db.select().from(scoreWeights).where(eq(scoreWeights.gameType, gameType)).limit(1).all()[0];
  return row ? { weight: row.weight, maxPossibleRaw: row.maxPossibleRaw } : { weight: 1, maxPossibleRaw: 1000 };
}

export function weightedScore(gameType: string, rawScore: number, maxRaw: number): number {
  const { weight, maxPossibleRaw } = getWeightFor(gameType);
  if (maxRaw <= 0) return 0;
  // نرمال‌سازی: نسبت عملکرد × سقف استاندارد × وزن نوع بازی
  const normalized = (rawScore / maxRaw) * maxPossibleRaw * weight;
  return Math.round(normalized * 100) / 100;
}

export const XP_PER_LEVEL = 1000;

export function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export async function recordParticipation(params: {
  userId: number;
  gameId: number;
  rawScore: number;
  maxRaw: number;
}) {
  const game = db.select().from(games).where(eq(games.id, params.gameId)).limit(1).all()[0];
  if (!game) throw new Error("game not found");
  const w = weightedScore(game.gameType, params.rawScore, params.maxRaw);

  const existing = db
    .select()
    .from(gameParticipations)
    .where(and(eq(gameParticipations.gameId, params.gameId), eq(gameParticipations.userId, params.userId)))
    .limit(1)
    .all()[0];
  if (existing) {
    // مشارکت قبلی: فقط امتیاز بهتر نگه داشته می‌شود (ضد تقلب تکرار)
    if (w > existing.weightedScore) {
      db.update(gameParticipations)
        .set({ rawScore: params.rawScore, weightedScore: w, createdAt: nowISO() })
        .where(eq(gameParticipations.id, existing.id))
        .run();
    }
    return { weighted: Math.max(w, existing.weightedScore), isNew: false };
  }

  db.insert(gameParticipations)
    .values({
      gameId: params.gameId,
      userId: params.userId,
      rawScore: params.rawScore,
      weightedScore: w,
      createdAt: nowISO(),
    })
    .run();

  // به‌روزرسانی کاربر: امتیاز + XP + سکه (سکه = ۱۰٪ امتیاز)
  db.update(users)
    .set({
      points: sql`${users.points} + ${Math.round(w)}`,
      xp: sql`${users.xp} + ${Math.round(w * 0.5)}`,
      coins: sql`${users.coins} + ${Math.max(1, Math.round(w * 0.1))}`,
    })
    .where(eq(users.id, params.userId))
    .run();

  const user = db.select().from(users).where(eq(users.id, params.userId)).limit(1).all()[0];
  if (user) {
    const newLevel = levelFromXp(user.xp);
    if (newLevel !== user.level) {
      db.update(users).set({ level: newLevel }).where(eq(users.id, user.id)).run();
    }
  }

  await maybeAwardBadges(params.userId);
  return { weighted: w, isNew: true };
}

async function maybeAwardBadges(userId: number) {
  const rows = db.select().from(gameParticipations).where(eq(gameParticipations.userId, userId)).all();
  const totalGames = rows.length;
  const totalScore = db.select().from(users).where(eq(users.id, userId)).limit(1).all()[0]?.points ?? 0;

  const allBadges = db.select().from(badges).all();
  const owned = new Set(
    db.select({ badgeId: userBadges.badgeId }).from(userBadges).where(eq(userBadges.userId, userId)).all().map((r) => r.badgeId)
  );

  const conditions: Record<string, boolean> = {
    first_game: totalGames >= 1,
    five_games: totalGames >= 5,
    twenty_games: totalGames >= 20,
    score_1000: totalScore >= 1000,
    score_5000: totalScore >= 5000,
  };

  for (const badge of allBadges) {
    if (!owned.has(badge.id) && conditions[badge.code]) {
      db.insert(userBadges).values({ userId, badgeId: badge.id, awardedAt: nowISO() }).run();
    }
  }
}

/* لیدربورد یکپارچه — محاسبه از داده واقعی مشارکت‌ها */
export type LeaderboardPeriod = "weekly" | "monthly" | "season";

function periodStart(period: LeaderboardPeriod): string {
  const now = new Date();
  const d = new Date(now);
  if (period === "weekly") d.setDate(now.getDate() - 7);
  else if (period === "monthly") d.setMonth(now.getMonth() - 1);
  else d.setDate(now.getDate() - 90); // فصل = ۹۰ روز
  return d.toISOString();
}

export function getLeaderboard(period: LeaderboardPeriod, limit = 20, currentUserId?: number) {
  const since = periodStart(period);
  const rows = db
    .select({
      userId: users.id,
      displayName: users.displayName,
      phone: users.phone,
      avatar: users.avatar,
      level: users.level,
      score: sql<number>`COALESCE(SUM(${gameParticipations.weightedScore}), 0)`,
      gamesCount: sql<number>`COUNT(${gameParticipations.id})`,
    })
    .from(gameParticipations)
    .innerJoin(users, eq(users.id, gameParticipations.userId))
    .where(gte(gameParticipations.createdAt, since))
    .groupBy(users.id)
    .orderBy(sql`SUM(${gameParticipations.weightedScore}) DESC`)
    .limit(limit)
    .all();

  const entries = rows.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    displayName: r.displayName ?? maskPhone(r.phone),
    phoneMasked: maskPhone(r.phone),
    avatar: r.avatar,
    level: r.level,
    score: Math.round(r.score),
    gamesCount: r.gamesCount,
    isMe: currentUserId === r.userId,
  }));

  let me: (typeof entries)[number] | null = entries.find((e) => e.isMe) ?? null;
  if (!me && currentUserId) {
    const myTotal = db
      .select({ score: sql<number>`COALESCE(SUM(${gameParticipations.weightedScore}), 0)` })
      .from(gameParticipations)
      .where(and(eq(gameParticipations.userId, currentUserId), gte(gameParticipations.createdAt, since)))
      .all()[0];
    if (myTotal && myTotal.score > 0) {
      me = { rank: 0, userId: currentUserId, displayName: "شما", phoneMasked: "", avatar: null, level: 1, score: Math.round(myTotal.score), gamesCount: 0, isMe: true };
    }
  }
  return { period, entries, me };
}
