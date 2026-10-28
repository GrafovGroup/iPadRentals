CREATE TABLE `funnel_counts` (
	`key` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`page` text NOT NULL,
	`locale` text NOT NULL,
	`event` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `funnel_day_idx` ON `funnel_counts` (`day`);--> statement-breakpoint
ALTER TABLE `enquiries` ADD `lead_status` text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `follow_up_note` text;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `notification_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `notification_last_attempt` integer;