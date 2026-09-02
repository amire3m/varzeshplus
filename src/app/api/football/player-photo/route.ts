import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * پروکسی عکس بازیکن از TheSportsDB — جستجو با نام انگلیسی، کش در SQLite (۷ روز)
 * جدول کش در صورت نبود خودکار ساخته می‌شود (بدون نیاز به مایگریشن)
 */

type CacheRow = { photoUrl: string | null; fetchedAt: string };

function ensureTable() {
  db.run(sql`CREATE TABLE IF NOT EXISTS player_photo_cache (
    query TEXT PRIMARY KEY,
    photo_url TEXT,
    fetched_at TEXT NOT NULL
  )`);
}

const TEAM_NAME_EN: Record<string, string> = {
  persepolis: "Persepolis", esteghlal: "Esteghlal", sepahan: "Sepahan", tractor: "Tractor Sazi",
};

// در آینده: نگاشت نام فارسی → انگلیسی اینجا گسترش می‌یابد
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") || "").trim();
  if (!name) return NextResponse.json({ success: false, error: "name لازم است" }, { status: 400 });

  try {
    ensureTable();
    const cached = db.all(sql`SELECT photo_url as photoUrl, fetched_at as fetchedAt FROM player_photo_cache WHERE query = ${name}`).slice(-1)[0] as CacheRow | undefined;
    if (cached && Date.now() - new Date(cached.fetchedAt).getTime() < 7 * 86400_000) {
      return NextResponse.json({ success: true, photoUrl: cached.photoUrl, cached: true });
    }

    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`, { next: { revalidate: 86400 } });
    const data = await res.json().catch(() => null);
    const player = data?.player?.[0];
    const photoUrl: string | null = player?.strCutout || player?.strThumb || null;

    db.run(sql`INSERT OR REPLACE INTO player_photo_cache (query, photo_url, fetched_at) VALUES (${name}, ${photoUrl}, ${new Date().toISOString()})`);
    return NextResponse.json({ success: true, photoUrl, cached: false });
  } catch {
    return NextResponse.json({ success: true, photoUrl: null, cached: false });
  }
}
