"use client";

/**
 * Homepage «پلاس ورزش» — Dark Cyberpunk / Glassmorphism
 * RTL | Vazirmatn | Lucide React Icons
 * ساختار: Header → Hero (متن + کارت دربی) → نوار بازی‌های زنده → گرید ۴ ستونه → Dock شناور
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DRAWER_SPORTS } from "@/lib/sports";
import {
  Menu, X, Clock3, CalendarDays, ChevronLeft, ChevronRight,
  Home, Trophy, Video, Heart, User, Play,
} from "lucide-react";
import { NewsRow } from "@/components/ui/NewsRow";
import { SkeletonNewsRow, SkeletonTableRow } from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/ui/Card";

/* ================= Mock Data (فقط fallback — دیتای واقعی از real-data.json) ================= */

/** نگاشت victoryapp teamId → لوگو و slug تیم خلیج فارس */
const VICTORY_TEAMS: Record<number, { slug: string; name: string; color: string }> = {
  2714: { slug: "golgohar", name: "گل‌گهر سیرجان", color: "#1B4D8F" },
  2703: { slug: "aluminium-arak", name: "آلومینیوم اراک", color: "#0055A0" },
  2739: { slug: "esteghlal-khuzestan", name: "استقلال خوزستان", color: "#00843D" },
  20299: { slug: "chadormalu", name: "چادرملو", color: "#1E40AF" },
  18159: { slug: "shams-azar", name: "شمس‌آذر", color: "#16A34A" },
  2737: { slug: "tractor", name: "تراکتور", color: "#D50000" },
  2717: { slug: "malavan", name: "ملوان", color: "#F1F5F9" },
  2719: { slug: "sanat-naft", name: "صنعت نفت", color: "#3b82f6" },
  2738: { slug: "zob-ahan", name: "ذوب‌آهن", color: "#00843D" },
  2741: { slug: "paykan", name: "پیکان", color: "#FFD34D" },
  2716: { slug: "kheybar", name: "خیبر خرم‌آباد", color: "#16A34A" },
  2734: { slug: "sepahan", name: "سپاهان", color: "#F7B500" },
  2733: { slug: "esteghlal", name: "استقلال", color: "#0057B8" },
  2742: { slug: "persepolis", name: "پرسپولیس", color: "#D50000" },
  2743: { slug: "nasaji", name: "نساجی مازندران", color: "#DC2626" },
  2744: { slug: "foolad", name: "فولاد خوزستان", color: "#FF0000" },
  2713: { slug: "havadar", name: "هوادار", color: "#7C3AED" },
  10388: { slug: "mes-rafsanjan", name: "مس رفسنجان", color: "#EA580C" },
};

/** مسابقات زنده — دیتای واقعی از API خلیج فارس (victoryapi) */

