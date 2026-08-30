/**
 * MatchMind Matching Algorithm
 *
 * A scientific, multi-dimensional matching engine that calculates
 * therapist-patient compatibility based on:
 *
 * 1. X-Factor Therapeutic Compatibility (30%) - Psychological profile matching
 * 2. Health Fund / Insurance Match (20%) - Financial/practical compatibility
 * 3. Availability & Location Match (15%) - Geography, session format
 * 4. Personal Preferences (10%) - Language, approach preferences
 * 5. Objective Fit (10%) - Demographic and background alignment
 * 6. Subjective Fit (15%) - Communication and therapy style compatibility
 *
 * Enhanced with Anthropic AI analysis for deeper clinical insights.
 */

import type {
  MockTherapist,
  MockXFactorProfile,
  MockPatient,
  MatchExplanationItem,
  CommunicationStylePreference,
  EmotionalNeed,
  TherapyStylePreference,
} from '@/server/mock-data';

// ============ TYPES ============

export interface MatchFactor {
  key: string;
  label: string;
  description: string;
  score: number;
  weight: number;
  weightedScore: number;
  reasons: string[];
  icon: 'brain' | 'heart' | 'shield' | 'map' | 'user' | 'video' | 'building';
}

export interface DetailedMatchResult {
  therapistId: string;
  overallScore: number;
  objectiveFitScore: number;
  subjectiveFitScore: number;
  matchQuality: 'excellent' | 'great' | 'good' | 'moderate' | 'low';
  factors: MatchFactor[];
  explanationItems: MatchExplanationItem[];
  topReasons: string[];
  warnings: string[];
  insights: string[];
}

export interface MatchConfig {
  xFactorWeight: number;
  healthFundWeight: number;
  availabilityWeight: number;
  preferenceWeight: number;
  objectiveFitWeight: number;
  subjectiveFitWeight: number;
}

// Default configuration (6-factor)
export const DEFAULT_CONFIG: MatchConfig = {
  xFactorWeight: 0.30,
  healthFundWeight: 0.20,
  availabilityWeight: 0.15,
  preferenceWeight: 0.10,
  objectiveFitWeight: 0.10,
  subjectiveFitWeight: 0.15,
};

// ============ HELPER MAPPINGS ============

const APPROACH_LABELS: Record<string, string> = {
  CBT: 'Cognitive Behavioral Therapy',
  DBT: 'Dialectical Behavior Therapy',
  PSYCHODYNAMIC: 'Psychodynamic Therapy',
  HUMANISTIC: 'Humanistic Therapy',
  EMDR: 'EMDR (Trauma Processing)',
  INTEGRATIVE: 'Integrative Approach',
  MINDFULNESS: 'Mindfulness-Based Therapy',
  ACT: 'Acceptance & Commitment Therapy',
  ART_THERAPY: 'Art Therapy',
  PLAY_THERAPY: 'Play Therapy',
  SYSTEMIC: 'Systemic/Family Therapy',
  EFT: 'Emotionally Focused Therapy',
};

const SPECIALIZATION_LABELS: Record<string, string> = {
  ANXIETY: 'Anxiety',
  DEPRESSION: 'Depression',
  TRAUMA_PTSD: 'Trauma & PTSD',
  MILITARY_VETERANS: 'Military & Veterans',
  RELATIONSHIPS: 'Relationships',
  COUPLES: 'Couples Therapy',
  FAMILY: 'Family Therapy',
  CHILDREN: 'Child Psychology',
  ADOLESCENTS: 'Adolescent Therapy',
  STRESS: 'Stress Management',
  STRESS_MANAGEMENT: 'Stress Management',
  SLEEP_DISORDERS: 'Sleep Issues',
  ADHD: 'ADHD',
  LIFE_TRANSITIONS: 'Life Transitions',
};

const HEALTH_FUND_LABELS: Record<string, string> = {
  MACCABI: 'Maccabi',
  CLALIT: 'Clalit',
  MEUHEDET: 'Meuhedet',
  LEUMIT: 'Leumit',
  PRIVATE: 'Private (Self-Pay)',
};

