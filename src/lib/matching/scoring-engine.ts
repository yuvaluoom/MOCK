/**
 * MatchMind Scoring Engine
 *
 * A modular, layered scoring system for therapist-client matching.
 *
 * Architecture:
 * - Layer A: Hard Filters (binary pass/fail)
 * - Layer B: Core Weighted Score (required data)
 * - Layer C: X-Factor Score (optional statistical layer)
 *
 * Design Principles:
 * 1. System functions fully without X-Factor data
 * 2. All scores are transparent and explainable
 * 3. Weights are configurable without code changes
 * 4. Future ML integration ready
 */

import type {
  ClientComplete,
  TherapistComplete,
  MatchingScore,
  Specialization,
  Language,
  TherapyApproach,
  SessionFormat,
} from './schema';
import {
  DEFAULT_ALGORITHM_WEIGHTS,
  HARD_FILTER_CONFIG,
  getAdjustedWeights,
} from './config';
import type { AlgorithmWeights } from './schema';

// =============================================================================
// TYPES
// =============================================================================

export interface ScoringResult {
  passed: boolean;
  score: Omit<MatchingScore, 'id' | 'computedAt' | 'expiresAt'>;
  filterResults: HardFilterResults;
  componentScores: ComponentScores;
}

export interface HardFilterResults {
  sessionFormatPassed: boolean;
  languagePassed: boolean;
  statusPassed: boolean;
  overallPassed: boolean;
  failureReasons: string[];
}

export interface ComponentScores {
  specialization: number;
  availability: number;
  language: number;
  location: number;
  experience: number;
  price: number;
  preference: number;
  xFactor: number | null;
}

// =============================================================================
// MAIN SCORING FUNCTION
// =============================================================================

/**
 * Calculate match score between a client and therapist
 */
export function calculateMatchScore(
  client: ClientComplete,
  therapist: TherapistComplete,
  weights: AlgorithmWeights = DEFAULT_ALGORITHM_WEIGHTS
): ScoringResult {
  // Step 1: Apply hard filters
  const filterResults = applyHardFilters(client, therapist);

  if (!filterResults.overallPassed) {
    return {
      passed: false,
      score: createFailedScore(client, therapist, weights, filterResults),
      filterResults,
      componentScores: createZeroScores(),
    };
  }

  // Step 2: Calculate component scores
  const componentScores = calculateComponentScores(client, therapist);

  // Step 3: Calculate layer scores
  const coreScore = calculateCoreScore(componentScores, weights);
  const preferenceScore = componentScores.preference;
  const xFactorScore = componentScores.xFactor;

  // Step 4: Calculate final weighted score
  const hasXFactor = xFactorScore !== null;
  const adjustedWeights = getAdjustedWeights(weights, hasXFactor);

  let finalScore: number;
  if (hasXFactor) {
    finalScore =
      adjustedWeights.coreWeight * coreScore +
      adjustedWeights.preferenceWeight * preferenceScore +
      adjustedWeights.xFactorWeight * (xFactorScore ?? 0);
  } else {
    finalScore =
      adjustedWeights.coreWeight * coreScore +
      adjustedWeights.preferenceWeight * preferenceScore;
  }

  // Ensure score is in valid range
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  // Determine match quality
  const matchQuality = getMatchQuality(finalScore, weights);

  // Check minimum threshold
  const passed = finalScore >= weights.minimumScoreThreshold;

  return {
    passed,
    score: {
      clientId: client.profile.id,
      therapistId: therapist.therapist.id,
      hardFiltersPassed: true,
      coreScore: Math.round(coreScore),
      xFactorScore: xFactorScore !== null ? Math.round(xFactorScore) : null,
      specializationScore: Math.round(componentScores.specialization),
      availabilityScore: Math.round(componentScores.availability),
      languageScore: Math.round(componentScores.language),
      locationScore: Math.round(componentScores.location),
      experienceScore: Math.round(componentScores.experience),
      priceScore: Math.round(componentScores.price),
      preferenceScore: Math.round(componentScores.preference),
      finalScore,
      matchQuality,
      rank: 0, // Will be set after sorting all matches
      algorithmVersion: weights.version,
      weightsUsed: {
        core: adjustedWeights.coreWeight,
        preference: adjustedWeights.preferenceWeight,
        xFactor: adjustedWeights.xFactorWeight,
      },
    },
    filterResults,
    componentScores,
  };
}

