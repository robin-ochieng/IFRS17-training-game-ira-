-- Migration: Add last_module_id to users table for persistence
-- Purpose: Add columns to track user's last completed module for resume functionality

BEGIN;

-- Add last_module_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_module_id INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_question_index INTEGER DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_last_module ON users(last_module_id);

-- Update existing users to have default values if NULL
UPDATE users SET last_module_id = 0 WHERE last_module_id IS NULL;
UPDATE users SET last_question_index = 0 WHERE last_question_index IS NULL;

COMMIT;
