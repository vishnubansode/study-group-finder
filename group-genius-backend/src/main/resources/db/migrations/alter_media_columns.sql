-- Backup your database before running these statements.
-- Run as a DB admin/user with ALTER privileges.

-- For MySQL/MariaDB:
ALTER TABLE users MODIFY COLUMN profile_image_url TEXT;
ALTER TABLE chat_messages MODIFY COLUMN file_url TEXT;

-- For PostgreSQL (if used):
-- ALTER TABLE users ALTER COLUMN profile_image_url TYPE TEXT;
-- ALTER TABLE chat_messages ALTER COLUMN file_url TYPE TEXT;

-- Notes:
-- 1) If your columns are named differently in your DB (check schema.sql), adjust the column names accordingly.
-- 2) This migration is safe and non-destructive: it expands column size only.
-- 3) Run in maintenance window if you have high traffic to avoid lock contention.
