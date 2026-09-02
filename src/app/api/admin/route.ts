import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  adminUsers, programs, games, gameQuestions, news, users, notifications,
  scoreWeights, liveEvents, censorLogs, auditLogs, gameParticipations,
} from "@/db/schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { getCurrentAdmin, loginAdmin, logout, nowISO } from "@/lib/auth";
import { can, nextStatuses, type AdminRole } from "@/lib/rbac";
import { seedDatabase } from "@/db/seed";

type Admin = { id: number; role: AdminRole; programId: number | null; fullName: string; username: string };

function audit(admin: Admin, action: string, entityType: string, entityId: number | null, detail?: unknown) {
  db.insert(auditLogs).values({
    actorType: "admin", actorId: admin.id, actorName: admin.fullName,
    action, entityType, entityId, programId: admin.programId,
    detail: detail ? JSON.stringify(detail) : null, timestamp: nowISO(),
  }).run();
}

function forbidden() {
  return NextResponse.json({ success: false, error: "دسترسی غیرمجاز" }, { status: 403 });
}

/* ================= GET ?resource= ================= */

export async function GET(req: Request) {
  seedDatabase();
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");

  if (resource === "me") {
    const admin = await getCurrentAdmin();
    return NextResponse.json({ success: true, admin: admin ? { id: admin.id, username: admin.username, fullName: admin.fullName, role: admin.role, programId: admin.programId } : null });
  }

  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "unauthenticated" }, { status: 401 });
  const a = admin as unknown as Admin;

  if (resource === "games") {
    let rows = db
      .select({
        id: games.id, title: games.title, description: games.description, gameType: games.gameType,
        status: games.status, programId: games.programId, programTitle: programs.title,
        prize: games.prize, startsAt: games.startsAt, endsAt: games.endsAt,
        participants: sql<number>`(SELECT COUNT(*) FROM game_participations gp WHERE gp.game_id = ${games.id})`,
        createdAt: games.createdAt,
      })
      .from(games)
      .leftJoin(programs, eq(programs.id, games.programId))
      .orderBy(desc(games.createdAt))
      .all();
    // ایزوله‌سازی: تیم برنامه فقط بازی‌های برنامه خودش را می‌بیند
    if (a.role === "program_team") rows = rows.filter((g) => g.programId === a.programId);
    return NextResponse.json({ success: true, games: rows });
  }

  if (resource === "queue") {
    if (!can(a.role, "games.approve")) return forbidden();
    const rows = db
      .select({
        id: games.id, title: games.title, gameType: games.gameType, status: games.status, programId: games.programId, startsAt: games.startsAt, endsAt: games.endsAt, createdBy: adminUsers.fullName, programTitle: programs.title,
      })
      .from(games)
      .leftJoin(adminUsers, eq(adminUsers.id, games.createdById))
      .leftJoin(programs, eq(programs.id, games.programId))
      .where(eq(games.status, "pending"))
      .orderBy(games.createdAt)
      .all();
    return NextResponse.json({ success: true, queue: rows });
  }

  if (resource === "calendar") {
    if (!can(a.role, "games.view_all") && !can(a.role, "games.program.manage")) return forbidden();
    let rows = db
      .select({ id: games.id, title: games.title, gameType: games.gameType, status: games.status, programId: games.programId, startsAt: games.startsAt, endsAt: games.endsAt, programTitle: programs.title })
      .from(games)
      .leftJoin(programs, eq(programs.id, games.programId))
      .where(inArray(games.status, ["published", "pending", "draft"]))
      .all()
      .filter((g) => g.startsAt);
    if (a.role === "program_team") rows = rows.filter((g) => g.programTitle && g.programId === a.programId);
    return NextResponse.json({ success: true, events: rows });
  }

  if (resource === "questions") {
    const gameId = Number(url.searchParams.get("gameId"));
    const game = db.select().from(games).where(eq(games.id, gameId)).limit(1).all()[0];
    if (!game) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    if (a.role === "program_team" && game.programId !== a.programId) return forbidden();
    const rows = db.select().from(gameQuestions).where(eq(gameQuestions.gameId, gameId)).orderBy(gameQuestions.orderIndex).all()
      .map((q) => ({ ...q, options: JSON.parse(q.options) }));
    return NextResponse.json({ success: true, game, questions: rows });
  }

  if (resource === "news") {
    if (!can(a.role, "news.manage")) return forbidden();
    const rows = db.select({ n: news, authorName: adminUsers.fullName }).from(news).leftJoin(adminUsers, eq(adminUsers.id, news.createdById)).orderBy(desc(news.createdAt)).all();
    return NextResponse.json({ success: true, items: rows });
  }

  if (resource === "users") {
    if (!can(a.role, "users.manage")) return forbidden();
    const rows = db.select({ id: users.id, displayName: users.displayName, phone: users.phone, points: users.points, coins: users.coins, level: users.level, isBanned: users.isBanned, createdAt: users.createdAt }).from(users).orderBy(desc(users.points)).limit(200).all();
    return NextResponse.json({ success: true, users: rows });
  }

  if (resource === "weights") {
    if (!can(a.role, "leaderboard.manage")) return forbidden();
    return NextResponse.json({ success: true, weights: db.select().from(scoreWeights).all() });
  }

  if (resource === "live") {
    const le = db.select().from(liveEvents).orderBy(desc(liveEvents.startedAt)).limit(1).all()[0] ?? null;
    if (!le) return NextResponse.json({ success: true, live: null, censorLogs: [] });
    const logs = db.select().from(censorLogs).where(eq(censorLogs.liveEventId, le.id)).orderBy(desc(censorLogs.timestamp)).limit(50).all();
    return NextResponse.json({ success: true, live: le, censorLogs: logs });
  }

  if (resource === "audit") {
    if (a.role !== "super_admin") return forbidden();
    const rows = db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(100).all()
      .map((r) => ({ ...r, detail: r.detail ? JSON.parse(r.detail) : null }));
    return NextResponse.json({ success: true, logs: rows });
  }

  if (resource === "teams") {
    if (a.role !== "super_admin") return forbidden();
    const rows = db.select({ id: adminUsers.id, username: adminUsers.username, fullName: adminUsers.fullName, role: adminUsers.role, programId: adminUsers.programId, programTitle: programs.title, isActive: adminUsers.isActive }).from(adminUsers).leftJoin(programs, eq(programs.id, adminUsers.programId)).all();
    return NextResponse.json({ success: true, admins: rows, programs: db.select().from(programs).all() });
  }

  if (resource === "stats") {
    const counts = {
      publishedGames: db.select({ c: sql<number>`COUNT(*)` }).from(games).where(eq(games.status, "published")).all()[0],
      pendingGames: db.select({ c: sql<number>`COUNT(*)` }).from(games).where(eq(games.status, "pending")).all()[0],
      users: db.select({ c: sql<number>`COUNT(*)` }).from(users).all()[0],
      participations: db.select({ c: sql<number>`COUNT(*)` }).from(gameParticipations).all()[0],
    };
    return NextResponse.json({
      success: true,
      stats: {
        publishedGames: Number(counts.publishedGames?.c ?? 0),
        pendingGames: Number(counts.pendingGames?.c ?? 0),
        users: Number(counts.users?.c ?? 0),
        participations: Number(counts.participations?.c ?? 0),
      },
    });
  }

  return NextResponse.json({ success: false, error: "resource نامعتبر" }, { status: 400 });
}

