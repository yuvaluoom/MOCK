/**
 * Internal Scoring Engine
 *
 * HIDDEN scoring system that factors in:
 * - Therapist performance metrics
 * - Predicted conversion probability
 * - Platform engagement signals
 * - Behavioral compatibility
 *
 * This score is NEVER exposed to users directly.
 * It's used to boost/demote matches in the final ranking.
 */

import type {
  TherapistPerformanceMetrics,
  UserEngagementMetrics,
  MatchOutcome,
  ScoringWeights,
} from '../core/types';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default internal scoring weights
 * These are tunable and can be A/B tested
 */
export const DEFAULT_INTERNAL_WEIGHTS: ScoringWeights['internal'] = {
  therapistPerformance: 0.35, // How well the therapist performs
  predictedConversion: 0.30, // Likelihood of successful match
  platformFit: 0.20, // How well they fit platform patterns
  behavioralMatch: 0.15, // Behavioral compatibility signals
};

/**
 * Default public-to-internal ratio
 * 0.8 = 80% public score, 20% internal adjustment
 */
export const DEFAULT_PUBLIC_INTERNAL_RATIO = 0.80;

// ============================================================================
// IN-MEMORY METRICS STORES
// ============================================================================

// Therapist performance cache
const therapistMetricsCache = new Map<string, TherapistPerformanceMetrics>();

// User engagement cache
const engagementMetricsCache = new Map<string, UserEngagementMetrics>();

// Match outcomes for learning
const matchOutcomesCache = new Map<string, MatchOutcome>();

// ============================================================================
// INTERNAL SCORER CLASS
// ============================================================================

export class InternalScorer {
  private weights: ScoringWeights['internal'];
  private publicInternalRatio: number;

  constructor(
    weights: ScoringWeights['internal'] = DEFAULT_INTERNAL_WEIGHTS,
    publicInternalRatio: number = DEFAULT_PUBLIC_INTERNAL_RATIO
  ) {
    this.weights = weights;
    this.publicInternalRatio = publicInternalRatio;
    this.initializeDefaultMetrics();
  }

  // ---------------------------------------------------------------------------
  // MAIN SCORING METHODS
  // ---------------------------------------------------------------------------

  /**
   * Calculate internal score for a match
   * Returns a value between 0-100
   */
  calculateInternalScore(
    clientId: string,
    therapistId: string,
    publicScore: number
  ): {
    internalScore: number;
    finalScore: number;
    breakdown: {
      therapistPerformance: number;
      predictedConversion: number;
      platformFit: number;
      behavioralMatch: number;
    };
    adjustmentApplied: number;
  } {
    // Get metrics
    const therapistMetrics = this.getTherapistMetrics(therapistId);
    const clientEngagement = this.getEngagementMetrics(clientId);

    // Calculate component scores
    const performanceScore = this.calculateTherapistPerformanceScore(therapistMetrics);
    const conversionScore = this.predictConversionProbability(clientId, therapistId);
    const platformFitScore = this.calculatePlatformFitScore(therapistMetrics, clientEngagement);
    const behavioralScore = this.calculateBehavioralMatchScore(clientId, therapistId);

    // Weighted internal score
    const internalScore = Math.round(
      performanceScore * this.weights.therapistPerformance +
      conversionScore * this.weights.predictedConversion +
      platformFitScore * this.weights.platformFit +
      behavioralScore * this.weights.behavioralMatch
    );

    // Blend with public score
    const finalScore = Math.round(
      publicScore * this.publicInternalRatio +
      internalScore * (1 - this.publicInternalRatio)
    );

    // Calculate adjustment (can be positive or negative)
    const adjustmentApplied = finalScore - publicScore;

    return {
      internalScore,
      finalScore,
      breakdown: {
        therapistPerformance: performanceScore,
        predictedConversion: conversionScore,
        platformFit: platformFitScore,
        behavioralMatch: behavioralScore,
      },
      adjustmentApplied,
    };
  }

