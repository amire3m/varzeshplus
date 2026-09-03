"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GameItem = {
  gameId: number; date: string | null; round: string | null;
  home: { slug?: string; name?: string; logo?: string; color?: string; shortName?: string; tmName?: null; tmId?: number };
  away: { slug?: string; name?: string; logo?: string; color?: string; shortName?: string; tmName?: null; tmId?: number };
  homeGoals: number | null; awayGoals: number | null; status: string;
};

type StandRow = {
  rank: number; teamId: number; played: number; win: number; draw: number; loss: number; gf: number; ga: number; pts: number;
  team: { slug: string; name: string; logo: string; color: string; shortName: string } | null;
};

function TeamChip({ t, align = "right" }: { t: GameItem["home"]; align?: "right" | "left" }) {
  if (!t) return <span className="text-xs text-slate-500">{align === "right" ? "تیم خارجی" : "تیم خارجی"}</span>;
  const inner = (
    <>
      {t.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={t.logo} alt={t.name ?? ""} className="w-6 h-6 object-contain shrink-0" loading="lazy" />
      ) : (
        <span className="w-6 h-6 rounded-full bg-white/10 text-[9px] flex items-center justify-center shrink-0">{(t as any).tmName?.slice(0, 2) ?? "?"}</span>
      )}
      <span className={`text-xs font-bold truncate ${t.slug ? "text-white" : "text-slate-400"}`}>{t.name ?? (t as any).tmName}</span>
    </>
  );
  const cls = `flex items-center gap-1.5 min-w-0 ${align === "left" ? "flex-row-reverse text-left" : ""}`;
  return t.slug ? <Link href={`/football/teams/${t.slug}`} className={cls}>{inner}</Link> : <span className={cls}>{inner}</span>;
}

