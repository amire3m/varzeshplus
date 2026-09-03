"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Player, Team } from "@/lib/football";
import { squadFor } from "@/lib/football";
import { PlayerAvatar } from "./PlayerAvatar";

const POSITION_LABEL: Record<Player["position"], string> = { GK: "دروازه‌بان", DF: "مدافع", MF: "هافبک", FW: "مهاجم" };

type TmPlayer = {
  playerId: number; name: string; position: string | null; subPosition: string | null;
  dateOfBirth: string | null; height: number | null; foot: string | null;
  marketValue: number | null; contractUntil: string | null; citizenship: string | null;
  seasonStats: { goals: number; assists: number; minutes: number; games: number; yellows: number; reds: number } | null;
};

const TM_POS_FA: Record<string, string> = {
  Goalkeeper: "دروازه‌بان", Defence: "مدافع", Midfield: "هافبک", Attack: "مهاجم",
  "Centre-Back": "مدافع میانی", "Left-Back": "مدافع چپ", "Right-Back": "مدافع راست",
  "Defensive Midfield": "هافبک دفاعی", "Central Midfield": "هافبک مرکزی", "Attacking Midfield": "هافبک هجومی",
  "Left Winger": "وینگر چپ", "Right Winger": "وینگر راست", "Centre-Forward": "مهاجم نوک", "Second Striker": "مهاجم دوم",
};
function fmtEur(n: number | null) {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `€${Math.round(n / 1_000)}K`;
  return `€${n}`;
}

