-- Add archived columns and remove created_at from sessions table
-- Run this migration if you get "Unknown column 's1_0.archived'" errors

ALTER TABLE sessions 
  DROP COLUMN IF EXISTS created_at,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT NULL;
