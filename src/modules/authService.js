// src/modules/authService.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Using fallback values.');
}

const supabase = createClient(
  supabaseUrl || 'YOUR_SUPABASE_URL',
  supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY'
);

// Storage keys
const CURRENT_USER_KEY = 'ifrs17_current_user';
const AUTH_TOKEN_KEY = 'ifrs17_auth_token';
const SESSION_KEY = 'ifrs17_session';
const GUEST_USER_KEY = 'ifrs17_guest_user';

// Simple password hashing (for demonstration - in production, use proper bcrypt on server)
// Note: This is NOT secure for production. Use Supabase Auth or server-side hashing.
const hashPassword = (password) => {
  // This is a simple hash for demonstration. In production, handle this server-side
  return btoa(password);
};

// Verify password
const verifyPassword = (password, hash) => {
  try {
    return hashPassword(password) === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

// Generate session token
const generateSessionToken = (userId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return btoa(`${userId}_${timestamp}_${random}`);
};

// Sign up a new user - Updated for new schema
export const signUpUser = async ({ 
  email, 
  password, 
  name, 
  organization, 
  companyType, 
  country, 
  gender 
}) => {
  try {
    // Validate input
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required');
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error if no rows

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check user error:', checkError);
      throw new Error('Failed to check existing user');
    }

    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Create user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const avatar = name.charAt(0).toUpperCase();
    const passwordHash = hashPassword(password);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email,
        password_hash: passwordHash,
        name,
        organization: organization || 'Independent',
        company_type: companyType || 'Other',
        country: country || 'Unknown',
        gender: gender || 'Prefer not to say',
        avatar,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      
      // Handle specific error codes
      if (insertError.code === '23505') {
        throw new Error('An account with this email already exists');
      }
      
      throw new Error('Failed to create account. Please try again.');
    }

    // Initialize game progress for new user
    const { error: progressError } = await supabase
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

    if (progressError) {
      console.error('Failed to initialize game progress:', progressError);
      // Don't throw - user is created, progress can be initialized later
    }

    // Create session
    const sessionToken = generateSessionToken(userId);
    const session = {
      token: sessionToken,
      userId: userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    // Set current user in session
    setCurrentUserSession(newUser, session);

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = newUser;
    return {
      success: true,
      user: userWithoutPassword,
      session: session
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create account'
    };
  }
};

// Sign in an existing user - Updated with better error handling
export const signInUser = async (email, password) => {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to sign in. Please try again.');
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    if (!user.password_hash || !verifyPassword(password, user.password_hash)) {
      throw new Error('Invalid email or password');
    }

    // Update last login (don't await to speed up login)
    supabase
      .from('users')
      .update({ 
        updated_at: new Date().toISOString() 
      })
      .eq('id', user.id)
      .then(({ error: updateError }) => {
        if (updateError) {
          console.error('Failed to update last login:', updateError);
        }
      });

    // Create session
    const sessionToken = generateSessionToken(user.id);
    const session = {
      token: sessionToken,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    // Set current user in session
    setCurrentUserSession(user, session);

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      session: session
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign in'
    };
  }
};

