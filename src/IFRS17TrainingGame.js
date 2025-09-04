// IFRS17TrainingGame.js - Updated with deferred authentication
import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Star, Zap, Lock, CheckCircle, XCircle, TrendingUp, 
  Award, Clock, LogIn, UserPlus 
} from 'lucide-react';
import { modules } from './data/IFRS17Modules';
import { 
  achievementsList, 
  getNewAchievements, 
  createAchievementStats, 
  getGenderBasedAchievementName, 
  getGenderBasedAchievementIcon 
} from './modules/achievements';
import { 
  INITIAL_POWER_UPS, 
  consumePowerUp, 
  refreshPowerUps, 
  canUsePowerUp, 
  getPowerUpInfo 
} from './modules/powerUps';
import { 
  createGuestUser, 
  getGuestUser, 
  saveGuestProgress, 
  getGuestProgress,
  trackGuestEvent,
  migrateGuestToAuthenticatedUser,
  hasGuestCompletedModule1,
  getGuestModule1Completion
} from './modules/guestUserService';
import { GAME_CONFIG } from './config/gameConfig';
import AuthenticationModal from './components/AuthenticationModal';
import LeaderboardModal from './modules/LeaderboardModal';
import GameGuideFAQ from './components/GameGuideFAQ';

// Import new Supabase service functions
import supabase, {
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
  submitModuleScore,
  getOverallLeaderboard,
  getModuleLeaderboard,
  syncAllGameData,
  testConnection
} from './modules/supabaseService';

import { saveGameState, loadGameState, setStorageUser, setLastLocation, getLastLocation } from './modules/storageService';
import { getUserProfileLastLocation, updateUserProfileLastLocation } from './modules/supabaseService';