// =============================================================================
// LAYER A: HARD FILTERS
// =============================================================================

function applyHardFilters(
  client: ClientComplete,
  therapist: TherapistComplete
): HardFilterResults {
  const failureReasons: string[] = [];

  // 1. Therapist status check
  const statusPassed =
    therapist.therapist.approvalStatus === 'APPROVED' &&
    therapist.therapist.isAcceptingPatients;

  if (!statusPassed) {
    failureReasons.push('Therapist not available');
  }

  // 2. Session format compatibility
  let sessionFormatPassed = true;
  if (client.intake) {
    const preferredFormat = client.intake.preferredSessionFormat;
    if (preferredFormat === 'ONLINE' && !therapist.therapist.offersOnline) {
      sessionFormatPassed = false;
      failureReasons.push('Does not offer online sessions');
    }
    if (preferredFormat === 'IN_PERSON' && !therapist.therapist.offersInPerson) {
      sessionFormatPassed = false;
      failureReasons.push('Does not offer in-person sessions');
    }
  }

  // 3. Language compatibility (at least one shared language)
  let languagePassed = true;
  if (client.intake && HARD_FILTER_CONFIG.languageStrict) {
    const clientLanguages = client.intake.preferredLanguages;
    const therapistLanguages = therapist.languages.map((l) => l.language);
    const hasSharedLanguage = clientLanguages.some((lang) =>
      therapistLanguages.includes(lang)
    );
    if (!hasSharedLanguage) {
      languagePassed = false;
      failureReasons.push('No shared language');
    }
  }

  const overallPassed = statusPassed && sessionFormatPassed && languagePassed;

  return {
    sessionFormatPassed,
    languagePassed,
    statusPassed,
    overallPassed,
    failureReasons,
  };
}

// =============================================================================
// LAYER B: COMPONENT SCORES
// =============================================================================

function calculateComponentScores(
  client: ClientComplete,
  therapist: TherapistComplete
): ComponentScores {
  return {
    specialization: calculateSpecializationScore(client, therapist),
    availability: calculateAvailabilityScore(client, therapist),
    language: calculateLanguageScore(client, therapist),
    location: calculateLocationScore(client, therapist),
    experience: calculateExperienceScore(client, therapist),
    price: calculatePriceScore(client, therapist),
    preference: calculatePreferenceScore(client, therapist),
    xFactor: calculateXFactorScore(client, therapist),
  };
}

/**
 * Specialization Match Score
 * How well therapist specializations match client concerns
 */
function calculateSpecializationScore(
  client: ClientComplete,
  therapist: TherapistComplete
): number {
  if (!client.intake || client.intake.primaryConcerns.length === 0) {
    return 50; // Neutral if no concerns specified
  }

  const clientConcerns = new Set(client.intake.primaryConcerns);
  const therapistSpecs = therapist.specializations;

  // Primary specializations worth more
  const primarySpecs = therapistSpecs.filter((s) => s.isPrimary);
  const secondarySpecs = therapistSpecs.filter((s) => !s.isPrimary);

  let score = 0;
  let matchCount = 0;

  // Check primary specializations (40 points each, max 80)
  for (const spec of primarySpecs) {
    if (clientConcerns.has(spec.specialization)) {
      score += 40;
      matchCount++;
      if (matchCount >= 2) break;
    }
  }

  // Check secondary specializations (20 points each, max 20)
  if (matchCount < 2) {
    for (const spec of secondarySpecs) {
      if (clientConcerns.has(spec.specialization)) {
        score += 20;
        matchCount++;
        if (matchCount >= 3) break;
      }
    }
  }

  // Normalize to 0-100
  return Math.min(100, score);
}

