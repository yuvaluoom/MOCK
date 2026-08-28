/**
 * MatchMind Matching Service
 *
 * Main orchestration service that coordinates:
 * - Data retrieval
 * - Score calculation
 * - Explanation generation
 * - Result caching and persistence
 *
 * This is the primary interface for the matching system.
 */

import type {
  ClientComplete,
  TherapistComplete,
  MatchResult,
  MatchingScore,
  MatchingExplanation,
  ClientIntakeRequired,
  ClientPreferences,
  ClientXFactorOptional,
  AlgorithmWeights,
} from './schema';
import { calculateMatchScore, calculateAllMatches, type ScoringResult } from './scoring-engine';
import { generateMatchExplanation } from './explanation-engine';
import { DEFAULT_ALGORITHM_WEIGHTS, getActiveWeights } from './config';

// =============================================================================
// MATCHING SERVICE CLASS
// =============================================================================

export class MatchingService {
  private weights: AlgorithmWeights;

  constructor(weights?: AlgorithmWeights) {
    this.weights = weights || getActiveWeights();
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Get all matches for a client
   * Main entry point for matching
   */
  async getMatches(
    client: ClientComplete,
    therapists: TherapistComplete[],
    options: {
      limit?: number;
      offset?: number;
      minScore?: number;
      sessionType?: 'all' | 'online' | 'inPerson';
      healthFundOnly?: boolean;
    } = {}
  ): Promise<{
    matches: MatchResult[];
    totalCount: number;
    filteredCount: number;
    hasXFactor: boolean;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();

    // Validate client has completed intake
    if (!this.canShowMatches(client)) {
      throw new Error('INTAKE_NOT_COMPLETED');
    }

    // Apply pre-filters
    let filteredTherapists = therapists;

    if (options.sessionType === 'online') {
      filteredTherapists = filteredTherapists.filter(
        (t) => t.therapist.offersOnline
      );
    } else if (options.sessionType === 'inPerson') {
      filteredTherapists = filteredTherapists.filter(
        (t) => t.therapist.offersInPerson
      );
    }

    if (options.healthFundOnly && client.intake) {
      const clientFund = client.intake.healthFund;
      filteredTherapists = filteredTherapists.filter((t) =>
        t.healthFunds.some(
          (hf) => hf.healthFund === clientFund && hf.agreementType !== 'NONE'
        )
      );
    }

    // Calculate scores for all therapists
    const scoringResults = calculateAllMatches(
      client,
      filteredTherapists,
      this.weights
    );

    // Apply minimum score filter
    const minScore = options.minScore ?? this.weights.minimumScoreThreshold;
    const filteredResults = scoringResults.filter(
      (r) => r.score.finalScore >= minScore
    );

    // Apply pagination
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 20;
    const paginatedResults = filteredResults.slice(offset, offset + limit);

    // Generate explanations and create match results
    const matches: MatchResult[] = paginatedResults.map((result) => {
      const therapist = filteredTherapists.find(
        (t) => t.therapist.id === result.score.therapistId
      )!;
      const explanation = generateMatchExplanation(client, therapist, result);

      return {
        score: {
          ...result.score,
          id: `match-${result.score.clientId}-${result.score.therapistId}`,
          computedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        explanation: {
          ...explanation,
          id: `exp-${result.score.clientId}-${result.score.therapistId}`,
          matchingScoreId: `match-${result.score.clientId}-${result.score.therapistId}`,
          createdAt: new Date(),
        },
        therapist,
      };
    });

    const processingTimeMs = Date.now() - startTime;

    return {
      matches,
      totalCount: therapists.length,
      filteredCount: filteredResults.length,
      hasXFactor: client.profile.xFactorCompleted,
      processingTimeMs,
    };
  }

  /**
   * Get single match details
   */
  async getMatchDetails(
    client: ClientComplete,
    therapist: TherapistComplete
  ): Promise<MatchResult | null> {
    if (!this.canShowMatches(client)) {
      return null;
    }

    const result = calculateMatchScore(client, therapist, this.weights);

    if (!result.passed) {
      return null;
    }

    const explanation = generateMatchExplanation(client, therapist, result);

    return {
      score: {
        ...result.score,
        id: `match-${result.score.clientId}-${result.score.therapistId}`,
        computedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      explanation: {
        ...explanation,
        id: `exp-${result.score.clientId}-${result.score.therapistId}`,
        matchingScoreId: `match-${result.score.clientId}-${result.score.therapistId}`,
        createdAt: new Date(),
      },
      therapist,
    };
  }

  /**
   * Calculate compatibility between client and therapist
   * Used for "why this match" explanations
   */
  async getCompatibilityBreakdown(
    client: ClientComplete,
    therapist: TherapistComplete
  ): Promise<{
    overallScore: number;
    quality: string;
    coreScore: number;
    preferenceScore: number;
    xFactorScore: number | null;
    components: {
      key: string;
      label: string;
      score: number;
      weight: number;
    }[];
  }> {
    const result = calculateMatchScore(client, therapist, this.weights);

    return {
      overallScore: result.score.finalScore,
      quality: result.score.matchQuality,
      coreScore: result.score.coreScore,
      preferenceScore: result.score.preferenceScore,
      xFactorScore: result.score.xFactorScore,
      components: [
        {
          key: 'specialization',
          label: 'התמחות / Specialization',
          score: result.componentScores.specialization,
          weight: this.weights.specializationWeight,
        },
        {
          key: 'availability',
          label: 'זמינות / Availability',
          score: result.componentScores.availability,
          weight: this.weights.availabilityWeight,
        },
        {
          key: 'language',
          label: 'שפה / Language',
          score: result.componentScores.language,
          weight: this.weights.languageWeight,
        },
        {
          key: 'location',
          label: 'מיקום / Location',
          score: result.componentScores.location,
          weight: this.weights.locationWeight,
        },
        {
          key: 'experience',
          label: 'ניסיון / Experience',
          score: result.componentScores.experience,
          weight: this.weights.experienceWeight,
        },
        {
          key: 'price',
          label: 'מחיר / Price',
          score: result.componentScores.price,
          weight: this.weights.priceWeight,
        },
      ],
    };
  }

  // ===========================================================================
  // VALIDATION METHODS
  // ===========================================================================

  /**
   * Check if client can view matches
   * Requires completed intake
   */
  canShowMatches(client: ClientComplete): boolean {
    return client.intake !== null && client.profile.intakeCompleted;
  }

  /**
   * Check if X-Factor data is available
   */
  hasXFactor(client: ClientComplete): boolean {
    return client.xFactor !== null && client.profile.xFactorCompleted;
  }

  /**
   * Get client's completion status
   */
  getCompletionStatus(client: ClientComplete): {
    intakeCompleted: boolean;
    preferencesCompleted: boolean;
    xFactorCompleted: boolean;
    canViewMatches: boolean;
    recommendXFactor: boolean;
  } {
    const intakeCompleted = client.profile.intakeCompleted;
    const preferencesCompleted = client.profile.preferencesCompleted;
    const xFactorCompleted = client.profile.xFactorCompleted;

    return {
      intakeCompleted,
      preferencesCompleted,
      xFactorCompleted,
      canViewMatches: intakeCompleted,
      recommendXFactor: intakeCompleted && !xFactorCompleted,
    };
  }

  // ===========================================================================
  // STATISTICS & ANALYTICS
  // ===========================================================================

  /**
   * Get match statistics for a client
   */
  async getMatchStats(
    client: ClientComplete,
    therapists: TherapistComplete[]
  ): Promise<{
    totalEligible: number;
    excellentMatches: number;
    greatMatches: number;
    goodMatches: number;
    averageScore: number;
    topSpecializations: string[];
    healthFundMatches: number;
    onlineAvailable: number;
    inPersonAvailable: number;
  }> {
    if (!this.canShowMatches(client)) {
      return {
        totalEligible: 0,
        excellentMatches: 0,
        greatMatches: 0,
        goodMatches: 0,
        averageScore: 0,
        topSpecializations: [],
        healthFundMatches: 0,
        onlineAvailable: 0,
        inPersonAvailable: 0,
      };
    }

    const results = calculateAllMatches(client, therapists, this.weights);

    const excellentMatches = results.filter(
      (r) => r.score.matchQuality === 'EXCELLENT'
    ).length;
    const greatMatches = results.filter(
      (r) => r.score.matchQuality === 'GREAT'
    ).length;
    const goodMatches = results.filter(
      (r) => r.score.matchQuality === 'GOOD'
    ).length;

    const totalScore = results.reduce((sum, r) => sum + r.score.finalScore, 0);
    const averageScore = results.length > 0 ? totalScore / results.length : 0;

    // Count specialization matches
    const specCounts: Record<string, number> = {};
    if (client.intake) {
      for (const concern of client.intake.primaryConcerns) {
        specCounts[concern] = therapists.filter((t) =>
          t.specializations.some((s) => s.specialization === concern)
        ).length;
      }
    }
    const topSpecializations = Object.entries(specCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([spec]) => spec);

    // Count by features
    const healthFundMatches = client.intake
      ? therapists.filter((t) =>
          t.healthFunds.some(
            (hf) =>
              hf.healthFund === client.intake!.healthFund &&
              hf.agreementType !== 'NONE'
          )
        ).length
      : 0;

    const onlineAvailable = therapists.filter(
      (t) => t.therapist.offersOnline
    ).length;
    const inPersonAvailable = therapists.filter(
      (t) => t.therapist.offersInPerson
    ).length;

    return {
      totalEligible: results.length,
      excellentMatches,
      greatMatches,
      goodMatches,
      averageScore: Math.round(averageScore),
      topSpecializations,
      healthFundMatches,
      onlineAvailable,
      inPersonAvailable,
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let matchingServiceInstance: MatchingService | null = null;

export function getMatchingService(): MatchingService {
  if (!matchingServiceInstance) {
    matchingServiceInstance = new MatchingService();
  }
  return matchingServiceInstance;
}

// =============================================================================
// DATA CONVERTERS (Bridge to existing mock data)
// =============================================================================

/**
 * Convert existing mock therapist data to TherapistComplete format
 */
export function convertToTherapistComplete(mockTherapist: any): TherapistComplete {
  return {
    therapist: {
      id: mockTherapist.id,
      userId: mockTherapist.userId,
      firstName: mockTherapist.firstName,
      lastName: mockTherapist.lastName,
      title: mockTherapist.title || '',
      email: mockTherapist.email,
      phone: mockTherapist.phone || '',
      gender: mockTherapist.gender || 'PREFER_NOT_TO_SAY',
      dateOfBirth: null,
      photoUrl: mockTherapist.photoUrl || null,
      bio: mockTherapist.bio || null,
      bioHebrew: mockTherapist.bioHebrew || null,
      city: mockTherapist.city || 'Tel Aviv',
      address: mockTherapist.address || null,
      latitude: null,
      longitude: null,
      offersOnline: mockTherapist.offersOnline ?? true,
      offersInPerson: mockTherapist.offersInPerson ?? true,
      sessionPrice: mockTherapist.sessionPrice || 400,
      sessionDuration: mockTherapist.sessionDuration || 50,
      yearsOfExperience: mockTherapist.yearsOfExperience || 5,
      experienceLevel: getExperienceLevel(mockTherapist.yearsOfExperience || 5),
      approvalStatus: mockTherapist.approvalStatus || 'APPROVED',
      isAcceptingPatients: mockTherapist.isAcceptingPatients ?? true,
      createdAt: mockTherapist.createdAt || new Date(),
      updatedAt: mockTherapist.updatedAt || new Date(),
      approvedAt: mockTherapist.approvedAt || null,
    },
    credentials: [
      {
        id: `cred-${mockTherapist.id}`,
        therapistId: mockTherapist.id,
        licenseType: mockTherapist.licenseType || 'Clinical Psychologist',
        licenseNumber: mockTherapist.licenseNumber || 'N/A',
        issuingAuthority: 'Ministry of Health',
        issuedAt: new Date('2020-01-01'),
        expiresAt: null,
        verificationStatus: 'VERIFIED',
        documentUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    specializations: (mockTherapist.specializations || []).map(
      (spec: string, index: number) => ({
        id: `spec-${mockTherapist.id}-${index}`,
        therapistId: mockTherapist.id,
        specialization: spec,
        isPrimary: index < 2,
        yearsExperience: Math.max(1, (mockTherapist.yearsOfExperience || 5) - index),
        createdAt: new Date(),
      })
    ),
    approaches: (mockTherapist.approaches || mockTherapist.therapyMethods || []).map(
      (approach: string, index: number) => ({
        id: `approach-${mockTherapist.id}-${index}`,
        therapistId: mockTherapist.id,
        approach: approach,
        proficiencyLevel: index === 0 ? 'EXPERT' : 'PROFICIENT',
        createdAt: new Date(),
      })
    ),
    healthFunds: (mockTherapist.acceptedHealthFunds || []).map(
      (fund: string, index: number) => ({
        id: `fund-${mockTherapist.id}-${index}`,
        therapistId: mockTherapist.id,
        healthFund: fund,
        agreementType: fund === 'PRIVATE' ? 'NONE' : 'FULL',
        maxSessionsCovered: null,
        createdAt: new Date(),
      })
    ),
    languages: (mockTherapist.languages || ['HEBREW', 'ENGLISH']).map(
      (lang: string, index: number) => ({
        id: `lang-${mockTherapist.id}-${index}`,
        therapistId: mockTherapist.id,
        language: lang,
        proficiencyLevel: index === 0 ? 'NATIVE' : 'FLUENT',
        createdAt: new Date(),
      })
    ),
    availability: [], // Will be populated separately if needed
  };
}

/**
 * Convert existing mock patient data to ClientComplete format
 */
export function convertToClientComplete(
  mockPatient: any,
  mockXFactor?: any
): ClientComplete {
  const hasXFactor = mockXFactor && Object.keys(mockXFactor).length > 0;

  return {
    profile: {
      id: mockPatient.id,
      userId: mockPatient.userId,
      firstName: mockPatient.firstName,
      lastName: mockPatient.lastName,
      email: mockPatient.email,
      phone: mockPatient.phone || null,
      gender: mockPatient.gender || null,
      dateOfBirth: mockPatient.dateOfBirth || null,
      city: mockPatient.city || null,
      intakeCompleted: mockPatient.questionnaireCompleted ?? false,
      preferencesCompleted: true,
      xFactorCompleted: hasXFactor,
      createdAt: mockPatient.createdAt || new Date(),
      updatedAt: mockPatient.updatedAt || new Date(),
      intakeCompletedAt: mockPatient.questionnaireCompletedAt || null,
      xFactorCompletedAt: hasXFactor ? new Date() : null,
    },
    intake: mockPatient.questionnaireCompleted
      ? {
          id: `intake-${mockPatient.id}`,
          clientId: mockPatient.id,
          preferredSessionFormat: mockPatient.preferredOnline
            ? 'ONLINE'
            : mockPatient.preferredInPerson
            ? 'IN_PERSON'
            : 'HYBRID',
          healthFund: mockPatient.healthFund || 'PRIVATE',
          healthFundMemberId: mockPatient.healthFundMemberId || null,
          city: mockPatient.city || 'Tel Aviv',
          maxDistanceKm: mockPatient.maxDistanceKm || null,
          primaryConcerns: mockPatient.primaryConcerns ||
            mockPatient.seekingHelpFor || ['ANXIETY', 'STRESS_MANAGEMENT'],
          preferredLanguages: mockPatient.preferredLanguages || ['HEBREW'],
          preferredDays: mockPatient.preferredDays || [0, 1, 2, 3, 4],
          preferredTimeSlots: mockPatient.preferredTimeSlots || [
            'MORNING',
            'AFTERNOON',
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
    preferences: {
      id: `pref-${mockPatient.id}`,
      clientId: mockPatient.id,
      preferredTherapistGender: mockPatient.preferredTherapistGender || null,
      preferredAgeGroup: null,
      preferredExperienceLevel: null,
      preferredApproaches: mockPatient.preferredApproaches || [],
      preferredSessionDuration: mockPatient.preferredSessionDuration || null,
      maxPricePerSession: mockPatient.maxPricePerSession || null,
      importantFactors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    xFactor: hasXFactor
      ? {
          id: `xfactor-${mockPatient.id}`,
          clientId: mockPatient.id,
          communicationStyle: mockXFactor.communicationStyle || null,
          emotionalExpression: mockXFactor.emotionalExpression || null,
          structurePreference: mockXFactor.structurePreference || null,
          feedbackStyle: mockXFactor.feedbackStyle || null,
          pacePreference: mockXFactor.pacePreference || null,
          previousTherapyExperience:
            mockXFactor.previousTherapyExperience || null,
          previousTherapyHelpful: mockXFactor.previousTherapyHelpful || null,
          comfortWithSilence: mockXFactor.comfortWithSilence || null,
          homeworkWillingness: mockXFactor.homeworkWillingness || null,
          sleepQuality: mockXFactor.sleepQuality || null,
          exerciseFrequency: mockXFactor.exerciseFrequency || null,
          socialSupport: mockXFactor.socialSupport || null,
          stressLevel: mockXFactor.stressLevel || null,
          primaryGoals: mockXFactor.primaryGoals || [],
          motivationLevel: mockXFactor.motivationLevel || null,
          readinessForChange: mockXFactor.readinessForChange || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          consentGiven: true,
          consentTimestamp: new Date(),
        }
      : null,
  };
}

function getExperienceLevel(years: number): 'ENTRY' | 'INTERMEDIATE' | 'EXPERIENCED' | 'SENIOR' | 'EXPERT' {
  if (years < 2) return 'ENTRY';
  if (years < 5) return 'INTERMEDIATE';
  if (years < 10) return 'EXPERIENCED';
  if (years < 15) return 'SENIOR';
  return 'EXPERT';
}
