-- Migration: separate session date from start/end times
ALTER TABLE sessions ADD COLUMN session_date DATE NULL;
ALTER TABLE sessions MODIFY COLUMN start_time DATETIME NOT NULL;
ALTER TABLE sessions MODIFY COLUMN end_time DATETIME NOT NULL;

UPDATE sessions SET session_date = DATE(start_time);
UPDATE sessions SET start_time = CAST(start_time AS TIME);
UPDATE sessions SET end_time = CAST(end_time AS TIME);

ALTER TABLE sessions MODIFY COLUMN session_date DATE NOT NULL;
ALTER TABLE sessions MODIFY COLUMN start_time TIME NOT NULL;
ALTER TABLE sessions MODIFY COLUMN end_time TIME NOT NULL;
