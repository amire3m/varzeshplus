"use client";

export type PLTab = "home" | "matches" | "standings" | "news" | "transfers" | "stats" | "teams";

const TABS: { key: PLTab; label: string }[] = [
  { key: "home", label: "خانه" },
  { key: "matches", label: "بازی‌ها" },
  { key: "standings", label: "جدول" },
  { key: "news", label: "اخبار" },
  { key: "transfers", label: "نقل‌وانتقالات" },
  { key: "stats", label: "آمار" },
  { key: "teams", label: "تیم‌ها" },
];

export function LeagueNavigation({ active, onChange }: { active: PLTab; onChange: (t: PLTab) => void }) {
  return (
    <nav className="sticky top-16 z-30 -mx-1 px-1 py-2 backdrop-blur-xl" style={{ background: "rgba(37,37,37,0.88)", borderBottom: "1px solid rgba(120,7,201,0.2)" }}>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? "text-white" : "text-white/55 hover:text-white/85 hover:bg-white/5"}`}
              style={isActive ? { background: "linear-gradient(135deg,#005cfc,#bee503)", boxShadow: "0 0 12px rgba(190,229,3,0.3)" } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
