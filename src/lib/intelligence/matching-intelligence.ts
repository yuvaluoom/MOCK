/**
 * Matching Intelligence Service
 *
 * Unified intelligence layer that combines:
 * - Public matching algorithm (transparent, user-facing)
 * - Internal scoring (hidden, performance-based)
 * - Behavioral learning (engagement signals)
 * - Future ML integration point
 *
 * Architecture:
 * - Completely abstracted from UI
 * - Modular and replaceable
 * - Supports A/B testing
 * - ML-ready infrastructure
 */

import { calculateDetailedMatch, type DetailedMatchResult } from '@/lib/matching';
import { getInternalScorer, type InternalScorer } from './scoring/internal-scorer';
import type {
  MatchScoreResult,
  MatchExplanation,
  UserEngagementMetrics,
  MatchOutcome,
  MLPrediction,
} from './core/types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface IntelligenceConfig {
  // Enable/disable internal scoring
  useInternalScoring: boolean;

  // How much internal score affects final ranking (0-1)
  internalInfluence: number;

  // Enable behavioral learning
  enableBehavioralLearning: boolean;

  // Enable ML predictions (when available)
  enableMLPredictions: boolean;

  // Algorithm version for tracking
  algorithmVersion: string;
}

const DEFAULT_CONFIG: IntelligenceConfig = {
  useInternalScoring: true,
  internalInfluence: 0.2, // 20% internal, 80% public
  enableBehavioralLearning: true,
  enableMLPredictions: false, // Not yet implemented
  algorithmVersion: '2.0.0-intelligence',
};

// ============================================================================
// MATCHING INTELLIGENCE SERVICE
// ============================================================================

export class MatchingIntelligenceService {
  private config: IntelligenceConfig;
  private internalScorer: InternalScorer;
  private mlModel: MLModelInterface | null = null;

  constructor(config: Partial<IntelligenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.internalScorer = getInternalScorer();
  }

  // ---------------------------------------------------------------------------
  // MAIN MATCHING API
  // ---------------------------------------------------------------------------

  /**
   * Get intelligent matches for a client
   * Returns matches sorted by final score (public + internal blend)
   */
  async getIntelligentMatches(
    client: ClientData,
    therapists: TherapistData[],
    options: MatchingOptions = {}
  ): Promise<IntelligentMatchResult[]> {
    const results: IntelligentMatchResult[] = [];

    for (const therapist of therapists) {
      // 1. Calculate public score using existing algorithm
      const publicMatch = calculateDetailedMatch(
        client.profile,
        client.xFactor,
        therapist.profile
      );

      // Skip if doesn't pass hard filters
      if (publicMatch.overallScore < (options.minimumScore ?? 40)) {
        continue;
      }

      // 2. Calculate internal score (hidden)
      let finalScore = publicMatch.overallScore;
      let internalBreakdown = null;

      if (this.config.useInternalScoring) {
        const internalResult = this.internalScorer.calculateInternalScore(
          client.id,
          therapist.id,
          publicMatch.overallScore
        );
        finalScore = internalResult.finalScore;
        internalBreakdown = internalResult.breakdown;
      }

      // 3. Apply ML prediction boost (future)
      if (this.config.enableMLPredictions && this.mlModel) {
        const prediction = await this.mlModel.predict(client, therapist);
        if (prediction) {
          finalScore = this.blendWithMLPrediction(finalScore, prediction);
        }
      }

      // 4. Generate explanation (public only - never expose internal factors)
      const explanation = this.generateExplanation(publicMatch, therapist);

      results.push({
        matchId: `match-${client.id}-${therapist.id}`,
        clientId: client.id,
        therapistId: therapist.id,

        // Public scores (shown to users)
        publicScore: publicMatch.overallScore,
        matchQuality: publicMatch.matchQuality,
        factors: publicMatch.factors,
        topReasons: publicMatch.topReasons,
        explanation,

        // Final score for ranking (includes hidden factors)
        finalScore,

        // Internal data (NEVER expose to users)
        _internal: {
          internalBreakdown,
          algorithmVersion: this.config.algorithmVersion,
          computedAt: new Date(),
        },

        // Therapist data for display
        therapist: {
          id: therapist.id,
          firstName: therapist.profile.firstName,
          lastName: therapist.profile.lastName,
          ...therapist.displayData,
        },
      });
    }

    // Sort by final score (internal-adjusted)
    results.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks
    results.forEach((r, i) => {
      r.rank = i + 1;
    });

    return results;
  }

