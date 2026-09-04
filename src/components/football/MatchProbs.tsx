"use client";

import { useEffect, useState } from "react";

type Probs = {
  home: number; draw: number; away: number;
  xgHome: number; xgAway: number; likely: string; sample: number;
  why: Array<{ label: string; value: number }>;
};

/** کارت احتمالات مدل Dixon-Coles-lite */
export function MatchProbs(props: { homeTmId: number; awayTmId: number; comp: string } | { homeSlug: string; awaySlug: string; league: string }) {
  const [data, setData] = useState<Probs | null>(null);

  useEffect(() => {
    let alive = true;
    const q = "homeTmId" in props
      ? `homeTmId=${props.homeTmId}&awayTmId=${props.awayTmId}&comp=${props.comp}`
      : `homeSlug=${props.homeSlug}&awaySlug=${props.awaySlug}&league=${props.league}`;
    fetch(`/api/football/probs?${q}`)
      .then((r) => r.json())
      .then((res) => { if (alive && res?.success && res.covered) setData(res); })
      .catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props)]);

  if (!data) return null;

  const rows = [
    { label: "برد میزبان", v: data.home, color: "#005cfc" },
    { label: "مساوی", v: data.draw, color: "#8FA1B5" },
    { label: "برد میهمان", v: data.away, color: "#bee503" },
  ];

  return (
    <div className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="headline text-sm text-white">پیش‌بینی مدل</h3>
        <span className="text-[10px] text-slate-500">بر اساس {data.sample} بازی اخیر • محتمل‌ترین نتیجه: <b className="tabular text-white">{data.likely}</b></span>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 w-20 shrink-0">{r.label}</span>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden" dir="ltr">
              <div className="h-full rounded-full transition-all" style={{ width: `${r.v}%`, background: r.color }} />
            </div>
            <span className="text-[11px] font-black tabular w-9 text-left text-white">{r.v}٪</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400">
        <span>گل موردانتظار میزبان: <b className="tabular text-white">{data.xgHome}</b></span>
        <span>میهمان: <b className="tabular text-white">{data.xgAway}</b></span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
        {data.why.map((w) => (
          <div key={w.label} className="rounded-lg bg-white/[0.03] border border-white/5 px-2 py-1.5 text-center">
            <div className="tabular font-black text-[13px]" style={{ color: w.value >= 1 ? "#bee503" : "#8FA1B5" }}>{w.value}×</div>
            <div className="text-[9px] text-slate-500">{w.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
