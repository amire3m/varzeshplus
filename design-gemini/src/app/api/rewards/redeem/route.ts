import { NextResponse } from "next/server";
import { db } from "@/db";
import { rewards, userProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rewardId } = body;

    const rewardList = await db.select().from(rewards).where(eq(rewards.id, rewardId));
    if (rewardList.length === 0) {
      return NextResponse.json({ success: false, error: "جایزه یافت نشد." }, { status: 404 });
    }

    const reward = rewardList[0];

    if (reward.stock <= 0) {
      return NextResponse.json(
        { success: false, error: "موجودی این جایزه به پایان رسیده است." },
        { status: 400 }
      );
    }

    const userList = await db.select().from(userProfiles).where(eq(userProfiles.id, 1));
    const user = userList[0];

    if ((user?.coins || 0) < reward.coinCost) {
      return NextResponse.json(
        {
          success: false,
          error: `موجودی سکه شما کافی نیست! شما به ${reward.coinCost - (user?.coins || 0)} سکه دیگر نیاز دارید.`,
        },
        { status: 400 }
      );
    }

    // Deduct coins and update stock
    const [updatedUser] = await db
      .update(userProfiles)
      .set({
        coins: sql`${userProfiles.coins} - ${reward.coinCost}`,
      })
      .where(eq(userProfiles.id, 1))
      .returning();

    await db
      .update(rewards)
      .set({
        stock: sql`${rewards.stock} - 1`,
      })
      .where(eq(rewards.id, rewardId));

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `جایزه «${reward.title}» با موفقیت دریافت شد! کد پیگیری و جزئیات ارسال به شماره شما پیامک شد.`,
    });
  } catch (error: any) {
    console.error("Redeem API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "خطا در دریافت جایزه" },
      { status: 500 }
    );
  }
}