  /**
   * Get detailed match for single therapist
   */
  async getMatchDetails(
    client: ClientData,
    therapist: TherapistData
  ): Promise<MatchScoreResult> {
    const publicMatch = calculateDetailedMatch(
      client.profile,
      client.xFactor,
      therapist.profile
    );

    const internalResult = this.config.useInternalScoring
      ? this.internalScorer.calculateInternalScore(
          client.id,
          therapist.id,
          publicMatch.overallScore
        )
      : null;

    return {
      matchId: `match-${client.id}-${therapist.id}`,
      clientId: client.id,
      therapistId: therapist.id,
      publicScore: publicMatch.overallScore,
      internalScore: internalResult?.internalScore ?? publicMatch.overallScore,
      publicBreakdown: {
        coreCompatibility: this.extractCoreScore(publicMatch),
        preferenceMatch: this.extractPreferenceScore(publicMatch),
        xFactorMatch: this.extractXFactorScore(publicMatch),
      },
      internalBreakdown: internalResult?.breakdown ?? {
        therapistPerformance: 0,
        predictedConversion: 0,
        platformFit: 0,
        behavioralMatch: 0,
      },
      matchQuality: publicMatch.matchQuality.toUpperCase() as any,
      confidence: this.calculateConfidence(publicMatch, internalResult),
      algorithmVersion: this.config.algorithmVersion,
      computedAt: new Date(),
      xFactorUsed: client.xFactor !== null,
      internalFactorsUsed: this.config.useInternalScoring,
    };
  }

  // ---------------------------------------------------------------------------
  // BEHAVIORAL LEARNING
  // ---------------------------------------------------------------------------

  /**
   * Record that a user viewed a match
   */
  recordMatchView(userId: string, matchId: string, therapistId: string): void {
    if (!this.config.enableBehavioralLearning) return;

    this.internalScorer.recordEngagementEvent(userId, {
      matchViewCount: 1, // Increment handled elsewhere
      lastActivityAt: new Date(),
    });
  }

  /**
   * Record that a user favorited a match
   */
  recordMatchFavorite(userId: string, matchId: string, therapistId: string): void {
    if (!this.config.enableBehavioralLearning) return;

    this.internalScorer.recordEngagementEvent(userId, {
      matchesFavorited: 1,
      lastActivityAt: new Date(),
    });
  }

  /**
   * Record that a user contacted a therapist
   */
  recordTherapistContact(
    userId: string,
    therapistId: string,
    matchScore: number
  ): void {
    if (!this.config.enableBehavioralLearning) return;

    this.internalScorer.recordEngagementEvent(userId, {
      therapistsContacted: 1,
      lastActivityAt: new Date(),
    });

    // Track as partial outcome
    this.internalScorer.recordMatchOutcome({
      matchId: `match-${userId}-${therapistId}`,
      clientId: userId,
      therapistId,
      matchScore,
      algorithmVersion: this.config.algorithmVersion,
      wasViewed: true,
      viewedAt: new Date(),
      wasFavorited: false,
      wasContacted: true,
      contactedAt: new Date(),
      sessionBooked: false,
      firstSessionCompleted: false,
      sessionsIn30Days: 0,
      isOngoingRelationship: false,
    });
  }

