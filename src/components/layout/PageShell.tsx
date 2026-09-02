"use client";

/**
 * PageShell — قالب مشترک Dark Cyberpunk برای تمام صفحات Plus Varzesh
 * شامل: Header (منو + برند + ساعت/تاریخ) + Drawer + Dock شناور پایین
 * محتوای هر صفحه از children تزریق می‌شود.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu, X, Clock3, CalendarDays, ChevronLeft, ChevronRight,
  Home, Trophy, Video, Heart, User,
} from "lucide-react";
import { DRAWER_SPORTS } from "@/lib/sports";

type Props = {
  children: ReactNode;
  /** عنوان کوچک کنار برند (مثلاً نام لیگ/تیم) */
  badge?: string;
  /** آیتم فعال داک پایین */
  activeDock?: "home" | "matches" | "videos" | "favorites" | "profile";
};

const NAV_ITEMS = [
  { label: "فوتبال", href: "/football/leagues/premier-league" },
  { label: "مسابقات", href: "/football/leagues/premier-league/matches" },
  { label: "اخبار", href: "/news" },
  { label: "جدول لیگ‌ها", href: "/football/leagues/premier-league/standings" },
  { label: "بازیکنان", href: "/football/teams/arsenal/squad" },
  { label: "آمار", href: "/football/leagues/premier-league/stats" },
];

export function PageShell({ children, badge, activeDock }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: number; displayName: string | null } | null>(null);

  // ساعت و تاریخ شمسی زنده
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    fetch("/api/home").then((r) => r.json()).then((res) => { if (res?.success) setUser(res.user ?? null); }).catch(() => {});
    return () => clearInterval(t);
  }, []);
  const timeStr = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(now);
  const dateStr = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(now);

  // Drawer
  const sportsData = DRAWER_SPORTS;
  const [menuSearch, setMenuSearch] = useState("");
  const [menuView, setMenuView] = useState<string>("root");
  const filtered = sportsData.filter((s) => s.name.includes(menuSearch.trim()) || menuSearch.trim() === "");
  const activeSportObj = menuView !== "root" ? sportsData.find((s) => s.key === menuView) : null;

  // آیتم فعال ناوبری از pathname
  const isActiveNav = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0].replace("/#videos", "/"));

  const dockItems = [
    { key: "home", label: "خانه", href: "/", icon: Home },
    { key: "matches", label: "مسابقات", href: "/football/leagues/premier-league/matches", icon: Trophy },
    { key: "videos", label: "ویدیو", href: "/#videos", icon: Video },
    { key: "favorites", label: "علاقه‌مندی‌ها", href: "/football/leagues/persian-gulf", icon: Heart },
    { key: "profile", label: "پروفایل", href: user ? "/profile" : "/login", icon: User },
  ] as const;

  return (
    <div className="min-h-screen text-white" style={{ background: "#252525" }}>

      {/* ============ هدر ============ */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10" style={{ background: "rgba(37,37,37,0.95)", backdropFilter: "blur(14px)" }}>
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
            {badge && (
              <span className="hidden sm:inline text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/70 bg-white/5">{badge}</span>
            )}
          </div>

          {/* وسط: ناوبری */}
          <nav className="hidden xl:flex items-center gap-1 text-[13px]">
            {NAV_ITEMS.map((n) => {
              const isActive = isActiveNav(n.href);
              return (
                <Link
                  key={n.label} href={n.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${isActive ? "bg-sky-500/15 text-white font-bold" : "text-slate-400 hover:text-white"}`}
                >
                  {n.label}
                </Link>
              );
            })}
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

      {/* ============ محتوای صفحه ============ */}
      <div className={activeDock ? "pb-24" : ""}>{children}</div>

      {/* ============ داک شناور ============ */}
      {activeDock && (
        <nav
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-6"
          style={{ background: "rgba(37,37,37,0.92)", backdropFilter: "blur(20px)" }}
          dir="rtl"
        >
          {dockItems.map((item) => {
            const active = activeDock === item.key;
            const Icon = item.icon;
            return (
              <Link
                key={item.key} href={item.href}
                className={`flex items-center gap-1.5 transition-all duration-200 ${active ? "px-3.5 py-1.5 rounded-full" : "flex-col gap-0.5"}`}
                style={active
                  ? { background: "rgba(0,92,252,0.15)", border: "1px solid rgba(0,92,252,0.3)", color: "#005cfc" }
                  : { color: "#94a3b8" }}
              >
                <Icon size={active ? 18 : 19} className={active ? "fill-current" : ""} />
                <span className={`${active ? "text-[12px] font-black" : "text-[9px] font-bold"}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
