import { NextResponse } from "next/server";
import { TEAMS } from "@/lib/football/leagues";

/**
 * اسکوربرد زنده — worldcup26.ir (اول) + ESPN (فالبک)
 * ?league=premier-league|la-liga|bundesliga|serie-a|ligue-1
 * خروجی مرتب: زنده ← پیش رو (نزدیک‌ترین) ← نتایج اخیر — حداکثر ۱۲ بازی
 * کش ماژول‌سطح ۶۰ ثانیه
 */

export const dynamic = "force-dynamic";

const WC26 = "https://worldcup26.ir";
const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer";

// slug ما → slug منابع
const LEAGUE_MAP: Record<string, { wc26: string | null; espn: string }> = {
  "premier-league": { wc26: "eng.1", espn: "eng.1" },
  "la-liga": { wc26: "esp.1", espn: "esp.1" },
  "bundesliga": { wc26: null, espn: "ger.1" },
  "serie-a": { wc26: null, espn: "ita.1" },
  "ligue-1": { wc26: null, espn: "fra.1" },
};

// نام انگلیسی → slug تیم ما (EPL + LaLiga برای لینک پروفایل)
const TEAM_SLUG: Record<string, string> = {
  "Arsenal": "arsenal", "Aston Villa": "aston-villa", "Manchester City": "manchester-city",
  "Liverpool": "liverpool", "Chelsea": "chelsea", "Manchester United": "manchester-united",
  "Tottenham Hotspur": "tottenham", "Newcastle United": "newcastle", "Nottingham Forest": "nottingham-forest",
  "Brighton & Hove Albion": "brighton", "Brighton": "brighton", "Everton": "everton",
  "Fulham": "fulham", "Crystal Palace": "crystal-palace", "West Ham United": "west-ham",
  "West Ham": "west-ham", "Brentford": "brentford", "Bournemouth": "bournemouth",
  "AFC Bournemouth": "bournemouth", "Wolverhampton Wanderers": "wolves", "Wolves": "wolves",
  "Leicester City": "leicester", "Southampton": "southampton", "Ipswich Town": "ipswich",
  "Leeds United": "leeds", "Burnley": "burnley", "Sunderland": "sunderland",
  "Real Madrid": "real-madrid", "Barcelona": "barcelona", "Atlético Madrid": "atletico-madrid",
  "Atletico Madrid": "atletico-madrid", "Athletic Club": "athletic-club", "Athletic Bilbao": "athletic-club",
  "Real Sociedad": "real-sociedad", "Villarreal": "villarreal", "Villarreal CF": "villarreal",
  "Real Betis": "real-betis", "Sevilla": "sevilla", "Sevilla FC": "sevilla",
  "Valencia": "valencia", "Valencia CF": "valencia", "Girona": "girona", "Girona FC": "girona",
  "Osasuna": "osasuna", "CA Osasuna": "osasuna", "Celta Vigo": "celta-vigo", "RC Celta": "celta-vigo",
  "Mallorca": "mallorca", "RCD Mallorca": "mallorca", "Rayo Vallecano": "rayo-vallecano",
  "Getafe": "getafe", "Getafe CF": "getafe", "Alavés": "alaves", "Deportivo Alavés": "alaves",
  "Espanyol": "espanyol", "RCD Espanyol": "espanyol", "Leganés": "leganes", "CD Leganés": "leganes",
  "Real Valladolid": "valladolid", "Valladolid": "valladolid", "Las Palmas": "las-palmas", "UD Las Palmas": "las-palmas",
};

type NormTeam = { name: string; faName: string | null; abbr: string; logo: string; color: string; score: number | null; slug: string | null };
type NormMatch = {
  id: string; date: string; status: "live" | "upcoming" | "finished";
  minute: string | null; detail: string | null;
  home: NormTeam; away: NormTeam; venue: string | null;
  goals: Array<{ minute: string; team: string; player: string; assist: string | null }>;
};

function normTeam(c: any): NormTeam {
  const t = c?.team ?? {};
  const name = t.displayName || t.name || "—";
  const slug = TEAM_SLUG[name] ?? null;
  const ours = slug ? TEAMS.find((x) => x.slug === slug) : undefined;
  return {
    name,
    faName: ours?.name ?? null,
    abbr: t.abbreviation || t.shortDisplayName || "",
    logo: t.logo || ours?.logo || "",
    color: t.color ? `#${t.color}` : "#8FA1B5",
    score: c?.score !== undefined && c?.score !== null && c?.score !== "" ? Number(c.score) : null,
    slug,
  };
}

