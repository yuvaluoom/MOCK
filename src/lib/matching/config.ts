/**
 * Matching Algorithm Configuration
 *
 * All weights and thresholds are configurable here.
 * This allows easy adjustment without code changes.
 *
 * Weight rules:
 * - Layer weights must sum to 1.0
 * - Core component weights must sum to 1.0
 * - All values between 0 and 1 (or 0-100 for thresholds)
 */

import type { AlgorithmWeights } from './schema';

// =============================================================================
// DEFAULT ALGORITHM CONFIGURATION
// =============================================================================

export const DEFAULT_ALGORITHM_WEIGHTS: AlgorithmWeights = {
  id: 'default-v1',
  version: '1.0.0',
  isActive: true,

  // ==========================================================================
  // LAYER WEIGHTS (must sum to 1.0)
  // ==========================================================================

  /**
   * Core Score Weight (Layer B)
   * - Based on hard requirements: specialization, availability, language, location
   * - This is the foundation of matching
   */
  coreScoreWeight: 0.50,

  /**
   * Preference Weight
   * - Based on optional preferences: therapist gender, age, approach, price
   * - Improves personalization when provided
   */
  preferenceWeight: 0.30,

  /**
   * X-Factor Weight (Layer C)
   * - Statistical personality matching
   * - Only applied when X-Factor data is available
   * - Weight redistributed to other layers if not available
   */
  xFactorWeight: 0.20,

  // ==========================================================================
  // CORE COMPONENT WEIGHTS (must sum to 1.0)
  // These determine how Layer B score is calculated
  // ==========================================================================

  /**
   * Specialization Match Weight
   * - How well therapist specializations match client concerns
   * - Primary concern matches weighted higher than secondary
   */
  specializationWeight: 0.30,

  /**
   * Availability Match Weight
   * - Schedule compatibility between client and therapist
   * - Day and time slot overlap
   */
  availabilityWeight: 0.20,

  /**
   * Language Compatibility Weight
   * - Shared languages between client and therapist
   * - Native/fluent speakers weighted higher
   */
  languageWeight: 0.15,

  /**
   * Location/Format Weight
   * - For in-person: geographic proximity
   * - For online: format compatibility
   */
  locationWeight: 0.15,

  /**
   * Experience Relevance Weight
   * - Years of experience in relevant specializations
   * - Experience level matching client needs
   */
  experienceWeight: 0.10,

  /**
   * Price Compatibility Weight
   * - Within client's budget
   * - Insurance coverage consideration
   */
  priceWeight: 0.10,

  // ==========================================================================
  // SCORE THRESHOLDS (0-100 scale)
  // ==========================================================================

  /** Minimum score to show a match (below this = filtered out) */
  minimumScoreThreshold: 40,

  /** Score >= this = "Excellent Match" */
  excellentThreshold: 85,

  /** Score >= this = "Great Match" */
  greatThreshold: 70,

  /** Score >= this = "Good Match" */
  goodThreshold: 55,

  /** Score >= this = "Moderate Match" (below = "Low Match") */
  moderateThreshold: 40,

  // ==========================================================================
  // METADATA
  // ==========================================================================

  description: 'Default matching algorithm v1.0 - Balanced approach prioritizing core compatibility',
  createdAt: new Date('2024-01-01'),
  activatedAt: new Date('2024-01-01'),
  createdBy: 'system',
};

// =============================================================================
// ALTERNATIVE CONFIGURATIONS (for A/B testing or different use cases)
// =============================================================================

export const XFACTOR_HEAVY_WEIGHTS: Partial<AlgorithmWeights> = {
  id: 'xfactor-heavy-v1',
  version: '1.0.0',
  coreScoreWeight: 0.40,
  preferenceWeight: 0.25,
  xFactorWeight: 0.35,
  description: 'X-Factor heavy - Prioritizes personality matching for better long-term outcomes',
};

