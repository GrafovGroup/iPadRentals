CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`kind` text NOT NULL,
	`locale` text NOT NULL,
	`name` text,
	`company` text,
	`email` text,
	`phone` text,
	`payload` text NOT NULL,
	`notification_status` text DEFAULT 'unconfigured' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enquiries_request_key_unique` ON `enquiries` (`request_key`);--> statement-breakpoint
CREATE INDEX `enquiries_created_at_idx` ON `enquiries` (`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limits_expires_at_idx` ON `rate_limits` (`expires_at`);