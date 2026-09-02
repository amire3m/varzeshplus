"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Leaderboard from "./Leaderboard";
import QuickAccess from "./QuickAccess";

interface QuickLink {
  id: number;
  title: string;
  href: string;
  icon: string;
  order: number;
}

interface LeaderboardEntry {
  id: number;
  rank: number;
  username: string;
  phone: string;
  points: number;
  avatar: string | null;
}

export default function DashboardClient({
  quickLinks,
  leaderboard,
}: {
  quickLinks: QuickLink[];
  leaderboard: LeaderboardEntry[];
}) {
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);

  return (
    <div className="space-y-4">
      {/* Quick Access - always visible */}
      <QuickAccess links={quickLinks} />

      {/* Leaderboard - collapsible on mobile */}
      <div>
        <button
          className="lg:hidden w-full flex items-center justify-between card-panel px-4 py-3 mb-2"
          onClick={() => setLeaderboardOpen(!leaderboardOpen)}
          aria-expanded={leaderboardOpen}
        >
          <span className="text-sm font-bold text-floodlight">برترین‌ها</span>
          {leaderboardOpen ? (
            <ChevronUp className="w-4 h-4 text-floodlight/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-floodlight/40" />
          )}
        </button>
        <div className={`${leaderboardOpen ? "block" : "hidden"} lg:block`}>
          <Leaderboard entries={leaderboard} />
        </div>
      </div>
    </div>
  );
}
