// Achievement definitions
export const achievementsList = [
  { id: 1, name: "First Steps", icon: "🎯", condition: (stats) => stats.score >= 10 },
  { id: 2, name: "Quick Learner", icon: "⚡", condition: (stats) => stats.streak >= 5 },
  { id: 3, name: "Module Master", icon: "🏆", condition: (stats) => stats.modulesCompleted >= 1 },
  { id: 4, name: "IFRS Expert", icon: "🎓", condition: (stats) => stats.level >= 5 },
  { id: 5, name: "Perfect Score", icon: "💯", condition: (stats) => stats.perfectModules >= 1 },
  { id: 6, name: "Combo King", icon: "🔥", condition: (stats) => stats.maxCombo >= 10, genderBased: true },
  { id: 7, name: "Knowledge Seeker", icon: "📚", condition: (stats) => stats.modulesCompleted >= 5 },
  { id: 8, name: "Unstoppable", icon: "💪", condition: (stats) => stats.streak >= 15 },
];

// Get gender-based achievement name
export const getGenderBasedAchievementName = (achievement, userGender) => {
  if (achievement.genderBased && achievement.id === 6) {
    if (userGender === 'Female') {
      return "Combo Queen";
    } else if (userGender === 'Male') {
      return "Combo King";
    } else {
      return "Combo Master"; // For "Other" or "Prefer not to say"
    }
  }
  return achievement.name;
};

// Get gender-based achievement icon
export const getGenderBasedAchievementIcon = (achievement, userGender) => {
  if (achievement.genderBased && achievement.id === 6) {
    if (userGender === 'Female') {
      return "👑"; // Crown for Queen
    } else if (userGender === 'Male') {
      return "🔥"; // Fire for King
    } else {
      return "⭐"; // Star for Master
    }
  }
  return achievement.icon;
};

// Check if a specific achievement condition is met
export const checkAchievementCondition = (achievement, stats) => {
  return achievement.condition(stats);
};

// Get all newly unlocked achievements
export const getNewAchievements = (currentAchievements, stats, userGender = null) => {
  return achievementsList.filter(achievement => {
    const alreadyUnlocked = currentAchievements.find(a => a.id === achievement.id);
    if (!alreadyUnlocked && checkAchievementCondition(achievement, stats)) {
      // Create a copy with gender-based name and icon if applicable
      const achievementCopy = { ...achievement };
      if (userGender && achievement.genderBased) {
        achievementCopy.name = getGenderBasedAchievementName(achievement, userGender);
        achievementCopy.icon = getGenderBasedAchievementIcon(achievement, userGender);
      }
      return achievementCopy;
    }
    return false;
  }).filter(Boolean);
};

// Create stats object for achievement checking
export const createAchievementStats = (gameState) => {
  return {
    score: gameState.score,
    streak: gameState.streak,
    level: gameState.level,
    modulesCompleted: gameState.completedModules.length,
    perfectModules: gameState.perfectModulesCount,
    maxCombo: gameState.combo
  };
};