// Get current user from session - Enhanced
export const getCurrentAuthUser = () => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // Check if session is still valid
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.expiresAt) {
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < new Date()) {
          // Session expired
          signOut();
          return null;
        }
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Set current user in session - Enhanced
export const setCurrentUserSession = (user, session = null) => {
  try {
    if (user) {
      // Remove password_hash if present
      const { password_hash, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem(AUTH_TOKEN_KEY, user.id);
      
      if (session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      
      // Clear guest user if exists
      localStorage.removeItem(GUEST_USER_KEY);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

// Sign out current user - Enhanced
export const signOut = async () => {
  try {
    const user = getCurrentAuthUser();
    
    // Clear all auth-related storage
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    
    // Don't clear guest user data - might want to preserve it
    
    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign out'
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentAuthUser();
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const sessionStr = localStorage.getItem(SESSION_KEY);
  
  if (!user || !token) return false;
  
  // Check session validity
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session.expiresAt) {
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < new Date()) {
          return false;
        }
      }
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
  
  return true;
};

// Update user profile - Enhanced
export const updateUserProfile = async (userId, updates) => {
  try {
    // Don't allow updating password_hash through this method
    const { password_hash, ...safeUpdates } = updates;
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }

    // Update local session
    const currentUser = getCurrentAuthUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUserSession({ ...currentUser, ...data });
    }

    return {
      success: true,
      user: data
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile'
    };
  }
};

// Change password - Enhanced
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      throw new Error('Current and new passwords are required');
    }
    
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    // Get user to verify current password
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password_hash)) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const newPasswordHash = hashPassword(newPassword);
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      throw new Error('Failed to update password');
    }

    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: error.message || 'Failed to change password'
    };
  }
};

// Check if email exists
export const checkEmailExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Check email error:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get user error:', error);
      return null;
    }

    // Remove password hash
    const { password_hash, ...userWithoutPassword } = data;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Create guest user (for playing without account)
export const createGuestUser = () => {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const guestUser = {
    id: guestId,
    name: 'Guest Player',
    email: `${guestId}@guest.local`,
    organization: 'Guest',
    avatar: 'G',
    country: 'Unknown',
    gender: 'Prefer not to say',
    isGuest: true,
    created_at: new Date().toISOString()
  };
  
  // Store guest user
  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
  
  return guestUser;
};

// Get or create guest user
export const getOrCreateGuestUser = () => {
  try {
    const guestStr = localStorage.getItem(GUEST_USER_KEY);
    if (guestStr) {
      return JSON.parse(guestStr);
    }
    return createGuestUser();
  } catch (error) {
    console.error('Error getting guest user:', error);
    return createGuestUser();
  }
};

// Convert guest to registered user
export const convertGuestToUser = async (guestId, userData) => {
  try {
    // Create new user account
    const result = await signUpUser(userData);
    
    if (result.success) {
      // Clear guest data
      localStorage.removeItem(GUEST_USER_KEY);
      
      // The game component should handle progress migration
      return {
        success: true,
        user: result.user,
        previousGuestId: guestId
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error converting guest to user:', error);
    return {
      success: false,
      error: error.message || 'Failed to create account'
    };
  }
};

// Refresh session
export const refreshSession = async () => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    const userId = session.userId;
    
    // Verify user still exists
    const user = await getUserById(userId);
    if (!user) {
      signOut();
      return null;
    }
    
    // Extend session
    const newSession = {
      ...session,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
};

// Validate session
export const validateSession = async () => {
  try {
    const user = getCurrentAuthUser();
    if (!user) return false;
    
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return false;
    
    const session = JSON.parse(sessionStr);
    const expiresAt = new Date(session.expiresAt);
    
    if (expiresAt < new Date()) {
      // Try to refresh
      const newSession = await refreshSession();
      return !!newSession;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};

// Delete user account
export const deleteAccount = async (userId, password) => {
  try {
    // Verify password first
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    if (!verifyPassword(password, user.password_hash)) {
      throw new Error('Password is incorrect');
    }

    // Delete game progress
    await supabase
      .from('game_progress')
      .delete()
      .eq('user_id', userId);

    // Delete module completions
    await supabase
      .from('module_completions')
      .delete()
      .eq('user_id', userId);

    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Delete account error:', deleteError);
      throw new Error('Failed to delete account');
    }

    // Sign out
    await signOut();

    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting account:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete account'
    };
  }
};

// Export all functions as default for convenience
export default {
  signUpUser,
  signInUser,
  getCurrentAuthUser,
  setCurrentUserSession,
  signOut,
  isAuthenticated,
  updateUserProfile,
  changePassword,
  checkEmailExists,
  getUserById,
  createGuestUser,
  getOrCreateGuestUser,
  convertGuestToUser,
  refreshSession,
  validateSession,
  deleteAccount
};