/** ناوبری هدر */
const NAV_ITEMS = [
  { label: "فوتبال", href: "/football/leagues/premier-league" },
  { label: "مسابقات", href: "/football/leagues/premier-league/matches" },
  { label: "اخبار", href: "/news" },
  { label: "جدول لیگ‌ها", href: "/football/leagues/premier-league/standings" },
  { label: "بازیکنان", href: "/football/teams/arsenal/squad" },
  { label: "آمار", href: "/football/leagues/premier-league/stats" },
];
/** لوگوهای تیم دربی */
const DERBY = {
  esteghlal: { name: "استقلال", logo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D8%A7%D8%B3%D8%AA%D9%82%D9%84%D8%A7%D9%84%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86.png", glow: "#0057B8" },
  persepolis: { name: "پرسپولیس", logo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D9%BE%D8%B1%D8%B3%D9%BE%D9%88%D9%84%DB%8C%D8%B3%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86.png", glow: "#D50000" },
};

/* ================= انواع ================= */
type User = { id: number; displayName: string | null; points: number; coins: number; level: number } | null;
type LiveMatch = {
  league: string; leagueSlug: string; status: "live" | "upcoming" | "finished";
  minute: string; home: string; away: string;
  hs: string; as: string; homeLogo: string; awayLogo: string;
  glowHome: string; glowAway: string; hot: boolean; time?: string;
  homeSlug?: string | null; awaySlug?: string | null;
};

/** تاریخ نسبی فارسی برای بازی‌های پیش رو: امروز/فردا/پس‌فردا + ساعت درشت */
function faRelativeDay(v: string | undefined): { day: string; time: string } | null {
  if (!v) return null;
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return { day: v, time: "" };
    const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((startOf(d) - startOf(new Date())) / 86400000);
    const time = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(d);
    if (diff <= 0) return { day: "امروز", time };
    if (diff === 1) return { day: "فردا", time };
    if (diff === 2) return { day: "پس‌فردا", time };
    return { day: new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(d), time };
  } catch {
    return { day: v, time: "" };
  }
}
export default function HomePage() {
  const router = useRouter();
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [standings, setStandings] = useState<Array<{ name: string; logo: string; played: string; pts: string; slug?: string }>>([]);
  const [topScorers, setTopScorers] = useState<Array<{ rank: number; playerId: number; name: string; goals: number; ourTeam: { slug: string; name: string; color: string } | null }>>([]);
  const [mixedNews, setMixedNews] = useState<Array<{ title: string; link: string; description: string; image: string | null; time: string; category: string; sport: { key: string; name: string; color: string }; internal: boolean }> | null>(null);
  const [gameIds, setGameIds] = useState<number[]>([]);

  // ساعت و تاریخ زنده (تقویم شمسی)
  const [now, setNow] = useState(() => new Date());
  const [user, setUser] = useState<User | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);
  // هیرو از اخبار واقعی RSS — با تصویر واقعی
  const heroSlides = (mixedNews ?? []).filter((n) => n.image).slice(0, 4);
  useEffect(() => {
    if (heroSlides.length < 2) return;
    const t = setInterval(() => setHeroSlide((s) => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, [heroSlides.length]);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    fetch("/api/home").then((r) => r.json()).then((res) => { if (res?.success) { setUser(res.user ?? null); setGameIds((res.games ?? []).map((g: any) => g.id)); } }).catch(() => {});
    fetch("/api/news/mixed").then(r => r.json()).then(res => {
      if (res?.success && Array.isArray(res.items) && res.items.length) setMixedNews(res.items);
    }).catch(() => {});
    // دیتای واقعی خلیج فارس (victoryapi)
    fetch("/api/football/persian-gulf").then(r => r.json()).then(res => {
      if (!res?.success || !res.covered) return;
      // جدول واقعی خلیج فارس
      if (Array.isArray(res.standings) && res.standings.length) {
        setStandings(res.standings.slice(0, 5).map((s: any) => ({
          name: s.team?.name ?? s.name, logo: s.team?.logo ?? "",
          played: String(s.played ?? 0), pts: String(s.pts ?? 0), slug: s.team?.slug,
        })));
      }
      // بازی‌های واقعی (fixtures) — به لیست زنده اضافه می‌شود
      if (Array.isArray(res.games) && res.games.length) {
        const mapped: LiveMatch[] = res.games.filter((g: any) => g.date).slice(0, 4).map((g: any) => ({
          league: "لیگ برتر ایران", leagueSlug: "persian-gulf", status: "upcoming" as const,
          minute: "",
          home: g.home?.name ?? "—", away: g.away?.name ?? "—",
          hs: "", as: "",
          homeLogo: g.home?.logo ?? "", awayLogo: g.away?.logo ?? "",
          glowHome: g.home?.color ?? "#4AE183", glowAway: g.away?.color ?? "#FFD34D",
          hot: false, time: g.date,
          homeSlug: g.home?.slug ?? null, awaySlug: g.away?.slug ?? null,
        }));
        if (mapped.length) setLiveMatches((prev) => [...prev, ...mapped].slice(0, 4));
      }
    }).catch(() => {});
    // اسکوربرد زنده واقعی — لیگ برتر + لالیگا (به‌صورت چرخشی تا هر دو لیگ دیده شوند)
    (async () => {
      try {
        const LEAGUE_FA: Record<string, { league: string; slug: string }> = {
          "premier-league": { league: "لیگ برتر انگلیس", slug: "premier-league" },
          "la-liga": { league: "لالیگا", slug: "la-liga" },
        };
        const perLeague: LiveMatch[][] = [];
        for (const lg of ["premier-league", "la-liga"]) {
          const r = await fetch(`/api/live-score?league=${lg}`).then((x) => x.json()).catch(() => null);
          if (!r?.success || !Array.isArray(r.matches)) { perLeague.push([]); continue; }
          const list: LiveMatch[] = [];
          for (const m of r.matches) {
            const hn = m.home?.faName ?? m.home?.name ?? "—";
            const an = m.away?.faName ?? m.away?.name ?? "—";
            list.push({
              league: LEAGUE_FA[lg].league, leagueSlug: LEAGUE_FA[lg].slug,
              status: m.status, minute: m.minute ?? "",
              home: hn, away: an,
              hs: m.home?.score !== null && m.home?.score !== undefined ? String(m.home.score) : "",
              as: m.away?.score !== null && m.away?.score !== undefined ? String(m.away.score) : "",
              homeLogo: m.home?.logo ?? "", awayLogo: m.away?.logo ?? "",
              glowHome: m.home?.color ?? "#4AE183", glowAway: m.away?.color ?? "#FFD34D",
              hot: m.status === "live",
              time: m.status === "upcoming" ? m.date : undefined,
              homeSlug: m.home?.slug ?? null, awaySlug: m.away?.slug ?? null,
            });
          }
          perLeague.push(list);
        }
        // چرخشی: اول زنده‌ها، بعد یکی‌یکی از هر لیگ
        const rank = (s: string) => (s === "live" ? 0 : s === "upcoming" ? 1 : 2);
        for (const list of perLeague) list.sort((a, b) => rank(a.status) - rank(b.status));
        const merged: LiveMatch[] = [];
        const lives = perLeague.flat().filter((m) => m.status === "live").slice(0, 2);
        merged.push(...lives);
        let i = 0;
        while (merged.length < 4) {
          let added = false;
          for (const list of perLeague) {
            const next = list.filter((m) => m.status !== "live")[i];
            if (next && merged.length < 4 && !merged.includes(next)) { merged.push(next); added = true; }
          }
          if (!added) break;
          i++;
        }
        if (merged.length) {
          // خلیج فارس (اگر بود) در انتها حفظ می‌شود
          setLiveMatches((prev) => [...merged, ...prev.filter((p) => !merged.some((m) => m.home === p.home && m.away === p.away))].slice(0, 4));
        }
      } catch { /* نادیده */ }
    })();
    // بهترین گلزنان واقعی — بوندسلیگا (پوشش کامل TM) به‌عنوان نمونه جهانی + خلیج فارس ندارد
    fetch("/api/football/players-top?league=bundesliga&key=goals&season=2025").then(r => r.json()).then(res => {
      if (res?.success && res.covered && res.items?.length) setTopScorers(res.items.slice(0, 5));
    }).catch(() => {});
    return () => clearInterval(t);
  }, []);
  const timeStr = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(now);
  const dateStr = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(now);

  // اسلایدر خودکار هیرو (قبلی) — حذف شد چون هیرو از RSS است

  // Drawer ورزش‌ها
  const [menuOpen, setMenuOpen] = useState(false);
  const sportsData = DRAWER_SPORTS;
  const [menuSearch, setMenuSearch] = useState("");
  const [menuView, setMenuView] = useState<string>("root");
  const filtered = sportsData.filter((s) => s.name.includes(menuSearch.trim()) || menuSearch.trim() === "");
  const activeSportObj = menuView !== "root" ? sportsData.find((s) => s.key === menuView) : null;

  return (
    <div className="min-h-screen text-white" style={{ background: "#0A0F0B" }}>



      {/* ============ Drawer ورزش‌ها ============ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <aside
            className="absolute top-0 bottom-0 right-0 w-[85%] max-w-[400px] overflow-y-auto border-l border-white/10 animate-[megaSlideIn_0.28s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: "#0A0F0B" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-white/5 px-5 py-4" style={{ background: "rgba(16,22,16,0.9)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="headline text-lg" style={{ background: "linear-gradient(135deg,#4AE183,#FFD34D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ورزش‌ها</h3>
                <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70"><X size={18} /></button>
              </div>
              <input
                value={menuSearch} onChange={(e) => { setMenuSearch(e.target.value); setMenuView("root"); }}
                placeholder="دنبال چه ورزشی هستی؟"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm placeholder-slate-500 focus:outline-none focus:border-[#4AE183] text-white"
              />
            </div>
            <div className="p-5">
              {activeSportObj ? (
                <div>
                  <button onClick={() => setMenuView("root")} className="flex items-center gap-2 mb-4 text-slate-400 text-sm"><ChevronRight size={18} /> بازگشت</button>
                  <h4 className="headline text-base mb-3" style={{ color: activeSportObj.color }}>{activeSportObj.name}</h4>
                  <div className="flex flex-col gap-2">
                    {activeSportObj.subs.map((sub) => (
                      <button key={sub} onClick={() => { setMenuOpen(false); router.push(`/sport/${activeSportObj.key}/${encodeURIComponent(sub)}`); }} className="sport-tile text-right px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/85">{sub}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filtered.map((s) => (
                    <button key={s.key} onClick={() => { setMenuView(s.key); setMenuSearch(""); }} className="sport-tile flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 w-full">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}22`, color: s.color }}><span className="material-symbols-outlined text-[20px]">{s.icon}</span></div>
                      <span className="text-sm font-bold text-white">{s.name}</span>
                      <ChevronLeft size={18} className="text-slate-400 mr-auto" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ============ ۳. هیرو — محتوای واقعی RSS ============ */}
      <section className="w-full px-4 pt-4">
        <div className="relative max-w-[1320px] mx-auto rounded-3xl overflow-hidden border border-white/10" style={{ minHeight: 420 }}>
          {heroSlides.length > 0 ? heroSlides.map((n, i) => (
            <a
              key={n.link}
              href={n.link}
              {...(n.internal ? {} : { target: "_blank", rel: "noreferrer" })}
              className={`absolute inset-0 transition-opacity duration-700 ${i === heroSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              {n.image && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${n.image}')` }} />}
              <div className="absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(10,15,11,0.96) 0%, rgba(10,15,11,0.7) 45%, rgba(10,15,11,0.25) 75%, rgba(16,22,16,0.9) 100%)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,15,11,0.9), transparent 50%)" }} />
              <div className="absolute bottom-0 right-0 left-0 p-6 md:p-10">
                <div className="max-w-xl text-right">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "#4AE183", color: "#04160A" }}>{n.sport.name}</span>
                    {n.category && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 text-white/70">{n.category}</span>}
                    {n.time && <span className="text-[10px] text-white/60">{n.time}</span>}
                  </div>
                  <h2 className="headline text-[22px] md:text-[34px] leading-[1.35] text-white line-clamp-2">{n.title}</h2>
                  {n.description && <p className="hidden md:block text-[13px] leading-6 text-white/60 mt-3 max-w-md line-clamp-2">{n.description}</p>}
                </div>
              </div>
            </a>
          )) : (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(135deg, #101610 0%, #1D2718 50%, #0A0F0B 100%)" }}>
              <div className="absolute bottom-0 right-0 left-0 p-6 md:p-10">
                <div className="max-w-xl text-right">
                  <h1 className="headline text-[32px] md:text-[48px] leading-[1.25] text-white">
                    هیجان فوتبال، لحظه به لحظه
                  </h1>
                  <p className="headline text-[22px] md:text-[28px] mt-2">
                    همراه با{" "}
                    <span className="neon-text">پلاس ورزش</span>
                  </p>
                  <p className="text-[13px] md:text-[14px] leading-7 mt-4 max-w-md text-white/60">
                    نتایج زنده، جدول لیگ‌ها، اخبار، مینی‌گیم‌ها و تحلیل‌های اختصاصی فوتبال ایران و جهان
                  </p>
                </div>
              </div>
            </div>
          )}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setHeroSlide(i)} aria-label={`اسلاید ${i + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === heroSlide ? "w-7" : "w-2 bg-white/25 hover:bg-white/50"}`} style={i === heroSlide ? { background: "linear-gradient(90deg, #4AE183, #FFD34D)" } : undefined} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ لینک‌های سریع — موبایل‌فرست ============ */}
      <section className="w-full px-4 pt-3 xl:hidden">
        <div className="max-w-[1320px] mx-auto grid grid-cols-4 gap-2">
          {[
            { href: "/football/leagues/persian-gulf/standings", label: "جدول", emoji: "📊" },
            { href: "/football/leagues/premier-league/matches", label: "بازی‌ها", emoji: "⚽" },
            { href: "/news", label: "اخبار", emoji: "📰" },
            { href: "/live", label: "پخش زنده", emoji: "📺" },
          ].map((q) => (
            <Link key={q.label} href={q.href} className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 py-3 transition-colors active:scale-95" style={{ background: "#101610" }}>
              <span className="text-xl">{q.emoji}</span>
              <span className="text-[11px] font-bold text-slate-200">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ ۴. نوار افقی مسابقات زنده ============ */}
      <section id="games" className="w-full py-4" style={{ background: "#0A0F0B" }}>
        <div className="max-w-[1320px] mx-auto px-4">
          {/* هدر بخش */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="headline text-[17px] text-white">{liveMatches.some((m) => m.status === "live") ? "بازی های زنده" : "بازی‌های امروز و پیش رو"}</h2>
              {liveMatches.some((m) => m.status === "live") ? (
                <span className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse" style={{ background: "rgba(232,56,93,0.16)", color: "#ff6b8a" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> زنده ({liveMatches.filter((m) => m.status === "live").length})
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 text-slate-400">
                  فعلاً بازی زنده‌ای نیست
                </span>
              )}
            </div>
            <Link href="/football/leagues/premier-league/matches" className="text-[11px] font-bold px-4 py-1.5 rounded-full border transition-colors hover:bg-white/5" style={{ borderColor: "rgba(74,225,131,0.35)", color: "#4AE183" }}>
              مشاهده همه
            </Link>
          </div>

          {/* کارت‌های زنده — ۴ ستون دسکتاپ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {liveMatches.map((m, i) => {
              const rel = m.status === "upcoming" ? faRelativeDay(m.time) : null;
              return (
              <Link
                key={i} href={`/football/leagues/${m.leagueSlug}/matches`}
                className="group relative block rounded-2xl border border-white/10 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-white/20"
                style={{ background: "#101610" }}
                dir="rtl"
              >
                {/* Glow — دو نور محو در سمت هر تیم + مرکز تیره برای خوانایی نتیجه */}
                <span aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(90deg, ${m.glowHome}40 0%, transparent 35%, transparent 65%, ${m.glowAway}40 100%)` }} />
                <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -right-4 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" style={{ background: m.glowHome }} />
                <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -left-4 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" style={{ background: m.glowAway }} />

                <div className="relative z-10 px-4 pt-3 pb-3.5">
                  {/* نام لیگ وسط + وضعیت گوشه */}
                  <div className="relative mb-3">
                    <p className="text-[10px] font-bold text-center text-slate-400 truncate px-8">{m.league}</p>
                    {m.status === "live" ? (
                      <span className="absolute top-0 left-0 flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full tabular animate-pulse" style={{ background: "rgba(232,56,93,0.18)", color: "#ff6b8a" }}>
                        <span className="w-1 h-1 rounded-full bg-red-400" />{m.minute}&apos;
                      </span>
                    ) : m.status === "finished" ? (
                      <span className="absolute top-0 left-0 text-[9px] font-black px-1.5 py-0.5 rounded-full tabular" style={{ background: "rgba(255,255,255,0.06)", color: "#8FA1B5" }}>
                        پایان
                      </span>
                    ) : (
                      <span className="absolute top-0 left-0 text-[9px] font-black px-1.5 py-0.5 rounded-full tabular" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                        پیش رو
                      </span>
                    )}
                  </div>
                  {/* تیم‌ها + نتیجه — نام کامل بدون برش */}
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 pt-1">
                      <img src={m.homeLogo} alt={m.home} className="w-10 h-10 object-contain shrink-0" loading="lazy" />
                      <span className="text-[11px] font-bold text-center leading-4" style={{ color: "#F5F7FA" }}>{m.home}</span>
                    </div>
                    <div className="shrink-0 px-1 pt-2 text-center min-w-[76px]">
                      {m.status === "upcoming" ? (
                        rel ? (
                          <>
                            <span className="block tabular text-[19px] font-black leading-none" style={{ color: "#4AE183" }} dir="ltr">{rel.time}</span>
                            <span className="block text-[10px] font-bold text-slate-400 mt-1">{rel.day}</span>
                          </>
                        ) : (
                          <span className="block text-[11px] font-bold text-slate-400">به‌زودی</span>
                        )
                      ) : (
                        <>
                          <span className="tabular text-[22px] font-black leading-none text-white">{m.hs} <span className="text-slate-300">-</span> {m.as}</span>
                          {m.status === "live" && <span className="block text-[9px] font-black tabular mt-1 animate-pulse" style={{ color: "#ff6b8a" }}>{m.minute}&apos;</span>}
                        </>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 pt-1">
                      <img src={m.awayLogo} alt={m.away} className="w-10 h-10 object-contain shrink-0" loading="lazy" />
                      <span className="text-[11px] font-bold text-center leading-4" style={{ color: "#F5F7FA" }}>{m.away}</span>
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ۵. ویدیوهای برتر — صدر صفحه ============ */}
      <section className="w-full max-w-[1320px] mx-auto px-4 pt-5 pb-2">
        <SectionHeader title="ویدیوهای برتر" href="/live" linkLabel="همه ویدیوها" />
        {(mixedNews ?? []).filter((n) => n.category === "ویدیو").length >= 2 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(mixedNews ?? []).filter((n) => n.category === "ویدیو").slice(0, 6).map((v, i) => (
              <a key={i} href={v.link} target="_blank" rel="noreferrer" className={`relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-[#4AE183]/40 transition-all ${i === 0 ? "md:col-span-2 lg:row-span-2" : ""}`}
                style={i === 0 ? { aspectRatio: "16/10" } : { aspectRatio: "16/9" }}>
                {v.image && <img src={v.image} alt={v.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className={`rounded-full flex items-center justify-center border border-white/25 transition-transform duration-200 group-hover:scale-110 ${i === 0 ? "w-14 h-14" : "w-10 h-10"}`} style={{ background: "rgba(16,22,16,0.65)", backdropFilter: "blur(6px)" }}>
                    <Play size={i === 0 ? 22 : 16} className="text-white translate-x-[-1px]" />
                  </span>
                </span>
                <p className={`absolute bottom-2 right-3 left-3 font-bold text-white line-clamp-2 ${i === 0 ? "text-[15px]" : "text-[11px]"}`}>{v.title}</p>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-400" style={{ background: "#101610" }}>
            ویدیوهای این هفته به‌زودی از منابع رسمی بارگذاری می‌شود.
          </div>
        )}
      </section>

      {/* ============ ۶. گرید نامتقارن محتوای اصلی ============ */}
      <main id="videos" className="flex-1 w-full max-w-[1320px] mx-auto px-4 py-6 pb-28">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* ستون اصلی — راست */}
          <div className="space-y-5">
            {/* جدول لیگ برتر ایران */}
            <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(16,22,16,0.9)" }}>
              <h3 className="headline text-[16px] text-white mb-3">جدول لیگ برتر ایران</h3>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-slate-300" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <th className="px-3 py-2 text-right font-bold rounded-r-lg">تیم</th>
                    <th className="px-2 py-2 text-center font-bold">بازی</th>
                    <th className="px-2 py-2 text-center font-bold rounded-l-lg">امتیاز</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr key={row.name} className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${i === 0 ? "bg-[#4AE183]/5" : ""}`}>
                      <td className="px-3 py-2.5">
                        <Link href={row.slug ? `/football/teams/${row.slug}` : "/football/leagues/persian-gulf"} className="flex items-center gap-2 min-w-0 group">
                          <span className="tabular text-[11px] w-4 shrink-0" style={{ color: i === 0 ? "#4AE183" : "#64748b" }}>{["۱","۲","۳","۴","۵"][i]}</span>
                          <img src={row.logo} alt={row.name} className="w-5 h-5 object-contain shrink-0" loading="lazy" />
                          <span className="font-bold truncate text-white group-hover:text-[#4AE183] transition-colors">{row.name}</span>
                        </Link>
                      </td>
                      <td className="px-2 py-2.5 text-center tabular text-slate-400">{row.played}</td>
                      <td className="px-2 py-2.5 text-center tabular font-black" style={{ color: "#4AE183" }}>{row.pts}</td>
                    </tr>
                  ))}
                  {!standings.length && (
                    <tr><td colSpan={3}><SkeletonTableRow /></td></tr>
                  )}
                </tbody>
              </table>
              <Link href="/football/leagues/persian-gulf/standings" className="mt-auto pt-3 block text-center text-[12px] font-bold hover:underline" style={{ color: "#FFD34D" }}>مشاهده جدول کامل</Link>
            </div>

            {/* بهترین گلزنان — واقعی از Transfermarkt */}
            <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(16,22,16,0.9)" }}>
              <h3 className="headline text-[16px] text-white mb-1">بهترین گلزنان</h3>
              <p className="text-[10px] text-slate-400 mb-3">بوندسلیگا — فصل ۲۰۲۵/۲۶</p>
              <div className="flex-1 space-y-1.5">
                {topScorers.map((p) => (
                  <Link key={p.playerId} href={`/football/players/${p.playerId}`} className="flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors hover:bg-white/[0.04]" style={p.rank === 1 ? { background: "rgba(74,225,131,0.07)" } : undefined}>
                    <span className="tabular font-black text-[12px] w-5 text-center shrink-0" style={{ color: p.rank === 1 ? "#4AE183" : "#64748b" }}>{p.rank}</span>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 border border-white/10" style={{ background: `${p.ourTeam?.color ?? "#4AE183"}25`, color: p.ourTeam?.color ?? "#4AE183" }}>{p.name.slice(0, 2)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold truncate text-white">{p.name}</p>
                      <span className="text-[10px] text-slate-400">{p.ourTeam?.name ?? "—"}</span>
                    </div>
                    <span className="font-black text-[14px] text-white shrink-0">{p.goals} <span className="text-[10px] font-normal text-slate-400">گل</span></span>
                  </Link>
                ))}
                {!topScorers.length && (
                  <div className="space-y-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-2.5 px-2 py-2">
                        <div className="rounded bg-white/10 animate-pulse tabular w-5 h-3 shrink-0" />
                        <div className="rounded-full bg-white/10 animate-pulse w-9 h-9 shrink-0" />
                        <div className="flex-1 space-y-1.5"><div className="rounded bg-white/10 animate-pulse h-3 w-3/4" /><div className="rounded bg-white/5 animate-pulse h-2.5 w-1/3" /></div>
                        <div className="rounded bg-white/10 animate-pulse h-4 w-8 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/football/leagues/bundesliga/stats" className="mt-auto pt-3 block text-center text-[12px] font-bold hover:underline" style={{ color: "#FFD34D" }}>مشاهده آمار کامل</Link>
            </div>

            {/* آخرین اخبار — ترکیبی */}
            <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(16,22,16,0.9)" }}>
              <h3 className="headline text-[16px] text-white mb-3">آخرین اخبار</h3>
              <div className="flex-1 flex flex-col gap-2.5">
                {mixedNews ? mixedNews.map((n, idx) => (
                  <NewsRow
                    key={`${n.link}-${idx}`}
                    title={n.title} href={n.link} external={!n.internal}
                    image={n.image} time={n.time}
                    badge={{ label: n.sport.name, color: n.sport.color }}
                  />
                )) : (
                  <>
                    <SkeletonNewsRow /><SkeletonNewsRow /><SkeletonNewsRow />
                  </>
                )}
              </div>
              <Link href="/news" className="mt-auto pt-3 block text-center text-[12px] font-bold hover:underline" style={{ color: "#FFD34D" }}>مشاهده همه اخبار</Link>
            </div>
          </div>

          {/* ستون کناری — چپ */}
          <div className="space-y-5">
            {/* بهترین گلزنان کوچک */}
            <div className="rounded-2xl border border-white/10 p-4" style={{ background: "rgba(16,22,16,0.9)" }}>
              <h3 className="headline text-[16px] text-white mb-3">بازی‌های این هفته</h3>
              <div className="space-y-2">
                {liveMatches.slice(0, 4).map((m, i) => (
                  <Link key={i} href={`/football/leagues/${m.leagueSlug}/matches`} className="block px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
                    <span className="text-[10px] text-slate-400">{m.league}</span>
                    <p className="text-[12px] font-bold text-white mt-0.5">{m.home} vs {m.away}</p>
                    {m.time && <span className="text-[10px] text-slate-400">{faRelativeDay(m.time)?.day} {faRelativeDay(m.time)?.time}</span>}
                  </Link>
                ))}
                {!liveMatches.length && <p className="text-xs text-slate-500 text-center py-4">در حال بارگذاری...</p>}
              </div>
            </div>

            {/* مینی‌گیم‌ها */}
            <div className="rounded-2xl border p-4" style={{ background: "linear-gradient(135deg, rgba(74,225,131,0.08), rgba(16,22,16,0.9))", borderColor: "rgba(74,225,131,0.2)" }}>
              <h3 className="headline text-[16px] text-white mb-3">مینی‌گیم‌ها</h3>
              <div className="space-y-2">
                {[
                  { href: "/games/footle", label: "فوتل", desc: "حدس بازیکن روز" },
                  { href: "/games/higher-lower", label: "بیشتر یا کمتر", desc: "ارزش بازار کدام بیشتر؟" },
                  { href: "/games/predictor", label: "پیش‌بینی نتیجه", desc: "۳ امتیاز نتیجه دقیق" },
                  { href: "/games/tactics", label: "تخته تاکتیک", desc: "ترکیب بچین" },
                ].map((g) => (
                  <Link key={g.href} href={g.href} className="block px-3 py-2.5 rounded-xl border border-white/8 hover:border-[#4AE183]/30 transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="text-[13px] font-bold text-white">{g.label}</span>
                    <span className="block text-[10px] text-slate-400">{g.desc}</span>
                  </Link>
                ))}
              </div>
              <Link href="/games" className="mt-3 block text-center text-[11px] font-bold hover:underline" style={{ color: "#4AE183" }}>همه بازی‌ها ←</Link>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}

/* ================= آیکون‌های کمکی SVG ================= */

/** گیم‌پد — منی گیم */
function GamepadIcon({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" />
      <line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </svg>
  );
}

/** رادیو/آنتن — پخش زنده */
function RadioLive({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
  );
}

/** فلش چپ برای CTA (جهت RTL) */
function ArrowLeftInline() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>;
}

/** ستاره طلایی — نشان قهرمانی استقلال */
function StarSVG() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFD700" aria-hidden>
      <path d="M12 2l2.4 4.8 5.4.8-3.9 3.8.9 5.4L12 14.6 7.2 16.8l.9-5.4L4.2 7.6l5.4-.8z" />
    </svg>
  );
}
