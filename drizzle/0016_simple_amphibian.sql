CREATE TABLE `documentVault` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL,
	`fileUrl` text NOT NULL,
	`storageKey` varchar(255) NOT NULL,
	`extractedData` text,
	`documentDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documentVault_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trustedContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`relationship` varchar(64) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320),
	`notifyFraud` boolean NOT NULL DEFAULT true,
	`notifySuspicious` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trustedContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`simplifiedMode` boolean NOT NULL DEFAULT false,
	`voiceProfile` varchar(32) NOT NULL DEFAULT 'pt-BR-natural',
	`voiceSpeed` varchar(10) NOT NULL DEFAULT '1.0',
	`emailNotifications` boolean NOT NULL DEFAULT true,
	`smsNotifications` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `documentVault` ADD CONSTRAINT `documentVault_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trustedContacts` ADD CONSTRAINT `trustedContacts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD CONSTRAINT `userPreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;