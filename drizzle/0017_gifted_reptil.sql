ALTER TABLE `launches` ADD `source` varchar(32) DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `launches` ADD `externalId` varchar(128);