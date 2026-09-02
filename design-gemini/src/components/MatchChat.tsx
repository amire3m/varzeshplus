"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, ShieldCheck, Heart } from "lucide-react";

interface ChatMessage {
  id: number;
  username: string;
  phoneMasked: string;
  message: string;
  teamBadge?: string | null;
  isVip?: boolean | null;
  timestamp: string;
}

interface MatchChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, teamBadge: string) => void;
}

export const MatchChat: React.FC<MatchChatProps> = ({ messages, onSendMessage }) => {
  const [text, setText] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("⚽");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim(), selectedBadge);
    setText("");
  };

  return (
    <div className="bg-[#141C29] border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#2ECC71]" />
          <h2 className="font-extrabold text-sm text-white">گپ‌وگفت هم‌زمان شب مسابقه</h2>
        </div>
        <span className="text-[10px] text-[#2ECC71] bg-[#2ECC71]/10 px-2 py-0.5 rounded-full font-bold">
          🔴 زنده
        </span>
      </div>

      {/* Messages Stream */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className="p-2 rounded-xl bg-[#0B121C]/80 border border-slate-800/60 text-xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span>{msg.teamBadge || "⚽"}</span>
                <span className="font-extrabold text-white text-[11px]">{msg.username}</span>
                {msg.isVip && (
                  <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1 py-0.2 rounded font-bold border border-amber-500/30">
                    VIP
                  </span>
                )}
              </div>
              <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">{msg.message}</p>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400">نشان هواداری:</span>
          {["💙", "❤️", "⚽", "🟡"].map((badge) => (
            <button
              type="button"
              key={badge}
              onClick={() => setSelectedBadge(badge)}
              className={`p-1 rounded-lg text-xs cursor-pointer ${
                selectedBadge === badge ? "bg-slate-700 ring-1 ring-[#2ECC71]" : "opacity-60 hover:opacity-100"
              }`}
            >
              {badge}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="نظر خود را درباره بازی بنویسید..."
            className="flex-1 bg-[#0B121C] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2ECC71]"
          />
          <button
            type="submit"
            className="bg-[#2ECC71] hover:bg-[#27ae60] text-slate-950 p-2 rounded-xl transition-all cursor-pointer font-bold"
            title="ارسال پیام"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </form>
    </div>
  );
};
