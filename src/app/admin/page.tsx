"use client";

import { useEffect, useState, useCallback } from "react";
import { ROLE_LABELS, STATUS_LABELS, can, nextStatuses, type AdminRole } from "@/lib/rbac";
import "./admin.css";

/* ================= انواع ================= */

type Admin = { id: number; username: string; fullName: string; role: AdminRole; programId: number | null };
type GameRow = {
  id: number; title: string; description: string | null; gameType: string; status: string;
  programId: number | null; programTitle: string | null; prize: string | null;
  startsAt: string | null; endsAt: string | null; participants: number;
};
type QueueRow = { id: number; title: string; gameType: string; startsAt: string | null; endsAt: string | null; createdBy: string | null; programTitle: string | null };
type CalRow = { id: number; title: string; gameType: string; status: string; startsAt: string | null; endsAt: string | null; programTitle: string | null };
type NewsRow = { n: { id: number; title: string; summary: string | null; status: string; isBreaking: number | null; publishedAt: string | null }; authorName: string | null };
type UserRow = { id: number; displayName: string | null; phone: string; points: number; coins: number; level: number; isBanned: number };
type Weight = { id: number; gameType: string; weight: number; maxPossibleRaw: number };
type Live = { id: number; title: string; status: string; commentatorActive: number; censorActive: number; delayBufferSeconds: number } | null;
type CensorLog = { id: number; action: string; reason: string | null; timestamp: string };
type AuditRow = { id: number; actorName: string | null; action: string; entityType: string | null; entityId: number | null; programId: number | null; timestamp: string; detail: unknown };
type TeamRow = { id: number; username: string; fullName: string; role: string; programId: number | null; programTitle: string | null; isActive: number };

