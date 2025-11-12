-- Migration: migrate existing sessions.end_time -> sessions.duration_days
-- Run this on your MySQL database connected to the application.
-- This script performs a safe two-step migration:
-- 1) Make the existing end_time column nullable so inserts won't fail while we migrate.
-- 2) Add/ensure duration_days exists, populate it from start_time/end_time (rounded up to days),
--    then remove the legacy end_time column when ready.

-- WARNING: Review and run these statements in a transaction or on a test copy first.

-- 0) Quick safety: set SQL mode to allow non-strict if necessary (optional)
-- SET SESSION sql_mode = '';

-- 1) Make legacy column nullable to avoid insert failures while migrating
-- (this is safe and non-destructive)
ALTER TABLE sessions MODIFY COLUMN end_time DATETIME DEFAULT NULL;

-- 2) Ensure duration_days exists (default 1)
-- NOTE: Some MySQL versions support ADD COLUMN IF NOT EXISTS. If yours doesn't, run
-- the ADD COLUMN only if it doesn't already exist.
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration_days INT NOT NULL DEFAULT 1;

-- 3) Populate duration_days from existing start_time/end_time values for rows that have end_time
UPDATE sessions
SET duration_days = GREATEST(1, CEILING(TIMESTAMPDIFF(SECOND, start_time, end_time) / 86400.0))
WHERE end_time IS NOT NULL;

-- 4) Optional: verify a sample of rows
-- SELECT id, start_time, end_time, duration_days FROM sessions LIMIT 50;

-- 5) Once you've verified correctness, drop the legacy column
-- ALTER TABLE sessions DROP COLUMN end_time;

-- 6) (Optional) After dropping legacy column, make sure duration_days has the expected constraints
-- ALTER TABLE sessions MODIFY COLUMN duration_days INT NOT NULL DEFAULT 1;

-- 7) If you changed sql_mode earlier, restore it as needed.
-- SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- End of migration
