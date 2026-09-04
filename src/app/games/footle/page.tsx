"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Trophy, RotateCcw } from "lucide-react";

type Feedback = {
  name: string; club: string; clubMatch: boolean;
  position: string | null; positionMatch: boolean;
  age: number | null; ageDir: "up" | "down" | "match" | "unknown";
  nat: string | null; natMatch: boolean;
  mv: number | null; mvDir: "up" | "down" | "match" | "unknown";
};
type GuessRow = { feedback: Feedback; playerId: number; correct: boolean };
type Suggest = { id: number; name: string; club: string };

const MAX_TRIES = 8;

function todayKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}
function fmtMv(mv: number | null) {
  if (mv == null) return "—";
  if (mv >= 1_000_000) return `€${(mv / 1_000_000).toFixed(1)}M`;
  return `€${Math.round(mv / 1_000)}K`;
}

function Chip({ label, value, ok, dir }: { label: string; value: string; ok?: boolean; dir?: string }) {
  const arrow = dir === "up" ? " ▲" : dir === "down" ? " ▼" : "";
  return (
    <span
      className="text-[11px] font-bold px-2 py-1 rounded-lg border"
      style={
        ok
          ? { background: "rgba(190,229,3,0.15)", borderColor: "#bee503", color: "#bee503" }
          : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", color: "#cbd5e1" }
      }
    >
      {label}: {value}{arrow}
    </span>
  );
}

