CREATE TABLE `chatMessageFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messageContent` text NOT NULL,
	`messageRole` enum('user','assistant') NOT NULL,
	`messageTimestamp` timestamp NOT NULL,
	`rating` enum('useful','not_useful') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatMessageFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chatMessageFeedback` ADD CONSTRAINT `chatMessageFeedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;