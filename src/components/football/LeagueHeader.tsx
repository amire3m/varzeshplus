"use client";

import type { League } from "@/lib/football";
import { LEAGUES } from "@/lib/football";
import Link from "next/link";

/** هدر لیگ — با ریل لوگوی ۱۲ لیگ برای سوییچ سریع */
export function LeagueHeader({ league }: { league: League }) {
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
      </div>
      {/* ریل لوگوهای ۱۲ لیگ — سوییچر سریع و جذاب */}
      <div className="mt-3 -mx-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
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
                    boxShadow: `0 0 0 2px #005cfc, 0 0 16px rgba(0,92,252,0.45)`,
                  } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.logo} alt={l.name} className="w-full h-full object-contain p-1" loading="lazy" />
                </span>
                {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "#bee503", boxShadow: "0 0 6px #bee503" }} />}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
