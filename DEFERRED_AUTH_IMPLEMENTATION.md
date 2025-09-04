# Deferred Authentication Implementation

## Overview
This document outlines the implementation of the "enable-signup-after-module1" feature, which allows users to play Module 1 immediately without authentication, and only prompts for authentication after completing Module 1 to access Module 2 and beyond.

## Key Changes

### 1. Configuration (`src/config/gameConfig.js`)
- Added `ENABLE_DEFERRED_AUTH` feature flag (default: `true`)
- Defined guest-accessible modules (Module 1 only by default)
- Added telemetry event constants for tracking
- Defined storage key constants

### 2. App.js Changes
- **BEFORE**: App.js required authentication before showing the game
- **AFTER**: App.js allows immediate access to the game component
- Authentication screen only shows when explicitly requested via `showAuth` state

### 3. Enhanced Guest User Service (`src/modules/guestUserService.js`)
- Added progress migration functionality from guest to authenticated users
- Enhanced telemetry tracking with structured events
- Added helper functions to check Module 1 completion status
- Implemented `migrateGuestToAuthenticatedUser()` for seamless data transfer

### 4. IFRS17TrainingGame.js Changes

#### User Initialization
- **BEFORE**: Required authenticated user or created guest as fallback
- **AFTER**: Always starts in guest mode unless authenticated user provided
- Implements proper guest-to-authenticated user transition

#### Module Access Control
- Guest users can only access Module 1 (configurable via `GAME_CONFIG.MODULE_ACCESS.GUEST_ACCESSIBLE_MODULES`)
- Attempting to access Module 2+ triggers authentication modal
- Module locking visual indicators updated for guest users

#### Module 1 Completion Flow
- **BEFORE**: Basic completion with auth modal
- **AFTER**: Enhanced flow with:
  1. Show module completion screen with results
  2. Save guest progress to localStorage
  3. After 3-second delay, show authentication modal
  4. If auth declined, Module 2 remains locked with friendly messaging

#### Authentication Modal Integration
- Modal shows after Module 1 completion with contextual messaging
- "Remind Me Later" option allows continuing as guest (Module 2 stays locked)
- Success authentication triggers progress migration

### 5. AuthenticationModal.js Updates
- Updated messaging for post-Module-1 completion context
- Changed "Continue as Guest" to "Remind Me Later" with clearer indication
- Enhanced copy to reflect the completion achievement

## New Behavior Flow

### Fresh User Journey
1. **Landing**: User arrives at game, sees Module 1 available immediately
2. **Header**: Shows "Guest User" with "Sign In/Sign Up" buttons
3. **Module 1**: Fully playable without authentication
4. **Completion**: Results screen shown first, then authentication modal after 3s delay
5. **Choice**: User can sign up, sign in, or dismiss modal
6. **Post-Auth**: If authenticated, Module 2 unlocks and progress is migrated

### Returning Guest User
1. **Loading**: Previous guest progress loaded from localStorage
2. **State**: Module 1 completion status preserved
3. **Access**: If Module 1 completed, auth modal appears when trying Module 2

### Authenticated User
1. **Access**: All unlocked modules available based on progression
2. **Progress**: Synced with database
3. **Migration**: Any existing guest progress merged on first auth

## Technical Implementation Details

### Progress Migration
```javascript
const migrateGuestToAuthenticatedUser = async (authenticatedUser, gameStateService) => {
  // 1. Retrieve guest progress from localStorage
  // 2. Merge with authenticated user context
  // 3. Save to database under authenticated user ID
  // 4. Unlock Module 2 for authenticated users
  // 5. Clear guest localStorage data
  // 6. Track migration telemetry
}
```

### Module Access Control
```javascript
// Guest users can only access modules in GUEST_ACCESSIBLE_MODULES (default: [0])
if (isGuest && !GAME_CONFIG.MODULE_ACCESS.GUEST_ACCESSIBLE_MODULES.includes(moduleIndex)) {
  showAuthModal(true);
  return;
}
```

### Telemetry Events
- `guest_session_started`: When guest user first created
- `module1_completed_guest`: When guest completes Module 1
- `auth_prompt_shown_after_module1`: When modal shown post-completion
- `guest_progress_merged`: When successful migration occurs
- `module2_unlocked_post_auth`: When Module 2 becomes available
- `guest_auth_deferred`: When user dismisses auth modal

## Safeguards & Edge Cases

### Network/Auth Failures
- User remains in guest mode
- Non-blocking error messages shown
- Module 1 remains replayable

### Modal Dismissal
- Module 2 stays locked with "Sign up to unlock" messaging
- Friendly tooltip explaining requirement
- No loss of Module 1 progress

### Data Integrity
- Guest progress preserved until successful migration
- Duplicate prevention in database
- Fallback loading mechanisms

### Browser Storage
- localStorage used for guest data
- Automatic cleanup after successful migration
- Graceful handling of storage quota issues

## Configuration Options

### Feature Flag
```javascript
GAME_CONFIG.ENABLE_DEFERRED_AUTH = true; // Enable/disable feature
```

### Module Access
```javascript
GAME_CONFIG.MODULE_ACCESS.GUEST_ACCESSIBLE_MODULES = [0]; // Modules 1 only
GAME_CONFIG.MODULE_ACCESS.AUTHENTICATED_MIN_UNLOCKED = [0, 1]; // Modules 1 & 2
```

### Storage Keys
```javascript
GAME_CONFIG.STORAGE_KEYS.GUEST_USER = 'kb.guest.id';
GAME_CONFIG.STORAGE_KEYS.GUEST_PROGRESS = 'kb.progress';
```

## Testing Checklist

- ✅ Fresh browser → Module 1 accessible immediately
- ✅ Module 1 completion → Results screen → Auth modal (3s delay)
- ✅ Sign Up → Module 2 unlocks → Progress preserved
- ✅ Module 2 attempt as guest → Auth modal
- ✅ Modal dismissal → Module 2 stays locked
- ✅ Returning guest → Progress loaded
- ✅ Authenticated user → Normal flow unchanged
- ✅ Network failure → Graceful fallback
- ✅ Browser refresh → State persistence

## Migration & Rollback

### Enabling Feature
1. Set `ENABLE_DEFERRED_AUTH = true`
2. Deploy changes
3. Monitor telemetry for guest_session_started events

### Disabling Feature (if needed)
1. Set `ENABLE_DEFERRED_AUTH = false`
2. App.js will revert to requiring auth before game access
3. Existing guest data will be preserved in localStorage

### Data Migration
- No database schema changes required
- Existing authenticated users unaffected
- Guest data automatically migrated on first auth
