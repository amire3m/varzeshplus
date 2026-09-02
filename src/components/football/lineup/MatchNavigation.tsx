"use client";

export type MatchTab = "overview" | "lineup" | "stats" | "events" | "standings";

const TABS: { key: MatchTab; label: string }[] = [
  { key: "overview", label: "خلاصه" },
  { key: "lineup", label: "ترکیب" },
  { key: "stats", label: "آمار" },
  { key: "events", label: "رویدادها" },
  { key: "standings", label: "جدول" },
];

export function MatchNavigation({ active, onChange }: { active: MatchTab; onChange: (t: MatchTab) => void }) {
  return (
    <nav className="sticky top-16 z-30 -mx-1 px-1 py-2 backdrop-blur-xl" style={{ background: "rgba(21,21,21,0.85)", borderBottom: "1px solid rgba(120,7,201,0.2)" }}>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button key={t.key} onClick={() => onChange(t.key)} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? "text-white" : "text-white/55 hover:text-white/85 hover:bg-white/5"}`}
              style={isActive ? { background: "linear-gradient(135deg, #17b6cc, #7807c9)", boxShadow: "0 0 12px rgba(120,7,201,0.3)" } : undefined}>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}