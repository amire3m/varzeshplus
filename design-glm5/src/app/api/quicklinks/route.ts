import { db } from "@/db";
import { quickLinks } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const links = await db.select().from(quickLinks).orderBy(asc(quickLinks.order));
    return NextResponse.json(links);
  } catch (error) {
    console.error("Quick links fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
