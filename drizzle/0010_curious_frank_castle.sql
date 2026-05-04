CREATE TABLE `budgetLimitExceededNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`budgetId` int NOT NULL,
	`category` varchar(64) NOT NULL,
	`month` varchar(7) NOT NULL,
	`exceededAt` timestamp NOT NULL DEFAULT (now()),
	`spentAmount` varchar(20) NOT NULL,
	`limitAmount` varchar(20) NOT NULL,
	`percentage` int NOT NULL,
	`webhookDispatched` boolean NOT NULL DEFAULT false,
	`dispatchedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgetLimitExceededNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `budgetLimitExceededNotifications` ADD CONSTRAINT `budgetLimitExceededNotifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `budgetLimitExceededNotifications` ADD CONSTRAINT `budgetLimitExceededNotifications_budgetId_budgets_id_fk` FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON DELETE no action ON UPDATE no action;