const STATUS_COLORS: Record<string, string> = {
  draft: "var(--color-muted)",
  pending: "var(--color-gold-medal)",
  published: "var(--color-club-green)",
  rejected: "var(--color-live-signal)",
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  try { return new Intl.DateTimeFormat("fa-IR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }
  catch { return "—"; }
}

async function apiGet(resource: string, params = "") {
  const res = await fetch(`/api/admin?resource=${resource}${params}`);
  return res.json();
}
async function apiPost(body: object) {
  const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return res.json();
}

/* ================= صفحه ================= */

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState("dashboard");
  const [toast, setToast] = useState("");

  useEffect(() => {
    apiGet("me").then((d) => { setAdmin(d.admin ?? null); setReady(true); });
  }, []);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  if (!ready) return <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--color-muted)" }}>...</div>;
  if (!admin) return <AdminLogin onLogin={setAdmin} />;

  const role = admin.role;
  const NAV: Array<[string, string, boolean]> = [
    ["dashboard", "داشبورد", true],
    ["games", "مدیریت بازی‌ها", can(role, "games.program.manage") || can(role, "games.general.manage") || can(role, "games.approve")],
    ["queue", "صف تأیید", can(role, "games.approve")],
    ["calendar", "تقویم محتوایی", can(role, "games.view_all") || can(role, "games.program.manage")],
    ["news", "اخبار و محتوا", can(role, "news.manage")],
    ["users", "کاربران", can(role, "users.manage") && role !== "program_team"],
    ["weights", "وزن‌دهی امتیاز", can(role, "leaderboard.manage")],
    ["live", "پخش زنده", can(role, "live.broadcast") || can(role, "live.commentary")],
    ["teams", "تیم‌ها و دسترسی‌ها", role === "super_admin"],
    ["audit", "لاگ ممیزی", role === "super_admin"],
  ];
  const visibleNav = NAV.filter(([, , ok]) => ok);

  return (
    <div className="min-h-screen flex">
      {/* سایدبار */}
      <aside className="w-60 shrink-0 border-l border-white/5 flex flex-col" style={{ background: "var(--color-panel-dark)" }}>
        <div className="p-4 border-b border-white/5">
          <div className="headline">ورزشپلاس <span className="text-xs font-normal" style={{ color: "var(--color-muted)" }}>| پنل مدیریت</span></div>
          <div className="mt-2 text-sm">{admin.fullName}</div>
          <div className="text-xs" style={{ color: "var(--color-club-green)" }}>{ROLE_LABELS[role]}</div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 text-sm">
          {visibleNav.map(([key, label]) => (
            <button key={key} onClick={() => setSection(key)}
              className="w-full text-right px-3 py-2.5 rounded-lg"
              style={section === key ? { background: "rgba(46,204,113,0.12)", color: "var(--color-club-green)" } : { color: "var(--color-floodlight)" }}>
              {label}
            </button>
          ))}
        </nav>
        <button onClick={async () => { await apiPost({ action: "logout" }); setAdmin(null); }} className="btn-ghost m-3 py-2 text-sm">خروج</button>
      </aside>

      {/* محتوا */}
      <main className="flex-1 p-6 overflow-x-auto">
        {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm" style={{ background: "var(--color-club-green)", color: "#08120B", fontWeight: 700 }}>{toast}</div>}
        {section === "dashboard" && <DashboardSection />}
        {section === "games" && <GamesSection admin={admin} notify={notify} />}
        {section === "queue" && <QueueSection notify={notify} />}
        {section === "calendar" && <CalendarSection />}
        {section === "news" && <NewsSection admin={admin} notify={notify} />}
        {section === "users" && <UsersSection notify={notify} />}
        {section === "weights" && <WeightsSection notify={notify} />}
        {section === "live" && <LiveSection admin={admin} notify={notify} />}
        {section === "teams" && <TeamsSection notify={notify} />}
        {section === "audit" && <AuditSection />}
      </main>
    </div>
  );
}

/* ================= ورود ادمین ================= */

function AdminLogin({ onLogin }: { onLogin: (a: Admin) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const d = await apiPost({ action: "login", username, password });
    setBusy(false);
    if (!d.success) return setError(d.error ?? "خطا");
    const me = await apiGet("me");
    onLogin(me.admin);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="panel w-full max-w-sm p-7 space-y-4">
        <h1 className="headline text-center">ورود پنل مدیریت</h1>
        <input dir="ltr" placeholder="نام کاربری" value={username} onChange={(e) => setUsername(e.target.value)} required
          className="w-full px-3.5 py-2.5 rounded-lg bg-transparent border border-white/15 outline-none focus:border-white/40" style={{ color: "var(--color-floodlight)" }} />
        <input dir="ltr" type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full px-3.5 py-2.5 rounded-lg bg-transparent border border-white/15 outline-none focus:border-white/40" style={{ color: "var(--color-floodlight)" }} />
        {error && <p className="text-sm" style={{ color: "var(--color-live-signal)" }}>{error}</p>}
        <button type="submit" disabled={busy} className="btn-green w-full py-2.5 text-sm disabled:opacity-60">{busy ? "..." : "ورود"}</button>
        <p className="text-xs text-center" style={{ color: "var(--color-muted)" }}>
          دمو: super / content / approver / ops / reporter / team_football — رمز: 123456
        </p>
      </form>
    </div>
  );
}

/* ================= داشبورد ================= */

function DashboardSection() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => { apiGet("stats").then((d) => d.success && setStats(d.stats)); }, []);
  if (!stats) return <p style={{ color: "var(--color-muted)" }}>...</p>;
  const cards: Array<[string, number]> = [
    ["بازی‌های منتشرشده", stats.publishedGames],
    ["در انتظار تأیید", stats.pendingGames],
    ["کاربران", stats.users],
    ["مجموع مشارکت‌ها", stats.participations],
  ];
  return (
    <div>
      <h1 className="headline text-xl mb-5">داشبورد</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, v]) => (
          <div key={label} className="panel p-5">
            <div className="tabular headline text-3xl" style={{ color: "var(--color-club-green)" }}>{v}</div>
            <div className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= مدیریت بازی‌ها ================= */

function GamesSection({ admin, notify }: { admin: Admin; notify: (m: string) => void }) {
  const [rows, setRows] = useState<GameRow[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => { apiGet("games").then((d) => d.success && setRows(d.games)); }, []);
  useEffect(() => { load(); }, [load]);

  async function transition(gameId: number, to: string) {
    const d = await apiPost({ action: "transition-game", gameId, to });
    notify(d.success ? `وضعیت به «${STATUS_LABELS[to]}» تغییر کرد` : d.error ?? "خطا");
    load();
  }

  const isProgramTeam = admin.role === "program_team";
  const canGeneral = can(admin.role, "games.general.manage");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="headline text-xl">مدیریت بازی‌ها {isProgramTeam && <span className="text-sm font-normal" style={{ color: "var(--color-muted)" }}>(فقط برنامه خودت)</span>}</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-green px-4 py-2 text-sm">بازی جدید</button>
      </div>

      {showForm && <CreateGameForm admin={admin} notify={notify} onDone={() => { setShowForm(false); load(); }} />}

      <Table headers={["عنوان", "نوع", "برنامه", "وضعیت", "زمان شروع", "شرکت‌کننده", "عملیات"]}>
        {rows.map((g) => (
          <tr key={g.id} className="border-t border-white/5">
            <Td>{g.title}</Td>
            <Td>{g.gameType === "program" ? "برنامه‌ای" : g.gameType === "general" ? "عمومی" : "رویدادی"}</Td>
            <Td>{g.programTitle ?? "—"}</Td>
            <Td><span style={{ color: STATUS_COLORS[g.status] }}>● {STATUS_LABELS[g.status]}</span></Td>
            <Td className="tabular">{fmt(g.startsAt)}</Td>
            <Td className="tabular">{g.participants}</Td>
            <Td>
              <div className="flex gap-1.5 flex-wrap">
                {nextStatuses(g.gameType, g.status).map((to) => {
                  const needsApprove = (to === "published" || to === "rejected") && g.gameType !== "program";
                  if (needsApprove && !can(admin.role, "games.approve")) return null;
                  if (g.gameType === "program" && !can(admin.role, "games.program.manage")) return null;
                  return (
                    <button key={to} onClick={() => transition(g.id, to)} className="btn-ghost px-2.5 py-1 text-xs"
                      style={to === "published" ? { borderColor: "var(--color-club-green)", color: "var(--color-club-green)" } : to === "rejected" ? { borderColor: "var(--color-live-signal)", color: "var(--color-live-signal)" } : undefined}>
                      {to === "published" ? "انتشار" : to === "pending" ? "ارسال به تأیید" : to === "rejected" ? "رد" : "بازگشت به پیش‌نویس"}
                    </button>
                  );
                })}
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      {!canGeneral && !isProgramTeam && <p className="text-sm" style={{ color: "var(--color-muted)" }}>شما فقط دسترسی مشاهده دارید.</p>}
    </div>
  );
}

function CreateGameForm({ admin, notify, onDone }: { admin: Admin; notify: (m: string) => void; onDone: () => void }) {
  const isProgramTeam = admin.role === "program_team";
  const canGeneral = can(admin.role, "games.general.manage");
  const [title, setTitle] = useState("");
  const [gameType, setGameType] = useState(isProgramTeam ? "program" : "general");
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [questions, setQuestions] = useState<Array<{ text: string; questionType: string; options: string; correctOption: string; points: string }>>([
    { text: "", questionType: "multiple_choice", options: "", correctOption: "0", points: "100" },
  ]);

  async function submit() {
    const parsed = questions.filter((q) => q.text.trim() && q.options.trim()).map((q) => ({
      text: q.text, questionType: q.questionType,
      options: q.options.split("|").map((s) => s.trim()).filter(Boolean),
      correctOption: q.questionType === "poll" ? null : Number(q.correctOption),
      points: Number(q.points) || 100,
    }));
    const d = await apiPost({
      action: "create-game", title, gameType, description, prize: prize || null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      questions: parsed,
    });
    notify(d.success ? "بازی ساخته شد" : d.error ?? "خطا");
    if (d.success) onDone();
  }

  return (
    <div className="panel p-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input placeholder="عنوان بازی" value={title} onChange={(e) => setTitle(e.target.value)} className="field" />
        <select value={gameType} onChange={(e) => setGameType(e.target.value)} disabled={isProgramTeam} className="field">
          {isProgramTeam && <option value="program">بازی برنامه‌ای (برنامه شما)</option>}
          {canGeneral && <option value="general">بازی عمومی</option>}
          {canGeneral && <option value="event">بازی رویدادی</option>}
        </select>
        <input placeholder="توضیح" value={description} onChange={(e) => setDescription(e.target.value)} className="field" />
        <input placeholder="جایزه (مثلاً ۵۰۰ سکه)" value={prize} onChange={(e) => setPrize(e.target.value)} className="field" />
        <label className="text-sm" style={{ color: "var(--color-muted)" }}>شروع
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="field mt-1" dir="ltr" />
        </label>
        <label className="text-sm" style={{ color: "var(--color-muted)" }}>پایان
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="field mt-1" dir="ltr" />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="headline text-sm">سؤالات (گزینه‌ها را با | جدا کنید)</h3>
          <button onClick={() => setQuestions([...questions, { text: "", questionType: "multiple_choice", options: "", correctOption: "0", points: "100" }])} className="btn-ghost px-3 py-1.5 text-xs">+ سؤال</button>
        </div>
        {questions.map((q, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_140px_1fr_80px_70px] items-center">
            <input placeholder={`متن سؤال ${i + 1}`} value={q.text} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} className="field" />
            <select value={q.questionType} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, questionType: e.target.value } : x))} className="field">
              <option value="multiple_choice">چندگزینه‌ای</option>
              <option value="true_false">درست/غلط</option>
              <option value="poll">نظرسنجی</option>
            </select>
            <input placeholder="گزینه ۱ | گزینه ۲" value={q.options} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, options: e.target.value } : x))} className="field" dir="rtl" />
            <input placeholder="پاسخ" type="number" min="0" value={q.questionType === "poll" ? "" : q.correctOption} disabled={q.questionType === "poll"} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, correctOption: e.target.value } : x))} className="field tabular" dir="ltr" />
            <input placeholder="امتیاز" type="number" value={q.points} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, points: e.target.value } : x))} className="field tabular" dir="ltr" />
          </div>
        ))}
      </div>

      <button onClick={submit} className="btn-green px-5 py-2 text-sm">ذخیره {gameType === "program" ? "و انتشار مستقیم" : "به‌عنوان پیش‌نویس"}</button>
    </div>
  );
}

