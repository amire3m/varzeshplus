import { NextResponse } from "next/server";
import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getFeed, relTime, labelSport } from "@/lib/rss";

const SPORT_META: Record<string, SportMeta> = {
  football: { name: "فوتبال", color: "#005cfc" },
  volleyball: { name: "والیبال", color: "#22c55e" },
  basketball: { name: "بسکتبال", color: "#e8820c" },
  tennis: { name: "تنیس", color: "#84cc16" },
  wrestling: { name: "کشتی", color: "#ef4444" },
  other: { name: "ورزشی", color: "#8FA1B5" },
};

type SportMeta = { name: string; color: string };
type MixedItem = { title: string; link: string; description: string; image: string | null; time: string; category: string; sport: SportMeta; internal: boolean };

/**
 * اخبار ترکیبی صفحه اصلی — ۳ فوتبال DB + ۲ فوتبال RSS + سایر ورزش‌ها از RSS واقعی
 * ?sport=wrestling → فقط آن ورزش (برای صفحات اختصاصی ورزش)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sportFilter = searchParams.get("sport");

  if (sportFilter && sportFilter !== "all") {
    const feed = await getFeed();
    const mine = feed.filter((it) => labelSport(it) === sportFilter);
    const fallback = mine.length ? mine : feed;
    const meta = SPORT_META[sportFilter] ?? SPORT_META.other;
    const items: MixedItem[] = fallback.slice(0, 8).map((it) => ({
      title: it.title, link: it.link, description: it.description, image: it.image,
      time: relTime(it.pubDate), category: it.category, sport: meta, internal: false,
    }));
    return NextResponse.json({ success: true, items, source: "khabarvarzeshi" });
  }

  // ترکیبی — ۳ فوتبال DB
  const dbRows = db.select().from(news).where(eq(news.status, "published")).orderBy(desc(news.publishedAt)).limit(4).all();
  const dbItems: MixedItem[] = dbRows.map((n) => ({
    title: n.title, link: `/news?id=${n.id}`, description: n.summary ?? "",
    image: n.coverImage ?? `https://picsum.photos/seed/vn${n.id}/300/200`,
    time: "اخبار ورزش‌پلاس", category: "فوتبال", sport: SPORT_META.football, internal: true,
  }));

  const feed = await getFeed();
  const labeled = feed.map((it) => ({ it, key: labelSport(it) }));
  const rssFootball = labeled.filter((x) => x.key === "football").slice(0, 2).map(({ it }) => ({
    title: it.title, link: it.link, description: it.description, image: it.image,
    time: relTime(it.pubDate), category: it.category, sport: SPORT_META.football, internal: false,
  }));
  const others: MixedItem[] = [];
  const seen = new Set<string>();
  for (const { it, key } of labeled) {
    if (key === "football") continue;
    if (seen.has(it.link)) continue;
    seen.add(it.link);
    others.push({
      title: it.title, link: it.link, description: it.description, image: it.image,
      time: relTime(it.pubDate), category: it.category, sport: SPORT_META[key] ?? SPORT_META.other, internal: false,
    });
    if (others.length >= 4) break;
  }
  // اگر RSS ورزش دیگری نداشت: با فوتبال RSS پر کن
  if (others.length < 2) {
    for (const { it, key } of labeled) {
      if (key !== "football" || others.length >= 4) continue;
      if (seen.has(it.link)) continue;
      seen.add(it.link);
      others.push({
        title: it.title, link: it.link, description: it.description, image: it.image,
        time: relTime(it.pubDate), category: it.category, sport: SPORT_META.football, internal: false,
      });
    }
  }

  const items = [...dbItems.slice(0, 3), ...rssFootball, ...others].slice(0, 9);
  return NextResponse.json({ success: true, items, source: "mixed" });
}
