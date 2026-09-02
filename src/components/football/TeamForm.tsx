import type { Team, TeamForm as TeamFormT } from "@/lib/football";
import { formFor } from "@/lib/football";

export function TeamForm({ form }: { form: Team }) {
  const items: TeamFormT[] = formFor(form);
  const color = (r: TeamFormT["result"]) => r === "W" ? "#22c55e" : r === "D" ? "#8b99ac" : "#E8385D";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-black tracking-wider" style={{ color: "var(--color-muted)" }}>فرم</span>
      <div className="flex gap-1">
        {items.map((it, i) => (
          <span key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: color(it.result), boxShadow: `0 0 6px ${color(it.result)}66` }}>{it.result}</span>
        ))}
      </div>
    </div>
  );
}