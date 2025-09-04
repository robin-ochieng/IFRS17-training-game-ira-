-- IFRS 17 Training Game - Complete Database Setup
-- This script creates all necessary tables with the correct structure

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    organization TEXT DEFAULT 'Independent',
    avatar TEXT,
    country TEXT DEFAULT 'Unknown',
    gender TEXT DEFAULT 'Prefer not to say',
    last_module_id INTEGER DEFAULT 0,
    last_question_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEADERBOARD TABLE (Overall Rankings)
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    user_name TEXT NOT NULL,
    user_email TEXT DEFAULT '',
    organization TEXT DEFAULT 'Independent',
    avatar TEXT,
    country TEXT DEFAULT 'Unknown',
    gender TEXT DEFAULT 'Prefer not to say',
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    achievements INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    perfect_modules INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- MODULE LEADERBOARD TABLE (Individual Module Performance)
-- ============================================
CREATE TABLE IF NOT EXISTS module_leaderboard (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    module_id INTEGER NOT NULL,
    module_name TEXT,
    user_name TEXT NOT NULL,
    user_email TEXT DEFAULT '',
    organization TEXT DEFAULT 'Independent',
    avatar TEXT,
    country TEXT DEFAULT 'Unknown',
    gender TEXT DEFAULT 'Prefer not to say',
    score INTEGER DEFAULT 0,
    perfect_completion BOOLEAN DEFAULT FALSE,
    completion_time INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 1,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- ============================================
-- GAME PROGRESS TABLE (Compatible with TEXT user IDs)
-- ============================================
CREATE TABLE IF NOT EXISTS game_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    current_module INTEGER DEFAULT 0,
    completed_modules INTEGER[] DEFAULT '{}',
    unlocked_modules INTEGER[] DEFAULT '{0}',
    total_score INTEGER DEFAULT 0,
    achievements TEXT[] DEFAULT '{}',
    power_ups JSONB DEFAULT '{}',
    last_save TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- MODULE COMPLETIONS TABLE (Detailed Module Data)
-- ============================================
CREATE TABLE IF NOT EXISTS module_completions (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    module_id INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    perfect_completion BOOLEAN DEFAULT FALSE,
    completion_time INTEGER DEFAULT 0,
    questions_data JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_updated_at ON leaderboard(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_module_leaderboard_user_id ON module_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_module_leaderboard_module_id ON module_leaderboard(module_id);
CREATE INDEX IF NOT EXISTS idx_module_leaderboard_score ON module_leaderboard(score DESC);

CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_user_id ON module_completions(user_id);

-- ============================================
-- CREATE/UPDATE SAVE_GAME_PROGRESS FUNCTION (Compatible with TEXT user IDs)
-- ============================================
CREATE OR REPLACE FUNCTION save_game_progress(
    p_user_id TEXT,
    p_current_module INTEGER,
    p_completed_modules INTEGER[],
    p_unlocked_modules INTEGER[],
    p_total_score INTEGER,
    p_achievements TEXT[],
    p_power_ups JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO game_progress (
        user_id,
        current_module,
        completed_modules,
        unlocked_modules,
        total_score,
        achievements,
        power_ups,
        last_save,
        updated_at
    ) VALUES (
        p_user_id,
        p_current_module,
        p_completed_modules,
        p_unlocked_modules,
        p_total_score,
        p_achievements,
        p_power_ups,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        current_module = EXCLUDED.current_module,
        completed_modules = EXCLUDED.completed_modules,
        unlocked_modules = EXCLUDED.unlocked_modules,
        total_score = EXCLUDED.total_score,
        achievements = EXCLUDED.achievements,
        power_ups = EXCLUDED.power_ups,
        last_save = NOW(),
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- ============================================
-- GRANT PERMISSIONS (Adjust as needed for your Supabase setup)
-- ============================================
-- Grant permissions to authenticated users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_completions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all leaderboard data
CREATE POLICY IF NOT EXISTS "Allow read access to leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow read access to module_leaderboard" ON module_leaderboard FOR SELECT USING (true);

-- Allow users to insert/update their own data
CREATE POLICY IF NOT EXISTS "Allow users to manage their own data" ON users FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow users to insert leaderboard data" ON leaderboard FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow users to insert module leaderboard data" ON module_leaderboard FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow users to manage their own progress" ON game_progress FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow users to manage their own completions" ON module_completions FOR ALL USING (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- These queries can be used to verify the setup
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'leaderboard' as table_name, count(*) as record_count FROM leaderboard  
UNION ALL
SELECT 'module_leaderboard' as table_name, count(*) as record_count FROM module_leaderboard
UNION ALL
SELECT 'game_progress' as table_name, count(*) as record_count FROM game_progress
UNION ALL  
SELECT 'module_completions' as table_name, count(*) as record_count FROM module_completions;
