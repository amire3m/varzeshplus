"use client";

import { useState } from "react";
import type { League } from "@/lib/football";
import { LEAGUES } from "@/lib/football";
import Link from "next/link";

const FLAGS: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Spain: "🇪🇸", Italy: "🇮🇹", Germany: "🇩🇪", France: "🇫🇷",
  Netherlands: "🇳🇱", Portugal: "🇵🇹", Türkiye: "🇹🇷", "Saudi Arabia": "🇸🇦",
  Brazil: "🇧🇷", "USA / Canada": "🇺🇸", USA: "🇺🇸", Iran: "🇮🇷",
};

const COMP_BY_SLUG: Record<string, string> = {
  "premier-league": "GB1", "la-liga": "ES1", "serie-a": "IT1", "bundesliga": "L1",
  "ligue-1": "FR1", "eredivisie": "NL1", "primeira-liga": "PO1", "super-lig": "TR1",
  "saudi-pro-league": "SA1", "brasileirao": "BRA1", "mls": "MLS1",
};

/** هدر لیگ — نام بزرگ روی پس‌زمینه استادیوم + انتخابگر لیگ با نام کشور */
export function LeagueHeader({ league }: { league: League }) {
  const [open, setOpen] = useState(false);
  const country = (league as any).countryName ?? "";
  return (
    <section
      className="relative rounded-3xl overflow-hidden border border-white/10"
      style={{
        background: "radial-gradient(ellipse 90% 120% at 85% -20%, rgba(74,225,131,0.12), transparent 60%), linear-gradient(180deg, #101610 0%, #0A0F0B 100%)",
      }}
    >
      {/* خطوط چمن محو */}
      <div aria-hidden className="absolute inset-0 opacity-[0.3]" style={{ background: "repeating-linear-gradient(90deg, rgba(74,225,131,0.03) 0 40px, transparent 40px 80px)" }} />

      <div className="relative p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center border border-white/10 p-2 shrink-0 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={league.logo} alt={league.englishName} className="w-full h-full object-contain" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="headline text-xl md:text-3xl text-white">{league.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold tabular" style={{ background: "linear-gradient(135deg,#4AE183,#FFD34D)", color: "#04160A" }}>{league.season}</span>
            </div>
            <p className="text-sm text-slate-400">{league.englishName}</p>
          </div>
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

        {/* انتخابگر لیگ — گرید لوگو با نام کشور */}
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {LEAGUES.map((l) => {
            const active = l.id === league.id;
            const flag = FLAGS[(l as any).countryName] ?? "";
            return (
              <Link
                key={l.id}
                href={`/football/leagues/${l.slug}`}
                title={`${l.name} — ${l.englishName}`}
                className={`
                  flex flex-col items-center gap-1 rounded-xl py-2 px-1 transition-all duration-150
                  ${active ? "bg-white/8 border border-[#4AE183]/50" : "hover:bg-white/5 border border-transparent"}
                `}
              >
                <span
                  className={`flex items-center justify-center rounded-full overflow-hidden transition-all ${active ? "w-10 h-10 bg-white shadow-md" : "w-8 h-8 bg-white/90 group-hover:w-9 group-hover:h-9"}`}
                  style={active ? { boxShadow: "0 0 0 2px #4AE183, 0 0 12px rgba(74,225,131,0.4)" } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.logo} alt={l.name} className="w-full h-full object-contain p-0.5" loading="lazy" />
                </span>
                <span className={`text-[8px] leading-tight text-center ${active ? "font-black text-[#4AE183]" : "text-slate-500"}`}>
                  {l.name.split(" ").slice(0, 2).join(" ")}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
