"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { getMatchById, getTeamById, getLeagueById } from "@/lib/football";
import { MatchNavigation, type MatchTab } from "@/components/football/lineup/MatchNavigation";
import { MatchLineup } from "@/components/football/lineup/MatchLineup";
import { MatchTimelineView } from "@/components/football/lineup/MatchTimeline";
import { MatchStatsView } from "@/components/football/MatchStatsView";
import { MatchSideEvents } from "@/components/football/MatchSideEvents";
import { MatchProbs } from "@/components/football/MatchProbs";
import { RealMatchView, type MatchData } from "@/components/football/RealMatchView";
import { TeamBadge } from "@/components/football/TeamBadge";
import { PageShell } from "@/components/layout/PageShell";

export default function MatchPage() {
  const params = useParams<{ matchId: string; tab?: string[] }>();
  const router = useRouter();
  const matchId = Number(params.matchId);
  const staticMatch = getMatchById(matchId);
  const initial = (params.tab?.[0] as MatchTab) || "overview";
  const [tab, setTab] = useState<MatchTab>(initial);
  const [dynamicMatch, setDynamicMatch] = useState<ReturnType<typeof getMatchById> | null>(null);
  const [realMatch, setRealMatch] = useState<MatchData | null>(null);
  const [realChecked, setRealChecked] = useState(false);

  useEffect(() => setTab(initial), [initial]);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  // اول: تلاش برای بازی واقعی TM — بعد fallback به دیتای لیگ
  useEffect(() => {
    if (staticMatch || Number.isNaN(matchId) || matchId < 10000) return;
    fetch(`/api/football/match-data?gameId=${matchId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res.covered) { setRealMatch(res); setRealChecked(true); return; }
        const leagueId = Math.floor(matchId / 10000);
        const slugMap: Record<number, string> = { 1: "premier-league", 2: "la-liga", 3: "serie-a", 4: "bundesliga", 5: "ligue-1", 6: "eredivisie", 7: "primeira-liga", 8: "super-lig", 9: "saudi-pro-league", 10: "brasileirao", 11: "mls", 12: "persian-gulf" };
        const slug = slugMap[leagueId];
        if (!slug) { setRealChecked(true); return; }
        fetch(`/api/football/leagues?league=${slug}`)
          .then((r) => r.json())
          .then((res2) => {
            if (res2.success && Array.isArray(res2.matches)) {
              const found = res2.matches.find((m: { id: number }) => m.id === matchId);
              if (found) setDynamicMatch(found);
            }
            setRealChecked(true);
          })
          .catch(() => setRealChecked(true));
      })
      .catch(() => setRealChecked(true));
  }, [matchId, staticMatch]);

  // تب واقعی
  const [realTab, setRealTab] = useState<"overview" | "lineup" | "stats" | "events" | "standings">("overview");
  useEffect(() => setRealTab(initial as typeof realTab), [initial]);

  const changeTab = (t: MatchTab) => {
    setTab(t); setRealTab(t); scrollToTop();
    router.push(`/football/matches/${params.matchId}${t === "overview" ? "" : `/${t}`}`);
  };

  // ===== بازی واقعی TM =====
  if (realMatch) {
    return (
      <PageShell badge={realMatch.game.competitionId} activeDock="matches">
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 py-5 space-y-5">
          <MatchNavigation active={realTab} onChange={changeTab} />
          {realTab === "standings" ? (
            <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
              جدول لیگ در صفحه <Link href={`/football/leagues/${Object.entries({ GB1: "premier-league", ES1: "la-liga", IT1: "serie-a", L1: "bundesliga", FR1: "ligue-1", NL1: "eredivisie", PO1: "primeira-liga", TR1: "super-lig", SA1: "saudi-pro-league", BRA1: "brasileirao", MLS1: "mls" }).find(([code]) => code === realMatch.game.competitionId)?.[1] ?? ""}/standings`} className="hover:underline" style={{ color: "var(--color-club-green)" }}>لیگ</Link> قابل مشاهده است.
            </div>
          ) : (
            <>
              {realTab === "overview" && realMatch.game.home.tmId && realMatch.game.away.tmId && (
                <MatchProbs homeTmId={realMatch.game.home.tmId} awayTmId={realMatch.game.away.tmId} comp={realMatch.game.competitionId} />
              )}
              <RealMatchView data={realMatch} tab={realTab} />
            </>
          )}
        </main>
        <footer className="border-t border-white/5 py-5 text-center text-xs" style={{ color: "#8FA1B5" }}>
          ورزش پلاس — {realMatch.game.competitionId} • دیتای واقعی Transfermarkt
        </footer>
      </PageShell>
    );
  }

  const match = staticMatch ?? dynamicMatch;
  if (!match) {
    if (realChecked && dynamicMatch === null && !staticMatch) return notFound();
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#252525" }}>
        <p className="text-sm animate-pulse" style={{ color: "var(--color-muted)" }}>در حال بارگذاری مسابقه...</p>
      </div>
    );
  }

  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const league = getLeagueById(match.leagueId);
  const isLive = match.status === "live";

  return (
    <PageShell badge={match.competition} activeDock="matches">
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 py-5 space-y-5">
        {/* هدر مسابقه */}
        <section className="panel p-4 md:p-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <TeamBadge team={home} size={48} />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{home.name}</p>
              <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>{home.shortName}</span>
            </div>
          </div>
          <div className="flex flex-col items-center shrink-0">
            {match.status === "upcoming" ? (
              <span className="text-sm font-bold px-3 py-1 rounded-full border" style={{ color: "var(--color-muted)", borderColor: "rgba(255,255,255,0.12)" }}>VS</span>
            ) : (
              <span className="headline text-2xl md:text-3xl tabular">{match.homeScore} - {match.awayScore}</span>
            )}
            <span className="text-[11px] mt-1" style={{ color: "var(--color-muted)" }}>{match.kickoff}</span>
            {isLive && <span className="flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-full mt-1" style={{ background: "rgba(226,59,59,0.15)", color: "#ffb4ab" }}><span className="live-dot" style={{ width: 6, height: 6 }} /> {match.minute}&apos;</span>}
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
            <div className="min-w-0 text-right">
              <p className="font-bold text-sm truncate">{away.name}</p>
              <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>{away.shortName}</span>
            </div>
            <TeamBadge team={away} size={48} />
          </div>
        </section>

        {/* ناوبری */}
        <MatchNavigation active={tab} onChange={changeTab} />

        {/* تب‌ها */}
        {tab === "overview" && <MatchTimelineView match={match} />}

        {tab === "lineup" && <MatchLineup match={match} homeTeam={home} awayTeam={away} />}

        {tab === "stats" && <MatchStatsView match={match} />}

        {tab === "events" && <MatchSideEvents match={match} />}

        {tab === "standings" && (
          <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            جدول لیگ در صفحه {league ? <Link href={`/football/leagues/${league.slug}/standings`} className="hover:underline" style={{ color: "var(--color-club-green)" }}>لیگ</Link> : "لیگ"} قابل مشاهده است.
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-5 text-center text-xs" style={{ color: "#8FA1B5" }}>
        ورزش پلاس — {match.competition} • هفته {match.matchweek}
      </footer>
    </PageShell>
  );
}