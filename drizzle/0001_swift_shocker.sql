CREATE TABLE `score_predictions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`fixture_key` text NOT NULL,
	`league` text NOT NULL,
	`home` text NOT NULL,
	`away` text NOT NULL,
	`match_date` text,
	`pred_home` integer NOT NULL,
	`pred_away` integer NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_prediction` ON `score_predictions` (`user_id`,`fixture_key`);--> statement-breakpoint
CREATE INDEX `idx_pred_user` ON `score_predictions` (`user_id`);