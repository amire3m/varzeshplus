import { NextResponse } from "next/server";
import { getFeed, relTime, labelSport } from "@/lib/rss";

/** حاشیه بازی — اخبار واقعی RSS خبرورزشی، فیلتر با نام دو تیم؛ کش در lib/rss */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teams = (searchParams.get("teams") || "").split(",").map((t) => t.trim()).filter(Boolean);
  const leagueOnly = searchParams.get("league") === "1";

  const feed = await getFeed();
  if (!feed.length) return NextResponse.json({ success: true, items: [], source: "khabarvarzeshi" });

  let matched: import("@/lib/rss").RssItem[] = [];
  if (teams.length) {
    matched = feed.filter((it) => teams.some((t) => it.title.includes(t) || it.description.includes(t)));
  }
  // اگر match کم بود: مکمل با اخبار لیگ برتر ایران یا عمومی
  if (matched.length < 4) {
    const leagueItems = feed.filter((it) => it.category.includes("لیگ برتر ایران") || it.category.includes("Persian-Gulf"));
    const seen = new Set(matched.map((m) => m.link));
    for (const it of leagueItems) {
      if (matched.length >= 10) break;
      if (!seen.has(it.link)) { matched.push(it); seen.add(it.link); }
    }
  }
  if (matched.length < 4 && !leagueOnly) {
    const seen = new Set(matched.map((m) => m.link));
    for (const it of feed) {
      if (matched.length >= 10) break;
      if (!seen.has(it.link)) { matched.push(it); seen.add(it.link); }
    }
  }

  const items = matched.slice(0, 10).map((it) => ({
    title: it.title,
    link: it.link,
    description: it.description,
    image: it.image,
    category: it.category,
    time: relTime(it.pubDate),
  }));

  return NextResponse.json({ success: true, items, source: "khabarvarzeshi", matched: teams.length ? teams : null });
}
