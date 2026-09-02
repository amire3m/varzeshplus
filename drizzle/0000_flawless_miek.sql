CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text NOT NULL,
	`program_id` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_username_unique` ON `admin_users` (`username`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` integer,
	`actor_name` text,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` integer,
	`program_id` integer,
	`detail` text,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `badges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`icon` text,
	`color` text DEFAULT '#2ECC71' NOT NULL,
	`condition` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `badges_code_unique` ON `badges` (`code`);--> statement-breakpoint
CREATE TABLE `censor_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`live_event_id` integer NOT NULL,
	`action` text NOT NULL,
	`reason` text,
	`operator_id` integer NOT NULL,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `game_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participation_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`selected_option` integer,
	`is_correct` integer,
	`answered_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `game_participations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`raw_score` integer DEFAULT 0 NOT NULL,
	`weighted_score` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'completed' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_participation` ON `game_participations` (`game_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `game_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`question_type` text DEFAULT 'multiple_choice' NOT NULL,
	`text` text NOT NULL,
	`options` text NOT NULL,
	`correct_option` integer,
	`time_limit_seconds` integer DEFAULT 20 NOT NULL,
	`points` integer DEFAULT 100 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_questions_game` ON `game_questions` (`game_id`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`game_type` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`program_id` integer,
	`event_id` integer,
	`cover_image` text,
	`prize` text,
	`starts_at` text,
	`ends_at` text,
	`result_note` text,
	`result_entered_by` integer,
	`result_entered_at` text,
	`created_by` integer NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_games_status` ON `games` (`status`);--> statement-breakpoint
CREATE INDEX `idx_games_program` ON `games` (`program_id`);--> statement-breakpoint
CREATE TABLE `live_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`hls_url` text,
	`status` text DEFAULT 'idle' NOT NULL,
	`commentator_active` integer DEFAULT false NOT NULL,
	`censor_active` integer DEFAULT false NOT NULL,
	`delay_buffer_seconds` integer DEFAULT 30 NOT NULL,
	`started_at` text,
	`ended_at` text
);
--> statement-breakpoint
CREATE TABLE `manager_inbox` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`save_id` integer NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`category` text DEFAULT 'news' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_inbox_save` ON `manager_inbox` (`save_id`);--> statement-breakpoint
CREATE TABLE `manager_matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`save_id` integer NOT NULL,
	`week` integer NOT NULL,
	`home_team` text NOT NULL,
	`away_team` text NOT NULL,
	`home_score` integer,
	`away_score` integer,
	`events` text,
	`status` text DEFAULT 'upcoming' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_mm_save_week` ON `manager_matches` (`save_id`,`week`);--> statement-breakpoint
CREATE TABLE `manager_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`save_id` integer NOT NULL,
	`name` text NOT NULL,
	`position` text NOT NULL,
	`age` integer NOT NULL,
	`rating` integer NOT NULL,
	`value` integer NOT NULL,
	`salary` integer NOT NULL,
	`is_starter` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_mp_save` ON `manager_players` (`save_id`);--> statement-breakpoint
CREATE TABLE `manager_saves` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`team_slug` text NOT NULL,
	`team_name` text NOT NULL,
	`season` integer DEFAULT 1 NOT NULL,
	`week` integer DEFAULT 1 NOT NULL,
	`budget` integer DEFAULT 5000000 NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`draws` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`goals_for` integer DEFAULT 0 NOT NULL,
	`goals_against` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_manager_user` ON `manager_saves` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_manager_team` ON `manager_saves` (`team_slug`);--> statement-breakpoint
CREATE TABLE `news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`body` text,
	`cover_image` text,
	`category` text DEFAULT 'general' NOT NULL,
	`program_id` integer,
	`is_breaking` integer DEFAULT false NOT NULL,
	`published_at` text,
	`scheduled_at` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`title` text NOT NULL,
	`body` text,
	`related_type` text,
	`related_id` integer,
	`sent_at` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by` integer
);
--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` text NOT NULL,
	`consumed` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_otp_phone` ON `otp_codes` (`phone`);--> statement-breakpoint
CREATE TABLE `programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`logo` text,
	`on_air_day` text,
	`on_air_time` text,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `programs_slug_unique` ON `programs` (`slug`);--> statement-breakpoint
CREATE TABLE `score_weights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_type` text NOT NULL,
	`max_possible_raw` integer DEFAULT 1000 NOT NULL,
	`weight` real DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`kind` text DEFAULT 'user' NOT NULL,
	`admin_id` integer,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sport_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`league` text NOT NULL,
	`home_team` text NOT NULL,
	`away_team` text NOT NULL,
	`home_team_logo` text,
	`away_team_logo` text,
	`home_score` integer,
	`away_score` integer,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`start_time` text NOT NULL,
	`stadium` text,
	`is_hot` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`badge_id` integer NOT NULL,
	`awarded_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_badge` ON `user_badges` (`user_id`,`badge_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text NOT NULL,
	`display_name` text,
	`avatar` text,
	`points` integer DEFAULT 0 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`is_banned` integer DEFAULT false NOT NULL,
	`followed_teams` text,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_users_points` ON `users` (`points`);