/**
 * Availability Match Score
 * Schedule overlap between client preferences and therapist availability
 */
function calculateAvailabilityScore(
  client: ClientComplete,
  therapist: TherapistComplete
): number {
  if (!client.intake) {
    return 50;
  }

  const clientDays = new Set(client.intake.preferredDays);
  const clientSlots = new Set(client.intake.preferredTimeSlots);
  const therapistAvailability = therapist.availability;

  if (therapistAvailability.length === 0) {
    return 30; // Low score if no availability data
  }

  let matchingSlots = 0;
  let totalPossibleMatches = clientDays.size * clientSlots.size;

  for (const avail of therapistAvailability) {
    if (!clientDays.has(avail.dayOfWeek)) continue;

    // Check time slot overlap
    const startHour = parseInt(avail.startTime.split(':')[0]);
    const endHour = parseInt(avail.endTime.split(':')[0]);

    if (clientSlots.has('MORNING') && startHour < 12 && endHour > 8) {
      matchingSlots++;
    }
    if (clientSlots.has('AFTERNOON') && startHour < 17 && endHour > 12) {
      matchingSlots++;
    }
    if (clientSlots.has('EVENING') && endHour > 17) {
      matchingSlots++;
    }
  }

  if (totalPossibleMatches === 0) {
    return 50;
  }

  return Math.min(100, (matchingSlots / totalPossibleMatches) * 100);
}

/**
 * Language Compatibility Score
 */
function calculateLanguageScore(
  client: ClientComplete,
  therapist: TherapistComplete
): number {
  if (!client.intake || client.intake.preferredLanguages.length === 0) {
    return 80; // High default if no preference
  }

  const clientLanguages = client.intake.preferredLanguages;
  const therapistLanguages = therapist.languages;

  let bestScore = 0;

  for (const clientLang of clientLanguages) {
    const match = therapistLanguages.find((tl) => tl.language === clientLang);
    if (match) {
      let langScore = 0;
      switch (match.proficiencyLevel) {
        case 'NATIVE':
          langScore = 100;
          break;
        case 'FLUENT':
          langScore = 85;
          break;
        case 'CONVERSATIONAL':
          langScore = 60;
          break;
      }
      bestScore = Math.max(bestScore, langScore);
    }
  }

  return bestScore;
}

/**
 * Location/Format Compatibility Score
 */
function calculateLocationScore(
  client: ClientComplete,
  therapist: TherapistComplete
): number {
  if (!client.intake) {
    return 50;
  }

  const preferredFormat = client.intake.preferredSessionFormat;

  // Online sessions - location doesn't matter
  if (preferredFormat === 'ONLINE') {
    return therapist.therapist.offersOnline ? 100 : 0;
  }

  // In-person - check geographic proximity
  if (preferredFormat === 'IN_PERSON' || preferredFormat === 'HYBRID') {
    if (!therapist.therapist.offersInPerson) {
      return preferredFormat === 'HYBRID' ? 50 : 0;
    }

    // Simple city matching (in production, use actual geo distance)
    const sameCity =
      client.intake.city.toLowerCase() ===
      therapist.therapist.city.toLowerCase();

    if (sameCity) {
      return 100;
    }

    // Different city - lower score
    // In production, calculate actual distance
    return 60;
  }

  return 50;
}

/**
 * Experience Relevance Score
 */
function calculateExperienceScore(
  client: ClientComplete,
  therapist: TherapistComplete
): number {
  const years = therapist.therapist.yearsOfExperience;

  // Base score from years of experience
  let baseScore = Math.min(100, years * 8); // Max at ~12 years

  // Bonus for experience in client's specific concerns
  if (client.intake) {
    const clientConcerns = new Set(client.intake.primaryConcerns);
    const relevantSpecs = therapist.specializations.filter(
      (s) => clientConcerns.has(s.specialization) && s.yearsExperience > 3
    );

    if (relevantSpecs.length > 0) {
      baseScore = Math.min(100, baseScore + 20);
    }
  }

  // Check against client's preferred experience level
  if (client.preferences?.preferredExperienceLevel) {
    const preferred = client.preferences.preferredExperienceLevel;
    const actual = therapist.therapist.experienceLevel;

    if (preferred === actual) {
      baseScore = Math.min(100, baseScore + 10);
    }
  }

  return baseScore;
}