// ============ X-FACTOR MATCHING ============

function calculateXFactorMatch(
  profile: MockXFactorProfile | null,
  therapist: MockTherapist
): MatchFactor {
  const reasons: string[] = [];
  let score = 65; // Base score

  if (!profile) {
    return {
      key: 'xFactor',
      label: 'Therapeutic Compatibility',
      description: 'Complete the questionnaire to get personalized matching',
      score: 70,
      weight: DEFAULT_CONFIG.xFactorWeight,
      weightedScore: 70 * DEFAULT_CONFIG.xFactorWeight,
      reasons: ['Complete your X-Factor profile for personalized matching'],
      icon: 'brain',
    };
  }

  // Openness vs approach variety
  const approachCount = therapist.approaches.length;
  if (profile.openness >= 70) {
    if (approachCount >= 2) {
      score += 10;
      reasons.push('Your openness matches well with their diverse therapeutic toolkit');
    }
  } else if (profile.openness < 40) {
    if (approachCount === 1) {
      score += 8;
      reasons.push('Specializes in a focused therapeutic approach you may prefer');
    }
  }

  // Structure preference matching
  if (profile.structurePreference >= 65) {
    if (therapist.approaches.includes('CBT') || therapist.approaches.includes('DBT')) {
      score += 12;
      reasons.push('Uses structured, evidence-based methods that match your preference');
    }
  } else if (profile.structurePreference < 40) {
    if (therapist.approaches.includes('PSYCHODYNAMIC') || therapist.approaches.includes('HUMANISTIC')) {
      score += 10;
      reasons.push('Offers exploratory therapy style aligned with your preferences');
    }
  }

  // Emotional intensity & experience
  if (profile.emotionalIntensity >= 70) {
    if (therapist.yearsOfExperience >= 10) {
      score += 8;
      reasons.push('Highly experienced in supporting deep emotional processing');
    }
    if (therapist.yearsOfExperience >= 15) {
      score += 4;
    }
  }

  // Stress level considerations
  if (profile.stressLevel && profile.stressLevel >= 70) {
    if (therapist.specializations.includes('ANXIETY') ||
        therapist.specializations.includes('STRESS') ||
        therapist.specializations.includes('STRESS_MANAGEMENT')) {
      score += 10;
      reasons.push('Specializes in stress and anxiety - matching your current needs');
    }
  }

  // Sleep quality issues
  if (profile.sleepQuality && profile.sleepQuality < 50) {
    if (therapist.specializations.includes('SLEEP_DISORDERS') ||
        therapist.approaches.includes('CBT')) {
      score += 6;
      reasons.push('Experienced with sleep-related therapeutic support');
    }
  }

  // Military stress (if applicable)
  if (profile.militaryStress && profile.militaryStress >= 50) {
    if (therapist.specializations.includes('MILITARY_VETERANS')) {
      score += 15;
      reasons.push('Specialized experience with military-related stress');
    }
    if (therapist.specializations.includes('TRAUMA_PTSD')) {
      score += 10;
      reasons.push('Trained in trauma and PTSD treatment');
    }
  }

  // Change readiness bonus
  if (profile.changeReadiness >= 75) {
    score += 5;
    reasons.push('Your high motivation enhances therapeutic potential');
  }

  // Communication style matching
  if (profile.communicationStyle !== undefined) {
    if (profile.communicationStyle >= 60 && therapist.approaches.includes('HUMANISTIC')) {
      score += 5;
      reasons.push('Therapeutic style supports your expressive communication');
    }
    if (profile.communicationStyle <= 40 && therapist.approaches.includes('CBT')) {
      score += 5;
      reasons.push('Structured approach complements your reflective style');
    }
  }

  // Normalize score
  score = Math.min(100, Math.max(0, score));

  if (reasons.length === 0) {
    reasons.push('Good general therapeutic compatibility');
  }

  return {
    key: 'xFactor',
    label: 'Therapeutic Compatibility',
    description: 'Based on your psychological profile and therapeutic preferences',
    score,
    weight: DEFAULT_CONFIG.xFactorWeight,
    weightedScore: Math.round(score * DEFAULT_CONFIG.xFactorWeight),
    reasons: reasons.slice(0, 3),
    icon: 'brain',
  };
}

