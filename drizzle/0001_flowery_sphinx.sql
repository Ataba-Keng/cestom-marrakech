CREATE TABLE `gallery_albums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`category` varchar(120) NOT NULL,
	`eventDate` varchar(80) NOT NULL,
	`location` varchar(120) NOT NULL,
	`imageUrl` text NOT NULL,
	`imageAlt` varchar(255) NOT NULL,
	`photoCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_albums_id` PRIMARY KEY(`id`)
);
