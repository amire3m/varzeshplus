"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, RotateCcw } from "lucide-react";

type Card = { id: number; name: string; position: string | null; club: string };

function fmtMv(mv: number | null) {
  if (mv == null) return "—";
  if (mv >= 1_000_000) return `€${(mv / 1_000_000).toFixed(1)}M`;
  return `€${Math.round(mv / 1_000)}K`;
}

export default function HigherLowerPage() {
  const [pair, setPair] = useState<{ a: Card; b: Card } | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; aMv: number | null; bMv: number | null } | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem("hl-best") || 0));
      setStreak(Number(localStorage.getItem("hl-streak") || 0));
    } catch { /* ignore */ }
  }, []);

  const deal = useCallback(async () => {
    setLoading(true); setPicked(null); setResult(null);
    const res = await fetch("/api/games/higher-lower").then((r) => r.json()).catch(() => null);
    if (res?.success) setPair({ a: res.a, b: res.b });
    setLoading(false);
  }, []);

  useEffect(() => { deal(); }, [deal]);

  async function pick(id: number, other: number) {
    if (!pair || picked !== null) return;
    setPicked(id);
    const res = await fetch("/api/games/higher-lower", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pick: id, aId: pair.a.id, bId: pair.b.id }),
    }).then((r) => r.json()).catch(() => null);
    if (!res?.success) return;
    setResult(res);
    const ns = res.correct ? streak + 1 : 0;
    const nb = Math.max(best, ns);
    setStreak(ns); setBest(nb);
    try {
      localStorage.setItem("hl-streak", String(ns));
      localStorage.setItem("hl-best", String(nb));
    } catch { /* ignore */ }
  }

  function playerHref(id: number) {
    return `/football/players/${id}`;
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[720px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>↕</div>
          <div>
            <h1 className="headline text-[22px] text-white">بیشتر یا کمتر</h1>
            <p className="text-[12px] text-slate-400">ارزش بازار کدام بازیکن بیشتر است؟</p>
          </div>
          <Link href="/games" className="mr-auto text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full">همه بازی‌ها</Link>
        </div>

        <div className="flex items-center gap-3 mb-5 text-[12px]">
          <span className="flex items-center gap-1 font-black" style={{ color: "#E8385D" }}><Flame size={14} /> رکورد فعلی: <b className="tabular">{streak}</b></span>
          <span className="text-slate-500">بهترین: <b className="tabular text-slate-300">{best}</b></span>
          <button onClick={() => { setStreak(0); try { localStorage.setItem("hl-streak", "0"); } catch {} }} className="mr-auto text-slate-500 hover:text-white flex items-center gap-1 text-[11px]">
            <RotateCcw size={12} /> صفر کردن رکورد
          </button>
        </div>

        {loading || !pair ? (
          <div className="rounded-2xl border border-white/10 p-10 text-center text-sm text-slate-500 animate-pulse">در حال پخش کارت‌ها...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {([{ ...pair.a, side: "a" }, { ...pair.b, side: "b" }] as Array<Card & { side: string }>).map((p) => {
                const revealed = result !== null;
                const mv = p.side === "a" ? result?.aMv ?? null : result?.bMv ?? null;
                const isPick = picked === p.id;
                const dim = revealed && !isPick && ((p.side === "a" ? result?.aMv : result?.bMv) ?? 0) < ((p.side === "a" ? result?.bMv : result?.aMv) ?? 0);
                return (
                  <button
                    key={p.id} onClick={() => pick(p.id, p.side === "a" ? pair.b.id : pair.a.id)}
                    disabled={revealed}
                    className="rounded-2xl border p-5 text-center transition-all hover:-translate-y-1 disabled:hover:translate-y-0"
                    style={{
                      background: "#2a2a2a",
                      borderColor: revealed ? (isPick ? (result?.correct ? "#bee503" : "#E8385D") : "rgba(255,255,255,0.1)") : "rgba(255,255,255,0.1)",
                      opacity: dim ? 0.55 : 1,
                    }}
                  >
                    <div className="font-black text-[15px] text-white leading-6 min-h-[48px]" dir="ltr">{p.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{p.club}</div>
                    <div className="headline text-lg tabular mt-3" style={{ color: revealed ? "#bee503" : "transparent", textShadow: revealed ? "none" : "0 0 12px rgba(255,255,255,0.5)", userSelect: "none" }}>
                      {revealed ? fmtMv(mv) : "€ ?"}
                    </div>
                    {revealed && (
                      <Link href={playerHref(p.id)} onClick={(e) => e.stopPropagation()} className="inline-block mt-2 text-[11px] font-bold hover:underline" style={{ color: "#005cfc" }}>
                        پروفایل ←
                      </Link>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="text-center mt-4">
              {result ? (
                <div className="space-y-3">
                  <p className="text-sm font-black" style={{ color: result.correct ? "#bee503" : "#E8385D" }}>
                    {result.correct ? "✓ درست! رکوردت بیشتر شد" : "✗ اشتباه — رکورد صفر شد"}
                  </p>
                  <button onClick={deal} className="px-6 py-2.5 rounded-full text-sm font-black text-white" style={{ background: "#005cfc" }}>
                    دست بعدی
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">روی بازیکنی که فکر می‌کنی گران‌تر است بزن</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
