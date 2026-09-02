"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SPORTS, getSport } from "@/lib/sports";

type Event = {
  id: number; title: string; league: string; homeTeam: string; awayTeam: string;
  homeScore: number | null; awayScore: number | null; status: string;
  startTime: string; stadium: string | null; isHot: boolean;
};
type Game = {
  id: number; title: string; description: string | null; gameType: string;
  prize: string | null; endsAt: string | null; programTitle: string | null;
  participants: number;
};

function formatTime(iso: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "long" }).format(new Date(iso));
  } catch { return ""; }
}

export default function SportPage() {
  const { sport: sportKey, league } = useParams<{ sport: string; league?: string[] }>();
  const router = useRouter();
  const sport = getSport(sportKey);
  const leagueName = league?.length ? decodeURIComponent(league[0]) : "";
  const [events, setEvents] = useState<Event[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [sportNews, setSportNews] = useState<Array<{ title: string; link: string; description: string; image: string | null; time: string; category: string; sport: { name: string; color: string } }> | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/home").then((r) => r.json()).catch(() => null);
    if (res?.success) { setEvents(res.events ?? []); setGames(res.games ?? []); }
  }, []);

  useEffect(() => { load(); }, [load]);
  // اخبار اختصاصی ورزش از RSS واقعی
  useEffect(() => {
    if (!sport) return;
    fetch(`/api/news/mixed?sport=${sport.key}`).then((r) => r.json()).then((res) => {
      if (res?.success) setSportNews(res.items ?? []);
    }).catch(() => {});
  }, [sport]);

  if (!sport) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center" style={{ background: "#252525" }}>
        <span className="text-5xl">🤷</span>
        <h1 className="headline text-xl">ورزش پیدا نشد</h1>
        <Link href="/" className="btn-green px-5 py-2 text-sm">بازگشت به خانه</Link>
      </div>
    );
  }

  const liveEvents = events.filter((e) => e.status === "live");
  const color = sport.color;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#252525" }}>
      {/* هدر */}
      <header className="sticky top-0 z-30 neon-header flex items-center justify-between px-3 h-16 w-full" style={{ background: "#252525" }}>
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/10"><span className="material-symbols-outlined text-[20px]">arrow_right_alt</span></button>
          <Link href="/" className="headline text-lg"><span className="text-primary">Varzesh</span>Plus</Link>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}>{sport.name}</span>
      </header>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 py-6 space-y-6">
        {/* هیرو ورزش */}
        <section className="relative rounded-2xl overflow-hidden p-6 md:p-10 border" style={{ background: `linear-gradient(135deg, ${color}2e, #222222 55%)`, borderColor: `${color}44`, boxShadow: `0 0 30px ${color}22` }}>
          <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: `${color}33` }} />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="text-6xl drop-shadow-lg">{sport.emoji}</span>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="headline text-2xl md:text-3xl">{sport.name}</h1>
                {leagueName && (
                  <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff", boxShadow: "0 0 12px rgba(190,229,3,0.4)" }}>{leagueName}</span>
                )}
              </div>
              <p className="text-sm mt-2 max-w-lg" style={{ color: "var(--color-muted)" }}>مسابقات، پخش‌های زنده و بازی‌های مرتبط با {sport.name} {leagueName ? `— ${leagueName}` : ""}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {sport.subs.map((s) => (
                  <button key={s} onClick={() => router.push(`/sport/${sport.key}/${encodeURIComponent(s)}`)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${s === leagueName ? "text-white font-bold border-transparent" : "bg-white/5 border-white/10 text-white/75 hover:bg-white/10"}`} style={s === leagueName ? { background: `linear-gradient(135deg,#005cfc,#bee503)` } : undefined}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* پخش‌های زنده مرتبط */}
        <section>
          <h2 className="headline text-lg mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color }}>sensors</span> پخش‌های زنده
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(226,59,59,0.12)", color: "#ffb4ab" }}>{liveEvents.length}</span>
          </h2>
          {liveEvents.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {liveEvents.map((e) => (
                <Link key={e.id} href="/live" className="panel p-4 flex items-center justify-between gap-3 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="live-dot shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{e.homeTeam} — {e.awayTeam}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>{e.league}{e.stadium ? ` • ${e.stadium}` : ""}</p>
                    </div>
                  </div>
                  <span className="tabular headline text-base shrink-0">{e.homeScore ?? 0} - {e.awayScore ?? 0}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
              پخش زنده‌ای برای {sport.name} در حال حاضر نیست.
            </div>
          )}
        </section>

        {/* اخبار اختصاصی ورزش — RSS واقعی */}
        <section>
          <h2 className="headline text-lg mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color }}>newspaper</span> اخبار {sport.name}
          </h2>
          {sportNews && sportNews.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {sportNews.slice(0, 6).map((n, i) => (
                <a key={i} href={n.link} target="_blank" rel="noreferrer" className="block rounded-2xl border p-4 transition-colors hover:border-white/20" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
                  <div className="flex gap-3">
                    {n.image && <img src={n.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white leading-6 line-clamp-2">{n.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        {n.category && <span className="px-1.5 py-0.5 rounded" style={{ background: `${sport.color}22`, color: sport.color }}>{n.category}</span>}
                        {n.time && <span className="text-slate-500">{n.time}</span>}
                        <span className="text-slate-600 mr-auto">خبرورزشی ↗</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
              اخبار {sport.name} به‌زودی...
            </div>
          )}
        </section>

        {/* بازی‌های مرتبط */}
        <section>
          <h2 className="headline text-lg mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color }}>sports_esports</span> بازی‌های مرتبط
          </h2>
          {games.length ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {games.slice(0, 6).map((g) => (
                <Link key={g.id} href={`/games/${g.id}`} className="game-card panel p-4 flex flex-col gap-2">
                  <h3 className="headline text-sm truncate">{g.title}</h3>
                  {g.description && <p className="text-xs line-clamp-2" style={{ color: "var(--color-muted)" }}>{g.description}</p>}
                  <div className="mt-auto flex items-center justify-between text-xs pt-2" style={{ color: "var(--color-muted)" }}>
                    <span><span className="tabular">{g.participants}</span> شرکت‌کننده</span>
                    {g.endsAt && <span className="tabular">تا {formatTime(g.endsAt)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
              بازی فعالی برای {sport.name} ثبت نشده است.
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/5 py-5 text-center text-xs" style={{ color: "var(--color-muted)" }}>
        ورزش پلاس — {sport.emoji} {sport.name} {leagueName ? `• ${leagueName}` : ""}
      </footer>
    </div>
  );
}
