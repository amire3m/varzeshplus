"use client";

import React, { useState } from "react";
import { X, Sparkles, Coins, Gift, CheckCircle } from "lucide-react";

interface DailyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpinWin: (coins: number) => void;
}

export const DailyWheelModal: React.FC<DailyWheelModalProps> = ({
  isOpen,
  onClose,
  onSpinWin,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [wonCoins, setWonCoins] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const prizes = [100, 250, 500, 1000, 150, 300, 750, 200];

  const handleSpin = () => {
    if (spinning || wonCoins !== null) return;
    setSpinning(true);

    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const winAmount = prizes[prizeIndex];
    const newRot = rotation + 1440 + prizeIndex * 45;

    setRotation(newRot);

    setTimeout(() => {
      setSpinning(false);
      setWonCoins(winAmount);
      onSpinWin(winAmount);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141C29] border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-5 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>گردونه شانس روزانه</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wheel graphic */}
        <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
          <div
            className="w-full h-full rounded-full border-4 border-amber-500/40 bg-gradient-to-tr from-amber-600 via-emerald-600 to-indigo-600 shadow-2xl transition-transform duration-[3500ms] cubic-bezier(0.15, 0.9, 0.2, 1) flex items-center justify-center overflow-hidden"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="text-white font-black text-xs space-y-1">
              <div>🎁 ۱,۰۰۰ سکه</div>
              <div>⚡ ۵۰۰ سکه</div>
              <div>⭐ ۲۵۰ سکه</div>
            </div>
          </div>
          <div className="absolute top-0 w-4 h-6 bg-amber-400 clip-path-polygon text-slate-950 font-bold flex items-center justify-center shadow-lg z-10">
            ▼
          </div>
        </div>

        {wonCoins !== null ? (
          <div className="space-y-2 bg-[#2ECC71]/10 p-3 rounded-2xl border border-[#2ECC71]/40">
            <CheckCircle className="w-8 h-8 text-[#2ECC71] mx-auto" />
            <h4 className="font-extrabold text-white text-sm">
              تبریک! شما +{wonCoins} سکه برنده شدید 🎉
            </h4>
            <button
              onClick={onClose}
              className="bg-[#2ECC71] text-slate-950 font-black text-xs px-6 py-2 rounded-xl cursor-pointer"
            >
              دریافت سکه‌ها
            </button>
          </div>
        ) : (
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3 rounded-2xl shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98 transition-all"
          >
            {spinning ? "در حال چرخش..." : "چرخش گردونه شانس (رایگان)"}
          </button>
        )}
      </div>
    </div>
  );
};