  /**
   * Rank matches by final score (internal + public blend)
   */
  rankMatches(
    matches: Array<{ clientId: string; therapistId: string; publicScore: number }>
  ): Array<{
    clientId: string;
    therapistId: string;
    publicScore: number;
    finalScore: number;
    rank: number;
  }> {
    const scoredMatches = matches.map((match) => {
      const result = this.calculateInternalScore(
        match.clientId,
        match.therapistId,
        match.publicScore
      );

      return {
        ...match,
        finalScore: result.finalScore,
        rank: 0, // Will be set after sorting
      };
    });

    // Sort by final score (descending)
    scoredMatches.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks
    scoredMatches.forEach((match, index) => {
      match.rank = index + 1;
    });

    return scoredMatches;
  }

  // ---------------------------------------------------------------------------
  // COMPONENT SCORERS
  // ---------------------------------------------------------------------------

  /**
   * Score based on therapist's historical performance
   */
  private calculateTherapistPerformanceScore(
    metrics: TherapistPerformanceMetrics
  ): number {
    // Weighted factors
    const responseWeight = 0.20;
    const conversionWeight = 0.25;
    const retentionWeight = 0.30;
    const satisfactionWeight = 0.25;

    // Response score (faster is better, cap at 24 hours)
    const responseScore = Math.max(0, 100 - (metrics.averageResponseTimeHours / 24) * 50);

    // Conversion score (inquiry to booking)
    const conversionScore = metrics.inquiryToBookingRate * 100;

    // Retention score
    const retentionScore = Math.min(100, metrics.clientRetentionRate * 100);

    // Satisfaction score (1-5 scaled to 0-100)
    const satisfactionScore = ((metrics.averageClientSatisfaction - 1) / 4) * 100;

    return Math.round(
      responseScore * responseWeight +
      conversionScore * conversionWeight +
      retentionScore * retentionWeight +
      satisfactionScore * satisfactionWeight
    );
  }

  /**
   * Predict likelihood of successful match
   * Based on historical outcomes with similar profiles
   */
  private predictConversionProbability(
    clientId: string,
    therapistId: string
  ): number {
    // Get historical outcomes for this therapist
    const therapistOutcomes = this.getTherapistOutcomes(therapistId);

    if (therapistOutcomes.length === 0) {
      // New therapist - use baseline
      return 65; // Default moderate prediction
    }

    // Calculate success rate
    const successful = therapistOutcomes.filter(
      (o) => o.sessionBooked && o.firstSessionCompleted
    ).length;
    const successRate = successful / therapistOutcomes.length;

    // Add engagement signals from client
    const clientEngagement = this.getEngagementMetrics(clientId);
    let engagementBonus = 0;

    if (clientEngagement) {
      // Active clients more likely to convert
      if (clientEngagement.matchesViewed && clientEngagement.matchesViewed > 3) {
        engagementBonus += 10;
      }
      if (clientEngagement.therapistsContacted && clientEngagement.therapistsContacted > 0) {
        engagementBonus += 15;
      }
    }

    return Math.min(100, Math.round(successRate * 100 + engagementBonus));
  }

