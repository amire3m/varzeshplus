import { pgTable, serial, text, integer, timestamp, boolean, varchar, pgEnum } from "drizzle-orm/pg-core";

// Match status enum
export const matchStatusEnum = pgEnum("match_status", ["upcoming", "live", "finished"]);

// Game type enum
export const gameTypeEnum = pgEnum("game_type", ["prediction", "quiz", "video_marathon"]);

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  homeTeam: varchar("home_team", { length: 100 }).notNull(),
  homeTeamLogo: text("home_team_logo"),
  awayTeam: varchar("away_team", { length: 100 }).notNull(),
  awayTeamLogo: text("away_team_logo"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  status: matchStatusEnum("status").notNull().default("upcoming"),
  league: varchar("league", { length: 100 }).notNull(),
  kickoff: timestamp("kickoff").notNull(),
  minute: integer("minute"),
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: gameTypeEnum("type").notNull(),
  prize: varchar("prize", { length: 100 }),
  participantCount: integer("participant_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  endsAt: timestamp("ends_at"),
  image: text("image"),
});

// Leaderboard table
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  rank: integer("rank").notNull(),
  username: varchar("username", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  points: integer("points").notNull().default(0),
  avatar: text("avatar"),
});

// Live scoreboard entries
export const scoreboard = pgTable("scoreboard", {
  id: serial("id").primaryKey(),
  homeTeam: varchar("home_team", { length: 100 }).notNull(),
  awayTeam: varchar("away_team", { length: 100 }).notNull(),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  minute: integer("minute").notNull().default(0),
  league: varchar("league", { length: 100 }).notNull(),
  isLive: boolean("is_live").notNull().default(true),
});

// Quick links
export const quickLinks = pgTable("quick_links", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  href: varchar("href", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  order: integer("order").notNull().default(0),
});
