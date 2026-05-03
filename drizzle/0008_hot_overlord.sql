CREATE TABLE `userIntegrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('twilio','sendgrid','stripe','openai') NOT NULL,
	`name` varchar(255) NOT NULL,
	`credentials` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userIntegrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `userIntegrations` ADD CONSTRAINT `userIntegrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;