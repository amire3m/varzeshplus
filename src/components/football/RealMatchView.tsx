"use client";

import { useState } from "react";
import Link from "next/link";
import { TeamBadge } from "./TeamBadge";

type TeamInfo = { tmId: number | null; name: string; logo: string | null; color: string; slug: string | null };
type LineupPlayer = { club_id: number; player_id: number; player_name: string; is_starting: number | null; position: string | null; jersey_number: number | null };
type EventRow = { minute: string | null; type: string; player_id: number | null; player_name: string | null; assist_id: number | null; assist_name: string | null; description: string | null };
type AppRow = { player_id: number; player_club_id: number; player_name: string | null; goals: number | null; assists: number | null; minutes_played: number | null; yellow_cards: number | null; red_cards: number | null };

export type MatchData = {
  game: { gameId: number; competitionId: string; season: number; round: string | null; date: string | null; stadium: string | null; attendance: number | null; home: TeamInfo; away: TeamInfo; homeGoals: number | null; awayGoals: number | null };
  lineups: { home: LineupPlayer[]; away: LineupPlayer[] };
  events: EventRow[];
  playerStats: AppRow[];
};

const POS_FA: Record<string, string> = {
  Goalkeeper: "دروازه‌بان", "Centre-Back": "مدافع میانی", "Left-Back": "مدافع چپ", "Right-Back": "مدافع راست", "Sweeper": "لیبرو",
  "Defensive Midfield": "هافبک دفاعی", "Central Midfield": "هافبک مرکزی", "Left Midfield": "هافبک چپ", "Right Midfield": "هافبک راست", "Attacking Midfield": "هافبک هجومی",
  "Left Winger": "وینگر چپ", "Right Winger": "وینگر راست", "Second Striker": "مهاجم دوم", "Centre-Forward": "مهاجم نوک",
};

function band(pos: string | null): "GK" | "DEF" | "MID" | "FWD" {
  if (!pos) return "MID";
  if (pos.includes("Goalkeeper") || pos === "Sweeper") return "GK";
  if (pos.includes("Back") || pos.includes("Defend")) return "DEF";
  if (pos.includes("Winger") || pos.includes("Striker") || pos.includes("Forward") || pos.includes("Attack")) return "FWD";
  return "MID";
}

/** جای‌گذاری روی زمین از پست واقعی (بدون داده ساختگی — فقط چیدمان نقاشی) */
function slot(players: LineupPlayer[], mirror: boolean) {
  const bands: Record<string, LineupPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of players) bands[band(p.position)].push(p);
  const yMap = { GK: 88, DEF: 68, MID: 40, FWD: 12 };
  const out: Array<{ p: LineupPlayer; x: number; y: number }> = [];
  for (const [b, list] of Object.entries(bands)) {
    list.forEach((p, i) => {
      let x = list.length === 1 ? 50 : 14 + i * (72 / (list.length - 1));
      if (mirror) x = 100 - x;
      out.push({ p, x, y: yMap[b as keyof typeof yMap] });
    });
  }
  return out;
}

const EVENT_LABEL: Record<string, string> = {
  Goals: "گل", "Own goals": "گل به خودی", "Penalty saved": "پنالتی مهارشده", "Penalty saved shootout": "پنالتی مهارشده",
  Yellow_cards: "کارت زرد", "Yellow red cards": "زرد دوم → قرمز", "Red cards": "کارت قرمز", Substitutions: "تعویض",
};
function eventColor(type: string) {
  if (type?.includes("Goal")) return "#22c55e";
  if (type?.includes("Red")) return "#ef4444";
  if (type?.includes("Yellow")) return "#eab308";
  if (type?.includes("Sub")) return "#3b82f6";
  return "#9aa7b5";
}

