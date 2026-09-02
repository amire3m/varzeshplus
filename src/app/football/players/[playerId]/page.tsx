"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { TEAMS, LEAGUES } from "@/lib/football/leagues";
import { squadFor } from "@/lib/football";
import { PlayerAvatar } from "@/components/football/PlayerAvatar";

const POSITION_LABEL: Record<string, string> = { GK: "دروازه‌بان", DF: "مدافع", MF: "هافبک", FW: "مهاجم" };

/**
 * پروفایل بازیکن — id = teamId*100 + index (سازگار با squadFor)
 * مثال: id 120101 → تیم 1201 (پرسپولیس)، بازیکن شاخص ۱
 */
export default function PlayerProfilePage() {
  const params = useParams<{ playerId: string }>();
  const playerId = Number(params.playerId);
  const [data, setData] = useState<{ player: any; team: any; league: any; teammates: any[] } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (Number.isNaN(playerId)) { setMissing(true); return; }
    // resolve deterministic — squadFor از data.ts همیشه همان خروجی را می‌دهد
    const team = TEAMS.find((t) => Math.floor(playerId / 100) === t.id);
    if (!team) { setMissing(true); return; }
    const squad = squadFor(team);
    const idx = playerId % 100; // 1-based
    const player = squad.find((p) => p.id === playerId) ?? squad[idx - 1];
    if (!player) { setMissing(true); return; }
    const league = LEAGUES.find((l) => l.id === team.leagueId);
    const teammates = squad.filter((p) => p.id !== player.id).slice(0, 8);
    setData({ player, team, league, teammates });
  }, [playerId]);

  if (missing) return notFound();
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#252525" }}><p className="text-sm animate-pulse" style={{ color: "#8FA1B5" }}>بارگذاری پروفایل بازیکن...</p></div>;
  }

  const { player, team, league } = data;
  const stats = [
    { label: "بازی", value: player.appearances, color: "#005cfc" },
    { label: "ترکیب اصلی", value: player.starts, color: "#005cfc" },
    { label: "گل", value: player.goals, color: "#bee503" },
    { label: "پاس گل", value: player.assists, color: "#bee503" },
    { label: "کارت زرد", value: player.yellowCards, color: "#eab308" },
    { label: "کارت قرمز", value: player.redCards, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: "#252525" }}>
      <div className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {/* هدر بازیکن */}
        <section className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: `linear-gradient(160deg, ${team.color}22, #2a2a2a 60%)`, borderColor: `${team.color}33` }}>
          <div className="p-5 flex items-center gap-4">
            <PlayerAvatar name={player.name} size={84} color={team.color} />
            <div className="min-w-0 flex-1">
              <h1 className="headline text-xl md:text-2xl text-white">{player.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Link href={`/football/teams/${team.slug}`} className="text-xs font-bold px-2.5 py-1 rounded-full border" style={{ background: `${team.color}22`, borderColor: `${team.color}44`, color: team.color }}>
                  {team.name}
                </Link>
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">{POSITION_LABEL[player.position]}</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 tabular">#{player.number}</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">{player.age} سال</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">{player.nationality}</span>
              </div>
              {league && <p className="text-[11px] text-slate-500 mt-2">{league.name} • فصل {league.season}</p>}
            </div>
          </div>
        </section>

        {/* آمار فصل */}
        <section>
          <h2 className="headline text-sm text-white mb-2">آمار فصل</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 p-3 text-center" style={{ background: "#2a2a2a" }}>
                <div className="headline text-xl tabular" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* تیم و هم‌تیمی‌ها */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <h3 className="headline text-sm text-white mb-3">تیم فعلی</h3>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={team.logo} alt={team.name} className="w-12 h-12 object-contain" />
              <div className="min-w-0">
                <Link href={`/football/teams/${team.slug}`} className="font-bold text-sm text-white hover:text-[#005cfc] transition-colors">{team.name}</Link>
                <p className="text-[11px] text-slate-400">{team.city} • {team.stadium}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-slate-500">سرمربی</span><span className="text-slate-300 font-bold">{team.coach}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">سال تأسیس</span><span className="text-slate-300 font-bold tabular">{team.founded}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">لقب</span><span className="text-slate-300 font-bold">{team.shortName}</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <h3 className="headline text-sm text-white mb-3">هم‌تیمی‌ها</h3>
            <div className="space-y-1.5">
              {data.teammates.map((t) => (
                <Link key={t.id} href={`/football/players/${t.id}`} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <PlayerAvatar name={t.name} size={28} color={team.color} round />
                  <span className="text-xs font-bold text-slate-200 truncate">{t.name}</span>
                  <span className="mr-auto text-[10px] text-slate-500">{POSITION_LABEL[t.position]}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* سابقه (deterministic) */}
        <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
          <h3 className="headline text-sm text-white mb-3">پیشرفت فصلی</h3>
          <div className="flex items-end gap-1.5 h-24">
            {[3, 5, 4, 7, 6, 8, 7, 9, 8, 10, 9, 12].map((v, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${v * 8}%`, background: i > 8 ? "#bee503" : "#005cfc", opacity: 0.35 + i * 0.05 }} title={`ماه ${i + 1}: ${v} مشارکت`} />
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">روند مشارکت در ۱۲ ماه گذشته (داده نمایشی)</p>
        </section>
      </div>
    </div>
  );
}
