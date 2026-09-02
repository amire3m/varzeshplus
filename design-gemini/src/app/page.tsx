"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MatchTickerBar } from "@/components/MatchTickerBar";
import { HeroSection } from "@/components/HeroSection";
import { GameCards } from "@/components/GameCards";
import { UpcomingMatches } from "@/components/UpcomingMatches";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { UserProfileCard } from "@/components/UserProfileCard";
import { MatchChat } from "@/components/MatchChat";

import { PredictionModal } from "@/components/PredictionModal";
import { QuizModal } from "@/components/QuizModal";
import { VideoChallengeModal } from "@/components/VideoChallengeModal";
import { RewardsStoreModal } from "@/components/RewardsStoreModal";
import { MatchDetailsModal } from "@/components/MatchDetailsModal";
import { DailyWheelModal } from "@/components/DailyWheelModal";

import { CheckCircle, AlertCircle, Sparkles, Coins, Zap } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // App Data States
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number>(1);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Modals States
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [selectedMatchForPrediction, setSelectedMatchForPrediction] = useState<any>(null);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState(false);
  const [selectedMatchForDetails, setSelectedMatchForDetails] = useState<any>(null);

  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);

  // Toast Banner State
  const [toast, setToast] = useState<{ message: string; coins?: number } | null>(null);

  const showToast = (message: string, coins?: number) => {
    setToast({ message, coins });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const res = await fetch("/api/init");
      const json = await res.json();
      if (json.success && json.data) {
        setMatches(json.data.matches || []);
        setQuizzes(json.data.quizzes || []);
        setVideos(json.data.videoChallenges || []);
        setUser(json.data.user || null);
        setLeaderboard(json.data.leaderboard || []);
        setRewards(json.data.rewards || []);
        setChatMessages(json.data.chatMessages || []);

        if (json.data.matches && json.data.matches.length > 0) {
          setSelectedMatchId(json.data.matches[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load Varzesh Plus data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  // Actions
  const handlePredictionSubmit = async (matchId: number, homeScore: number, awayScore: number) => {
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore, awayScore }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) setUser(data.user);
        showToast(data.message, 50);
        // Refresh matches prediction count
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId ? { ...m, predictionsCount: (m.predictionsCount || 0) + 1 } : m
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizAnswerSubmit = async (quizId: number, selectedOption: number) => {
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, selectedOption }),
      });
      const data = await res.json();
      if (data.success && data.isCorrect) {
        if (data.user) setUser(data.user);
        showToast(`پاسخ درست! +${data.coinReward} سکه دریافت شد`, data.coinReward);
      }
      return data;
    } catch (err) {
      console.error(err);
      return { success: false, isCorrect: false };
    }
  };

  const handleClaimDailyBonus = async () => {
    try {
      const res = await fetch("/api/user/daily-bonus", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        showToast("پاداش روزانه +۳۰۰ سکه دریافت شد! 🎉", 300);
      } else {
        showToast(data.error || "خطا در دریافت پاداش");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (message: string, teamBadge: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: selectedMatchId, message, teamBadge }),
      });
      const data = await res.json();
      if (data.success && data.chatMessage) {
        setChatMessages((prev) => [...prev, data.chatMessage]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeemReward = async (rewardId: number) => {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        showToast("جایزه با موفقیت دریافت شد! 🎁");
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const handleSpinWinCoins = (coins: number) => {
    setUser((prev: any) => (prev ? { ...prev, coins: prev.coins + coins } : null));
    showToast(`برنده +${coins} سکه گردونه شانس شدید! 🎰`, coins);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B121C] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#2ECC71] border-t-transparent animate-spin"></div>
        <div className="font-bold text-sm text-slate-300">در حال بارگذاری باشگاه ورزش پلاس...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B121C] text-[#F4F7FA] font-vazir pb-12 selection:bg-[#2ECC71] selection:text-slate-950">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#141C29] border border-[#2ECC71] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-xs">{toast.message}</span>
          {toast.coins && (
            <span className="bg-amber-500/20 text-amber-300 font-scoreboard text-xs font-black px-2 py-0.5 rounded-lg border border-amber-500/30">
              +{toast.coins} 🪙
            </span>
          )}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={user}
        onOpenRewards={() => setIsRewardsModalOpen(true)}
        onOpenWheel={() => setIsWheelModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-4 space-y-6">
        {/* Top Live Ticker Anchor */}
        <MatchTickerBar
          matches={matches}
          selectedMatchId={selectedMatchId}
          onSelectMatch={(id) => setSelectedMatchId(id)}
        />

        {/* Dynamic Tab Content or 3-Column Layout */}
        {activeTab === "leaderboard" ? (
          <div className="max-w-2xl mx-auto py-4">
            <LeaderboardPanel items={leaderboard} currentUserRank={user?.rank || 7} />
          </div>
        ) : activeTab === "matches" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <UpcomingMatches
                matches={matches}
                selectedMatchId={selectedMatchId}
                onSelectMatch={(id) => setSelectedMatchId(id)}
                onOpenPredictionModal={(m) => {
                  setSelectedMatchForPrediction(m);
                  setIsPredictionModalOpen(true);
                }}
              />
            </div>
            <div className="lg:col-span-7 space-y-6">
              {selectedMatch && (
                <HeroSection
                  match={selectedMatch}
                  onOpenPredictionModal={(m) => {
                    setSelectedMatchForPrediction(m);
                    setIsPredictionModalOpen(true);
                  }}
                  onOpenMatchDetails={(m) => {
                    setSelectedMatchForDetails(m);
                    setIsMatchDetailsOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          /* Default 3-Column Layout */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* COLUMN 1 (LEFT - 3 Cols): Matches List & Quick Prediction */}
            <div className="xl:col-span-3 space-y-6 order-2 xl:order-1">
              <UpcomingMatches
                matches={matches}
                selectedMatchId={selectedMatchId}
                onSelectMatch={(id) => setSelectedMatchId(id)}
                onOpenPredictionModal={(m) => {
                  setSelectedMatchForPrediction(m);
                  setIsPredictionModalOpen(true);
                }}
              />
            </div>

            {/* COLUMN 2 (CENTER - 6 Cols): Hero Section & 3 Distinct Game Cards */}
            <div className="xl:col-span-6 space-y-6 order-1 xl:order-2">
              {selectedMatch && (
                <HeroSection
                  match={selectedMatch}
                  onOpenPredictionModal={(m) => {
                    setSelectedMatchForPrediction(m);
                    setIsPredictionModalOpen(true);
                  }}
                  onOpenMatchDetails={(m) => {
                    setSelectedMatchForDetails(m);
                    setIsMatchDetailsOpen(true);
                  }}
                />
              )}

              {/* 3 Distinct Gamified Game Cards */}
              <GameCards
                quizzes={quizzes}
                videos={videos}
                onStartQuiz={(quiz) => {
                  setActiveQuiz(quiz);
                  setIsQuizModalOpen(true);
                }}
                onStartVideo={(video) => {
                  setActiveVideo(video);
                  setIsVideoModalOpen(true);
                }}
                onOpenQuickPredict={() => {
                  if (selectedMatch) {
                    setSelectedMatchForPrediction(selectedMatch);
                    setIsPredictionModalOpen(true);
                  }
                }}
              />

              {/* Live Match Commentary Chat */}
              <MatchChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            </div>

            {/* COLUMN 3 (RIGHT - 3 Cols): User Profile & Top Leaderboard */}
            <div className="xl:col-span-3 space-y-6 order-3">
              <UserProfileCard
                user={user}
                onClaimDailyBonus={handleClaimDailyBonus}
                onOpenRewards={() => setIsRewardsModalOpen(true)}
              />

              <LeaderboardPanel
                items={leaderboard}
                currentUserRank={user?.rank || 7}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals & Interactive Drawers */}
      <PredictionModal
        isOpen={isPredictionModalOpen}
        match={selectedMatchForPrediction}
        onClose={() => setIsPredictionModalOpen(false)}
        onSubmitPrediction={handlePredictionSubmit}
      />

      <QuizModal
        isOpen={isQuizModalOpen}
        quiz={activeQuiz}
        onClose={() => setIsQuizModalOpen(false)}
        onAnswerSubmit={handleQuizAnswerSubmit}
      />

      <VideoChallengeModal
        isOpen={isVideoModalOpen}
        video={activeVideo}
        onClose={() => setIsVideoModalOpen(false)}
        onRewardClaim={(rewardCoins) => {
          setUser((prev: any) => (prev ? { ...prev, coins: prev.coins + rewardCoins } : null));
          showToast(`+${rewardCoins} سکه ماراتن تماشا اضافه شد!`, rewardCoins);
        }}
      />

      <RewardsStoreModal
        isOpen={isRewardsModalOpen}
        rewards={rewards}
        user={user}
        onClose={() => setIsRewardsModalOpen(false)}
        onRedeemReward={handleRedeemReward}
      />

      <MatchDetailsModal
        isOpen={isMatchDetailsOpen}
        match={selectedMatchForDetails}
        onClose={() => setIsMatchDetailsOpen(false)}
      />

      <DailyWheelModal
        isOpen={isWheelModalOpen}
        onClose={() => setIsWheelModalOpen(false)}
        onSpinWin={handleSpinWinCoins}
      />
    </div>
  );
}
