CREATE TABLE `board_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`role` varchar(160) NOT NULL,
	`bio` text NOT NULL,
	`imageUrl` text NOT NULL DEFAULT (''),
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `board_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`category` varchar(120) NOT NULL,
	`publishedAt` varchar(80) NOT NULL,
	`imageUrl` text NOT NULL DEFAULT (''),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`suggestionEnabled` int NOT NULL DEFAULT 0,
	`suggestionFormUrl` text NOT NULL DEFAULT (''),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `community_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`businessName` varchar(180) NOT NULL DEFAULT '',
	`category` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text NOT NULL DEFAULT '',
	`phone` varchar(40) NOT NULL DEFAULT '',
	`whatsapp` int NOT NULL DEFAULT 0,
	`facebookUrl` text NOT NULL DEFAULT '',
	`instagramUrl` text NOT NULL DEFAULT '',
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_services_id` PRIMARY KEY(`id`)
);
