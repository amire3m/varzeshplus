import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  league: text("league").notNull(),
  leagueLogo: text("league_logo").notNull(),
  homeTeam: text("home_team").notNull(),
  homeFlag: text("home_flag").notNull(),
  awayTeam: text("away_team").notNull(),
  awayFlag: text("away_flag").notNull(),
  homeScore: integer("home_score").default(0),
  awayScore: integer("away_score").default(0),
  status: text("status").notNull(), // 'live' | 'upcoming' | 'finished'
  matchTime: text("match_time").notNull(),
  minute: text("minute"),
  stadium: text("stadium").notNull(),
  prizePool: text("prize_pool").notNull(),
  heroImage: text("hero_image").notNull(),
  isHot: boolean("is_hot").default(false),
  predictionsCount: integer("predictions_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Predictions table
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  matchId: integer("match_id").references(() => matches.id),
  predictedHome: integer("predicted_home").notNull(),
  predictedAway: integer("predicted_away").notNull(),
  pointsEarned: integer("points_earned").default(0),
  coinsEarned: integer("coins_earned").default(0),
  status: text("status").default("pending"), // 'pending' | 'won' | 'lost' | 'exact'
  createdAt: timestamp("created_at").defaultNow(),
});

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctOption: integer("correct_option").notNull(),
  difficulty: text("difficulty").notNull(), // 'ساده' | 'متوسط' | 'سخت'
  coinReward: integer("coin_reward").notNull(),
  xpReward: integer("xp_reward").notNull(),
  category: text("category").notNull(),
  timeLimitSeconds: integer("time_limit_seconds").default(15),
});

// Video Challenges table
export const videoChallenges = pgTable("video_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  thumbnail: text("thumbnail").notNull(),
  videoUrl: text("video_url").notNull(),
  duration: text("duration").notNull(),
  viewsCount: text("views_count").notNull(),
  coinReward: integer("coin_reward").notNull(),
  questionAtSecond: integer("question_at_second").default(10),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctOption: integer("correct_option").notNull(),
});

// User profile & stats table
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  phoneMasked: text("phone_masked").notNull(),
  avatar: text("avatar").notNull(),
  coins: integer("coins").default(1250),
  xp: integer("xp").default(3400),
  rank: integer("rank").default(12),
  level: integer("level").default(4),
  predictionsCount: integer("predictions_count").default(18),
  correctPredictions: integer("correct_predictions").default(12),
  dailyBonusClaimed: boolean("daily_bonus_claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaderboard items table
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  rank: integer("rank").notNull(),
  username: text("username").notNull(),
  phoneMasked: text("phone_masked").notNull(),
  points: integer("points").notNull(),
  coins: integer("coins").notNull(),
  avatar: text("avatar").notNull(),
  badgeTitle: text("badge_title").notNull(),
  badgeColor: text("badge_color").notNull(),
  trend: text("trend").default("same"), // 'up' | 'down' | 'same'
  period: text("period").default("weekly"), // 'weekly' | 'monthly' | 'live'
});

// Rewards Store table
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  coinCost: integer("coin_cost").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  stock: integer("stock").notNull(),
  badge: text("badge"),
});

// Live Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id"),
  username: text("username").notNull(),
  phoneMasked: text("phone_masked").notNull(),
  message: text("message").notNull(),
  teamBadge: text("team_badge"),
  isVip: boolean("is_vip").default(false),
  timestamp: text("timestamp").notNull(),
});
