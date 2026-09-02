"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(body: object) {
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return res.json();
  }

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    const data = await post({ action: "request-otp", phone });
    setBusy(false);
    if (!data.success) return setError(data.error ?? "خطا");
    setDevCode(data.devCode ?? null);
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    const data = await post({ action: "verify-otp", phone, code });
    setBusy(false);
    if (!data.success) return setError(data.error ?? "خطا");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-7">
        <Link href="/" className="headline text-xl block text-center mb-1">ورزش<span style={{ color: "var(--color-club-green)" }}>پلاس</span></Link>
        <p className="text-center text-sm mb-6" style={{ color: "var(--color-muted)" }}>
          {step === "phone" ? "ورود با شماره موبایل" : "کد تأیید را وارد کنید"}
        </p>

        {step === "phone" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <label className="block text-sm">
              شماره موبایل
              <input
                dir="ltr" inputMode="tel" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)}
                required className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-transparent border border-white/15 text-left tabular focus:border-white/40 outline-none"
                style={{ color: "var(--color-floodlight)" }}
              />
            </label>
            {error && <p className="text-sm" style={{ color: "var(--color-live-signal)" }}>{error}</p>}
            <button type="submit" disabled={busy} className="btn-green w-full py-2.5 text-sm disabled:opacity-60">
              {busy ? "در حال ارسال..." : "دریافت کد تأیید"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            {devCode && (
              <p className="text-sm text-center p-2.5 rounded-lg" style={{ background: "rgba(91,127,255,0.1)", color: "var(--color-glow-electric)" }}>
                (محیط توسعه) کد شما: <span className="tabular font-bold">{devCode}</span>
              </p>
            )}
            <label className="block text-sm">
              کد ۵ رقمی
              <input
                dir="ltr" inputMode="numeric" maxLength={5} placeholder="-----" value={code} onChange={(e) => setCode(e.target.value)}
                required className="w-full mt-1.5 px-3.5 py-2.5 rounded-lg bg-transparent border border-white/15 text-center tabular text-xl tracking-[0.5em] focus:border-white/40 outline-none"
                style={{ color: "var(--color-floodlight)" }}
              />
            </label>
            {error && <p className="text-sm" style={{ color: "var(--color-live-signal)" }}>{error}</p>}
            <button type="submit" disabled={busy} className="btn-green w-full py-2.5 text-sm disabled:opacity-60">
              {busy ? "بررسی..." : "ورود به ورزش پلاس"}
            </button>
            <button type="button" onClick={() => setStep("phone")} className="btn-ghost w-full py-2 text-sm">تغییر شماره</button>
          </form>
        )}
      </div>
    </div>
  );
}