export const PRACTICAL_WEIGHTS: Partial<AlgorithmWeights> = {
  id: 'practical-v1',
  version: '1.0.0',
  coreScoreWeight: 0.65,
  preferenceWeight: 0.25,
  xFactorWeight: 0.10,
  description: 'Practical matching - Prioritizes availability and logistics',
};

// =============================================================================
// HARD FILTER CONFIGURATION
// =============================================================================

export const HARD_FILTER_CONFIG = {
  /**
   * Session Format Filter
   * If client requires online-only, exclude therapists who don't offer online
   */
  sessionFormatStrict: true,

  /**
   * Health Fund Filter
   * If client has specific health fund, prioritize (but don't exclude) matching therapists
   */
  healthFundStrict: false, // Soft filter - affects score but doesn't exclude

  /**
   * Language Filter
   * At least one shared language required
   */
  languageStrict: true,

  /**
   * Geographic Filter (for in-person)
   * Maximum distance in km for in-person sessions
   */
  maxDistanceKm: 50,

  /**
   * Therapist Status Filter
   * Only show approved and accepting therapists
   */
  requireApproved: true,
  requireAccepting: true,
};

// =============================================================================
// SCORING FORMULAS DOCUMENTATION
// =============================================================================

/**
 * FINAL SCORE CALCULATION:
 *
 * If X-Factor available:
 *   FinalScore = (coreScoreWeight * CoreScore) +
 *                (preferenceWeight * PreferenceScore) +
 *                (xFactorWeight * XFactorScore)
 *
 * If X-Factor NOT available (redistribute weight):
 *   adjustedCoreWeight = coreScoreWeight + (xFactorWeight * 0.6)
 *   adjustedPrefWeight = preferenceWeight + (xFactorWeight * 0.4)
 *   FinalScore = (adjustedCoreWeight * CoreScore) +
 *                (adjustedPrefWeight * PreferenceScore)
 *
 * CORE SCORE CALCULATION:
 *   CoreScore = (specializationWeight * SpecScore) +
 *               (availabilityWeight * AvailScore) +
 *               (languageWeight * LangScore) +
 *               (locationWeight * LocScore) +
 *               (experienceWeight * ExpScore) +
 *               (priceWeight * PriceScore)
 *
 * Each component score is 0-100.
 */

// =============================================================================
// EXPLANATION TEMPLATES
// =============================================================================

export const EXPLANATION_TEMPLATES = {
  // Positive factors
  healthFundMatch: {
    key: 'health_fund_match',
    labelHebrew: 'מקבל/ת את קופת החולים שלך',
    labelEnglish: 'Accepts your health insurance',
    icon: 'shield-check',
  },
  specializationMatch: {
    key: 'specialization_match',
    labelHebrew: 'מתמחה בתחום הרלוונטי',
    labelEnglish: 'Specializes in your area of concern',
    icon: 'target',
  },
  onlineAvailable: {
    key: 'online_available',
    labelHebrew: 'מציע/ה פגישות מקוונות',
    labelEnglish: 'Offers online sessions',
    icon: 'video',
  },
  inPersonAvailable: {
    key: 'in_person_available',
    labelHebrew: 'מציע/ה פגישות פרונטליות',
    labelEnglish: 'Offers in-person sessions',
    icon: 'map-pin',
  },
  scheduleMatch: {
    key: 'schedule_match',
    labelHebrew: 'זמין/ה בזמנים שמתאימים לך',
    labelEnglish: 'Available at your preferred times',
    icon: 'calendar',
  },
  languageMatch: {
    key: 'language_match',
    labelHebrew: 'דובר/ת את השפה המועדפת עליך',
    labelEnglish: 'Speaks your preferred language',
    icon: 'languages',
  },
  experienceRelevant: {
    key: 'experience_relevant',
    labelHebrew: 'בעל/ת ניסיון רב בתחום',
    labelEnglish: 'Extensive experience in relevant area',
    icon: 'award',
  },
  priceInBudget: {
    key: 'price_in_budget',
    labelHebrew: 'מחיר בטווח התקציב שלך',
    labelEnglish: 'Price within your budget',
    icon: 'wallet',
  },
  genderPreferenceMatch: {
    key: 'gender_preference',
    labelHebrew: 'מתאים/ה להעדפת המגדר שלך',
    labelEnglish: 'Matches your gender preference',
    icon: 'user-check',
  },
  approachMatch: {
    key: 'approach_match',
    labelHebrew: 'משתמש/ת בגישה הטיפולית המועדפת',
    labelEnglish: 'Uses your preferred therapy approach',
    icon: 'brain',
  },
  personalityMatch: {
    key: 'personality_match',
    labelHebrew: 'התאמה גבוהה לסגנון האישי שלך',
    labelEnglish: 'High personality compatibility',
    icon: 'heart-handshake',
  },
  communicationStyleMatch: {
    key: 'communication_style',
    labelHebrew: 'סגנון תקשורת תואם',
    labelEnglish: 'Compatible communication style',
    icon: 'message-circle',
  },

  // Consideration factors
  priceAboveBudget: {
    key: 'price_above_budget',
    labelHebrew: 'מחיר מעל התקציב שצוין',
    labelEnglish: 'Price above stated budget',
    icon: 'alert-circle',
  },
  limitedAvailability: {
    key: 'limited_availability',
    labelHebrew: 'זמינות מוגבלת',
    labelEnglish: 'Limited availability',
    icon: 'clock',
  },
  distanceConsideration: {
    key: 'distance_consideration',
    labelHebrew: 'מרחק גיאוגרפי',
    labelEnglish: 'Geographic distance to consider',
    icon: 'map',
  },
};

