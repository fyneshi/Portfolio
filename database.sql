-- Portfolio database setup
-- Local (XAMPP): import this whole file in phpMyAdmin.
-- Online hosting: the database is usually created from the hosting panel,
-- so select your database and import only the CREATE TABLE part.

CREATE DATABASE IF NOT EXISTS portfolio_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

CREATE TABLE IF NOT EXISTS contact_messages (
    id        INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(100) NOT NULL,
    message   TEXT         NOT NULL,
    date_sent TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
