"use client";

import { useState } from "react";
import Link from "next/link";
import type { Player, Team } from "@/lib/football";
import { squadFor } from "@/lib/football";
import { PlayerAvatar } from "./PlayerAvatar";

const POSITION_LABEL: Record<Player["position"], string> = { GK: "دروازه‌بان", DF: "مدافع", MF: "هافبک", FW: "مهاجم" };

export function SquadTable({ team }: { team: Team }) {
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