-- FitPlanner: payment proof (screenshot) instead of GCash reference number
-- Run this on the FitPlanner database (select the database first in phpMyAdmin).

ALTER TABLE payments ADD COLUMN proof_image VARCHAR(255) NULL AFTER reference_no;
ALTER TABLE payments MODIFY reference_no VARCHAR(100) NULL;
