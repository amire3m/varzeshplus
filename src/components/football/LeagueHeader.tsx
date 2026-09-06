"use client";

import type { League } from "@/lib/football";
import { LEAGUES } from "@/lib/football";
import Link from "next/link";

/** هدر لیگ — با ریل لوگوی ۱۲ لیگ برای سوییچ سریع + پس‌زمینه چمن شب */
export function LeagueHeader({ league }: { league: League }) {
  return (
    <section
      className="relative rounded-3xl overflow-hidden border border-white/10 p-4 md:p-6"
      style={{
        background: "radial-gradient(ellipse 90% 120% at 85% -20%, rgba(74,225,131,0.12), transparent 60%), linear-gradient(180deg, #101610 0%, #0A0F0B 100%)",
      }}
    >
      {/* خطوط چمن محو */}
      <div aria-hidden className="absolute inset-0 opacity-[0.35]" style={{ background: "repeating-linear-gradient(90deg, rgba(74,225,131,0.03) 0 40px, transparent 40px 80px)" }} />

      <div className="relative flex flex-wrap items-center gap-4">
        <span className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center border border-white/10 p-2 shrink-0 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={league.logo} alt={league.englishName} className="w-full h-full object-contain" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="headline text-xl md:text-2xl text-white">{league.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold tabular" style={{ background: "linear-gradient(135deg,#4AE183,#FFD34D)", color: "#04160A" }}>{league.season}</span>
          </div>
          <p className="text-sm text-slate-400">{league.englishName}</p>
        </div>
        {/* آمار سریع */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {[
            { label: "تیم", val: String(LEAGUES.length && league.id === 12 ? 16 : 18) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 px-3 py-1.5 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="tabular font-black text-sm text-white">{s.val}</div>
              <div className="text-[9px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ریل لوگوهای ۱۲ لیگ — سوییچ سریع و جذاب */}
      <div className="relative mt-4 -mx-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-1 px-1">
          {LEAGUES.map((l) => {
            const active = l.id === league.id;
            return (
              <Link
                key={l.id}
                href={`/football/leagues/${l.slug}`}
                title={`${l.name} — ${l.englishName}`}
                className="relative shrink-0 group"
              >
                <span
                  className={`flex items-center justify-center rounded-2xl transition-all duration-200 overflow-hidden ${active ? "w-14 h-14" : "w-11 h-11 bg-white group-hover:w-12 group-hover:h-12 group-hover:-translate-y-0.5"}`}
                  style={active ? {
                    background: "#fff",
                    boxShadow: `0 0 0 2px #4AE183, 0 0 16px rgba(74,225,131,0.45)`,
                  } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.logo} alt={l.name} className="w-full h-full object-contain p-1" loading="lazy" />
                </span>
                {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "#FFD34D", boxShadow: "0 0 6px #FFD34D" }} />}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
