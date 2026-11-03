USE `fit-planner`;

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `trial_start` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `trial_end` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `subscription_status` ENUM('trial', 'active', 'expired') NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS `subscription_end` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `subscription_start` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `needs_onboarding` TINYINT(1) NOT NULL DEFAULT 0;

UPDATE `users`
SET
  `trial_start` = COALESCE(`trial_start`, CURRENT_TIMESTAMP),
  `trial_end` = COALESCE(`trial_end`, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY)),
  `subscription_status` = CASE
    WHEN `subscription_end` > CURRENT_TIMESTAMP THEN 'active'
    WHEN COALESCE(`trial_end`, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY)) > CURRENT_TIMESTAMP THEN 'trial'
    ELSE 'expired'
  END
WHERE `role` <> 'admin';

UPDATE `users`
SET `subscription_status` = 'active'
WHERE `role` = 'admin';

CREATE TABLE IF NOT EXISTS `payments` (
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

ALTER TABLE `payments`
  ADD COLUMN IF NOT EXISTS `proof_image` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `subscription_start` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `subscription_end` DATETIME NULL,
  MODIFY COLUMN `reference_no` VARCHAR(100) NULL;

CREATE TABLE IF NOT EXISTS `auth_tokens` (
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