/* ================= صف تأیید ================= */

function QueueSection({ notify }: { notify: (m: string) => void }) {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const load = useCallback(() => { apiGet("queue").then((d) => d.success && setRows(d.queue)); }, []);
  useEffect(() => { load(); }, [load]);

  async function act(gameId: number, to: string) {
    const d = await apiPost({ action: "transition-game", gameId, to });
    notify(d.success ? (to === "published" ? "منتشر شد" : "رد شد") : d.error ?? "خطا");
    load();
  }

  return (
    <div className="space-y-5">
      <h1 className="headline text-xl">صف تأیید بازی‌های عمومی/رویدادی</h1>
      <Table headers={["عنوان", "نوع", "سازنده", "زمان شروع", "پایان", "عملیات"]}>
        {rows.map((g) => (
          <tr key={g.id} className="border-t border-white/5">
            <Td>{g.title}</Td>
            <Td>{g.gameType === "general" ? "عمومی" : "رویدادی"}</Td>
            <Td>{g.createdBy ?? "—"}{g.programTitle ? ` (${g.programTitle})` : ""}</Td>
            <Td className="tabular">{fmt(g.startsAt)}</Td>
            <Td className="tabular">{fmt(g.endsAt)}</Td>
            <Td>
              <div className="flex gap-1.5">
                <button onClick={() => act(g.id, "published")} className="btn-ghost px-3 py-1 text-xs" style={{ borderColor: "var(--color-club-green)", color: "var(--color-club-green)" }}>تأیید و انتشار</button>
                <button onClick={() => act(g.id, "rejected")} className="btn-ghost px-3 py-1 text-xs" style={{ borderColor: "var(--color-live-signal)", color: "var(--color-live-signal)" }}>رد</button>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
      {!rows.length && <p style={{ color: "var(--color-muted)" }}>صف خالی است.</p>}
    </div>
  );
}

/* ================= تقویم محتوایی ================= */

function CalendarSection() {
  const [rows, setRows] = useState<CalRow[]>([]);
  useEffect(() => { apiGet("calendar").then((d) => d.success && setRows(d.events)); }, []);

  // گروه‌بندی بر اساس روز — نمایش تداخل‌ها
  const byDay = new Map<string, CalRow[]>();
  for (const r of rows) {
    const day = r.startsAt!.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), r]);
  }

  return (
    <div className="space-y-5">
      <h1 className="headline text-xl">تقویم محتوایی مرکزی</h1>
      {[...byDay.entries()].sort().map(([day, items]) => {
        const overlaps = items.length > 1;
        return (
          <div key={day} className="panel p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="headline text-sm tabular">{new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date(day))}</h3>
              {overlaps && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(226,59,59,0.12)", color: "var(--color-live-signal)" }}>تداخل زمانی — بررسی شود</span>}
            </div>
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between px-3 py-2 rounded text-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span>{it.title} <span style={{ color: "var(--color-muted)" }}>— {it.programTitle ?? "تیم مرکزی"}</span></span>
                <span className="tabular text-xs" style={{ color: STATUS_COLORS[it.status] }}>{fmt(it.startsAt)} تا {fmt(it.endsAt)}</span>
              </div>
            ))}
          </div>
        );
      })}
      {!rows.length && <p style={{ color: "var(--color-muted)" }}>زمان‌بندی فعالی ثبت نشده.</p>}
    </div>
  );
}

