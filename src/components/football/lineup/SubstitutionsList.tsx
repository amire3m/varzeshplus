export function SubstitutionsList({ subs }: { subs: { minute: number; outName: string; inName: string }[] }) {
  if (!subs.length) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold tracking-wider" style={{ color: "var(--color-muted)" }}>تعویض‌ها</h4>
      <div className="space-y-1.5">
        {subs.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-on-surface)" }}>
            <span className="tabular font-black text-[11px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{s.minute}&apos;</span>
            <span className="font-bold" style={{ color: "#f97316" }}>{s.outName}</span>
            <span className="tabular" style={{ color: "var(--color-muted)" }}>←</span>
            <span className="font-bold" style={{ color: "#22c55e" }}>{s.inName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}