CREATE TABLE `financialGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`targetAmount` varchar(20) NOT NULL,
	`currentAmount` varchar(20) NOT NULL DEFAULT '0',
	`category` varchar(64),
	`targetDate` varchar(10),
	`priority` enum('baixa','media','alta') NOT NULL DEFAULT 'media',
	`status` enum('ativa','concluida','cancelada') NOT NULL DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `financialGoals` ADD CONSTRAINT `financialGoals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;