// =============================================================================
// QUALITY LABELS
// =============================================================================

export const MATCH_QUALITY_LABELS = {
  EXCELLENT: {
    labelHebrew: 'התאמה מצוינת',
    labelEnglish: 'Excellent Match',
    color: 'green',
  },
  GREAT: {
    labelHebrew: 'התאמה גבוהה',
    labelEnglish: 'Great Match',
    color: 'blue',
  },
  GOOD: {
    labelHebrew: 'התאמה טובה',
    labelEnglish: 'Good Match',
    color: 'cyan',
  },
  MODERATE: {
    labelHebrew: 'התאמה סבירה',
    labelEnglish: 'Moderate Match',
    color: 'amber',
  },
  LOW: {
    labelHebrew: 'התאמה נמוכה',
    labelEnglish: 'Low Match',
    color: 'gray',
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get active algorithm weights
 * In production, this would fetch from database
 */
export function getActiveWeights(): AlgorithmWeights {
  // TODO: Fetch from database in production
  return DEFAULT_ALGORITHM_WEIGHTS;
}

/**
 * Validate that weights sum correctly
 */
export function validateWeights(weights: AlgorithmWeights): boolean {
  const layerSum = weights.coreScoreWeight + weights.preferenceWeight + weights.xFactorWeight;
  const coreSum =
    weights.specializationWeight +
    weights.availabilityWeight +
    weights.languageWeight +
    weights.locationWeight +
    weights.experienceWeight +
    weights.priceWeight;

  const layerValid = Math.abs(layerSum - 1.0) < 0.001;
  const coreValid = Math.abs(coreSum - 1.0) < 0.001;

  return layerValid && coreValid;
}

/**
 * Calculate adjusted weights when X-Factor is not available
 */
export function getAdjustedWeights(weights: AlgorithmWeights, hasXFactor: boolean): {
  coreWeight: number;
  preferenceWeight: number;
  xFactorWeight: number;
} {
  if (hasXFactor) {
    return {
      coreWeight: weights.coreScoreWeight,
      preferenceWeight: weights.preferenceWeight,
      xFactorWeight: weights.xFactorWeight,
    };
  }

  // Redistribute X-Factor weight
  return {
    coreWeight: weights.coreScoreWeight + weights.xFactorWeight * 0.6,
    preferenceWeight: weights.preferenceWeight + weights.xFactorWeight * 0.4,
    xFactorWeight: 0,
  };
}