  /**
   * Record session outcome for learning
   */
  recordSessionOutcome(
    matchId: string,
    clientId: string,
    therapistId: string,
    outcome: {
      completed: boolean;
      clientRating?: number;
      continuesRelationship: boolean;
    }
  ): void {
    if (!this.config.enableBehavioralLearning) return;

    this.internalScorer.recordMatchOutcome({
      matchId,
      clientId,
      therapistId,
      matchScore: 0, // Not tracked at this point
      algorithmVersion: this.config.algorithmVersion,
      wasViewed: true,
      wasFavorited: false,
      wasContacted: true,
      sessionBooked: true,
      sessionBookedAt: new Date(),
      firstSessionCompleted: outcome.completed,
      firstSessionCompletedAt: outcome.completed ? new Date() : undefined,
      sessionsIn30Days: outcome.completed ? 1 : 0,
      isOngoingRelationship: outcome.continuesRelationship,
      clientFeedbackScore: outcome.clientRating,
    });

    // Update therapist metrics
    if (outcome.clientRating) {
      // Would recalculate average - simplified here
      this.internalScorer.updateTherapistMetrics(therapistId, {
        feedbackCount: 1, // Increment handled in scorer
      });
    }
  }

  // ---------------------------------------------------------------------------
  // EXPLANATION GENERATION
  // ---------------------------------------------------------------------------

  /**
   * Generate user-facing explanation
   * NEVER includes internal scoring factors
   */
  private generateExplanation(
    match: DetailedMatchResult,
    therapist: TherapistData
  ): MatchExplanation {
    const positiveFactors: MatchExplanation['positiveFactors'] = [];
    const neutralFactors: MatchExplanation['neutralFactors'] = [];
    const considerations: MatchExplanation['considerations'] = [];

    // Analyze factors
    for (const factor of match.factors) {
      if (factor.score >= 80) {
        positiveFactors.push({
          category: factor.key,
          description: factor.reasons[0] || `Strong ${factor.key} match`,
          descriptionHebrew: this.translateReason(factor.reasons[0] || ''),
          importance: 'HIGH',
        });
      } else if (factor.score >= 60) {
        neutralFactors.push({
          category: factor.key,
          description: factor.reasons[0] || `Good ${factor.key} compatibility`,
          descriptionHebrew: this.translateReason(factor.reasons[0] || ''),
          importance: 'MEDIUM',
        });
      } else if (factor.score < 50) {
        considerations.push({
          category: factor.key,
          description: factor.reasons[0] || `Limited ${factor.key} match`,
          descriptionHebrew: this.translateReason(factor.reasons[0] || ''),
          importance: 'LOW',
        });
      }
    }

    // Add therapist-specific positive factors
    if (therapist.profile.yearsOfExperience >= 10) {
      positiveFactors.push({
        category: 'experience',
        description: 'Over 10 years of professional experience',
        descriptionHebrew: 'Experience מקצועי of over-10 Monם',
        importance: 'HIGH',
      });
    }

    return {
      matchId: `match-${therapist.id}`,
      summary: this.generateSummary(match, positiveFactors.length),
      summaryHebrew: this.generateSummaryHebrew(match, positiveFactors.length),
      positiveFactors,
      neutralFactors,
      considerations,
    };
  }

  private generateSummary(match: DetailedMatchResult, positiveCount: number): string {
    if (match.overallScore >= 85) {
      return 'Excellent match based on comprehensive profile analysis';
    } else if (match.overallScore >= 70) {
      return `Strong compatibility with ${positiveCount} key matching factors`;
    } else if (match.overallScore >= 55) {
      return 'Good potential match based on your preferences';
    }
    return 'Moderate match - consider reviewing profile details';
  }

  private generateSummaryHebrew(match: DetailedMatchResult, positiveCount: number): string {
    if (match.overallScore >= 85) {
      return 'Excellent Match על בסיס ניתוח מקיף של הפרופיל';
    } else if (match.overallScore >= 70) {
      return `תאימs גבוהה With ${positiveCount} גורמי Match מרכזיs`;
    } else if (match.overallScore >= 55) {
      return 'Good Match על בסיס ההup toOptions Your';
    }
    return 'Moderate Match - Recommended לעיין בPrivate הפרופיל';
  }

