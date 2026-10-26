CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY,
	`userId` integer NOT NULL UNIQUE,
	`image` text,
	`username` text NOT NULL UNIQUE,
	`bio` text,
	`displayName` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	CONSTRAINT `fk_profiles_userId_accounts_id_fk` FOREIGN KEY (`userId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY,
	`userId` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	CONSTRAINT `fk_sessions_userId_accounts_id_fk` FOREIGN KEY (`userId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE
);
