# IFRS17 Training Game - Last Module Persistence Fix

## Problem Summary
Even after migrating persistence to `users.last_module_id`, the app still starts at Module 1 after restart. In Supabase, for user "Kenbright AI", `users.last_module_id = 4`, but expected behavior is to navigate to Module 5 (i.e., `last_module_id + 1`).

## Root Causes Found

### 🔴 Critical Issues
1. **Missing Database Columns**: The `users` table was missing `last_module_id` and `last_question_index` columns
2. **Disabled Save Function**: `saveGameProgress()` was completely disabled "for leaderboard testing"
3. **No Write Logic**: No code was actually writing to `users.last_module_id` when modules were completed
4. **Incorrect Resume Logic**: Startup logic wasn't properly reading and navigating to `last_module_id + 1`

## Changes Made

### 1. Database Schema Updates

**File: `migrations/2025-08-27_add-last-module-to-users.sql`** (NEW)
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_module_id INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_question_index INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_users_last_module ON users(last_module_id);
```

**File: `complete-database-setup.sql`** (UPDATED)
- Added `last_module_id INTEGER DEFAULT 0` to users table
- Added `last_question_index INTEGER DEFAULT 0` to users table

### 2. Backend Service Updates

**File: `src/modules/supabaseService.js`** (MAJOR UPDATES)

#### Re-enabled and Fixed `saveGameProgress()`
```javascript
export const saveGameProgress = async (userId, progressData) => {
  // Calculate last completed module for users.last_module_id
  const completedModules = progressData.completedModules || [];
  const lastCompletedModule = completedModules.length > 0 ? Math.max(...completedModules) : 0;
  
  // Save to game_progress table (existing logic)
  // ...
  
  // CRITICAL: Update users.last_module_id for resume functionality
  const { data: userUpdateData, error: userUpdateError } = await supabase
    .from('users')
    .update({
      last_module_id: lastCompletedModule,
      last_question_index: progressData.currentQuestion || 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
}
```

#### Added `getUserResumeModule()` Function
```javascript
export const getUserResumeModule = async (userId, totalModules = 10) => {
  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .select('last_module_id')
    .eq('id', userId)
    .single();

  const lastModuleId = typeof userRow.last_module_id === 'number' ? userRow.last_module_id : 0;
  const nextModuleIndex = Math.min(lastModuleId + 1, totalModules - 1);
  
  return {
    moduleIndex: nextModuleIndex,
    lastCompletedModule: lastModuleId,
    source: 'users_table'
  };
};
```

#### Enhanced `getUserProfileLastLocation()` with Logging
- Added detailed console.info logging for debugging
- Better error handling and null checks

### 3. Frontend Game Logic Updates

**File: `src/IFRS17TrainingGame.js`** (MAJOR UPDATES)

#### Updated Imports
```javascript
import { getUserResumeModule } from './modules/supabaseService';
```

#### Fixed `tryResumeLastLocation()` Function
```javascript
const tryResumeLastLocation = async (sourceHint) => {
  if (!isGuest && currentUser?.id) {
    // For authenticated users, use the resume module logic (last_module_id + 1)
    const resumeData = await getUserResumeModule(currentUser.id, modules.length);
    const targetModule = resumeData.moduleIndex;
    const lastCompleted = resumeData.lastCompletedModule;
    
    // Unlock all modules up to the target module
    const unlockedRange = Array.from({ length: targetModule + 1 }, (_, i) => i);
    setUnlockedModules(prev => Array.from(new Set([...(prev || [0]), ...unlockedRange])));
    
    // Mark completed modules
    if (lastCompleted >= 0) {
      const completedRange = Array.from({ length: lastCompleted + 1 }, (_, i) => i);
      setCompletedModules(prev => Array.from(new Set([...(prev || []), ...completedRange])));
    }
    
    // Navigate to the target module
    navigateToModule(targetModule, 0);
  }
  // ... guest logic unchanged
};
```

#### Fixed "Sync Progress" Button
```javascript
const handleManualSync = async () => {
  // Save current progress first
  const saveResult = await saveProgress();
  
  // Get resume module and navigate there
  const resumeData = await getUserResumeModule(currentUser.id, modules.length);
  const targetModule = resumeData.moduleIndex;
  const lastCompleted = resumeData.lastCompletedModule;
  
  // Navigate to target module
  navigateToModule(targetModule, 0);
  
  alert(`Progress synced! Navigated to Module ${targetModule + 1} (next after completed Module ${lastCompleted + 1}).`);
};
```

#### Fixed Module Completion Logic
```javascript
// In completeModule() function
const newCompletedModules = [...completedModules, currentModule];
setCompletedModules(newCompletedModules);

// Save with updated completed modules to ensure users.last_module_id is updated
const progressData = {
  // ... other data
  completedModules: newCompletedModules, // Use the new completed modules
};

const saveResult = await saveGameProgress(currentUser.id, progressData);
```

### 4. Testing Infrastructure

**File: `test-persistence-fix.js`** (NEW)
- Comprehensive test suite to verify all persistence functionality
- Tests database schema, user data, resume logic, and module completion
- Available in browser console as `window.persistenceTests.runAllTests()`

## Expected Behavior After Fix

### On Login/App Start:
1. App reads `users.last_module_id` for authenticated user
2. Calculates next module = `last_module_id + 1` (bounded by total modules)
3. Unlocks all modules up to target module
4. Marks modules 0 through `last_module_id` as completed
5. Navigates to the target module
6. Console shows: `"User resume calculation: last_module_id=4 → next module=5"`

### On Module Completion:
1. Module score is submitted to leaderboard
2. `completedModules` state is updated
3. `saveGameProgress()` is called with new completed modules
4. `users.last_module_id` is updated to highest completed module
5. Console shows: `"Updated users.last_module_id = 4 for user [id]"`

### On Sync Progress Button:
1. Current progress is saved
2. `getUserResumeModule()` is called
3. User navigates to `last_module_id + 1`
4. Alert shows: `"Progress synced! Navigated to Module 5 (next after completed Module 4)."`

## Required Database Migration

Run this SQL in your Supabase SQL editor:

```sql
-- Add the missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_module_id INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_question_index INTEGER DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_last_module ON users(last_module_id);

-- Set default values for existing users
UPDATE users SET last_module_id = 0 WHERE last_module_id IS NULL;
UPDATE users SET last_question_index = 0 WHERE last_question_index IS NULL;
```

## Verification Steps

1. **Run the database migration** in Supabase SQL editor
2. **Deploy the updated code** to your environment
3. **Login as "Kenbright AI"** (the user with `last_module_id = 4`)
4. **Check console logs** for: `"User resume calculation: last_module_id=4 → next module=5"`
5. **Verify navigation** to Module 5 automatically
6. **Complete Module 5** and verify `users.last_module_id` becomes `5`
7. **Hard reload/restart** app and verify navigation to Module 6
8. **Test Sync Progress** button to ensure it navigates correctly

## Console Commands for Testing

Open browser console and run:
```javascript
// Load the test script
const script = document.createElement('script');
script.src = '/test-persistence-fix.js';
document.head.appendChild(script);

// After loading, run tests
window.persistenceTests.runAllTests();
```

## Remaining Edge Cases to Monitor

1. **User with no completed modules** should start at Module 1
2. **User who completed all modules** should stay at final module
3. **Invalid/corrupted data** should fallback gracefully to Module 1
4. **Guest users** should continue using localStorage as before
5. **Network errors** during save should not break the UI

## Performance Notes

- Added database index on `users.last_module_id` for faster queries
- Resume logic runs only once per session to avoid repeated calls
- Logging can be reduced in production by filtering console.info calls
