import { NextResponse } from "next/server";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST() {
  try {
    const userList = await db.select().from(userProfiles).where(eq(userProfiles.id, 1));
    if (userList.length === 0) {
      return NextResponse.json({ success: false, error: "کاربر یافت نشد." }, { status: 404 });
    }

    const user = userList[0];
    if (user.dailyBonusClaimed) {
      return NextResponse.json(
        { success: false, error: "شما پاداش امروز را قبلاً دریافت کرده‌اید. فردا دوباره سر بزنید!" },
        { status: 400 }
      );
    }

    const bonusCoins = 300;
    const bonusXp = 200;

    const [updatedUser] = await db
      .update(userProfiles)
      .set({
        coins: sql`${userProfiles.coins} + ${bonusCoins}`,
        xp: sql`${userProfiles.xp} + ${bonusXp}`,
        dailyBonusClaimed: true,
      })
      .where(eq(userProfiles.id, 1))
      .returning();

    return NextResponse.json({
      success: true,
      bonusCoins,
      bonusXp,
      user: updatedUser,
      message: `پاداش روزانه با موفقیت دریافت شد! +${bonusCoins} سکه و +${bonusXp} XP به کیف پول شما اضافه شد.`,
    });
  } catch (error: any) {
    console.error("Daily bonus error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "خطا در دریافت پاداش" },
      { status: 500 }
    );
  }
}
