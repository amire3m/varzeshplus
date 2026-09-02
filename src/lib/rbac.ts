/* RBAC — ماتریس دسترسی نقش‌های پنل ادمین ورزش پلاس */

export type AdminRole =
  | "super_admin"
  | "central_content"
  | "approver"
  | "program_team"
  | "commentator"
  | "broadcast_ops"
  | "support";

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "مدیر ارشد پلتفرم",
  central_content: "تیم محتوای مرکزی",
  approver: "تأییدکننده مرکزی",
  program_team: "تیم برنامه",
  commentator: "گزارشگر",
  broadcast_ops: "مدیر پخش زنده",
  support: "پشتیبانی",
};

export type Permission =
  | "dashboard.view"
  | "games.program.manage" // ساخت/ویرایش/انتشار بازی برنامه خودِ تیم (بدون تایید)
  | "games.general.manage" // ساخت بازی عمومی/رویدادی (نیازمند تایید)
  | "games.approve" // صف تایید
  | "games.view_all" // تقویم محتوایی مرکزی
  | "news.manage"
  | "leaderboard.manage" // وزن‌دهی امتیاز
  | "users.manage"
  | "teams.manage" // مدیریت ادمین‌ها/تیم‌ها (Super Admin)
  | "notifications.manage"
  | "live.commentary" // کنسول گزارشگر
  | "live.broadcast"; // کنسول سانسور و زیرساخت پخش

const MATRIX: Record<AdminRole, Permission[]> = {
  super_admin: ["dashboard.view", "games.program.manage", "games.general.manage", "games.approve", "games.view_all", "news.manage", "leaderboard.manage", "users.manage", "teams.manage", "notifications.manage", "live.commentary", "live.broadcast"],
  central_content: ["dashboard.view", "games.general.manage", "games.view_all", "news.manage", "notifications.manage", "leaderboard.manage"],
  approver: ["dashboard.view", "games.approve", "games.view_all"],
  program_team: ["dashboard.view", "games.program.manage"],
  commentator: ["dashboard.view", "live.commentary"],
  broadcast_ops: ["dashboard.view", "live.broadcast"],
  support: ["dashboard.view", "users.manage"],
};

export function can(role: AdminRole, permission: Permission): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}

// گردش کار وضعیت بازی بر اساس نوع
export function nextStatuses(gameType: string, current: string): string[] {
  if (gameType === "program") {
    // بدون گلوگاه تایید مرکزی
    if (current === "draft") return ["published"];
    if (current === "published") return ["draft"];
    return [];
  }
  // general / event
  if (current === "draft") return ["pending"];
  if (current === "pending") return ["published", "rejected"];
  if (current === "rejected") return ["pending"];
  if (current === "published") return ["pending"];
  return [];
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "پیش‌نویس",
  pending: "در انتظار تأیید",
  published: "منتشرشده",
  rejected: "رد شده",
};
