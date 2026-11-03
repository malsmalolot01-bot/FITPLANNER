-- Run this once in phpMyAdmin if fit-planner already contains users/data.
USE `fit-planner`;

CREATE TABLE IF NOT EXISTS `user_profiles` (
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

CREATE TABLE IF NOT EXISTS `customer_profiles` (
  `user_id` CHAR(36) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `profile_photo` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_customer_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `medical_histories` (
  `user_id` CHAR(36) NOT NULL,
  `has_conditions` TINYINT(1) NOT NULL DEFAULT 0,
  `conditions` JSON NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_medical_histories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE `admin_activity_logs`
  MODIFY `admin_id` CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS `user_id` CHAR(36) NULL AFTER `admin_id`;

ALTER TABLE `admin_activity_logs`
  ADD CONSTRAINT `fk_admin_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;