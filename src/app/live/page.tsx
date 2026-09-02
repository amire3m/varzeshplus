"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

type Live = {
  id: number; title: string; status: string; commentatorActive: number | boolean;
  censorActive: number | boolean; delayBufferSeconds: number; hlsUrl: string | null;
};
type Match = {
  id: number; title: string; league: string; homeTeam: string; awayTeam: string;
  homeScore: number | null; awayScore: number | null; stadium: string | null;
} | null;

export default function LivePage() {
  const [live, setLive] = useState<Live | null>(null);
  const [match, setMatch] = useState<Match>(null);
  const [notif, setNotif] = useState<{ title: string; body: string | null } | null>(null);
  const [tick, setTick] = useState(0);
  const [showAd, setShowAd] = useState(true);
  const [adCountdown, setAdCountdown] = useState(5);

  const load = useCallback(async () => {
    const res = await fetch("/api/live").then((r) => r.json()).catch(() => null);
    if (res?.success) {
      setLive(res.live ?? null);
      setMatch(res.match ?? null);
      setNotif(res.lastNotification ?? null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  // تبلیغ ۵ ثانیه‌ای قبل از نمایش پخش
  useEffect(() => {
    if (!showAd) return;
    const iv = setInterval(() => setAdCountdown((c) => { if (c <= 1) { clearInterval(iv); setShowAd(false); return 0; } return c - 1; }), 1000);
    return () => clearInterval(iv);
  }, [showAd]);
  // به‌روزرسانی زنده وضعیت پخش هر ۱۰ ثانیه
  useEffect(() => {
    const t = setInterval(() => { load(); setTick((v) => v + 1); }, 10_000);
    return () => clearInterval(t);
  }, [load]);

  const onAir = live?.status === "on_air";
  const censored = !!live?.censorActive;

  return (
    <PageShell badge="پخش زنده" activeDock="matches">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-5">
        {/* تبلیغ قبل از پخش */}
        {showAd && (
          <div className="rounded-[14px] border relative overflow-hidden flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ aspectRatio: "16/9", background: "#2a2a2a", borderColor: "rgba(0,92,252,0.35)", boxShadow: "0 0 24px rgba(0,92,252,0.2)" }}>
            <span className="text-xs px-3 py-1 rounded-full bg-black/50 border border-white/10 text-white">تبلیغ • {adCountdown}s</span>
            <h3 className="headline text-lg text-white">حامی پخش زنده — همراه اول</h3>
            <p className="text-sm" style={{ color: "#8FA1B5" }}>پخش پس از پایان تبلیغ آغاز می‌شود</p>
            <button onClick={() => setShowAd(false)} className="px-6 py-2 rounded-full text-sm font-black text-white mt-2" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>رد کردن تبلیغ</button>
            <div className="w-full max-w-[320px] h-1.5 bg-white/10 rounded-full overflow-hidden mt-2"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${((5-adCountdown)/5)*100}%`, background: "linear-gradient(90deg, #005cfc, #bee503)" }} /></div>
          </div>
        )}
        {/* پلیر — جایگذار آماده HLS */}
        {!showAd && <div className="rounded-[14px] border relative overflow-hidden" style={{ aspectRatio: "16/9", background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
          {censored ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "#2a2a2a" }}>
              <div className="headline text-3xl text-white">ورزش<span style={{ color: "#005cfc" }}>پلاس</span></div>
              <p className="text-sm" style={{ color: "#8FA1B5" }}>چند لحظه صبر کنید... بازگشت به پخش</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: "repeating-linear-gradient(115deg, #2a2a2a 0 14px, #222222 14px 28px)" }}>
              {onAir ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#E8385D" }}>
                    <span className="live-dot" /> پخش زنده در جریان است
                  </div>
                  <p className="text-xs" style={{ color: "#8FA1B5" }}>پلیر HLS پس از اتصال خط پخش (CDN داخلی) فعال می‌شود</p>
                </>
              ) : (
                <p className="text-sm" style={{ color: "#8FA1B5" }}>فعلاً پخش زنده‌ای در جریان نیست</p>
              )}
            </div>
          )}
          {match && onAir && (
            <div className="absolute bottom-3 inset-x-3 rounded-xl border px-4 py-2.5 flex items-center justify-between text-sm" style={{ background: "#2e2e2e", borderColor: "rgba(255,255,255,0.1)" }}>
              <span className="font-medium text-white">{match.homeTeam}</span>
              <span className="tabular headline text-lg text-white">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span>
              <span className="font-medium text-white">{match.awayTeam}</span>
            </div>
          )}
        </div>}

        {/* نوار اسکوربورد */}
        {live && (
          <div className="rounded-[14px] border p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
            <span className="font-medium text-white">{live.title}</span>
            <span className="flex items-center gap-1.5" style={{ color: live.commentatorActive ? "#005cfc" : "#8FA1B5" }}>
              گزارشگر {live.commentatorActive ? "فعال" : "غیرفعال"}
            </span>
            <span style={{ color: "#8FA1B5" }}>تأخیر کنترل‌شده پخش: <span className="tabular">{live.delayBufferSeconds}s</span></span>
            <span className="mr-auto text-xs tabular" style={{ color: "#8FA1B5" }}>به‌روزرسانی خودکار {tick > 0 && `(${tick})`}</span>
          </div>
        )}

        {/* آخرین اعلان */}
        {notif && (
          <div className="rounded-[14px] border p-4 flex items-start gap-3" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}>
            <span className="text-xs font-bold px-2 py-1 rounded shrink-0" style={{ background: "rgba(123,47,247,0.15)", color: "#a78bfa" }}>اعلان</span>
            <div>
              <div className="text-sm font-medium text-white">{notif.title}</div>
              {notif.body && <p className="text-sm" style={{ color: "#8FA1B5" }}>{notif.body}</p>}
            </div>
          </div>
        )}

        {/* بازی مرتبط با رویداد زنده */}
        <div>
          <h2 className="headline text-base mb-3 text-white">بازی‌های مرتبط</h2>
          <div className="rounded-[14px] border p-4 text-sm" style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)", color: "#8FA1B5" }}>
            پیش‌بینی و کوییزهای مرتبط با این رویداد در <Link href="/#games" className="hover:underline" style={{ color: "#005cfc" }}>بازی‌های فعال</Link> در دسترس است.
          </div>
        </div>
      </main>
    </PageShell>
  );
}
