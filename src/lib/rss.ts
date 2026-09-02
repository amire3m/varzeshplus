/** RSS خبرورزشی — parser مشترک + برچسب‌گذاری ورزش (کش ماژول‌سطح ۱۰ دقیقه) */

const RSS_URL = "https://www.khabarvarzeshi.com/rss";

export type RssItem = { title: string; link: string; description: string; image: string | null; pubDate: string; category: string };

let cache: { at: number; items: RssItem[] } | null = null;
const TTL = 10 * 60_000;

export function stripCdata(s: string) {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}

export function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&#x\d+[a-fA-F]?;/g, "");
}

export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.split("<item>").slice(1);
  for (const b of blocks.slice(0, 50)) {
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

export async function getFeed(): Promise<RssItem[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.items;
  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 600 }, headers: { "User-Agent": "VarzeshPlus/1.0" } });
    const xml = await res.text();
    const items = parseRss(xml);
    if (items.length) cache = { at: Date.now(), items };
    return items;
  } catch {
    return cache?.items ?? [];
  }
}

export function relTime(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 60) return `${mins} دقیقه پیش`;
    if (mins < 1440) return `${Math.round(mins / 60)} ساعت پیش`;
    return `${Math.round(mins / 1440)} روز پیش`;
  } catch { return ""; }
}

/** تشخیص ورزش از category/عنوان — خروجی key از lib/sports */
export function labelSport(it: RssItem): string {
  const hay = `${it.category} ${it.title}`;
  if (hay.includes("کشتی")) return "wrestling";
  if (hay.includes("والیبال")) return "volleyball";
  if (hay.includes("بسکتبال") || hay.includes("NBA")) return "basketball";
  if (hay.includes("تنیس") || hay.includes("تِنیس")) return "tennis";
  if (hay.includes("فوتبال") || hay.includes("لیگ برتر") || hay.includes("دربی") || hay.includes("هفته نود")) return "football";
  return "other";
}
