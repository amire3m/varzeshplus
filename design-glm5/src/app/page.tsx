import { db } from "@/db";
import { matches, games, leaderboard, scoreboard, quickLinks } from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import Header from "@/components/Header";
import LiveScoreboard from "@/components/LiveScoreboard";
import UpcomingMatches from "@/components/UpcomingMatches";
import HeroSection from "@/components/HeroSection";
import GameCards from "@/components/GameCards";
import Leaderboard from "@/components/Leaderboard";
import QuickAccess from "@/components/QuickAccess";
import DashboardClient from "@/components/DashboardClient";

export default async function HomePage() {
  const [allMatches, allGames, allLeaderboard, allScoreboard, allQuickLinks] = await Promise.all([
    db
      .select()
      .from(matches)
      .orderBy(
        asc(sql`CASE status WHEN 'live' THEN 0 WHEN 'upcoming' THEN 1 ELSE 2 END`),
        asc(matches.kickoff)
      ),
    db.select().from(games),
    db.select().from(leaderboard).orderBy(asc(leaderboard.rank)),
    db.select().from(scoreboard),
    db.select().from(quickLinks).orderBy(asc(quickLinks.order)),
  ]);

  const serializedMatches = allMatches.map((m) => ({
    ...m,
    kickoff: m.kickoff.toISOString(),
  }));

  const serializedGames = allGames.map((g) => ({
    ...g,
    endsAt: g.endsAt?.toISOString() ?? null,
  }));

  return (
    <div className="min-h-screen bg-ink-pitch">
      <Header />

      {/* Live Scoreboard - spans full width */}
      <LiveScoreboard entries={allScoreboard} />

      {/* Main dashboard - three column layout */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Upcoming Matches */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <UpcomingMatches matches={serializedMatches} />
          </div>

          {/* Center column - Hero + Game Cards */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <HeroSection />
            <GameCards games={serializedGames} />
          </div>

          {/* Right column - Quick Access + Leaderboard */}
          <div className="lg:col-span-3 order-3">
            <DashboardClient
              quickLinks={allQuickLinks}
              leaderboard={allLeaderboard}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-panel-border mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-club-green flex items-center justify-center">
                <span className="text-ink-pitch font-black text-xs">و</span>
              </div>
              <span className="text-sm font-bold text-floodlight/60">
                ورزش پلاس © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-floodlight/30">
              <a href="#" className="hover:text-floodlight/60 transition-colors">قوانین و مقررات</a>
              <a href="#" className="hover:text-floodlight/60 transition-colors">حریم خصوصی</a>
              <a href="#" className="hover:text-floodlight/60 transition-colors">تماس با ما</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
