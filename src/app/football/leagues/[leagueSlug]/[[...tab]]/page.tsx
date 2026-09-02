"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { getLeague, getTeamById, teamsOfLeague, standingsOf, matchesOfLeague, newsOfLeague, transfersOfLeague, topStats } from "@/lib/football";
import { LeagueHeader } from "@/components/football/LeagueHeader";
import { LeagueNavigation, type LeagueTab } from "@/components/football/LeagueNavigation";
import { MatchCard } from "@/components/football/MatchCard";
import { MatchGlowCard } from "@/components/home/MatchGlowCard";
import { StandingsTable } from "@/components/football/StandingsTable";
import { NewsCard } from "@/components/football/NewsCard";
import { TransferCard } from "@/components/football/TransferCard";
import { PlayerStatsCard } from "@/components/football/PlayerStatsCard";
import { TeamCard } from "@/components/football/TeamCard";
import { PageShell } from "@/components/layout/PageShell";

export default function LeaguePage() {
  const params = useParams<{ leagueSlug: string; tab?: string[] }>();
  const router = useRouter();
  const league = getLeague(params.leagueSlug);
  const initial = (params.tab?.[0] as LeagueTab) || "home";
  const [tab, setTab] = useState<LeagueTab>(initial);
  const [liveData, setLiveData] = useState<{ matches: ReturnType<typeof matchesOfLeague>; standings: ReturnType<typeof standingsOf> } | null>(null);

  useEffect(() => setTab(initial), [initial]);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

  if (!league) return notFound();

  const teams = teamsOfLeague(league.id);
  const staticStandings = standingsOf(league.id);
  useEffect(() => {
    let alive = true;
    fetch(`/api/football/leagues?league=${league.slug}`)
      .then((r) => r.json())
      .then((res) => { if (alive && res.success) setLiveData(res); })
      .catch(() => {});
    return () => { alive = false; };
  }, [league.slug]);

  const standings = liveData?.standings ?? staticStandings;
  const matches = liveData?.matches ?? matchesOfLeague(league.id);
  const news = newsOfLeague(league.id);
  const transfers = transfersOfLeague(league.id);
  const liveMatches = matches.filter((m) => m.status === "live");
  const hotNews = news.filter((n) => n.hot);

  const changeTab = (t: LeagueTab) => {
    setTab(t); scrollToTop();
    router.push(`/football/leagues/${league.slug}${t === "home" ? "" : `/${t}`}`);
  };

  return (
    <PageShell badge={league.englishName} activeDock="home">
      <main className="flex-1 w-full max-w-[1320px] mx-auto px-4 py-5 space-y-5">
        <LeagueHeader league={league} />
        <LeagueNavigation active={tab} onChange={changeTab} />

        {tab === "home" && (
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="headline text-lg text-white">بازی‌های مهم</h2>
                <button onClick={() => changeTab("matches")} className="text-sm hover:underline" style={{ color: "#bee503" }}>همه بازی‌ها</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {(liveMatches.length ? liveMatches : matches.filter((m) => m.status !== "upcoming")).slice(0, 3).map((m) => <MatchGlowCard key={m.id} match={m} home={getTeamById(m.homeTeamId)} away={getTeamById(m.awayTeamId)} />)}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="headline text-lg text-white">جدول {league.name}</h2>
                  <button onClick={() => changeTab("standings")} className="text-sm hover:underline" style={{ color: "#bee503" }}>مشاهده جدول کامل</button>
                </div>
                <StandingsTable league={league} custom={{ standings: standings.slice(0, 6), teams }} />
                <button onClick={() => changeTab("standings")} className="w-full py-2.5 text-sm mt-3 rounded-xl border font-bold transition-colors hover:bg-white/5" style={{ borderColor: "rgba(0,92,252,0.35)", color: "#005cfc" }}>مشاهده جدول کامل</button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="headline text-lg text-white">اخبار داغ</h2>
                    <button onClick={() => changeTab("news")} className="text-sm hover:underline" style={{ color: "#bee503" }}>همه اخبار</button>
                  </div>
                  <div className="space-y-3">{hotNews.slice(0, 3).map((n) => <NewsCard key={n.id} news={n} getTeam={getTeamById} />)}</div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="headline text-lg text-white">تازه‌ترین اخبار</h2>
                <button onClick={() => changeTab("news")} className="text-sm hover:underline" style={{ color: "#bee503" }}>همه اخبار</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">{news.slice(0, 3).map((n) => <NewsCard key={n.id} news={n} getTeam={getTeamById} />)}</div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="headline text-lg text-white">آخرین نقل‌وانتقالات</h2>
                <button onClick={() => changeTab("transfers")} className="text-sm hover:underline" style={{ color: "#bee503" }}>مشاهده همه</button>
              </div>
              <div className="space-y-2.5">{transfers.slice(0, 3).map((t) => <TransferCard key={t.id} transfer={t} getTeam={getTeamById} />)}</div>
            </section>
          </div>
        )}

        {tab === "matches" && (
          <div className="space-y-6">
            <h2 className="headline text-lg text-white">بازی‌های {league.name}</h2>
            {[{ label: "در جریان", status: "live" }, { label: "بازی‌های آینده", status: "upcoming" }, { label: "نتایج", status: "finished" }].map(({ label, status }) => (
              <div key={status}>
                <h3 className="text-sm font-bold mb-2" style={{ color: status === "live" ? "#ff8fab" : "var(--color-muted)" }}>{label}</h3>
                <div className="grid gap-3 md:grid-cols-2">{matches.filter((m) => m.status === status).map((m) => <MatchCard key={m.id} match={m} getTeam={getTeamById} />)}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "standings" && <StandingsTable league={league} custom={{ standings, teams }} />}

        {tab === "news" && (
          <div className="space-y-6">
            <div><h2 className="headline text-lg mb-3 text-white">اخبار داغ</h2><div className="grid gap-3 lg:grid-cols-2">
              {hotNews[0] && <NewsCard news={hotNews[0]} getTeam={getTeamById} big />}
              <div className="grid gap-3">{hotNews.slice(1).map((n) => <NewsCard key={n.id} news={n} getTeam={getTeamById} />)}</div>
            </div></div>
            <div><h2 className="headline text-lg mb-3 text-white">تازه‌ترین اخبار</h2><div className="grid gap-3 md:grid-cols-2">{news.map((n) => <NewsCard key={n.id} news={n} getTeam={getTeamById} />)}</div></div>
          </div>
        )}

        {tab === "transfers" && (
          <div className="space-y-4">
            <h2 className="headline text-lg text-white">نقل‌وانتقالات {league.name}</h2>
            <div className="space-y-2.5">{transfers.map((t) => <TransferCard key={t.id} transfer={t} getTeam={getTeamById} />)}</div>
          </div>
        )}

        {tab === "stats" && (
          <div className="space-y-6">
            <h2 className="headline text-lg text-white">آمار {league.name}</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {[["برترین گلزنان", "گل", topStats(league.id, "goals")], ["بیشترین پاس گل", "پاس", topStats(league.id, "assists")], ["بیشترین کلین‌شیت", "کلین‌شیت", topStats(league.id, "clean")]].map(([title, label, list]) => (
                <div key={String(title)}>
                  <h3 className="text-sm font-bold mb-3 text-white">{String(title)}</h3>
                  <div className="space-y-2">{(list as ReturnType<typeof topStats>).map((p) => <PlayerStatsCard key={p.player} stat={p} getTeam={getTeamById} label={String(label)} />)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "teams" && (
          <div className="space-y-4">
            <h2 className="headline text-lg text-white">باشگاه‌های {league.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{teams.map((t) => <TeamCard key={t.id} team={t} />)}</div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-5 text-center text-xs" style={{ color: "#8FA1B5" }}>
        ورزش پلاس — {league.name} • {league.season}
      </footer>
    </PageShell>
  );
}
