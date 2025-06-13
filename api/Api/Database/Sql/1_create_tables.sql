CREATE TABLE IF NOT EXISTS `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(128) NOT NULL,
    `password` VARCHAR(128) NOT NULL,
    `created` DATETIME NOT NULL,
    `updated` DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS `logins` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `identifier` VARCHAR(128) DEFAULT NULL,
    `encrypted_password` VARCHAR(2048) DEFAULT NULL,
    `url` VARCHAR(128) DEFAULT NULL,
    `notes` VARCHAR(2048) DEFAULT NULL,
    `created` DATETIME NOT NULL,
    `updated` DATETIME DEFAULT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `tags` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,
    `created` DATETIME NOT NULL,
    `updated` DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS `login_tagsloginsusers` (
    `login_id` INT NOT NULL,
    `tag_id` INT NOT NULL,
    PRIMARY KEY (`login_id`, `tag_id`),
    FOREIGN KEY (`login_id`) REFERENCES `logins`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
);