import { NextResponse } from "next/server";
import { db } from "@/db";
import { quizzes, userProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId, selectedOption } = body;

    const quizList = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (quizList.length === 0) {
      return NextResponse.json(
        { success: false, error: "کوییز یافت نشد." },
        { status: 404 }
      );
    }

    const quiz = quizList[0];
    const isCorrect = quiz.correctOption === selectedOption;

    if (isCorrect) {
      const [updatedUser] = await db
        .update(userProfiles)
        .set({
          coins: sql`${userProfiles.coins} + ${quiz.coinReward}`,
          xp: sql`${userProfiles.xp} + ${quiz.xpReward}`,
        })
        .where(eq(userProfiles.id, 1))
        .returning();

      return NextResponse.json({
        success: true,
        isCorrect: true,
        coinReward: quiz.coinReward,
        xpReward: quiz.xpReward,
        user: updatedUser,
        message: `پاسخ صحیح بود! +${quiz.coinReward} سکه و +${quiz.xpReward} XP جایزه گرفتید.`,
      });
    } else {
      return NextResponse.json({
        success: true,
        isCorrect: false,
        correctOption: quiz.correctOption,
        message: "پاسخ نادرست بود. دوباره تلاش کنید!",
      });
    }
  } catch (error: any) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "خطا در ارزیابی پاسخ" },
      { status: 500 }
    );
  }
}