function normEvent(e: any): NormMatch | null {
  const comp = e?.competitions?.[0];
  if (!comp) return null;
  const st = comp.status?.type ?? {};
  const state: string = st.state || "";
  const status: NormMatch["status"] = state === "in" ? "live" : state === "post" ? "finished" : "upcoming";
  const home = comp.competitors?.find((c: any) => c.homeAway === "home");
  const away = comp.competitors?.find((c: any) => c.homeAway === "away");
  if (!home || !away) return null;
  const goals = (comp.details ?? [])
    .filter((d: any) => d?.scoringPlay)
    .map((d: any) => ({
      minute: d?.clock?.displayValue ?? "",
      team: "",
      player: d?.athletesInvolved?.[0]?.displayName ?? "",
      assist: d?.athletesInvolved?.[1]?.displayName ?? null,
    }));
  return {
    id: String(e.id ?? comp.id ?? ""),
    date: e.date ?? comp.date ?? "",
    status,
    minute: status === "live" ? comp.status?.displayClock ?? null : null,
    detail: comp.status?.type?.shortDetail || comp.status?.type?.description || null,
    home: normTeam(home),
    away: normTeam(away),
    venue: comp.venue?.fullName ?? e.venue?.fullName ?? null,
    goals,
  };
}

// کش ۶۰ ثانیه‌ای
const cache = new Map<string, { at: number; data: any }>();
const TTL = 60_000;

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "VarzeshPlus/1.0" }, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const league = searchParams.get("league") || "premier-league";
  const map = LEAGUE_MAP[league];
  if (!map) return NextResponse.json({ success: false, error: "league نامعتبر" }, { status: 400 });

  const hit = cache.get(league);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json({ ...hit.data, cached: true });
  }

  const errors: string[] = [];
  const now = Date.now();
  const from = now - 3 * 86400_000;
  const to = now + 14 * 86400_000;

  function inWindow(m: NormMatch) {
    const t = new Date(m.date).getTime();
    return !Number.isNaN(t) && t >= from && t <= to;
  }
  function sortMatches(list: NormMatch[]) {
    const rank = (m: NormMatch) => (m.status === "live" ? 0 : m.status === "upcoming" ? 1 : 2);
    return list.sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      // پیش رو: نزدیک‌ترین اول؛ تمام‌شده: تازه‌ترین اول
      return a.status === "finished" ? tb - ta : ta - tb;
    });
  }

  // ۱) worldcup26.ir — اسکوربرد امروز + همه صفحات فیکسچر
  if (map.wc26) {
    try {
      const [sb, ...pages] = await Promise.all([
        fetchJson(`${WC26}/get/soccer/${map.wc26}/scoreboard`),
        fetchJson(`${WC26}/get/soccer/${map.wc26}/fixtures?page=1`),
        fetchJson(`${WC26}/get/soccer/${map.wc26}/fixtures?page=2`),
        fetchJson(`${WC26}/get/soccer/${map.wc26}/fixtures?page=3`),
        fetchJson(`${WC26}/get/soccer/${map.wc26}/fixtures?page=4`),
      ]);
      const seen = new Set<string>();
      const all: NormMatch[] = [];
      for (const src of [sb, ...pages]) {
        for (const e of src?.events ?? []) {
          const m = normEvent(e);
          if (m && !seen.has(m.id)) { seen.add(m.id); all.push(m); }
        }
      }
      const matches = sortMatches(all.filter(inWindow)).slice(0, 12);
      const data = { success: true, source: "worldcup26", league, updatedAt: new Date().toISOString(), matches };
      cache.set(league, { at: Date.now(), data });
      return NextResponse.json(data);
    } catch (e) {
      errors.push(`wc26: ${String(e).slice(0, 120)}`);
    }
  }
  // ۲) فالبک ESPN
  try {
    const sb = await fetchJson(`${ESPN}/${map.espn}/scoreboard`);
    const matches = ((sb?.events ?? []).map(normEvent).filter(Boolean) as NormMatch[]).slice(0, 12);
    const data = { success: true, source: "espn", league, updatedAt: new Date().toISOString(), matches };
    cache.set(league, { at: Date.now(), data });
    return NextResponse.json(data);
  } catch (e) {
    errors.push(`espn: ${String(e).slice(0, 120)}`);
  }

  return NextResponse.json({ success: false, error: "هر دو منبع در دسترس نیستند", details: errors }, { status: 502 });
}
