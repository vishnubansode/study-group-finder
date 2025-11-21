-- Migration: add explicit end_time to sessions
-- Run this after deploying schema changes.

ALTER TABLE sessions ADD COLUMN end_time DATETIME NULL;

UPDATE sessions SET end_time = DATE_ADD(start_time, INTERVAL 1 HOUR) WHERE end_time IS NULL;

ALTER TABLE sessions MODIFY COLUMN end_time DATETIME NOT NULL;
