-- FitPlanner database for XAMPP / MariaDB
-- Import this file in phpMyAdmin.

CREATE DATABASE IF NOT EXISTS `fit-planner`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `fit-planner`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `auth_tokens`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `admin_activity_logs`;
DROP TABLE IF EXISTS `customer_profiles`;
DROP TABLE IF EXISTS `medical_histories`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `progress_measurements`;
DROP TABLE IF EXISTS `workout_set_logs`;
DROP TABLE IF EXISTS `workout_sessions`;
DROP TABLE IF EXISTS `plan_exercises`;
DROP TABLE IF EXISTS `exercises`;
DROP TABLE IF EXISTS `workout_plans`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `first_name` VARCHAR(80) NOT NULL,
  `last_name` VARCHAR(80) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `trial_start` DATETIME NULL,
  `trial_end` DATETIME NULL,
  `subscription_status` ENUM('trial', 'active', 'expired') NOT NULL DEFAULT 'trial',
  `subscription_end` DATETIME NULL,
  `subscription_start` DATETIME NULL,
  `needs_onboarding` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role_status` (`role`, `status`)
) ENGINE=InnoDB;

CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `plan` ENUM('1_month', '2_months', '1_year') NOT NULL,
  `days` SMALLINT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `method` ENUM('gcash') NOT NULL DEFAULT 'gcash',
  `reference_no` VARCHAR(100) NULL,
  `proof_image` VARCHAR(255) NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` DATETIME NULL,
  `subscription_start` DATETIME NULL,
  `subscription_end` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payments_reference_no` (`reference_no`),
  KEY `idx_payments_user_status` (`user_id`, `status`),
  KEY `idx_payments_status_created` (`status`, `created_at`),
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `auth_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auth_tokens_hash` (`token_hash`),
  KEY `idx_auth_tokens_user_expiry` (`user_id`, `expires_at`),
  CONSTRAINT `fk_auth_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `user_profiles` (
  `user_id` CHAR(36) NOT NULL,
  `height_cm` DECIMAL(5,2) NULL,
  `weight_kg` DECIMAL(5,2) NULL,
  `bmi` DECIMAL(4,1) NULL,
  `bmi_category` VARCHAR(30) NULL,
  `goal` VARCHAR(40) NOT NULL DEFAULT 'Fitness',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `customer_profiles` (
  `user_id` CHAR(36) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `profile_photo` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_customer_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `medical_histories` (
  `user_id` CHAR(36) NOT NULL,
  `has_conditions` TINYINT(1) NOT NULL DEFAULT 0,
  `conditions` JSON NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_medical_histories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `workout_plans` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_plans_user_active` (`user_id`, `is_active`),
  CONSTRAINT `fk_plans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `exercises` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `category` VARCHAR(80) NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_exercises_name` (`name`)
) ENGINE=InnoDB;

CREATE TABLE `plan_exercises` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `plan_id` BIGINT UNSIGNED NOT NULL,
  `exercise_id` BIGINT UNSIGNED NOT NULL,
  `workout_day` VARCHAR(80) NOT NULL,
  `sort_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `target_sets` SMALLINT UNSIGNED NOT NULL DEFAULT 3,
  `target_reps` SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  `rest_seconds` SMALLINT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plan_exercise_order` (`plan_id`, `workout_day`, `sort_order`),
  KEY `idx_plan_exercise_exercise` (`exercise_id`),
  CONSTRAINT `fk_plan_exercises_plan` FOREIGN KEY (`plan_id`) REFERENCES `workout_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plan_exercises_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `workout_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `plan_id` BIGINT UNSIGNED NULL,
  `workout_day` VARCHAR(80) NOT NULL,
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  `status` ENUM('in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'in_progress',
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_date` (`user_id`, `started_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sessions_plan` FOREIGN KEY (`plan_id`) REFERENCES `workout_plans` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `workout_set_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `exercise_id` BIGINT UNSIGNED NOT NULL,
  `set_number` SMALLINT UNSIGNED NOT NULL,
  `reps_completed` SMALLINT UNSIGNED NULL,
  `weight_kg` DECIMAL(6,2) NULL,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session_exercise_set` (`session_id`, `exercise_id`, `set_number`),
  CONSTRAINT `fk_set_logs_session` FOREIGN KEY (`session_id`) REFERENCES `workout_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_set_logs_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `progress_measurements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` CHAR(36) NOT NULL,
  `measured_on` DATE NOT NULL,
  `weight_kg` DECIMAL(5,2) NULL,
  `height_cm` DECIMAL(5,2) NULL,
  `bmi` DECIMAL(4,1) NULL,
  `notes` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_progress_user_date` (`user_id`, `measured_on`),
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `admin_activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` CHAR(36) NULL,
  `user_id` CHAR(36) NULL,
  `action` VARCHAR(80) NOT NULL,
  `target_user_id` CHAR(36) NULL,
  `details` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_logs_created` (`created_at`),
  CONSTRAINT `fk_admin_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_admin_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_admin_logs_target` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO `exercises` (`name`, `category`) VALUES
  ('Bench Press', 'Upper Body'),
  ('Bicep Curls', 'Upper Body'),
  ('Shoulder Press', 'Upper Body'),
  ('Tricep Dips', 'Upper Body'),
  ('Deadlift', 'Lower Body'),
  ('Lat Pulldown', 'Pull'),
  ('Leg Press', 'Lower Body'),
  ('Calf Raises', 'Lower Body');

-- Create an admin through the API so password_hash uses PHP password_hash().
-- Example after creating the first account:
-- UPDATE users SET role = 'admin', subscription_status = 'active' WHERE email = 'admin@example.com';