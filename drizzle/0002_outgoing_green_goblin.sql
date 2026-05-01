CREATE TABLE `categorizationRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pattern` varchar(255) NOT NULL,
	`type` enum('receita','despesa') NOT NULL,
	`category` varchar(64) NOT NULL,
	`priority` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`timesApplied` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categorizationRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `categorizationRules` ADD CONSTRAINT `categorizationRules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;