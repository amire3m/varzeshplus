"use client";

import Link from "next/link";

export type MatchTab = "overview" | "lineup" | "stats" | "events" | "standings";

const TABS: { key: MatchTab; labelFa: string; labelEn: string }[] = [
  { key: "overview", labelFa: "خلاصه", labelEn: "Overview" },
  { key: "lineup", labelFa: "ترکیب", labelEn: "Lineup" },
  { key: "stats", labelFa: "آمار", labelEn: "Stats" },
  { key: "events", labelFa: "رویدادها", labelEn: "Events" },
  { key: "standings", labelFa: "جدول", labelEn: "Table" },
];

export default function MatchTabBar({
  matchId,
  active,
}: {
  matchId: string | number;
  active: MatchTab;
}) {
  return (
    <nav
      className="sticky top-16 z-30 -mx-3 px-3 backdrop-blur-xl border-b border-white/10"
      style={{ background: "rgba(10,15,11,0.92)" }}
      aria-label="تب‌های مسابقه"
    >
      <div className="flex gap-5 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => {
          const isActive = active === t.key;
          const href = `/football/matches/${matchId}${t.key === "overview" ? "" : `/${t.key}`}`;
          return (
            <Link
              key={t.key}
              href={href}
              className={`relative shrink-0 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? "text-white border-[#4AE183]"
                  : "text-white/55 hover:text-white/85 border-transparent hover:border-white/15"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {t.labelFa}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
