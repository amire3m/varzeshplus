"use client";

import { useState } from "react";
import type { League } from "@/lib/football";
import { LEAGUES } from "@/lib/football";
import Link from "next/link";
import { Trophy } from "lucide-react";

const FLAGS: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Spain: "🇪🇸", Italy: "🇮🇹", Germany: "🇩🇪", France: "🇫🇷",
  Netherlands: "🇳🇱", Portugal: "🇵🇹", Türkiye: "🇹🇷", "Saudi Arabia": "🇸🇦",
  Brazil: "🇧🇷", "USA / Canada": "🇺🇸", USA: "🇺🇸", Iran: "🇮🇷",
};

/**
 * هدر لیگ — hero پهن با پس‌زمینه استادیوم + انتخابگر لوگوهای تعاملی بزرگ
 */
export function LeagueHeader({ league }: { league: League }) {
  const [open, setOpen] = useState(false);
  return (
    <section
      className="relative rounded-2xl overflow-hidden border border-white/10"
      style={{
        background: "radial-gradient(ellipse 90% 140% at 85% -30%, rgba(74,225,131,0.06), transparent 60%), linear-gradient(180deg, #121712 0%, #0A0F0B 100%)",
      }}
    >
      {/* خطوط چمن — ملایم‌تر (FotMob density) */}
      <div aria-hidden className="absolute inset-0 opacity-20" style={{ background: "repeating-linear-gradient(90deg, rgba(74,225,131,0.03) 0 40px, transparent 40px 80px)" }} />
      <div aria-hidden className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-60" style={{ background: "rgba(74,225,131,0.06)" }} />

      <div className="relative p-4 md:p-7">
        <div className="flex flex-wrap items-center gap-4">
          {/* لوگو — بدون نئون سنگین */}
          <span className="relative shrink-0">
            <span className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white flex items-center justify-center p-2 border border-black/5 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={league.logo} alt={league.englishName} className="w-full h-full object-contain" />
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="headline text-2xl md:text-4xl text-white leading-tight">{league.name}</h1>
            <p className="text-sm md:text-base text-slate-400 mt-0.5">{league.englishName}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[11px] px-3 py-1 rounded-full font-bold" style={{ background: "rgba(74,225,131,0.15)", color: "#4AE183", border: "1px solid rgba(74,225,131,0.3)" }}>
                فصل {league.season}
              </span>
              <span className="text-[11px] px-3 py-1 rounded-full border border-white/10 text-slate-300" style={{ background: "rgba(255,255,255,0.03)" }}>
                {league.id === 12 ? "۱۶ تیم" : "۱۸ تیم"} • ۳۴ هفته
              </span>
            </div>
          </div>
        </div>

        {/* انتخابگر لیگ — کارت‌های بزرگ افقی اسکرول */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-slate-400 flex items-center gap-1.5">
              <Trophy size={13} style={{ color: "#FFD34D" }} /> انتخاب لیگ
            </span>
            <button onClick={() => setOpen((v) => !v)} className="text-[10px] font-bold hover:underline" style={{ color: "#4AE183" }}>
              {open ? "نمایش کمتر" : "نمایش همه لیگ‌ها"}
            </button>
          </div>
          <div className={`grid gap-2 ${open ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" : "grid-flow-col auto-cols-[minmax(120px,1fr)] overflow-x-auto pb-1"}`} style={{ scrollbarWidth: "none" }}>
            {(open ? LEAGUES : LEAGUES.slice(0, 8)).map((l) => {
              const active = l.id === league.id;
              const flag = FLAGS[(l as any).countryName] ?? "";
              return (
                <Link
                  key={l.id}
                  href={`/football/leagues/${l.slug}`}
                  className={`
                    relative rounded-2xl border p-2.5 flex items-center gap-2.5 transition-all duration-200 group
                    ${active ? "scale-[1.02]" : "hover:-translate-y-0.5"}
                  `}
                  style={{
                    background: active
                      ? "rgba(74,225,131,0.08)"
                      : "rgba(255,255,255,0.03)",
                    borderColor: active ? "rgba(74,225,131,0.4)" : "rgba(255,255,255,0.08)",
                    boxShadow: active ? "0 2px 10px rgba(74,225,131,0.12)" : undefined,
                  }}
                >
                  <span className={`shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-black/5 ${active ? "ring-1 ring-[#4AE183]" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.logo} alt={l.name} className="w-full h-full object-contain p-0.5" loading="lazy" />
                  </span>
                  <div className="min-w-0">
                    <div className={`text-[12px] font-bold truncate leading-4 ${active ? "text-[#4AE183]" : "text-white"}`}>
                      {l.name.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div className="text-[9px] text-slate-500">{flag} {l.englishName.split(" ").slice(-1)[0]}</div>
                  </div>
                  {active && <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full" style={{ background: "#4AE183" }} />}
                </Link>
              );
            })}
          </div>
          {!open && LEAGUES.length > 8 && (
            <button onClick={() => setOpen(true)} className="mt-1.5 text-[10px] text-slate-500 hover:text-white">
              +{LEAGUES.length - 8} لیگ دیگر
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
