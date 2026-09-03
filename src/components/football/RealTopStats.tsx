"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PlayerStat, Team } from "@/lib/football";
import { PlayerAvatar } from "./PlayerAvatar";

type TopItem = {
  rank: number; playerId: number; name: string; position: string | null; marketValue: number | null;
  clubName: string | null; ourTeam: { slug: string; name: string; logo: string; color: string } | null;
  goals: number; assists: number; minutes: number; games: number; yellows: number; reds: number;
};

/** ردیف آماری واقعی — لینک به پروفایل بازیکن */
function RealStatRow({ item, label, color }: { item: TopItem; label: string; color: string }) {
  const value = label === "گل" ? item.goals : label === "پاس" ? item.assists : item.minutes;
  return (
    <Link
      href={`/football/players/${item.playerId}`}
      className="glass-panel p-3.5 flex items-center gap-3 text-sm hover:border-white/20 transition-colors"
    >
      <span className="tabular font-black text-[12px] w-5 text-center shrink-0" style={{ color: item.rank === 1 ? "#005cfc" : "var(--color-muted)" }}>{item.rank}</span>
      <PlayerAvatar name={item.name} size={36} color={item.ourTeam?.color ?? color} round />
      <div className="min-w-0 flex-1">
        <p className="font-bold truncate text-[13px]">{item.name}</p>
        <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>
          {item.ourTeam ? item.ourTeam.name : item.clubName} • {item.games} بازی
        </p>
      </div>
      <div className="text-center shrink-0">
        <p className="headline text-base tabular" style={{ color: item.rank === 1 ? "#bee503" : "inherit" }}>{value}</p>
        <p className="text-[9px]" style={{ color: "var(--color-muted)" }}>{label}</p>
      </div>
    </Link>
  );
}

function MockStatRow({ stat, getTeam, label }: { stat: PlayerStat; getTeam: (id: number) => Team; label: string }) {
  const team = getTeam(stat.teamId);
  return (
    <div className="glass-panel p-3.5 flex items-center gap-3 text-sm">
      <span className="tabular font-black text-[12px] w-5 text-center shrink-0" style={{ color: stat.rank === 1 ? "#005cfc" : "var(--color-muted)" }}>{stat.rank}</span>
      <PlayerAvatar name={stat.player} size={36} color={team.color} round />
      <div className="min-w-0 flex-1">
        <p className="font-bold truncate text-[13px]">{stat.player}</p>
        <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>{team.name}</p>
      </div>
      <div className="text-center shrink-0">
        <p className="headline text-base tabular">{stat.value}</p>
        <p className="text-[9px]" style={{ color: "var(--color-muted)" }}>{label}</p>
      </div>
    </div>
  );
}

/**
 * تب آمار — واقعی از tm_appearances؛ fallback mock برای لیگ‌های بدون پوشش (ایران)
 */
export function RealTopStats({ leagueSlug, leagueId, getTeam }: { leagueSlug: string; leagueId: number; getTeam: (id: number) => Team }) {
  const [season, setSeason] = useState(2025);
  const [data, setData] = useState<Record<string, TopItem[] | null>>({});
  const [loading, setLoading] = useState(true);
  const [covered, setCovered] = useState<boolean | null>(null);
  const isIran = leagueSlug === "persian-gulf";

  useEffect(() => {
    let alive = true;
    setLoading(true);
    if (isIran) { setCovered(false); setLoading(false); return; } // ایران پوشش TM ندارد → بدون جعل
    Promise.all(
      (["goals", "assists", "minutes"] as const).map((key) =>
        fetch(`/api/football/players-top?league=${leagueSlug}&key=${key}&season=${season}`)
          .then((r) => r.json())
          .then((res) => ({ key, res }))
      )
    ).then((results) => {
      if (!alive) return;
      const next: Record<string, TopItem[] | null> = {};
      let cov = false;
      for (const { key, res } of results) {
        if (res?.success && res.covered) { cov = true; next[key] = res.items ?? []; }
        else next[key] = null;
      }
      setCovered(cov);
      setData(next);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [leagueSlug, season, isIran]);

  if (loading) {
    return <div className="glass-panel p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>در حال بارگذاری آمار واقعی...</div>;
  }
  if (covered === false) {
    return (
      <div className="space-y-4">
        <h2 className="headline text-lg text-white">آمار فصل</h2>
        <div className="glass-panel p-8 text-center" style={{ color: "var(--color-muted)" }}>
          آمار دقیق این لیگ به‌زودی از منابع رسمی اضافه می‌شود.
        </div>
      </div>
    );
  }

  const tabs: Array<[string, string, string]> = [["goals", "برترین گلزنان", "گل"], ["assists", "بیشترین پاس گل", "پاس"], ["minutes", "بیشترین دقیقه", "دقیقه"]];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="headline text-lg text-white">آمار فصل</h2>
        <div className="flex items-center gap-1.5">
          {[2025, 2024, 2023].map((s) => (
            <button key={s} onClick={() => setSeason(s)} className="px-3 py-1.5 rounded-full border transition-colors text-xs" style={season === s ? { background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff", borderColor: "transparent" } : { borderColor: "rgba(255,255,255,0.12)", color: "var(--color-muted)" }}>
              {s}/{String(s + 1).slice(2)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {tabs.map(([key, title, label]) => (
          <div key={key}>
            <h3 className="text-sm font-bold mb-3 text-white">{title}</h3>
            <div className="space-y-2">
              {(data[key] ?? []).slice(0, 6).map((item) => (
                <RealStatRow key={item.playerId} item={item} label={label} color="#005cfc" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-[10px]" style={{ color: "#005cfc" }}>دیتای واقعی Transfermarkt — فصل {season}/{String(season + 1).slice(2)}</div>
    </div>
  );
}

function MockTopStats({ leagueId, getTeam }: { leagueId: number; getTeam: (id: number) => Team }) {
  const { topStats } = require("@/lib/football") as typeof import("@/lib/football");
  return (
    <div className="space-y-6">
      <h2 className="headline text-lg text-white">آمار</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {[["برترین گلزنان", "گل", topStats(leagueId, "goals")], ["بیشترین پاس گل", "پاس", topStats(leagueId, "assists")], ["بیشترین کلین‌شیت", "کلین‌شیت", topStats(leagueId, "clean")]].map(([title, label, list]) => (
          <div key={String(title)}>
            <h3 className="text-sm font-bold mb-3 text-white">{String(title)}</h3>
            <div className="space-y-2">{(list as PlayerStat[]).map((p) => <MockStatRow key={p.player} stat={p} getTeam={getTeam} label={String(label)} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
