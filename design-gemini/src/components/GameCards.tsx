"use client";

import React, { useState } from "react";
import {
  Trophy,
  HelpCircle,
  Play,
  CheckCircle,
  Coins,
  Zap,
  Clock,
  Sparkles,
  ChevronLeft,
  Flame,
  Tv,
  Target,
  FileQuestion,
  Video,
} from "lucide-react";

interface Quiz {
  id: number;
  title: string;
  question: string;
  options: string[];
  correctOption: number;
  difficulty: string;
  coinReward: number;
  xpReward: number;
  category: string;
}

interface VideoChallenge {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  viewsCount: string;
  coinReward: number;
  questionAtSecond: number;
  question: string;
  options: string[];
  correctOption: number;
}

interface GameCardsProps {
  quizzes: Quiz[];
  videos: VideoChallenge[];
  onStartQuiz: (quiz: Quiz) => void;
  onStartVideo: (video: VideoChallenge) => void;
  onOpenQuickPredict: () => void;
}

export const GameCards: React.FC<GameCardsProps> = ({
  quizzes,
  videos,
  onStartQuiz,
  onStartVideo,
  onOpenQuickPredict,
}) => {
  const [selectedQuizIndex, setSelectedQuizIndex] = useState(0);
  const activeQuiz = quizzes[selectedQuizIndex] || quizzes[0];
  const activeVideo = videos[0];

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-[#2ECC71] rounded-full"></div>
          <h2 className="text-lg font-black text-white">بازی‌ها و چالش‌های شب مسابقه</h2>
        </div>
        <span className="text-xs text-slate-400">۳ نوع چالش با جایزه لحظه‌ای</span>
      </div>

      {/* Grid of 3 Distinct Games */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GAME 1: Exact Score Predictor (Goalpost & Scoreboard Visuals) */}
        <div className="bg-[#141C29] border border-slate-800 hover:border-[#2ECC71]/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-[#2ECC71]/10 flex flex-col justify-between group relative overflow-hidden">
          {/* Distinct Visual Badge: Goal Post / Scoreboard */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-[#2ECC71]/5 rounded-br-full pointer-events-none"></div>

          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-[#2ECC71]" />
              </div>
              <span className="bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-[#2ECC71] font-bold text-[10px] px-2 py-0.5 rounded-full">
                پیش‌بینی نتیجه
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-white mb-1">حدس دقیق گل‌ها</h3>
            <p className="text-slate-400 text-xs line-clamp-2 mb-3">
              نتیجه دقیق مسابقات امشب را حدس بزنید و ۵۰۰ سکه + ۱,۰۰۰ XP دریافت کنید.
            </p>

            <div className="flex items-center gap-2 bg-[#0B121C] p-2 rounded-xl border border-slate-800 text-xs mb-4">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">پاداش: </span>
              <span className="font-scoreboard font-bold text-amber-300">۵۰۰ سکه</span>
            </div>
          </div>

          <button
            onClick={onOpenQuickPredict}
            className="w-full bg-[#2ECC71] hover:bg-[#27ae60] text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-[#2ECC71]/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>شروع پیش‌بینی</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* GAME 2: Sports Trivia Quiz (Question Card & Clipboard Visuals) */}
        <div className="bg-[#141C29] border border-slate-800 hover:border-[#5B7FFF]/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-[#5B7FFF]/10 flex flex-col justify-between group relative overflow-hidden">
          {/* Distinct Visual Badge: Speech Bubble / Quiz Card */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-[#5B7FFF]/5 rounded-br-full pointer-events-none"></div>

          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md group-hover:scale-110 transition-transform">
                <FileQuestion className="w-6 h-6 text-[#5B7FFF]" />
              </div>
              <span className="bg-[#5B7FFF]/10 border border-[#5B7FFF]/30 text-[#5B7FFF] font-bold text-[10px] px-2 py-0.5 rounded-full">
                کوییز ورزشی
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-white mb-1">فوت‌فن تاکتیکی</h3>
            <p className="text-slate-400 text-xs line-clamp-2 mb-3">
              {activeQuiz ? activeQuiz.title : "کوییز ۱۵ ثانیه‌ای درباره تاریخچه شهرآورد"}
            </p>

            <div className="flex items-center gap-2 bg-[#0B121C] p-2 rounded-xl border border-slate-800 text-xs mb-4">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300">جایزه: </span>
              <span className="font-scoreboard font-bold text-indigo-300">
                +{activeQuiz ? activeQuiz.coinReward : 250} سکه
              </span>
            </div>
          </div>

          <button
            onClick={() => activeQuiz && onStartQuiz(activeQuiz)}
            className="w-full bg-[#141C29] hover:bg-slate-800 text-[#5B7FFF] border border-[#5B7FFF]/40 hover:border-[#5B7FFF] font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>شرکت در کوییز</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* GAME 3: Watch Marathon & Video Challenge (Filmstrip / Video Visuals) */}
        <div className="bg-[#141C29] border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between group relative overflow-hidden">
          {/* Distinct Visual Badge: Filmstrip / Video Frame */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/5 rounded-br-full pointer-events-none"></div>

          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-[10px] px-2 py-0.5 rounded-full">
                ماراتن تماشا
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-white mb-1">چالش صحنه‌های حساس</h3>
            <p className="text-slate-400 text-xs line-clamp-2 mb-3">
              {activeVideo ? activeVideo.title : "تماشای گل‌های هفته و پاسخ به سوال ثانیه ۵"}
            </p>

            <div className="flex items-center gap-2 bg-[#0B121C] p-2 rounded-xl border border-slate-800 text-xs mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-slate-300">پاداش تماشا: </span>
              <span className="font-scoreboard font-bold text-purple-300">
                +{activeVideo ? activeVideo.coinReward : 300} سکه
              </span>
            </div>
          </div>

          <button
            onClick={() => activeVideo && onStartVideo(activeVideo)}
            className="w-full bg-[#141C29] hover:bg-slate-800 text-purple-300 border border-purple-500/40 hover:border-purple-400 font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>تماشا و پاسخ</span>
            <Play className="w-3.5 h-3.5 fill-purple-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