export function RealMatchView({ data, tab }: { data: MatchData; tab: string }) {
  const { game, lineups, events, playerStats } = data;
  const [side, setSide] = useState<"home" | "away">("home");
  const chosen = side === "home" ? game.home : game.away;
  const line = side === "home" ? lineups.home : lineups.away;
  const starters = line.filter((p) => p.is_starting === 1);
  const bench = line.filter((p) => p.is_starting !== 1);

  return (
    <div className="space-y-5">
      {/* هدر واقعی مسابقه */}
      <section className="panel p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {game.home.logo && <TeamBadge team={{ slug: game.home.name, shortName: game.home.name, name: game.home.name, logo: game.home.logo, color: game.home.color } as never} size={40} />}
            <span className="font-bold text-sm">{game.home.name}</span>
          </div>
          <span className="headline text-2xl md:text-3xl tabular">{game.homeGoals ?? "-"} - {game.awayGoals ?? "-"}</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm">{game.away.name}</span>
            {game.away.logo && <TeamBadge team={{ slug: game.away.name, shortName: game.away.name, name: game.away.name, logo: game.away.logo, color: game.away.color } as never} size={40} />}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs" style={{ color: "var(--color-muted)" }}>
          <span>فصل {game.season}/{String(game.season + 1).slice(2)}</span>
          {game.round && <span>هفته: {game.round}</span>}
          {game.date && <span className="tabular">{game.date.slice(0, 10)}</span>}
          {game.stadium && <span>{game.stadium}</span>}
          {game.attendance ? <span className="tabular">تماشاگر: {game.attendance.toLocaleString("fa-IR")}</span> : null}
        </div>
        <div className="mt-2 text-center text-[10px]" style={{ color: "#005cfc" }}>دیتای واقعی Transfermarkt</div>
      </section>

      {tab === "overview" || tab === "events" ? (
        /* تایم‌لاین واقعی از tm_events */
        <div className="relative">
          <div className="absolute top-0 bottom-0 right-1/2 w-px translate-x-1/2" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="space-y-1">
            {events.map((e, i) => {
              const isHome = playerStats.find((a) => a.player_id === e.player_id)?.player_club_id === game.home.tmId;
              const color = eventColor(e.type);
              const label = EVENT_LABEL[e.type] ?? e.type;
              return (
                <div key={i} className={`relative py-1 flex ${isHome ? "justify-start md:pr-[calc(50%+16px)]" : "justify-end md:pl-[calc(50%+16px)]"}`}>
                  <div className="flex items-start gap-2 max-w-[90%] md:max-w-[46%]" style={{ flexDirection: isHome ? "row" : "row-reverse" }}>
                    <span className="tabular font-black text-[11px] shrink-0 pt-2" style={{ color }}>{e.minute ?? ""}&apos;</span>
                    <div className="glass-panel px-3 py-2 rounded-xl text-sm min-w-0" style={{ borderInlineStart: `3px solid ${color}` }}>
                      <span className="font-bold text-[12px]" style={{ color }}>{label}</span>
                      {e.player_name && <p className="font-bold text-[13px] mt-0.5">{e.player_name}</p>}
                      {e.assist_name && <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>پاس گل: <span className="font-bold">{e.assist_name}</span></p>}
                      {e.description && <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted)" }}>{e.description.slice(0, 120)}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
            {!events.length && <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>رویداد ثبتی برای این بازی ثبت نشده است.</div>}
          </div>
        </div>
      ) : null}

      {tab === "lineup" && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setSide("home")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${side === "home" ? "text-white" : "text-white/55 border-white/10 hover:bg-white/5"}`} style={side === "home" ? { background: "linear-gradient(135deg, #005cfc, #bee503)", borderColor: "transparent" } : undefined}>{game.home.name}</button>
            <span className="tabular font-black text-lg" style={{ color: "var(--color-muted)" }}>VS</span>
            <button onClick={() => setSide("away")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${side === "away" ? "text-white" : "text-white/55 border-white/10 hover:bg-white/5"}`} style={side === "away" ? { background: "linear-gradient(135deg, #005cfc, #bee503)", borderColor: "transparent" } : undefined}>{game.away.name}</button>
          </div>

          {/* زمین با بازیکنان واقعی */}
          <div className="relative w-full overflow-hidden select-none rounded-2xl" style={{ aspectRatio: "16 / 9.6", background: "radial-gradient(120% 120% at 50% 0%, #1e3324 0%, #16271c 45%, #0f1c15 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="absolute inset-0 opacity-60" style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 6.25%, transparent 6.25% 12.5%)" }} />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ color: "rgba(255,255,255,0.14)" }} aria-hidden>
              <rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <line x1="50" y1="1.5" x2="50" y2="98.5" stroke="currentColor" strokeWidth="0.35" />
              <circle cx="50" cy="50" r="11" fill="none" stroke="currentColor" strokeWidth="0.35" />
              <rect x="1.5" y="22" width="16" height="56" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <rect x="82.5" y="22" width="16" height="56" fill="none" stroke="currentColor" strokeWidth="0.4" />
            </svg>
            <div className="absolute inset-0 z-10">
              {slot(starters, side === "away").map(({ p, x, y }) => (
                <div key={p.player_id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, width: 62 }}>
                  <span className="rounded-full p-[2px] mb-1" style={{ background: `linear-gradient(135deg, ${chosen.color}, rgba(255,255,255,0.35))` }}>
                    <span className="w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-black" style={{ background: "#1e1e1e", color: chosen.color }}>{p.player_name?.slice(0, 2) ?? "??"}</span>
                  </span>
                  <span className="tabular font-black text-[11px] text-white">{p.jersey_number ?? ""}</span>
                  <span className="text-[10px] font-bold text-white/90 truncate max-w-[60px] text-center" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>{p.player_name}</span>
                  <span className="text-[8px] text-white/60">{POS_FA[p.position ?? ""] ?? p.position}</span>
                </div>
              ))}
            </div>
          </div>

          {/* نیمکت */}
          <div className="glass-panel p-4">
            <h3 className="headline text-sm mb-2">نیمکت</h3>
            <div className="flex flex-wrap gap-2">
              {bench.map((b) => (
                <Link key={b.player_id} href={`/football/players/${b.player_id}`} className="text-xs px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-colors">
                  {b.player_name} <span className="text-slate-600">({POS_FA[b.position ?? ""] ?? b.position ?? "?"})</span>
                </Link>
              ))}
              {!bench.length && <p className="text-xs" style={{ color: "var(--color-muted)" }}>نیمکتی ثبت نشده.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "stats" && (
        /* آمار واقعی بازیکنان از appearances */
        <div className="space-y-4">
          {([game.home, game.away] as TeamInfo[]).map((team) => {
            const rows = playerStats.filter((a) => a.player_club_id === team.tmId).sort((a, b) => (b.minutes_played ?? 0) - (a.minutes_played ?? 0));
            return (
              <div key={`${team.tmId}`} className="glass-panel p-4">
                <h3 className="headline text-sm mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: team.color }} /> {team.name}
                </h3>
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ color: "var(--color-muted)" }}>
                      {["بازیکن", "دقیقه", "گل", "پاس", "زرد", "قرمز"].map((h, i) => (
                        <th key={i} className={`px-2 py-2 text-xs font-bold ${i === 0 ? "text-right" : "text-center"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => (
                      <tr key={a.player_id} className="border-t border-white/5 hover:bg-white/[0.04]">
                        <td className="px-2 py-2 font-bold">
                          <Link href={`/football/players/${a.player_id}`} className="hover:text-[#005cfc] transition-colors">{a.player_name ?? "—"}</Link>
                        </td>
                        <td className="px-2 py-2 text-center tabular">{a.minutes_played ?? 0}</td>
                        <td className="px-2 py-2 text-center tabular font-black" style={{ color: a.goals ? "#bee503" : "inherit" }}>{a.goals ?? 0}</td>
                        <td className="px-2 py-2 text-center tabular">{a.assists ?? 0}</td>
                        <td className="px-2 py-2 text-center tabular" style={{ color: a.yellow_cards ? "#f9c759" : "inherit" }}>{a.yellow_cards ?? 0}</td>
                        <td className="px-2 py-2 text-center tabular" style={{ color: a.red_cards ? "#ffb4ab" : "inherit" }}>{a.red_cards ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
