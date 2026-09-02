"use client";

import React, { useState } from "react";
import { X, Gift, Coins, CheckCircle, ShoppingBag, AlertCircle, Sparkles } from "lucide-react";

interface Reward {
  id: number;
  title: string;
  category: string;
  coinCost: number;
  image: string;
  description: string;
  stock: number;
  badge?: string | null;
}

interface UserProfile {
  coins: number;
}

interface RewardsStoreModalProps {
  isOpen: boolean;
  rewards: Reward[];
  user: UserProfile | null;
  onClose: () => void;
  onRedeemReward: (rewardId: number) => Promise<{ success: boolean; message: string }>;
}

export const RewardsStoreModal: React.FC<RewardsStoreModalProps> = ({
  isOpen,
  rewards,
  user,
  onClose,
  onRedeemReward,
}) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (reward: Reward) => {
    setSelectedReward(reward);
    setIsRedeeming(true);
    setStatusMsg(null);

    try {
      const res = await onRedeemReward(reward.id);
      if (res.success) {
        setStatusMsg({ type: "success", text: res.message });
      } else {
        setStatusMsg({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "خطا در دریافت جایزه" });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141C29] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white">فروشگاه جوایز ورزش پلاس</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-300 font-scoreboard text-xs font-bold">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>موجودی: {(user?.coins || 0).toLocaleString("fa-IR")} سکه</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
              statusMsg.type === "success"
                ? "bg-[#2ECC71]/10 border-[#2ECC71]/40 text-[#2ECC71]"
                : "bg-[#E23B3B]/10 border-[#E23B3B]/40 text-[#E23B3B]"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((reward) => {
            const canAfford = (user?.coins || 0) >= reward.coinCost;

            return (
              <div
                key={reward.id}
                className="bg-[#0B121C] border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-3 relative group"
              >
                {reward.badge && (
                  <span className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {reward.badge}
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <span className="text-4xl bg-slate-900 p-2 rounded-2xl border border-slate-800 flex-shrink-0">
                    {reward.image}
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{reward.category}</span>
                    <h4 className="font-extrabold text-xs text-white leading-tight mb-1">
                      {reward.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{reward.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-scoreboard text-amber-300 font-extrabold text-sm">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{reward.coinCost.toLocaleString("fa-IR")}</span>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || reward.stock <= 0 || isRedeeming}
                    className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                      canAfford && reward.stock > 0
                        ? "bg-[#2ECC71] hover:bg-[#27ae60] text-slate-950 shadow-md shadow-[#2ECC71]/20"
                        : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    }`}
                  >
                    {reward.stock <= 0 ? "اتمام موجودی" : "دریافت جایزه"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
