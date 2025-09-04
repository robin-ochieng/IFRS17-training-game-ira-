// src/modules/storageService.js
import { 
  saveGameProgress, 
  loadGameProgress, 
  clearGameProgress 
} from '../modules/supabaseService';

let STORAGE_KEY = 'ifrs17-progress';
let CURRENT_USER_ID = null;
const LAST_LOCATION_BASE_KEY = 'ifrs17-last-location';

// Set user-specific storage
export const setStorageUser = (userId) => {
  CURRENT_USER_ID = userId;
  STORAGE_KEY = `ifrs17-progress-${userId}`;
};

// Get current storage key
export const getStorageKey = () => STORAGE_KEY;

// Build a per-user key for last-location storage
const getLastLocationKey = () => {
  if (!CURRENT_USER_ID) return LAST_LOCATION_BASE_KEY;
  return `${LAST_LOCATION_BASE_KEY}-${CURRENT_USER_ID}`;
};

// Lightweight, timestamped last-location persistence (guest/local only)
export const setLastLocation = ({ moduleId, questionIndex, ts }) => {
  try {
    const payload = {
      moduleId: typeof moduleId === 'number' ? moduleId : 0,
      questionIndex: typeof questionIndex === 'number' ? questionIndex : 0,
      ts: ts || new Date().toISOString(),
    };
    localStorage.setItem(getLastLocationKey(), JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error('Failed to set last location:', e);
    return false;
  }
};

export const getLastLocation = () => {
  try {
    const raw = localStorage.getItem(getLastLocationKey());
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to get last location:', e);
    return null;
  }
};

export const clearLastLocation = () => {
  try {
    localStorage.removeItem(getLastLocationKey());
    return true;
  } catch (e) {
    console.error('Failed to clear last location:', e);
    return false;
  }
};

// Save game state - Updated to use new Supabase service
export const saveGameState = async (gameState) => {
  try {
    // Prepare data for saving
    const dataToSave = {
      currentModule: gameState.currentModule,
      currentQuestion: gameState.currentQuestion,
      score: gameState.score,
      level: gameState.level,
      xp: gameState.xp,
      streak: gameState.streak,
      combo: gameState.combo,
      perfectModulesCount: gameState.perfectModulesCount,
      completedModules: gameState.completedModules || [],
      unlockedModules: gameState.unlockedModules || [0],
      answeredQuestions: gameState.answeredQuestions || {},
      achievements: Array.isArray(gameState.achievements) 
        ? gameState.achievements.map(a => typeof a === 'string' ? a : a.id)
        : [],
      powerUps: gameState.powerUps || { skip: 3, hint: 3, eliminate: 3 },
      shuffledQuestions: gameState.shuffledQuestions || {},
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage as backup (for offline/guest users)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
    // Save to Supabase if user is authenticated
    if (CURRENT_USER_ID && CURRENT_USER_ID !== 'default-user' && !CURRENT_USER_ID.startsWith('guest_')) {
      const result = await saveGameProgress(CURRENT_USER_ID, dataToSave);
      
      if (result.success) {
        console.log('✅ Progress saved to database');
        return true;
      } else {
        console.error('❌ Failed to save to database:', result.error);
        // localStorage save was successful, so return true
        return true;
      }
    }
    
    console.log('💾 Progress saved to localStorage');
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    return false;
  }
};

// Load game state - Updated to use new Supabase service
export const loadGameState = async () => {
  try {
    // Try to load from Supabase first if user is authenticated
    if (CURRENT_USER_ID && CURRENT_USER_ID !== 'default-user' && !CURRENT_USER_ID.startsWith('guest_')) {
      const dbProgress = await loadGameProgress(CURRENT_USER_ID);
      
      if (dbProgress) {
        console.log('✅ Progress loaded from database');
        
        // Format the data from database to match expected structure
        const formattedProgress = {
          currentModule: dbProgress.current_module || 0,
          currentQuestion: dbProgress.current_question || 0,
          score: dbProgress.total_score || 0,
          level: dbProgress.level || 1,
          xp: dbProgress.xp || 0,
          streak: dbProgress.streak || 0,
          combo: dbProgress.combo || 0,
          perfectModulesCount: dbProgress.perfect_modules_count || 0,
          completedModules: dbProgress.completed_modules || [],
          unlockedModules: dbProgress.unlocked_modules || [0],
          answeredQuestions: dbProgress.answered_questions || {},
          achievements: dbProgress.achievements || [],
          powerUps: dbProgress.power_ups || { skip: 3, hint: 3, eliminate: 3 },
          shuffledQuestions: dbProgress.shuffled_questions || {},
          timestamp: dbProgress.last_saved
        };
        
        // Also update localStorage with latest from database
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedProgress));
        
        return formattedProgress;
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const gameState = JSON.parse(saved);
    console.log('📱 Progress loaded from localStorage');
    return gameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    
    // Last resort: try localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (localError) {
      console.error('Failed to load from localStorage:', localError);
    }
    
    return null;
  }
};

// Clear saved game state - Updated to use new Supabase service
export const clearGameState = async () => {
  try {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Clear from Supabase if user is authenticated
    if (CURRENT_USER_ID && CURRENT_USER_ID !== 'default-user' && !CURRENT_USER_ID.startsWith('guest_')) {
      const result = await clearGameProgress(CURRENT_USER_ID);
      
      if (result.success) {
        console.log('✅ Progress cleared from database');
      } else {
        console.error('❌ Failed to clear from database:', result.error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear game state:', error);
    return false;
  }
};

// Check if saved game exists
export const hasSavedGame = async () => {
  // Check database first
  if (CURRENT_USER_ID && CURRENT_USER_ID !== 'default-user' && !CURRENT_USER_ID.startsWith('guest_')) {
    const dbProgress = await loadGameProgress(CURRENT_USER_ID);
    if (dbProgress) return true;
  }
  
  // Check localStorage
  return localStorage.getItem(STORAGE_KEY) !== null;
};

// Get save game metadata (without loading full state)
export const getSaveMetadata = async () => {
  try {
    // Try to get from database first
    if (CURRENT_USER_ID && CURRENT_USER_ID !== 'default-user' && !CURRENT_USER_ID.startsWith('guest_')) {
      const dbProgress = await loadGameProgress(CURRENT_USER_ID);
      if (dbProgress) {
        return {
          score: dbProgress.total_score || 0,
          level: dbProgress.level || 1,
          completedModules: dbProgress.completed_modules?.length || 0,
          timestamp: dbProgress.last_saved,
          totalModules: 5 // Update this based on your actual module count
        };
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const gameState = JSON.parse(saved);
    return {
      score: gameState.score || 0,
      level: gameState.level || 1,
      completedModules: gameState.completedModules?.length || 0,
      timestamp: gameState.timestamp,
      totalModules: 5 // Update this based on your actual module count
    };
  } catch (error) {
    console.error('Failed to get save metadata:', error);
    return null;
  }
};

// Export game progress as JSON (for backup)
export const exportProgress = (gameState) => {
  const dataToExport = {
    gameVersion: '2.0.0', // Updated version
    exportDate: new Date().toISOString(),
    userId: CURRENT_USER_ID,
    gameState: {
      currentModule: gameState.currentModule,
      currentQuestion: gameState.currentQuestion,
      score: gameState.score,
      level: gameState.level,
      xp: gameState.xp,
      streak: gameState.streak,
      combo: gameState.combo,
      perfectModulesCount: gameState.perfectModulesCount,
      completedModules: gameState.completedModules,
      unlockedModules: gameState.unlockedModules,
      answeredQuestions: gameState.answeredQuestions,
      achievements: Array.isArray(gameState.achievements) 
        ? gameState.achievements.map(a => typeof a === 'string' ? a : a.id)
        : [],
      powerUps: gameState.powerUps,
      shuffledQuestions: gameState.shuffledQuestions
    }
  };
  
  return JSON.stringify(dataToExport, null, 2);
};

// Import game progress from JSON
export const importProgress = async (jsonString) => {
  try {
    const imported = JSON.parse(jsonString);
    if (imported.gameState) {
      // Save the imported state
      const success = await saveGameState(imported.gameState);
      if (success) {
        return imported.gameState;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to import progress:', error);
    return null;
  }
};

// Migrate progress from old user to new user
export const migrateProgress = async (oldUserId, newUserId) => {
  try {
    // Load progress from old user
    const oldStorageKey = `ifrs17-progress-${oldUserId}`;
    const oldProgress = localStorage.getItem(oldStorageKey);
    
    if (oldProgress) {
      // Save to new user
      setStorageUser(newUserId);
      const progressData = JSON.parse(oldProgress);
      const success = await saveGameState(progressData);
      
      if (success) {
        // Clear old progress
        localStorage.removeItem(oldStorageKey);
        console.log('✅ Progress migrated successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to migrate progress:', error);
    return false;
  }
};

// Sync local progress to database (for when user signs in)
export const syncLocalToDatabase = async (userId) => {
  try {
    const localProgress = localStorage.getItem(STORAGE_KEY);
    if (!localProgress) return false;
    
    const progressData = JSON.parse(localProgress);
    setStorageUser(userId);
    
    const success = await saveGameState(progressData);
    if (success) {
      console.log('✅ Local progress synced to database');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to sync local to database:', error);
    return false;
  }
};