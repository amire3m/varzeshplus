CREATE TABLE `fantasy_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`players` text NOT NULL,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fantasy_teams_user_id_unique` ON `fantasy_teams` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_fantasy_user` ON `fantasy_teams` (`user_id`);