"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { getTeam, getTeamById, leagueOf, standingOf, matchesOfTeam, newsOfTeam, transfersOfTeam, squadFor, formFor, standingsOf, teamsOfLeague } from "@/lib/football";
import { stadiumMapsUrl } from "@/lib/football/stadium-coords";
import { TeamHeader } from "@/components/football/TeamHeader";
import { TeamNavigation, type TeamTab } from "@/components/football/TeamNavigation";
import { MatchCard } from "@/components/football/MatchCard";
import { NewsCard } from "@/components/football/NewsCard";
import { TransferCard } from "@/components/football/TransferCard";
import { SquadTable } from "@/components/football/SquadTable";
import { TeamBadge } from "@/components/football/TeamBadge";
import { PageShell } from "@/components/layout/PageShell";

export default function TeamPage() {
  const params = useParams<{ teamSlug: string; tab?: string[] }>();
  const router = useRouter();
  const team = getTeam(params.teamSlug);
  const initial = (params.tab?.[0] as TeamTab) || "home";
  const [tab, setTab] = useState<TeamTab>(initial);
  const [subStat, setSubStat] = useState("performance");

  useEffect(() => setTab(initial), [initial]);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  if (!team) return notFound();

  const league = leagueOf(team);
  const standing = standingOf(league.id, team.id);
  const matches = matchesOfTeam(team.id);
  const news = newsOfTeam(team.id).length ? newsOfTeam(team.id) : [];
  const transfers = transfersOfTeam(team.id);
  const squad = squadFor(team);
  const form = formFor(team);

  const nextMatch = matches.find((m) => m.status === "upcoming") ?? matches.find((m) => m.status === "live");
  const liveMatch = matches.find((m) => m.status === "live");
  const finishedMatches = matches.filter((m) => m.status === "finished").slice(0, 5);
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const allMatches = matches;

  const topScorer = [...squad].sort((a, b) => b.goals - a.goals)[0];
  const topAssist = [...squad].sort((a, b) => b.assists - a.assists)[0];
  const topApps = [...squad].sort((a, b) => b.appearances - a.appearances)[0];
  const topGK = squad.filter((p) => p.position === "GK").sort((a, b) => b.appearances - a.appearances)[0];

  const changeTab = (t: TeamTab) => {
    setTab(t); scrollToTop();
    router.push(`/football/teams/${team.slug}${t === "home" ? "" : `/${t}`}`);
  };

  return (
    <PageShell badge={team.name} activeDock="home">
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 py-5 space-y-5">
        <TeamHeader team={team} league={league} rank={standing?.rank ?? 0} />
        <TeamNavigation active={tab} onChange={changeTab} />

        {tab === "home" && (
          <div className="space-y-8">
            {/* Next Match */}
            {nextMatch && (
              <section>
                <h2 className="headline text-lg mb-3">مسابقه بعدی</h2>
                <div className="glass-panel p-5 flex flex-col items-center gap-4">
                  <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{nextMatch.competition} • {nextMatch.kickoff}{nextMatch.stadium ? ` • ${nextMatch.stadium}` : ""}</span>
                  <div className="flex items-center gap-6 md:gap-10 w-full justify-center">
                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                      <TeamBadge team={getTeamById(nextMatch.homeTeamId)} size={56} />
                      <span className="text-sm font-bold text-center">{getTeamById(nextMatch.homeTeamId).name}</span>
                    </div>
                    <span className="headline text-2xl" style={{ color: "var(--color-muted)" }}>VS</span>
                    <div className="flex flex-col items-center gap-2 min-w-[100px]">
                      <TeamBadge team={getTeamById(nextMatch.awayTeamId)} size={56} />
                      <span className="text-sm font-bold text-center">{getTeamById(nextMatch.awayTeamId).name}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Recent results */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="headline text-lg">نتایج اخیر</h2>
                <button onClick={() => changeTab("results")} className="text-sm hover:underline" style={{ color: "var(--color-club-green)" }}>همه نتایج</button>
              </div>
              <div className="space-y-2">
                {form.map((f, i) => {
                  const opp = getTeamById(f.opponentId);
                  const col = f.result === "W" ? "#27ae60" : f.result === "D" ? "#8b99ac" : "#E23B3B";
                  return (
                    <div key={i} className="glass-panel px-4 py-3 flex items-center gap-3 text-sm">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white" style={{ background: col }}>{f.result}</span>
                      <span className="text-xs tabular" style={{ color: "var(--color-muted)" }}>{f.date}</span>
                      <Link href={`/football/teams/${opp.slug}`} className="flex items-center gap-1.5 font-bold truncate hover:underline decoration-[#005cfc]"><TeamBadge team={opp} size={20} />{opp.name}</Link>
                      <span className="mr-auto tabular font-black">{f.score}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* League position */}
            <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="headline text-lg">وضعیت در جدول</h2>
                  <Link href={`/football/leagues/${league.slug}/standings`} className="text-sm hover:underline" style={{ color: "var(--color-club-green)" }}>مشاهده جدول کامل</Link>
                </div>
                <LeaguePosition leagueId={league.id} teamId={team.id} />
              </div>

              {/* Team info */}
              <div className="glass-panel p-4 space-y-2.5 text-sm">
                <h2 className="headline text-base mb-2">درباره باشگاه</h2>
                {[["نام کامل", team.name], ["لیگ", league.name], ["کشور", team.countryId], ["شهر", team.city], ["ورزشگاه", team.stadium], ["سال تأسیس", String(team.founded)], ["سرمربی", team.coach]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-white/5 pb-2 last:border-0"><span className="text-xs" style={{ color: "var(--color-muted)" }}>{k}</span><span className="font-bold text-xs text-left">{v}</span></div>
                ))}
                {team.website && <a href={team.website} target="_blank" rel="noreferrer" className="text-xs hover:underline" style={{ color: "var(--color-club-green)" }}>وب‌سایت رسمی</a>}
                {stadiumMapsUrl(team.slug) && (
                  <a href={stadiumMapsUrl(team.slug)!} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: "#005cfc" }}>
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    مشاهده {team.stadium} روی نقشه
                  </a>
                )}
              </div>
            </section>

            {/* Team leaders */}
            <section>
              <h2 className="headline text-lg mb-3">بهترین‌های تیم</h2>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {([topScorer, "گل"] as const).map((p, i) => p && typeof p !== "string" && <LeaderCard key={i} player={p} label="گل" teamColor={team.color} />)}
                {([topAssist, "پاس گل"] as const).map((p, i) => p && typeof p !== "string" && <LeaderCard key={i} player={p} label="پاس گل" teamColor={team.color} />)}
                {([topApps, "بازی"] as const).map((p, i) => p && typeof p !== "string" && <LeaderCard key={i} player={p} label="بازی" teamColor={team.color} />)}
                {([topGK, "کلین‌شیت"] as const).map((p, i) => p && typeof p !== "string" && <LeaderCard key={i} player={p} label="کلین‌شیت" teamColor={team.color} />)}
              </div>
            </section>

            {/* Recent transfers */}
            {transfers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="headline text-lg">نقل‌وانتقالات اخیر</h2>
                  <button onClick={() => changeTab("transfers")} className="text-sm hover:underline" style={{ color: "var(--color-club-green)" }}>همه نقل‌وانتقالات</button>
                </div>
                <div className="space-y-2.5">{transfers.slice(0, 3).map((t) => <TransferCard key={t.id} transfer={t} getTeam={getTeamById} />)}</div>
              </section>
            )}

            {/* Latest news */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="headline text-lg">تازه‌ترین اخبار</h2>
                <button onClick={() => changeTab("news")} className="text-sm hover:underline" style={{ color: "var(--color-club-green)" }}>همه اخبار</button>
              </div>
              {news.length ? (
                <div className="grid gap-3 md:grid-cols-3">{news.slice(0, 3).map((n) => <NewsCard key={n.id} news={n} getTeam={getTeamById} />)}</div>
              ) : (
                <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>خبری برای این تیم ثبت نشده است.</div>
              )}
            </section>
          </div>
        )}

        {tab === "matches" && (
          <div className="space-y-6">
            <h2 className="headline text-lg">بازی‌های {team.name}</h2>
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ color: "#ffb4ab" }}>در جریان</h3>
              <div className="grid gap-3 md:grid-cols-2">{allMatches.filter((m) => m.status === "live").map((m) => <MatchCard key={m.id} match={m} getTeam={getTeamById} />)}</div>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ color: "var(--color-muted)" }}>بازی‌های آینده</h3>
              <div className="grid gap-3 md:grid-cols-2">{upcomingMatches.map((m) => <MatchCard key={m.id} match={m} getTeam={getTeamById} />)}</div>
            </div>
          </div>
        )}

        {tab === "results" && (
          <div className="space-y-4">
            <h2 className="headline text-lg">نتایج {team.name}</h2>
            <div className="grid gap-3 md:grid-cols-2">{finishedMatches.map((m) => <MatchCard key={m.id} match={m} getTeam={getTeamById} />)}</div>
            {!finishedMatches.length && <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>نتیجه‌ای ثبت نشده است.</div>}
          </div>
        )}

        {tab === "squad" && <SquadTable team={team} />}

        {tab === "stats" && (
          <div className="space-y-6">
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="headline text-lg ml-auto">آمار {team.name}</h2>
              {["performance", "goals", "assists", "defense", "discipline"].map((s) => (
                <button key={s} onClick={() => setSubStat(s)} className="px-3 py-1.5 rounded-full text-xs border transition-colors" style={subStat === s ? { background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff", borderColor: "transparent" } : { borderColor: "rgba(255,255,255,0.12)", color: "var(--color-muted)" }}>{s === "performance" ? "عملکرد" : s === "goals" ? "گلزنی" : s === "assists" ? "پاس گل" : s === "defense" ? "دفاع" : "انضباط"}</button>
              ))}
            </div>

            {subStat === "performance" && standing && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[["بازی", standing.row.played], ["برد", standing.row.win], ["مساوی", standing.row.draw], ["باخت", standing.row.loss], ["گل زده", standing.row.gf], ["گل خورده", standing.row.ga], ["تفاضل", standing.row.gf - standing.row.ga], ["امتیاز", standing.row.pts]].map(([k, v]) => (
                  <div key={String(k)} className="glass-panel p-4 text-center"><p className="headline text-xl tabular" style={{ color: "var(--color-club-green)" }}>{v}</p><p className="text-xs" style={{ color: "var(--color-muted)" }}>{k}</p></div>
                ))}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {subStat === "goals" && [...squad].sort((a, b) => b.goals - a.goals).slice(0, 6).map((p) => <SquadStatRow key={p.id} name={p.name} num={p.number} value={p.goals} label="گل" teamColor={team.color} />)}
              {subStat === "assists" && [...squad].sort((a, b) => b.assists - a.assists).slice(0, 6).map((p) => <SquadStatRow key={p.id} name={p.name} num={p.number} value={p.assists} label="پاس گل" teamColor={team.color} />)}
              {subStat === "defense" && [...squad].sort((a, b) => b.appearances - a.appearances).slice(0, 6).map((p) => <SquadStatRow key={p.id} name={p.name} num={p.number} value={p.appearances} label="بازی" teamColor={team.color} />)}
              {subStat === "discipline" && [...squad].sort((a, b) => (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2)).slice(0, 6).map((p) => <SquadStatRow key={p.id} name={p.name} num={p.number} value={`${p.yellowCards} زرد / ${p.redCards} قرمز`} label="کارت" teamColor={team.color} />)}
            </div>
          </div>
        )}

        {tab === "transfers" && (
          <div className="space-y-4">
            <h2 className="headline text-lg">نقل‌وانتقالات {team.name}</h2>
            {transfers.length ? (
              <div className="space-y-2.5">{transfers.map((t) => <TransferCard key={t.id} transfer={t} getTeam={getTeamById} />)}</div>
            ) : (
              <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>نقل‌وانتقالی ثبت نشده است.</div>
            )}
          </div>
        )}

        {tab === "news" && (
          <div className="space-y-4">
            <h2 className="headline text-lg">اخبار {team.name}</h2>
            {news.length ? (
              <div className="grid gap-3 md:grid-cols-2">{news.map((n) => <NewsCard key={n.id} news={n} getTeam={getTeamById} />)}</div>
            ) : (
              <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>خبری برای این تیم ثبت نشده است.</div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-5 text-center text-xs" style={{ color: "#8FA1B5" }}>
        ورزش پلاس — {team.name} • {league.name} {league.season}
      </footer>
    </PageShell>
  );
}

function SquadStatRow({ name, num, value, label, teamColor }: { name: string; num: number; value: number | string; label: string; teamColor: string }) {
  return (
    <div className="glass-panel p-3.5 flex items-center gap-3 text-sm">
      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0" style={{ background: `${teamColor}22`, color: teamColor }}>{name.slice(0, 2)}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold truncate">{name}</p>
        <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>شماره {num}</p>
      </div>
      <div className="text-center shrink-0"><p className="headline text-base tabular">{value}</p><p className="text-[10px]" style={{ color: "var(--color-muted)" }}>{label}</p></div>
    </div>
  );
}

function LeaderCard({ player, label, teamColor }: { player: import("@/lib/football").Player; label: string; teamColor: string }) {
  const value = label === "گل" ? player.goals : label === "پاس گل" ? player.assists : player.appearances;
  return (
    <div className="glass-panel p-4 flex flex-col items-center gap-2 text-center">
      <span className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black" style={{ background: `${teamColor}22`, color: teamColor }}>{player.name.slice(0, 2)}</span>
      <div className="min-w-0"><p className="text-sm font-bold truncate">{player.name}</p><p className="text-[10px]" style={{ color: "var(--color-muted)" }}>#{player.number} • {player.position}</p></div>
      <p className="headline text-lg tabular" style={{ color: "var(--color-club-green)" }}>{value}</p>
      <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>{label}</span>
    </div>
  );
}

function LeaguePosition({ leagueId, teamId }: { leagueId: number; teamId: number }) {
  const standings = standingsOf(leagueId);
  const idx = standings.findIndex((s) => s.teamId === teamId);
  if (idx === -1) return null;
  const range = standings.slice(Math.max(0, idx - 3), idx + 4);
  return (
    <div className="glass-panel overflow-x-auto">
      <table className="w-full min-w-[380px] text-sm">
        <thead><tr style={{ color: "var(--color-muted)" }}><th className="px-3 py-2.5 text-left text-xs font-bold">#</th><th className="px-3 py-2.5 text-left text-xs font-bold">تیم</th><th className="px-3 py-2.5 text-center text-xs font-bold">P</th><th className="px-3 py-2.5 text-center text-xs font-bold">PTS</th></tr></thead>
        <tbody>
          {range.map((s) => {
            const t = getTeamById(s.teamId);
            const isMe = s.teamId === teamId;
            const rank = standings.indexOf(s) + 1;
            return (
              <tr key={s.teamId} className={`border-t border-white/5 ${isMe ? "" : "opacity-70"}`} style={isMe ? { background: "rgba(23,182,204,0.1)" } : undefined}>
                <td className="px-3 py-2.5 tabular font-black">{rank}</td>
                <td className="px-3 py-2.5"><Link href={`/football/teams/${t.slug}`} className={`flex items-center gap-2 min-w-0 ${isMe ? "font-black" : "font-bold"} hover:underline decoration-[#005cfc]`}><TeamBadge team={t} size={22} /><span className="truncate">{t.name}</span></Link></td>
                <td className="px-3 py-2.5 text-center tabular">{s.played}</td>
                <td className="px-3 py-2.5 text-center tabular font-black" style={{ color: "var(--color-club-green)" }}>{s.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}