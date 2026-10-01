"use client";

import Link from "next/link";
import CompactMatchRow from "@/components/football/CompactMatchRow";

type WidgetVariant = "live_score" | "league" | "team" | "news";

export default function GlanceWidget({
  variant = "live_score",
  title,
  compact = false,
}: {
  variant?: WidgetVariant;
  title?: string;
  compact?: boolean;
}) {
  const mockMatch = {
    league: "لیگ برتر انگلیس",
    leagueSlug: "premier-league",
    status: "live" as const,
    minute: "67'",
    home: "آرسنال",
    away: "لیورپول",
    hs: "2",
    as: "1",
    homeLogo: "https://raw.githubusercontent.com/luuuvanhoc/pfb/main/premier-league/arsenal.png",
    awayLogo: "https://raw.githubusercontent.com/luuuvanhoc/pfb/main/premier-league/liverpool.png",
    time: new Date().toISOString(),
  };

  const titles: Record<WidgetVariant, string> = {
    live_score: "نتیجه زنده",
    league: "جدول لیگ",
    team: "تیم محبوب",
    news: "اخبار",
  };

  return (
    <div className={`rounded-2xl border border-white/10 overflow-hidden ${compact ? "p-3" : "p-4"}`} style={{ background: "#101610" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black px-2 py-1 rounded-full" style={{ background: "rgba(74,225,131,0.12)", color: "#4AE183" }}>{title ?? titles[variant]}</span>
        <span className="text-[10px] text-slate-500">PWA Widget • {variant}</span>
      </div>

      {variant === "live_score" && <CompactMatchRow match={mockMatch as any} href="/live" />}

      {variant === "league" && (
        <div className="space-y-1.5">
          {[
            { rank: 1, name: "آرسنال", pts: "68" },
            { rank: 2, name: "منچستر سیتی", pts: "65" },
            { rank: 3, name: "لیورپول", pts: "62" },
          ].map((r) => (
            <div key={r.rank} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="tabular text-xs font-black w-5 text-center">{r.rank}</span>
              <span className="text-xs font-bold flex-1">{r.name}</span>
              <span className="tabular text-xs font-black" style={{ color: "#4AE183" }}>{r.pts}</span>
            </div>
          ))}
          <Link href="/football/leagues/premier-league/standings" className="block text-center text-xs font-bold mt-2" style={{ color: "#FFD34D" }}>مشاهده جدول</Link>
        </div>
      )}

      {variant === "team" && (
        <div className="text-center py-4">
          <img src="https://raw.githubusercontent.com/luuuvanhoc/pfb/main/premier-league/arsenal.png" alt="" className="w-12 h-12 mx-auto object-contain" />
          <p className="text-sm font-bold text-white mt-2">آرسنال</p>
          <p className="text-xs text-slate-400">بعدی: vs چلسی — فردا 19:30</p>
        </div>
      )}

      {variant === "news" && (
        <div className="space-y-2">
          {["دربی جذاب در راه است", "مصدومیت ستاره لیگ برتر"].map((t, i) => (
            <a key={i} href="/news" className="block text-xs font-bold leading-5 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] text-white line-clamp-2">{t}</a>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-500 text-center mt-3">FotMob glance_widget_info — قابل نصب به عنوان PWA</p>
    </div>
  );
}
