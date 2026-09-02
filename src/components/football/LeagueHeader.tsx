"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { League } from "@/lib/football";
import { LEAGUES } from "@/lib/football";

/** هدر لیگ + سوییچر سریع بین ۱۲ لیگ */
export function LeagueHeader({ league }: { league: League }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <section className="panel p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center border border-white/10 p-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={league.logo} alt={league.englishName} className="w-full h-full object-contain" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="headline text-xl md:text-2xl">{league.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold tabular" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff" }}>{league.season}</span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>{league.englishName}</p>
        </div>
        {/* سوییچر لیگ */}
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-sm transition-colors hover:border-[#005cfc]/40" style={{ background: "#2a2a2a" }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: "#005cfc" }}>swap_horiz</span>
            تغییر لیگ
            <span className={`material-symbols-outlined text-[16px] transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--color-muted)" }}>expand_more</span>
          </button>
          {open && (
            <div className="absolute left-0 mt-2 w-64 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl z-40 p-1.5" style={{ background: "#2a2a2a" }}>
              {LEAGUES.map((l) => {
                const active = l.id === league.id;
                return (
                  <Link key={l.id} href={`/football/leagues/${l.slug}`} onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${active ? "bg-white/[0.08]" : "hover:bg-white/5"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.logo} alt={l.name} className="w-7 h-7 object-contain shrink-0" loading="lazy" />
                    <span className={`text-xs truncate ${active ? "font-black text-white" : "text-slate-300"}`}>{l.name}</span>
                    {active && <span className="mr-auto material-symbols-outlined text-[16px]" style={{ color: "#005cfc" }}>check_circle</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* chips سریع لیگ‌های پرطرفدار */}
      <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {LEAGUES.slice(0, 6).map((l) => {
          const active = l.id === league.id;
          return (
            <Link key={l.id} href={`/football/leagues/${l.slug}`}
              className={`shrink-0 text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${active ? "text-white" : "text-slate-400 border-white/10 hover:text-white"}`}
              style={active ? { background: "linear-gradient(135deg,#005cfc,#bee503)", borderColor: "transparent" } : { background: "rgba(255,255,255,0.04)" }}>
              {l.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
