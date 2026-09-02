import { PL_LOGO } from "@/lib/premier-league";

export function LeagueHeader({ todayCount }: { todayCount: number }) {
  return (
    <section className="panel p-4 md:p-5 flex flex-wrap items-center gap-4">
      <span className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center border border-white/10 p-2 shrink-0">
        <img src={PL_LOGO} alt="Premier League" className="w-full h-full object-contain" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="headline text-xl md:text-2xl">لیگ برتر انگلیس</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold tabular" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff" }}>2026/27</span>
        </div>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>Premier League</p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10" style={{ background: "var(--color-panel-dark)" }}>
          <span className="material-symbols-outlined text-[18px]" style={{ color: "var(--color-club-green)" }}>calendar_month</span>
          <span className="tabular">{todayCount} بازی امروز</span>
        </span>
      </div>
    </section>
  );
}