/**
 * Price Compatibility Score
 */
function calculatePriceScore(
  client: ClientComplete,
  therapist: TherapistComplete
): number {
  const therapistPrice = therapist.therapist.sessionPrice;

  // Check health fund coverage first
  if (client.intake) {
    const clientFund = client.intake.healthFund;
    const therapistFunds = therapist.healthFunds;

    const fundMatch = therapistFunds.find(
      (tf) => tf.healthFund === clientFund && tf.agreementType !== 'NONE'
    );

    if (fundMatch) {
      // Health fund covers - high score
      return fundMatch.agreementType === 'FULL' ? 100 : 85;
    }
  }

  // Check against max budget preference
  if (client.preferences?.maxPricePerSession) {
    const maxBudget = client.preferences.maxPricePerSession;

    if (therapistPrice <= maxBudget) {
      return 100;
    }

    // Calculate how much over budget
    const overBudgetPercent = ((therapistPrice - maxBudget) / maxBudget) * 100;

    if (overBudgetPercent <= 10) return 80;
    if (overBudgetPercent <= 25) return 60;
    if (overBudgetPercent <= 50) return 40;
    return 20;
  }

  // No budget specified - moderate score
  return 60;
}

/**
 * Preference Match Score
 * Based on optional preferences (gender, age, approach)
 */
function calculatePreferenceScore(
  client: ClientComplete,
  therapist: TherapistComplete
): number {
  if (!client.preferences) {
    return 50; // Neutral if no preferences
  }

  let totalWeight = 0;
  let weightedScore = 0;

  // Gender preference (weight: 30)
  if (client.preferences.preferredTherapistGender) {
    totalWeight += 30;
    if (
      client.preferences.preferredTherapistGender ===
      therapist.therapist.gender
    ) {
      weightedScore += 30;
    }
  }

  // Therapy approach preference (weight: 40)
  if (
    client.preferences.preferredApproaches &&
    client.preferences.preferredApproaches.length > 0
  ) {
    totalWeight += 40;
    const clientApproaches = client.preferences.preferredApproaches;
    const therapistApproaches = therapist.approaches.map((a) => a.approach);
    const matchCount = clientApproaches.filter((a) =>
      therapistApproaches.includes(a)
    ).length;

    if (matchCount > 0) {
      weightedScore += Math.min(
        40,
        (matchCount / client.preferences.preferredApproaches.length) * 40
      );
    }
  }

  // Experience level preference (weight: 30)
  if (client.preferences.preferredExperienceLevel) {
    totalWeight += 30;
    if (
      client.preferences.preferredExperienceLevel ===
      therapist.therapist.experienceLevel
    ) {
      weightedScore += 30;
    }
  }

  if (totalWeight === 0) {
    return 50;
  }

  return Math.round((weightedScore / totalWeight) * 100);
}

// =============================================================================
// LAYER C: X-FACTOR SCORE (Optional Statistical Layer)
// =============================================================================

/**
 * X-Factor Statistical Matching Score
 * Only calculated if client has completed X-Factor questionnaire
 *
 * Returns null if X-Factor data is not available
 */