/* ================= اخبار ================= */

function NewsSection({ admin, notify }: { admin: Admin; notify: (m: string) => void }) {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [breaking, setBreaking] = useState(false);

  const load = useCallback(() => { apiGet("news").then((d) => d.success && setRows(d.items)); }, []);
  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!title.trim()) return;
    const d = await apiPost({ action: "create-news", title, summary, isBreaking: breaking });
    notify(d.success ? "خبر ساخته شد (پیش‌نویس)" : d.error ?? "خطا");
    if (d.success) { setTitle(""); setSummary(""); setBreaking(false); load(); }
  }
  async function publish(newsId: number) {
    const d = await apiPost({ action: "publish-news", newsId });
    notify(d.success ? "خبر منتشر شد" : d.error ?? "خطا");
    load();
  }

  return (
    <div className="space-y-5">
      <h1 className="headline text-xl">اخبار و محتوا</h1>
      <div className="panel p-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
        <input placeholder="عنوان خبر" value={title} onChange={(e) => setTitle(e.target.value)} className="field" />
        <input placeholder="خلاصه" value={summary} onChange={(e) => setSummary(e.target.value)} className="field" />
        <button onClick={create} className="btn-green px-4 py-2 text-sm">افزودن</button>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
          <input type="checkbox" checked={breaking} onChange={(e) => setBreaking(e.target.checked)} /> خبر فوری
        </label>
      </div>
      <Table headers={["عنوان", "نویسنده", "وضعیت", "انتشار", "عملیات"]}>
        {rows.map(({ n, authorName }) => (
          <tr key={n.id} className="border-t border-white/5">
            <Td>{n.isBreaking ? "🔴 " : ""}{n.title}</Td>
            <Td>{authorName ?? "—"}</Td>
            <Td><span style={{ color: n.status === "published" ? "var(--color-club-green)" : "var(--color-muted)" }}>{n.status === "published" ? "منتشرشده" : "پیش‌نویس"}</span></Td>
            <Td className="tabular">{fmt(n.publishedAt)}</Td>
            <Td>{n.status !== "published" && <button onClick={() => publish(n.id)} className="btn-ghost px-3 py-1 text-xs" style={{ borderColor: "var(--color-club-green)", color: "var(--color-club-green)" }}>انتشار</button>}</Td>
          </tr>
        ))}
      </Table>
      {admin.role === "program_team" && <p className="text-xs" style={{ color: "var(--color-muted)" }}>اخبار شما به برنامه خودتان متصل می‌شود.</p>}
    </div>
  );
}

