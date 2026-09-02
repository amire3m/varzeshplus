"use client";

export type TeamTab = "home" | "matches" | "results" | "squad" | "stats" | "transfers" | "news";

const TABS: { key: TeamTab; label: string }[] = [
  { key: "home", label: "خانه" }, { key: "matches", label: "بازی‌ها" }, { key: "results", label: "نتایج" },
  { key: "squad", label: "ترکیب" }, { key: "stats", label: "آمار" }, { key: "transfers", label: "نقل‌وانتقالات" }, { key: "news", label: "اخبار" },
];

export function TeamNavigation({ active, onChange }: { active: TeamTab; onChange: (t: TeamTab) => void }) {
  return (
    <nav className="sticky top-16 z-30 -mx-1 px-1 py-2 backdrop-blur-xl" style={{ background: "rgba(21,21,21,0.85)", borderBottom: "1px solid rgba(120,160,200,0.14)" }}>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button key={t.key} onClick={() => onChange(t.key)} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? "text-white" : "text-white/55 hover:text-white/85 hover:bg-white/5"}`}
              style={isActive ? { background: "linear-gradient(135deg,#19C9E8,#7B2FF7)", boxShadow: "0 0 12px rgba(123,47,247,0.35)" } : undefined}>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}