export default function FootlePage() {
  const key = `footle-${todayKey()}`;
  const [query, setQuery] = useState("");
  const [suggests, setSuggests] = useState<Suggest[]>([]);
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [won, setWon] = useState(false);
  const [reveal, setReveal] = useState<{ id: number; name: string; club: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const s = JSON.parse(raw);
        setGuesses(s.guesses ?? []);
        setWon(!!s.won);
        if (s.reveal) setReveal(s.reveal);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(g: GuessRow[], w: boolean, r: { id: number; name: string; club: string } | null) {
    try { localStorage.setItem(key, JSON.stringify({ guesses: g, won: w, reveal: r })); } catch { /* ignore */ }
  }

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length < 2) { setSuggests([]); return; }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/games/footle?q=${encodeURIComponent(query.trim())}`).then((r) => r.json()).catch(() => null);
      if (res?.success) setSuggests(res.items ?? []);
    }, 250);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  const over = won || guesses.length >= MAX_TRIES;

  async function submit(name: string) {
    if (over || busy || !name.trim()) return;
    setBusy(true); setError("");
    const res = await fetch("/api/games/footle", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    }).then((r) => r.json()).catch(() => null);
    setBusy(false);
    if (!res?.success) { setError(res?.error ?? "خطا"); return; }
    const row: GuessRow = { feedback: res.feedback, playerId: res.playerId, correct: res.correct };
    const g = [...guesses, row];
    const w = res.correct;
    let r = reveal;
    if (w) { r = res.answer; setReveal(r); }
    setGuesses(g); setWon(w); setQuery(""); setSuggests([]);
    persist(g, w, r);
    if (!w && g.length >= MAX_TRIES) doReveal(g);
  }

  async function doReveal(g: GuessRow[]) {
    const res = await fetch("/api/games/footle", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reveal: true }),
    }).then((r) => r.json()).catch(() => null);
    if (res?.success) { setReveal(res.answer); persist(g, false, res.answer); }
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[720px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>F</div>
          <div>
            <h1 className="headline text-[22px] text-white">فوتل — حدس بازیکن روز</h1>
            <p className="text-[12px] text-slate-400">بازیکن مرموز امروز را در {MAX_TRIES} حدس پیدا کن</p>
          </div>
          <Link href="/games" className="mr-auto text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full">همه بازی‌ها</Link>
        </div>

        <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-400">
          <span>تلاش‌ها: <b className="text-white tabular">{guesses.length}/{MAX_TRIES}</b></span>
          {won && <span className="flex items-center gap-1 font-black" style={{ color: "#bee503" }}><Trophy size={13} /> بردی! 🎉</span>}
        </div>

        {!over && (
          <div className="relative mb-5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={query} onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && suggests.length) submit(suggests[0].name); }}
                  placeholder="نام بازیکن به انگلیسی... (مثلا Saka)"
                  dir="ltr" style={{ textAlign: "left" }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-9 pl-3 text-sm placeholder-slate-500 focus:outline-none focus:border-[#005cfc] text-white"
                />
                {suggests.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full rounded-xl border border-white/10 overflow-hidden" style={{ background: "#2a2a2a" }}>
                    {suggests.map((s) => (
                      <button key={s.id} onClick={() => submit(s.name)} className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center justify-between gap-2" dir="ltr">
                        <span className="text-white truncate">{s.name}</span>
                        <span className="text-[11px] text-slate-500 shrink-0">{s.club}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => suggests.length && submit(suggests[0].name)} disabled={busy || !suggests.length} className="px-5 rounded-xl text-sm font-black text-white disabled:opacity-40 shrink-0" style={{ background: "#005cfc" }}>
                حدس
              </button>
            </div>
            {error && <p className="text-xs mt-2" style={{ color: "#E8385D" }}>{error}</p>}
          </div>
        )}

        <div className="space-y-2.5">
          {guesses.map((g, i) => (
            <div key={i} className="rounded-2xl border p-3" style={{ background: "#2a2a2a", borderColor: g.correct ? "#bee503" : "rgba(255,255,255,0.1)" }}>
              <div className="font-black text-sm text-white mb-2" dir="ltr" style={{ textAlign: "left" }}>{g.feedback.name}</div>
              <div className="flex flex-wrap gap-1.5">
                <Chip label="باشگاه" value={g.feedback.club} ok={g.feedback.clubMatch} />
                <Chip label="پست" value={g.feedback.position ?? "—"} ok={g.feedback.positionMatch} />
                <Chip label="سن" value={g.feedback.age !== null ? `${g.feedback.age}` : "—"} ok={g.feedback.ageDir === "match"} dir={g.feedback.ageDir} />
                <Chip label="ملیت" value={g.feedback.nat ?? "—"} ok={g.feedback.natMatch} />
                <Chip label="ارزش" value={fmtMv(g.feedback.mv)} ok={g.feedback.mvDir === "match"} dir={g.feedback.mvDir} />
              </div>
            </div>
          ))}
          {guesses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">
              هنوز حدسی نزدی — سبز یعنی درست، ▲ یعنی جواب بالاتر است، ▼ یعنی پایین‌تر
            </div>
          )}
        </div>

        {(won || reveal) && (
          <div className="mt-5 rounded-2xl border p-5 text-center" style={{ background: "linear-gradient(135deg, rgba(0,92,252,0.15), rgba(190,229,3,0.1))", borderColor: "#bee50355" }}>
            <div className="text-[11px] text-slate-400 mb-1">{won ? "آفرین! بازیکن امروز:" : "بازیکن امروز بود:"}</div>
            <div className="headline text-xl text-white" dir="ltr">{(won && guesses.length ? guesses[guesses.length - 1].feedback.name : reveal?.name) ?? reveal?.name}</div>
            {reveal && <div className="text-xs text-slate-400 mt-1">{reveal.club}</div>}
            <div className="flex items-center justify-center gap-2 mt-3">
              {reveal && (
                <Link href={`/football/players/${reveal.id}`} className="px-4 py-2 rounded-full text-xs font-black text-white" style={{ background: "#005cfc" }}>
                  مشاهده پروفایل ←
                </Link>
              )}
              <button onClick={() => { setGuesses([]); setWon(false); setReveal(null); try { localStorage.removeItem(key); } catch {} }} className="px-4 py-2 rounded-full text-xs border border-white/10 text-slate-300 flex items-center gap-1">
                <RotateCcw size={12} /> تلاش دوباره (تمرینی)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
