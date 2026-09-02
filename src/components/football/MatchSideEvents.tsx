"use client";

import { useEffect, useState } from "react";
import type { Match } from "@/lib/football";
import { getTeamById } from "@/lib/football";

type SideItem = { title: string; link: string; description: string; image: string | null; category: string; time: string };

/** تب «رویدادها» — حاشیه بازی با اخبار واقعی RSS خبرورزشی */
export function MatchSideEvents({ match }: { match: Match }) {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const [items, setItems] = useState<SideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = `teams=${encodeURIComponent(home.name)},${encodeURIComponent(away.name)}`;
    fetch(`/api/news/side-events?${q}`)
      .then((r) => r.json())
      .then((res) => { if (res?.success) setItems(res.items ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [home.name, away.name]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 p-4 flex items-center justify-between" style={{ background: "#2a2a2a" }}>
        <div>
          <h3 className="headline text-sm text-white">حاشیه {home.name} و {away.name}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">اخبار واقعی از خبرورزشی — به‌روزرسانی هر ۱۰ دقیقه</p>
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-full shrink-0" style={{ background: "rgba(0,92,252,0.15)", color: "#005cfc" }}>زنده</span>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="h-4 rounded bg-white/10 w-3/4 mb-2" />
              <div className="h-3 rounded bg-white/5 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
          خبری برای این مسابقه یافت نشد.
        </div>
      )}

      {!loading && items.map((it, i) => (
        <a key={i} href={it.link} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 p-4 transition-colors hover:border-[#005cfc]/40" style={{ background: "#2a2a2a" }}>
          <div className="flex gap-3">
            {it.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white leading-6 line-clamp-2">{it.title}</p>
              {it.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-5">{it.description}</p>}
              <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                {it.category && <span className="px-1.5 py-0.5 rounded" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{it.category}</span>}
                {it.time && <span className="text-slate-500">{it.time}</span>}
                <span className="text-slate-600 mr-auto">خبرورزشی ↗</span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
