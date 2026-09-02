"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Clock, Users, Star, Filter } from "lucide-react";

type Game = {
  id: number;
  title: string;
  description: string | null;
  gameType: string;
  prize: string | null;
  startsAt: string | null;
  endsAt: string | null;
  programTitle: string | null;
  programSlug: string | null;
  participants: number;
  endsIn: number | null;
};

const TYPE_LABEL: Record<string, string> = {
  program: "برنامه‌ای",
  general: "عمومی",
  event: "رویدادی",
};
const TYPE_COLOR: Record<string, string> = {
  program: "#005cfc",
  general: "#bee503",
  event: "#E8385D",
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const homeRes = await fetch("/api/home").then((r) => r.json()).catch(() => null);
        if (homeRes?.success && Array.isArray(homeRes.games)) {
          setGames(homeRes.games);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter === "all" ? games : games.filter((g) => g.gameType === filter);
  const counts = {
    all: games.length,
    program: games.filter((g) => g.gameType === "program").length,
    general: games.filter((g) => g.gameType === "general").length,
    event: games.filter((g) => g.gameType === "event").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#252525" }}>
        <span className="text-sm" style={{ color: "#8FA1B5" }}>در حال بارگذاری بازی‌ها...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[1320px] mx-auto px-4 pt-6">
        {/* هدر */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,92,252,0.15)", color: "#005cfc" }}>
            <Trophy size={20} />
          </div>
          <div>
            <h1 className="headline text-[22px] text-white">مینی گیم‌ها</h1>
            <p className="text-[12px] text-slate-400">بازی کن، پیش‌بینی کن، امتیاز بگیر</p>
          </div>
          <span className="mr-auto text-xs px-3 py-1.5 rounded-full border border-white/10" style={{ background: "rgba(190,229,3,0.12)", color: "#bee503" }}>
            {games.length} بازی فعال
          </span>
        </div>

        {/* فیلتر تب‌ها */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter size={14} className="text-slate-500 shrink-0" />
          {[
            { key: "all", label: "همه" },
            { key: "program", label: "برنامه‌ای" },
            { key: "general", label: "عمومی" },
            { key: "event", label: "رویدادی" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold border transition-all ${filter === t.key ? "text-white" : "text-slate-400 hover:text-white border-white/10"}`}
              style={
                filter === t.key
                  ? { background: t.key === "all" ? "linear-gradient(135deg, #005cfc, #bee503)" : TYPE_COLOR[t.key] + "22", borderColor: t.key === "all" ? "transparent" : TYPE_COLOR[t.key] + "55", color: t.key === "all" ? "#fff" : TYPE_COLOR[t.key] }
                  : { background: "rgba(255,255,255,0.05)" }
              }
            >
              {t.label} <span className="mr-1 text-[11px] opacity-70">({counts[t.key as keyof typeof counts]})</span>
            </button>
          ))}
        </div>

        {/* گرید بازی‌ها */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-8 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <p className="text-sm text-slate-400">بازی فعالی در این دسته وجود ندارد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((g) => {
              const hoursLeft = g.endsIn ? Math.floor(g.endsIn / 3600000) : null;
              return (
                <Link
                  key={g.id}
                  href={`/games/${g.id}`}
                  className="group relative rounded-2xl border border-white/10 overflow-hidden p-5 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:border-white/20"
                  style={{ background: "#2a2a2a" }}
                >
                  <span className="absolute top-0 left-0 w-full h-[2px]" style={{ background: TYPE_COLOR[g.gameType] || "#005cfc", opacity: 0.8 }} />
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full border" style={{ background: (TYPE_COLOR[g.gameType] || "#005cfc") + "18", borderColor: (TYPE_COLOR[g.gameType] || "#005cfc") + "30", color: TYPE_COLOR[g.gameType] || "#005cfc" }}>
                      {TYPE_LABEL[g.gameType] || g.gameType}
                    </span>
                    {g.prize && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "rgba(190,229,3,0.12)", color: "#bee503" }}>
                        <Star size={11} /> {g.prize}
                      </span>
                    )}
                  </div>
                  <h3 className="headline text-[15px] leading-6 text-white line-clamp-2">{g.title}</h3>
                  {g.description && <p className="text-[12px] leading-6 text-slate-400 line-clamp-2">{g.description}</p>}
                  {g.programTitle && <span className="text-[11px] text-slate-500">برنامه: {g.programTitle}</span>}
                  <div className="mt-auto flex items-center gap-3 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Users size={12} /> {g.participants} شرکت‌کننده</span>
                    {hoursLeft !== null && <span className="flex items-center gap-1"><Clock size={12} /> {hoursLeft} ساعت باقی‌مانده</span>}
                    <span className="mr-auto text-xs font-bold" style={{ color: "#005cfc" }}>شروع بازی ←</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
