CREATE TABLE `launches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('receita','despesa') NOT NULL,
	`date` varchar(10) NOT NULL,
	`category` varchar(64) NOT NULL,
	`value` varchar(20) NOT NULL,
	`description` text,
	`recurrence` varchar(20) NOT NULL DEFAULT 'Única',
	`endDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `launches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `launches` ADD CONSTRAINT `launches_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;