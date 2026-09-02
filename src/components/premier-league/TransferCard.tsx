"use client";

import type { PLTransfer } from "@/lib/premier-league";
import { teamById } from "@/lib/premier-league";
import { TeamBadge } from "./TeamBadge";

const TYPE_LABEL: Record<PLTransfer["type"], string> = { loan: "قرضی", permanent: "دائم", free: "آزاد" };

export function TransferCard({ transfer }: { transfer: PLTransfer }) {
  const from = teamById(transfer.fromId);
  const to = teamById(transfer.toId);
  return (
    <div className={`glass-panel p-4 flex flex-wrap items-center gap-3 border-r-[3px] ${transfer.official ? "" : "border-dashed"}`} style={{ borderRightColor: transfer.official ? "var(--color-club-green)" : "#f9c759" }}>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: `${to.color}22`, color: to.color }}>{transfer.player.slice(0, 2)}</span>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{transfer.player}</p>
          <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{transfer.date}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mx-auto sm:mx-0 flex-1 justify-center min-w-0">
        <span className="flex items-center gap-1.5 min-w-0"><TeamBadge src={from.badge} name={from.short} size={26} /><span className="text-xs font-bold truncate">{from.short}</span></span>
        <span className="material-symbols-outlined text-[16px] px-1" style={{ color: "var(--color-club-green)" }}>arrow_forward</span>
        <span className="flex items-center gap-1.5 min-w-0"><TeamBadge src={to.badge} name={to.short} size={26} /><span className="text-xs font-bold truncate">{to.short}</span></span>
      </div>

      <div className="flex items-center gap-2 text-xs ml-auto">
        <span className={`px-2 py-1 rounded-full font-bold tabular ${transfer.official ? "" : ""}`} style={{ background: transfer.official ? "rgba(0,92,252,0.12)" : "rgba(249,199,89,0.12)", color: transfer.official ? "#005cfc" : "#f9c759" }}>{TYPE_LABEL[transfer.type]}</span>
        {transfer.fee && <span className="px-2 py-1 rounded-full tabular font-bold" style={{ background: "var(--color-panel-raised)", color: "var(--color-floodlight)" }}>{transfer.fee}</span>}
        <span className={`px-2 py-1 rounded-full font-black ${transfer.official ? "" : "border border-dashed"}`} style={transfer.official ? { background: "var(--color-club-green)", color: "#08120B" } : { color: "#f9c759", borderColor: "#f9c759" }}>{transfer.official ? "رسمی" : "شایعه"}</span>
      </div>
    </div>
  );
}
