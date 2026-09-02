import { sqliteTable, integer, text, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

/* ============================================================
 * ورزش پلاس — اسکیمای MVP
 *طراحی‌شده برای مهاجرت آسان به PostgreSQL (نام‌ها و انواع استاندارد)
 * ============================================================ */

/* ---------- کاربران نهایی و احراز هویت ---------- */

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull().unique(), // فرمت 09xxxxxxxxx
  displayName: text("display_name"),
  avatar: text("avatar"),
  points: integer("points").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  isBanned: integer("is_banned", { mode: "boolean" }).notNull().default(false),
  followedTeams: text("followed_teams"), // JSON آرایه
  createdAt: text("created_at").notNull().default(""),
}, (t) => [index("idx_users_points").on(t.points)]);

export const otpCodes = sqliteTable("otp_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: text("expires_at").notNull(),
  consumed: integer("consumed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(""),
}, (t) => [index("idx_otp_phone").on(t.phone)]);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // توکن تصادفی
  userId: integer("user_id").notNull(),
  kind: text("kind").notNull().default("user"), // user | admin
  adminId: integer("admin_id"),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(""),
});

/* ---------- برنامه‌های شبکه و تیم‌های سردبیری ---------- */

export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  onAirDay: text("on_air_day"), // روز پخش هفتگی
  onAirTime: text("on_air_time"), // ساعت پخش
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

/* ---------- ادمین‌ها و RBAC ---------- */
// نقش‌ها: super_admin | central_content | approver | program_team | commentator | broadcast_ops | support
export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(), // scrypt/sha256+salt
  fullName: text("full_name").notNull(),
  role: text("role").notNull(),
  programId: integer("program_id"), // فقط برای program_team — ایزوله‌سازی داده
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(""),
});

/* ---------- بازی‌ها ---------- */
// game_type: program | general | event
// status: draft | pending | published | rejected
// بازی برنامه‌ای بدون گلوگاه تایید: draft -> published
// بازی عمومی/رویدادی: draft -> pending -> published | rejected
export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  gameType: text("game_type").notNull(),
  status: text("status").notNull().default("draft"),
  programId: integer("program_id"), // nullable برای general/event
  eventId: integer("event_id"), // برای بازی‌های مرتبط با رویداد (مسابقه)
  coverImage: text("cover_image"),
  prize: text("prize"),
  startsAt: text("starts_at"),
  endsAt: text("ends_at"),
  // نتیجه‌دهی دستی بازی‌های رویدادی توسط تیم مرکزی
  resultNote: text("result_note"),
  resultEnteredBy: integer("result_entered_by"),
  resultEnteredAt: text("result_entered_at"),
  createdById: integer("created_by").notNull(), // admin_users.id
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(""),
}, (t) => [
  index("idx_games_status").on(t.status),
  index("idx_games_program").on(t.programId),
]);

// questionType: multiple_choice | true_false | poll (بدون پاسخ صحیح)
export const gameQuestions = sqliteTable("game_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: integer("game_id").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  questionType: text("question_type").notNull().default("multiple_choice"),
  text: text("text").notNull(),
  options: text("options").notNull(), // JSON آرایه رشته‌ها
  correctOption: integer("correct_option"), // null برای poll
  timeLimitSeconds: integer("time_limit_seconds").notNull().default(20),
  points: integer("points").notNull().default(100),
}, (t) => [index("idx_questions_game").on(t.gameId)]);

export const gameParticipations = sqliteTable("game_participations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: integer("game_id").notNull(),
  userId: integer("user_id").notNull(),
  rawScore: integer("raw_score").notNull().default(0), // مجموع امتیاز خام سؤالات
  weightedScore: real("weighted_score").notNull().default(0), // پس از نرمال‌سازی با score_weights
  status: text("status").notNull().default("completed"), // completed | scored
  createdAt: text("created_at").notNull().default(""),
}, (t) => [uniqueIndex("uq_participation").on(t.gameId, t.userId)]);

export const gameAnswers = sqliteTable("game_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  participationId: integer("participation_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedOption: integer("selected_option"),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  answeredAt: text("answered_at").notNull().default(""),
});

// جدول وزن‌دهی مرکزی — نرمال‌سازی امتیاز بین انواع بازی
export const scoreWeights = sqliteTable("score_weights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameType: text("game_type").notNull(),
  maxPossibleRaw: integer("max_possible_raw").notNull().default(1000),
  weight: real("weight").notNull().default(1.0), // ضریب تبدیل به امتیاز استاندارد
  updatedAt: text("updated_at").notNull().default(""),
});

/* ---------- نشان‌ها و دستاوردها ---------- */

export const badges = sqliteTable("badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color").notNull().default("#2ECC71"),
  condition: text("condition"), // توضیح شرط اعطا
});

