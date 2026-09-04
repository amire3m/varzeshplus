"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

type Live = {
  id: number; title: string; status: string; commentatorActive: number | boolean;
  censorActive: number | boolean; delayBufferSeconds: number; hlsUrl: string | null;
};
type Match = {
  id: number; title: string; league: string; homeTeam: string; awayTeam: string;
  homeScore: number | null; awayScore: number | null; stadium: string | null;
} | null;

type ScoreTeam = { name: string; faName: string | null; abbr: string; logo: string; color: string; score: number | null; slug: string | null };
type ScoreMatch = {
  id: string; date: string; status: "live" | "upcoming" | "finished";
  minute: string | null; detail: string | null;
  home: ScoreTeam; away: ScoreTeam; venue: string | null;
  goals: Array<{ minute: string; team: string; player: string; assist: string | null }>;
};

const SCORE_LEAGUES = [
  { slug: "premier-league", label: "انگلیس" },
  { slug: "la-liga", label: "اسپانیا" },
  { slug: "bundesliga", label: "آلمان" },
  { slug: "serie-a", label: "ایتالیا" },
  { slug: "ligue-1", label: "فرانسه" },
];

export default function LivePage() {
  const [live, setLive] = useState<Live | null>(null);
  const [match, setMatch] = useState<Match>(null);
  const [notif, setNotif] = useState<{ title: string; body: string | null } | null>(null);
  const [tick, setTick] = useState(0);
  const [showAd, setShowAd] = useState(true);
  const [adCountdown, setAdCountdown] = useState(5);
  const [scoreLeague, setScoreLeague] = useState("premier-league");
  const [scoreMatches, setScoreMatches] = useState<ScoreMatch[]>([]);
  const [scoreSource, setScoreSource] = useState<string | null>(null);
  const [scoreLoading, setScoreLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/live").then((r) => r.json()).catch(() => null);
    if (res?.success) {
      setLive(res.live ?? null);
      setMatch(res.match ?? null);
      setNotif(res.lastNotification ?? null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  // تبلیغ ۵ ثانیه‌ای قبل از نمایش پخش
  useEffect(() => {
    if (!showAd) return;
    const iv = setInterval(() => setAdCountdown((c) => { if (c <= 1) { clearInterval(iv); setShowAd(false); return 0; } return c - 1; }), 1000);
    return () => clearInterval(iv);
  }, [showAd]);
  // به‌روزرسانی زنده وضعیت پخش هر ۱۰ ثانیه
  useEffect(() => {
    const t = setInterval(() => { load(); setTick((v) => v + 1); }, 10_000);
    return () => clearInterval(t);
  }, [load]);

  // اسکوربرد زنده لیگ‌های اروپا — هر ۶۰ ثانیه (هم‌گام با کش سرور)
  const loadScores = useCallback(async () => {
    setScoreLoading(true);
    const res = await fetch(`/api/live-score?league=${scoreLeague}`).then((r) => r.json()).catch(() => null);
    if (res?.success) {
      setScoreMatches(res.matches ?? []);
      setScoreSource(res.source ?? null);
    }
    setScoreLoading(false);
  }, [scoreLeague]);

  useEffect(() => { loadScores(); }, [loadScores]);
  useEffect(() => {
    const t = setInterval(loadScores, 60_000);
    return () => clearInterval(t);
  }, [loadScores]);

  const onAir = live?.status === "on_air";
  const censored = !!live?.censorActive;

  return (
    <PageShell badge="پخش زنده" activeDock="matches">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-5">
        {/* تبلیغ قبل از پخش */}
        {showAd && (
          <div className="rounded-[14px] border relative overflow-hidden flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ aspectRatio: "16/9", background: "#2a2a2a", borderColor: "rgba(0,92,252,0.35)", boxShadow: "0 0 24px rgba(0,92,252,0.2)" }}>
            <span className="text-xs px-3 py-1 rounded-full bg-black/50 border border-white/10 text-white">تبلیغ • {adCountdown}s</span>
            <h3 className="headline text-lg text-white">حامی پخش زنده — همراه اول</h3>
            <p className="text-sm" style={{ color: "#8FA1B5" }}>پخش پس از پایان تبلیغ آغاز می‌شود</p>
            <button onClick={() => setShowAd(false)} className="px-6 py-2 rounded-full text-sm font-black text-white mt-2" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>رد کردن تبلیغ</button>
            <div className="w-full max-w-[320px] h-1.5 bg-white/10 rounded-full overflow-hidden mt-2"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${((5-adCountdown)/5)*100}%`, background: "linear-gradient(90deg, #005cfc, #bee503)" }} /></div>
          </div>
        )}
        {/* پلیر — جایگذار آماده HLS */}
        {!showAd && <div className="rounded-[14px] border relative overflow-hidden" style={{ aspectRatio: "16/9", background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
          {censored ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "#2a2a2a" }}>
              <div className="headline text-3xl text-white">ورزش<span style={{ color: "#005cfc" }}>پلاس</span></div>
              <p className="text-sm" style={{ color: "#8FA1B5" }}>چند لحظه صبر کنید... بازگشت به پخش</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "repeating-linear-gradient(115deg, #2a2a2a 0 14px, #222222 14px 28px)" }}>
              {onAir ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#E8385D" }}>
                    <span className="live-dot" /> پخش زنده در جریان است
                  </div>
                  <p className="text-xs" style={{ color: "#8FA1B5" }}>پلیر HLS پس از اتصال خط پخش (CDN داخلی) فعال می‌شود</p>
                </>
              ) : (
                <p className="text-sm" style={{ color: "#8FA1B5" }}>فعلاً پخش زنده‌ای در جریان نیست</p>
              )}
            </div>
          )}
          {match && onAir && (
            <div className="absolute bottom-3 inset-x-3 rounded-xl border px-4 py-2.5 flex items-center justify-between text-sm" style={{ background: "#2e2e2e", borderColor: "rgba(255,255,255,0.1)" }}>
              <span className="font-medium text-white">{match.homeTeam}</span>
              <span className="tabular headline text-lg text-white">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span>
              <span className="font-medium text-white">{match.awayTeam}</span>
            </div>
          )}
        </div>}

        {/* نوار اسکوربورد */}
        {live && (
          <div className="rounded-[14px] border p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
            <span className="font-medium text-white">{live.title}</span>
            <span className="flex items-center gap-1.5" style={{ color: live.commentatorActive ? "#005cfc" : "#8FA1B5" }}>
              گزارشگر {live.commentatorActive ? "فعال" : "غیرفعال"}
            </span>
            <span style={{ color: "#8FA1B5" }}>تأخیر کنترل‌شده پخش: <span className="tabular">{live.delayBufferSeconds}s</span></span>
            <span className="mr-auto text-xs tabular" style={{ color: "#8FA1B5" }}>به‌روزرسانی خودکار {tick > 0 && `(${tick})`}</span>
          </div>
        )}

        {/* آخرین اعلان */}
        {notif && (
          <div className="rounded-[14px] border p-4 flex items-start gap-3" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
            <span className="text-xs font-bold px-2 py-1 rounded shrink-0" style={{ background: "rgba(123,47,247,0.15)", color: "#a78bfa" }}>اعلان</span>
            <div>
              <div className="text-sm font-medium text-white">{notif.title}</div>
              {notif.body && <p className="text-sm" style={{ color: "#8FA1B5" }}>{notif.body}</p>}
            </div>
          </div>
        )}

        {/* نتایج زنده لیگ‌های اروپا */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="headline text-base text-white flex items-center gap-2">
              {scoreMatches.some((m) => m.status === "live") ? "بازی‌های زنده" : "بازی‌های امروز و پیش رو"}
              {scoreMatches.some((m) => m.status === "live") ? (
                <span className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse" style={{ background: "rgba(232,56,93,0.16)", color: "#ff6b8a" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> زنده ({scoreMatches.filter((m) => m.status === "live").length})
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 text-slate-400">
                  فعلاً بازی زنده‌ای نیست
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1.5">
              {SCORE_LEAGUES.map((l) => (
                <button
                  key={l.slug} onClick={() => setScoreLeague(l.slug)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${scoreLeague === l.slug ? "text-white" : "text-slate-400 border-white/10 hover:text-white"}`}
                  style={scoreLeague === l.slug ? { background: "linear-gradient(135deg, #005cfc, #bee503)", borderColor: "transparent" } : { background: "rgba(255,255,255,0.05)" }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {scoreLoading ? (
            <div className="grid gap-2.5 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-[14px] border p-4 flex items-center gap-3 animate-pulse" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2"><div className="h-3 rounded bg-white/10 w-3/4" /><div className="h-2.5 rounded bg-white/5 w-1/2" /></div>
                  <div className="w-16 h-6 rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : scoreMatches.length === 0 ? (
            <div className="rounded-[14px] border p-6 text-center text-sm" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)", color: "#8FA1B5" }}>
              فعلاً بازی‌ای در این لیگ ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-2.5">
              {scoreMatches.map((m) => (
                <ScoreMatchCard key={m.id} m={m} />
              ))}
              {scoreSource && <p className="text-center text-[10px] text-slate-600">منبع: {scoreSource === "worldcup26" ? "worldcup26.ir" : "ESPN"} • به‌روزرسانی هر دقیقه</p>}
            </div>
          )}
        </div>

        {/* بازی مرتبط با رویداد زنده */}
        <div>
          <h2 className="headline text-base mb-3 text-white">بازی‌های مرتبط</h2>
          <div className="rounded-[14px] border p-4 text-sm" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)", color: "#8FA1B5" }}>
            پیش‌بینی و کوییزهای مرتبط با این رویداد در <Link href="/#games" className="hover:underline" style={{ color: "#005cfc" }}>بازی‌های فعال</Link> در دسترس است.
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function fmtFaDateTime(v: string | undefined): string | null {
  if (!v) return null;
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(d);
  } catch {
    return v;
  }
}

/** تاریخ نسبی فارسی: امروز/فردا/پس‌فردا + ساعت */
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

function TeamChip({ t }: { t: ScoreTeam }) {
  const display = t.faName ?? t.name;
  const inner = (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      {t.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={t.logo} alt={display} className="w-9 h-9 object-contain shrink-0" loading="lazy" />
      ) : (
        <span className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 border border-white/10" style={{ background: `${t.color}25`, color: t.color }}>{display.slice(0, 2)}</span>
      )}
      <span className="text-[12px] font-bold text-center leading-4 text-white">{display}</span>
    </div>
  );
  return t.slug ? <Link href={`/football/teams/${t.slug}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">{inner}</Link> : <span className="flex-1 min-w-0">{inner}</span>;
}

function ScoreMatchCard({ m }: { m: ScoreMatch }) {
  const isLive = m.status === "live";
  const rel = m.status === "upcoming" ? faRelativeDay(m.date) : null;
  return (
    <div className="rounded-[14px] border p-4" style={{ background: "#2a2a2a", borderColor: isLive ? "rgba(232,56,93,0.35)" : "rgba(255,255,255,0.1)" }}>
      <div className="flex items-start justify-between gap-1">
        <TeamChip t={m.home} />
        <div className="text-center shrink-0 px-1 pt-2 min-w-[76px]">
          {m.status === "upcoming" ? (
            rel ? (
              <>
                <span className="block tabular text-[19px] font-black leading-none" style={{ color: "#005cfc" }} dir="ltr">{rel.time}</span>
                <span className="block text-[10px] font-bold text-slate-400 mt-1">{rel.day}</span>
              </>
            ) : (
              <span className="block text-[11px] font-bold text-slate-400">به‌زودی</span>
            )
          ) : (
            <span className="tabular headline text-xl text-white">{m.home.score ?? 0} - {m.away.score ?? 0}</span>
          )}
          {isLive && m.minute && (
            <span className="flex items-center justify-center gap-1 mt-1 text-[10px] font-black tabular" style={{ color: "#ff6b8a" }}>
              <span className="live-dot" style={{ width: 6, height: 6 }} /> {m.minute}
            </span>
          )}
          {m.status === "finished" && <span className="block mt-1 text-[10px] text-slate-500">پایان</span>}
        </div>
        <TeamChip t={m.away} />
      </div>
      {m.goals.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
          {m.goals.slice(0, 6).map((g, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="tabular font-black shrink-0" style={{ color: "#bee503" }}>{g.minute}</span>
              <span className="font-bold text-slate-200 truncate">{g.player}</span>
              {g.assist && <span className="truncate text-slate-500">(پاس: {g.assist})</span>}
            </div>
          ))}
        </div>
      )}
      {m.venue && <p className="mt-2 text-[10px] text-slate-600">{m.venue}</p>}
    </div>
  );
}