function calculateXFactorScore(
  client: ClientComplete,
  therapist: TherapistComplete
): number | null {
  // X-Factor is optional - return null if not completed
  if (!client.xFactor || !client.profile.xFactorCompleted) {
    return null;
  }

  // In production, this would use ML models or statistical correlations
  // For now, we use a simplified heuristic model

  let score = 50; // Start at neutral

  const xf = client.xFactor;

  // Communication style matching
  // TODO: In production, therapists would also have communication style profiles
  if (xf.communicationStyle !== null) {
    // Placeholder: Assume therapists adapt to client styles
    score += 5;
  }

  // Structure preference matching
  if (xf.structurePreference !== null) {
    // Higher structure preference → bonus for experienced therapists
    if (xf.structurePreference >= 4 && therapist.therapist.yearsOfExperience > 5) {
      score += 10;
    }
  }

  // Previous therapy experience
  if (xf.previousTherapyExperience === true) {
    if (xf.previousTherapyHelpful === true) {
      score += 5; // They know what works
    } else if (xf.previousTherapyHelpful === false) {
      // Different approach might help
      score += 3;
    }
  }

  // Motivation and readiness
  if (xf.motivationLevel !== null && xf.motivationLevel >= 4) {
    score += 10; // High motivation correlates with better outcomes
  }

  if (xf.readinessForChange !== null && xf.readinessForChange >= 4) {
    score += 10;
  }

  // Homework willingness
  if (xf.homeworkWillingness !== null && xf.homeworkWillingness >= 4) {
    // CBT and structured approaches benefit from homework
    const hasCBT = therapist.approaches.some(
      (a) => a.approach === 'CBT' || a.approach === 'DBT' || a.approach === 'ACT'
    );
    if (hasCBT) {
      score += 10;
    }
  }

  // Normalize to 0-100
  return Math.max(0, Math.min(100, score));
}

// =============================================================================
// SCORE AGGREGATION
// =============================================================================

function calculateCoreScore(
  components: ComponentScores,
  weights: AlgorithmWeights
): number {
  return (
    weights.specializationWeight * components.specialization +
    weights.availabilityWeight * components.availability +
    weights.languageWeight * components.language +
    weights.locationWeight * components.location +
    weights.experienceWeight * components.experience +
    weights.priceWeight * components.price
  );
}

function getMatchQuality(
  score: number,
  weights: AlgorithmWeights
): MatchingScore['matchQuality'] {
  if (score >= weights.excellentThreshold) return 'EXCELLENT';
  if (score >= weights.greatThreshold) return 'GREAT';
  if (score >= weights.goodThreshold) return 'GOOD';
  if (score >= weights.moderateThreshold) return 'MODERATE';
  return 'LOW';
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createFailedScore(
  client: ClientComplete,
  therapist: TherapistComplete,
  weights: AlgorithmWeights,
  filterResults: HardFilterResults
): Omit<MatchingScore, 'id' | 'computedAt' | 'expiresAt'> {
  return {
    clientId: client.profile.id,
    therapistId: therapist.therapist.id,
    hardFiltersPassed: false,
    coreScore: 0,
    xFactorScore: null,
    specializationScore: 0,
    availabilityScore: 0,
    languageScore: 0,
    locationScore: 0,
    experienceScore: 0,
    priceScore: 0,
    preferenceScore: 0,
    finalScore: 0,
    matchQuality: 'LOW',
    rank: 0,
    algorithmVersion: weights.version,
    weightsUsed: {},
  };
}

function createZeroScores(): ComponentScores {
  return {
    specialization: 0,
    availability: 0,
    language: 0,
    location: 0,
    experience: 0,
    price: 0,
    preference: 0,
    xFactor: null,
  };
}

// =============================================================================
// BATCH SCORING
// =============================================================================

/**
 * Calculate scores for all eligible therapists
 * Returns sorted results with rankings
 */
export function calculateAllMatches(
  client: ClientComplete,
  therapists: TherapistComplete[],
  weights: AlgorithmWeights = DEFAULT_ALGORITHM_WEIGHTS
): ScoringResult[] {
  // Calculate scores for all therapists
  const results = therapists.map((therapist) =>
    calculateMatchScore(client, therapist, weights)
  );

  // Filter to only passed results
  const passedResults = results.filter((r) => r.passed);

  // Sort by final score descending
  passedResults.sort((a, b) => b.score.finalScore - a.score.finalScore);

  // Assign rankings
  passedResults.forEach((result, index) => {
    result.score.rank = index + 1;
  });

  return passedResults;
}
