"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Team, Transfer } from "@/lib/football";
import { transfersOfLeague } from "@/lib/football";
import { TeamBadge } from "./TeamBadge";

const TYPE_LABEL: Record<Transfer["type"], string> = { loan: "قرضی", permanent: "دائم", free: "آزاد" };

type TmItem = {
  playerId: number; playerName: string; date: string; fee: string; marketValue: number | null;
  from: { name: string; ourTeam: { slug: string; name: string; logo: string; color: string } | null };
  to: { name: string; ourTeam: { slug: string; name: string; logo: string; color: string } | null };
};

/** آواتار حروف‌اول برای تیم‌های خارج از پروژه (دیتای TM خام) */
function TmClubBadge({ name, color = "#8FA1B5" }: { name: string; color?: string }) {
  return (
    <span className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-black shrink-0 border border-white/10" style={{ background: `${color}25`, color }}>
      {name.slice(0, 2)}
    </span>
  );
}

function RealTransferCard({ item }: { item: TmItem }) {
  const fromTeam = item.from.ourTeam;
  const toTeam = item.to.ourTeam;
  return (
    <div className="rounded-[14px] p-4 flex flex-wrap items-center gap-3 border-r-[3px]" style={{ borderRightColor: "#005cfc", background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: "rgba(0,92,252,0.15)", color: "#005cfc" }}>{item.playerName.slice(0, 2)}</span>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{item.playerName}</p>
          <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{item.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mx-auto sm:mx-0 flex-1 justify-center min-w-0">
        <span className="flex items-center gap-1.5 min-w-0">
          {fromTeam ? <><TeamBadge team={fromTeam as unknown as Team} size={26} /><span className="text-xs font-bold truncate">{fromTeam.name}</span></> : <><TmClubBadge name={item.from.name} /><span className="text-xs text-slate-400 truncate">{item.from.name}</span></>}
        </span>
        <span className="material-symbols-outlined text-[16px] px-1" style={{ color: "var(--color-club-green)" }}>arrow_forward</span>
        <span className="flex items-center gap-1.5 min-w-0">
          {toTeam ? <><TeamBadge team={toTeam as unknown as Team} size={26} /><span className="text-xs font-bold truncate">{toTeam.name}</span></> : <><TmClubBadge name={item.to.name} /><span className="text-xs text-slate-400 truncate">{item.to.name}</span></>}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs ml-auto">
        <span className="px-2 py-1 rounded-full tabular font-black" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{item.fee}</span>
        <span className="px-2 py-1 rounded-full font-black" style={{ background: "var(--color-club-green)", color: "#08120B" }}>رسمی</span>
      </div>
    </div>
  );
}

/**
 * لیست نقل‌وانتقالات — واقعی از Transfermarkt با fallback به mock
 */
export function TransferCard({ transfer, getTeam }: { transfer: Transfer; getTeam: (id: number) => Team }) {
  const from = getTeam(transfer.fromTeamId);
  const to = getTeam(transfer.toTeamId);
  return (
    <div className={`rounded-[14px] p-4 flex flex-wrap items-center gap-3 border-r-[3px] ${transfer.official ? "" : "border-dashed"}`} style={{ borderRightColor: transfer.official ? "var(--color-club-green)" : "#f9c759" }}>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: `${to.color}22`, color: to.color }}>{transfer.player.slice(0, 2)}</span>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{transfer.player}</p>
          <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{transfer.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mx-auto sm:mx-0 flex-1 justify-center min-w-0">
        <span className="flex items-center gap-1.5 min-w-0"><TeamBadge team={from} size={26} /><span className="text-xs font-bold truncate">{from.shortName}</span></span>
        <span className="material-symbols-outlined text-[16px] px-1" style={{ color: "var(--color-club-green)" }}>arrow_forward</span>
        <span className="flex items-center gap-1.5 min-w-0"><TeamBadge team={to} size={26} /><span className="text-xs font-bold truncate">{to.shortName}</span></span>
      </div>
      <div className="flex items-center gap-2 text-xs ml-auto">
        <span className="px-2 py-1 rounded-full font-bold tabular" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{TYPE_LABEL[transfer.type]}</span>
        {transfer.fee && <span className="px-2 py-1 rounded-full tabular font-bold" style={{ background: "var(--color-panel-raised)", color: "var(--color-floodlight)" }}>{transfer.fee}</span>}
        <span className={`px-2 py-1 rounded-full font-black ${transfer.official ? "" : "border border-dashed"}`} style={transfer.official ? { background: "var(--color-club-green)", color: "#08120B" } : { color: "#f9c759", borderColor: "#f9c759" }}>{transfer.official ? "رسمی" : "شایعه"}</span>
      </div>
    </div>
  );
}

/** ردیف واقعی — در صفحه لیگ رندر می‌شود؛ mock فقط اگر API پوشش نداد */
export function RealTransfersSection({ leagueSlug, leagueId, getTeam }: { leagueSlug: string; leagueId: number; getTeam: (id: number) => Team }) {
  const [items, setItems] = useState<TmItem[] | null>(null);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    fetch(`/api/football/transfers?league=${leagueSlug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res.covered) { setCovered(true); setItems(res.items ?? []); }
      })
      .catch(() => {});
  }, [leagueSlug]);

  if (!covered) {
    // fallback به mock — رندر توسط caller (همان رفتار قبلی)
    return <MockTransfers leagueId={leagueId} getTeam={getTeam} />;
  }

  if (!items) return (
    <div className="space-y-2.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-[14px] border border-white/5 p-4 flex items-center gap-3 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="w-10 h-10 rounded-xl bg-white/10" />
          <div className="flex-1 space-y-2"><div className="h-3 rounded bg-white/10 w-1/3" /><div className="h-2.5 rounded bg-white/5 w-2/3" /></div>
          <div className="w-12 h-6 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
  if (!items.length) return <div className="glass-panel p-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>نقل‌وانتقالی در پنجره اخیر ثبت نشده است.</div>;

  return (
    <div className="space-y-2.5">
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>
        دیتای واقعی Transfermarkt
      </span>
      {items.map((it, i) => <RealTransferCard key={`${it.playerId}-${i}`} item={it} />)}
    </div>
  );
}

function MockTransfers({ leagueId, getTeam }: { leagueId: number; getTeam: (id: number) => Team }) {
  const mock = transfersOfLeague(leagueId).slice(0, 5);
  return <div className="space-y-2.5">{mock.map((t) => <TransferCard key={t.id} transfer={t} getTeam={getTeam} />)}</div>;
}
