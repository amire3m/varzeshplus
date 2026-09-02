import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatMessages, userProfiles } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matchId, message, teamBadge } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { success: false, error: "متن پیام نمی‌تواند خالی باشد." },
        { status: 400 }
      );
    }

    const users = await db.select().from(userProfiles);
    const currentUser = users[0] || { username: "آرش فوتبالی", phoneMasked: "۰۹۱۲***۴۵۸۹" };

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        matchId: matchId || 1,
        username: currentUser.username,
        phoneMasked: currentUser.phoneMasked,
        message: message.trim(),
        teamBadge: teamBadge || "⚽",
        isVip: true,
        timestamp: timeStr,
      })
      .returning();

    return NextResponse.json({
      success: true,
      chatMessage: newMessage,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "خطا در ارسال پیام" },
      { status: 500 }
    );
  }
}
