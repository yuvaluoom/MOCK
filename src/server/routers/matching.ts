import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, patientProcedure, adminProcedure } from '../trpc';
import {
  mockMatches,
  mockXFactorProfile,
  mockPatient,
  mockTherapists,
  type MockTherapist,
  type MockXFactorProfile,
} from '../mock-data';

// In-memory matching configs (6-factor weights)
const mockConfigs = [
  {
    id: 'config-1',
    name: 'Default Configuration',
    description: 'Standard matching weights (6-factor)' as string | null,
    xFactorWeight: 0.30,
    healthFundWeight: 0.20,
    availabilityWeight: 0.15,
    preferenceWeight: 0.10,
    objectiveFitWeight: 0.10,
    subjectiveFitWeight: 0.15,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

/**
 * MATCHING ENGINE - Core algorithm for therapist-patient compatibility
 *
 * Dimensions:
 * 1. X-Factor Therapeutic Compatibility (40%) - Based on questionnaire dimensions
 * 2. Health Fund Match (25%) - Practical/financial compatibility
 * 3. Availability/Location Match (20%) - Online/in-person, city proximity
 * 4. Personal Preferences (15%) - Gender, language, approach preferences
 */

interface MatchScoreBreakdown {
  xFactorScore: number;
  healthFundScore: number;
  availabilityScore: number;
  preferenceScore: number;
  overallScore: number;
  explanation: string;
}

/**
 * Calculate X-Factor therapeutic compatibility based on psychological dimensions
 */
function calculateXFactorScore(
  profile: MockXFactorProfile,
  therapist: MockTherapist
): { score: number; explanation: string } {
  let score = 70; // Base score
  const factors: string[] = [];

  // Openness to new approaches vs therapist's approach variety
  const approachVariety = therapist.approaches.length;
  if (profile.openness > 70 && approachVariety >= 2) {
    score += 8;
    factors.push('Open to diverse therapeutic approaches');
  } else if (profile.openness < 40 && approachVariety === 1) {
    score += 5;
    factors.push('Prefers focused therapeutic style');
  }

  // Structure preference vs therapist specializations
  if (profile.structurePreference > 65) {
    if (therapist.approaches.includes('CBT') || therapist.approaches.includes('DBT')) {
      score += 10;
      factors.push('High compatibility with structured therapy approach');
    }
  } else if (profile.structurePreference < 40) {
    if (therapist.approaches.includes('PSYCHODYNAMIC') || therapist.approaches.includes('HUMANISTIC')) {
      score += 8;
      factors.push('Compatible with exploratory therapy style');
    }
  }

  // Emotional intensity vs therapist experience
  if (profile.emotionalIntensity > 70 && therapist.yearsOfExperience >= 10) {
    score += 7;
    factors.push('Experienced therapist suited for emotional processing');
  }

  // Stress level considerations
  if (profile.stressLevel && profile.stressLevel > 70) {
    if (therapist.specializations.includes('ANXIETY') || therapist.specializations.includes('STRESS_MANAGEMENT')) {
      score += 8;
      factors.push('Specialized in stress and anxiety management');
    }
  }

  // Military stress factor
  if (profile.militaryStress && profile.militaryStress > 50) {
    if (therapist.specializations.includes('MILITARY_VETERANS') || therapist.specializations.includes('TRAUMA_PTSD')) {
      score += 12;
      factors.push('Specialized in military-related stress');
    }
  }

  // Sleep quality correlation
  if (profile.sleepQuality && profile.sleepQuality < 50) {
    if (therapist.approaches.includes('CBT') || therapist.specializations.includes('ANXIETY')) {
      score += 5;
      factors.push('Approach addresses sleep-related issues');
    }
  }

  // Change readiness
  if (profile.changeReadiness > 75) {
    score += 5;
    factors.push('High motivation for therapeutic progress');
  }

  // Normalize to 0-100
  score = Math.min(100, Math.max(0, score));

  const explanation = factors.length > 0
    ? factors.slice(0, 2).join('. ') + '.'
    : 'Good general therapeutic compatibility.';

  return { score, explanation };
}

/**
 * Calculate health fund compatibility
 */
function calculateHealthFundScore(
  patientFund: string | null,
  therapistFunds: string[]
): { score: number; explanation: string } {
  if (!patientFund) {
    return { score: 80, explanation: 'No health fund specified' };
  }

  if (therapistFunds.includes(patientFund)) {
    return { score: 100, explanation: `Accepts ${patientFund} health fund` };
  }

  if (therapistFunds.includes('PRIVATE')) {
    return { score: 50, explanation: 'Private sessions available' };
  }

  return { score: 20, explanation: 'Health fund not accepted' };
}

/**
 * Calculate availability and location compatibility
 */
function calculateAvailabilityScore(
  patientCity: string | null,
  preferredOnline: boolean,
  therapist: MockTherapist
): { score: number; explanation: string } {
  let score = 60; // Base score
  const factors: string[] = [];

  // Online preference
  if (preferredOnline && therapist.offersOnline) {
    score += 25;
    factors.push('Online sessions available');
  }

  // In-person and same city
  if (!preferredOnline && therapist.offersInPerson) {
    if (patientCity && therapist.city === patientCity) {
      score += 30;
      factors.push('Same city for in-person sessions');
    } else if (therapist.offersOnline) {
      score += 10;
      factors.push('Online option available');
    }
  }

  // Both options available
  if (therapist.offersOnline && therapist.offersInPerson) {
    score += 10;
    factors.push('Flexible session formats');
  }

  // Currently accepting patients
  if (therapist.isAcceptingPatients) {
    score += 5;
    factors.push('Currently accepting new patients');
  }

  score = Math.min(100, score);

  const explanation = factors.length > 0
    ? factors.slice(0, 2).join('. ') + '.'
    : 'Limited availability match.';

  return { score, explanation };
}

/**
 * Calculate personal preferences compatibility
 */
function calculatePreferenceScore(
  patient: typeof mockPatient,
  therapist: MockTherapist
): { score: number; explanation: string } {
  let score = 70; // Base score
  const factors: string[] = [];

  // Gender preference
  if (patient.preferredGender) {
    if (therapist.gender === patient.preferredGender) {
      score += 15;
      factors.push('Gender preference matched');
    } else {
      score -= 10;
    }
  }

  // Language match
  const commonLanguages = patient.preferredLanguages?.filter(
    (lang) => therapist.languages.includes(lang)
  ) ?? [];
  if (commonLanguages.length > 0) {
    score += 10;
    factors.push(`Speaks ${commonLanguages[0] === 'he' ? 'Hebrew' : commonLanguages[0]}`);
  }

  // Approach preference (if patient has completed questionnaire)
  if (patient.preferredApproaches && patient.preferredApproaches.length > 0) {
    const matchedApproaches = patient.preferredApproaches.filter(
      (approach) => therapist.approaches.includes(approach)
    );
    if (matchedApproaches.length > 0) {
      score += 5 * matchedApproaches.length;
      factors.push('Preferred therapeutic approach available');
    }
  }

  score = Math.min(100, Math.max(0, score));

  const explanation = factors.length > 0
    ? factors.slice(0, 2).join('. ') + '.'
    : 'Standard preference compatibility.';

  return { score, explanation };
}

/**
 * Main matching function - compute overall score for a therapist
 */
function computeMatchScore(
  patient: typeof mockPatient,
  xFactorProfile: MockXFactorProfile | null,
  therapist: MockTherapist,
  config: typeof mockConfigs[0]
): MatchScoreBreakdown {
  // Calculate individual scores
  const xFactor = xFactorProfile
    ? calculateXFactorScore(xFactorProfile, therapist)
    : { score: 75, explanation: 'Complete questionnaire for personalized matching' };

  const healthFund = calculateHealthFundScore(
    patient.healthFund,
    therapist.acceptedHealthFunds
  );

  const availability = calculateAvailabilityScore(
    patient.city,
    patient.preferredOnline,
    therapist
  );

  const preference = calculatePreferenceScore(patient, therapist);

  // Compute weighted overall score
  const overallScore = Math.round(
    xFactor.score * config.xFactorWeight +
    healthFund.score * config.healthFundWeight +
    availability.score * config.availabilityWeight +
    preference.score * config.preferenceWeight
  );

  // Build explanation
  const topFactors = [xFactor.explanation, healthFund.explanation]
    .filter((e) => e && !e.includes('questionnaire'))
    .slice(0, 2);
  const explanation = topFactors.join(' ');

  return {
    xFactorScore: Math.round(xFactor.score),
    healthFundScore: Math.round(healthFund.score),
    availabilityScore: Math.round(availability.score),
    preferenceScore: Math.round(preference.score),
    overallScore,
    explanation: explanation || 'Good overall compatibility.',
  };
}

export const matchingRouter = router({
  /**
   * Compute/refresh matches for patient
   * This runs the matching algorithm against all approved therapists
   */
  computeMatches: patientProcedure.mutation(async () => {
    const config = mockConfigs.find((c) => c.isActive) ?? mockConfigs[0];

    // Get approved therapists accepting patients
    const eligibleTherapists = mockTherapists.filter(
      (t) => t.approvalStatus === 'APPROVED' && t.isAcceptingPatients
    );

    // Compute scores for each therapist
    const computedMatches = eligibleTherapists.map((therapist) => {
      const scores = computeMatchScore(
        mockPatient,
        mockXFactorProfile,
        therapist,
        config
      );

      return {
        id: `match-${therapist.id}-${Date.now()}`,
        patientId: mockPatient.id,
        therapistId: therapist.id,
        overallScore: scores.overallScore,
        xFactorScore: scores.xFactorScore,
        healthFundScore: scores.healthFundScore,
        availabilityScore: scores.availabilityScore,
        locationScore: scores.availabilityScore, // Use availability as location proxy
        preferenceScore: scores.preferenceScore,
        objectiveFitScore: 0, // Will be computed in Phase 3
        subjectiveFitScore: 0, // Will be computed in Phase 3
        scoreBreakdown: {
          xFactor: { score: scores.xFactorScore, weight: config.xFactorWeight },
          healthFund: { score: scores.healthFundScore, weight: config.healthFundWeight },
          availability: { score: scores.availabilityScore, weight: config.availabilityWeight },
          preference: { score: scores.preferenceScore, weight: config.preferenceWeight },
          objectiveFit: { score: 0, weight: 0.10 },
          subjectiveFit: { score: 0, weight: 0.15 },
        },
        explanationHe: scores.explanation,
        explanationEn: scores.explanation,
        explanationItems: [], // Will be populated in Phase 3
        isViewed: false,
        isFavorited: false,
        isHidden: false,
        createdAt: new Date(),
      };
    });

    // Sort by overall score descending
    computedMatches.sort((a, b) => b.overallScore - a.overallScore);

    // Update mock matches (in production this would be a database upsert)
    mockMatches.length = 0;
    mockMatches.push(...computedMatches);

    return {
      matchCount: computedMatches.length,
      topScore: computedMatches[0]?.overallScore ?? 0,
    };
  }),

  /**
   * Get match explanation for a specific therapist
   */
  getMatchExplanation: patientProcedure
    .input(z.object({ therapistId: z.string() }))
    .query(async ({ input }) => {
      const therapist = mockTherapists.find((t) => t.id === input.therapistId);
      if (!therapist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Therapist not found',
        });
      }

      const config = mockConfigs.find((c) => c.isActive) ?? mockConfigs[0];
      const scores = computeMatchScore(
        mockPatient,
        mockXFactorProfile,
        therapist,
        config
      );

      return {
        therapistId: input.therapistId,
        ...scores,
        dimensions: {
          therapeuticCompatibility: {
            score: scores.xFactorScore,
            weight: config.xFactorWeight,
            label: 'Therapeutic Compatibility',
            description: 'Based on your questionnaire responses and therapist expertise',
          },
          healthFundMatch: {
            score: scores.healthFundScore,
            weight: config.healthFundWeight,
            label: 'Health Fund Match',
            description: 'Coverage and financial compatibility',
          },
          availabilityMatch: {
            score: scores.availabilityScore,
            weight: config.availabilityWeight,
            label: 'Availability',
            description: 'Session format and location compatibility',
          },
          preferenceMatch: {
            score: scores.preferenceScore,
            weight: config.preferenceWeight,
            label: 'Personal Preferences',
            description: 'Language, gender, and approach preferences',
          },
        },
      };
    }),

  /**
   * Get matching configuration (admin)
   */
  getConfig: adminProcedure.query(async () => {
    return mockConfigs;
  }),

  /**
   * Update matching configuration (admin)
   */
  updateConfig: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        xFactorWeight: z.number().min(0).max(1),
        healthFundWeight: z.number().min(0).max(1),
        availabilityWeight: z.number().min(0).max(1),
        preferenceWeight: z.number().min(0).max(1),
        objectiveFitWeight: z.number().min(0).max(1).default(0.10),
        subjectiveFitWeight: z.number().min(0).max(1).default(0.15),
        isActive: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      // Validate weights sum to 1
      const totalWeight =
        input.xFactorWeight +
        input.healthFundWeight +
        input.availabilityWeight +
        input.preferenceWeight +
        input.objectiveFitWeight +
        input.subjectiveFitWeight;

      if (Math.abs(totalWeight - 1) > 0.01) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Weights must sum to 1.0',
        });
      }

      // If this config is active, deactivate others
      if (input.isActive) {
        for (const c of mockConfigs) {
          c.isActive = false;
        }
      }

      const newConfig = {
        id: `config-${Date.now()}`,
        name: input.name,
        description: input.description ?? null,
        xFactorWeight: input.xFactorWeight,
        healthFundWeight: input.healthFundWeight,
        availabilityWeight: input.availabilityWeight,
        preferenceWeight: input.preferenceWeight,
        objectiveFitWeight: input.objectiveFitWeight,
        subjectiveFitWeight: input.subjectiveFitWeight,
        isActive: input.isActive,
        createdAt: new Date(),
      };

      mockConfigs.push(newConfig);
      return newConfig;
    }),
});
