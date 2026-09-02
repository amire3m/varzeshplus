"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Question = {
  id: number; questionType: string; text: string; options: string[];
  timeLimitSeconds: number; points: number;
};
type Result = {
  rawScore: number; maxRaw: number; weightedScore: number;
  isNewPersonalBest: boolean;
  results: Array<{ questionId: number; correct: boolean | null; correctOption: number | null }>;
};

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [game, setGame] = useState<{ title: string; description: string | null; gameType: string; prize: string | null; programTitle: string | null } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [timer, setTimer] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const timerInitRef = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/games/${id}`).then((r) => r.json()).catch(() => null);
    if (res?.success) {
      setGame(res.game); setQuestions(res.questions);
      if (!timerInitRef.current) {
        setTimer(res.questions[0]?.timeLimitSeconds ?? 20);
        timerInitRef.current = true;
      }
    } else setError(res?.error ?? "خطا در بارگذاری بازی");
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // تایمر هر سؤال — با prefers-reduced-motion هم منطقی است (داده، نه انیمیشن)
  useEffect(() => {
    if (result || !questions.length) return;
    if (timer <= 0) { next(); return; }
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, result, questions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function select(option: number) {
    setAnswers((a) => ({ ...a, [questions[current].id]: option }));
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setTimer(questions[current + 1].timeLimitSeconds);
    } else {
      submit();
    }
  }

  async function submit() {
    setBusy(true); setError("");
    const res = await fetch(`/api/games/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId: Number(questionId), selectedOption })) }),
    }).then((r) => r.json());
    setBusy(false);
    if (res.status === 401) { setNeedLogin(true); return; }
    if (!res.success) { setError(res.error ?? "خطا"); return; }
    setResult(res);
  }

  if (needLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="panel p-8 text-center max-w-sm">
          <p className="mb-4">برای شرکت در بازی باید وارد شوید.</p>
          <Link href="/login" className="btn-green inline-block px-5 py-2.5 text-sm">ورود با شماره موبایل</Link>
        </div>
      </div>
    );
  }

  if (!game && !error) return <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--color-muted)" }}>در حال بارگذاری...</div>;
  if (error && !game) return <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--color-live-signal)" }}>{error}</div>;

  const q = questions[current];

  return (
    <div className="min-h-screen pt-4">
      <main className="max-w-2xl mx-auto px-4 pb-24 space-y-5">
        {/* کارت عنوان بازی */}
        <div className="panel p-4 flex items-center gap-3">
          <button onClick={() => router.push("/games")} className="btn-ghost px-3 py-1.5 text-sm shrink-0">بازگشت</button>
          <div className="min-w-0 flex-1">
            <div className="headline truncate">{game!.title}</div>
            {game!.programTitle && <div className="text-xs" style={{ color: "var(--color-muted)" }}>{game!.programTitle}</div>}
          </div>
          {game!.prize && <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ background: "rgba(232,184,75,0.12)", color: "var(--color-gold-medal)" }}>🏆 {game!.prize}</span>}
        </div>
        {result ? (
          <div className="panel p-8 text-center space-y-4">
            <h2 className="headline text-xl" style={{ color: "var(--color-club-green)" }}>بازی تمام شد!</h2>
            <div className="text-4xl headline tabular">{result.weightedScore}</div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              امتیاز استاندارد شما در لیدربورد یکپارچه ثبت شد
              {result.isNewPersonalBest ? " — بهترین رکورد جدید! 🎉" : ""}
            </p>
            <div className="space-y-1.5 text-sm text-right">
              {questions.map((qq, i) => {
                const r = result.results.find((x) => x.questionId === qq.id);
                return (
                  <div key={qq.id} className="panel px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="truncate">{i + 1}. {qq.text}</span>
                    {r?.correct === null || r?.correct === undefined ? (
                      <span style={{ color: "var(--color-muted)" }}>نظرسنجی</span>
                    ) : r.correct ? (
                      <span style={{ color: "var(--color-club-green)" }}>✓ درست</span>
                    ) : (
                      <span style={{ color: "var(--color-live-signal)" }}>✗ نادرست</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Link href="/" className="btn-green px-5 py-2.5 text-sm">بازی‌های دیگر</Link>
              <Link href="/profile" className="btn-ghost px-5 py-2.5 text-sm">پروفایل من</Link>
            </div>
          </div>
        ) : q ? (
          <div className="space-y-5">
            {/* نوار پیشرفت + تایمر */}
            <div className="flex items-center gap-3 text-sm" style={{ color: "var(--color-muted)" }}>
              <span>سؤال <span className="tabular">{current + 1}</span> از <span className="tabular">{questions.length}</span></span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: `${((current + 1) / questions.length) * 100}%`, background: "var(--color-club-green)" }} />
              </div>
              <span className="tabular font-bold" style={{ color: timer <= 5 ? "var(--color-live-signal)" : "var(--color-floodlight)" }}>{timer}s</span>
            </div>

            <div className="panel p-6">
              <h2 className="headline text-lg mb-5">{q.text}</h2>
              <div className="space-y-2.5">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => select(i)}
                    className="w-full text-right px-4 py-3 rounded-xl border transition-colors text-sm"
                    style={{
                      borderColor: answers[q.id] === i ? "var(--color-club-green)" : "rgba(255,255,255,0.12)",
                      background: answers[q.id] === i ? "rgba(46,204,113,0.1)" : "transparent",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-center" style={{ color: "var(--color-live-signal)" }}>{error}</p>}

            <button
              onClick={next}
              disabled={busy || answers[q.id] === undefined}
              className="btn-green w-full py-3 text-sm disabled:opacity-40"
            >
              {busy ? "در حال ثبت..." : current < questions.length - 1 ? "سؤال بعدی" : "پایان و ثبت امتیاز"}
            </button>
          </div>
        ) : (
          <p style={{ color: "var(--color-muted)" }}>این بازی سؤالی ندارد.</p>
        )}
      </main>
    </div>
  );
}
