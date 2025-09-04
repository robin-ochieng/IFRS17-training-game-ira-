// src/modules/supabaseUserService.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage key constants
const CURRENT_USER_KEY = 'ifrs17_current_user';
const USERS_KEY = 'ifrs17_users';
const AUTH_TOKEN_KEY = 'ifrs17_auth_token';

// Get all users from Supabase - Updated to match new schema
export const getAllUsersFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUsersFromSupabase:', error);
    return [];
  }
};

// Create a new user in Supabase - Updated for new schema
export const createUserInSupabase = async (userData) => {
  try {
    const { name, email, organization, country, gender, password } = userData;
    
    // If password is provided, create auth user first
    let authUserId = null;
    if (email && password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            organization,
            country,
            gender
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        // Continue without auth if it fails
      } else if (authData?.user) {
        authUserId = authData.user.id;
      }
    }
    
    // Create user profile
    const userId = authUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const avatar = name.charAt(0).toUpperCase();
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        name,
        email: email || `${userId}@guest.local`,
        organization: organization || 'Independent',
        country: country || 'Unknown',
        gender: gender || 'Prefer not to say',
        avatar,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      
      // If user already exists, try to fetch it
      if (error.code === '23505') { // Unique violation
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        
        if (existingUser) return existingUser;
      }
      
      return null;
    }

    // Initialize game progress for new user
    await supabase
      .from('game_progress')
      .insert([{
        user_id: userId,
        current_module: 0,
        current_question: 0,
        total_score: 0,
        level: 1,
        xp: 0,
        streak: 0,
        combo: 0,
        perfect_modules_count: 0,
        completed_modules: [],
        unlocked_modules: [0],
        answered_questions: {},
        achievements: [],
        power_ups: { skip: 3, hint: 3, eliminate: 3 },
        shuffled_questions: {},
        last_saved: new Date().toISOString()
      }]);

    return data;
  } catch (error) {
    console.error('Error in createUserInSupabase:', error);
    return null;
  }
};

// Sign in user with email and password
export const signInUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { success: false, error: 'Failed to load user profile' };
    }

    // Store auth token
    if (data.session) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token);
      setCurrentUserInSession(profile.id);
    }

    return { success: true, user: profile, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
    }
    
    // Clear local storage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    clearCurrentUserSession();
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Update user in Supabase
export const updateUserInSupabase = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserInSupabase:', error);
    return null;
  }
};

// Delete user from Supabase
export const deleteUserFromSupabase = async (userId) => {
  try {
    // Delete game progress first
    await supabase
      .from('game_progress')
      .delete()
      .eq('user_id', userId);

    // Delete module completions
    await supabase
      .from('module_completions')
      .delete()
      .eq('user_id', userId);

    // Delete user profile
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUserFromSupabase:', error);
    return false;
  }
};

// Get current user from session
export const getCurrentUserFromSupabase = async () => {
  try {
    // First check if we have an auth session
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      // Get full profile from users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!error && profile) {
        return profile;
      }
    }
    
    // Fallback to localStorage session
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUserId) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (error || !data) {
      console.error('Error fetching current user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUserFromSupabase:', error);
    return null;
  }
};

// Set current user in session
export const setCurrentUserInSession = (userId) => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Clear current user session
export const clearCurrentUserSession = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

// Check if user exists by email
export const checkUserExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error checking user:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking user exists:', error);
    return false;
  }
};

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not a "no rows" error
        console.error('Error fetching user by email:', error);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
};

// Migrate users from localStorage to Supabase
export const migrateUsersToSupabase = async () => {
  try {
    const localUsers = localStorage.getItem(USERS_KEY);
    if (!localUsers) return { success: true, migrated: 0 };

    const users = JSON.parse(localUsers);
    if (!Array.isArray(users) || users.length === 0) {
      return { success: true, migrated: 0 };
    }

    let migratedCount = 0;
    
    for (const user of users) {
      // Check if user already exists
      const exists = await checkUserExists(user.email || `${user.id}@guest.local`);
      
      if (!exists) {
        const result = await createUserInSupabase({
          name: user.name,
          email: user.email || `${user.id}@guest.local`,
          organization: user.organization || 'Independent',
          country: user.country || 'Unknown',
          gender: user.gender || 'Prefer not to say'
        });
        
        if (result) {
          migratedCount++;
          
          // Migrate progress if exists
          const progressKey = `ifrs17-progress-${user.id}`;
          const savedProgress = localStorage.getItem(progressKey);
          
          if (savedProgress) {
            try {
              const progress = JSON.parse(savedProgress);
              await supabase
                .from('game_progress')
                .upsert({
                  user_id: result.id,
                  current_module: progress.currentModule || 0,
                  current_question: progress.currentQuestion || 0,
                  total_score: progress.score || 0,
                  level: progress.level || 1,
                  xp: progress.xp || 0,
                  streak: progress.streak || 0,
                  combo: progress.combo || 0,
                  perfect_modules_count: progress.perfectModulesCount || 0,
                  completed_modules: progress.completedModules || [],
                  unlocked_modules: progress.unlockedModules || [0],
                  answered_questions: progress.answeredQuestions || {},
                  achievements: progress.achievements || [],
                  power_ups: progress.powerUps || { skip: 3, hint: 3, eliminate: 3 },
                  shuffled_questions: progress.shuffledQuestions || {},
                  last_saved: new Date().toISOString()
                });
              
              console.log(`✅ Migrated progress for user: ${user.name}`);
            } catch (progressError) {
              console.error('Error migrating progress:', progressError);
            }
          }
        }
      }
    }

    console.log(`✅ Successfully migrated ${migratedCount} users to Supabase`);
    return { success: true, migrated: migratedCount };
  } catch (error) {
    console.error('Error during migration:', error);
    return { success: false, error: error.message, migrated: 0 };
  }
};

// Initialize auth state listener
export const initializeAuthListener = (callback) => {
  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session) {
      localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
      setCurrentUserInSession(session.user.id);
      
      // Get full user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (callback) callback({ event, user: profile, session });
    } else if (event === 'SIGNED_OUT') {
      clearCurrentUserSession();
      if (callback) callback({ event, user: null, session: null });
    }
  });
  
  return authListener;
};