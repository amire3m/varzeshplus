import { db } from "@/db";
import { games } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allGames = await db.select().from(games);
    return NextResponse.json(allGames);
  } catch (error) {
    console.error("Games fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
