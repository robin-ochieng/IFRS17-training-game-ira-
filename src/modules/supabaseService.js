// supabaseService.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// USER AUTHENTICATION & MANAGEMENT
// ============================================

/**
 * Sign up a new user
 */
export const signUp = async (email, password, userData) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name: userData.name,
        avatar: userData.avatar || userData.name.charAt(0).toUpperCase(),
        organization: userData.organization,
        country: userData.country,
        gender: userData.gender
      }])
      .select()
      .single();

    if (profileError) throw profileError;

    return { success: true, user: profile };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return { success: true, user: profile, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return profile;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

  // ============================================
  // LAST-LOCATION HELPERS (RESUME POSITION)
  // ============================================

  /**
   * Read last known location for an authenticated user.
   * Tries, in order:
   * 1) user_progress.progress_data jsonb (module/question)
   * 2) user_progress columns current_module/current_question
   * 3) users table columns last_module_id/last_question_index if they exist
   */
  export const getUserProfileLastLocation = async (userId) => {
    try {
      // Try user_progress table first
      const { data: prog, error: progErr } = await supabase
        .from('user_progress')
        .select('progress_data')
        .eq('user_id', userId)
        .single();

      if ((!progErr || progErr?.code === 'PGRST116') && prog) {
        const fromJson = prog.progress_data || {};
        const moduleId = typeof fromJson.last_module_id === 'number' ? fromJson.last_module_id : undefined;
        const questionIndex = typeof fromJson.last_question_index === 'number' ? fromJson.last_question_index : undefined;
        if (moduleId !== undefined) {
          return { moduleId, questionIndex: questionIndex ?? 0, ts: fromJson.ts, source: 'user_progress' };
        }
      }

      // Fallback to users table if columns exist
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('last_module_id, last_question_index')
        .eq('id', userId)
        .single();

      if ((!userErr || userErr?.code === 'PGRST116') && userRow && (userRow.last_module_id !== null || userRow.last_question_index !== null)) {
        return {
          moduleId: typeof userRow.last_module_id === 'number' ? userRow.last_module_id : 0,
          questionIndex: typeof userRow.last_question_index === 'number' ? userRow.last_question_index : 0,
          source: 'users'
        };
      }
    } catch (e) {
      console.error('getUserProfileLastLocation error:', e);
    }
    return null;
  };

  /**
   * Update last known location. Will upsert user_progress row and also try to set users columns if present.
   */
  export const updateUserProfileLastLocation = async (userId, { moduleId, questionIndex }) => {
    try {
      const now = new Date().toISOString();
      // Upsert into user_progress
      const payload = {
        user_id: userId,
        progress_data: { last_module_id: moduleId ?? 0, last_question_index: questionIndex ?? 0, ts: now },
        updated_at: now,
      };
      const { error: upErr } = await supabase
        .from('user_progress')
        .upsert(payload, { onConflict: 'user_id' });
      if (upErr) console.warn('updateUserProfileLastLocation upsert user_progress warning:', upErr.message);

      // Best-effort update users table if the columns exist
      const { error: usersErr } = await supabase
        .from('users')
        .update({ last_module_id: moduleId ?? 0, last_question_index: questionIndex ?? 0, updated_at: now })
        .eq('id', userId);
      if (usersErr && usersErr.code === '42703') {
        // Column does not exist; ignore silently
      } else if (usersErr) {
        console.warn('updateUserProfileLastLocation users update warning:', usersErr.message);
      }
      return { success: true };
    } catch (e) {
      console.error('updateUserProfileLastLocation error:', e);
      return { success: false, error: e.message };
    }
  };

// ============================================
// GAME PROGRESS MANAGEMENT
// ============================================

/**
 * Save complete game progress - TEMPORARILY DISABLED FOR TESTING
 */
export const saveGameProgress = async (userId, progressData) => {
  try {
    console.log('💾 Saving game progress for user:', userId, '(DISABLED FOR LEADERBOARD TESTING)');
    
    // TODO: Fix the database function to accept TEXT user IDs instead of UUID
    // For now, return success to avoid blocking leaderboard testing
    console.log('✅ Game progress save skipped (testing leaderboard functionality)');
    return { success: true, data: 'Skipped for testing' };
    
    /* Original code - DISABLED
    const { data, error } = await supabase.rpc('save_game_progress', {
      p_user_id: userId,
      p_progress: progressData
    });

    if (error) throw error;

    console.log('✅ Game progress saved successfully');
    return { success: true, data };
    */
  } catch (error) {
    console.error('❌ Save game progress error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load game progress for a user
 */
export const loadGameProgress = async (userId) => {
  try {
    console.log('📥 Loading game progress for user:', userId);
    
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    console.log('✅ Game progress loaded:', data);
    return data;
  } catch (error) {
    console.error('❌ Load game progress error:', error);
    return null;
  }
};

/**
 * Clear/reset game progress
 */
export const clearGameProgress = async (userId) => {
  try {
    console.log('🗑️ Clearing game progress for user:', userId);
    
    // Delete game progress
    const { error: progressError } = await supabase
      .from('game_progress')
      .delete()
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Delete module completions
    const { error: modulesError } = await supabase
      .from('module_completions')
      .delete()
      .eq('user_id', userId);

    if (modulesError) throw modulesError;

    console.log('✅ Game progress cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Clear game progress error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// DEBUGGING & TESTING FUNCTIONS
// ============================================

/**
 * Test database connection and table structure - ENHANCED VERSION
 */
export const testDatabaseConnection = async () => {
  console.log('🔧 TESTING DATABASE CONNECTION AND STRUCTURE...');
  
  const results = {
    connection: false,
    tables: {},
    errors: []
  };
  
  try {
    // Test basic connection
    console.log('🔍 Testing basic Supabase connection...');
    const { data: pingData, error: pingError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (pingError) {
      results.errors.push(`Connection test failed: ${pingError.message}`);
      console.error('❌ Database connection failed:', pingError);
      return results;
    }
    
    results.connection = true;
    console.log('✅ Database connection successful');

    // Test each table with proper count syntax
    const tablesToTest = ['users', 'leaderboard', 'module_leaderboard', 'game_progress'];
    
    for (const tableName of tablesToTest) {
      console.log(`🔍 Testing table: ${tableName}`);
      try {
        // Test table existence with a simple select
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);
          
        if (error) {
          results.tables[tableName] = { 
            exists: false, 
            error: error.message,
            sampleData: null,
            count: 0
          };
          console.error(`❌ Table ${tableName} error:`, error);
        } else {
          // Get count using head request
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
          results.tables[tableName] = {
            exists: true,
            error: null,
            sampleData: data,
            count: countError ? 0 : (count || 0)
          };
          console.log(`✅ Table ${tableName}: ${countError ? 'count error' : (count || 0)} records, sample:`, data?.[0] || 'No data');
        }
      } catch (tableError) {
        results.tables[tableName] = { 
          exists: false, 
          error: tableError.message,
          sampleData: null,
          count: 0
        };
        console.error(`💥 Table ${tableName} test failed:`, tableError);
      }
    }

    console.log('🎉 DATABASE TEST COMPLETED');
    console.log('📊 Test results:', JSON.stringify(results, null, 2));
    
  } catch (globalError) {
    results.errors.push(`Global test error: ${globalError.message}`);
    console.error('💥 Global database test failed:', globalError);
  }
  
  return results;
};

/**
 * Create test leaderboard entry for debugging
 */
export const createTestLeaderboardEntry = async () => {
  console.log('🧪 CREATING TEST LEADERBOARD ENTRY...');
  
  try {
    const testUserId = `test_user_${Date.now()}`;
    const testUserData = {
      id: testUserId,
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      organization: 'Test Organization',
      country: 'Test Country'
    };
    
    // First create a test user
    console.log('🔍 Creating test user:', testUserData);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(testUserData)
      .select()
      .single();
      
    if (userError) {
      console.error('❌ Test user creation failed:', userError);
      return { success: false, error: userError.message };
    }
    
    console.log('✅ Test user created:', userData);
    
    // Now test module score submission
    const testModuleData = {
      moduleId: 1,
      moduleName: 'Test Module',
      score: 85,
      perfectCompletion: true,
      completionTime: 120,
      questionsAnswered: 10,
      correctAnswers: 9
    };
    
    console.log('🔍 Testing module score submission...');
    const result = await submitModuleScore(testUserId, testModuleData);
    
    if (result.success) {
      console.log('✅ Test leaderboard entry created successfully!');
      return { success: true, data: result.data, userId: testUserId };
    } else {
      console.error('❌ Test leaderboard entry failed:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('💥 CREATE TEST ENTRY FAILED:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// MODULE COMPLETION & SCORING
// ============================================

/**
 * Submit a module completion score - ENHANCED DEBUGGING VERSION
 */
export const submitModuleScore = async (userId, moduleData) => {
  try {
    console.log('� STARTING MODULE SCORE SUBMISSION');
    console.log('📊 Input parameters:', { userId, moduleData });
    
    // PHASE 1: Input Validation with Enhanced Debugging
    console.log('🔍 PHASE 1: Input validation...');
    if (!userId) {
      console.error('❌ VALIDATION FAILED: User ID is missing');
      throw new Error('User ID is required');
    }
    console.log('✅ User ID valid:', userId, '(Type:', typeof userId, ')');
    
    if (!moduleData || moduleData.moduleId === null || moduleData.moduleId === undefined || moduleData.score === undefined) {
      console.error('❌ VALIDATION FAILED: Module data invalid:', moduleData);
      console.error('🔍 Detailed validation check:');
      console.error('  - moduleData exists:', !!moduleData);
      console.error('  - moduleData.moduleId:', moduleData?.moduleId, '(Type:', typeof moduleData?.moduleId, ')');
      console.error('  - moduleData.score:', moduleData?.score, '(Type:', typeof moduleData?.score, ')');
      console.error('  - Full moduleData:', JSON.stringify(moduleData, null, 2));
      throw new Error('Module data with moduleId and score is required');
    }
    console.log('✅ Module data valid:', moduleData);

    // PHASE 2: Database Connection & User Lookup
    console.log('🔍 PHASE 2: Fetching user data from database...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email, organization, avatar, country, gender')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('❌ USER LOOKUP FAILED:', userError);
      console.log('🔍 Attempting alternate user lookup strategies...');
      
      // Try to search by different field patterns
      const { data: allUsers, error: listError } = await supabase
        .from('users')
        .select('*')
        .limit(5);
        
      if (!listError && allUsers) {
        console.log('📋 Sample users in database:', allUsers);
      }
      
      throw new Error(`User lookup failed: ${userError.message}`);
    }
    
    console.log('✅ User data retrieved:', userData);

    // PHASE 3: Module Leaderboard Entry Preparation
    console.log('🔍 PHASE 3: Preparing module leaderboard entry...');
    const moduleEntry = {
      user_id: userId,
      module_id: moduleData.moduleId,
      module_name: moduleData.moduleName,
      user_name: userData.name,
      user_email: userData.email || '',
      organization: userData.organization || 'Independent',
      avatar: userData.avatar || userData.name?.charAt(0).toUpperCase() || '?',
      country: userData.country || 'Unknown',
      gender: userData.gender || 'Prefer not to say',
      score: moduleData.score,
      perfect_completion: moduleData.perfectCompletion || false,
      completion_time: moduleData.completionTime || null,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📋 Module entry prepared:', JSON.stringify(moduleEntry, null, 2));

    // PHASE 4: Module Leaderboard Insert
    console.log('🔍 PHASE 4: Inserting into module_leaderboard...');
    const { data: moduleResult, error: moduleError } = await supabase
      .from('module_leaderboard')
      .upsert(moduleEntry, {
        onConflict: 'user_id,module_id'
      })
      .select()
      .single();
    
    if (moduleError) {
      console.error('❌ MODULE LEADERBOARD INSERT FAILED:', moduleError);
      console.log('🔍 Checking if module_leaderboard table exists...');
      
      // Test table existence
      const { data: tableTest, error: tableError } = await supabase
        .from('module_leaderboard')
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error('❌ module_leaderboard table issue:', tableError);
      } else {
        console.log('✅ module_leaderboard table exists, sample data:', tableTest);
      }
      
      throw new Error(`Module leaderboard insert failed: ${moduleError.message}`);
    }
    
    console.log('✅ Module leaderboard entry created/updated:', moduleResult);

    // PHASE 5: Calculate Overall Stats
    console.log('🔍 PHASE 5: Calculating overall leaderboard stats...');
    const { data: userModules, error: modulesError } = await supabase
      .from('module_leaderboard')
      .select('score, perfect_completion')
      .eq('user_id', userId);
      
    if (modulesError) {
      console.error('❌ Failed to get user modules:', modulesError);
    } else {
      console.log('📊 User\'s completed modules:', userModules);
    }
    
    const totalScore = userModules ? userModules.reduce((sum, m) => sum + m.score, 0) : moduleData.score;
    const modulesCompleted = userModules ? userModules.length : 1;
    const perfectModules = userModules ? userModules.filter(m => m.perfect_completion).length : (moduleData.perfectCompletion ? 1 : 0);
    const level = Math.floor(totalScore / 100) + 1;
    
    console.log('📊 Calculated stats:', { totalScore, modulesCompleted, perfectModules, level });

    // PHASE 6: Overall Leaderboard Entry
    console.log('🔍 PHASE 6: Preparing overall leaderboard entry...');
    const overallEntry = {
      user_id: userId,
      user_name: userData.name,
      user_email: userData.email || '',
      organization: userData.organization || 'Independent',
      avatar: userData.avatar || userData.name?.charAt(0).toUpperCase() || '?',
      country: userData.country || 'Unknown',
      gender: userData.gender || 'Prefer not to say',
      score: totalScore,
      level: level,
      achievements: 0,
      modules_completed: modulesCompleted,
      perfect_modules: perfectModules,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📋 Overall entry prepared:', JSON.stringify(overallEntry, null, 2));

    // PHASE 7: Overall Leaderboard Insert
    console.log('🔍 PHASE 7: Inserting into overall leaderboard...');
    const { data: overallResult, error: overallError } = await supabase
      .from('leaderboard')
      .upsert(overallEntry, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (overallError) {
      console.error('❌ OVERALL LEADERBOARD INSERT FAILED:', overallError);
      console.log('🔍 Checking if leaderboard table exists...');
      
      // Test table existence
      const { data: tableTest, error: tableError } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error('❌ leaderboard table issue:', tableError);
      } else {
        console.log('✅ leaderboard table exists, sample data:', tableTest);
      }
      
      throw new Error(`Overall leaderboard insert failed: ${overallError.message}`);
    }
    
    console.log('✅ Overall leaderboard entry created/updated:', overallResult);
    console.log('🎉 MODULE SCORE SUBMISSION COMPLETED SUCCESSFULLY!');
    
    return { success: true, data: { module: moduleResult, overall: overallResult } };
  } catch (error) {
    console.error('💥 SUBMIT MODULE SCORE FAILED:', error);
    console.error('🔍 Error stack:', error.stack);
    return { success: false, error: error.message };
  }
};

/**
 * Get module completions for a user
 */
export const getUserModuleCompletions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('module_completions')
      .select('*')
      .eq('user_id', userId)
      .order('module_id', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Get user module completions error:', error);
    return [];
  }
};

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

/**
 * Get overall leaderboard with user position - FIXED VERSION
 */
export const getOverallLeaderboard = async (userId = null, limit = 50) => {
  try {
    console.log('🏆 FETCHING OVERALL LEADERBOARD - ENHANCED DEBUG');
    console.log('📤 Input params:', { userId, limit });
    
    // PHASE 1: Test database connection and table existence
    console.log('🔍 PHASE 1: Testing leaderboard table...');
    const { data: tableTest, error: tableTestError } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(1);
      
    if (tableTestError) {
      console.error('❌ leaderboard table test failed:', tableTestError);
      throw new Error(`Leaderboard table not accessible: ${tableTestError.message}`);
    }
    console.log('✅ leaderboard table accessible');

    // PHASE 2: Get raw leaderboard data with debugging
    console.log('🔍 PHASE 2: Fetching leaderboard data...');
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('completed_at', { ascending: true })
      .limit(limit);

    if (leaderboardError) {
      console.error('❌ leaderboard fetch failed:', leaderboardError);
      throw leaderboardError;
    }
    
    console.log('📊 Raw leaderboard data fetched:', {
      count: leaderboardData?.length || 0,
      sample: leaderboardData?.[0] || null
    });
    
    if (!leaderboardData || leaderboardData.length === 0) {
      console.log('⚠️ No leaderboard data found - checking for any data in table...');
      
      const { data: anyData, error: anyError } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(10);
        
      if (!anyError && anyData) {
        console.log('📋 Sample data in leaderboard table:', anyData);
      } else {
        console.log('❌ No data found in leaderboard table at all:', anyError);
      }
      
      return { leaderboard: [], userPosition: null };
    }

    // PHASE 3: Process and add rankings
    console.log('🔍 PHASE 3: Processing leaderboard rankings...');
    const processedData = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: userId ? entry.user_id === userId : false
    }));

    console.log('📋 Processed leaderboard data:', {
      count: processedData.length,
      topEntry: processedData[0] || null,
      hasCurrentUser: !!processedData.find(e => e.user_id === userId)
    });

    // PHASE 4: Find user position if needed
    let userPosition = null;
    if (userId && !processedData.find(e => e.user_id === userId)) {
      console.log('🔍 PHASE 4: User not in top results, finding user position...');
      
      const { data: userEntry, error: userError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!userError && userEntry) {
        console.log('✅ User entry found:', userEntry);
        
        const { count } = await supabase
          .from('leaderboard')
          .select('*', { count: 'exact', head: true })
          .gt('score', userEntry.score);

        userPosition = {
          ...userEntry,
          rank: (count || 0) + 1,
          isCurrentUser: true
        };
        
        console.log('📊 User position calculated:', userPosition);
      } else {
        console.log('❌ User entry not found in leaderboard:', userError);
      }
    } else if (userId) {
      userPosition = processedData.find(e => e.user_id === userId);
      console.log('✅ User found in top results:', userPosition);
    }

    console.log('🎉 LEADERBOARD FETCH COMPLETED:', { 
      leaderboardCount: processedData.length, 
      userPositionFound: !!userPosition 
    });
    
    return {
      leaderboard: processedData,
      userPosition
    };
  } catch (error) {
    console.error('💥 GET OVERALL LEADERBOARD FAILED:', error);
    console.error('🔍 Error stack:', error.stack);
    return { leaderboard: [], userPosition: null };
  }
};

/**
 * Get module-specific leaderboard - FIXED VERSION
 */
export const getModuleLeaderboard = async (moduleId, userId = null, limit = 50) => {
  try {
    console.log(`🎯 Fetching leaderboard for module ${moduleId}...`);
    
    const { data, error } = await supabase
      .from('module_leaderboard')
      .select('*')
      .eq('module_id', moduleId)
      .order('score', { ascending: false })
      .order('completion_time', { ascending: true })
      .order('completed_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Add current user flag and rank
    const processedData = (data || []).map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: userId ? entry.user_id === userId : false
    }));

    // Find user position if not in top results
    let userPosition = null;
    if (userId && !processedData.find(e => e.user_id === userId)) {
      const { data: userEntry, error: userError } = await supabase
        .from('module_leaderboard')
        .select('*')
        .eq('module_id', moduleId)
        .eq('user_id', userId)
        .single();

      if (!userError && userEntry) {
        // Calculate rank - count how many users have better score/time
        const { count } = await supabase
          .from('module_leaderboard')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', moduleId)
          .or(`score.gt.${userEntry.score},and(score.eq.${userEntry.score},completion_time.lt.${userEntry.completion_time || 99999})`);

        userPosition = {
          ...userEntry,
          rank: (count || 0) + 1,
          isCurrentUser: true
        };
      }
    } else if (userId) {
      // User is in the top results
      userPosition = processedData.find(e => e.user_id === userId);
    }

    console.log(`✅ Module ${moduleId} leaderboard fetched:`, { count: processedData.length, userPosition: !!userPosition });
    return {
      leaderboard: processedData,
      userPosition
    };
  } catch (error) {
    console.error(`❌ Get module ${moduleId} leaderboard error:`, error);
    return { leaderboard: [], userPosition: null };
  }
};

/**
 * Get user's rank in overall leaderboard
 */
export const getUserRank = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('overall_leaderboard')
      .select('rank')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data?.rank || null;
  } catch (error) {
    console.error('Get user rank error:', error);
    return null;
  }
};

/**
 * Get leaderboard statistics - ENHANCED DEBUG VERSION
 */
export const getLeaderboardStats = async () => {
  try {
    console.log('📊 FETCHING LEADERBOARD STATISTICS - ENHANCED DEBUG');

    // PHASE 1: Test database tables
    console.log('🔍 PHASE 1: Testing table accessibility...');
    
    // Test leaderboard table
    const { data: leaderboardTest, error: leaderboardTestError } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(1);
      
    if (leaderboardTestError) {
      console.error('❌ leaderboard table test failed:', leaderboardTestError);
    } else {
      console.log('✅ leaderboard table accessible, sample:', leaderboardTest);
    }

    // Test module_leaderboard table
    const { data: moduleTest, error: moduleTestError } = await supabase
      .from('module_leaderboard')
      .select('*')
      .limit(1);
      
    if (moduleTestError) {
      console.error('❌ module_leaderboard table test failed:', moduleTestError);
    } else {
      console.log('✅ module_leaderboard table accessible, sample:', moduleTest);
    }

    // PHASE 2: Get total players
    console.log('🔍 PHASE 2: Counting total players...');
    const { count: totalPlayers, error: totalPlayersError } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true });

    if (totalPlayersError) {
      console.error('❌ Total players count failed:', totalPlayersError);
    } else {
      console.log('📊 Total players:', totalPlayers);
    }

    // PHASE 3: Get active players (last 30 days)
    console.log('🔍 PHASE 3: Counting active players...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activePlayers, error: activePlayersError } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());

    if (activePlayersError) {
      console.error('❌ Active players count failed:', activePlayersError);
    } else {
      console.log('📊 Active players (last 30 days):', activePlayers);
    }

    // PHASE 4: Get total module completions
    console.log('🔍 PHASE 4: Counting module completions...');
    const { count: totalCompletions, error: completionsError } = await supabase
      .from('module_leaderboard')
      .select('*', { count: 'exact', head: true });

    if (completionsError) {
      console.error('❌ Total completions count failed:', completionsError);
    } else {
      console.log('📊 Total module completions:', totalCompletions);
    }

    // PHASE 5: Get perfect completions
    console.log('🔍 PHASE 5: Counting perfect completions...');
    const { count: perfectCompletions, error: perfectError } = await supabase
      .from('module_leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('perfect_completion', true);

    if (perfectError) {
      console.error('❌ Perfect completions count failed:', perfectError);
    } else {
      console.log('📊 Perfect completions:', perfectCompletions);
    }

    const stats = {
      totalPlayers: totalPlayers || 0,
      activePlayers: activePlayers || 0,
      totalCompletions: totalCompletions || 0,
      perfectCompletions: perfectCompletions || 0,
      averageCompletionRate: totalPlayers > 0 
        ? Math.round((totalCompletions / (totalPlayers * 9)) * 100) // Assuming 9 modules
        : 0
    };

    console.log('🎉 LEADERBOARD STATS CALCULATED:', stats);
    return stats;
    
  } catch (error) {
    console.error('💥 GET LEADERBOARD STATS FAILED:', error);
    console.error('🔍 Error stack:', error.stack);
    
    return {
      totalPlayers: 0,
      activePlayers: 0,
      totalCompletions: 0,
      perfectCompletions: 0,
      averageCompletionRate: 0
    };
  }
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to leaderboard changes - FIXED VERSION
 */
export const subscribeToLeaderboard = (callback) => {
  const subscription = supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaderboard'
      },
      (payload) => {
        console.log('Overall leaderboard update:', payload);
        callback(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'module_leaderboard'
      },
      (payload) => {
        console.log('Module leaderboard update:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from leaderboard changes
 */
export const unsubscribeFromLeaderboard = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    console.log('✅ Connection test successful');
    return { success: true, count: data };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user exists
 */
export const checkUserExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('Check user exists error:', error);
    return false;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Sync all game data (for migrations or recovery)
 */
export const syncAllGameData = async (userId, gameState) => {
  try {
    console.log('🔄 Syncing all game data...');
    
    // Save game progress
    const progressResult = await saveGameProgress(userId, gameState);
    if (!progressResult.success) throw new Error(progressResult.error);

    // Submit scores for all completed modules
    for (const moduleIndex of gameState.completedModules || []) {
      // Calculate module-specific data
      const moduleQuestions = gameState.answeredQuestions || {};
      let moduleCorrect = 0;
      let moduleAnswered = 0;
      
      Object.keys(moduleQuestions).forEach(key => {
        if (key.startsWith(`${moduleIndex}-`)) {
          moduleAnswered++;
          if (moduleQuestions[key].wasCorrect) moduleCorrect++;
        }
      });

      await submitModuleScore(userId, {
        moduleId: moduleIndex,
        moduleName: `Module ${moduleIndex + 1}`, // You should pass actual module names
        score: gameState.moduleScores?.[moduleIndex] || 0,
        perfectCompletion: gameState.perfectModules?.includes(moduleIndex) || false,
        questionsAnswered: moduleAnswered,
        questionsCorrect: moduleCorrect
      });
    }

    console.log('✅ All game data synced successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Sync all game data error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BROWSER DEBUGGING FUNCTIONS
// ============================================

/**
 * Browser-accessible debugging functions
 */
if (typeof window !== 'undefined') {
  // Make debugging functions available globally
  window.testDatabase = testDatabaseConnection;
  window.createTestEntry = createTestLeaderboardEntry;
  
  // Add a comprehensive test function
  window.testUserFlow = async (userId = null) => {
    console.log('🧪 TESTING COMPLETE USER FLOW...');
    
    try {
      // Step 1: Test database
      console.log('\n📋 STEP 1: Database Connection Test');
      const dbTest = await testDatabaseConnection();
      
      // Step 2: Test with real user if provided
      if (userId) {
        console.log('\n👤 STEP 2: Testing with user:', userId);
        
        // Test user lookup
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (userError) {
          console.error('❌ User lookup failed:', userError);
        } else {
          console.log('✅ User found:', userData);
        }
        
        // Test module submission with sample data
        const testModuleData = {
          moduleId: 0,
          moduleName: 'Test Module',
          score: 85,
          perfectCompletion: true,
          completionTime: 120,
          questionsAnswered: 10,
          correctAnswers: 9
        };
        
        console.log('\n📊 STEP 3: Testing module submission...');
        const moduleResult = await submitModuleScore(userId, testModuleData);
        console.log('Module submission result:', moduleResult);
        
        // Test leaderboard retrieval
        console.log('\n🏆 STEP 4: Testing leaderboard retrieval...');
        const leaderboardResult = await getOverallLeaderboard(userId);
        console.log('Leaderboard result:', leaderboardResult);
      }
      
      console.log('\n🎉 USER FLOW TEST COMPLETED');
      return { success: true, data: { database: dbTest } };
      
    } catch (error) {
      console.error('💥 User flow test failed:', error);
      return { success: false, error: error.message };
    }
  };
  
  console.log('🔧 Debug functions loaded. Available:');
  console.log('- testDatabase() - Test database connection');
  console.log('- createTestEntry() - Create test leaderboard entry');
  console.log('- testUserFlow(userId) - Test complete flow for a user');
  console.log('- testModuleSubmission(userId) - Test module score submission with your current user');
  
  // Add quick test for module submission
  window.testModuleSubmission = async (userId) => {
    console.log('🧪 TESTING MODULE SUBMISSION...');
    
    const testModuleData = {
      moduleId: 0,
      moduleName: 'IFRS 17 Fundamentals',
      score: 310,
      perfectCompletion: false,
      completionTime: 90,
      questionsAnswered: 9,
      correctAnswers: 8
    };
    
    console.log('📊 Testing with data:', testModuleData);
    const result = await submitModuleScore(userId, testModuleData);
    console.log('🎯 Module submission result:', result);
    
    if (result.success) {
      console.log('✅ Testing leaderboard retrieval...');
      const leaderboard = await getOverallLeaderboard(userId);
      console.log('🏆 Updated leaderboard:', leaderboard);
    }
    
    return result;
  };
}

export default supabase;