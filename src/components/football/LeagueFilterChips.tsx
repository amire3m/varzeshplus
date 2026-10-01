"use client";

type ChipLeague = { slug: string; name: string; logo: string };

export default function LeagueFilterChips({
  leagues,
  selected,
  onSelect,
}: {
  leagues: ChipLeague[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black border transition-colors ${
          !selected
            ? "bg-[#4AE183] text-[#0A0F0B] border-[#4AE183]"
            : "bg-white/[0.06] border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        همه
      </button>
      {leagues.map((l) => (
        <button
          key={l.slug}
          onClick={() => onSelect(l.slug)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
            selected === l.slug
              ? "bg-[#4AE183] text-[#0A0F0B] border-[#4AE183]"
              : "bg-white/[0.06] border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <img src={l.logo} alt="" className="w-4 h-4 object-contain shrink-0" loading="lazy" />
          <span className="whitespace-nowrap">{l.name}</span>
        </button>
      ))}
    </div>
  );
}