// ============ HEALTH FUND MATCHING ============

function calculateHealthFundMatch(
  patientFund: string | null,
  therapistFunds: string[]
): MatchFactor {
  const reasons: string[] = [];
  let score = 50;

  if (!patientFund) {
    return {
      key: 'healthFund',
      label: 'Insurance Coverage',
      description: 'No health fund specified in your profile',
      score: 75,
      weight: DEFAULT_CONFIG.healthFundWeight,
      weightedScore: Math.round(75 * DEFAULT_CONFIG.healthFundWeight),
      reasons: ['Add your health fund to see coverage matches'],
      icon: 'shield',
    };
  }

  const fundLabel = HEALTH_FUND_LABELS[patientFund] || patientFund;

  if (therapistFunds.includes(patientFund)) {
    score = 100;
    reasons.push(`Accepts ${fundLabel} - full coverage available`);

    // Bonus if they accept multiple funds (flexibility)
    if (therapistFunds.length >= 3) {
      reasons.push('Works with multiple health funds');
    }
  } else if (therapistFunds.includes('PRIVATE')) {
    score = 60;
    reasons.push('Private sessions available (self-pay)');
    reasons.push(`Does not accept ${fundLabel} directly`);
  } else {
    score = 20;
    reasons.push(`Does not accept ${fundLabel}`);
    reasons.push('May require out-of-pocket payment');
  }

  // Add info about private option
  if (therapistFunds.includes('PRIVATE') && !therapistFunds.includes(patientFund)) {
    reasons.push('Offers flexible private payment option');
  }

  return {
    key: 'healthFund',
    label: 'Insurance Coverage',
    description: 'Health fund and payment compatibility',
    score,
    weight: DEFAULT_CONFIG.healthFundWeight,
    weightedScore: Math.round(score * DEFAULT_CONFIG.healthFundWeight),
    reasons: reasons.slice(0, 3),
    icon: 'shield',
  };
}

// ============ AVAILABILITY & LOCATION MATCHING ============

function calculateAvailabilityMatch(
  patient: MockPatient,
  therapist: MockTherapist
): MatchFactor {
  const reasons: string[] = [];
  let score = 50;

  // Online preference
  if (patient.preferredOnline) {
    if (therapist.offersOnline) {
      score += 30;
      reasons.push('Offers online sessions as you prefer');

      if (therapist.offersInPerson) {
        score += 5;
        reasons.push('Also available for in-person when needed');
      }
    } else {
      score -= 20;
      reasons.push('Only offers in-person sessions');
    }
  } else {
    // Patient prefers in-person
    if (therapist.offersInPerson) {
      score += 20;

      // City matching
      if (patient.city && therapist.city === patient.city) {
        score += 25;
        reasons.push(`Located in ${patient.city} for convenient access`);
      } else if (patient.city) {
        score += 5;
        reasons.push(`Located in ${therapist.city}`);
      }
    }

    if (therapist.offersOnline) {
      score += 10;
      reasons.push('Online option available for flexibility');
    }
  }

  // Flexible options bonus
  if (therapist.offersOnline && therapist.offersInPerson) {
    score += 10;
    reasons.push('Flexible session format options');
  }

  // Currently accepting patients
  if (therapist.isAcceptingPatients) {
    score += 5;
    reasons.push('Currently accepting new patients');
  } else {
    score -= 15;
    reasons.push('May have limited availability');
  }

  score = Math.min(100, Math.max(0, score));

  return {
    key: 'availability',
    label: 'Availability & Location',
    description: 'Session format and geographical convenience',
    score,
    weight: DEFAULT_CONFIG.availabilityWeight,
    weightedScore: Math.round(score * DEFAULT_CONFIG.availabilityWeight),
    reasons: reasons.slice(0, 3),
    icon: therapist.offersOnline ? 'video' : 'map',
  };
}

