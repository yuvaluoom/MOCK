/**
 * MatchMind Intelligence Layer
 *
 * Unified export for all intelligence-related functionality.
 * This layer is completely abstracted from UI and provides:
 *
 * 1. Core Types - Data structures for the intelligence system
 * 2. Internal Scoring - Hidden performance-based scoring
 * 3. Matching Intelligence - Unified matching service
 *
 * Architecture:
 * - User Profile Layer (public identity data)
 * - Matching Intelligence Layer (algorithms + ML)
 * - Behavioral Data Layer (engagement metrics)
 */

// Core types
export * from './core/types';

// Internal scoring (admin-only access)
export {
  InternalScorer,
  getInternalScorer,
  getTherapistInternalMetrics,
  getAllTherapistMetrics,
  getMatchOutcomeStats,
  DEFAULT_INTERNAL_WEIGHTS,
  DEFAULT_PUBLIC_INTERNAL_RATIO,
} from './scoring/internal-scorer';

// Matching intelligence service
export {
  MatchingIntelligenceService,
  getMatchingIntelligence,
  type IntelligentMatchResult,
  type ClientData,
  type TherapistData,
  type MatchingOptions,
  type IntelligenceConfig,
} from './matching-intelligence';
