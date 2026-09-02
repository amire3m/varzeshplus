import { db } from "@/db";
import { matches } from "@/db/schema";
import { desc, asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allMatches = await db
      .select()
      .from(matches)
      .orderBy(asc(sql`CASE status WHEN 'live' THEN 0 WHEN 'upcoming' THEN 1 ELSE 2 END`), asc(matches.kickoff));
    return NextResponse.json(allMatches);
  } catch (error) {
    console.error("Matches fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