const IFRS17TrainingGame = ({ currentUser: propsUser, onLogout, onShowAuth }) => {
  // User state - Always start in guest mode unless authenticated user is provided
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [pendingModule1Completion, setPendingModule1Completion] = useState(null);
  
  // Game state
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [unlockedModules, setUnlockedModules] = useState([0]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState(INITIAL_POWER_UPS);
  const [completedModules, setCompletedModules] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const [moduleScore, setModuleScore] = useState(0);
  const [perfectModule, setPerfectModule] = useState(true);
  const [perfectModulesCount, setPerfectModulesCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [moduleStartTime, setModuleStartTime] = useState(null);
  const [completedModuleScore, setCompletedModuleScore] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState({});
  const [currentTime, setCurrentTime] = useState(0);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [timerState, setTimerState] = useState('idle'); // 'idle' | 'running' | 'stopped'
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerInterval = useRef(null);
  const [isBootingResume, setIsBootingResume] = useState(true);
  const hasTriedResumeRef = useRef(false);
  
  // Per-module answer stats for tracker (correct vs wrong)
  const moduleAnsweredEntries = Object.entries(answeredQuestions || {}).filter(([key]) => 
    key.startsWith(`${currentModule}-`)
  );
  const correctCount = moduleAnsweredEntries.filter(([, v]) => v?.wasCorrect).length;
  const wrongCount = moduleAnsweredEntries.filter(([, v]) => v?.answered && v?.wasCorrect === false).length;
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get shuffled questions for a module
  const getShuffledQuestions = (moduleIndex) => {
    if (!shuffledQuestions[moduleIndex]) {
      const originalQuestions = modules[moduleIndex].questions;
      const shuffled = shuffleArray(originalQuestions.map((q, index) => ({ 
        ...q, 
        originalIndex: index 
      })));
      setShuffledQuestions(prev => ({
        ...prev,
        [moduleIndex]: shuffled
      }));
      return shuffled;
    }
    return shuffledQuestions[moduleIndex];
  };

  // Centralized navigation helper used by both loader and gameplay
  const navigateToModule = (moduleIndex, questionIndex = 0) => {
    const maxModule = modules.length - 1;
    const validModule = Math.max(0, Math.min(moduleIndex ?? 0, maxModule));
    // Ensure shuffled questions exist for the destination module
    getShuffledQuestions(validModule);
    const totalQ = modules[validModule]?.questions?.length || 0;
    const clampedQ = Math.max(0, Math.min(questionIndex ?? 0, Math.max(0, totalQ - 1)));
    setCurrentModule(validModule);
    setCurrentQuestion(clampedQ);
  };

  // Persist last location depending on auth state
  const persistLastLocation = async ({ moduleId, questionIndex }) => {
    try {
      console.info(`🔍 persistLastLocation called: moduleId=${moduleId}, questionIndex=${questionIndex}, isGuest=${isGuest}, userId=${currentUser?.id}`);
      
      if (isGuest) {
        setLastLocation({ moduleId, questionIndex });
        console.info(`🔍 Saved to localStorage: moduleId=${moduleId}, questionIndex=${questionIndex}`);
      } else if (currentUser?.id) {
        await updateUserProfileLastLocation(currentUser.id, { moduleId, questionIndex });
        console.info(`🔍 Saved to users table: moduleId=${moduleId}, questionIndex=${questionIndex} for user ${currentUser.id}`);
      }
    } catch (e) {
      console.warn('persistLastLocation failed:', e);
    }
  };
  
  // Handle user prop changes (authentication state changes)
  useEffect(() => {
    console.log('User prop effect triggered:', { propsUser, currentUserId: currentUser?.id });
    
    if (propsUser && propsUser !== currentUser && !propsUser.isGuest) {
      console.log('Authenticated user provided, transitioning from guest:', propsUser);
      setCurrentUser(propsUser);
      setIsGuest(false);
      setStorageUser(propsUser.id);
      
      // Reset resume guard for new user
      hasTriedResumeRef.current = false;
      
      // Handle guest progress migration
      handleGuestToAuthenticatedTransition(propsUser);
      
    } else if (!propsUser && (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true)) {
      // No authenticated user provided and deferred auth is enabled - initialize guest mode
      // Default to true if config is not loaded
      initializeGuestMode();
    }
  }, [propsUser]);

  // Initialize guest mode for deferred authentication
  const initializeGuestMode = () => {
    console.log('🎮 Initializing guest mode for deferred authentication');
    
    try {
      let guestUser = getGuestUser();
      if (!guestUser) {
        guestUser = createGuestUser();
        console.log('📝 Created new guest user:', guestUser.id);
      } else {
        console.log('🔄 Loading existing guest user:', guestUser.id);
        trackGuestEvent('guest_user_loaded', { guestId: guestUser.id });
      }
      
      setCurrentUser(guestUser);
      setIsGuest(true);
      setStorageUser(guestUser.id);
      
      // Load guest progress
      loadGuestProgressData();
  // Attempt resume after local progress load
  queueResumeCheck('guest');
    } catch (error) {
      console.error('❌ Error initializing guest mode:', error);
      
      // Fallback: create minimal guest user
      const fallbackGuest = {
        id: `guest_fallback_${Date.now()}`,
        name: 'Guest User',
        avatar: 'G',
        isGuest: true
      };
      
      setCurrentUser(fallbackGuest);
      setIsGuest(true);
      
      trackGuestEvent('guest_initialization_error', { 
        error: error.message,
        fallbackUsed: true
      });
    }
  };

  // Handle transition from guest to authenticated user
  const handleGuestToAuthenticatedTransition = async (authenticatedUser) => {
    console.log('🔄 Handling guest to authenticated user transition');
    
    try {
      // Attempt to migrate guest progress
      const migrationResult = await migrateGuestToAuthenticatedUser(
        authenticatedUser,
        { saveGameState, setStorageUser }
      );
      
      if (migrationResult.success) {
        console.log('✅ Guest progress successfully migrated');
        
        // Apply migrated progress to current state
        const mergedProgress = migrationResult.mergedProgress;
        if (mergedProgress) {
          setCurrentModule(mergedProgress.currentModule || 0);
          setCurrentQuestion(mergedProgress.currentQuestion || 0);
          setScore(mergedProgress.score || 0);
          setLevel(mergedProgress.level || 1);
          setXp(mergedProgress.xp || 0);
          setStreak(mergedProgress.streak || 0);
          setCombo(mergedProgress.combo || 0);
          setPerfectModulesCount(mergedProgress.perfectModulesCount || 0);
          setCompletedModules(mergedProgress.completedModules || []);
          setUnlockedModules(mergedProgress.unlockedModules || [0, 1]);
          setAnsweredQuestions(mergedProgress.answeredQuestions || {});
          setPowerUps(mergedProgress.powerUps || INITIAL_POWER_UPS);
          setShuffledQuestions(mergedProgress.shuffledQuestions || {});
          
          // Restore achievements
          const restoredAchievements = achievementsList.filter(a => 
            mergedProgress.achievements?.includes(a.id)
          );
          setAchievements(restoredAchievements);
        }
        
        // Clear any pending module completion since it's now merged
        setPendingModule1Completion(null);

  // After migration, try to sync last location up to Supabase if local is newer
  await syncLastLocationOnLogin(authenticatedUser.id);
  queueResumeCheck('auth');
        
      } else {
        console.log('⚠️ No guest progress to migrate, loading authenticated user progress');
        // Load authenticated user progress from database
        loadUserProgress(authenticatedUser.id);
  await syncLastLocationOnLogin(authenticatedUser.id);
  queueResumeCheck('auth');
      }
    } catch (error) {
      console.error('❌ Error during guest to authenticated transition:', error);
      // Fallback: load authenticated user progress
      loadUserProgress(authenticatedUser.id);
  await syncLastLocationOnLogin(authenticatedUser.id);
  queueResumeCheck('auth');
    }
  };

  // Load current user on component mount (deferred auth logic)
  useEffect(() => {
    // If authenticated user is provided as prop, handle it in the prop effect
    if (propsUser && !propsUser.isGuest) {
      return;
    }
    
    // For deferred authentication, always start in guest mode
    if ((GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true) && !propsUser) {
      initializeGuestMode();
      return;
    }
    
    // Legacy behavior: try to load authenticated user (fallback)
    const loadUser = async () => {
      try {
        const authenticatedUser = await getCurrentUser();
        
        if (authenticatedUser && !authenticatedUser.isGuest) {
          setCurrentUser(authenticatedUser);
          setIsGuest(false);
          setStorageUser(authenticatedUser.id);
          trackGuestEvent('authenticated_user_loaded', { userId: authenticatedUser.id });
          
          // Load saved progress from database
          loadUserProgress(authenticatedUser.id);
        } else {
          // Fall back to guest mode
          initializeGuestMode();
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Fall back to guest mode
        initializeGuestMode();
      }
    };
    
    loadUser();
  }, []); // Only run once on mount

  // Load user progress from database
  // Canonical load user progress from users table
  const loadUserProgress = async (userId) => {
    try {
      // Fetch canonical progress fields from users table
      const { data, error } = await supabase
        .from('users')
        .select('last_module_id, last_question_index, score, streak, combo, completed_modules')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('❌ Error loading user progress:', error);
        setUnlockedModules([0, 1]);
        setCompletedModules([]);
        setCurrentModule(0);
        setCurrentQuestion(0);
        setScore(0);
        setStreak(0);
        setCombo(1);
        queueResumeCheck('auth');
        return;
      }

      // Hydrate UI state
      setScore(data.score ?? 0);
      setStreak(data.streak ?? 0);
      setCombo(data.combo ?? 1);
      setCompletedModules(Array.isArray(data.completed_modules) ? data.completed_modules : []);
      setCurrentQuestion(data.last_question_index ?? 0);

      // Compute next module (bounded)
      const nextModule = Math.max(1, Math.min((data.last_module_id ?? 0) + 1, modules.length));
      setCurrentModule(nextModule - 1); // zero-based index

      // Unlock modules up to last_module_id
      const unlocked = Array.from({ length: nextModule }, (_, i) => i);
      setUnlockedModules(unlocked);

      // Telemetry log
      console.info('[BOOT]', { authUserId: userId, fetched: data, nextModule });

      // Insert audit event
      await supabase.from('progress_events').insert({
        user_id: userId,
        event_type: 'LOGIN_RESUME',
        module_id: nextModule,
        payload: {
          last_module_id: data.last_module_id,
          last_question_index: data.last_question_index,
          score: data.score,
          streak: data.streak,
          combo: data.combo,
          completed_modules: data.completed_modules
        }
      });

      queueResumeCheck('auth');
    } catch (error) {
      console.error('❌ Error loading canonical user progress:', error);
      setUnlockedModules([0, 1]);
      setCompletedModules([]);
      setCurrentModule(0);
      setCurrentQuestion(0);
      setScore(0);
      setStreak(0);
      setCombo(1);
      queueResumeCheck('auth');
    }
  };

  // Load guest progress from localStorage
  const loadGuestProgressData = () => {
    try {
      const savedState = getGuestProgress();
      
      if (savedState) {
        console.log('📂 Loading guest progress from localStorage');
        
        // Restore game state with fallbacks
        setCurrentModule(savedState.currentModule || 0);
        setCurrentQuestion(savedState.currentQuestion || 0);
        setScore(savedState.score || 0);
        setLevel(savedState.level || 1);
        setXp(savedState.xp || 0);
        setCompletedModules(savedState.completedModules || []);
        setAnsweredQuestions(savedState.answeredQuestions || {});
        setPowerUps(savedState.powerUps || INITIAL_POWER_UPS);
        setStreak(savedState.streak || 0);
        setCombo(savedState.combo || 0);
        setPerfectModulesCount(savedState.perfectModulesCount || 0);
        setShuffledQuestions(savedState.shuffledQuestions || {});
        
        // For guest users, only unlock Module 1 by default
        const guestUnlockedModules = [0];
        setUnlockedModules(guestUnlockedModules);
        
        // Restore achievements safely
        try {
          const restoredAchievements = achievementsList.filter(a => 
            savedState.achievements?.includes(a.id)
          );
          setAchievements(restoredAchievements);
        } catch (achievementError) {
          console.warn('⚠️ Error restoring achievements:', achievementError);
          setAchievements([]);
        }
        
        console.log('✅ Guest progress loaded successfully');
  // We'll resume via queueResumeCheck called in initializeGuestMode
      } else {
        console.log('📭 No existing guest progress found, starting fresh');
        // Ensure fresh guest state
        setUnlockedModules([0]); // Only Module 1 unlocked for guests
        setCompletedModules([]);
      }
    } catch (error) {
      console.error('❌ Error loading guest progress:', error);
      
      // Fallback to safe defaults
      setCurrentModule(0);
      setCurrentQuestion(0);
      setScore(0);
      setLevel(1);
      setXp(0);
      setUnlockedModules([0]);
      setCompletedModules([]);
      setAnsweredQuestions({});
      setPowerUps(INITIAL_POWER_UPS);
      setAchievements([]);
      
      trackGuestEvent('guest_progress_load_error', { 
        error: error.message 
      });
    }
  };

  // Debounced/guarded resume check to avoid flicker
  const queueResumeCheck = (source) => {
    if (hasTriedResumeRef.current) return; // run once per mount/auth change
    hasTriedResumeRef.current = true;
    // Slight delay to allow state (unlockedModules, etc.) to settle
    setTimeout(async () => {
      await tryResumeLastLocation(source);
      setIsBootingResume(false);
    }, 50);
  };

  // Attempt to resume last location from cloud or local
  const tryResumeLastLocation = async (sourceHint) => {
    try {
      let lastLoc = null;
      let source = 'none';
      if (!isGuest && currentUser?.id) {
        lastLoc = await getUserProfileLastLocation(currentUser.id);
        source = lastLoc ? lastLoc.source || 'cloud' : 'cloud';
      } else {
        lastLoc = getLastLocation();
        source = lastLoc ? 'local' : 'local';
      }

      if (!lastLoc) {
        console.log('resume_location_missing');
        return;
      }

      const desiredModule = lastLoc.moduleId ?? 0;
      const desiredQ = lastLoc.questionIndex ?? 0;

      // Validate against unlocked modules
      const highestUnlocked = (unlockedModules && unlockedModules.length > 0)
        ? Math.max(...unlockedModules)
        : 0;
      const isUnlocked = unlockedModules?.includes(desiredModule);

      // For authenticated users, trust cloud/local last location and unlock up to that module if needed
      if (!isUnlocked && !isGuest) {
        const range = Array.from({ length: desiredModule + 1 }, (_, i) => i);
        setUnlockedModules(prev => Array.from(new Set([...(prev || [0]), ...range])));
      }

      const targetModule = (!isUnlocked && isGuest) ? highestUnlocked : desiredModule;

      // Clamp question index to module length (use desired module length if we just unlocked it)
      const totalQ = modules[targetModule]?.questions?.length || 0;
      const clampedQ = Math.max(0, Math.min(desiredQ, Math.max(0, totalQ - 1)));

      navigateToModule(targetModule, clampedQ);
      console.log('resume_location_applied', { source, moduleId: targetModule, questionIndex: clampedQ });
    } catch (e) {
      console.warn('Failed to apply resume location:', e);
    }
  };

  // When a guest signs in, compare timestamps and push newer local last location to Supabase
  const syncLastLocationOnLogin = async (userId) => {
    try {
      const local = getLastLocation();
      const cloud = await getUserProfileLastLocation(userId);
      const localTs = local?.ts ? Date.parse(local.ts) : 0;
      const cloudTs = cloud?.ts ? Date.parse(cloud.ts) : 0;
      if (local && (!cloud || localTs > cloudTs)) {
        await updateUserProfileLastLocation(userId, { moduleId: local.moduleId ?? 0, questionIndex: local.questionIndex ?? 0 });
      }
    } catch (e) {
      console.warn('syncLastLocationOnLogin failed:', e);
    }
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer management functions
  const startTimer = () => {
    if (timerState !== 'idle') return;
    
    console.log('🕐 Starting quiz timer for first answer');
    const startTime = new Date();
    setModuleStartTime(startTime);
    setTimerState('running');
    setCurrentTime(0);
    setElapsedTime(0);
    
    // Store start time in sessionStorage to survive refresh
    sessionStorage.setItem(`timer_start_${currentModule}`, startTime.toISOString());
    sessionStorage.setItem(`timer_state_${currentModule}`, 'running');
  };

  const stopTimer = () => {
    if (timerState !== 'running') return;
    
    console.log('🛑 Stopping quiz timer after final answer');
    setTimerState('stopped');
    
    // Calculate final elapsed time
    if (moduleStartTime) {
      const finalElapsed = Math.floor((new Date() - moduleStartTime) / 1000);
      setElapsedTime(finalElapsed);
      setCurrentTime(finalElapsed);
      
      // Store final time in sessionStorage
      sessionStorage.setItem(`timer_elapsed_${currentModule}`, finalElapsed.toString());
      sessionStorage.setItem(`timer_state_${currentModule}`, 'stopped');
    }
    
    // Clear interval
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const resetTimer = () => {
    console.log('🔄 Resetting timer to idle state');
    setTimerState('idle');
    setModuleStartTime(null);
    setCurrentTime(0);
    setElapsedTime(0);
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Clear sessionStorage
    sessionStorage.removeItem(`timer_start_${currentModule}`);
    sessionStorage.removeItem(`timer_state_${currentModule}`);
    sessionStorage.removeItem(`timer_elapsed_${currentModule}`);
  };

  // Get total questions in current module
  const getTotalQuestions = () => {
    return getShuffledQuestions(currentModule)?.length || 0;
  };

  // Updated Timer useEffect - only runs when timer is in 'running' state
  useEffect(() => {
    if (timerState === 'running' && moduleStartTime && !completedModules.includes(currentModule)) {
      const interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - moduleStartTime) / 1000);
        setCurrentTime(elapsed);
        setElapsedTime(elapsed);
      }, 1000);
      
      timerInterval.current = interval;
      
      return () => {
        clearInterval(interval);
        timerInterval.current = null;
      };
    } else {
      // Clear timer if not running
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }
  }, [timerState, moduleStartTime, currentModule, completedModules]);

  // Restore timer state from sessionStorage on component mount/module change
  useEffect(() => {
    if (currentUser && currentModule !== null && !completedModules.includes(currentModule)) {
      const savedState = sessionStorage.getItem(`timer_state_${currentModule}`);
      const savedStartTime = sessionStorage.getItem(`timer_start_${currentModule}`);
      const savedElapsed = sessionStorage.getItem(`timer_elapsed_${currentModule}`);
      
      if (savedState === 'running' && savedStartTime) {
        // Restore running timer
        const startTime = new Date(savedStartTime);
        const currentElapsed = Math.floor((new Date() - startTime) / 1000);
        setModuleStartTime(startTime);
        setTimerState('running');
        setCurrentTime(currentElapsed);
        setElapsedTime(currentElapsed);
        console.log('🔄 Restored running timer from sessionStorage');
      } else if (savedState === 'stopped' && savedElapsed) {
        // Restore stopped timer
        const elapsed = parseInt(savedElapsed);
        setTimerState('stopped');
        setCurrentTime(elapsed);
        setElapsedTime(elapsed);
        console.log('🔄 Restored stopped timer from sessionStorage');
      } else {
        // Fresh start - timer remains idle
        setTimerState('idle');
        setCurrentTime(0);
        setElapsedTime(0);
        console.log('⏸️ Timer initialized in idle state');
      }
    }
  }, [currentUser, currentModule, completedModules]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
        console.log('🧹 Cleaned up timer interval on unmount');
      }
    };
  }, []);

  // Get achievement display data
  const getAchievementDisplayData = (achievement) => {
    const originalAchievement = achievementsList.find(a => a.id === achievement.id);
    if (originalAchievement?.genderBased && currentUser?.gender) {
      return {
        ...achievement,
        name: getGenderBasedAchievementName(originalAchievement, currentUser.gender),
        icon: getGenderBasedAchievementIcon(originalAchievement, currentUser.gender)
      };
    }
    return achievement;
  };

  // Handle answer selection
  const handleAnswer = (answerIndex) => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (answeredQuestions[questionKey]?.answered) return;
    
    // START TIMER: Only when user submits first answer in the module
    if (timerState === 'idle' && currentQuestion === 0) {
      startTimer();
    }
    
    setSelectedAnswer(answerIndex);
    const currentModuleQuestions = getShuffledQuestions(currentModule);
    const currentQuestionData = currentModuleQuestions[currentQuestion];
    const correct = answerIndex === currentQuestionData.correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Track answered question
    const updatedAnsweredQuestions = { 
      ...answeredQuestions, 
      [questionKey]: { 
        answered: true, 
        selectedAnswer: answerIndex, 
        wasCorrect: correct 
      } 
    };
    setAnsweredQuestions(updatedAnsweredQuestions);

    if (correct) {
      const points = 10 * (combo + 1);
      setScore(score + points);
      setModuleScore(prev => prev + points);
      setStreak(streak + 1);
      setCombo(combo + 1);
      setXp(xp + 25);
      
      if (xp + 25 >= level * 100) {
        setLevel(level + 1);
        setXp((xp + 25) % (level * 100));
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 7000);
      }
    } else {
      setStreak(0);
      setCombo(0);
      setPerfectModule(false);
    }

    // Save progress after each answer
    saveProgress();

    // STOP TIMER: Immediately if this is the final question
    const totalQuestions = getTotalQuestions();
    const isLastQuestion = currentQuestion === totalQuestions - 1;
    
    if (isLastQuestion) {
      stopTimer();
    }

    setTimeout(async () => {
      if (currentQuestion < currentModuleQuestions.length - 1) {
  const nextQ = currentQuestion + 1;
  setCurrentQuestion(nextQ);
  // Persist after moving to next question
  persistLastLocation({ moduleId: currentModule, questionIndex: nextQ });
        setShowFeedback(false);
        setSelectedAnswer(null);
      } else {
        // Module complete
        await handleModuleCompletion(correct);
      }
    }, 7000);
  };

  // Handle module completion
  const handleModuleCompletion = async (lastAnswerCorrect) => {
    // Calculate final module score
    const finalModuleScore = lastAnswerCorrect 
      ? moduleScore + (10 * (combo + 1)) 
      : moduleScore;
    
    setCompletedModuleScore(finalModuleScore);

    if (perfectModule) {
      setPerfectModulesCount(prev => prev + 1);
    }

    // Use the final elapsed time from timer (timer should already be stopped)
    const timeTaken = elapsedTime || currentTime || 0;
    console.log(`⏱️ Module completed in ${timeTaken} seconds`);
    
    // Calculate questions correct
    const moduleQuestionKeys = Object.keys(answeredQuestions).filter(
      key => key.startsWith(`${currentModule}-`)
    );
    const questionsCorrect = moduleQuestionKeys.filter(
      key => answeredQuestions[key].wasCorrect
    ).length;

    // Track module completion
    if (isGuest) {
      trackGuestEvent('module_completed', {
        score: finalModuleScore,
        perfect: perfectModule,
        timeSeconds: timeTaken,
        moduleIndex: currentModule
      });
    }

    // Handle Module 1 completion for guest users with deferred authentication
    if (isGuest && currentModule === 0 && (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true)) {
      console.log('🎯 Module 1 completed by guest user - triggering deferred auth');
      
      setPendingModule1Completion({
        score: finalModuleScore,
        perfect: perfectModule,
        timeTaken: timeTaken
      });
      
      // Save guest progress including Module 1 completion
      const updatedCompletedModules = [...completedModules, currentModule];
      await saveGuestProgress({
        currentModule,
        currentQuestion,
        score,
        level,
        xp,
        completedModules: updatedCompletedModules,
        answeredQuestions,
        achievements: achievements.map(a => a.id),
        powerUps,
        streak,
        combo,
        perfectModulesCount: perfectModule ? perfectModulesCount + 1 : perfectModulesCount,
        shuffledQuestions,
        moduleScore: finalModuleScore,
        perfectModule,
        timeTaken
      });
      
      // Update local state to show Module 1 as completed
      setCompletedModules(updatedCompletedModules);
      
      // Track Module 1 completion by guest
      trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.MODULE1_COMPLETED_GUEST, {
        score: finalModuleScore,
        perfect: perfectModule,
        timeSeconds: timeTaken,
        guestId: currentUser?.id
      });
      
      // Show the module completion screen first, then auth modal
      setShowModuleComplete(true);
      
      // Delay showing auth modal to let user see their results
      setTimeout(() => {
        setShowAuthModal(true);
        trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.AUTH_PROMPT_SHOWN_AFTER_MODULE1, { 
          trigger: 'module_1_completion',
          guestId: currentUser?.id
        });
      }, 3000); // 3 second delay
      
      return;
    }

    // For authenticated users, submit to database
    if (!isGuest && currentUser?.id) {
      console.log(`🎯 Submitting Module ${currentModule} score...`);
      
      try {
        // Submit module score
        const moduleResult = await submitModuleScore(currentUser.id, {
          moduleId: currentModule,
          moduleName: modules[currentModule].title,
          score: finalModuleScore,
          perfectCompletion: perfectModule,
          completionTime: timeTaken,
          questionsAnswered: moduleQuestionKeys.length,
          questionsCorrect: questionsCorrect
        });

        if (moduleResult.success) {
          console.log(`✅ Module ${currentModule} score submitted successfully!`);
        }
        
        // Update completed modules
        const newCompletedModules = [...completedModules, currentModule];
        setCompletedModules(newCompletedModules);
        
        // Save overall progress
        await saveProgress();
        
      } catch (error) {
        console.error(`❌ Error submitting module score:`, error);
      }
    }

    setShowModuleComplete(true);
    setCompletedModules([...completedModules, currentModule]);
    
    if (currentModule < modules.length - 1 && 
        !unlockedModules.includes(currentModule + 1)) {
      setUnlockedModules([...unlockedModules, currentModule + 1]);
    }

    // Persist next location suggestion: next module start if unlocked, else current
    const nextModule = unlockedModules.includes(currentModule + 1) || currentModule + 1 < modules.length
      ? currentModule + 1
      : currentModule;
    const targetModule = unlockedModules.includes(nextModule) ? nextModule : Math.max(...unlockedModules);
    await persistLastLocation({ moduleId: targetModule, questionIndex: 0 });
  };
  
  // Handle power-up usage
  const handlePowerUp = (type) => {
    if (!canUsePowerUp(powerUps, type)) return;
    
    setPowerUps(consumePowerUp(powerUps, type));
    
    if (type === 'skip') {
      if (currentQuestion < modules[currentModule].questions.length - 1) {
        const questionKey = `${currentModule}-${currentQuestion}`;
        setAnsweredQuestions({ 
          ...answeredQuestions, 
          [questionKey]: { 
            answered: true, 
            selectedAnswer: null, 
            wasCorrect: false 
          } 
        });
        setPerfectModule(false);
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  // Check achievement conditions
  const checkAchievementConditions = () => {
    const stats = createAchievementStats({
      score,
      streak,
      level,
      completedModules,
      perfectModulesCount,
      combo
    });
    
    const newAchievements = getNewAchievements(
      achievements, 
      stats, 
      currentUser?.gender
    );
    
    if (newAchievements.length > 0) {
      const firstNewAchievement = newAchievements[0];
      setAchievements(prev => [...prev, firstNewAchievement]);
      setShowAchievement(firstNewAchievement);
      setTimeout(() => setShowAchievement(null), 7000);
    }
  };

  // Start new module with deferred authentication checks
  const startNewModule = (moduleIndex) => {
    // Enforce deferred authentication: prevent access to Module 2+ for guest users
    if (isGuest && (GAME_CONFIG?.ENABLE_DEFERRED_AUTH ?? true) && 
        !(GAME_CONFIG?.MODULE_ACCESS?.GUEST_ACCESSIBLE_MODULES ?? [0]).includes(moduleIndex)) {
      
      console.log(`🔒 Guest user attempting to access Module ${moduleIndex + 1}, showing auth modal`);
      setShowAuthModal(true);
      trackGuestEvent('auth_modal_triggered', { 
        trigger: 'module_access_attempt', 
        moduleIndex,
        guestId: currentUser?.id
      });
      return;
    }

    console.log(`🎮 Starting Module ${moduleIndex + 1}`);

    // Clear any previously answered questions for this module
    const updatedAnsweredQuestions = { ...answeredQuestions };
    const moduleQuestionCount = modules[moduleIndex]?.questions?.length || 0;
    
    for (let i = 0; i < moduleQuestionCount; i++) {
      delete updatedAnsweredQuestions[`${moduleIndex}-${i}`];
    }
    
    // Generate new shuffled questions
    const originalQuestions = modules[moduleIndex].questions;
    const shuffled = shuffleArray(originalQuestions.map((q, index) => ({ 
      ...q, 
      originalIndex: index 
    })));
    setShuffledQuestions(prev => ({
      ...prev,
      [moduleIndex]: shuffled
    }));
    
    setAnsweredQuestions(updatedAnsweredQuestions);
    setCurrentModule(moduleIndex);
    setCurrentQuestion(0);
    setModuleScore(0);
    setPerfectModule(true);
    setPowerUps(prev => refreshPowerUps(prev));
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    // RESET TIMER: Don't start timer until first answer
    resetTimer();

  // Persist entry into this module at question 0
  persistLastLocation({ moduleId: moduleIndex, questionIndex: 0 });

    // Track module start
    if (isGuest) {
      trackGuestEvent('module_started', { 
        moduleIndex,
        guestId: currentUser?.id
      });
    }
  };

  // Save progress (unified for both guest and authenticated users)
  const saveProgress = async () => {
    if (isSavingProgress) return; // Prevent concurrent saves
    
    setIsSavingProgress(true);
    
    const progressData = {
      currentModule: currentModule,
      currentQuestion: currentQuestion,
      score: score,
      level: level,
      xp: xp,
      streak: streak,
      combo: combo,
      perfectModulesCount: perfectModulesCount,
      completedModules: completedModules,
      unlockedModules: unlockedModules,
      answeredQuestions: answeredQuestions,
      achievements: achievements.map(a => a.id),
      powerUps: powerUps,
      shuffledQuestions: shuffledQuestions
    };

    let success = false;
    
    try {
      if (isGuest) {
        // Save guest progress to localStorage
        success = saveGuestProgress(progressData);
        console.log('💾 Guest progress saved to localStorage');
      } else if (currentUser?.id) {
        // Save authenticated user progress to database
        const result = await saveGameProgress(currentUser.id, progressData);
        success = result.success;
        if (success) {
          console.log('✅ Progress saved to database');
        }
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    } finally {
      setIsSavingProgress(false);
    }
    
    return success;
  };

  // Reset progress
  const resetProgress = async () => {
    if (window.confirm(
      '⚠️ Are you sure you want to reset all progress?\n\n' +
      'This will delete:\n' +
      '• Your score and level\n' +
      '• All completed modules\n' +
      '• All achievements\n' +
      '• All answered questions\n\n' +
      'This action cannot be undone!'
    )) {
      try {
        if (!isGuest && currentUser?.id) {
          await clearGameProgress(currentUser.id);
        }
        
        // Reset all state
        setCurrentModule(0);
        setCurrentQuestion(0);
        setScore(0);
        setStreak(0);
        setLevel(1);
        setXp(0);
        setUnlockedModules([0]);
        setShowFeedback(false);
        setSelectedAnswer(null);
        setIsCorrect(false);
        setAchievements([]);
        setCombo(0);
        setPowerUps(INITIAL_POWER_UPS);
        setCompletedModules([]);
        setAnsweredQuestions({});
        setShowModuleComplete(false);
        setModuleScore(0);
        setPerfectModule(true);
        setPerfectModulesCount(0);
        setCompletedModuleScore(0);
        setShowLevelUp(false);
        setShowAchievement(null);
        setModuleStartTime(null);
        setShuffledQuestions({});
        setCurrentTime(0);
        
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
        
        console.log('✅ Progress reset successfully');
      } catch (error) {
        console.error('❌ Error resetting progress:', error);
      }
    }
  };

  // Update these functions in IFRS17TrainingGame.js
  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      trackGuestEvent('auth_cta_clicked', { action: 'sign_in' });
      
      // Close the modal and let App.js handle showing AuthScreen
      setShowAuthModal(false);
      if (onShowAuth) {
        await onShowAuth('signin');
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setIsAuthenticating(true);
      trackGuestEvent('auth_cta_clicked', { action: 'sign_up' });
      
      // Close the modal and let App.js handle showing AuthScreen
      setShowAuthModal(false);
      if (onShowAuth) {
        await onShowAuth('signup');
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    if (isGuest) {
      trackGuestEvent(GAME_CONFIG.TELEMETRY_EVENTS.GUEST_AUTH_DEFERRED, { 
        action: 'dismissed',
        guestId: currentUser?.id,
        hasCompletedModule1: hasGuestCompletedModule1()
      });
    }
    
    // If there's a pending module 1 completion, show the completion screen
    if (pendingModule1Completion) {
      console.log('🎉 Showing Module 1 completion screen after auth modal close');
      setShowModuleComplete(true);
      
      // Update completed modules to show Module 1 as completed
      const newCompletedModules = [...completedModules];
      if (!newCompletedModules.includes(0)) {
        newCompletedModules.push(0);
      }
      setCompletedModules(newCompletedModules);
      
      // Note: We don't unlock Module 2 for guest users - that only happens after auth
      setPendingModule1Completion(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sync all data (for manual sync button)
  const handleManualSync = async () => {
    if (isGuest || !currentUser?.id) {
      console.log('⚠️ Cannot sync: User not authenticated');
      return;
    }
    
    console.log('🔄 Manual sync triggered...');
    
    try {
      // Prepare module scores
      const moduleScores = {};
      const perfectModules = [];
      
      completedModules.forEach(moduleIndex => {
        // Calculate score for each module (you might want to track this separately)
        const moduleQuestions = Object.keys(answeredQuestions).filter(
          key => key.startsWith(`${moduleIndex}-`)
        );
        
        let moduleCorrect = 0;
        moduleQuestions.forEach(key => {
          if (answeredQuestions[key].wasCorrect) moduleCorrect++;
        });
        
        const isPerfect = moduleCorrect === moduleQuestions.length;
        if (isPerfect) perfectModules.push(moduleIndex);
        
        // Estimate module score (you should track actual module scores)
        moduleScores[moduleIndex] = Math.floor(score / completedModules.length);
      });
      
      // Sync all game data
      const syncResult = await syncAllGameData(currentUser.id, {
        currentModule,
        currentQuestion,
        score,
        level,
        xp,
        completedModules,
        moduleScores,
        perfectModules,
        answeredQuestions,
        achievements: achievements.map(a => a.id),
        powerUps,
        streak,
        combo,
        perfectModulesCount,
        unlockedModules,
        shuffledQuestions
      });
      
      if (syncResult.success) {
        console.log('✅ Manual sync completed successfully');
        alert('Progress synced successfully!');
      } else {
        console.error('❌ Manual sync failed');
        alert('Failed to sync progress. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error during manual sync:', error);
      alert('An error occurred while syncing. Please try again.');
    }
  };

  // Check achievements on state changes
  useEffect(() => {
    checkAchievementConditions();
  }, [score, streak, level, combo, completedModules]);

  // Auto-save progress periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isGuest && currentUser?.id && answeredQuestions && 
          Object.keys(answeredQuestions).length > 0) {
        saveProgress();
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [isGuest, currentUser, answeredQuestions]);

  // Don't render until currentUser is loaded
  if (!currentUser || isBootingResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="text-white text-xl">{currentUser ? 'Resuming your session…' : 'Loading user data...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-black/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser.avatar || currentUser.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-white font-semibold text-sm md:text-base">
                {currentUser?.name || 'Loading...'}
              </p>
              <p className="text-gray-400 text-xs">{currentUser?.organization || ''}</p>
            </div>
          </div>
          
          {/* Guide + Auth CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="hidden sm:flex items-center gap-2 text-white subpixel-antialiased bg-black/40 hover:bg-black/60 border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold shadow-sm"
            >
              <span>Game Guide</span>
            </button>
            {isGuest ? (
              <>
                <button
                  onClick={handleSignIn}
                  className="hidden sm:flex items-center gap-2 text-white subpixel-antialiased bg-black/60 hover:bg-black/70 border border-white/30 hover:border-white/50 px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold shadow-sm"
                >
                  <LogIn className="w-4 h-4" strokeWidth={2.2} />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={handleSignUp}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-white text-sm transition-colors"
              >
                Switch User
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 relative">
          <img 
            src="/IRA logo.png" 
            alt="IRA Logo" 
            className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 h-6 md:h-10 lg:h-12 w-auto z-10"
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white text-center py-2">
            IFRS 17 Quest and Concur: Regulatory Training Game
          </h1>
        </div>

        {/* Stats Dashboard */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Score</p>
                <p className="text-lg md:text-2xl font-bold text-white">
                  {score.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="text-orange-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Streak</p>
                <p className="text-lg md:text-2xl font-bold text-white">{streak}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="text-purple-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Level {level}</p>
                <div className="w-20 md:w-32 h-2 md:h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                    style={{ width: `${(xp / (level * 100)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-400 w-6 h-6 md:w-8 md:h-8" />
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Combo</p>
                <p className="text-lg md:text-2xl font-bold text-white">x{combo + 1}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Actions */}
        <div className="mt-4 text-center">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="group relative bg-black/30 backdrop-blur-sm border border-purple-400/30 hover:border-purple-400 text-white px-4 py-2 md:px-6 md:py-2 rounded-full font-medium transition-all transform hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base"
            >
              <Trophy className="w-4 h-4 text-purple-400 group-hover:text-yellow-400 transition-colors" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                View Leaderboard
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
            </button>
            
            {!isGuest && (
              <button
                onClick={handleManualSync}
                className="group relative bg-black/30 backdrop-blur-sm border border-green-400/30 hover:border-green-400 text-white px-4 py-2 md:px-6 md:py-2 rounded-full font-medium transition-all transform hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base"
              >
                <TrendingUp className="w-4 h-4 text-green-400 group-hover:text-green-300 transition-colors" />
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-semibold">
                  Sync Progress
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100"></div>
              </button>
            )}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mb-8 mt-6">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            IFRS 17 Training Modules 
            <span className="text-sm md:text-lg font-normal text-gray-300 ml-2 md:ml-4">
              ({completedModules.length}/{modules.length} completed)
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {modules.map((module, index) => {
              const isLocked = !unlockedModules.includes(index) || (isGuest && index > 0);
              const isCompleted = completedModules.includes(index);
              const isCurrent = index === currentModule && !completedModules.includes(index);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (isGuest && index > 0) {
                      setShowAuthModal(true);
                      trackGuestEvent('auth_modal_triggered', { 
                        trigger: 'module_click', 
                        moduleIndex: index 
                      });
                    } else if (unlockedModules.includes(index) && 
                        !completedModules.includes(index) && 
                        index !== currentModule) {
                      startNewModule(index);
                    }
                  }}
                  disabled={(isLocked && !isGuest) || 
                           completedModules.includes(index) || 
                           (index === currentModule && !showModuleComplete)}
                  className={`relative p-3 md:p-4 rounded-xl transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-600 to-green-700 transform cursor-not-allowed shadow-lg ring-2 ring-green-400'
                      : isCurrent
                      ? `bg-gradient-to-br ${module.color} transform scale-105 shadow-xl ring-2 ring-purple-400`
                      : (unlockedModules.includes(index) && !(isGuest && index > 0))
                      ? `bg-gradient-to-br ${module.color} hover:scale-105 transform cursor-pointer shadow-lg`
                      : 'bg-gray-800 opacity-50 cursor-pointer hover:opacity-70'
                  }`}
                >
                  {isCompleted && (
                    <CheckCircle className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-6 md:h-6 text-white" />
                  )}
                  {(isLocked || (isGuest && index > 0)) && (
                    <Lock className="absolute top-1 right-1 md:top-2 md:right-2 w-3 h-3 md:w-4 md:h-4 text-gray-300" />
                  )}
                  <div className="text-2xl md:text-3xl mb-1 md:mb-2">{module.icon}</div>
                  <p className="text-white text-xs md:text-sm font-semibold">
                    {module.title}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-green-200 mt-1">Completed!</p>
                  )}
                  {isCurrent && (
                    <p className="text-xs text-yellow-200 mt-1">In Progress</p>
                  )}
                  {isGuest && index > 0 && (
                    <p className="text-xs text-gray-300 mt-1">Sign up to unlock</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievement Notification */}
        {showAchievement && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-full text-lg font-bold animate-pulse flex items-center gap-3">
              <span className="text-2xl">{showAchievement.icon}</span>
              Achievement Unlocked: {showAchievement.name}!
            </div>
          </div>
        )}

        {/* Level Up Notification */}
        {showLevelUp && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-purple-600 text-white px-8 py-4 rounded-full text-2xl font-bold animate-pulse">
              ⭐ LEVEL UP! Level {level} ⭐
            </div>
          </div>
        )}

        {/* Module Complete Modal */}
        {showModuleComplete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl text-center transform scale-110 animate-pulse">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Module Complete! 🎉
              </h2>
              <p className="text-2xl text-white mb-2">
                {modules[currentModule].title}
              </p>
              <p className="text-xl text-yellow-300 mb-4">
                Score: {completedModuleScore} points
              </p>
              {perfectModule && (
                <p className="text-2xl text-yellow-400 font-bold mb-4 animate-pulse">
                  ⭐ PERFECT MODULE! ⭐
                </p>
              )}
              <p className="text-lg text-white mb-4">
                {currentModule < modules.length - 1 
                  ? "Get ready for the next module..." 
                  : "Congratulations! You've completed all modules!"}
              </p>
              {currentModule < modules.length - 1 ? (
                <button
                  onClick={() => {
                    setShowModuleComplete(false);
                    setTimeout(() => {
                      startNewModule(currentModule + 1);
                    }, 100);
                  }}
                  className="mt-4 px-6 py-3 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  Start Next Module →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowModuleComplete(false);
                  }}
                  className="mt-4 px-6 py-3 bg-yellow-400 text-purple-900 rounded-full font-bold hover:bg-yellow-300 transition-all transform hover:scale-105"
                >
                  View Final Results 🏆
                </button>
              )}
            </div>
          </div>
        )}

        {/* Question Display (rest of your game UI remains the same) */}
        {modules[currentModule] && completedModules.length < modules.length && 
         !completedModules.includes(currentModule) && (
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="text-lg md:text-xl font-bold text-white">
                  {modules[currentModule].title} - Question {currentQuestion + 1}/
                  {getShuffledQuestions(currentModule).length}
                </h3>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 backdrop-blur-sm rounded-lg px-3 py-2 border transition-all ${
                    timerState === 'idle' 
                      ? 'bg-gray-700/30 border-gray-500/30 text-gray-400' 
                      : timerState === 'running'
                      ? 'bg-blue-900/30 border-blue-400/30 text-blue-400'
                      : 'bg-green-900/30 border-green-400/30 text-green-400'
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      timerState === 'running' ? 'animate-pulse' : ''
                    }`} />
                    <span className="font-mono text-sm md:text-base font-semibold">
                      {timerState === 'idle' ? '0:00' : formatTime(currentTime)}
                    </span>
                    {timerState === 'idle' && (
                      <span className="text-xs opacity-75 ml-1">
                        (starts on first answer)
                      </span>
                    )}
                  </div>
                  
                  {/* Correct/Wrong tracker (replaces power-ups) */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-green-900/30 border border-green-400/30 text-green-300 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs md:text-sm font-semibold">Correct: {correctCount}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-900/30 border border-red-400/30 text-red-300 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs md:text-sm font-semibold">Wrong: {wrongCount}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                  style={{ 
                    width: `${((currentQuestion + 1) / getShuffledQuestions(currentModule).length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Question prompt */}
            <div className="mb-4">
              <p className="text-white text-base md:text-lg lg:text-xl font-semibold">
                {getShuffledQuestions(currentModule)[currentQuestion]?.question}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getShuffledQuestions(currentModule)[currentQuestion]?.options.map(
                (option, index) => (
                <button
                  key={index}
                  onClick={() => 
                    !showFeedback && 
                    !answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && 
                    handleAnswer(index)
                  }
                  disabled={
                    showFeedback || 
                    answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered
                  }
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 text-sm md:text-base ${
                    answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered
                      ? answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index
                        ? answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect
                          ? 'bg-green-500/20 border-green-400 text-green-400'
                          : 'bg-red-500/20 border-red-400 text-red-400'
                        : index === getShuffledQuestions(currentModule)[currentQuestion]?.correct
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed'
                      : showFeedback && selectedAnswer === index
                      ? isCorrect
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-red-500/20 border-red-400 text-red-400'
                      : showFeedback && index === getShuffledQuestions(currentModule)[currentQuestion]?.correct
                      ? 'bg-green-500/20 border-green-400 text-green-400'
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showFeedback && selectedAnswer === index && (
                      isCorrect ? 
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> : 
                        <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                    {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && (
                      answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index ? (
                        answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect ? 
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" /> : 
                          <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                      ) : index === getShuffledQuestions(currentModule)[currentQuestion]?.correct ? (
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                      ) : null
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`mt-6 p-4 rounded-xl ${
                isCorrect 
                  ? 'bg-green-500/20 border border-green-400' 
                  : 'bg-blue-500/20 border border-blue-400'
              }`}>
                <p className={`${
                  isCorrect ? 'text-green-400' : 'text-blue-400'
                } font-semibold mb-2 text-sm md:text-base`}>
                  {isCorrect 
                    ? `🎉 Excellent! +${10 * (combo)} points` 
                    : 'Not quite right, but here\'s the explanation:'}
                  {isCorrect && combo >= 3 && ' 🔥 COMBO!'}
                  {isCorrect && streak >= 5 && ' ⚡ STREAK!'}
                </p>
                <p className="text-gray-300 text-sm md:text-base">
                  {getShuffledQuestions(currentModule)[currentQuestion]?.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* All Modules Complete */}
        {completedModules.length === modules.length && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 mb-6 border border-yellow-400/50 text-center">
            <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              🎊 Congratulations! 🎊
            </h2>
            <p className="text-xl text-white mb-2">
              You've completed all IFRS 17 Training Modules!
            </p>
            <p className="text-lg text-yellow-300">
              Final Score: {score.toLocaleString()} points
            </p>
            <p className="text-lg text-purple-300">
              Level: {level} | Achievements: {achievements.length}
            </p>
          </div>
        )}

        {/* Achievements Display */}
        {achievements.length > 0 && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10 mt-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Achievements Unlocked
            </h3>
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement) => {
                const displayData = getAchievementDisplayData(achievement);
                return (
                  <div 
                    key={achievement.id} 
                    className="bg-white/10 rounded-lg p-3 flex items-center gap-2"
                  >
                    <span className="text-2xl">{displayData.icon}</span>
                    <span className="text-white font-medium">{displayData.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          currentUser={currentUser}
          modules={modules}
          userScore={score}
          userLevel={level}
          userAchievements={achievements.length}
          userCompletedModules={completedModules}
        />

        {/* Reset Progress Button */}
        <div className="mt-6 text-center">
          <button
            onClick={resetProgress}
            className="bg-gray-800/50 hover:bg-red-600/30 border border-gray-600 hover:border-red-500 text-gray-400 hover:text-red-400 px-6 py-2 rounded-lg transition-all duration-300 text-sm"
          >
            ⚠️ Reset All Progress
          </button>
        </div>

        {/* Saving Indicator */}
        {isSavingProgress && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Saving progress...</span>
          </div>
        )}

  {/* Removed the "Developed for" section as requested */}



        <footer className="mt-6 mb-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
            <div className="flex flex-col items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-gray-300 text-xs md:text-sm font-light">
                  Powered by Kenbright AI
                </span>
              </div>
              <div className="text-center">
                <p className="text-gray-300 text-xs">
                  © {new Date().getFullYear()} Kenbright. All rights reserved.  
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Version 3.0.0 | IFRS 17 Training Platform
                </p>
                <button
                  onClick={() => setShowGuide(true)}
                  className="mt-2 inline-flex items-center gap-2 text-xs md:text-sm text-purple-300 hover:text-purple-200 underline underline-offset-2"
                >
                  Read the Game Guide & FAQ
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* Authentication Modal */}
  <AuthenticationModal 
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          isLoading={isAuthenticating}
        />
  <GameGuideFAQ isOpen={showGuide} onClose={() => setShowGuide(false)} />
      </div>
    </div>
  );
};

export default IFRS17TrainingGame;