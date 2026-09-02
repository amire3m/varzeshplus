import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/score";
import { getCurrentUser } from "@/lib/auth";
import { seedDatabase } from "@/db/seed";

export async function GET(req: Request) {
  seedDatabase();
  const url = new URL(req.url);
  const period = (url.searchParams.get("period") ?? "weekly") as "weekly" | "monthly" | "season";
  if (!["weekly", "monthly", "season"].includes(period)) {
    return NextResponse.json({ success: false, error: "period نامعتبر" }, { status: 400 });
  }
  const user = await getCurrentUser();
  const data = getLeaderboard(period, 20, user?.id);
  return NextResponse.json({ success: true, ...data });
}
