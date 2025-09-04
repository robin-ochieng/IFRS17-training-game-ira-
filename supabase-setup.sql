-- SQL Script to create IFRS 17 Training Game leaderboard tables
-- Run this in your Supabase SQL Editor

-- =====================================================
-- MAIN LEADERBOARD TABLE (Overall Scores)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT DEFAULT '',
    organization TEXT DEFAULT 'Independent',
    avatar TEXT DEFAULT '',
    country TEXT DEFAULT 'Unknown',
    gender TEXT DEFAULT 'Prefer not to say',
    score INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    achievements INTEGER NOT NULL DEFAULT 0,
    modules_completed INTEGER NOT NULL DEFAULT 0,
    perfect_modules INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT leaderboard_user_id_unique UNIQUE (user_id),
    CONSTRAINT leaderboard_score_positive CHECK (score >= 0),
    CONSTRAINT leaderboard_level_positive CHECK (level >= 1),
    CONSTRAINT leaderboard_achievements_positive CHECK (achievements >= 0),
    CONSTRAINT leaderboard_modules_completed_positive CHECK (modules_completed >= 0),
    CONSTRAINT leaderboard_perfect_modules_positive CHECK (perfect_modules >= 0)
);

-- =====================================================
-- MODULE LEADERBOARD TABLE (Module-specific Scores)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.module_leaderboard (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    module_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT DEFAULT '',
    organization TEXT DEFAULT 'Independent',
    avatar TEXT DEFAULT '',
    country TEXT DEFAULT 'Unknown',
    gender TEXT DEFAULT 'Prefer not to say',
    score INTEGER NOT NULL DEFAULT 0,
    perfect_completion BOOLEAN NOT NULL DEFAULT FALSE,
    completion_time INTEGER, -- in seconds, nullable
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT module_leaderboard_user_module_unique UNIQUE (user_id, module_id),
    CONSTRAINT module_leaderboard_score_positive CHECK (score >= 0),
    CONSTRAINT module_leaderboard_module_id_positive CHECK (module_id >= 0),
    CONSTRAINT module_leaderboard_completion_time_positive CHECK (completion_time IS NULL OR completion_time >= 0)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Main leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON public.leaderboard (score DESC, completed_at ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard (user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_organization ON public.leaderboard (organization);
CREATE INDEX IF NOT EXISTS idx_leaderboard_country ON public.leaderboard (country);

-- Module leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_module_leaderboard_module_score ON public.module_leaderboard (module_id, score DESC, completion_time ASC NULLS LAST, completed_at ASC);
CREATE INDEX IF NOT EXISTS idx_module_leaderboard_user_id ON public.module_leaderboard (user_id);
CREATE INDEX IF NOT EXISTS idx_module_leaderboard_module_id ON public.module_leaderboard (module_id);
CREATE INDEX IF NOT EXISTS idx_module_leaderboard_perfect ON public.module_leaderboard (module_id, perfect_completion, score DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated and anonymous users to read leaderboard data
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.leaderboard
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.module_leaderboard
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow all authenticated and anonymous users to insert/update leaderboard data
-- (In a production environment, you might want to restrict this to authenticated users only)
CREATE POLICY IF NOT EXISTS "Allow public insert access" ON public.leaderboard
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public update access" ON public.leaderboard
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public insert access" ON public.module_leaderboard
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public update access" ON public.module_leaderboard
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to both tables
DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON public.leaderboard;
CREATE TRIGGER update_leaderboard_updated_at
    BEFORE UPDATE ON public.leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_module_leaderboard_updated_at ON public.module_leaderboard;
CREATE TRIGGER update_module_leaderboard_updated_at
    BEFORE UPDATE ON public.module_leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify the tables were created successfully:

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'leaderboard' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'module_leaderboard' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('leaderboard', 'module_leaderboard') AND schemaname = 'public';

-- Check policies
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('leaderboard', 'module_leaderboard');

COMMIT;
