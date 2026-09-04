"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { TEAMS, LEAGUES } from "@/lib/football/leagues";
import { squadFor } from "@/lib/football";
import { PlayerAvatar } from "@/components/football/PlayerAvatar";

const POSITION_LABEL: Record<string, string> = { GK: "دروازه‌بان", DF: "مدافع", MF: "هافبک", FW: "مهاجم" };

const POS_EN_FA: Record<string, string> = {
  Goalkeeper: "دروازه‌بان", Defence: "مدافع", Midfield: "هافبک", Attack: "مهاجم",
  "Centre-Back": "مدافع میانی", "Left-Back": "مدافع چپ", "Right-Back": "مدافع راست",
  "Defensive Midfield": "هافبک دفاعی", "Central Midfield": "هافبک مرکزی", "Attacking Midfield": "هافبک هجومی",
  "Left Winger": "وینگر چپ", "Right Winger": "وینگر راست", "Centre-Forward": "مهاجم نوک", "Second Striker": "مهاجم دوم",
};

type TmPlayer = {
  id: number; prettyName: string; position: string | null; subPosition: string | null; dateOfBirth: string | null;
  height: number | null; foot: string | null; marketValueEur: number | null; highestMarketValueEur: number | null;
  contractUntil: string | null; citizenship: string | null; imageUrl: string | null; tmClubName: string | null;
  clubId: number | null; ourTeam: { slug: string; name: string; logo: string; color: string } | null;
};
type RealData = {
  player: TmPlayer;
  history: Array<{ date: string; v: number | null }>;
  transfers: Array<{ transfer_date: string; from_club_name: string; to_club_name: string; transfer_fee: string | null; market_value_in_eur: number | null }>;
  seasonStats: Array<{ yr: string; competition_id: string; games: number; goals: number | null; assists: number | null; minutes: number | null; yellows: number | null; reds: number | null }>;
  estimatedFee: { value: number; factors: Array<{ label: string; text: string }> } | null;
};
type Teammate = { playerId: number; name: string; position: string | null };

type LegacyData = { player: any; team: any; league: any; teammates: any[] };
type MarketData = {
  player: {
    prettyName: string; position: string | null; subPosition: string | null; dateOfBirth: string | null; height: number | null;
    foot: string | null; marketValueEur: number | null; highestMarketValueEur: number | null;
    contractUntil: string | null; citizenship: string | null; tmClubName: string | null;
  };
  history: Array<{ date: string; v: number | null }>;
  transfers: Array<{ transfer_date: string; from_club_name: string; to_club_name: string; transfer_fee: string | null; market_value_in_eur: number | null }>;
};

function fmtEur(n: number | null): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `€${Math.round(n / 1_000)}K`;
  return `€${n}`;
}

function fmtFee(fee: string | null): string {
  if (!fee) return "انتقال آزاد";
  const n = Number(fee);
  if (Number.isNaN(n) || n === 0) return "انتقال آزاد";
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `€${Math.round(n / 1_000)}K`;
  return `€${n}`;
}

function age(birth: string | null): string {
  if (!birth) return "—";
  try {
    const b = new Date(birth);
    return String(Math.floor((Date.now() - b.getTime()) / (365.25 * 86400_000)));
  } catch { return "—"; }
}

function footFa(foot: string | null): string {
  if (foot === "right") return "راست";
  if (foot === "left") return "چپ";
  if (foot === "both") return "دو پا";
  return "—";
}

/**
 * پروفایل بازیکن — اول دیتای واقعی TM (player_id واقعی)، بعد fallback به اسکوادهای legacy
 * مثال واقعی: id 940915 (TM) | مثال legacy: id 120101 (تیم 1201 × ۱۰۰ + ایندکس ۱)
 */
