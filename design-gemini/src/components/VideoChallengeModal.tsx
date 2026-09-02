"use client";

import React, { useState } from "react";
import { X, Play, Video, Coins, CheckCircle, HelpCircle, Sparkles } from "lucide-react";

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

interface VideoChallengeModalProps {
  isOpen: boolean;
  video: VideoChallenge | null;
  onClose: () => void;
  onRewardClaim: (reward: number) => void;
}

export const VideoChallengeModal: React.FC<VideoChallengeModalProps> = ({
  isOpen,
  video,
  onClose,
  onRewardClaim,
}) => {
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [claimed, setClaimed] = useState(false);

  if (!isOpen || !video) return null;

  const handleOptionSelect = (idx: number) => {
    setSelectedOption(idx);
    if (idx === video.correctOption) {
      setClaimed(true);
      onRewardClaim(video.coinReward);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141C29] border border-slate-700 rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-sm text-white truncate max-w-[260px]">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 group">
          <video
            src={video.videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
            onTimeUpdate={(e) => {
              const current = Math.floor(e.currentTarget.currentTime);
              if (current >= video.questionAtSecond && !showQuestion && !claimed) {
                setShowQuestion(true);
              }
            }}
          ></video>

          {!showQuestion && !claimed && (
            <div className="absolute top-3 right-3 bg-purple-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>پاسخ به چالش در ثانیه {video.questionAtSecond}</span>
            </div>
          )}
        </div>

        {/* Trigger Question or Claim Overlay */}
        {!showQuestion && !claimed && (
          <div className="bg-[#0B121C] p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">ویدیو را پخش کنید تا سوال چالش ظاهر شود</span>
            <button
              onClick={() => setShowQuestion(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl cursor-pointer"
            >
              نمایش مستقیم چالش
            </button>
          </div>
        )}

        {/* Interactive Video Question Card */}
        {showQuestion && !claimed && (
          <div className="bg-[#0B121C] p-4 rounded-2xl border border-purple-500/40 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-purple-300 font-extrabold text-xs">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>چالش تماشای ویدیو</span>
            </div>
            <p className="font-bold text-xs text-white leading-relaxed">{video.question}</p>

            <div className="space-y-2">
              {video.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-purple-600/20 hover:border-purple-400 border border-slate-700 text-xs font-bold text-slate-200 text-right transition-all cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reward Claimed Box */}
        {claimed && (
          <div className="p-4 rounded-2xl bg-[#2ECC71]/10 border border-[#2ECC71]/40 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-[#2ECC71] mx-auto animate-bounce" />
            <h4 className="font-black text-sm text-white">چالش ویدیو با موفقیت تکمیل شد! 🎉</h4>
            <p className="text-xs text-slate-200">
              +{video.coinReward} سکه به کیف پول شما افزوده شد.
            </p>
            <button
              onClick={onClose}
              className="bg-[#2ECC71] text-slate-950 font-black text-xs px-6 py-2 rounded-xl cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
