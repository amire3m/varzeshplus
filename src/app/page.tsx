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
  2741: { slug: "paykan", name: "پیکان", color: "#bee503" },
  2716: { slug: "kheybar", name: "خیبر خرم‌آباد", color: "#16A34A" },
  2734: { slug: "sepahan", name: "سپاهان", color: "#F7B500" },
  2733: { slug: "esteghlal", name: "استقلال", color: "#0057B8" },
  2742: { slug: "persepolis", name: "پرسپولیس", color: "#D50000" },
  2743: { slug: "nasaji", name: "نساجی مازندران", color: "#DC2626" },
  2744: { slug: "foolad", name: "فولاد خوزستان", color: "#FF0000" },
  2713: { slug: "havadar", name: "هوادار", color: "#7C3AED" },
  10388: { slug: "mes-rafsanjan", name: "مس رفسنجان", color: "#EA580C" },
};

/** مسابقات زنده — رنگ glow هر سمت از رنگ اصلی لوگوی تیم */
const LIVE_MATCHES_FALLBACK = [  {
    league: "لالیگا اسپانیا", minute: "45", home: "بارسلونا", away: "رئال مادرید",
    hs: "۱", as: "۱",
    homeLogo: "https://media.api-sports.io/football/teams/529.png", awayLogo: "https://media.api-sports.io/football/teams/541.png",
    glowHome: "#A50044", glowAway: "#FEBE10",
    hot: true,
  },
  {
    league: "لیگ برتر انگلیس", minute: "90+2", home: "منچسترسیتی", away: "لیورپول",
    hs: "۲", as: "۳",
    homeLogo: "https://media.api-sports.io/football/teams/50.png", awayLogo: "https://media.api-sports.io/football/teams/40.png",
    glowHome: "#6CABDD", glowAway: "#C8102E",
    hot: true,
  },
  {
    league: "لیگ قهرمانان آسیا", minute: "75", home: "الهلال", away: "النصر",
    hs: "۱", as: "۲",
    homeLogo: "https://media.api-sports.io/football/teams/2932.png", awayLogo: "https://media.api-sports.io/football/teams/2939.png",
    glowHome: "#00529F", glowAway: "#FDB913",
    hot: true,
  },
  {
    league: "لیگ برتر ایران", minute: "68", home: "سپاهان", away: "پرسپولیس",
    hs: "۰", as: "۱",
    homeLogo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D8%B3%D9%BE%D8%A7%D9%87%D8%A7%D9%86%20%D8%A7%D8%B5%D9%81%D9%87%D8%A7%D9%86.png",
    awayLogo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D9%BE%D8%B1%D8%B3%D9%BE%D9%88%D9%84%DB%8C%D8%B3%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86.png",
    glowHome: "#F7B500", glowAway: "#D50000",
    hot: false,
  },
];

/** جدول لیگ برتر ایران — fallback (دیتای واقعی از real-data) */
const STANDINGS_FALLBACK = [
  { name: "تراکتور", logo: "https://media.api-sports.io/football/teams/2937.png", played: "۵", pts: "۱۳" },
  { name: "فولاد خوزستان", logo: "https://media.api-sports.io/football/teams/2934.png", played: "۵", pts: "۱۱" },
  { name: "استقلال", logo: "https://media.api-sports.io/football/teams/2933.png", played: "۴", pts: "۱۰" },
  { name: "پرسپولیس", logo: "https://media.api-sports.io/football/teams/2942.png", played: "۴", pts: "۹" },
  { name: "گل‌گهر سیرجان", logo: "https://media.api-sports.io/football/teams/2914.png", played: "۵", pts: "۷" },
];

/** آخرین اخبار */
const NEWS = [
  { title: "مصاحبه اختصاصی با گاریدو قبل از دربی", time: "۲ ساعت پیش", img: "https://picsum.photos/seed/n1/160/112" },
  { title: "مصدومیت ستاره استقلال تایید شد", time: "۴ ساعت پیش", img: "https://picsum.photos/seed/n2/160/112" },
  { title: "گزارش ویژه: نبرد تاکتیکی در دربی ۱۰۵", time: "۶ ساعت پیش", img: "https://picsum.photos/seed/n3/160/112" },
];

