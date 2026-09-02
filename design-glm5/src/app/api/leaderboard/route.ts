import { db } from "@/db";
import { leaderboard } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const board = await db.select().from(leaderboard).orderBy(asc(leaderboard.rank));
    return NextResponse.json(board);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
