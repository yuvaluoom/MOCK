/**
 * MatchMind Matching Engine - Core Engine
 *
 * Main orchestrator that combines feature extraction, scoring,
 * and explainability into a unified matching pipeline.
 */

import type {
  IMatchingEngine,
  IFeatureExtractor,
  IScorer,
  IExplainer,
  PatientProfile,
  TherapistProfile,
  XFactorProfile,
  MatchResult,
  MatchListResult,
  RankedMatch,
  ExtractedFeatures,
  MatchingConfig,
} from '../types';
import { FeatureExtractor } from '../features/extractor';
import { Scorer } from '../scoring/scorer';
import { Explainer } from '../explainability/explainer';
import { DEFAULT_MATCHING_CONFIG, getConfig } from '../config/default-config';

// =============================================================================
// MATCHING ENGINE IMPLEMENTATION
// =============================================================================

export class MatchingEngine implements IMatchingEngine {
  private featureExtractor: IFeatureExtractor;
  private scorer: IScorer;
  private explainer: IExplainer;
  private config: MatchingConfig;

  constructor(
    config?: MatchingConfig,
    featureExtractor?: IFeatureExtractor,
    scorer?: IScorer,
    explainer?: IExplainer
  ) {
    this.config = config || DEFAULT_MATCHING_CONFIG;
    this.featureExtractor = featureExtractor || new FeatureExtractor();
    this.scorer = scorer || new Scorer();
    this.explainer = explainer || new Explainer();
  }

  /**
   * Compute match for a single patient-therapist pair
   */
  computeMatch(
    patient: PatientProfile,
    xFactor: XFactorProfile,
    therapist: TherapistProfile,
    config?: MatchingConfig
  ): MatchResult {
    const effectiveConfig = config || this.config;
    const startTime = performance.now();

    // Step 1: Extract features
    const features = this.extractFeatures(patient, xFactor, therapist);

    // Step 2: Compute score
    const score = this.scorer.computeScore(features, effectiveConfig);

    // Step 3: Generate explanation
    const explanation = this.explainer.generateExplanation(
      features,
      score,
      patient,
      therapist
    );

    const processingTime = performance.now() - startTime;

    return {
      patientId: patient.id,
      therapistId: therapist.id,
      score,
      explanation,
      metadata: {
        algorithmVersion: effectiveConfig.id,
        configId: effectiveConfig.id,
        computedAt: new Date(),
        patientProfileVersion: 1,
        xFactorProfileVersion: xFactor.version,
        processingTimeMs: processingTime,
      },
    };
  }

  /**
   * Compute matches for a patient against multiple therapists
   */
  computeMatches(
    patient: PatientProfile,
    xFactor: XFactorProfile,
    therapists: TherapistProfile[],
    config?: MatchingConfig
  ): MatchListResult {
    const effectiveConfig = config || this.config;

    // Compute match for each therapist
    const results = therapists.map(therapist =>
      this.computeMatch(patient, xFactor, therapist, effectiveConfig)
    );

    // Filter by minimum score
    const filtered = results.filter(
      r => r.score.overall >= effectiveConfig.thresholds.minimumScore
    );

    // Sort by score descending and add rank
    const sorted = filtered.sort((a, b) => b.score.overall - a.score.overall);

    const rankedMatches: RankedMatch[] = sorted.map((result, index) => ({
      ...result,
      rank: index + 1,
    }));

    return {
      patientId: patient.id,
      matches: rankedMatches,
      totalCandidates: therapists.length,
      filteredOut: therapists.length - filtered.length,
      computedAt: new Date(),
      algorithmVersion: effectiveConfig.id,
    };
  }

  /**
   * Extract features from patient, xFactor, and therapist profiles
   */
  private extractFeatures(
    patient: PatientProfile,
    xFactor: XFactorProfile,
    therapist: TherapistProfile
  ): ExtractedFeatures {
    const patientFeatures = this.featureExtractor.extractPatientFeatures(patient, xFactor);
    const therapistFeatures = this.featureExtractor.extractTherapistFeatures(therapist);
    const derivedFeatures = this.featureExtractor.computeDerivedFeatures(
      patientFeatures,
      therapistFeatures
    );

    return {
      patientFeatures,
      therapistFeatures,
      derivedFeatures,
    };
  }

  /**
   * Update engine configuration
   */
  setConfig(config: MatchingConfig): void {
    this.config = config;
  }

  /**
   * Get current configuration
   */
  getConfig(): MatchingConfig {
    return this.config;
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a new matching engine with default configuration
 */
export function createMatchingEngine(configId?: string): IMatchingEngine {
  const config = getConfig(configId);
  return new MatchingEngine(config);
}

/**
 * Create a matching engine with custom configuration
 */
export function createCustomMatchingEngine(
  config: MatchingConfig
): IMatchingEngine {
  return new MatchingEngine(config);
}

/**
 * Create a matching engine with custom components (for testing/DI)
 */
export function createMatchingEngineWithDependencies(
  config: MatchingConfig,
  featureExtractor: IFeatureExtractor,
  scorer: IScorer,
  explainer: IExplainer
): IMatchingEngine {
  return new MatchingEngine(config, featureExtractor, scorer, explainer);
}

// =============================================================================
// BATCH PROCESSING
// =============================================================================

export interface BatchMatchingOptions {
  configId?: string;
  limit?: number;
  minimumScore?: number;
}

export interface BatchMatchingResult {
  patientId: string;
  matchListResult: MatchListResult;
  processedAt: Date;
  processingTimeMs: number;
}

/**
 * Process matching for multiple patients in batch
 */
export async function batchMatchPatients(
  patients: Array<{ patient: PatientProfile; xFactor: XFactorProfile }>,
  therapists: TherapistProfile[],
  options?: BatchMatchingOptions
): Promise<BatchMatchingResult[]> {
  const { configId, limit = 10 } = options || {};

  const engine = createMatchingEngine(configId);
  const results: BatchMatchingResult[] = [];

  for (const { patient, xFactor } of patients) {
    const startTime = performance.now();

    const matchListResult = engine.computeMatches(patient, xFactor, therapists);

    // Apply limit
    if (limit && matchListResult.matches.length > limit) {
      matchListResult.matches = matchListResult.matches.slice(0, limit);
    }

    results.push({
      patientId: patient.id,
      matchListResult,
      processedAt: new Date(),
      processingTimeMs: performance.now() - startTime,
    });
  }

  return results;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a quick compatibility check without full matching
 */
export function quickCompatibilityCheck(
  patient: PatientProfile,
  xFactor: XFactorProfile,
  therapist: TherapistProfile
): { compatible: boolean; score: number; quality: string } {
  const engine = createMatchingEngine();
  const result = engine.computeMatch(patient, xFactor, therapist);

  return {
    compatible: result.score.constraintSatisfaction.allSatisfied,
    score: result.score.overall,
    quality: result.score.quality,
  };
}

/**
 * Rank therapists by a specific component
 */
export function rankByComponent(
  patient: PatientProfile,
  xFactor: XFactorProfile,
  therapists: TherapistProfile[],
  component: 'xFactor' | 'healthFund' | 'availability' | 'location' | 'preferences'
): Array<{ therapist: TherapistProfile; componentScore: number }> {
  const engine = createMatchingEngine();

  const results = therapists.map(therapist => {
    const match = engine.computeMatch(patient, xFactor, therapist);
    return {
      therapist,
      componentScore: match.score.components[component].score,
    };
  });

  return results.sort((a, b) => b.componentScore - a.componentScore);
}