/** ویدیوهای برتر */
const VIDEOS = {
  featured: { title: "خلاصه بازی پرسپولیس ۱ - ۱ استقلال", duration: "08:45", img: "https://picsum.photos/seed/v1/720/400" },
  small: [
    { duration: "06:12", img: "https://picsum.photos/seed/v2/300/180" },
    { duration: "07:33", img: "https://picsum.photos/seed/v3/300/180" },
    { duration: "05:48", img: "https://picsum.photos/seed/v4/300/180" },
  ],
};

/** بهترین گلزنان — دیتای واقعی از victoryapp */
const TOP_SCORERS = [
  { rank: "۱", name: "مهدی ترابی", team: "پرسپولیس", goals: "۱۸", color: "#D50000" },
  { rank: "۲", name: "شهریار مغانلو", team: "سپاهان", goals: "۱۵", color: "#F7B500" },
  { rank: "۳", name: "محمد محبی", team: "استقلال", goals: "۱۲", color: "#0057B8" },
  { rank: "۴", name: "امیرحسین حسین‌زاده", team: "تراکتور", goals: "۱۱", color: "#DC2626" },
  { rank: "۵", name: "کاوه رضایی", team: "گل‌گهر", goals: "۱۰", color: "#1B4D8F" },
];

/** ناوبری هدر */
const NAV_ITEMS = [
  { label: "فوتبال", href: "/football/leagues/premier-league" },
  { label: "مسابقات", href: "/football/leagues/premier-league/matches" },
  { label: "اخبار", href: "/news" },
  { label: "جدول لیگ‌ها", href: "/football/leagues/premier-league/standings" },
  { label: "بازیکنان", href: "/football/teams/arsenal/squad" },
  { label: "آمار", href: "/football/leagues/premier-league/stats" },
];
/** اسلایدهای پس‌زمینه هیرو */
const HERO_SLIDES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDmHbtbXJ30Oaa-RKqdd8UIaVKJzlrDADiddlV7G80jcHouHJuABxYH6RYmkCQoNJs61Ua1RcnYPDLEYo02NAx7h114EBYxuP3QfK0k6SWJRjzDyWYubnVOUGx0vdFe1noucqUmqly6M8H9nAdQzSORGEklYnMEcZXX52J4H6IV6WQvVN55bOAx6hFpGVMueX0odi5lBXM8KSgDh3T-vK3OMWs-zBVHU6r3mVeFZHwSEdfiEnj32LmQwg",
  "https://picsum.photos/seed/hero2/1600/700",
  "https://picsum.photos/seed/hero3/1600/700",
];

