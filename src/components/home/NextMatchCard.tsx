import type { Match, Team } from "@/lib/football/types";
import Link from "next/link";

/** کارت «بازی بعدی» Glass Panel داخل Hero — مطابق Reference */
export function NextMatchCard({ match, home, away, competition }: { match: Match; home: Team; away: Team; competition: string }) {
  const time = match.kickoff.split(" ").pop() ?? "";
  const date = match.kickoff.split(" ")[0] ?? "";
  return (
    <div
      className="w-full max-w-[350px] rounded-[16px] overflow-hidden border backdrop-blur-xl"
      style={{
        background: "rgba(13,25,41,0.78)",
        borderColor: "rgba(120,160,200,0.18)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}
      dir="rtl"
    >
      {/* سربرگ: بازی بعدی */}
      <div className="px-5 pt-4 pb-3 text-center border-b" style={{ borderColor: "rgba(120,160,200,0.12)" }}>
        <span className="text-[13px] font-black text-white">بازی بعدی</span>
      </div>

      {/* بدنه: رقابت + تاریخ */}
      <div className="px-5 pt-4 pb-2 text-center">
        <p className="text-[12px] font-bold" style={{ color: "#19C9E8" }}>{competition}</p>
        <p className="text-[11px] mt-1" style={{ color: "#8FA1B5" }}>{date}</p>
      </div>

      {/* تیم‌ها + زمان */}
      <div className="px-5 pb-5 pt-2 flex items-center justify-between">
        {/* میزبان — راست */}
        <div className="flex flex-col items-center gap-2 w-[92px]">
          <img src={home.logo} alt={home.name} className="w-12 h-12 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.35"; }} />
          <span className="text-[12px] font-bold text-center leading-tight text-white line-clamp-2">{home.name}</span>
        </div>

        {/* زمان — Cyan Bold Large */}
        <div className="shrink-0 text-center">
          <span className="tabular text-[26px] font-black block leading-none" style={{ color: "#19C9E8" }}>{time}</span>
          <span className="text-[10px] font-bold mt-1.5 block" style={{ color: "#8FA1B5" }}>{date}</span>
        </div>

        {/* مهمان — چپ */}
        <div className="flex flex-col items-center gap-2 w-[92px]">
          <img src={away.logo} alt={away.name} className="w-12 h-12 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.35"; }} />
          <span className="text-[12px] font-bold text-center leading-tight text-white line-clamp-2">{away.name}</span>
        </div>
      </div>

      {/* CTA ثانویه — outlined */}
      <div className="px-5 pb-4">
        <Link
          href={`/football/matches/${match.id}`}
          className="block w-full text-center py-2.5 rounded-xl text-[13px] font-bold text-white border transition-colors hover:bg-white/5"
          style={{ borderColor: "rgba(120,160,200,0.25)" }}
        >
          مشاهده پیش بازی
        </Link>
      </div>
    </div>
  );
}
