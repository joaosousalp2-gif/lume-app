CREATE TABLE `aiRecommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('economia','investimento','fraude','planejamento') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('baixa','media','alta') NOT NULL DEFAULT 'media',
	`status` enum('novo','visualizado','implementado','descartado') NOT NULL DEFAULT 'novo',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiRecommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` enum('login','logout','2fa_enabled','2fa_disabled','password_changed','data_accessed','data_modified') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`details` text,
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `encryptedFields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fieldKey` varchar(255) NOT NULL,
	`encryptedValue` text NOT NULL,
	`encryptionVersion` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `encryptedFields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `twoFAMethods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`method` enum('email','sms','authenticator') NOT NULL,
	`isEnabled` int NOT NULL DEFAULT 0,
	`phoneNumber` varchar(255),
	`secret` varchar(255),
	`backupCodes` text,
	`backupCodesRemaining` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `twoFAMethods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aiRecommendations` ADD CONSTRAINT `aiRecommendations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `encryptedFields` ADD CONSTRAINT `encryptedFields_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `twoFAMethods` ADD CONSTRAINT `twoFAMethods_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;