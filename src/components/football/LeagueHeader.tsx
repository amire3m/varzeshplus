import type { League } from "@/lib/football";

export function LeagueHeader({ league }: { league: League }) {
  return (
    <section className="panel p-4 md:p-5 flex flex-wrap items-center gap-4">
      <span className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center border border-white/10 p-2 shrink-0">
        <img src={league.logo} alt={league.englishName} className="w-full h-full object-contain" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="headline text-xl md:text-2xl">{league.name}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold tabular" style={{ background: "linear-gradient(135deg,#17b6cc,#7807c9)", color: "#fff" }}>{league.season}</span>
        </div>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>{league.englishName}</p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10" style={{ background: "#0d1424" }}>
          <span className="material-symbols-outlined text-[18px]" style={{ color: "var(--color-club-green)" }}>calendar_month</span>
          <span className="tabular">{league.season}</span>
        </span>
      </div>
    </section>
  );
}