// ============ PERSONAL PREFERENCES MATCHING ============

function calculatePreferenceMatch(
  patient: MockPatient,
  therapist: MockTherapist
): MatchFactor {
  const reasons: string[] = [];
  let score = 65;

  // Language match
  const patientLangs = patient.preferredLanguages || ['he'];
  const commonLangs = patientLangs.filter(lang => therapist.languages.includes(lang));

  if (commonLangs.length > 0) {
    score += 10;
    const langLabel = commonLangs.includes('he') ? 'Hebrew' :
                      commonLangs.includes('en') ? 'English' :
                      commonLangs[0];
    reasons.push(`Speaks ${langLabel}`);

    if (commonLangs.length > 1) {
      score += 5;
      reasons.push('Multilingual therapist');
    }
  }

  // Approach preferences
  if (patient.preferredApproaches && patient.preferredApproaches.length > 0) {
    const matchedApproaches = patient.preferredApproaches.filter(
      approach => therapist.approaches.includes(approach)
    );

    if (matchedApproaches.length > 0) {
      score += 10 + (matchedApproaches.length * 3);
      const approachLabel = APPROACH_LABELS[matchedApproaches[0]] || matchedApproaches[0];
      reasons.push(`Offers ${approachLabel}`);
    }
  }

  // Experience bonus
  if (therapist.yearsOfExperience >= 15) {
    score += 5;
    reasons.push(`${therapist.yearsOfExperience} years of experience`);
  } else if (therapist.yearsOfExperience >= 8) {
    score += 3;
    reasons.push(`${therapist.yearsOfExperience} years of experience`);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    key: 'preferences',
    label: 'Personal Preferences',
    description: 'Gender, language, and approach preferences',
    score,
    weight: DEFAULT_CONFIG.preferenceWeight,
    weightedScore: Math.round(score * DEFAULT_CONFIG.preferenceWeight),
    reasons: reasons.slice(0, 3),
    icon: 'user',
  };
}

// ============ OBJECTIVE FIT MATCHING ============

