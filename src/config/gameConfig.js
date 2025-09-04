// src/config/gameConfig.js
// Feature flags and configuration for the IFRS 17 Training Game

export const GAME_CONFIG = {
  // Feature flag for deferred authentication
  // When true, users can play Module 1 without authentication
  // Authentication is only required to access Module 2+
  ENABLE_DEFERRED_AUTH: true,
  
  // Storage keys
  STORAGE_KEYS: {
    GUEST_USER: 'kb.guest.id',
    GUEST_PROGRESS: 'kb.progress', 
    GUEST_ACHIEVEMENTS: 'kb.achievements'
  },
  
  // Module access configuration
  MODULE_ACCESS: {
    // Modules accessible without authentication
    GUEST_ACCESSIBLE_MODULES: [0], // Module 1 only
    
    // Minimum modules unlocked for authenticated users
    AUTHENTICATED_MIN_UNLOCKED: [0, 1] // Modules 1 and 2
  },
  
  // Telemetry event names
  TELEMETRY_EVENTS: {
    GUEST_SESSION_STARTED: 'guest_session_started',
    MODULE1_COMPLETED_GUEST: 'module1_completed_guest',
    AUTH_PROMPT_SHOWN_AFTER_MODULE1: 'auth_prompt_shown_after_module1',
    GUEST_PROGRESS_MERGED: 'guest_progress_merged',
    MODULE2_UNLOCKED_POST_AUTH: 'module2_unlocked_post_auth',
    GUEST_AUTH_DEFERRED: 'guest_auth_deferred'
  }
};
