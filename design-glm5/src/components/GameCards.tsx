"use client";

import { Target, MessageCircleQuestion, Film, Users, Clock, ArrowLeft } from "lucide-react";

interface Game {
  id: number;
  title: string;
  description: string | null;
  type: "prediction" | "quiz" | "video_marathon";
  prize: string | null;
  participantCount: number;
  isActive: boolean;
  endsAt: string | null;
}

const gameTypeConfig = {
  prediction: {
    icon: Target,
    label: "پیش‌بینی",
    color: "text-club-green",
    bgColor: "bg-club-green/10",
    borderColor: "border-club-green/20",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(46,204,113,0.2)]",
  },
  quiz: {
    icon: MessageCircleQuestion,
    label: "کوییز",
    color: "text-glow-electric",
    bgColor: "bg-glow-electric/10",
    borderColor: "border-glow-electric/20",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(91,127,255,0.2)]",
  },
  video_marathon: {
    icon: Film,
    label: "ماراتن",
    color: "text-gold-medal",
    bgColor: "bg-gold-medal/10",
    borderColor: "border-gold-medal/20",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(232,184,75,0.2)]",
  },
};

function formatPersianNumber(num: number): string {
  return num.toLocaleString("fa-IR");
}

function getTimeRemaining(endStr: string | null): string {
  if (!endStr) return "";
  try {
    const end = new Date(endStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "پایان یافته";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days} روز و ${hours} ساعت`;
    if (hours > 0) return `${hours} ساعت و ${mins} دقیقه`;
    return `${mins} دقیقه`;
  } catch {
    return "";
  }
}

export default function GameCards({ games }: { games: Game[] }) {
  return (
    <section id="games" className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-floodlight tracking-tight">بازی‌های فعال</h2>
        <a href="#all-games" className="text-xs text-club-green hover:underline flex items-center gap-1">
          مشاهده همه
          <ArrowLeft className="w-3 h-3" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => {
          const config = gameTypeConfig[game.type];
          const Icon = config.icon;

          return (
            <div
              key={game.id}
              className={`group card-panel p-5 transition-all duration-300 game-card-glow cursor-pointer ${config.hoverGlow}`}
            >
              {/* Type badge + icon - DISTINCT per game type */}
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 ${config.bgColor} ${config.borderColor} border rounded-full px-3 py-1`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
                </div>
                {game.isActive && (
                  <span className="w-2 h-2 rounded-full bg-club-green animate-live-pulse" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-black text-floodlight mb-2 group-hover:text-club-green transition-colors tracking-tight">
                {game.title}
              </h3>

              {/* Description */}
              {game.description && (
                <p className="text-xs text-floodlight/50 leading-relaxed mb-4 line-clamp-2">
                  {game.description}
                </p>
              )}

              {/* Prize */}
              {game.prize && (
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[10px] text-floodlight/30">جایزه:</span>
                  <span className="text-sm font-bold text-gold-medal">{game.prize}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-[11px] text-floodlight/40 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {formatPersianNumber(game.participantCount)} نفر
                </span>
                {game.endsAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(game.endsAt)}
                  </span>
                )}
              </div>

              {/* CTA button - Green = action */}
              <button className="w-full bg-club-green/10 hover:bg-club-green text-club-green hover:text-ink-pitch font-bold text-sm py-2.5 rounded-lg transition-all duration-300 border border-club-green/20 hover:border-club-green">
                شرکت در بازی
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