function calculateObjectiveFitMatch(
  patient: MockPatient,
  therapist: MockTherapist,
  config: MatchConfig = DEFAULT_CONFIG
): { factor: MatchFactor; items: MatchExplanationItem[] } {
  const reasons: string[] = [];
  const items: MatchExplanationItem[] = [];
  let score = 60; // Base score

  // Religious affiliation alignment
  if (patient.religiousAffiliation && therapist.religiousAffiliation) {
    if (patient.religiousAffiliation === therapist.religiousAffiliation) {
      score += 15;
      reasons.push('Religious/cultural background alignment');
      items.push({
        category: 'objective',
        matched: true,
        labelHe: 'Religious/cultural background match',
        labelEn: 'Religious/cultural background match',
      });
    } else {
      // Partial credit for close affiliations
      const secular = ['SECULAR', 'TRADITIONAL'];
      const religious = ['RELIGIOUS', 'ULTRA_ORTHODOX'];
      if (
        (secular.includes(patient.religiousAffiliation) && secular.includes(therapist.religiousAffiliation)) ||
        (religious.includes(patient.religiousAffiliation) && religious.includes(therapist.religiousAffiliation))
      ) {
        score += 8;
        items.push({
          category: 'objective',
          matched: true,
          labelHe: 'Similar cultural background',
          labelEn: 'Close cultural background',
        });
      } else {
        items.push({
          category: 'objective',
          matched: false,
          labelHe: 'Different religious/cultural background',
          labelEn: 'Different religious/cultural background',
        });
      }
    }
  }

  // Military background matching
  if (patient.militaryService && patient.militaryService !== 'NONE') {
    if (therapist.militaryExperience) {
      score += 15;
      reasons.push('Therapist has military experience');
      items.push({
        category: 'objective',
        matched: true,
        labelHe: 'Experience With Military Service',
        labelEn: 'Military service experience',
      });
    } else if (
      therapist.specializations.includes('MILITARY_VETERANS') ||
      therapist.specializations.includes('TRAUMA_PTSD')
    ) {
      score += 10;
      reasons.push('Specializes in military/trauma');
      items.push({
        category: 'objective',
        matched: true,
        labelHe: 'Specialization in military trauma',
        labelEn: 'Military trauma specialization',
      });
    } else {
      items.push({
        category: 'objective',
        matched: false,
        labelHe: 'No specific military experience',
        labelEn: 'No specific military experience',
      });
    }
  }

  // Age group compatibility
  if (patient.age && therapist.treatsAgeGroups && therapist.treatsAgeGroups.length > 0) {
    const patientAgeGroup = patient.age < 12 ? 'CHILDREN' :
      patient.age < 18 ? 'ADOLESCENTS' :
      patient.age < 65 ? 'ADULTS' : 'ELDERLY';

    if (therapist.treatsAgeGroups.includes(patientAgeGroup)) {
      score += 10;
      reasons.push('Treats your age group');
      items.push({
        category: 'objective',
        matched: true,
        labelHe: `Therapist in your age group`,
        labelEn: `Treats your age group (${patientAgeGroup.toLowerCase()})`,
      });
    } else {
      score -= 10;
      items.push({
        category: 'objective',
        matched: false,
        labelHe: 'Non-matching age group',
        labelEn: 'Age group mismatch',
      });
    }
  }

  // Native language alignment
  if (patient.nativeLanguage) {
    if (therapist.languages.includes(patient.nativeLanguage)) {
      score += 5;
      items.push({
        category: 'objective',
        matched: true,
        labelHe: 'Native language match',
        labelEn: 'Native language match',
      });
    }
  }

  score = Math.min(100, Math.max(0, score));

  if (reasons.length === 0) {
    reasons.push('General demographic compatibility');
  }

  return {
    factor: {
      key: 'objectiveFit',
      label: 'Objective Fit',
      description: 'Demographic and background compatibility',
      score,
      weight: config.objectiveFitWeight,
      weightedScore: Math.round(score * config.objectiveFitWeight),
      reasons: reasons.slice(0, 3),
      icon: 'user',
    },
    items,
  };
}

// ============ SUBJECTIVE FIT MATCHING ============

