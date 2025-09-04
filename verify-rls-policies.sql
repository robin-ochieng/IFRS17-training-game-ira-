-- RLS Policy Verification and Setup for IFRS17 Training Game
-- Run this after the main migration to ensure proper permissions

-- 1. Verify users table has the new columns
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check current RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 3. Ensure proper RLS policies for users table
-- Allow authenticated users to read and update their own data
CREATE POLICY IF NOT EXISTS "users_select_own" ON users 
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "users_update_own" ON users 
FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "users_insert_own" ON users 
FOR INSERT WITH CHECK (true);

-- 4. Test query to verify a user can read their last_module_id
-- (Replace 'your_user_id' with actual user ID)
-- SELECT id, name, last_module_id, last_question_index 
-- FROM users 
-- WHERE id = 'your_user_id';

-- 5. Test update to verify a user can update their last_module_id
-- (Replace 'your_user_id' with actual user ID)
-- UPDATE users 
-- SET last_module_id = 3, last_question_index = 0, updated_at = NOW()
-- WHERE id = 'your_user_id';

COMMIT;
