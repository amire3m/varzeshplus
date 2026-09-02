"use client";

/**
 * FixedChrome — هدر و داک شناور ثابت
 * این کامپوننت در RootLayout رندر می‌شود و با ناوبری هرگز re-render نمی‌شود.
 * (رفع باگ: با هر کلیک روی لینک‌ها، هدر/داک از نو mount و استایل‌ها تغییر می‌کرد)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Clock3, CalendarDays, ChevronLeft, ChevronRight,
  Home, Trophy, Video, Heart, User, Gamepad2, Radio,
} from "lucide-react";
import { DRAWER_SPORTS } from "@/lib/sports";

const NAV_ITEMS = [
  { label: "فوتبال", href: "/football/leagues/premier-league" },
  { label: "مسابقات", href: "/football/leagues/premier-league/matches" },
  { label: "اخبار", href: "/news" },
  { label: "جدول لیگ‌ها", href: "/football/leagues/premier-league/standings" },
  { label: "بازیکنان", href: "/football/teams/arsenal/squad" },
  { label: "آمار", href: "/football/leagues/premier-league/stats" },
];

const DOCK_ITEMS = [
  { key: "home", label: "خانه", href: "/", icon: Home },
  { key: "minigame", label: "منی گیم", href: "/games", icon: Gamepad2 },
  { key: "favorites", label: "علاقه‌مندی", href: "/football/leagues/persian-gulf", icon: Heart },
  { key: "live", label: "پخش زنده", href: "/live", icon: Radio },
  { key: "profile", label: "پروفایل", href: "/login", icon: User },
];

/** صفحاتی که نباید داک/هدر مشترک داشته باشند (مثل admin) */
const HIDE_PREFIXES = ["/admin"];

export function FixedChrome() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  if (HIDE_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  // ساعت و تاریخ شمسی زنده
  const [now, setNow] = useState(() => new Date());
  const [user, setUser] = useState<{ id: number; displayName: string | null } | null>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    fetch("/api/home").then((r) => r.json()).then((res) => { if (res?.success) setUser(res.user ?? null); }).catch(() => {});
    return () => clearInterval(t);
  }, []);
  const timeStr = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(now);
  const dateStr = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(now);

  // Drawer
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuView, setMenuView] = useState<string>("root");
  const sportsData = DRAWER_SPORTS;
  const filtered = sportsData.filter((s) => s.name.includes(menuSearch.trim()) || menuSearch.trim() === "");
  const activeSportObj = menuView !== "root" ? sportsData.find((s) => s.key === menuView) : null;

  return (
    <>
      {/* ============ هدر ثابت ============ */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10" style={{ background: "rgba(37,37,37,0.95)", backdropFilter: "blur(14px)" }}>
        <div className="max-w-[1320px] mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* راست: منو + برند */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="منو" className="p-1 transition-colors" style={{ color: "#005cfc" }}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="leading-none">
              <span className="headline text-[20px] block">
                <span className="text-white">Varzesh</span>{" "}
                <span className="drop-shadow-[0_0_10px_rgba(0,92,252,0.6)]" style={{ color: "#005cfc" }}>Plus</span>
              </span>
              <span className="text-[10px] block mt-1 text-slate-400">شبکه ورزش</span>
            </Link>
          </div>

          {/* وسط: ناوبری + جستجو */}
          <nav className="hidden xl:flex items-center gap-1 text-[13px]">
            {NAV_ITEMS.map((n) => {
              const isActive = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.label} href={n.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${isActive ? "bg-sky-500/15 text-white font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  {n.label}
                </Link>
              );
            })}
            <button aria-label="جستجو" className="mr-1.5 w-8 h-8 rounded-full bg-sky-500/15 flex items-center justify-center text-white transition-colors hover:bg-sky-500/30">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
            </button>
          </nav>

          {/* چپ: ساعت/تاریخ + حساب */}
          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-[12px] font-bold tabular text-white" style={{ background: "rgba(37,37,37,0.9)" }} dir="ltr">
              <Clock3 size={14} style={{ color: "#005cfc" }} />{timeStr}
            </span>
            <span className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-white" style={{ background: "rgba(37,37,37,0.9)" }}>
              <CalendarDays size={14} style={{ color: "#005cfc" }} />{dateStr}
            </span>
            {user ? (
              <Link href="/profile" className="hidden sm:flex items-center px-3 py-1.5 rounded-full border border-white/10 text-[12px] text-white" style={{ background: "rgba(37,37,37,0.9)" }}>{user.displayName}</Link>
            ) : (
              <Link href="/login" className="hidden sm:inline-flex px-4 py-1.5 rounded-full text-[12px] font-black text-white" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)", boxShadow: "0 4px 16px rgba(0,92,252,0.3)" }}>ورود</Link>
            )}
          </div>
        </div>
      </header>

      {/* ============ Drawer ورزش‌ها ============ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <aside
            className="absolute top-0 bottom-0 right-0 w-[85%] max-w-[400px] overflow-y-auto border-l border-white/10 animate-[megaSlideIn_0.28s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: "#070b14" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-white/5 px-5 py-4" style={{ background: "rgba(7,11,20,0.9)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="headline text-lg" style={{ background: "linear-gradient(135deg,#00b4d8,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ورزش‌ها</h3>
                <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70"><X size={18} /></button>
              </div>
              <input
                value={menuSearch} onChange={(e) => { setMenuSearch(e.target.value); setMenuView("root"); }}
                placeholder="دنبال چه ورزشی هستی؟"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm placeholder-slate-500 focus:outline-none focus:border-[#00b4d8] text-white"
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

      {/* ============ داک شناور ============ */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-6"
        style={{ background: "rgba(37,37,37,0.92)", backdropFilter: "blur(20px)" }}
        dir="rtl"
      >
        {DOCK_ITEMS.map((item) => {
          // فعال‌سازی درست هر آیتم بر اساس pathname
          const hrefPath = item.href.split("#")[0] || "/";
          const isActive =
            item.key === "home"
              ? pathname === "/"
              : item.href.includes("#")
                ? pathname === "/" // هش‌ها روی صفحه اصلی فعال می‌شوند
                : pathname === hrefPath || pathname.startsWith(hrefPath + "/");
          const Icon = item.icon;
          return isActive ? (
            <Link key={item.key} href={item.href} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200" style={{ background: "rgba(0,92,252,0.15)", border: "1px solid rgba(0,92,252,0.3)", color: "#005cfc" }}>
              <Icon size={18} className="fill-current" />
              <span className="text-[12px] font-black">{item.label}</span>
            </Link>
          ) : (
            <Link key={item.key} href={item.href} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white transition-colors">
              <Icon size={19} />
              <span className="text-[9px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
