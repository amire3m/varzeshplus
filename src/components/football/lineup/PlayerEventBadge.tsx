import type { LineupEvent } from "@/lib/football";

const STYLE: Record<string, { label: string; icon: string; color: string }> = {
  goal: { label: "گل", icon: "sports_soccer", color: "#22c55e" },
  assist: { label: "پاس گل", icon: "tactic", color: "#3b82f6" },
  yellow_card: { label: "کارت زرد", icon: "square", color: "#eab308" },
  red_card: { label: "کارت قرمز", icon: "square", color: "#ef4444" },
  sub_in: { label: "ورود", icon: "south_west", color: "#22c55e" },
  sub_out: { label: "خروج", icon: "north_east", color: "#f97316" },
  penalty_goal: { label: "گل پنالتی", icon: "sports_soccer", color: "#a3e635" },
  penalty_miss: { label: "پنالتی از دست رفته", icon: "close", color: "#ef4444" },
  own_goal: { label: "گل به خودی", icon: "sports_soccer", color: "#f43f5e" },
};

function EventIcon({ type }: { type: LineupEvent["type"] }) {
  const common = { viewBox: "0 0 24 24", width: 14, height: 14, fill: "currentColor" } as const;
  if (type === "assist") return <svg {...common}><path d="M4 14l6-4v2h7v3H10v2z" /></svg>;
  if (type === "sub_in") return <svg {...common}><path d="M11 6l-4 6h2.5v5h3v-5H15z" /></svg>;
  if (type === "sub_out") return <svg {...common}><path d="M13 6l4 6h-2.5v5h-3v-5H9z" /></svg>;
  if (type === "penalty_miss") return <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>;
  if (type === "own_goal") return <svg {...common}><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="1.6" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="6" /></svg>;
}

/** آیکون‌های رویداد بازیکن — SVG استاندارد پروژه، نه ایموجی */
export function PlayerEventBadge({ event, size = 16 }: { event: LineupEvent; size?: number }) {
  const s = STYLE[event.type];
  if (!s) return null;
  if (event.type === "yellow_card" || event.type === "red_card") {
    return (
      <span className="inline-flex items-center justify-center rounded-[3px] shrink-0" style={{ width: size - 4, height: size - 4, background: s.color, boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} title={`${s.label} ${event.minute}'`} />
    );
  }
  return (
    <span className="inline-flex items-center justify-center shrink-0" style={{ width: size, height: size, borderRadius: 6, background: `${s.color}22`, color: s.color }} title={`${s.label} ${event.minute}'`}>
      <EventIcon type={event.type} />
    </span>
  );
}
