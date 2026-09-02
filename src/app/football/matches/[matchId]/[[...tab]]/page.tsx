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

  useEffect(() => setTab(initial), [initial]);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  // fallback: اگر مسابقه در دادهٔ mock نبود (matches واقعی با id 10000+)، از API لیگ بگیر
  useEffect(() => {
    if (staticMatch || Number.isNaN(matchId)) return;
    const leagueId = Math.floor(matchId / 10000);
    // نگاشت leagueId به slug بدون import اضافی
    const slugMap: Record<number, string> = { 1: "premier-league", 2: "la-liga", 3: "serie-a", 4: "bundesliga", 5: "ligue-1", 6: "eredivisie", 7: "primeira-liga", 8: "super-lig", 9: "saudi-pro-league", 10: "brasileirao", 11: "mls", 12: "persian-gulf" };
    const slug = slugMap[leagueId];
    if (!slug) return;
    fetch(`/api/football/leagues?league=${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.matches)) {
          const found = res.matches.find((m: { id: number }) => m.id === matchId);
          if (found) setDynamicMatch(found);
        }
      })
      .catch(() => {});
  }, [matchId, staticMatch]);

  const match = staticMatch ?? dynamicMatch;
  if (!match) {
    if (dynamicMatch === null && !staticMatch) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#252525" }}>
          <p className="text-sm animate-pulse" style={{ color: "var(--color-muted)" }}>در حال بارگذاری مسابقه...</p>
        </div>
      );
    }
    return notFound();
  }

  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const league = getLeagueById(match.leagueId);
  const isLive = match.status === "live";

  const changeTab = (t: MatchTab) => {
    setTab(t); scrollToTop();
    router.push(`/football/matches/${matchId}${t === "overview" ? "" : `/${t}`}`);
  };

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