import { NextResponse } from "next/server";

/**
 * حاشیه بازی — اخبار واقعی از RSS خبرورزشی
 * فیلتر: عناوینی که نام یکی از دو تیم را دارند؛ اگر خالی بود، اخبار عمومی فوتبال
 * کش ماژول‌سطح ۱۰ دقیقه
 */

const RSS_URL = "https://www.khabarvarzeshi.com/rss";

type RssItem = { title: string; link: string; description: string; image: string | null; pubDate: string; category: string };

let cache: { at: number; items: RssItem[] } | null = null;
const TTL = 10 * 60_000;

function stripCdata(s: string) {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#x\d+[a-fA-F]?;/g, "");
}

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.split("<item>").slice(1);
  for (const b of blocks.slice(0, 40)) {
    const title = stripCdata(b.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const link = stripCdata(b.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "");
    const description = decodeEntities(stripCdata(b.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? ""));
    const image = b.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] ?? null;
    const pubDate = stripCdata(b.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
    const category = decodeEntities(stripCdata(b.match(/<category[^>]*>([\s\S]*?)<\/category>/)?.[1] ?? ""));
    if (title && link) items.push({ title, link, description, image, pubDate, category });
  }
  return items;
}

async function getFeed(): Promise<RssItem[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.items;
  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 600 }, headers: { "User-Agent": "VarzeshPlus/1.0" } });
    const xml = await res.text();
    const items = parseRss(xml);
    cache = { at: Date.now(), items };
    return items;
  } catch {
    return cache?.items ?? [];
  }
}

function relTime(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 60) return `${mins} دقیقه پیش`;
    if (mins < 1440) return `${Math.round(mins / 60)} ساعت پیش`;
    return `${Math.round(mins / 1440)} روز پیش`;
  } catch { return ""; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teams = (searchParams.get("teams") || "").split(",").map((t) => t.trim()).filter(Boolean);
  const leagueOnly = searchParams.get("league") === "1";

  const feed = await getFeed();
  if (!feed.length) return NextResponse.json({ success: true, items: [], source: "khabarvarzeshi" });

  let matched: RssItem[] = [];
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