export default function PlayerProfilePage() {
  const params = useParams<{ playerId: string }>();
  const playerId = Number(params.playerId);

  // همه هوک‌ها بالا (بدون conditional hooks → رفع React #310)
  const [real, setReal] = useState<RealData | null>(null);
  const [legacy, setLegacy] = useState<LegacyData | null>(null);
  const [missing, setMissing] = useState(false);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [market, setMarket] = useState<MarketData | null>(null);
  const [marketChecked, setMarketChecked] = useState(false);

  // ۱) real-first: تلاش برای دیتای واقعی TM
  useEffect(() => {
    if (Number.isNaN(playerId)) { setMissing(true); return; }
    let alive = true;
    fetch(`/api/football/player-by-id?id=${playerId}`)
      .then((r) => r.json())
      .then((res) => {
        if (!alive) return;
        if (res?.success && res?.covered) { setReal(res); return; }
        // fallback legacy: فرمول teamId*100+index
        const team = TEAMS.find((t) => Math.floor(playerId / 100) === t.id);
        if (!team) { setMissing(true); return; }
        const squad = squadFor(team);
        const idx = playerId % 100;
        const player = squad.find((p) => p.id === playerId) ?? squad[idx - 1];
        if (!player) { setMissing(true); return; }
        const league = LEAGUES.find((l) => l.id === team.leagueId);
        setLegacy({ player, team, league, teammates: squad.filter((p) => p.id !== player.id).slice(0, 8) });
      })
      .catch(() => { if (alive) setMissing(true); });
    return () => { alive = false; };
  }, [playerId]);

  // ۲) هم‌تیمی‌های واقعی (top 8 بر اساس ارزش بازار)
  const realTeamSlug = real?.player?.ourTeam?.slug ?? null;
  useEffect(() => {
    if (!realTeamSlug) return;
    let alive = true;
    fetch(`/api/football/tm-squad?teamSlug=${realTeamSlug}&season=2025`)
      .then((r) => r.json())
      .then((res) => {
        if (!alive) return;
        const list = (res?.players ?? [])
          .filter((p: any) => p.playerId !== playerId)
          .sort((a: any, b: any) => (b.marketValue ?? 0) - (a.marketValue ?? 0))
          .slice(0, 8)
          .map((p: any) => ({ playerId: p.playerId, name: p.name, position: p.position }));
        setTeammates(list);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [realTeamSlug, playerId]);

  // ۳) market برای حالت legacy (NAME_MAP → player-market)
  const legacyName = legacy?.player?.name ?? null;
  useEffect(() => {
    if (!legacyName) return;
    let alive = true;
    import("@/lib/player-photo").then(({ PLAYER_NAME_MAP }) => {
      const en = PLAYER_NAME_MAP[legacyName];
      if (!en || !alive) { if (alive) setMarketChecked(true); return; }
      fetch(`/api/football/player-market?name=${encodeURIComponent(en)}`)
        .then((r) => r.json())
        .then((res) => { if (alive) { setMarket(res?.found ? res : null); setMarketChecked(true); } })
        .catch(() => { if (alive) setMarketChecked(true); });
    });
    return () => { alive = false; };
  }, [legacyName]);

  if (missing) return notFound();
  if (real) return <RealProfileView real={real} teammates={teammates} />;
  if (legacy) {
    return (
      <LegacyProfileView
        player={legacy.player}
        team={legacy.team}
        league={legacy.league}
        teammates={legacy.teammates}
        market={market}
        marketChecked={marketChecked}
      />
    );
  }
  return <div className="min-h-screen flex items-center justify-center" style={{ background: "#252525" }}><p className="text-sm animate-pulse" style={{ color: "#8FA1B5" }}>بارگذاری پروفایل بازیکن...</p></div>;
}

/* ================= نمای واقعی TM ================= */

function RealProfileView({ real, teammates }: { real: RealData; teammates: Teammate[] }) {
  const { player, history, transfers, seasonStats, estimatedFee } = real;
  const color = player.ourTeam?.color ?? "#005cfc";
  const latest = seasonStats[0];

  return (
    <div className="min-h-screen pb-24" style={{ background: "#252525" }}>
      <div className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {/* هدر بازیکن */}
        <section className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: `linear-gradient(160deg, ${color}22, #2a2a2a 60%)`, borderColor: `${color}33` }}>
          <div className="p-5 flex items-center gap-4">
            <PlayerAvatar name={player.prettyName} size={84} color={color} />
            <div className="min-w-0 flex-1">
              <h1 className="headline text-xl md:text-2xl text-white">{player.prettyName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {player.ourTeam ? (
                  <Link href={`/football/teams/${player.ourTeam.slug}`} className="text-xs font-bold px-2.5 py-1 rounded-full border" style={{ background: `${color}22`, borderColor: `${color}44`, color }}>
                    {player.ourTeam.name}
                  </Link>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">{player.tmClubName ?? "—"}</span>
                )}
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">{POS_EN_FA[player.position ?? ""] ?? player.position ?? "—"}</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">{age(player.dateOfBirth)} سال</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">{player.citizenship ?? ""}</span>
              </div>
            </div>
          </div>
        </section>

        {/* آمار آخرین فصل واقعی */}
        {latest && (
          <section>
            <h2 className="headline text-sm text-white mb-2">آمار فصل {latest.yr} ({latest.competition_id})</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { label: "بازی", value: latest.games, color: "#005cfc" },
                { label: "گل", value: latest.goals ?? 0, color: "#bee503" },
                { label: "پاس گل", value: latest.assists ?? 0, color: "#bee503" },
                { label: "دقیقه", value: latest.minutes ?? 0, color: "#8FA1B5" },
                { label: "کارت زرد", value: latest.yellows ?? 0, color: "#eab308" },
                { label: "کارت قرمز", value: latest.reds ?? 0, color: "#ef4444" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 p-3 text-center" style={{ background: "#2a2a2a" }}>
                  <div className="headline text-xl tabular" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ارزش بازار + نمودار */}
        <section className="rounded-2xl border p-4" style={{ background: "#2a2a2a", borderColor: "rgba(0,92,252,0.25)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="headline text-sm text-white">ارزش بازار</h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>دیتای واقعی Transfermarkt</span>
          </div>
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div>
              <div className="headline text-2xl tabular" style={{ color: "#005cfc" }}>{fmtEur(player.marketValueEur)}</div>
              <div className="text-[10px] text-slate-500">ارزش فعلی</div>
            </div>
            <div>
              <div className="headline text-sm tabular text-slate-300">{fmtEur(player.highestMarketValueEur)}</div>
              <div className="text-[10px] text-slate-500">بیشترین سابقه</div>
            </div>
          </div>
          {history.length > 2 && (
            <div>
              <div className="flex items-end gap-[3px] h-24">
                {history.map((h, i) => {
                  const vals = history.map((x) => x.v ?? 0);
                  const max = Math.max(...vals, 1);
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all"
                      style={{ height: `${Math.max(6, ((h.v ?? 0) / max) * 100)}%`, background: i === history.length - 1 ? "#bee503" : "#005cfc", opacity: 0.4 + (i / history.length) * 0.6 }}
                      title={`${h.date}: ${fmtEur(h.v)}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                <span>{history[0]?.date.slice(0, 7)}</span>
                <span>تاریخچه ارزش بازار</span>
                <span>{history[history.length - 1]?.date.slice(0, 7)}</span>
              </div>
            </div>
          )}
        </section>

        {/* تخمین مبلغ انتقال */}
        {estimatedFee && (
          <section className="rounded-2xl border p-4" style={{ background: "linear-gradient(135deg, rgba(190,229,3,0.08), rgba(0,92,252,0.08))", borderColor: "rgba(190,229,3,0.3)" }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="headline text-sm text-white">تخمین مبلغ انتقال</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(190,229,3,0.12)", color: "#bee503" }}>مدل شفاف</span>
            </div>
            <div className="headline text-2xl tabular mb-2" style={{ color: "#bee503" }}>{fmtEur(estimatedFee.value)}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              {estimatedFee.factors.map((f) => (
                <div key={f.label} className="flex justify-between gap-2 border-b border-white/5 pb-1">
                  <span className="text-slate-500">{f.label}</span>
                  <span className="text-slate-300 font-bold text-left">{f.text}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* پروفایل کامل */}
        <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
          <h3 className="headline text-sm text-white mb-3">پروفایل بازیکن</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 text-[11px]">
            {[
              ["نام کامل", player.prettyName],
              ["پست", POS_EN_FA[player.position ?? ""] ?? player.position ?? "—"],
              ["پست تخصصی", POS_EN_FA[player.subPosition ?? ""] ?? player.subPosition ?? "—"],
              ["تاریخ تولد", player.dateOfBirth ? player.dateOfBirth.slice(0, 10) : "—"],
              ["سن", age(player.dateOfBirth)],
              ["قد", player.height ? `${player.height} cm` : "—"],
              ["پای غالب", footFa(player.foot)],
              ["ملیت", player.citizenship ?? "—"],
              ["قرارداد تا", player.contractUntil ? player.contractUntil.slice(0, 10) : "—"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex flex-col gap-0.5 border-b border-white/5 pb-1.5">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-200 font-bold">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* سابقه انتقالات واقعی */}
        {transfers.length > 0 && (
          <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <h3 className="headline text-sm text-white mb-3">سابقه انتقالات</h3>
            <div className="space-y-1.5">
              {transfers.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-[11px] tabular text-slate-500 shrink-0 w-16">{t.transfer_date?.slice(0, 10)}</span>
                  <span className="text-xs font-bold text-slate-300 truncate">{t.from_club_name}</span>
                  <span className="material-symbols-outlined text-[14px] shrink-0" style={{ color: "#005cfc" }}>arrow_forward</span>
                  <span className="text-xs font-bold text-white truncate">{t.to_club_name}</span>
                  <span className="mr-auto text-[10px] font-black tabular px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{fmtFee(t.transfer_fee)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* آمار فصل‌به‌فصل */}
        {seasonStats.length > 0 && (
          <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <h3 className="headline text-sm text-white mb-3">آمار فصل‌به‌فصل</h3>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ color: "var(--color-muted)" }}>
                  {["فصل", "لیگ", "بازی", "گل", "پاس", "دقیقه"].map((h, i) => (
                    <th key={i} className={`px-2 py-2 text-xs font-bold ${i <= 1 ? "text-right" : "text-center"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonStats.map((s, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="px-2 py-2 tabular">{s.yr}</td>
                    <td className="px-2 py-2 text-slate-400">{s.competition_id}</td>
                    <td className="px-2 py-2 text-center tabular">{s.games}</td>
                    <td className="px-2 py-2 text-center tabular font-black" style={{ color: "#bee503" }}>{s.goals ?? 0}</td>
                    <td className="px-2 py-2 text-center tabular">{s.assists ?? 0}</td>
                    <td className="px-2 py-2 text-center tabular">{s.minutes ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* تیم + هم‌تیمی‌ها */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <h3 className="headline text-sm text-white mb-3">تیم فعلی</h3>
            {player.ourTeam ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={player.ourTeam.logo} alt={player.ourTeam.name} className="w-12 h-12 object-contain" />
                <div className="min-w-0">
                  <Link href={`/football/teams/${player.ourTeam.slug}`} className="font-bold text-sm text-white hover:text-[#005cfc] transition-colors">{player.ourTeam.name}</Link>
                  <p className="text-[11px] text-slate-400">{player.tmClubName ?? ""}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300 font-bold">{player.tmClubName ?? "—"}</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <h3 className="headline text-sm text-white mb-3">هم‌تیمی‌ها</h3>
            <div className="space-y-1.5">
              {teammates.map((t) => (
                <Link key={t.playerId} href={`/football/players/${t.playerId}`} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <PlayerAvatar name={t.name} size={28} color={color} round />
                  <span className="text-xs font-bold text-slate-200 truncate">{t.name}</span>
                  <span className="mr-auto text-[10px] text-slate-500">{POS_EN_FA[t.position ?? ""] ?? t.position}</span>
                </Link>
              ))}
              {!teammates.length && <p className="text-xs" style={{ color: "var(--color-muted)" }}>در حال بارگذاری...</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= نمای legacy (اسکوادهای دستی ایران) ================= */

function LegacyProfileView({ player, team, league, teammates, market, marketChecked }: { player: any; team: any; league: any; teammates: any[]; market: MarketData | null; marketChecked: boolean }) {
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

        {/* ارزش بازار — Transfermarkt */}
        {marketChecked && market && (
          <section className="rounded-2xl border p-4" style={{ background: "#2a2a2a", borderColor: "rgba(0,92,252,0.25)" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="headline text-sm text-white">ارزش بازار</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>دیتای واقعی Transfermarkt</span>
            </div>
            <div className="flex flex-wrap items-end gap-4 mb-4">
              <div>
                <div className="headline text-2xl tabular" style={{ color: "#005cfc" }}>{fmtEur(market.player.marketValueEur)}</div>
                <div className="text-[10px] text-slate-500">ارزش فعلی</div>
              </div>
              <div>
                <div className="headline text-sm tabular text-slate-300">{fmtEur(market.player.highestMarketValueEur)}</div>
                <div className="text-[10px] text-slate-500">بیشترین سابقه</div>
              </div>
            </div>
            {/* نمودار تاریخچه */}
            {market.history.length > 2 && (
              <div>
                <div className="flex items-end gap-[3px] h-24">
                  {market.history.map((h, i) => {
                    const vals = market.history.map((x) => x.v ?? 0);
                    const max = Math.max(...vals, 1);
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all"
                        style={{ height: `${Math.max(6, ((h.v ?? 0) / max) * 100)}%`, background: i === market.history.length - 1 ? "#bee503" : "#005cfc", opacity: 0.4 + (i / market.history.length) * 0.6 }}
                        title={`${h.date}: ${fmtEur(h.v)}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                  <span>{market.history[0]?.date.slice(0, 7)}</span>
                  <span>تاریخچه ارزش بازار</span>
                  <span>{market.history[market.history.length - 1]?.date.slice(0, 7)}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* پروفایل کامل — Transfermarkt */}
        {marketChecked && market && (
          <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <h3 className="headline text-sm text-white mb-3">پروفایل بازیکن</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 text-[11px]">
              {[
                ["نام کامل (TM)", market.player.prettyName],
                ["پست", POS_EN_FA[market.player.position ?? ""] ?? market.player.position ?? "—"],
                ["تاریخ تولد", market.player.dateOfBirth ? market.player.dateOfBirth.slice(0, 10) : "—"],
                ["سن", age(market.player.dateOfBirth)],
                ["قد", market.player.height ? `${market.player.height} cm` : "—"],
                ["پای غالب", footFa(market.player.foot)],
                ["ملیت", market.player.citizenship ?? "—"],
                ["قرارداد تا", market.player.contractUntil ? market.player.contractUntil.slice(0, 10) : "—"],
                ["باشگاه فعلی (TM)", market.player.tmClubName ?? "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex flex-col gap-0.5 border-b border-white/5 pb-1.5">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-200 font-bold">{v}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* تاریخچه انتقالات واقعی */}
        {marketChecked && market && market.transfers.length > 0 && (
          <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <h3 className="headline text-sm text-white mb-3">سابقه انتقالات</h3>
            <div className="space-y-1.5">
              {market.transfers.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-[11px] tabular text-slate-500 shrink-0 w-16">{t.transfer_date?.slice(0, 10)}</span>
                  <span className="text-xs font-bold text-slate-300 truncate">{t.from_club_name}</span>
                  <span className="material-symbols-outlined text-[14px] shrink-0" style={{ color: "#005cfc" }}>arrow_forward</span>
                  <span className="text-xs font-bold text-white truncate">{t.to_club_name}</span>
                  <span className="mr-auto text-[10px] font-black tabular px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{fmtFee(t.transfer_fee)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

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
              {teammates.map((t) => (
                <Link key={t.id} href={`/football/players/${t.id}`} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <PlayerAvatar name={t.name} size={28} color={team.color} round />
                  <span className="text-xs font-bold text-slate-200 truncate">{t.name}</span>
                  <span className="mr-auto text-[10px] text-slate-500">{POSITION_LABEL[t.position]}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