function calculateSubjectiveFitMatch(
  xFactor: MockXFactorProfile | null,
  therapist: MockTherapist,
  config: MatchConfig = DEFAULT_CONFIG
): { factor: MatchFactor; items: MatchExplanationItem[] } {
  const reasons: string[] = [];
  const items: MatchExplanationItem[] = [];
  let score = 55; // Base score

  if (!xFactor) {
    return {
      factor: {
        key: 'subjectiveFit',
        label: 'Subjective Fit',
        description: 'Complete your profile for personalized subjective matching',
        score: 60,
        weight: config.subjectiveFitWeight,
        weightedScore: Math.round(60 * config.subjectiveFitWeight),
        reasons: ['Complete your profile for better matching'],
        icon: 'heart',
      },
      items: [],
    };
  }

  // Communication style preference matching
  if (xFactor.communicationStylePreference && therapist.communicationStyles && therapist.communicationStyles.length > 0) {
    if (therapist.communicationStyles.includes(xFactor.communicationStylePreference)) {
      score += 20;
      reasons.push('Communication style alignment');
      items.push({
        category: 'subjective',
        matched: true,
        labelHe: 'Communication style Match',
        labelEn: 'Communication style match',
      });
    } else {
      score -= 5;
      items.push({
        category: 'subjective',
        matched: false,
        labelHe: 'Communication style not fully matching',
        labelEn: 'Communication style partial mismatch',
      });
    }
  }

  // Emotional needs coverage
  if (xFactor.emotionalNeeds && xFactor.emotionalNeeds.length > 0 && therapist.emotionalFocus && therapist.emotionalFocus.length > 0) {
    const coveredNeeds = xFactor.emotionalNeeds.filter(
      (need: EmotionalNeed) => therapist.emotionalFocus!.includes(need)
    );
    const coverage = coveredNeeds.length / xFactor.emotionalNeeds.length;

    if (coverage >= 0.75) {
      score += 20;
      reasons.push('Addresses your emotional needs well');
      items.push({
        category: 'subjective',
        matched: true,
        labelHe: 'Understands your emotional needs',
        labelEn: 'Covers your emotional needs',
      });
    } else if (coverage >= 0.5) {
      score += 10;
      items.push({
        category: 'subjective',
        matched: true,
        labelHe: 'Partially meets emotional needs',
        labelEn: 'Partially covers emotional needs',
      });
    } else {
      items.push({
        category: 'subjective',
        matched: false,
        labelHe: 'Partial emotional needs coverage',
        labelEn: 'Limited emotional needs coverage',
      });
    }
  }

  // Therapy style preference alignment
  if (xFactor.therapyStylePreference && therapist.therapyStyles && therapist.therapyStyles.length > 0) {
    if (therapist.therapyStyles.includes(xFactor.therapyStylePreference)) {
      score += 15;
      reasons.push('Therapy style preference match');
      items.push({
        category: 'subjective',
        matched: true,
        labelHe: 'Preferred therapeutic style match',
        labelEn: 'Preferred therapy style match',
      });
    } else {
      // Check for compatible styles
      const compatibleMap: Record<TherapyStylePreference, TherapyStylePreference[]> = {
        DIRECTIVE: ['STRUCTURED'],
        STRUCTURED: ['DIRECTIVE'],
        EXPLORATORY: ['FLEXIBLE'],
        FLEXIBLE: ['EXPLORATORY'],
      };
      const compatible = compatibleMap[xFactor.therapyStylePreference] || [];
      const hasCompatible = therapist.therapyStyles.some(
        (s: TherapyStylePreference) => compatible.includes(s)
      );

      if (hasCompatible) {
        score += 8;
        items.push({
          category: 'subjective',
          matched: true,
          labelHe: 'Similar therapeutic style',
          labelEn: 'Compatible therapy style',
        });
      } else {
        items.push({
          category: 'subjective',
          matched: false,
          labelHe: 'Different therapeutic style from preferred',
          labelEn: 'Therapy style differs from preference',
        });
      }
    }
  }

  score = Math.min(100, Math.max(0, score));

  if (reasons.length === 0) {
    reasons.push('General subjective compatibility');
  }

  return {
    factor: {
      key: 'subjectiveFit',
      label: 'Subjective Fit',
      description: 'Communication, emotional needs, and therapy style alignment',
      score,
      weight: config.subjectiveFitWeight,
      weightedScore: Math.round(score * config.subjectiveFitWeight),
      reasons: reasons.slice(0, 3),
      icon: 'heart',
    },
    items,
  };
}

// ============ MAIN MATCHING FUNCTION ============

