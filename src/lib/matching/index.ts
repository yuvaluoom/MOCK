/**
 * MatchMind Matching Engine
 *
 * Production-grade matching system with:
 * - Layered scoring architecture
 * - Configurable algorithm weights
 * - Explainable AI approach
 * - Anthropic AI-powered clinical analysis
 * - Future ML-ready infrastructure
 *
 * Usage:
 *
 * ```typescript
 * import { getMatchingService, convertToClientComplete, convertToTherapistComplete } from '@/lib/matching';
 *
 * const service = getMatchingService();
 * const client = convertToClientComplete(mockPatient, mockXFactor);
 * const therapists = mockTherapists.map(convertToTherapistComplete);
 *
 * const { matches, totalCount, hasXFactor } = await service.getMatches(client, therapists);
 * ```
 */

// Legacy algorithm export (backward compatibility)
export * from './algorithm';

// Schema types
export * from './schema';

// Configuration
export {
  DEFAULT_ALGORITHM_WEIGHTS,
  HARD_FILTER_CONFIG,
  EXPLANATION_TEMPLATES,
  MATCH_QUALITY_LABELS,
  getActiveWeights,
  validateWeights,
  getAdjustedWeights,
} from './config';

// Scoring engine
export {
  calculateMatchScore,
  calculateAllMatches,
  type ScoringResult,
  type HardFilterResults,
  type ComponentScores,
} from './scoring-engine';

// Explanation engine
export {
  generateMatchExplanation,
  generateAllExplanations,
} from './explanation-engine';

// AI analysis (Anthropic Claude)
export {
  analyzeMatchWithAI,
  analyzePatientProfile,
  batchAnalyzeMatches,
  type AIMatchInsight,
  type AIPatientProfile,
} from './ai-analysis';

// Main matching service
export {
  MatchingService,
  getMatchingService,
  convertToTherapistComplete,
  convertToClientComplete,
} from './matching-service';