/** تب بازی‌های لیگ — واقعی از tm_games یا API خلیج فارس برای ایران */
export function RealLeagueMatches({ leagueSlug, fallbackGames, getTeam }: {
  leagueSlug: string;
  fallbackGames: import("@/lib/football").Match[];
  getTeam: (id: number) => import("@/lib/football").Team;
}) {
  const [season, setSeason] = useState(2025);
  const [games, setGames] = useState<GameItem[] | null>(null);
  const [covered, setCovered] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const isIran = leagueSlug === "persian-gulf";
  // فقط بازی‌های TM قابل کلیک به صفحه مسابقه هستند (ایران id اتحادیه دارد نه TM)
  const linkable = !isIran;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const url = isIran
      ? `/api/football/persian-gulf?season=${season}`
      : `/api/football/league-games?league=${leagueSlug}&season=${season}`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => { if (alive) { setCovered(!!res?.covered); setGames(res?.games ?? []); setLoading(false); } })
      .catch(() => { if (alive) { setCovered(false); setLoading(false); } });
    return () => { alive = false; };
  }, [leagueSlug, season, isIran]);

  if (loading) return <div className="glass-panel p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>در حال بارگذاری بازی‌های واقعی...</div>;
  if (covered === false) {
    // fallback به mock — همان رندر قبلی
    return (
      <div className="space-y-6">
        <h2 className="headline text-lg text-white">بازی‌های فصل</h2>
        {[{ label: "در جریان", status: "live" }, { label: "بازی‌های آینده", status: "upcoming" }, { label: "نتایج", status: "finished" }].map(({ label, status }) => (
          <div key={status}>
            <h3 className="text-sm font-bold mb-2" style={{ color: status === "live" ? "#ff8fab" : "var(--color-muted)" }}>{label}</h3>
            <div className="grid gap-3 md:grid-cols-2">{fallbackGames.filter((m) => m.status === status).map((m) => <FallbackCard key={m.id} m={m} getTeam={getTeam} />)}</div>
          </div>
        ))}
      </div>
    );
  }

  const finished = (games ?? []).filter((g) => g.status === "finished").slice(-40).reverse();
  const upcoming = (games ?? []).filter((g) => g.status !== "finished").slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="headline text-lg text-white">بازی‌های فصل</h2>
        <div className="flex items-center gap-1.5">
          {[2025, 2024, 2023].map((s) => (
            <button key={s} onClick={() => setSeason(s)} className="px-3 py-1.5 rounded-full border transition-colors text-xs" style={season === s ? { background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff", borderColor: "transparent" } : { borderColor: "rgba(255,255,255,0.12)", color: "var(--color-muted)" }}>
              {s}/{String(s + 1).slice(2)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold mb-2" style={{ color: "#ff8fab" }}>در جریان</h3>
        <div className="grid gap-3 md:grid-cols-2">{(games ?? []).filter((g) => g.status === "live").map((g) => <GameRowCard key={g.gameId} g={g} linkable={linkable} />)}</div>
        {(games ?? []).filter((g) => g.status === "live").length === 0 && <p className="text-xs text-slate-600">بازی زنده‌ای نیست.</p>}
      </div>
      <div>
        <h3 className="text-sm font-bold mb-2" style={{ color: "var(--color-muted)" }}>بازی‌های آینده</h3>
        <div className="grid gap-3 md:grid-cols-2">{upcoming.map((g) => <GameRowCard key={g.gameId} g={g} linkable={linkable} />)}</div>
      </div>
      <div>
        <h3 className="text-sm font-bold mb-2" style={{ color: "var(--color-muted)" }}>نتایج اخیر</h3>
        <div className="grid gap-3 md:grid-cols-2">{finished.slice(0, 20).map((g) => <GameRowCard key={g.gameId} g={g} linkable={linkable} />)}</div>
      </div>
      <div className="text-center text-[10px]" style={{ color: "#005cfc" }}>دیتای واقعی Transfermarkt</div>
    </div>
  );
}

export function GameRowCard({ g, linkable = true }: { g: GameItem; linkable?: boolean }) {
  const inner = (
    <div className="glass-panel p-3.5 flex items-center gap-3 h-full transition-colors hover:border-white/20">
      <span className="text-[10px] text-slate-500 tabular shrink-0 w-20">{g.date?.slice(5, 10) ?? "—"}</span>
      <div className="flex-1 min-w-0"><TeamChip t={g.home} /></div>
      <span className="tabular font-black text-sm shrink-0 px-2" style={{ color: g.homeGoals !== null ? "#fff" : "#8FA1B5" }}>
        {g.homeGoals !== null ? `${g.homeGoals} - ${g.awayGoals}` : "—"}
      </span>
      <div className="flex-1 min-w-0 justify-end"><TeamChip t={g.away} align="left" /></div>
      {g.round && <span className="text-[9px] text-slate-600 shrink-0 w-14 text-center">{g.round}</span>}
      {linkable && <span className="material-symbols-outlined text-[14px] text-slate-600 shrink-0">chevron_left</span>}
    </div>
  );
  return linkable ? (
    <Link href={`/football/matches/${g.gameId}`} className="block">{inner}</Link>
  ) : inner;
}

function FallbackCard({ m, getTeam }: { m: import("@/lib/football").Match; getTeam: (id: number) => import("@/lib/football").Team }) {
  const { MatchCard } = require("./MatchCard") as typeof import("./MatchCard");
  return <MatchCard match={m} getTeam={getTeam} />;
}

/** جدول واقعی لیگ — tm_games یا API خلیج فارس برای ایران */
export function RealStandingsTable({ leagueSlug, fallback }: { leagueSlug: string; fallback: React.ReactNode }) {
  const [season, setSeason] = useState(2025);
  const [standings, setStandings] = useState<StandRow[] | null>(null);
  const [covered, setCovered] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const isIran = leagueSlug === "persian-gulf";

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const url = isIran
      ? `/api/football/persian-gulf?season=${season}`
      : `/api/football/league-games?league=${leagueSlug}&season=${season}`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => { if (alive) { setCovered(!!res?.covered); setStandings(res?.standings ?? []); setLoading(false); } })
      .catch(() => { if (alive) { setCovered(false); setLoading(false); } });
    return () => { alive = false; };
  }, [leagueSlug, season, isIran]);

  if (loading) return <div className="glass-panel p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>در حال بارگذاری جدول واقعی...</div>;
  if (covered === false) return <>{fallback}</>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="headline text-lg text-white">جدول لیگ</h2>
        <div className="flex items-center gap-1.5">
          {[2025, 2024, 2023].map((s) => (
            <button key={s} onClick={() => setSeason(s)} className="px-3 py-1.5 rounded-full border transition-colors text-xs" style={season === s ? { background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff", borderColor: "transparent" } : { borderColor: "rgba(255,255,255,0.12)", color: "var(--color-muted)" }}>
              {s}/{String(s + 1).slice(2)}
            </button>
          ))}
        </div>
      </div>
      <div className="glass-panel overflow-x-auto rounded-[14px]" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr style={{ color: "#8FA1B5" }}>
              {["#", "تیم", "بازی", "برد", "مساوی", "باخت", "گل زده", "گل خورده", "تفاضل", "امتیاز"].map((h, i) => (
                <th key={i} className={`px-2.5 py-2.5 text-xs font-bold ${i <= 1 ? "text-right" : "text-center"} tabular`} style={{ background: "#2e2e2e", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(standings ?? []).map((row) => {
              const zone = row.rank <= 4 ? "#005cfc" : row.rank <= 6 ? "#bee503" : row.rank >= (standings?.length ?? 20) - 2 ? "#E23B3B" : null;
              return (
                <tr key={row.teamId} className="border-t border-white/5 hover:bg-white/[0.04] transition-colors">
                  <td className="px-2.5 py-2.5 text-center tabular font-black relative">
                    {zone && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ background: zone }} />}
                    {row.rank}
                  </td>
                  <td className="px-2.5 py-2.5">
                    {row.team ? (
                      <Link href={`/football/teams/${row.team.slug}`} className="flex items-center gap-2 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={row.team.logo} alt={row.team.name} className="w-6 h-6 object-contain shrink-0" loading="lazy" />
                        <span className="font-bold text-[13px] group-hover:text-[#005cfc] transition-colors">{row.team.name}</span>
                      </Link>
                    ) : <span className="text-xs text-slate-500">تیم #{row.teamId}</span>}
                  </td>
                  <td className="px-2.5 py-2.5 text-center tabular">{row.played}</td>
                  <td className="px-2.5 py-2.5 text-center tabular">{row.win}</td>
                  <td className="px-2.5 py-2.5 text-center tabular">{row.draw}</td>
                  <td className="px-2.5 py-2.5 text-center tabular">{row.loss}</td>
                  <td className="px-2.5 py-2.5 text-center tabular">{row.gf}</td>
                  <td className="px-2.5 py-2.5 text-center tabular">{row.ga}</td>
                  <td className="px-2.5 py-2.5 text-center tabular">{row.gf - row.ga > 0 ? "+" : ""}{row.gf - row.ga}</td>
                  <td className="px-2.5 py-2.5 text-center tabular font-black" style={{ color: "#005cfc" }}>{row.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 justify-center text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#005cfc" }} /> سهمیه لیگ قهرمانان</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#bee503" }} /> سهمیه اروپایی</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#E23B3B" }} /> سقوط</span>
        <span style={{ color: "#005cfc" }}>{isIran ? "دیتای واقعی victoryapi" : "دیتای واقعی Transfermarkt"}</span>
      </div>
    </div>
  );
}