export function calculateDetailedMatch(
  patient: MockPatient,
  xFactorProfile: MockXFactorProfile | null,
  therapist: MockTherapist,
  config: MatchConfig = DEFAULT_CONFIG
): DetailedMatchResult {
  // Calculate all 6 factors
  const xFactorMatch = calculateXFactorMatch(xFactorProfile, therapist);
  const healthFundMatch = calculateHealthFundMatch(patient.healthFund, therapist.acceptedHealthFunds);
  const availabilityMatch = calculateAvailabilityMatch(patient, therapist);
  const preferenceMatch = calculatePreferenceMatch(patient, therapist);
  const objectiveFitResult = calculateObjectiveFitMatch(patient, therapist, config);
  const subjectiveFitResult = calculateSubjectiveFitMatch(xFactorProfile, therapist, config);

  const factors: MatchFactor[] = [
    xFactorMatch,
    healthFundMatch,
    availabilityMatch,
    preferenceMatch,
    objectiveFitResult.factor,
    subjectiveFitResult.factor,
  ];

  // Calculate overall score (6-factor weighted)
  const overallScore = Math.round(
    xFactorMatch.score * config.xFactorWeight +
    healthFundMatch.score * config.healthFundWeight +
    availabilityMatch.score * config.availabilityWeight +
    preferenceMatch.score * config.preferenceWeight +
    objectiveFitResult.factor.score * config.objectiveFitWeight +
    subjectiveFitResult.factor.score * config.subjectiveFitWeight
  );

  // Determine match quality
  const matchQuality: DetailedMatchResult['matchQuality'] =
    overallScore >= 90 ? 'excellent' :
    overallScore >= 80 ? 'great' :
    overallScore >= 70 ? 'good' :
    overallScore >= 55 ? 'moderate' : 'low';

  // Build explanation items from all sources
  const explanationItems: MatchExplanationItem[] = [
    ...objectiveFitResult.items,
    ...subjectiveFitResult.items,
  ];

  // Add practical explanation items from other factors
  if (healthFundMatch.score >= 80) {
    explanationItems.push({
      category: 'practical',
      matched: true,
      labelHe: 'Health fund match',
      labelEn: 'Health fund match',
    });
  } else if (healthFundMatch.score < 40) {
    explanationItems.push({
      category: 'practical',
      matched: false,
      labelHe: 'Health Fund No Matching',
      labelEn: 'Health fund mismatch',
    });
  }

  if (availabilityMatch.score >= 70) {
    explanationItems.push({
      category: 'practical',
      matched: true,
      labelHe: 'Convenient availability and access',
      labelEn: 'Good availability & access',
    });
  }

  // Add therapeutic explanation items
  if (xFactorMatch.score >= 80) {
    explanationItems.push({
      category: 'therapeutic',
      matched: true,
      labelHe: 'High therapeutic match',
      labelEn: 'High therapeutic compatibility',
    });
  } else if (xFactorMatch.score < 50) {
    explanationItems.push({
      category: 'therapeutic',
      matched: false,
      labelHe: 'Low therapeutic match',
      labelEn: 'Low therapeutic compatibility',
    });
  }

  // Collect top reasons (from highest scoring factors)
  const sortedFactors = [...factors].sort((a, b) => b.score - a.score);
  const topReasons = sortedFactors
    .flatMap(f => f.reasons)
    .slice(0, 5);

  // Generate warnings for low-scoring factors
  const warnings: string[] = [];
  factors.forEach(f => {
    if (f.score < 50) {
      if (f.key === 'healthFund') {
        warnings.push('Limited health fund coverage');
      } else if (f.key === 'availability') {
        warnings.push('Session format may not match your preference');
      } else if (f.key === 'objectiveFit') {
        warnings.push('Demographic alignment could be stronger');
      } else if (f.key === 'subjectiveFit') {
        warnings.push('Communication/style preferences differ');
      }
    }
  });

  // Generate insights
  const insights: string[] = [];

  if (therapist.yearsOfExperience >= 15) {
    insights.push('Highly experienced practitioner');
  }

  if (therapist.approaches.length >= 3) {
    insights.push('Versatile therapeutic approach');
  }

  if (xFactorProfile && xFactorProfile.changeReadiness >= 80) {
    insights.push('Your high motivation enhances match potential');
  }

  if (objectiveFitResult.factor.score >= 85) {
    insights.push('Strong objective profile alignment');
  }

  if (subjectiveFitResult.factor.score >= 85) {
    insights.push('Excellent communication & style fit');
  }

  return {
    therapistId: therapist.id,
    overallScore,
    objectiveFitScore: objectiveFitResult.factor.score,
    subjectiveFitScore: subjectiveFitResult.factor.score,
    matchQuality,
    factors,
    explanationItems,
    topReasons,
    warnings,
    insights,
  };
}

// ============ UTILITY FUNCTIONS ============

export function getMatchQualityLabel(quality: DetailedMatchResult['matchQuality']): string {
  switch (quality) {
    case 'excellent': return 'Excellent Match';
    case 'great': return 'Great Match';
    case 'good': return 'Good Match';
    case 'moderate': return 'Moderate Match';
    case 'low': return 'Limited Match';
  }
}

export function getMatchQualityColor(quality: DetailedMatchResult['matchQuality']): string {
  switch (quality) {
    case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
    case 'great': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'good': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
    case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
