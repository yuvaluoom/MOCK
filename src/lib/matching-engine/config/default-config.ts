/**
 * MatchMind Matching Engine - Default Configuration
 *
 * Default weights, thresholds, and parameters for the matching algorithm.
 * These values are carefully calibrated for the Israeli mental health context.
 */

import type {
  MatchingConfig,
  MatchingWeights,
  MatchingThresholds,
  MatchingFeatureFlags,
  MatchingParameters,
  XFactorSubWeights,
  PreferenceSubWeights,
} from '../types';

// =============================================================================
// DEFAULT WEIGHTS
// =============================================================================

export const DEFAULT_X_FACTOR_SUB_WEIGHTS: XFactorSubWeights = {
  openness: 0.15,
  emotionalIntensity: 0.15,
  structurePreference: 0.20,
  relationshipStyle: 0.15,
  communicationStyle: 0.10,
  changeReadiness: 0.10,
  militaryStress: 0.10,  // Important for Israeli context
  stressLevel: 0.05,
};

export const DEFAULT_PREFERENCE_SUB_WEIGHTS: PreferenceSubWeights = {
  approach: 0.40,
  gender: 0.20,
  language: 0.25,
  experience: 0.15,
};

export const DEFAULT_WEIGHTS: MatchingWeights = {
  // Core weights (must sum to 1.0)
  xFactor: 0.40,       // Psychological compatibility is primary
  healthFund: 0.25,    // Critical in Israeli healthcare system
  availability: 0.15,  // Schedule compatibility
  location: 0.10,      // Geography (less important with online options)
  preferences: 0.10,   // Other preferences

  // Sub-weights
  xFactorSubWeights: DEFAULT_X_FACTOR_SUB_WEIGHTS,
  preferenceSubWeights: DEFAULT_PREFERENCE_SUB_WEIGHTS,
};

// =============================================================================
// DEFAULT THRESHOLDS
// =============================================================================

export const DEFAULT_THRESHOLDS: MatchingThresholds = {
  minimumScore: 0,      // Don't filter by minimum score (show all)
  excellent: 85,        // 85+ is excellent match
  great: 70,            // 70-84 is great
  good: 55,             // 55-69 is good
  moderate: 40,         // 40-54 is moderate
  // Below 40 is low
};

// =============================================================================
// DEFAULT FEATURE FLAGS
// =============================================================================

export const DEFAULT_FEATURE_FLAGS: MatchingFeatureFlags = {
  enableMilitaryBoost: true,      // Boost for military-related matches in Israel
  enableUrgencyBoost: true,       // Boost for urgent cases
  enablePerformanceBoost: true,   // Boost based on therapist performance
  enableCapacityPenalty: true,    // Penalty for nearly-full therapists
  enableDistanceDecay: true,      // Score decay based on distance
};

// =============================================================================
// DEFAULT PARAMETERS
// =============================================================================

export const DEFAULT_PARAMETERS: MatchingParameters = {
  // Distance parameters
  distanceDecayRate: 0.02,   // 2% decay per km
  maxDistance: 50,           // 50km max for in-person

  // Urgency parameters
  urgencyBoostFactor: 0.15,  // Up to 15% boost
  urgencyThreshold: 7,       // Urgency level 7+ gets boost

  // Military parameters
  militaryBoostFactor: 0.10, // Up to 10% boost for military expertise match

  // Performance parameters
  performanceBoostFactor: 0.05, // Up to 5% boost
  performanceThreshold: 4.5,    // 4.5+ rating gets boost

  // Schedule parameters
  scheduleOverlapMinimum: 1,    // At least 1 overlapping slot required
};

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  id: 'default-v1',
  name: 'Default Configuration',

  weights: DEFAULT_WEIGHTS,
  thresholds: DEFAULT_THRESHOLDS,
  featureFlags: DEFAULT_FEATURE_FLAGS,
  parameters: DEFAULT_PARAMETERS,
};

// =============================================================================
// ALTERNATIVE CONFIGS
// =============================================================================

/**
 * High-priority matching config
 * Emphasizes therapist availability and capacity
 */
