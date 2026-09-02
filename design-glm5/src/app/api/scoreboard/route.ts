import { db } from "@/db";
import { scoreboard } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const scores = await db.select().from(scoreboard);
    return NextResponse.json(scores);
  } catch (error) {
    console.error("Scoreboard fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