  private translateReason(reason: string): string {
    // Simple translation mapping - in production would use i18n
    const translations: Record<string, string> = {
      'Strong compatibility': 'תאימs גבוהה',
      'Similar treatment approach': 'גישה Therapyית דומה',
      'Matching specialization': 'Specialization מתאימה',
      'Health fund coverage': 'Coverage Health Fund',
      'Available session times': 'זמני Sessions זמינs',
    };
    return translations[reason] || reason;
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  private extractCoreScore(match: DetailedMatchResult): number {
    const core = match.factors.filter(
      (f) => !['xFactor', 'preferences'].includes(f.key)
    );
    return Math.round(core.reduce((sum, f) => sum + f.score, 0) / Math.max(1, core.length));
  }

  private extractPreferenceScore(match: DetailedMatchResult): number {
    const pref = match.factors.find((f) => f.key === 'preferences');
    return pref?.score ?? 0;
  }

  private extractXFactorScore(match: DetailedMatchResult): number | undefined {
    const xf = match.factors.find((f) => f.key === 'xFactor');
    return xf?.score;
  }

  private calculateConfidence(
    match: DetailedMatchResult,
    internalResult: any
  ): number {
    // Base confidence on data availability
    let confidence = 0.6;

    // More factors = higher confidence
    const factorCount = match.factors.filter((f) => f.score > 0).length;
    confidence += factorCount * 0.05;

    // X-Factor data increases confidence
    if (match.factors.some((f) => f.key === 'xFactor' && f.score > 0)) {
      confidence += 0.15;
    }

    // Internal metrics add confidence
    if (internalResult?.breakdown) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  private blendWithMLPrediction(currentScore: number, prediction: MLPrediction): number {
    // Weight ML prediction based on confidence
    const mlInfluence = prediction.confidence * 0.15; // Max 15% influence
    return Math.round(
      currentScore * (1 - mlInfluence) +
      prediction.predictedSuccessRate * 100 * mlInfluence
    );
  }
}

// ============================================================================
// TYPES FOR THIS SERVICE
// ============================================================================

interface ClientData {
  id: string;
  profile: any; // MockPatient type
  xFactor: any; // MockXFactorProfile | null
}

interface TherapistData {
  id: string;
  profile: any; // MockTherapist type
  displayData: {
    title?: string;
    photoUrl?: string;
    city?: string;
    offersOnline: boolean;
    offersInPerson: boolean;
    specializations: string[];
    approaches: string[];
    acceptedHealthFunds: string[];
    sessionPrice: number;
    yearsOfExperience: number;
    languages: string[];
  };
}

interface MatchingOptions {
  minimumScore?: number;
  limit?: number;
  offset?: number;
}

interface IntelligentMatchResult {
  matchId: string;
  clientId: string;
  therapistId: string;
  publicScore: number;
  finalScore: number;
  rank?: number;
  matchQuality: string;
  factors: any[];
  topReasons: string[];
  explanation: MatchExplanation;
  therapist: any;
  _internal: {
    internalBreakdown: any;
    algorithmVersion: string;
    computedAt: Date;
  };
}

interface MLModelInterface {
  predict(client: ClientData, therapist: TherapistData): Promise<MLPrediction | null>;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let intelligenceServiceInstance: MatchingIntelligenceService | null = null;

export function getMatchingIntelligence(
  config?: Partial<IntelligenceConfig>
): MatchingIntelligenceService {
  if (!intelligenceServiceInstance || config) {
    intelligenceServiceInstance = new MatchingIntelligenceService(config);
  }
  return intelligenceServiceInstance;
}

// Re-export types
export type { IntelligentMatchResult, ClientData, TherapistData, MatchingOptions };
