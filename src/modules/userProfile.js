// src/modules/userProfile.js
import {
  getAllUsersFromSupabase,
  createUserInSupabase,
  updateUserInSupabase,
  deleteUserFromSupabase,
  getCurrentUserFromSupabase,
  setCurrentUserInSession,
  clearCurrentUserSession,
  migrateUsersToSupabase,
  signInUser,
  signOutUser,
  getUserByEmail,
  checkUserExists
} from './supabaseUserService';

// Storage key constants (for backward compatibility)
const USERS_KEY = 'ifrs17_users';
const CURRENT_USER_KEY = 'ifrs17_current_user';

// Initialize migration on module load
let migrationPromise = null;
const ensureMigration = async () => {
  if (!migrationPromise) {
    migrationPromise = migrateUsersToSupabase();
  }
  return migrationPromise;
};

// Auto-run migration when module loads
if (typeof window !== 'undefined') {
  ensureMigration().then(result => {
    if (result.migrated > 0) {
      console.log(`✅ Migrated ${result.migrated} users to cloud storage`);
    }
  });
}

// Get all users - now from Supabase
export const getAllUsers = async () => {
  try {
    // Ensure migration has happened
    await ensureMigration();
    
    // Get users from Supabase
    const users = await getAllUsersFromSupabase();
    return users;
  } catch (error) {
    console.error('Error loading users:', error);
    // Fallback to localStorage if Supabase fails
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (localError) {
      console.error('Error loading users from localStorage:', localError);
      return [];
    }
  }
};

// Create a new user profile - Updated for new system
export const createUserProfile = async (name, email = '', organization = '', country = '', gender = 'Prefer not to say', password = '') => {
  try {
    // Create user in Supabase
    const newUser = await createUserInSupabase({
      name,
      email: email || `guest_${Date.now()}@guest.local`,
      organization,
      country,
      gender,
      password
    });
    
    if (newUser) {
      // Also save to localStorage for backward compatibility
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const exists = users.find(u => u.id === newUser.id);
      if (!exists) {
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      
      return newUser;
    }
    
    // Fallback to local creation if Supabase fails
    const avatar = name.charAt(0).toUpperCase();
    const fallbackUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email || `guest_${Date.now()}@guest.local`,
      organization,
      avatar,
      country,
      gender,
      created_at: new Date().toISOString()
    };
    
    // Save to localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    users.push(fallbackUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return fallbackUser;
  } catch (error) {
    console.error('Error creating user:', error);
    // Return a basic user object as last resort
    return {
      id: `user_${Date.now()}`,
      name,
      email,
      organization,
      avatar: name.charAt(0).toUpperCase(),
      country,
      gender,
      created_at: new Date().toISOString()
    };
  }
};

// Save/update a user
export const saveUser = async (user) => {
  try {
    // Update in Supabase
    let savedUser = await updateUserInSupabase(user.id, user);
    
    // If update returns null, try to create
    if (!savedUser) {
      savedUser = await createUserInSupabase({
        name: user.name,
        email: user.email,
        organization: user.organization,
        country: user.country,
        gender: user.gender || 'Prefer not to say'
      });
    }
    
    // Also update localStorage for backward compatibility
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = savedUser || user;
    } else {
      users.push(savedUser || user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return savedUser || user;
  } catch (error) {
    console.error('Error saving user:', error);
    // Fallback to localStorage only
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return user;
  }
};

// Set the current user
export const setCurrentUser = (userId) => {
  setCurrentUserInSession(userId);
  localStorage.setItem(CURRENT_USER_KEY, userId);
};

// Get the current user
export const getCurrentUser = async () => {
  try {
    // Get user from Supabase (handles both auth and session-based users)
    const user = await getCurrentUserFromSupabase();
    if (user) return user;
    
    // Fallback to localStorage
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUserId) return null;
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.find(u => u.id === currentUserId) || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get user-specific storage key (for game state)
export const getUserStorageKey = (userId) => {
  if (!userId || userId === 'default-user') {
    return 'ifrs17-progress';
  }
  return `ifrs17-progress-${userId}`;
};

// Clear current user (for logout)
export const clearCurrentUser = async () => {
  try {
    await signOutUser();
    clearCurrentUserSession();
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
    // Still clear local storage even if signout fails
    clearCurrentUserSession();
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Delete a user profile
export const deleteUser = async (userId) => {
  try {
    const success = await deleteUserFromSupabase(userId);
    
    // Also remove from localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    
    // If the deleted user was the current user, clear the current user
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserId === userId) {
      await clearCurrentUser();
    }
    
    return success;
  } catch (error) {
    console.error('Error deleting user:', error);
    // Fallback to localStorage only
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserId === userId) {
      clearCurrentUser();
    }
    
    return true;
  }
};

// Update user profile
export const updateUser = async (userId, updates) => {
  try {
    const updatedUser = await updateUserInSupabase(userId, updates);
    
    // Also update in localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    return updatedUser || (userIndex >= 0 ? users[userIndex] : null);
  } catch (error) {
    console.error('Error updating user:', error);
    // Fallback to localStorage only
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return users[userIndex];
    }
    
    return null;
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const result = await signInUser(email, password);
    
    if (result.success) {
      setCurrentUser(result.user.id);
      
      // Update localStorage
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const existingIndex = users.findIndex(u => u.id === result.user.id);
      
      if (existingIndex >= 0) {
        users[existingIndex] = result.user;
      } else {
        users.push(result.user);
      }
      
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    
    return result;
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const result = await signOutUser();
    await clearCurrentUser();
    return result;
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Check if email is already registered
export const isEmailRegistered = async (email) => {
  try {
    return await checkUserExists(email);
  } catch (error) {
    console.error('Error checking email:', error);
    // Check localStorage as fallback
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.some(u => u.email === email);
  }
};

// Get user by email
export const findUserByEmail = async (email) => {
  try {
    const user = await getUserByEmail(email);
    if (user) return user;
    
    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.find(u => u.email === email) || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

// Legacy support - default user for backward compatibility
export const defaultUser = {
  id: 'default-user',
  name: 'Demo User',
  email: 'demo@example.com',
  organization: 'Demo Organization',
  avatar: 'D',
  country: 'Kenya',
  gender: 'Prefer not to say'
};

// Get current user data with fallback
export const getCurrentUserData = async () => {
  const currentUser = await getCurrentUser();
  return currentUser || defaultUser;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
  return currentUserId && currentUserId !== 'default-user' && !currentUserId.startsWith('guest_');
};

// Create guest user
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
  
  // Save to localStorage
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  users.push(guestUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Set as current user
  setCurrentUser(guestId);
  
  return guestUser;
};

// Convert guest to authenticated user
export const convertGuestToUser = async (guestId, userData) => {
  try {
    // Create new authenticated user
    const newUser = await createUserProfile(
      userData.name,
      userData.email,
      userData.organization,
      userData.country,
      userData.gender,
      userData.password
    );
    
    if (newUser) {
      // Migrate progress from guest to new user
      const { migrateProgress } = await import('./storageService');
      await migrateProgress(guestId, newUser.id);
      
      // Delete guest user
      await deleteUser(guestId);
      
      // Set new user as current
      setCurrentUser(newUser.id);
      
      return newUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error converting guest to user:', error);
    return null;
  }
};