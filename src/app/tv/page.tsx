"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import BottomSheet from "@/components/ui/BottomSheet";
import CompactMatchRow from "@/components/football/CompactMatchRow";
import LeagueFilterChips from "@/components/football/LeagueFilterChips";

// موک برنامه پخش — بعداً با fotmob tv endpoint جایگزین می‌شود
const MOCK_TV = [
  { league: "لیگ برتر انگلیس", leagueSlug: "premier-league", home: "آرسنال", away: "منچستر سیتی", homeLogo: "https://raw.githubusercontent.com/luuuvanhoc/pfb/main/premier-league/arsenal.png", awayLogo: "https://raw.githubusercontent.com/luuuvanhoc/pfb/main/premier-league/manchester-city.png", channel: "Sky Sports • beIN 1", time: new Date(Date.now() + 3600_000).toISOString(), status: "upcoming" as const, minute: "", hs: "", as: "" },
  { league: "لالیگا", leagueSlug: "la-liga", home: "رئال مادرید", away: "بارسلونا", homeLogo: "https://raw.githubusercontent.com/luuuvanhoc/pfb/main/la-liga/real-madrid.png", awayLogo: "https://raw.githubusercontent.com/luuuvanhoc/pfb/main/la-liga/barcelona.png", channel: "LaLiga TV • IRIB 3", time: new Date(Date.now() + 7200_000).toISOString(), status: "upcoming" as const, minute: "", hs: "", as: "" },
  { league: "خلیج فارس", leagueSlug: "persian-gulf", home: "پرسپولیس", away: "استقلال", homeLogo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D9%BE%D8%B1%D8%B3%D9%BE%D9%88%D9%84%DB%8C%D8%B3%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86.png", awayLogo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D8%A7%D8%B3%D8%AA%D9%82%D9%84%D8%A7%D9%84%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86.png", channel: "شبکه سه", time: new Date(Date.now() + 10800_000).toISOString(), status: "upcoming" as const, minute: "", hs: "", as: "" },
];

export default function TvPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const filtered = filter ? MOCK_TV.filter((m) => m.leagueSlug === filter) : MOCK_TV;

  return (
    <PageShell badge="برنامه پخش" activeDock="home">
      <main className="max-w-[900px] mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="headline text-xl text-white">برنامه پخش</h1>
          <button onClick={() => setSheet(true)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5" style={{ color: "#4AE183" }}>فیلتر لیگ</button>
        </div>

        <LeagueFilterChips
          leagues={[
            { slug: "premier-league", name: "لیگ برتر", logo: "https://raw.githubusercontent.com/luuuvanhoc/pfb/main/premier-league.png" },
            { slug: "la-liga", name: "لالیگا", logo: "https://raw.githubusercontent.com/luuuvanhoc/pfb/main/la-liga.png" },
            { slug: "persian-gulf", name: "خلیج فارس", logo: "https://raw.githubusercontent.com/LordArma/Iran-Football-Leagues/master/Persian%20Gulf%20Pro%20League/Favicon/%D9%BE%D8%B1%D8%B3%D9%BE%D9%88%D9%84%DB%8C%D8%B3%20%D8%AA%D9%87%D8%B1%D8%A7%D9%86.png" },
          ]}
          selected={filter}
          onSelect={setFilter}
        />

        <div className="space-y-2">
          {filtered.map((m, i) => (
            <div key={i} className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "#101610" }}>
              <CompactMatchRow match={m as any} href={`/football/leagues/${m.leagueSlug}/matches`} />
              <div className="px-3 py-1.5 border-t border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4AE183] shrink-0" />
                {m.channel}
              </div>
            </div>
          ))}
          {!filtered.length && <p className="text-sm text-slate-500 text-center py-8">برنامه‌ای برای این لیگ یافت نشد</p>}
        </div>
      </main>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="فیلتر لیگ">
        <div className="space-y-2">
          <button onClick={() => { setFilter(null); setSheet(false); }} className={`w-full text-right px-3 py-2 rounded-xl border text-sm font-bold ${!filter ? "bg-[#4AE183] text-[#0A0F0B] border-[#4AE183]" : "bg-white/5 border-white/10 text-white/80"}`}>همه لیگ‌ها</button>
          {MOCK_TV.map((m) => (
            <button key={m.leagueSlug} onClick={() => { setFilter(m.leagueSlug); setSheet(false); }} className={`w-full text-right px-3 py-2 rounded-xl border text-sm font-bold ${filter === m.leagueSlug ? "bg-[#4AE183] text-[#0A0F0B] border-[#4AE183]" : "bg-white/5 border-white/10 text-white/80"}`}>{m.league}</button>
          ))}
        </div>
      </BottomSheet>
    </PageShell>
  );
}
