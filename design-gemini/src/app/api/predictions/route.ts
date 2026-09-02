import { NextResponse } from "next/server";
import { db } from "@/db";
import { predictions, matches, userProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matchId, homeScore, awayScore } = body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { success: false, error: "اطلاعات پیش‌بینی ناقص است." },
        { status: 400 }
      );
    }

    // Save prediction
    const [newPrediction] = await db
      .insert(predictions)
      .values({
        userId: "1",
        matchId,
        predictedHome: Number(homeScore),
        predictedAway: Number(awayScore),
        pointsEarned: 100,
        coinsEarned: 50,
        status: "pending",
      })
      .returning();

    // Increment prediction count on match
    await db
      .update(matches)
      .set({
        predictionsCount: sql`${matches.predictionsCount} + 1`,
      })
      .where(eq(matches.id, matchId));

    // Reward user with 50 coins and 100 XP for placing prediction
    const [updatedUser] = await db
      .update(userProfiles)
      .set({
        coins: sql`${userProfiles.coins} + 50`,
        xp: sql`${userProfiles.xp} + 100`,
        predictionsCount: sql`${userProfiles.predictionsCount} + 1`,
      })
      .where(eq(userProfiles.id, 1))
      .returning();

    return NextResponse.json({
      success: true,
      prediction: newPrediction,
      user: updatedUser,
      message: "پیش‌بینی شما با موفقیت ثبت شد! +۵۰ سکه و +۱۰۰ امتیاز دریافت کردید.",
    });
  } catch (error: any) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "خطا در ثبت پیش‌بینی" },
      { status: 500 }
    );
  }
}