/** اسکواد واقعی TM — جایگزین جدول mock برای تیم‌های دارای پوشش */
function RealSquadTable({ team }: { team: Team }) {
  const [players, setPlayers] = useState<TmPlayer[] | null>(null);
  const [covered, setCovered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`/api/football/tm-squad?teamSlug=${team.slug}&season=2025`)
      .then((r) => r.json())
      .then((res) => { if (alive) { setCovered(!!res?.covered); setPlayers(res?.players ?? []); setLoading(false); } })
      .catch(() => { if (alive) { setCovered(false); setLoading(false); } });
    return () => { alive = false; };
  }, [team.slug]);

  if (loading) return <div className="glass-panel p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>در حال بارگذاری ترکیب واقعی...</div>;

  const groups: Array<[string, (p: TmPlayer) => boolean]> = [
    ["دروازه‌بان", (p) => p.position === "Goalkeeper"],
    ["مدافع", (p) => p.position === "Defence" || (p.position ?? "").includes("Back")],
    ["هافبک", (p) => p.position === "Midfield"],
    ["مهاجم", (p) => p.position === "Attack" || (p.position ?? "").includes("Winger") || (p.position ?? "").includes("Striker")],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="headline text-lg">ترکیب {team.name}</h2>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>دیتای واقعی Transfermarkt — فصل ۲۰۲۵/۲۶</span>
      </div>
      {groups.map(([label, filter]) => {
        const list = (players ?? []).filter(filter);
        if (!list.length) return null;
        return (
          <div key={label} className="space-y-2">
            <h3 className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>{label}</h3>
            <div className="glass-panel overflow-x-auto rounded-[14px]" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr style={{ color: "#8FA1B5" }}>
                    {["بازیکن", "پست", "سن", "قد", "پای غالب", "بازی", "گل", "پاس", "دقیقه", "ارزش بازار", "قرارداد"].map((h, i) => (
                      <th key={i} className={`px-3 py-2.5 text-xs font-bold ${i === 0 ? "text-right" : "text-center"} ${i >= 5 ? "tabular" : ""}`} style={{ background: "#2e2e2e", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => {
                    const ageP = p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 86400_000)) : null;
                    return (
                      <tr key={p.playerId} className="border-t border-white/5 hover:bg-white/[0.04] transition-colors">
                        <td className="px-3 py-2.5 font-bold whitespace-nowrap">
                          <Link href={`/football/players/${p.playerId}`} className="flex items-center gap-2 group">
                            <PlayerAvatar name={p.name} size={30} color={team.color} />
                            <span className="group-hover:text-[#005cfc] transition-colors" style={{ color: "#F5F7FA" }}>{p.name}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-center text-xs">{TM_POS_FA[p.subPosition ?? p.position ?? ""] ?? p.position}</td>
                        <td className="px-3 py-2.5 text-center tabular">{ageP ?? "—"}</td>
                        <td className="px-3 py-2.5 text-center tabular">{p.height ?? "—"}</td>
                        <td className="px-3 py-2.5 text-center text-xs">{p.foot === "right" ? "راست" : p.foot === "left" ? "چپ" : "دو پا"}</td>
                        <td className="px-3 py-2.5 text-center tabular">{p.seasonStats?.games ?? "—"}</td>
                        <td className="px-3 py-2.5 text-center tabular font-bold" style={{ color: "#005cfc" }}>{p.seasonStats?.goals ?? "—"}</td>
                        <td className="px-3 py-2.5 text-center tabular">{p.seasonStats?.assists ?? "—"}</td>
                        <td className="px-3 py-2.5 text-center tabular">{p.seasonStats?.minutes ?? "—"}</td>
                        <td className="px-3 py-2.5 text-center tabular font-black" style={{ color: "#bee503" }}>{fmtEur(p.marketValue)}</td>
                        <td className="px-3 py-2.5 text-center tabular text-xs text-slate-400">{p.contractUntil?.slice(0, 10) ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SquadTable({ team }: { team: Team }) {
  // تیم‌های دارای پوشش TM → جدول واقعی؛ بقیه (ایران) → دیتای موجود
  return <SquadTableRealOrMock team={team} />;
}

function SquadTableRealOrMock({ team }: { team: Team }) {
  const [useReal, setUseReal] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/api/football/tm-squad?teamSlug=${team.slug}&season=2025`)
      .then((r) => r.json())
      .then((res) => { if (alive) setUseReal(!!res?.covered); })
      .catch(() => { if (alive) setUseReal(false); });
    return () => { alive = false; };
  }, [team.slug]);

  if (useReal === null) {
    return <div className="glass-panel p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>در حال بارگذاری ترکیب...</div>;
  }
  if (useReal) return <RealSquadTable team={team} />;
  return <MockSquadTable team={team} />;
}

function MockSquadTable({ team }: { team: Team }) {
  const [season, setSeason] = useState("2026/27");
  const squad = squadFor(team);
  const groups: Player["position"][] = ["GK", "DF", "MF", "FW"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="headline text-lg">ترکیب {team.name}</h2>
        <div className="flex items-center gap-1.5 text-xs">
          {["2026/27", "2025/26"].map((s) => (
            <button key={s} onClick={() => setSeason(s)} className="px-3 py-1.5 rounded-full border transition-colors" style={season === s ? { background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff", borderColor: "transparent" } : { borderColor: "rgba(255,255,255,0.12)", color: "var(--color-muted)" }}>{s}</button>
          ))}
        </div>
      </div>

      {groups.map((pos) => {
        const players = squad.filter((p) => p.position === pos);
        if (!players.length) return null;
        return (
          <div key={pos} className="space-y-2">
            <h3 className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>{POSITION_LABEL[pos]}</h3>
            <div className="glass-panel overflow-x-auto rounded-[14px]" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr style={{ color: "#8FA1B5" }}>
                    {["#", "بازیکن", "پست", "سن", "ملیت", "بازی", "ترکیب اصلی", "گل", "پاس گل", "زرد", "قرمز"].map((h, i) => (
                      <th key={i} className={`px-3 py-2.5 text-xs font-bold ${i <= 1 ? "text-right" : "text-center"} tabular`} style={{ background: "#2e2e2e", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.04] transition-colors">
                      <td className="px-3 py-2.5 tabular font-black">{p.number}</td>
                      <td className="px-3 py-2.5 font-bold whitespace-nowrap">
                        <Link href={`/football/players/${p.id}`} className="flex items-center gap-2 group">
                          <PlayerAvatar name={p.name} size={30} color={team.color} />
                          <span dir="rtl" className="group-hover:text-[#005cfc] transition-colors" style={{ color: "#F5F7FA" }}>{p.name}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-center">{POSITION_LABEL[p.position]}</td>
                      <td className="px-3 py-2.5 text-center tabular">{p.age}</td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">{p.nationality}</td>
                      <td className="px-3 py-2.5 text-center tabular">{p.appearances}</td>
                      <td className="px-3 py-2.5 text-center tabular">{p.starts}</td>
                      <td className="px-3 py-2.5 text-center tabular font-bold" style={{ color: "#005cfc" }}>{p.goals}</td>
                      <td className="px-3 py-2.5 text-center tabular">{p.assists}</td>
                      <td className="px-3 py-2.5 text-center tabular" style={{ color: "#f9c759" }}>{p.yellowCards}</td>
                      <td className="px-3 py-2.5 text-center tabular" style={{ color: "#ffb4ab" }}>{p.redCards}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}