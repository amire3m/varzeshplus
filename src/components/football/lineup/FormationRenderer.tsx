import type { LineupPlayer, MatchLineup } from "@/lib/football";
import { PlayerLineupNode } from "./PlayerLineupNode";

/** توزیع بازیکن‌ها روی زمین بر اساس formation — home: x مستقیم، away: آینه‌ای */
export function FormationRenderer({ lineup, home }: { lineup: MatchLineup; home: boolean }) {
  const players = lineup.starters.map((p) => ({
    ...p,
    x: home ? p.x : 100 - p.x,
  }));
  return (
    <div className="absolute inset-0">
      {players.map((p) => (
        <div
          key={p.playerId}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <PlayerLineupNode player={p} />
        </div>
      ))}
    </div>
  );
}

export function LineupPlayerNodeStandalone({ player, home }: { player: LineupPlayer; home: boolean }) {
  return <PlayerLineupNode player={{ ...player, x: home ? player.x : 100 - player.x }} />;
}
