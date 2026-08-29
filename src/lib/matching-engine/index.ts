/**
 * MatchMind Matching Engine
 *
 * A modular, explainable therapist-patient matching system
 * designed for the Israeli mental health context.
 *
 * @example
 * ```typescript
 * import { createMatchingEngine } from '@/lib/matching-engine';
 *
 * const engine = createMatchingEngine();
 * const result = engine.matchSingle(patient, therapist);
 *
 * console.log(result.score.overall); // 85
 * console.log(result.explanation.summary); // "Excellent match..."
 * ```
 */

// =============================================================================
// CORE EXPORTS
// =============================================================================

export {
  MatchingEngine,
  createMatchingEngine,
  createCustomMatchingEngine,
  createMatchingEngineWithDependencies,
  batchMatchPatients,
  quickCompatibilityCheck,
  rankByComponent,
} from './core/engine';

export type {
  BatchMatchingOptions,
  BatchMatchingResult,
} from './core/engine';

// =============================================================================
// FEATURE EXTRACTION
// =============================================================================

export {
  FeatureExtractor,
  createFeatureExtractor,
} from './features/extractor';

// =============================================================================
// SCORING
// =============================================================================

export {
  Scorer,
  createScorer,
} from './scoring/scorer';

// =============================================================================
// EXPLAINABILITY
// =============================================================================

export {
  Explainer,
  createExplainer,
} from './explainability/explainer';

// =============================================================================
// CONFIGURATION
// =============================================================================

export {
  DEFAULT_MATCHING_CONFIG,
  URGENT_MATCHING_CONFIG,
  MILITARY_MATCHING_CONFIG,
  BUDGET_MATCHING_CONFIG,
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_PARAMETERS,
  CONFIG_REGISTRY,
  getConfig,
  validateWeights,
  validateConfig,
} from './config/default-config';

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Profiles
  PatientProfile,
  TherapistProfile,
  XFactorProfile,

  // Features
  ExtractedFeatures,
  PatientFeatures,
  TherapistFeatures,
  DerivedFeatures,

  // Scoring
  MatchScore,
  MatchScoreComponents,
  ComponentScore,
  ConstraintViolation,

  // Explanation
  MatchExplanation,
  MatchReason,
  MatchConcern,
  MatchInsight,
  ComponentExplanation,

  // Results
  MatchResult,
  MatchListResult,
  RankedMatch,
  MatchMetadata,

  // Configuration
  MatchingConfig,
  MatchingWeights,
  MatchingThresholds,
  MatchingFeatureFlags,
  MatchingParameters,
  XFactorSubWeights,
  PreferenceSubWeights,

  // Interfaces
  IFeatureExtractor,
  IScorer,
  IExplainer,
  IMatchingEngine,
} from './types';
