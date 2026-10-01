"use client";

type CompactMatch = {
  league: string;
  leagueSlug: string;
  status: "live" | "upcoming" | "finished";
  minute: string;
  home: string;
  away: string;
  hs: string;
  as: string;
  homeLogo: string;
  awayLogo: string;
  time?: string;
};

function faRelativeShort(v?: string): string {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((startOf(d) - startOf(new Date())) / 86400000);
    const time = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(d);
    if (diff <= 0) return `امروز ${time}`;
    if (diff === 1) return `فردا ${time}`;
    if (diff === 2) return `پس‌فردا ${time}`;
    return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(d);
  } catch {
    return v ?? "";
  }
}

export default function CompactMatchRow({
  match,
  href,
}: {
  match: CompactMatch;
  href?: string;
}) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const Wrapper: any = href ? "a" : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-colors group"
      style={{ minHeight: 48 }}
      dir="rtl"
    >
      {/* status */}
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLive ? "bg-[#FF4757] animate-pulse" : isFinished ? "bg-white/20" : "bg-[#4AE183]/60"}`}
        aria-hidden
      />
      {/* minute / time */}
      <span className="text-[11px] tabular-nums w-[68px] shrink-0 text-right leading-none">
        {isLive ? (
          <span className="font-bold" style={{ color: "#FF6B8A" }}>
            {match.minute}&apos;
          </span>
        ) : isFinished ? (
          <span className="text-white/40 font-bold">پایان</span>
        ) : (
          <span className="text-white/60 font-medium">{faRelativeShort(match.time)}</span>
        )}
      </span>

      {/* teams */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <img src={match.homeLogo} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
        <bdi className="text-[13px] font-medium truncate text-white/90 group-hover:text-white">{match.home}</bdi>
        <span className="text-white/15 text-[10px] shrink-0">—</span>
        <bdi className="text-[13px] font-medium truncate text-white/90 group-hover:text-white">{match.away}</bdi>
        <img src={match.awayLogo} alt="" className="w-5 h-5 object-contain shrink-0" loading="lazy" />
      </div>

      {/* score */}
      <span className="tabular-nums text-[14px] font-black shrink-0 min-w-[52px] text-center">
        {isLive || isFinished ? (
          <span className="text-white">
            {match.hs || "0"} <span className="text-white/30 font-normal">-</span> {match.as || "0"}
          </span>
        ) : (
          <span className="text-white/30 text-[11px] font-bold">VS</span>
        )}
      </span>
    </Wrapper>
  );
}
