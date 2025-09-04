//src/modules/guestUserService.js
// Guest User Service for Delayed Authentication

import { GAME_CONFIG } from '../config/gameConfig';

const GUEST_USER_KEY = GAME_CONFIG.STORAGE_KEYS.GUEST_USER;
const GUEST_PROGRESS_KEY = GAME_CONFIG.STORAGE_KEYS.GUEST_PROGRESS;

export const createGuestUser = () => {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const guestUser = {
    id: guestId,
    name: 'Guest User',
    email: null,
    organization: 'Evaluating IFRS 17',
    avatar: 'G',
    country: 'Unknown',
    isGuest: true,
    sessionStart: new Date().toISOString()
  };
  
  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
  
  // Track guest session start
  trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.GUEST_SESSION_STARTED, {
    guestId: guestId,
    timestamp: new Date().toISOString()
  });
  
  return guestUser;
};

export const getGuestUser = () => {
  try {
    const guestData = localStorage.getItem(GUEST_USER_KEY);
    return guestData ? JSON.parse(guestData) : null;
  } catch (error) {
    console.error('Error retrieving guest user:', error);
    return null;
  }
};

export const saveGuestProgress = (progressData) => {
  try {
    const timestamp = new Date().toISOString();
    const guestProgress = {
      ...progressData,
      lastUpdated: timestamp,
      isGuestData: true
    };
    localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(guestProgress));
    return true;
  } catch (error) {
    console.error('Error saving guest progress:', error);
    return false;
  }
};

export const getGuestProgress = () => {
  try {
    const progressData = localStorage.getItem(GUEST_PROGRESS_KEY);
    return progressData ? JSON.parse(progressData) : null;
  } catch (error) {
    console.error('Error retrieving guest progress:', error);
    return null;
  }
};

export const clearGuestData = () => {
  try {
    localStorage.removeItem(GUEST_USER_KEY);
    localStorage.removeItem(GUEST_PROGRESS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing guest data:', error);
    return false;
  }
};

export const migrateGuestToAuthenticatedUser = async (authenticatedUser, gameStateService) => {
  try {
    const guestProgress = getGuestProgress();
    
    if (guestProgress && authenticatedUser) {
      console.log('🔄 Migrating guest progress to authenticated user:', authenticatedUser.id);
      
      // Set storage user for authenticated user
      if (gameStateService && gameStateService.setStorageUser) {
        gameStateService.setStorageUser(authenticatedUser.id);
      }
      
      // Prepare merged progress data
      const mergedProgress = {
        ...guestProgress,
        migratedFromGuest: true,
        migrationTimestamp: new Date().toISOString(),
        originalGuestId: getGuestUser()?.id,
        // Ensure Module 2 is unlocked for authenticated users
        unlockedModules: [...new Set([...guestProgress.unlockedModules, 1])]
      };
      
      // Save the guest progress as authenticated user progress
      let success = false;
      if (gameStateService && gameStateService.saveGameState) {
        success = await gameStateService.saveGameState(mergedProgress);
      }
      
      if (success) {
        // Track successful migration
        trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.GUEST_PROGRESS_MERGED, {
          guestId: getGuestUser()?.id,
          authenticatedUserId: authenticatedUser.id,
          migratedModules: guestProgress.completedModules || [],
          migratedScore: guestProgress.score || 0,
          migrationTimestamp: new Date().toISOString()
        });
        
        // Clear guest data after successful migration
        clearGuestData();
        console.log('✅ Successfully migrated guest progress to authenticated user');
        
        // Track Module 2 unlock
        trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.MODULE2_UNLOCKED_POST_AUTH, {
          userId: authenticatedUser.id,
          unlockedAfterMigration: true
        });
        
        return { success: true, mergedProgress };
      }
    }
    
    return { success: false, error: 'No guest progress to migrate' };
  } catch (error) {
    console.error('❌ Error migrating guest progress:', error);
    
    // Track failed migration
    trackGuestEvent('guest_migration_failed', {
      guestId: getGuestUser()?.id,
      authenticatedUserId: authenticatedUser?.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    return { success: false, error: error.message };
  }
};

// New function to check if guest has completed Module 1
export const hasGuestCompletedModule1 = () => {
  const guestProgress = getGuestProgress();
  return guestProgress?.completedModules?.includes(0) || false;
};

// New function to get guest Module 1 completion details
export const getGuestModule1Completion = () => {
  const guestProgress = getGuestProgress();
  if (!guestProgress || !guestProgress.completedModules?.includes(0)) {
    return null;
  }
  
  return {
    completed: true,
    score: guestProgress.moduleScore || guestProgress.score || 0,
    perfect: guestProgress.perfectModule || false,
    timeTaken: guestProgress.timeTaken || null,
    completionTimestamp: guestProgress.lastUpdated || new Date().toISOString()
  };
};

// Analytics tracking functions
export const trackGuestEvent = (eventName, data = {}) => {
  try {
    const guestUser = getGuestUser();
    const event = {
      timestamp: new Date().toISOString(),
      event: eventName,
      guestId: guestUser?.id || 'unknown',
      sessionStart: guestUser?.sessionStart,
      ...data
    };
    
    // Store analytics data locally for now
    const analyticsKey = 'ifrs17_guest_analytics';
    const existingAnalytics = JSON.parse(localStorage.getItem(analyticsKey) || '[]');
    existingAnalytics.push(event);
    
    // Keep only last 100 events to prevent storage bloat
    if (existingAnalytics.length > 100) {
      existingAnalytics.splice(0, existingAnalytics.length - 100);
    }
    
    localStorage.setItem(analyticsKey, JSON.stringify(existingAnalytics));
    
    console.log(`📊 Guest Analytics: ${eventName}`, event);
  } catch (error) {
    console.error('Error tracking guest event:', error);
  }
};

export const getGuestAnalytics = () => {
  try {
    const analyticsKey = 'ifrs17_guest_analytics';
    return JSON.parse(localStorage.getItem(analyticsKey) || '[]');
  } catch (error) {
    console.error('Error retrieving guest analytics:', error);
    return [];
  }
};
