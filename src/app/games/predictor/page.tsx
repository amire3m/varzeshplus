"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Target, Medal } from "lucide-react";

function ProbsHint({ homeSlug, awaySlug, league }: { homeSlug: string; awaySlug: string; league: string }) {
  const [txt, setTxt] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/api/football/probs?homeSlug=${homeSlug}&awaySlug=${awaySlug}&league=${league}`)
      .then((r) => r.json())
      .then((res) => {
        if (alive && res?.success && res.covered) {
          setTxt(`مدل: ${res.home}٪ برد میزبان • ${res.draw}٪ مساوی • ${res.away}٪ برد میهمان (محتمل: ${res.likely})`);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [homeSlug, awaySlug, league]);
  if (!txt) return null;
  return <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-500">📊 {txt}</div>;
}

type Fx = {
  id: string; date: string; status: string;
  home: { name: string; logo: string; slug: string | null }; away: { name: string; logo: string; slug: string | null };
};
type Mine = {
  fixtureKey: string; league: string; home: string; away: string; date: string | null;
  predHome: number; predAway: number; actual: { home: number; away: number } | null;
  points: number | null; pending: boolean;
};
type BoardRow = { rank: number; name: string; total: number; count: number; me: boolean };

const LEAGUES = [
  { slug: "premier-league", label: "انگلیس" },
  { slug: "la-liga", label: "اسپانیا" },
];

export default function PredictorPage() {
  const [league, setLeague] = useState("premier-league");
  const [fixtures, setFixtures] = useState<Fx[]>([]);
  const [fxLoading, setFxLoading] = useState(true);
  const [mine, setMine] = useState<Mine[]>([]);
  const [board, setBoard] = useState<BoardRow[]>([]);
  const [myTotal, setMyTotal] = useState(0);
  const [authed, setAuthed] = useState(false);
  const [picks, setPicks] = useState<Record<string, { h: string; a: string }>>({});
  const [msg, setMsg] = useState("");

  const loadFx = useCallback(async () => {
    setFxLoading(true);
    const res = await fetch(`/api/live-score?league=${league}`).then((r) => r.json()).catch(() => null);
    const all: Fx[] = (res?.matches ?? []).map((m: any) => ({
      id: m.id, date: m.date, status: m.status,
      home: { name: m.home.name, logo: m.home.logo, slug: m.home.slug ?? null },
      away: { name: m.away.name, logo: m.away.logo, slug: m.away.slug ?? null },
    }));
    setFixtures(all.filter((m) => m.status === "upcoming").slice(0, 10));
    setFxLoading(false);
  }, [league]);

  const loadMine = useCallback(async () => {
    const res = await fetch("/api/games/predictor").then((r) => r.json()).catch(() => null);
    if (res?.success) {
      setAuthed(!!res.authed);
      setMine(res.mine ?? []);
      setBoard(res.leaderboard ?? []);
      setMyTotal(res.myTotal ?? 0);
    }
  }, []);

  useEffect(() => { loadFx(); }, [loadFx]);
  useEffect(() => { loadMine(); }, [loadMine]);

  async function submit(fx: Fx) {
    const p = picks[fx.id];
    const ph = Number(p?.h);
    const pa = Number(p?.a);
    if (!Number.isInteger(ph) || !Number.isInteger(pa) || ph < 0 || pa < 0 || ph > 20 || pa > 20) {
      setMsg("نتیجه را کامل وارد کن (۰ تا ۲۰)");
      return;
    }
    setMsg("");
    const res = await fetch("/api/games/predictor", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fixtureKey: fx.id, league, home: fx.home.name, away: fx.away.name, date: fx.date, predHome: ph, predAway: pa }),
    }).then((r) => r.json()).catch(() => null);
    if (!res?.success) {
      setMsg(res?.needLogin ? "برای ثبت پیش‌بینی وارد شوید" : (res?.error ?? "خطا"));
      return;
    }
    setMsg("✓ ثبت شد — موفق باشی!");
    loadMine();
  }

  const myKeys = new Set(mine.map((m) => m.fixtureKey));

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[720px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>
            <Target size={20} />
          </div>
          <div>
            <h1 className="headline text-[22px] text-white">پیش‌بینی نتیجه</h1>
            <p className="text-[12px] text-slate-400">نتیجه دقیق ۳ امتیاز • سمت درست ۱ امتیاز</p>
          </div>
          <Link href="/games" className="mr-auto text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full">همه بازی‌ها</Link>
        </div>

        {!authed && (
          <Link href="/login" className="block rounded-2xl border border-white/10 p-3 mb-4 text-center text-xs text-slate-300 hover:border-[#005cfc]/40" style={{ background: "rgba(0,92,252,0.08)" }}>
            برای ثبت پیش‌بینی و حضور در جدول <b style={{ color: "#005cfc" }}>وارد شوید ←</b>
          </Link>
        )}

        <div className="flex items-center gap-2 mb-4">
          {LEAGUES.map((l) => (
            <button key={l.slug} onClick={() => setLeague(l.slug)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold border transition-all ${league === l.slug ? "text-white" : "text-slate-400 border-white/10 hover:text-white"}`}
              style={league === l.slug ? { background: "linear-gradient(135deg, #005cfc, #bee503)", borderColor: "transparent" } : { background: "rgba(255,255,255,0.05)" }}>
              {l.label}
            </button>
          ))}
          {authed && <span className="mr-auto text-xs text-slate-400">امتیاز من: <b className="tabular" style={{ color: "#bee503" }}>{myTotal}</b></span>}
        </div>

        {msg && <p className="text-xs mb-3 text-center" style={{ color: msg.startsWith("✓") ? "#bee503" : "#E8385D" }}>{msg}</p>}

        <h2 className="headline text-[15px] text-white mb-2">بازی‌های پیش رو</h2>
        {fxLoading ? (
          <div className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-500 animate-pulse">در حال دریافت بازی‌ها...</div>
        ) : fixtures.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-500">فعلاً بازی آینده‌ای ثبت نشده است.</div>
        ) : (
          <div className="space-y-2.5 mb-6">
            {fixtures.map((fx) => {
              const mineRow = mine.find((m) => m.fixtureKey === fx.id);
              const pick = picks[fx.id] ?? { h: mineRow ? String(mineRow.predHome) : "", a: mineRow ? String(mineRow.predAway) : "" };
              return (
                <div key={fx.id} className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {fx.home.logo && <img src={fx.home.logo} alt="" className="w-6 h-6 object-contain shrink-0" loading="lazy" />}
                      <span className="text-[13px] font-bold text-white truncate">{fx.home.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
                      <input value={pick.h} onChange={(e) => setPicks({ ...picks, [fx.id]: { ...pick, h: e.target.value.replace(/\D/g, "").slice(0, 2) } })}
                        inputMode="numeric" placeholder="–" className="w-10 text-center bg-white/5 border border-white/10 rounded-lg py-1.5 text-sm font-black tabular text-white focus:outline-none focus:border-[#005cfc]" />
                      <span className="text-slate-600 font-black">:</span>
                      <input value={pick.a} onChange={(e) => setPicks({ ...picks, [fx.id]: { ...pick, a: e.target.value.replace(/\D/g, "").slice(0, 2) } })}
                        inputMode="numeric" placeholder="–" className="w-10 text-center bg-white/5 border border-white/10 rounded-lg py-1.5 text-sm font-black tabular text-white focus:outline-none focus:border-[#005cfc]" />
                    </div>
                    <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                      <span className="text-[13px] font-bold text-white truncate text-left">{fx.away.name}</span>
                      {fx.away.logo && <img src={fx.away.logo} alt="" className="w-6 h-6 object-contain shrink-0" loading="lazy" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-slate-500">
                      {fx.date ? new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(fx.date)) : ""}
                      {myKeys.has(fx.id) && <b style={{ color: "#bee503" }}> • ثبت شده ✓</b>}
                    </span>
                    <button onClick={() => submit(fx)} className="px-4 py-1.5 rounded-full text-[11px] font-black text-white" style={{ background: "#005cfc" }}>
                      {myKeys.has(fx.id) ? "ویرایش" : "ثبت"}
                    </button>
                  </div>
                  {mineRow && !mineRow.pending && mineRow.actual && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                      نتیجه واقعی: <b className="tabular text-white">{mineRow.actual.home} - {mineRow.actual.away}</b>
                      {" • "}
                      <b style={{ color: (mineRow.points ?? 0) > 0 ? "#bee503" : "#E8385D" }}>+{mineRow.points} امتیاز</b>
                    </div>
                  )}
                  {fx.home.slug && fx.away.slug && (
                    <ProbsHint homeSlug={fx.home.slug} awaySlug={fx.away.slug} league={league} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h2 className="headline text-[15px] text-white mb-2 flex items-center gap-2"><Medal size={15} style={{ color: "#bee503" }} /> جدول پیش‌بینی‌کننده‌ها</h2>
        {board.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-6 text-center text-xs text-slate-500">هنوز کسی امتیاز نگرفته — اولین نفر باش!</div>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "#2a2a2a" }}>
            {board.map((b) => (
              <div key={b.rank} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0" style={b.me ? { background: "rgba(0,92,252,0.1)" } : undefined}>
                <span className="tabular font-black text-sm w-6 text-center" style={{ color: b.rank <= 3 ? "#bee503" : "#64748b" }}>{b.rank}</span>
                <span className="text-[13px] font-bold text-white truncate flex-1">{b.name}{b.me ? " (شما)" : ""}</span>
                <span className="text-[11px] text-slate-500 tabular">{b.count} پیش‌بینی</span>
                <span className="tabular font-black text-sm" style={{ color: "#bee503" }}>{b.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
