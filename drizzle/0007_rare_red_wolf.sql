ALTER TABLE `users` ADD `twoFARequired` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFAVerified` boolean DEFAULT false NOT NULL;