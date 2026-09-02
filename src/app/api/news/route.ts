import { NextResponse } from "next/server";
import { db } from "@/db";
import { news, programs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export async function GET(req: Request) {
  seedDatabase();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const item = db
      .select({ n: news, programTitle: programs.title })
      .from(news)
      .leftJoin(programs, eq(programs.id, news.programId))
      .where(eq(news.id, Number(id)))
      .limit(1)
      .all()[0];
    if (!item || item.n.status !== "published") {
      return NextResponse.json({ success: false, error: "خبر یافت نشد" }, { status: 404 });
    }
    return NextResponse.json({ success: true, news: { ...item.n, programTitle: item.programTitle } });
  }

  const items = db
    .select({ id: news.id, title: news.title, summary: news.summary, coverImage: news.coverImage, category: news.category, isBreaking: news.isBreaking, publishedAt: news.publishedAt, programTitle: programs.title })
    .from(news)
    .leftJoin(programs, eq(programs.id, news.programId))
    .where(eq(news.status, "published"))
    .orderBy(desc(news.publishedAt))
    .limit(30)
    .all();
  return NextResponse.json({ success: true, items });
}