  /**
   * Score how well the pair fits platform patterns
   */
  private calculatePlatformFitScore(
    therapistMetrics: TherapistPerformanceMetrics,
    clientEngagement: UserEngagementMetrics | null
  ): number {
    let score = 50; // Baseline

    // Therapist responsiveness bonus
    if (therapistMetrics.responseRate > 0.9) score += 15;
    else if (therapistMetrics.responseRate > 0.7) score += 10;
    else if (therapistMetrics.responseRate < 0.5) score -= 15;

    // Therapist reliability bonus
    if (therapistMetrics.reliabilityScore > 80) score += 10;
    else if (therapistMetrics.reliabilityScore < 50) score -= 10;

    // Client engagement bonus
    if (clientEngagement) {
      if (clientEngagement.lastActivityAt) {
        const daysSinceActive = (Date.now() - clientEngagement.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceActive < 1) score += 10;
        else if (daysSinceActive < 7) score += 5;
        else if (daysSinceActive > 30) score -= 15;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Score behavioral compatibility signals
   */
  private calculateBehavioralMatchScore(
    clientId: string,
    therapistId: string
  ): number {
    // Get similar past matches
    const similarMatches = this.findSimilarMatchOutcomes(clientId, therapistId);

    if (similarMatches.length === 0) {
      return 50; // No data, neutral score
    }

    // Calculate success rate of similar matches
    const successfulSimilar = similarMatches.filter(
      (m) => m.isOngoingRelationship || m.sessionsIn30Days >= 3
    ).length;

    return Math.round((successfulSimilar / similarMatches.length) * 100);
  }

  // ---------------------------------------------------------------------------
  // METRICS MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Get or create therapist metrics
   */
  private getTherapistMetrics(therapistId: string): TherapistPerformanceMetrics {
    if (!therapistMetricsCache.has(therapistId)) {
      // Create default metrics for new therapist
      therapistMetricsCache.set(therapistId, this.createDefaultTherapistMetrics(therapistId));
    }
    return therapistMetricsCache.get(therapistId)!;
  }

  /**
   * Get engagement metrics for user
   */
  private getEngagementMetrics(userId: string): UserEngagementMetrics | null {
    return engagementMetricsCache.get(userId) ?? null;
  }

  /**
   * Get outcomes for therapist
   */
  private getTherapistOutcomes(therapistId: string): MatchOutcome[] {
    return Array.from(matchOutcomesCache.values()).filter(
      (o) => o.therapistId === therapistId
    );
  }

  /**
   * Find similar match outcomes for learning
   */
  private findSimilarMatchOutcomes(
    _clientId: string,
    therapistId: string
  ): MatchOutcome[] {
    // For now, just return outcomes for same therapist
    // In production, would use ML to find truly similar profiles
    return this.getTherapistOutcomes(therapistId).slice(0, 50);
  }

  /**
   * Create default metrics for new therapist
   */
  private createDefaultTherapistMetrics(therapistId: string): TherapistPerformanceMetrics {
    return {
      therapistId,
      averageResponseTimeHours: 12, // Assume moderate
      responseRate: 0.75,
      inquiryToBookingRate: 0.3,
      bookingToCompletionRate: 0.85,
      averageClientTenure: 3, // months
      clientRetentionRate: 0.6,
      averageClientSatisfaction: 4.0,
      feedbackCount: 0,
      complaintCount: 0,
      overallPerformanceScore: 70,
      reliabilityScore: 75,
      engagementScore: 70,
    };
  }

  // ---------------------------------------------------------------------------
  // DATA COLLECTION METHODS
  // ---------------------------------------------------------------------------

  /**
   * Update therapist metrics based on new data
   */
  updateTherapistMetrics(
    therapistId: string,
    updates: Partial<TherapistPerformanceMetrics>
  ): void {
    const current = this.getTherapistMetrics(therapistId);
    therapistMetricsCache.set(therapistId, { ...current, ...updates });
  }

  /**
   * Record user engagement event
   */
  recordEngagementEvent(
    userId: string,
    event: Partial<UserEngagementMetrics>
  ): void {
    const current = engagementMetricsCache.get(userId) ?? this.createDefaultEngagementMetrics(userId);
    engagementMetricsCache.set(userId, {
      ...current,
      ...event,
      lastActivityAt: new Date(),
    });
  }

  /**
   * Record match outcome for learning
   */
  recordMatchOutcome(outcome: MatchOutcome): void {
    matchOutcomesCache.set(outcome.matchId, outcome);

    // Update therapist metrics based on outcome
    if (outcome.firstSessionCompleted) {
      const metrics = this.getTherapistMetrics(outcome.therapistId);
      const outcomes = this.getTherapistOutcomes(outcome.therapistId);

      // Recalculate metrics
      const completed = outcomes.filter((o) => o.firstSessionCompleted).length;
      const booked = outcomes.filter((o) => o.sessionBooked).length;

      this.updateTherapistMetrics(outcome.therapistId, {
        bookingToCompletionRate: booked > 0 ? completed / booked : metrics.bookingToCompletionRate,
      });
    }
  }

  private createDefaultEngagementMetrics(userId: string): UserEngagementMetrics {
    return {
      userId,
      role: 'PATIENT',
      totalSessionsBooked: 0,
      totalSessionsCompleted: 0,
      totalSessionsCancelled: 0,
      profileViewCount: 0,
      matchViewCount: 0,
      messagesSent: 0,
      lastActivityAt: new Date(),
    };
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------

  /**
   * Initialize with mock metrics for testing
   */
  private initializeDefaultMetrics(): void {
    // Create mock metrics for existing therapists
    const mockTherapistIds = [
      'therapist-1', 'therapist-2', 'therapist-3',
      'therapist-4', 'therapist-5', 'therapist-6', 'therapist-7'
    ];

    mockTherapistIds.forEach((id, index) => {
      // Vary metrics slightly for each therapist
      const baseScore = 70 + (index * 3) % 20;
      therapistMetricsCache.set(id, {
        therapistId: id,
        averageResponseTimeHours: 6 + (index * 2) % 12,
        responseRate: 0.7 + (index * 0.03) % 0.25,
        inquiryToBookingRate: 0.25 + (index * 0.05) % 0.35,
        bookingToCompletionRate: 0.8 + (index * 0.02) % 0.18,
        averageClientTenure: 2 + (index % 6),
        clientRetentionRate: 0.5 + (index * 0.05) % 0.4,
        averageClientSatisfaction: 3.5 + (index * 0.2) % 1.3,
        feedbackCount: 10 + (index * 5) % 40,
        complaintCount: index % 3,
        overallPerformanceScore: baseScore,
        reliabilityScore: baseScore + 5,
        engagementScore: baseScore - 5,
      });
    });

    // Create mock engagement metrics for test patient
    engagementMetricsCache.set('patient-1', {
      userId: 'patient-1',
      role: 'PATIENT',
      totalSessionsBooked: 3,
      totalSessionsCompleted: 2,
      totalSessionsCancelled: 0,
      profileViewCount: 15,
      matchViewCount: 25,
      messagesSent: 5,
      lastActivityAt: new Date(),
      therapistsContacted: 3,
      matchesViewed: 12,
      matchesFavorited: 4,
      matchesHidden: 2,
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let internalScorerInstance: InternalScorer | null = null;

export function getInternalScorer(): InternalScorer {
  if (!internalScorerInstance) {
    internalScorerInstance = new InternalScorer();
  }
  return internalScorerInstance;
}

// ============================================================================
// ADMIN-ONLY API (for internal dashboards)
// ============================================================================

export function getTherapistInternalMetrics(
  therapistId: string
): TherapistPerformanceMetrics | null {
  return therapistMetricsCache.get(therapistId) ?? null;
}

export function getAllTherapistMetrics(): TherapistPerformanceMetrics[] {
  return Array.from(therapistMetricsCache.values());
}

export function getMatchOutcomeStats(): {
  total: number;
  successRate: number;
  averageSessionsPerMatch: number;
} {
  const outcomes = Array.from(matchOutcomesCache.values());
  const successful = outcomes.filter((o) => o.firstSessionCompleted).length;

  return {
    total: outcomes.length,
    successRate: outcomes.length > 0 ? successful / outcomes.length : 0,
    averageSessionsPerMatch: outcomes.reduce((sum, o) => sum + o.sessionsIn30Days, 0) / Math.max(1, outcomes.length),
  };
}
