import type { LineupPlayer } from "@/lib/football";
import { PlayerCutout } from "./PlayerCutout";
import { PlayerEventBadge } from "./PlayerEventBadge";

export function BenchPlayers({ players }: { players: LineupPlayer[] }) {
  if (!players.length) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold tracking-wider" style={{ color: "var(--color-muted)" }}>بازیکنان ذخیره</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {players.map((p) => (
          <div key={p.playerId} className="glass-panel p-2 flex flex-col items-center gap-1 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <PlayerCutout src={p.image} name={p.name} size={40} />
            <span className="tabular font-black text-[11px]">{p.shirtNumber}</span>
            <span className="text-[10px] font-bold truncate w-full">{p.name}</span>
            {p.events.length > 0 && (
              <div className="flex gap-0.5 flex-wrap justify-center">
                {p.events.map((e, i) => <PlayerEventBadge key={i} event={e} size={13} />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}