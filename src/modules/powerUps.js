// src/modules/powerUps.js

// Initial power-up configuration
export const INITIAL_POWER_UPS = {
  skip: 2
};

// Power-up refresh amounts when starting new module
export const POWER_UP_REFRESH = {
  skip: 1
};

// Maximum power-up limits
export const POWER_UP_MAX = {
  skip: 2
};

// Check if a power-up can be used
export const canUsePowerUp = (powerUps, type) => {
  return powerUps[type] > 0;
};

// Use a power-up (decrease count)
export const consumePowerUp = (powerUps, type) => {
  if (!canUsePowerUp(powerUps, type)) return powerUps;
  
  return {
    ...powerUps,
    [type]: powerUps[type] - 1
  };
};

// Refresh power-ups when starting a new module
export const refreshPowerUps = (currentPowerUps) => {
  return {
    skip: Math.min(currentPowerUps.skip + POWER_UP_REFRESH.skip, POWER_UP_MAX.skip)
  };
};

// Power-up effects
export const POWER_UP_EFFECTS = {
  skip: {
    name: 'Skip',
    icon: '⏭️',
    description: 'Skip this question and move to the next',
    action: () => {
      // Skip logic is handled in the main component
      return true;
    }
  }
};

// Get power-up display info
export const getPowerUpInfo = (type) => {
  return POWER_UP_EFFECTS[type] || null;
};