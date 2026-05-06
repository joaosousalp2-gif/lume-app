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
CREATE TABLE `userWebhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`eventType` enum('fraud_detected','budget_limit_exceeded','large_transaction','unusual_activity','security_alert','recommendation_available') NOT NULL,
	`notificationMethod` enum('sms','email') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userWebhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`userId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`eventData` text NOT NULL,
	`deliveryStatus` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`deliveryAttempts` int NOT NULL DEFAULT 0,
	`lastAttemptAt` timestamp,
	`sentAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhookEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `budgetLimitExceededNotifications` ADD CONSTRAINT `budgetLimitExceededNotifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `budgetLimitExceededNotifications` ADD CONSTRAINT `budgetLimitExceededNotifications_budgetId_budgets_id_fk` FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userWebhooks` ADD CONSTRAINT `userWebhooks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhookEvents` ADD CONSTRAINT `webhookEvents_webhookId_userWebhooks_id_fk` FOREIGN KEY (`webhookId`) REFERENCES `userWebhooks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhookEvents` ADD CONSTRAINT `webhookEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;