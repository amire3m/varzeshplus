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
  X, Clock3, CalendarDays, ChevronLeft, ChevronRight,
  Home, Trophy, Video, Heart, User, Gamepad2, Radio,
} from "lucide-react";
import { DRAWER_SPORTS } from "@/lib/sports";

/** آیکون توپ فوتبال — پنج‌ضلعی مرکزی + خطوط دوخت */
function FootballIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 8.2l3.3 2.4-1.26 3.9h-4.08L8.7 10.6z" fill="currentColor" stroke="none" />
      <path d="M12 3v5.2M20.8 9.1l-5.5.4M18.3 20l-3.9-3.6M5.7 20l3.9-3.6M3.2 9.1l5.5.4" />
    </svg>
  );
}

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
  { key: "minigame", label: "مینی گیم", href: "/games", icon: Gamepad2 },
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

  return (
    <>
      {/* ============ هدر ثابت ============ */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10" style={{ background: "rgba(37,37,37,0.95)", backdropFilter: "blur(14px)" }}>
        <div className="max-w-[1320px] mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* راست: منو + برند */}
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="ورزش‌ها" className="p-1.5 rounded-full transition-all hover:bg-white/10 hover:scale-110" style={{ color: "#005cfc" }} title="انتخاب ورزش">
              {menuOpen ? <X size={24} /> : <FootballIcon size={26} />}
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

      {/* ============ Drawer ورزش‌ها — اسلاید انتخاب ورزش ============ */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />
          <aside
            className="absolute top-0 bottom-0 right-0 w-[88%] max-w-[420px] overflow-y-auto border-l border-white/10 animate-[megaSlideIn_0.32s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: "linear-gradient(180deg, #252525 0%, #1e1e1e 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر drawer با گرادینت توپ */}
            <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(0,92,252,0.25)" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)", boxShadow: "0 4px 18px rgba(0,92,252,0.4)" }}>
                    <FootballIcon size={24} />
                  </span>
                  <div>
                    <h3 className="headline text-lg text-white">انتخاب ورزش</h3>
                    <p className="text-[11px] text-slate-400">بخش اختصاصی خودت را بردار</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"><X size={18} /></button>
              </div>
            </div>

            {/* کارت‌های ورزش — انیمیشن stagger */}
            <div className="p-4 space-y-3">
              {DRAWER_SPORTS.map((s, i) => {
                const isFootball = s.key === "football";
                const href = isFootball ? "/football/leagues/persian-gulf" : `/sport/${s.key}`;
                const desc = isFootball ? "لیگ‌ها، جدول، اخبار و بازیکنان" : `مسابقات، اخبار و بازی‌های ${s.name}`;
                return (
                  <Link
                    key={s.key}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="relative block rounded-2xl border p-4 overflow-hidden sport-tile group"
                    style={{
                      background: `linear-gradient(135deg, ${s.color}1f, #2a2a2a 65%)`,
                      borderColor: `${s.color}44`,
                      boxShadow: `0 0 0 0 ${s.color}00`,
                      animation: `megaPop 0.4s cubic-bezier(0.22,1,0.36,1) both`,
                      animationDelay: `${i * 70}ms`,
                    }}
                  >
                    {/* glow hover */}
                    <span className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none" style={{ background: s.color }} />
                    <div className="relative flex items-center gap-3.5">
                      <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${s.color}26`, border: `1px solid ${s.color}55` }}>{s.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="headline text-[15px] text-white">{s.name}</span>
                          {isFootball && <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)" }}>پیشنهادی</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                      </div>
                      <ChevronLeft size={20} className="text-slate-500 group-hover:text-white group-hover:-translate-x-1 transition-all shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>

            <p className="text-center text-[10px] text-slate-600 pb-6">ورزش‌های بیشتر به‌زودی اضافه می‌شوند</p>
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