/** لوگوهای تیم دربی */
const DERBY = {
  esteghlal: { name: "استقلال", logo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D8%A7%D8%B3%D8%AA%D9%82%D9%84%D8%A7%D9%84%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86.png", glow: "#0057B8" },
  persepolis: { name: "پرسپولیس", logo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D9%BE%D8%B1%D8%B3%D9%BE%D9%88%D9%84%DB%8C%D8%B3%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86.png", glow: "#D50000" },
};

/* ================= انواع ================= */
type User = { id: number; displayName: string | null; points: number; coins: number; level: number } | null;
export default function HomePage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [liveData, setLiveData] = useState<{ persianGulfStandings: {rank: number; slug: string; name: string; played: number; pts: number}[]; leagueStandings: Record<string, any[]> } | null>(null);
  const [liveMatches, setLiveMatches] = useState(LIVE_MATCHES_FALLBACK);
  const [standings, setStandings] = useState(STANDINGS_FALLBACK);

  // ساعت و تاریخ زنده (تقویم شمسی)
  const [now, setNow] = useState(() => new Date());
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    fetch("/api/home").then((r) => r.json()).then((res) => { if (res?.success) setUser(res.user ?? null); }).catch(() => {});
    // دیتای واقعی
    fetch("/api/football/real-data").then(r => r.json()).then(res => {
      if (res?.success) {
        setLiveData(res);
        // جدول واقعی خلیج فارس
        if (res.persianGulf?.standings) {
          const pg = res.persianGulf.standings.slice(0, 5).map((s: any) => ({
            name: s.name,
            logo: `https://www.victoryapi.ir/flags/png/teams/${s.teamId}.png`,
            played: String(s.played),
            pts: String(s.pts)
          }));
          if (pg.length) setStandings(pg);
        }
        // بازی‌های واقعی (fixtures) خلیج فارس — امروز
        if (res.persianGulf?.fixtures?.length) {
          const t = res.persianGulf.fixtures.filter((f: any) => f.time);
          if (t.length) {
            const mapped = t.slice(0, 4).map((f: any) => {
              const h = VICTORY_TEAMS[f.homeId] || { name: f.homeName, color: "#bee503" };
              const a = VICTORY_TEAMS[f.awayId] || { name: f.awayName, color: "#bee503" };
              return {
                league: "لیگ برتر ایران",
                minute: f.time.replace(":", ""),
                home: h.name, away: a.name,
                hs: "", as: "",
                homeLogo: `https://www.victoryapi.ir/flags/png/teams/${f.homeId}.png`,
                awayLogo: `https://www.victoryapi.ir/flags/png/teams/${f.awayId}.png`,
                glowHome: h.color, glowAway: a.color,
                hot: false,
                time: f.time,
              };
            });
            if (mapped.length) setLiveMatches(mapped);
          }
        }
      }
    }).catch(() => {});
    return () => clearInterval(t);
  }, []);
  const timeStr = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(now);
  const dateStr = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(now);

  // اسلایدر خودکار هیرو
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);

  // Drawer ورزش‌ها
  const [menuOpen, setMenuOpen] = useState(false);
  const sportsData = DRAWER_SPORTS;
  const [menuSearch, setMenuSearch] = useState("");
  const [menuView, setMenuView] = useState<string>("root");
  const filtered = sportsData.filter((s) => s.name.includes(menuSearch.trim()) || menuSearch.trim() === "");
  const activeSportObj = menuView !== "root" ? sportsData.find((s) => s.key === menuView) : null;

  return (
    <div className="min-h-screen text-white" style={{ background: "#252525" }}>



      {/* ============ Drawer ورزش‌ها ============ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <aside
            className="absolute top-0 bottom-0 right-0 w-[85%] max-w-[400px] overflow-y-auto border-l border-white/10 animate-[megaSlideIn_0.28s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: "#252525" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-white/5 px-5 py-4" style={{ background: "rgba(37,37,37,0.9)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="headline text-lg" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ورزش‌ها</h3>
                <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70"><X size={18} /></button>
              </div>
              <input
                value={menuSearch} onChange={(e) => { setMenuSearch(e.target.value); setMenuView("root"); }}
                placeholder="دنبال چه ورزشی هستی؟"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm placeholder-slate-500 focus:outline-none focus:border-[#005cfc] text-white"
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
                      <ChevronLeft size={18} className="text-slate-600 mr-auto" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ============ ۳. هیرو دوتکه ============ */}
      <section className="w-full px-4 pt-4">
        <div className="relative max-w-[1320px] mx-auto rounded-3xl overflow-hidden border border-white/10" style={{ minHeight: 380 }}>
          {/* اسلایدهای پس‌زمینه */}
          {HERO_SLIDES.map((img, i) => (
            <div key={i} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: `url('${img}')` }} />
          ))}
          {/* Overlay تیره + blue tint */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(270deg, rgba(7,11,20,0.96) 0%, rgba(7,11,20,0.75) 45%, rgba(7,11,20,0.3) 72%, rgba(37,37,37,0.95) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(37,37,37,0.9), transparent 45%, rgba(7,11,20,0.45))" }} />

          <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-between gap-8 px-6 md:px-10 py-10">
            {/* الف) معرفی و اسلایدر — راست (~۶۰٪) */}
            <div className="max-w-xl text-right w-full">
              <h1 className="headline text-[32px] md:text-[42px] leading-[1.3] text-white">
                هیجان فوتبال ، لحظه به لحظه
              </h1>
              <p className="headline text-[22px] md:text-[26px] mt-2">
                همراه با{" "}
                <span style={{ background: "linear-gradient(90deg, #005cfc, #bee503)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  پلاس ورزش
                </span>
              </p>
              <p className="text-[13px] md:text-[14px] leading-7 mt-4 max-w-md text-white/60">
                جدیدترین اخبار، نتایج زنده، ویدیوها و تحلیل‌های اختصاصی فوتبال ایران و جهان را از دست ندهید.
              </p>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 mt-6 px-7 h-[46px] rounded-full text-sm font-black text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #005cfc, #bee503)", boxShadow: "0 6px 26px rgba(0,92,252,0.35)" }}
              >
                مشاهده آخرین اخبار <ArrowLeftInline />
              </Link>

              {/* Dots */}
              <div className="flex items-center justify-start gap-2 mt-8">
                {HERO_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)} aria-label={`اسلاید ${i + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-7" : "w-2 bg-white/25 hover:bg-white/50"}`} style={i === slide ? { background: "linear-gradient(90deg, #005cfc, #bee503)", boxShadow: "0 0 10px rgba(0,92,252,0.5)" } : undefined} />
                ))}
              </div>
            </div>

            {/* ب) کارت مسابقه پیش‌رو — چپ (~۴۰٪) */}
            <div className="relative w-full max-w-[360px] shrink-0">
              {/* Ambient Glow — آبی استقلال چپ، قرمز پرسپولیس راست */}
              <span aria-hidden className="absolute top-1/3 -right-8 w-36 h-36 rounded-full blur-2xl opacity-40 pointer-events-none" style={{ background: DERBY.persepolis.glow }} />
              <span aria-hidden className="absolute top-1/3 -left-8 w-36 h-36 rounded-full blur-2xl opacity-40 pointer-events-none" style={{ background: DERBY.esteghlal.glow }} />

              <div className="relative rounded-2xl border border-white/12 backdrop-blur-md overflow-hidden" style={{ background: "rgba(37,37,37,0.9)" }}>
                {/* بج بازی بعدی — وسط بالا */}
                <div className="flex justify-center pt-4">
                  <span className="text-[10px] font-black px-3 py-1 rounded-full border border-white/15 text-white/85" style={{ background: "rgba(255,255,255,0.06)" }}>بازی بعدی</span>
                </div>
                {/* تورنمنت و تاریخ */}
                <div className="text-center mt-3 pb-3 border-b border-white/8">
                  <p className="text-[12px] font-bold" style={{ color: "#005cfc" }}>لیگ برتر ایران</p>
                  <p className="text-[11px] mt-1 text-slate-400">جمعه، ۲۴ اردیبهشت ۱۴۰۳</p>
                </div>
                {/* تقابل دو تیم — پرسپولیس راست، استقلال چپ */}
                <div className="px-5 py-6 flex items-center justify-between">
                  {/* پرسپولیس — راست */}
                  <div className="flex flex-col items-center gap-2 w-[90px]">
                    <img src={DERBY.persepolis.logo} alt="پرسپولیس" className="w-14 h-14 object-contain" />
                    <span className="text-[12px] font-bold text-white">پرسپولیس</span>
                  </div>
                  {/* ساعت */}
                  <div className="text-center shrink-0">
                    <span className="tabular text-[30px] font-black block leading-none" style={{ color: "#005cfc", textShadow: "0 0 20px rgba(0,92,252,0.45)" }}>19:30</span>
                  </div>
                  {/* استقلال — چپ (با ۲ ستاره طلایی) */}
                  <div className="flex flex-col items-center gap-2 w-[90px]">
                    <div className="flex items-center gap-0.5 h-3">
                      <StarSVG /><StarSVG />
                    </div>
                    <img src={DERBY.esteghlal.logo} alt="استقلال" className="w-14 h-14 object-contain" />
                    <span className="text-[12px] font-bold text-white">استقلال</span>
                  </div>
                </div>
                {/* دکمه مشاهده پیش بازی */}
                <div className="px-5 pb-5">
                  <button onClick={() => router.push("/football/leagues/persian-gulf")} className="w-full py-2.5 rounded-full text-[13px] font-bold text-white border border-white/15 transition-all duration-200 hover:bg-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
                    مشاهده پیش بازی
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* فلش‌های ناوبری دو طرف هیرو */}
          <button onClick={() => setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} aria-label="اسلاید قبلی" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white transition-colors hover:bg-white/10" style={{ background: "rgba(37,37,37,0.65)", backdropFilter: "blur(8px)" }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setSlide((s) => (s + 1) % HERO_SLIDES.length)} aria-label="اسلاید بعدی" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white transition-colors hover:bg-white/10" style={{ background: "rgba(37,37,37,0.65)", backdropFilter: "blur(8px)" }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* ============ ۴. نوار افقی مسابقات زنده ============ */}
      <section id="games" className="w-full py-4" style={{ background: "#252525" }}>
        <div className="max-w-[1320px] mx-auto px-4">
          {/* هدر بخش */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="headline text-[17px] text-white">بازی های زنده</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse" style={{ background: "rgba(232,56,93,0.16)", color: "#ff6b8a" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> زنده
              </span>
            </div>
            <Link href="/football/leagues/premier-league/matches" className="text-[11px] font-bold px-4 py-1.5 rounded-full border transition-colors hover:bg-white/5" style={{ borderColor: "rgba(0,92,252,0.35)", color: "#005cfc" }}>
              مشاهده همه
            </Link>
          </div>

          {/* کارت‌های زنده — ۴ ستون دسکتاپ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {liveMatches.map((m, i) => (
              <Link
                key={i} href={`/football/leagues/${m.league.includes("لالیگا") ? "la-liga" : m.league.includes("انگلیس") ? "premier-league" : m.league.includes("آسیا") ? "super-lig" : "persian-gulf"}/matches`}
                className="group relative block rounded-2xl border border-white/10 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-white/20"
                style={{ background: "#2a2a2a" }}
                dir="rtl"
              >
                {/* Glow — دو نور محو در سمت هر تیم + مرکز تیره برای خوانایی نتیجه */}
                <span aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(90deg, ${m.glowHome}40 0%, transparent 35%, transparent 65%, ${m.glowAway}40 100%)` }} />
                <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -right-4 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" style={{ background: m.glowHome }} />
                <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -left-4 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" style={{ background: m.glowAway }} />

                <div className="relative z-10 px-4 pt-3 pb-3.5">
                  {/* نام لیگ وسط + دقیقه گوشه */}
                  <div className="relative mb-3">
                    <p className="text-[10px] font-bold text-center text-slate-400 truncate px-8">{m.league}</p>
                    <span className={`absolute top-0 left-0 flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full tabular ${m.hot ? "animate-pulse" : ""}`} style={m.hot ? { background: "rgba(232,56,93,0.18)", color: "#ff6b8a" } : { background: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                      {m.hot && <span className="w-1 h-1 rounded-full bg-red-400" />}{m.minute}&apos;
                    </span>
                  </div>
                  {/* تیم‌ها + نتیجه */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img src={m.homeLogo} alt={m.home} className="w-8 h-8 object-contain shrink-0" loading="lazy" />
                      <span className="text-[12px] font-bold truncate" style={{ color: "#F5F7FA" }}>{m.home}</span>
                    </div>
                    <span className="tabular text-[22px] font-black shrink-0 px-3 leading-none" style={{ color: (m as any).time ? "#005cfc" : "#fff" }}>
                      {(m as any).time ? (m as any).time : <>{m.hs} <span className="text-slate-500">-</span> {m.as}</>}
                    </span>
                    <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                      <span className="text-[12px] font-bold truncate text-left" style={{ color: "#F5F7FA" }}>{m.away}</span>
                      <img src={m.awayLogo} alt={m.away} className="w-8 h-8 object-contain shrink-0" loading="lazy" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ۵. گرید ۴ ستونه محتوای اصلی ============ */}
      <main id="videos" className="flex-1 w-full max-w-[1320px] mx-auto px-4 py-5 pb-28">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* ستون ۱ (راست‌ترین): جدول لیگ برتر ایران */}
          <div className="rounded-2xl border border-white/10 p-4 flex flex-col" style={{ background: "rgba(37,37,37,0.9)", backdropFilter: "blur(8px)" }}>
            <h3 className="headline text-[16px] text-white mb-3">جدول لیگ برتر ایران</h3>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-slate-500" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <th className="px-3 py-2 text-right font-bold rounded-r-lg">تیم</th>
                  <th className="px-2 py-2 text-center font-bold">بازی</th>
                  <th className="px-2 py-2 text-center font-bold rounded-l-lg">امتیاز</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => (
                  <tr key={row.name} className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${i === 0 ? "bg-sky-500/5" : ""}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="tabular text-[11px] w-4 shrink-0" style={{ color: i === 0 ? "#005cfc" : "#64748b" }}>{["۱","۲","۳","۴","۵"][i]}</span>
                        <img src={row.logo} alt={row.name} className="w-5 h-5 object-contain shrink-0" loading="lazy" />
                        <span className="font-bold truncate text-white">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center tabular text-slate-400">{row.played}</td>
                    <td className="px-2 py-2.5 text-center tabular font-black" style={{ color: "#005cfc" }}>{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/football/leagues/persian-gulf/standings" className="mt-auto pt-3 text-center text-[12px] font-bold hover:underline" style={{ color: "#bee503" }}>مشاهده جدول کامل</Link>
          </div>

          {/* ستون ۲: آخرین اخبار */}
          <div className="rounded-2xl border border-white/10 p-4 flex flex-col" style={{ background: "rgba(37,37,37,0.9)", backdropFilter: "blur(8px)" }}>
            <h3 className="headline text-[16px] text-white mb-3">آخرین اخبار</h3>
            <div className="flex-1 flex flex-col gap-2.5">
              {NEWS.map((n) => (
                <Link key={n.title} href="/news" className="flex items-start gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5 transition-colors hover:bg-white/[0.06]">
                  {/* تصویر — سمت راست (اول در RTL) */}
                  <img src={n.img} alt={n.title} className="w-[84px] h-[58px] rounded-lg object-cover shrink-0" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold leading-5 line-clamp-2 text-white">{n.title}</p>
                    <span className="text-[10px] mt-1 block text-slate-500">{n.time}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/news" className="mt-auto pt-3 text-center text-[12px] font-bold hover:underline" style={{ color: "#bee503" }}>مشاهده همه اخبار</Link>
          </div>

          {/* ستون ۳: ویدیوهای برتر */}
          <div className="rounded-2xl border border-white/10 p-4 flex flex-col" style={{ background: "rgba(37,37,37,0.9)", backdropFilter: "blur(8px)" }}>
            <h3 className="headline text-[16px] text-white mb-3">ویدیوهای برتر</h3>
            {/* ویدیو شاخص */}
            <div className="relative rounded-xl overflow-hidden group cursor-pointer mb-3" style={{ aspectRatio: "16/9" }}>
              <img src={VIDEOS.featured.img} alt={VIDEOS.featured.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              {/* دکمه Play شیشه‌ای */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full flex items-center justify-center border border-white/25 transition-transform duration-200 group-hover:scale-110" style={{ background: "rgba(37,37,37,0.65)", backdropFilter: "blur(6px)" }}>
                  <Play size={20} className="text-white translate-x-[-1px]" />
                </span>
              </span>
              <span className="absolute bottom-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded tabular" style={{ background: "rgba(7,11,20,0.8)", color: "#fff" }}>{VIDEOS.featured.duration}</span>
              <p className="absolute bottom-2 right-2 text-[11px] font-bold text-white truncate max-w-[62%]">{VIDEOS.featured.title}</p>
            </div>
            {/* ۳ تامبنیل کوچک */}
            <div className="grid grid-cols-3 gap-2 flex-1">
              {VIDEOS.small.map((v, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden group cursor-pointer" style={{ aspectRatio: "16/10" }}>
                  <img src={v.img} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center"><Play size={16} className="text-white/90" /></span>
                  <span className="absolute bottom-1 left-1 text-[8px] font-black px-1 rounded tabular" style={{ background: "rgba(7,11,20,0.8)", color: "#fff" }}>{v.duration}</span>
                </div>
              ))}
            </div>
            <Link href="/live" className="mt-auto pt-3 text-center text-[12px] font-bold hover:underline" style={{ color: "#bee503" }}>مشاهده همه ویدیوها</Link>
          </div>

          {/* ستون ۴ (چپ‌ترین): بهترین گلزنان */}
          <div className="rounded-2xl border border-white/10 p-4 flex flex-col" style={{ background: "rgba(37,37,37,0.9)", backdropFilter: "blur(8px)" }}>
            <h3 className="headline text-[16px] text-white mb-3">بهترین گلزنان</h3>
            <div className="flex-1 space-y-1.5">
              {TOP_SCORERS.map((p) => (
                <div key={p.name} className="flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors hover:bg-white/[0.04]" style={p.rank === "۱" ? { background: "rgba(0,92,252,0.07)" } : undefined}>
                  <span className="tabular font-black text-[12px] w-5 text-center shrink-0" style={{ color: p.rank === "۱" ? "#005cfc" : "#64748b" }}>{p.rank}</span>
                  {/* عکس دایره‌ای چهره — fallback حروف اول */}
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 border border-white/10" style={{ background: `${p.color}25`, color: p.color }}>{p.name.slice(0, 2)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold truncate text-white">{p.name}</p>
                    <span className="text-[10px] text-slate-500">{p.team}</span>
                  </div>
                  <span className="font-black text-[14px] text-white shrink-0">{p.goals} <span className="text-[10px] font-normal text-slate-500">گل</span></span>
                </div>
              ))}
            </div>
            <Link href="/football/leagues/persian-gulf/standings" className="mt-auto pt-3 text-center text-[12px] font-bold hover:underline" style={{ color: "#bee503" }}>مشاهده آمار کامل</Link>
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
