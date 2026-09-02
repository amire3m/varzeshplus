import type { LineupPlayer } from "@/lib/football";
import { PlayerCutout } from "./PlayerCutout";
import { PlayerRatingBadge } from "./PlayerRatingBadge";
import { PlayerEventBadge } from "./PlayerEventBadge";

const EVENTS: Record<string, number> = { goal: 1, own_goal: 1, penalty_goal: 1, penalty_miss: 1, red_card: 1, yellow_card: 1, assist: 2, sub_in: 2, sub_out: 2 };

/** گره بازیکن روی زمین: [Rating][PNG][شماره][نام] + کاپیتان + رویدادها */
export function PlayerLineupNode({ player, compact = false }: { player: LineupPlayer; compact?: boolean }) {
  const captain = player.captain;
  const notable = player.events.filter((e) => EVENTS[e.type] === 1);
  const indicators = player.events.filter((e) => EVENTS[e.type] === 2);
  return (
    <div className="relative flex flex-col items-center" style={{ width: 58 }}>
      {/* rating + captain */}
      <div className="flex items-center gap-1 mb-0.5">
        <PlayerRatingBadge rating={player.rating} />
        {captain && (
          <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-label="کاپیتان"><path d="M12 2l2.4 4.8 5.4.8-3.9 3.8.9 5.4L12 14.6 7.2 16.8l.9-5.4L4.2 7.6l5.4-.8z" /></svg>
          </span>
        )}
      </div>
      <PlayerCutout src={player.image} name={player.name} size={52} />
      {/* events indicators around player */}
      {notable.length > 0 && (
        <div className="absolute top-1 left-1 flex flex-col gap-0.5">
          {notable.map((e, i) => <PlayerEventBadge key={i} event={e} size={14} />)}
        </div>
      )}
      {/* number + name */}
      <div className="mt-1 text-center leading-tight">
        <span className="tabular font-black" style={{ fontSize: 11, color: "#fff" }}>{player.shirtNumber}</span>
        <span className="block truncate max-w-[56px]" style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{player.name}</span>
      </div>
      {indicators.length > 0 && (
        <div className="flex gap-0.5 mt-0.5">
          {indicators.map((e, i) => <PlayerEventBadge key={i} event={e} size={13} />)}
        </div>
      )}
    </div>
  );
}