export const URGENT_MATCHING_CONFIG: MatchingConfig = {
  id: 'urgent-v1',
  name: 'Urgent Priority Configuration',

  weights: {
    ...DEFAULT_WEIGHTS,
    xFactor: 0.30,
    availability: 0.30,
    healthFund: 0.25,
    location: 0.10,
    preferences: 0.05,
  },

  thresholds: {
    ...DEFAULT_THRESHOLDS,
    minimumScore: 30, // Lower threshold for urgent cases
  },

  featureFlags: {
    ...DEFAULT_FEATURE_FLAGS,
    enableUrgencyBoost: true,
    enableCapacityPenalty: false, // Don't penalize full therapists for urgent
  },

  parameters: {
    ...DEFAULT_PARAMETERS,
    urgencyBoostFactor: 0.25, // Higher boost for urgent
    scheduleOverlapMinimum: 0, // Accept any availability for urgent
  },
};

/**
 * Military-focused matching config
 * Emphasizes military expertise and trauma specialization
 */
export const MILITARY_MATCHING_CONFIG: MatchingConfig = {
  id: 'military-v1',
  name: 'Military & Veterans Configuration',

  weights: {
    ...DEFAULT_WEIGHTS,
    xFactor: 0.45,
    preferences: 0.15,
    healthFund: 0.20,
    availability: 0.15,
    location: 0.05,

    xFactorSubWeights: {
      ...DEFAULT_X_FACTOR_SUB_WEIGHTS,
      militaryStress: 0.25, // Much higher weight for military
      emotionalIntensity: 0.20,
      structurePreference: 0.15,
    },
  },

  thresholds: DEFAULT_THRESHOLDS,

  featureFlags: {
    ...DEFAULT_FEATURE_FLAGS,
    enableMilitaryBoost: true,
  },

  parameters: {
    ...DEFAULT_PARAMETERS,
    militaryBoostFactor: 0.20, // Higher boost for military expertise
  },
};

/**
 * Budget-conscious matching config
 * Emphasizes health fund coverage and price
 */
export const BUDGET_MATCHING_CONFIG: MatchingConfig = {
  id: 'budget-v1',
  name: 'Budget-Conscious Configuration',

  weights: {
    ...DEFAULT_WEIGHTS,
    healthFund: 0.35,
    xFactor: 0.35,
    preferences: 0.10,
    availability: 0.15,
    location: 0.05,
  },

  thresholds: DEFAULT_THRESHOLDS,

  featureFlags: DEFAULT_FEATURE_FLAGS,

  parameters: DEFAULT_PARAMETERS,
};

// =============================================================================
// CONFIG REGISTRY
// =============================================================================

export const CONFIG_REGISTRY: Record<string, MatchingConfig> = {
  default: DEFAULT_MATCHING_CONFIG,
  urgent: URGENT_MATCHING_CONFIG,
  military: MILITARY_MATCHING_CONFIG,
  budget: BUDGET_MATCHING_CONFIG,
};

export function getConfig(configId?: string): MatchingConfig {
  if (!configId) return DEFAULT_MATCHING_CONFIG;
  return CONFIG_REGISTRY[configId] ?? DEFAULT_MATCHING_CONFIG;
}

// =============================================================================
// VALIDATION
// =============================================================================

export function validateWeights(weights: MatchingWeights): boolean {
  const sum = weights.xFactor + weights.healthFund + weights.availability +
              weights.location + weights.preferences;
  return Math.abs(sum - 1.0) < 0.001; // Allow small floating point error
}

export function validateConfig(config: MatchingConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check weights sum to 1
  if (!validateWeights(config.weights)) {
    errors.push('Core weights must sum to 1.0');
  }

  // Check thresholds are ordered correctly
  const t = config.thresholds;
  if (t.excellent <= t.great || t.great <= t.good || t.good <= t.moderate) {
    errors.push('Thresholds must be in descending order: excellent > great > good > moderate');
  }

  // Check parameters are positive
  const p = config.parameters;
  if (p.distanceDecayRate < 0 || p.maxDistance < 0 || p.urgencyBoostFactor < 0) {
    errors.push('Parameters must be non-negative');
  }

  return { valid: errors.length === 0, errors };
}