/* ================= کاربران ================= */

function UsersSection({ notify }: { notify: (m: string) => void }) {
  const [rows, setRows] = useState<UserRow[]>([]);
  const load = useCallback(() => { apiGet("users").then((d) => d.success && setRows(d.users)); }, []);
  useEffect(() => { load(); }, [load]);

  async function toggle(userId: number, banned: boolean) {
    const d = await apiPost({ action: banned ? "unban-user" : "ban-user", userId });
    notify(d.success ? (banned ? "آزاد شد" : "مسدود شد") : d.error ?? "خطا");
    load();
  }

  return (
    <div className="space-y-5">
      <h1 className="headline text-xl">مدیریت کاربران نهایی</h1>
      <Table headers={["نام", "شماره", "امتیاز", "سکه", "سطح", "وضعیت", "عملیات"]}>
        {rows.map((u) => (
          <tr key={u.id} className="border-t border-white/5">
            <Td>{u.displayName ?? "—"}</Td>
            <Td className="tabular">{u.phone}</Td>
            <Td className="tabular">{u.points}</Td>
            <Td className="tabular">{u.coins}</Td>
            <Td className="tabular">{u.level}</Td>
            <Td><span style={{ color: u.isBanned ? "var(--color-live-signal)" : "var(--color-club-green)" }}>{u.isBanned ? "مسدود" : "فعال"}</span></Td>
            <Td><button onClick={() => toggle(u.id, !!u.isBanned)} className="btn-ghost px-3 py-1 text-xs">{u.isBanned ? "آزادسازی" : "مسدودسازی"}</button></Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* ================= وزن‌دهی ================= */

function WeightsSection({ notify }: { notify: (m: string) => void }) {
  const [rows, setRows] = useState<Weight[]>([]);
  const load = useCallback(() => { apiGet("weights").then((d) => d.success && setRows(d.weights)); }, []);
  useEffect(() => { load(); }, [load]);

  async function save(w: Weight) {
    const d = await apiPost({ action: "set-weight", weightId: w.id, weight: w.weight, maxPossibleRaw: w.maxPossibleRaw });
    notify(d.success ? "وزن‌دهی ذخیره شد" : d.error ?? "خطا");
  }

  return (
    <div className="space-y-5">
      <h1 className="headline text-xl">وزن‌دهی مرکزی امتیاز</h1>
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>امتیاز استاندارد = (امتیاز خام ÷ سقف خام) × سقف استاندارد × وزن نوع بازی — این جدول عدالت بین بازی‌های ساده و پیچیده را تضمین می‌کند.</p>
      <div className="space-y-3">
        {rows.map((w) => (
          <div key={w.id} className="panel p-4 flex flex-wrap items-end gap-4">
            <div className="min-w-32">
              <div className="text-xs" style={{ color: "var(--color-muted)" }}>نوع بازی</div>
              <div className="font-medium">{w.gameType === "program" ? "برنامه‌ای" : w.gameType === "general" ? "عمومی" : "رویدادی"}</div>
            </div>
            <label className="text-sm">سقف خام
              <input type="number" dir="ltr" value={w.maxPossibleRaw} onChange={(e) => setRows(rows.map((x) => x.id === w.id ? { ...x, maxPossibleRaw: Number(e.target.value) } : x))} className="field mt-1 w-28 tabular" />
            </label>
            <label className="text-sm">وزن
              <input type="number" step="0.1" dir="ltr" value={w.weight} onChange={(e) => setRows(rows.map((x) => x.id === w.id ? { ...x, weight: Number(e.target.value) } : x))} className="field mt-1 w-28 tabular" />
            </label>
            <button onClick={() => save(w)} className="btn-green px-4 py-2 text-sm">ذخیره</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= پخش زنده ================= */

function LiveSection({ admin, notify }: { admin: Admin; notify: (m: string) => void }) {
  const [live, setLive] = useState<Live>(null);
  const [logs, setLogs] = useState<CensorLog[]>([]);
  const [reason, setReason] = useState("");

  const load = useCallback(() => { apiGet("live").then((d) => { if (d.success) { setLive(d.live); setLogs(d.censorLogs ?? []); } }); }, []);
  useEffect(() => { load(); const t = setInterval(load, 10_000); return () => clearInterval(t); }, [load]);

  const canBroadcast = can(admin.role, "live.broadcast");
  const canCommentary = can(admin.role, "live.commentary");

  async function liveUpdate(patch: Record<string, unknown>) {
    const d = await apiPost({ action: "live-update", liveEventId: live!.id, ...patch });
    notify(d.success ? "اعمال شد" : d.error ?? "خطا");
    load();
  }
  async function censor(censorAction: string) {
    const d = await apiPost({ action: "censor", liveEventId: live!.id, censorAction, reason: reason || null });
    notify(d.success ? `اقدام «${censorAction}» ثبت شد` : d.error ?? "خطا");
    setReason(""); load();
  }

  if (!live) return <p style={{ color: "var(--color-muted)" }}>رویداد پخش زنده‌ای تعریف نشده است.</p>;

  return (
    <div className="space-y-5">
      <h1 className="headline text-xl">پخش زنده — {live.title}</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* وضعیت خط پخش */}
        <div className="panel p-5 space-y-3">
          <h3 className="headline text-sm">وضعیت خط پخش</h3>
          <div className="flex items-center gap-3">
            {live.status === "on_air" && <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-live-signal)" }}><span className="live-dot" /> ON AIR</span>}
            <span className="text-sm">بافر تأخیر سانسور: <span className="tabular font-bold">{live.delayBufferSeconds}s</span></span>
          </div>
          {canBroadcast && (
            <div className="flex flex-wrap gap-2 pt-2">
              {live.status !== "on_air" ? (
                <button onClick={() => liveUpdate({ status: "on_air" })} className="btn-green px-4 py-2 text-sm">شروع پخش</button>
              ) : (
                <button onClick={() => liveUpdate({ status: "ended" })} className="btn-ghost px-4 py-2 text-sm">پایان پخش</button>
              )}
              {[15, 30, 60].map((s) => (
                <button key={s} onClick={() => liveUpdate({ delayBufferSeconds: s })} className="btn-ghost px-3 py-2 text-xs tabular" style={live.delayBufferSeconds === s ? { borderColor: "var(--color-glow-electric)" } : undefined}>{s}s تأخیر</button>
              ))}
            </div>
          )}
          {live.censorActive === 1 && (
            <div className="text-sm p-3 rounded-lg" style={{ background: "rgba(226,59,59,0.12)", color: "var(--color-live-signal)" }}>
              ⚠ سانسور فعال است — خروجی جایگزین/قطع است
            </div>
          )}
        </div>

        {/* کنسول گزارشگر */}
        {canCommentary && (
          <div className="panel p-5 space-y-3">
            <h3 className="headline text-sm">کنسول گزارشگر</h3>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>صدای گزارشگر در سمت سرور با تصویر (همگام با بافر تأخیر) میکس می‌شود — خروجی برای کاربر یک استریم واحد است.</p>
            <div className="flex items-center justify-between">
              <span>میکروفون: <b style={{ color: live.commentatorActive ? "var(--color-club-green)" : "var(--color-muted)" }}>{live.commentatorActive ? "فعال" : "غیرفعال"}</b></span>
              <button onClick={() => liveUpdate({ commentatorActive: !live.commentatorActive })} className={live.commentatorActive ? "btn-ghost px-4 py-2 text-sm" : "btn-green px-4 py-2 text-sm"}>
                {live.commentatorActive ? "قطع صدای گزارشگر" : "شروع صدای گزارشگر"}
              </button>
            </div>
          </div>
        )}

        {/* کنسول سانسور */}
        {canBroadcast && (
          <div className="panel p-5 space-y-3">
            <h3 className="headline text-sm">کنسول سانسور زنده</h3>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>در بازه بافر تأخیر ({live.delayBufferSeconds}s) فرصت دارید صحنه را قطع/میوت/جایگزین کنید. همه اقدام‌ها با زمان و دلیل در لاگ ممیزی ثبت می‌شود.</p>
            <input placeholder="دلیل (برای لاگ)" value={reason} onChange={(e) => setReason(e.target.value)} className="field" />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => censor("cut")} className="btn-ghost px-4 py-2 text-sm" style={{ borderColor: "var(--color-live-signal)", color: "var(--color-live-signal)" }}>قطع تصویر</button>
              <button onClick={() => censor("mute")} className="btn-ghost px-4 py-2 text-sm">میوت صدا</button>
              <button onClick={() => censor("fallback")} className="btn-ghost px-4 py-2 text-sm">جایگزینی با لوگو</button>
              <button onClick={() => censor("resume")} className="btn-green px-4 py-2 text-sm">بازگشت به صحنه</button>
            </div>
          </div>
        )}

        {/* لاگ سانسور */}
        <div className="panel p-5">
          <h3 className="headline text-sm mb-3">لاگ اقدام‌های سانسور</h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto text-sm">
            {logs.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span>{l.action === "cut" ? "قطع" : l.action === "mute" ? "میوت" : l.action === "fallback" ? "جایگزینی" : "بازگشت"}{l.reason ? ` — ${l.reason}` : ""}</span>
                <span className="tabular text-xs" style={{ color: "var(--color-muted)" }}>{fmt(l.timestamp)}</span>
              </div>
            ))}
            {!logs.length && <p style={{ color: "var(--color-muted)" }}>اقدامی ثبت نشده.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= تیم‌ها (Super Admin) ================= */

function TeamsSection({ notify }: { notify: (m: string) => void }) {
  const [admins, setAdmins] = useState<TeamRow[]>([]);
  const [programs, setPrograms] = useState<Array<{ id: number; title: string }>>([]);
  const [form, setForm] = useState({ username: "", fullName: "", password: "", role: "program_team", programId: "" });

  const load = useCallback(() => {
    apiGet("teams").then((d) => { if (d.success) { setAdmins(d.admins); setPrograms(d.programs); } });
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create() {
    const d = await apiPost({
      action: "create-admin", username: form.username, fullName: form.fullName,
      password: form.password || "123456", role: form.role,
      programId: form.role === "program_team" ? Number(form.programId) || null : null,
    });
    notify(d.success ? "کاربر ادمین ساخته شد" : d.error ?? "خطا");
    if (d.success) setForm({ username: "", fullName: "", password: "", role: "program_team", programId: "" });
    load();
  }
  async function toggle(adminId: number) {
    const d = await apiPost({ action: "toggle-admin", adminId });
    notify(d.success ? "تغییر کرد" : d.error ?? "خطا");
    load();
  }

  return (
    <div className="space-y-5">
      <h1 className="headline text-xl">تیم‌ها و دسترسی‌ها</h1>

      <div className="panel p-4 grid gap-3 sm:grid-cols-5 items-end">
        <input placeholder="نام کاربری" dir="ltr" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="field" />
        <input placeholder="نام کامل" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="field" />
        <input placeholder="رمز (پیش‌فرض 123456)" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="field" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="field">
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} className="field" disabled={form.role !== "program_team"} style={form.role !== "program_team" ? { opacity: 0.4 } : undefined}>
          <option value="">— برنامه —</option>
          {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <button onClick={create} className="btn-green px-4 py-2 text-sm sm:col-span-5 sm:w-fit">افزودن عضو تیم</button>
      </div>

      <Table headers={["نام", "نام کاربری", "نقش", "برنامه", "وضعیت", "عملیات"]}>
        {admins.map((t) => (
          <tr key={t.id} className="border-t border-white/5">
            <Td>{t.fullName}</Td>
            <Td className="tabular" >{t.username}</Td>
            <Td>{ROLE_LABELS[t.role as AdminRole] ?? t.role}</Td>
            <Td>{t.programTitle ?? "—"}</Td>
            <Td><span style={{ color: t.isActive ? "var(--color-club-green)" : "var(--color-live-signal)" }}>{t.isActive ? "فعال" : "غیرفعال"}</span></Td>
            <Td>{t.role !== "super_admin" && <button onClick={() => toggle(t.id)} className="btn-ghost px-3 py-1 text-xs">{t.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}</button>}</Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* ================= لاگ ممیزی ================= */

function AuditSection() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  useEffect(() => { apiGet("audit").then((d) => d.success && setRows(d.logs)); }, []);
  return (
    <div className="space-y-5">
      <h1 className="headline text-xl">لاگ ممیزی (Audit Trail)</h1>
      <Table headers={["زمان", "کاربر", "اقدام", "موجودیت", "برنامه", "جزئیات"]}>
        {rows.map((l) => (
          <tr key={l.id} className="border-t border-white/5">
            <Td className="tabular">{fmt(l.timestamp)}</Td>
            <Td>{l.actorName ?? "سیستم"}</Td>
            <Td><code className="text-xs">{l.action}</code></Td>
            <Td>{l.entityType}{l.entityId ? ` #${l.entityId}` : ""}</Td>
            <Td>{l.programId ?? "—"}</Td>
            <Td><code className="text-xs" style={{ color: "var(--color-muted)" }}>{l.detail ? JSON.stringify(l.detail) : "—"}</code></Td>
          </tr>
        ))}
      </Table>
      {!rows.length && <p style={{ color: "var(--color-muted)" }}>لاگی موجود نیست.</p>}
    </div>
  );
}

/* ================= اجزای مشترک ================= */

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr style={{ color: "var(--color-muted)" }}>
            {headers.map((h) => <th key={h} className="text-right font-medium px-4 py-3 text-xs">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