/* ================= POST { action, ... } ================= */

export async function POST(req: Request) {
  seedDatabase();
  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === "login") {
    const admin = await loginAdmin(String(body.username ?? ""), String(body.password ?? ""));
    if (!admin) return NextResponse.json({ success: false, error: "نام کاربری یا رمز اشتباه است" }, { status: 401 });
    return NextResponse.json({ success: true, admin: { id: admin.id, fullName: admin.fullName, role: admin.role } });
  }
  if (action === "logout") {
    await logout("admin");
    return NextResponse.json({ success: true });
  }

  const adminSession = await getCurrentAdmin();
  if (!adminSession) return NextResponse.json({ success: false, error: "unauthenticated" }, { status: 401 });
  const a = adminSession as unknown as Admin;

  /* --- بازی‌ها --- */

  if (action === "create-game") {
    const isProgram = body.gameType === "program";
    const perm: "program" | "general" = isProgram ? "program" : "general";
    if (!can(a.role, isProgram ? "games.program.manage" : "games.general.manage")) return forbidden();
    let programId: number | null = body.programId ?? null;
    if (isProgram) {
      if (a.role === "program_team") programId = a.programId; // تیم فقط برای برنامه خودش
      if (!programId) return NextResponse.json({ success: false, error: "برنامه مشخص نیست" }, { status: 400 });
    } else {
      programId = null;
    }
    const status = isProgram ? (body.publish ? "published" : "draft") : "draft";
    const result = db.insert(games).values({
      title: String(body.title ?? "بدون عنوان"),
      description: body.description ?? null,
      gameType: String(body.gameType),
      status,
      programId,
      eventId: body.eventId ?? null,
      prize: body.prize ?? null,
      startsAt: body.startsAt ?? null,
      endsAt: body.endsAt ?? null,
      createdById: a.id,
      publishedAt: status === "published" ? nowISO() : null,
      createdAt: nowISO(),
    }).returning().all();
    const game = result[0];

    const questions: Array<{ text: string; questionType: string; options: string[]; correctOption: number | null; points: number }> = body.questions ?? [];
    questions.forEach((q, i) => {
      db.insert(gameQuestions).values({
        gameId: game.id, orderIndex: i,
        questionType: q.questionType ?? "multiple_choice",
        text: q.text, options: JSON.stringify(q.options),
        correctOption: q.correctOption ?? null,
        points: q.points ?? 100,
      }).run();
    });

    audit(a, status === "published" ? "publish" : "create", "game", game.id, { title: game.title, gameType: game.gameType });
    return NextResponse.json({ success: true, game });
  }

  if (action === "transition-game") {
    const game = db.select().from(games).where(eq(games.id, Number(body.gameId))).limit(1).all()[0];
    if (!game) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    const to = String(body.to);

    if (!nextStatuses(game.gameType, game.status).includes(to)) {
      return NextResponse.json({ success: false, error: "این تغییر وضعیت مجاز نیست" }, { status: 400 });
    }
    // بازی برنامه‌ای: فقط تیمِ همان برنامه یا super_admin
    if (game.gameType === "program") {
      const own = a.role === "super_admin" || (a.role === "program_team" && game.programId === a.programId);
      if (!own || !can(a.role, "games.program.manage")) return forbidden();
    } else {
      // عمومی/رویدادی
      if (to === "pending") {
        if (!(a.role === "super_admin" || (a.role === "central_content" && game.createdById === a.id))) return forbidden();
      } else if (to === "published" || to === "rejected") {
        if (!can(a.role, "games.approve")) return forbidden();
      } else {
        return forbidden();
      }
    }

    db.update(games).set({
      status: to,
      publishedAt: to === "published" ? nowISO() : game.publishedAt,
    }).where(eq(games.id, game.id)).run();
    audit(a, to === "published" ? "publish" : to === "rejected" ? "reject" : "transition", "game", game.id, { from: game.status, to });
    return NextResponse.json({ success: true });
  }

  /* --- نتیجه دستی بازی رویدادی --- */
  if (action === "set-game-result") {
    if (!can(a.role, "games.general.manage")) return forbidden();
    const game = db.select().from(games).where(eq(games.id, Number(body.gameId))).limit(1).all()[0];
    if (!game) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    // تعیین گزینه صحیح برای سؤالات رویدادی + امتیازدهی مشارکت‌ها
    const correct: Record<number, number> = body.correctOptions ?? {};
    const questions = db.select().from(gameQuestions).where(eq(gameQuestions.gameId, game.id)).all();
    for (const q of questions) {
      if (correct[q.id] !== undefined) {
        db.update(gameQuestions).set({ correctOption: correct[q.id] }).where(eq(gameQuestions.id, q.id)).run();
      }
    }
    db.update(games).set({ resultNote: body.note ?? null, resultEnteredBy: a.id, resultEnteredAt: nowISO() }).where(eq(games.id, game.id)).run();
    audit(a, "set_result", "game", game.id, { correctOptions: correct });
    return NextResponse.json({ success: true });
  }

  /* --- اخبار --- */
  if (action === "create-news") {
    if (!can(a.role, "news.manage")) return forbidden();
    const result = db.insert(news).values({
      title: String(body.title ?? "بدون عنوان"), summary: body.summary ?? null, body: body.body ?? null,
      category: body.category ?? "general", isBreaking: !!body.isBreaking,
      programId: a.role === "program_team" ? a.programId : (body.programId ?? null),
      scheduledAt: body.scheduledAt ?? null, status: "draft", createdById: a.id, createdAt: nowISO(),
    }).returning().all();
    audit(a, "create", "news", result[0].id, { title: result[0].title });
    return NextResponse.json({ success: true, news: result[0] });
  }
  if (action === "publish-news") {
    if (!can(a.role, "news.manage")) return forbidden();
    const item = db.select().from(news).where(eq(news.id, Number(body.newsId))).limit(1).all()[0];
    if (!item) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    if (a.role === "program_team" && item.programId !== a.programId) return forbidden();
    db.update(news).set({ status: "published", publishedAt: nowISO() }).where(eq(news.id, item.id)).run();
    audit(a, "publish", "news", item.id, { title: item.title });
    return NextResponse.json({ success: true });
  }

  /* --- کاربران --- */
  if (action === "ban-user" || action === "unban-user") {
    if (!can(a.role, "users.manage") || a.role === "program_team") return forbidden();
    db.update(users).set({ isBanned: action === "ban-user" }).where(eq(users.id, Number(body.userId))).run();
    audit(a, action === "ban-user" ? "ban" : "unban", "user", Number(body.userId), null);
    return NextResponse.json({ success: true });
  }

  /* --- وزن‌دهی --- */
  if (action === "set-weight") {
    if (!can(a.role, "leaderboard.manage")) return forbidden();
    db.update(scoreWeights).set({ weight: Number(body.weight), maxPossibleRaw: Number(body.maxPossibleRaw), updatedAt: nowISO() })
      .where(eq(scoreWeights.id, Number(body.weightId))).run();
    audit(a, "update", "score_weight", Number(body.weightId), { weight: body.weight });
    return NextResponse.json({ success: true });
  }

  /* --- پخش زنده --- */
  if (action === "live-update") {
    if (!can(a.role, "live.broadcast") && !can(a.role, "live.commentary")) return forbidden();
    const le = db.select().from(liveEvents).where(eq(liveEvents.id, Number(body.liveEventId))).limit(1).all()[0];
    if (!le) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    const patch: Record<string, unknown> = {};
    if (body.status !== undefined && can(a.role, "live.broadcast")) patch.status = body.status;
    if (body.commentatorActive !== undefined && can(a.role, "live.commentary")) patch.commentatorActive = !!body.commentatorActive;
    if (body.delayBufferSeconds !== undefined && can(a.role, "live.broadcast")) patch.delayBufferSeconds = Number(body.delayBufferSeconds);
    if (Object.keys(patch).length) db.update(liveEvents).set(patch).where(eq(liveEvents.id, le.id)).run();
    audit(a, "live_update", "live_event", le.id, patch);
    return NextResponse.json({ success: true });
  }
  if (action === "censor") {
    if (!can(a.role, "live.broadcast")) return forbidden();
    const leId = Number(body.liveEventId);
    const censorAction = String(body.censorAction); // cut | mute | fallback | resume
    db.insert(censorLogs).values({
      liveEventId: leId, action: censorAction, reason: body.reason ?? null, operatorId: a.id, timestamp: nowISO(),
    }).run();
    if (censorAction === "resume") {
      db.update(liveEvents).set({ censorActive: false }).where(eq(liveEvents.id, leId)).run();
    } else {
      db.update(liveEvents).set({ censorActive: true }).where(eq(liveEvents.id, leId)).run();
    }
    audit(a, `censor_${censorAction}`, "live_event", leId, { reason: body.reason });
    return NextResponse.json({ success: true });
  }

  /* --- اعلان‌ها --- */
  if (action === "send-notification") {
    if (!can(a.role, "notifications.manage")) return forbidden();
    db.insert(notifications).values({
      title: String(body.title ?? ""), body: body.body ?? null,
      relatedType: body.relatedType ?? null, relatedId: body.relatedId ?? null,
      status: "sent", sentAt: nowISO(), createdById: a.id,
    }).run();
    // اتصال Push واقعی (نوتیفیکیشن داخلی جایگزین FCM) در فاز استقرار
    audit(a, "send_notification", "notification", null, { title: body.title });
    return NextResponse.json({ success: true });
  }

  /* --- تیم‌ها (Super Admin) --- */
  if (action === "create-admin") {
    if (a.role !== "super_admin") return forbidden();
    const { hashPassword } = await import("@/lib/auth");
    const result = db.insert(adminUsers).values({
      username: String(body.username ?? ""), passwordHash: hashPassword(String(body.password ?? "123456")),
      fullName: String(body.fullName ?? ""), role: String(body.role ?? "program_team"),
      programId: body.programId ?? null, createdAt: nowISO(),
    }).returning().all();
    audit(a, "create", "admin_user", result[0].id, { username: body.username, role: body.role });
    return NextResponse.json({ success: true, admin: { id: result[0].id } });
  }
  if (action === "toggle-admin") {
    if (a.role !== "super_admin") return forbidden();
    const target = db.select().from(adminUsers).where(eq(adminUsers.id, Number(body.adminId))).limit(1).all()[0];
    if (!target) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    db.update(adminUsers).set({ isActive: !target.isActive }).where(eq(adminUsers.id, target.id)).run();
    audit(a, "update", "admin_user", target.id, { isActive: !target.isActive });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "action نامعتبر" }, { status: 400 });
}
