"use client";

/** اسکلت‌لودر درخشان — جایگزین متن «در حال بارگذاری...» */

function Bar({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded bg-white/10 animate-pulse ${className}`} style={style} />;
}

/** ردیف خبر: تصویر + ۲ خط متن */
export function SkeletonNewsRow() {
  return (
    <div className="flex items-start gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
      <Bar className="w-[84px] h-[58px] shrink-0 !rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2 pt-1">
        <Bar className="h-3 w-11/12" />
        <Bar className="h-3 w-2/3" />
        <Bar className="h-2.5 w-1/4" />
      </div>
    </div>
  );
}

/** ردیف مسابقه: دو تیم + نتیجه وسط */
export function SkeletonMatchRow() {
  return (
    <div className="rounded-[14px] border border-white/10 p-4 flex items-center gap-3" style={{ background: "#2a2a2a" }}>
      <Bar className="w-8 h-8 !rounded-full shrink-0" />
      <Bar className="h-3 flex-1" />
      <Bar className="h-6 w-14 shrink-0" />
      <Bar className="h-3 flex-1" />
      <Bar className="w-8 h-8 !rounded-full shrink-0" />
    </div>
  );
}

/** ردیف جدول رده‌بندی */
export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
      <Bar className="h-3 w-4 shrink-0" />
      <Bar className="w-5 h-5 !rounded-full shrink-0" />
      <Bar className="h-3 flex-1" />
      <Bar className="h-3 w-8 shrink-0" />
      <Bar className="h-3 w-8 shrink-0" />
    </div>
  );
}

/** بلوک متنی عمومی */
export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-[14px] border border-white/10 p-4 space-y-2.5" style={{ background: "#2a2a2a" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Bar key={i} className="h-3" style={{ width: `${92 - i * 14}%` }} />
      ))}
    </div>
  );
}