export const userBadges = sqliteTable("user_badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  awardedAt: text("awarded_at").notNull().default(""),
}, (t) => [uniqueIndex("uq_user_badge").on(t.userId, t.badgeId)]);

/* ---------- رویدادهای ورزشی (مسابقات) ---------- */

export const sportEvents = sqliteTable("sport_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  league: text("league").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamLogo: text("home_team_logo"),
  awayTeamLogo: text("away_team_logo"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: text("status").notNull().default("upcoming"), // upcoming | live | finished
  startTime: text("start_time").notNull(),
  stadium: text("stadium"),
  isHot: integer("is_hot", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(""),
});

/* ---------- پخش زنده (وضعیت — پایپ‌لاین واقعی خارج از اپ) ---------- */

export const liveEvents = sqliteTable("live_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  hlsUrl: text("hls_url"),
  status: text("status").notNull().default("idle"), // idle | preparing | on_air | ended
  commentatorActive: integer("commentator_active", { mode: "boolean" }).notNull().default(false),
  censorActive: integer("censor_active", { mode: "boolean" }).notNull().default(false), // وضعیت لحظه‌ای قطع/میوت
  delayBufferSeconds: integer("delay_buffer_seconds").notNull().default(30),
  startedAt: text("started_at"),
  endedAt: text("ended_at"),
});

export const censorLogs = sqliteTable("censor_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  liveEventId: integer("live_event_id").notNull(),
  action: text("action").notNull(), // cut | mute | fallback | resume
  reason: text("reason"),
  operatorId: integer("operator_id").notNull(), // admin_users.id
  timestamp: text("timestamp").notNull(),
});

/* ---------- اخبار و محتوا ---------- */

export const news = sqliteTable("news", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary"),
  body: text("body"),
  coverImage: text("cover_image"),
  category: text("category").notNull().default("general"),
  programId: integer("program_id"), // محتوای مرتبط با برنامه
  isBreaking: integer("is_breaking", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  scheduledAt: text("scheduled_at"),
  status: text("status").notNull().default("draft"), // draft | scheduled | published
  createdById: integer("created_by").notNull(),
  createdAt: text("created_at").notNull().default(""),
});

/* ---------- اعلان‌ها ---------- */

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"), // null = broadcast به همه
  title: text("title").notNull(),
  body: text("body"),
  relatedType: text("related_type"), // game | news | event
  relatedId: integer("related_id"),
  sentAt: text("sent_at"),
  status: text("status").notNull().default("draft"), // draft | sent
  createdById: integer("created_by"),
});

/* ---------- فوتبالیست منیجر — بومی OFM ---------- */
export const managerSaves = sqliteTable("manager_saves", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  teamSlug: text("team_slug").notNull(),
  teamName: text("team_name").notNull(),
  season: integer("season").notNull().default(1),
  week: integer("week").notNull().default(1),
  budget: integer("budget").notNull().default(5000000),
  points: integer("points").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  createdAt: text("created_at").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(""),
}, (t) => [index("idx_manager_user").on(t.userId), index("idx_manager_team").on(t.teamSlug)]);

export const managerPlayers = sqliteTable("manager_players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  name: text("name").notNull(),
  position: text("position").notNull(), // GK | DF | MF | FW
  age: integer("age").notNull(),
  rating: integer("rating").notNull(), // 60-90
  value: integer("value").notNull(),
  salary: integer("salary").notNull(),
  isStarter: integer("is_starter", { mode: "boolean" }).notNull().default(false),
}, (t) => [index("idx_mp_save").on(t.saveId)]);

export const managerInbox = sqliteTable("manager_inbox", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull().default("news"), // news | result | transfer | training
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(""),
}, (t) => [index("idx_inbox_save").on(t.saveId)]);

export const managerMatches = sqliteTable("manager_matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saveId: integer("save_id").notNull(),
  week: integer("week").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  events: text("events"), // JSON commentary
  status: text("status").notNull().default("upcoming"), // upcoming | played
}, (t) => [index("idx_mm_save_week").on(t.saveId, t.week)]);

/* ---------- لاگ ممیزی (Audit Trail) ---------- */

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorType: text("actor_type").notNull(), // admin | system
  actorId: integer("actor_id"),
  actorName: text("actor_name"),
  action: text("action").notNull(), // publish | approve | reject | create | update | delete | censor | login ...
  entityType: text("entity_type"), // game | news | user | live ...
  entityId: integer("entity_id"),
  programId: integer("program_id"),
  detail: text("detail"), // JSON
  timestamp: text("timestamp").notNull(),
}, (t) => [index("idx_audit_entity").on(t.entityType, t.entityId)]);
