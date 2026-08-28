/**
 * Match Explanation Engine
 *
 * Generates human-readable explanations for match scores.
 * All explanations are derived from structured logic, never hardcoded.
 *
 * Design Principles:
 * 1. Never expose raw statistical correlations
 * 2. Focus on positive, actionable information
 * 3. Be transparent about what factors influenced the match
 * 4. Support both Hebrew and English
 */

import type {
  ClientComplete,
  TherapistComplete,
  MatchingExplanation,
  ExplanationFactor,
  MatchingScore,
} from './schema';
import type { ScoringResult, ComponentScores } from './scoring-engine';
import { EXPLANATION_TEMPLATES, MATCH_QUALITY_LABELS } from './config';

// =============================================================================
// MAIN EXPLANATION GENERATOR
// =============================================================================

/**
 * Generate comprehensive explanation for a match
 */
export function generateMatchExplanation(
  client: ClientComplete,
  therapist: TherapistComplete,
  scoringResult: ScoringResult
): Omit<MatchingExplanation, 'id' | 'createdAt' | 'matchingScoreId'> {
  const { score, componentScores } = scoringResult;

  // Generate factors
  const positiveFactors = generatePositiveFactors(
    client,
    therapist,
    componentScores
  );
  const neutralFactors = generateNeutralFactors(
    client,
    therapist,
    componentScores
  );
  const considerationFactors = generateConsiderationFactors(
    client,
    therapist,
    componentScores
  );

  // Generate top reasons (sorted by importance)
  const topReasons = generateTopReasons(
    client,
    therapist,
    componentScores,
    positiveFactors
  );

  // Generate summaries
  const summaryHebrew = generateSummaryHebrew(
    therapist,
    score,
    topReasons.length
  );
  const summaryEnglish = generateSummaryEnglish(
    therapist,
    score,
    topReasons.length
  );

  return {
    positiveFactors,
    neutralFactors,
    considerationFactors,
    summaryHebrew,
    summaryEnglish,
    topReasons,
  };
}

// =============================================================================
// POSITIVE FACTORS
// =============================================================================

function generatePositiveFactors(
  client: ClientComplete,
  therapist: TherapistComplete,
  scores: ComponentScores
): ExplanationFactor[] {
  const factors: ExplanationFactor[] = [];

  // Health fund match
  if (client.intake) {
    const clientFund = client.intake.healthFund;
    const fundMatch = therapist.healthFunds.find(
      (tf) => tf.healthFund === clientFund && tf.agreementType !== 'NONE'
    );
    if (fundMatch) {
      factors.push({
        ...EXPLANATION_TEMPLATES.healthFundMatch,
        weight: 0.15,
        details:
          fundMatch.agreementType === 'FULL'
            ? 'כיסוי מלא / Full coverage'
            : 'כיסוי חלקי / Partial coverage',
      });
    }
  }

  // Session format match
  if (client.intake) {
    const format = client.intake.preferredSessionFormat;
    if (format === 'ONLINE' && therapist.therapist.offersOnline) {
      factors.push({
        ...EXPLANATION_TEMPLATES.onlineAvailable,
        weight: 0.1,
        details: null,
      });
    }
    if (
      (format === 'IN_PERSON' || format === 'HYBRID') &&
      therapist.therapist.offersInPerson
    ) {
      factors.push({
        ...EXPLANATION_TEMPLATES.inPersonAvailable,
        weight: 0.1,
        details: `${therapist.therapist.city}`,
      });
    }
  }

  // Specialization match
  if (scores.specialization >= 60) {
    const matchingSpecs = getMatchingSpecializations(client, therapist);
    factors.push({
      ...EXPLANATION_TEMPLATES.specializationMatch,
      weight: 0.2,
      details: matchingSpecs.length > 0 ? matchingSpecs.join(', ') : null,
    });
  }

  // Schedule match
  if (scores.availability >= 70) {
    factors.push({
      ...EXPLANATION_TEMPLATES.scheduleMatch,
      weight: 0.1,
      details: null,
    });
  }

  // Language match
  if (scores.language >= 85) {
    const sharedLanguages = getSharedLanguages(client, therapist);
    factors.push({
      ...EXPLANATION_TEMPLATES.languageMatch,
      weight: 0.08,
      details: sharedLanguages.length > 0 ? sharedLanguages.join(', ') : null,
    });
  }

  // Experience
  if (scores.experience >= 70) {
    factors.push({
      ...EXPLANATION_TEMPLATES.experienceRelevant,
      weight: 0.1,
      details: `${therapist.therapist.yearsOfExperience} שנות ניסיון / years experience`,
    });
  }

  // Price in budget
  if (scores.price >= 80) {
    factors.push({
      ...EXPLANATION_TEMPLATES.priceInBudget,
      weight: 0.08,
      details: `₪${therapist.therapist.sessionPrice} / פגישה`,
    });
  }

  // Gender preference match
  if (
    client.preferences?.preferredTherapistGender &&
    client.preferences.preferredTherapistGender === therapist.therapist.gender
  ) {
    factors.push({
      ...EXPLANATION_TEMPLATES.genderPreferenceMatch,
      weight: 0.05,
      details: null,
    });
  }

  // Therapy approach match
  if (client.preferences?.preferredApproaches) {
    const matchingApproaches = getMatchingApproaches(client, therapist);
    if (matchingApproaches.length > 0) {
      factors.push({
        ...EXPLANATION_TEMPLATES.approachMatch,
        weight: 0.1,
        details: matchingApproaches.join(', '),
      });
    }
  }

  // X-Factor personality match (only if available and high)
  if (scores.xFactor !== null && scores.xFactor >= 70) {
    factors.push({
      ...EXPLANATION_TEMPLATES.personalityMatch,
      weight: 0.15,
      details: null,
    });
  }

  // Sort by weight
  factors.sort((a, b) => b.weight - a.weight);

  return factors;
}

// =============================================================================
// NEUTRAL FACTORS
// =============================================================================

function generateNeutralFactors(
  client: ClientComplete,
  therapist: TherapistComplete,
  scores: ComponentScores
): ExplanationFactor[] {
  const factors: ExplanationFactor[] = [];

  // No specific health fund - private
  if (
    !client.intake ||
    client.intake.healthFund === 'PRIVATE' ||
    client.intake.healthFund === 'NONE'
  ) {
    // Don't add as positive or negative
  }

  // Moderate experience
  if (scores.experience >= 40 && scores.experience < 70) {
    factors.push({
      key: 'moderate_experience',
      labelHebrew: 'ניסיון מוכח בתחום',
      labelEnglish: 'Proven experience in the field',
      icon: 'briefcase',
      weight: 0.05,
      details: null,
    });
  }

  return factors;
}

// =============================================================================
// CONSIDERATION FACTORS (Potential concerns)
// =============================================================================

function generateConsiderationFactors(
  client: ClientComplete,
  therapist: TherapistComplete,
  scores: ComponentScores
): ExplanationFactor[] {
  const factors: ExplanationFactor[] = [];

  // Price above budget
  if (scores.price < 60 && scores.price > 0) {
    factors.push({
      ...EXPLANATION_TEMPLATES.priceAboveBudget,
      weight: 0.1,
      details: `₪${therapist.therapist.sessionPrice} / פגישה`,
    });
  }

  // Limited availability
  if (scores.availability < 50 && scores.availability > 0) {
    factors.push({
      ...EXPLANATION_TEMPLATES.limitedAvailability,
      weight: 0.08,
      details: null,
    });
  }

  // Geographic distance (for in-person)
  if (
    client.intake?.preferredSessionFormat === 'IN_PERSON' &&
    scores.location < 80 &&
    scores.location >= 50
  ) {
    factors.push({
      ...EXPLANATION_TEMPLATES.distanceConsideration,
      weight: 0.05,
      details: therapist.therapist.city,
    });
  }

  return factors;
}

// =============================================================================
// TOP REASONS GENERATOR
// =============================================================================

function generateTopReasons(
  client: ClientComplete,
  therapist: TherapistComplete,
  scores: ComponentScores,
  positiveFactors: ExplanationFactor[]
): string[] {
  const reasons: string[] = [];

  // Take top positive factors and convert to reasons
  const topFactors = positiveFactors.slice(0, 4);

  for (const factor of topFactors) {
    if (factor.details) {
      reasons.push(`${factor.labelHebrew} - ${factor.details}`);
    } else {
      reasons.push(factor.labelHebrew);
    }
  }

  // Add X-Factor reason if applicable
  if (
    scores.xFactor !== null &&
    scores.xFactor >= 60 &&
    !reasons.some((r) => r.includes('התאמה גבוהה לסגנון'))
  ) {
    reasons.push('התאמה מותאמת אישית על בסיס הפרופיל שלך');
  }

  return reasons.slice(0, 5);
}

// =============================================================================
// SUMMARY GENERATORS
// =============================================================================

function generateSummaryHebrew(
  therapist: TherapistComplete,
  score: ScoringResult['score'],
  positiveFactorCount: number
): string {
  const name = `${therapist.therapist.title || ''} ${therapist.therapist.firstName} ${therapist.therapist.lastName}`.trim();
  const quality = MATCH_QUALITY_LABELS[score.matchQuality].labelHebrew;

  if (score.matchQuality === 'EXCELLENT') {
    return `${name} מציג/ה ${quality} עם ${positiveFactorCount} גורמים חיוביים משמעותיים. ההתאמה מבוססת על ניתוח מקיף של הצרכים וההעדפות שלך.`;
  }

  if (score.matchQuality === 'GREAT') {
    return `${name} מציג/ה ${quality} על בסיס ${positiveFactorCount} גורמים תואמים. מומלץ לבחון את הפרופיל המלא.`;
  }

  if (score.matchQuality === 'GOOD') {
    return `${name} מציג/ה ${quality}. יש התאמה טובה במספר תחומים חשובים.`;
  }

  return `${name} מציג/ה ${quality}. מומלץ לבחון אפשרויות נוספות.`;
}

function generateSummaryEnglish(
  therapist: TherapistComplete,
  score: ScoringResult['score'],
  positiveFactorCount: number
): string {
  const name = `${therapist.therapist.title || ''} ${therapist.therapist.firstName} ${therapist.therapist.lastName}`.trim();
  const quality = MATCH_QUALITY_LABELS[score.matchQuality].labelEnglish;

  if (score.matchQuality === 'EXCELLENT') {
    return `${name} shows an ${quality} with ${positiveFactorCount} significant positive factors. This match is based on comprehensive analysis of your needs and preferences.`;
  }

  if (score.matchQuality === 'GREAT') {
    return `${name} shows a ${quality} based on ${positiveFactorCount} matching factors. We recommend reviewing the full profile.`;
  }

  if (score.matchQuality === 'GOOD') {
    return `${name} shows a ${quality}. There's good compatibility in several important areas.`;
  }

  return `${name} shows a ${quality}. Consider reviewing additional options.`;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getMatchingSpecializations(
  client: ClientComplete,
  therapist: TherapistComplete
): string[] {
  if (!client.intake) return [];

  const clientConcerns = new Set(client.intake.primaryConcerns);
  const matching: string[] = [];

  for (const spec of therapist.specializations) {
    if (clientConcerns.has(spec.specialization)) {
      matching.push(formatSpecialization(spec.specialization));
    }
  }

  return matching.slice(0, 3);
}

function getSharedLanguages(
  client: ClientComplete,
  therapist: TherapistComplete
): string[] {
  if (!client.intake) return [];

  const clientLanguages = new Set(client.intake.preferredLanguages);
  const shared: string[] = [];

  for (const lang of therapist.languages) {
    if (clientLanguages.has(lang.language)) {
      shared.push(formatLanguage(lang.language));
    }
  }

  return shared;
}

function getMatchingApproaches(
  client: ClientComplete,
  therapist: TherapistComplete
): string[] {
  if (!client.preferences?.preferredApproaches) return [];

  const clientApproaches = new Set(client.preferences.preferredApproaches);
  const matching: string[] = [];

  for (const approach of therapist.approaches) {
    if (clientApproaches.has(approach.approach)) {
      matching.push(formatApproach(approach.approach));
    }
  }

  return matching.slice(0, 3);
}

// =============================================================================
// FORMATTERS (Convert enum values to human-readable)
// =============================================================================

const SPECIALIZATION_LABELS: Record<string, string> = {
  ANXIETY: 'חרדה / Anxiety',
  DEPRESSION: 'דיכאון / Depression',
  TRAUMA_PTSD: 'טראומה ו-PTSD',
  RELATIONSHIPS: 'יחסים / Relationships',
  STRESS_MANAGEMENT: 'ניהול מתחים / Stress',
  GRIEF_LOSS: 'אבל ואובדן / Grief',
  SELF_ESTEEM: 'דימוי עצמי / Self-esteem',
  LIFE_TRANSITIONS: 'מעברי חיים / Transitions',
  FAMILY_ISSUES: 'סוגיות משפחתיות / Family',
  WORK_CAREER: 'קריירה ועבודה / Career',
  ANGER_MANAGEMENT: 'ניהול כעסים / Anger',
  ADDICTION: 'התמכרויות / Addiction',
  EATING_DISORDERS: 'הפרעות אכילה / Eating',
  OCD: 'הפרעה טורדנית / OCD',
  ADHD: 'הפרעת קשב / ADHD',
  COUPLES_THERAPY: 'טיפול זוגי / Couples',
  CHILD_ADOLESCENT: 'ילדים ונוער / Youth',
  LGBTQ_ISSUES: 'LGBTQ+',
  CHRONIC_ILLNESS: 'מחלות כרוניות / Chronic',
  SLEEP_DISORDERS: 'הפרעות שינה / Sleep',
};

const LANGUAGE_LABELS: Record<string, string> = {
  HEBREW: 'עברית',
  ENGLISH: 'English',
  RUSSIAN: 'Русский',
  ARABIC: 'العربية',
  FRENCH: 'Français',
  SPANISH: 'Español',
  AMHARIC: 'አማርኛ',
};

const APPROACH_LABELS: Record<string, string> = {
  CBT: 'CBT - טיפול קוגניטיבי-התנהגותי',
  PSYCHODYNAMIC: 'פסיכודינמי',
  HUMANISTIC: 'הומניסטי',
  EXISTENTIAL: 'אקזיסטנציאלי',
  INTEGRATIVE: 'אינטגרטיבי',
  MINDFULNESS: 'מיינדפולנס',
  DBT: 'DBT',
  EMDR: 'EMDR',
  ACT: 'ACT',
  GESTALT: 'גשטלט',
  SOLUTION_FOCUSED: 'ממוקד פתרונות',
  NARRATIVE: 'נרטיבי',
  FAMILY_SYSTEMS: 'שיטתי-משפחתי',
  ATTACHMENT_BASED: 'מבוסס התקשרות',
  ART_THERAPY: 'טיפול באמנות',
  SOMATIC: 'סומטי',
};

function formatSpecialization(spec: string): string {
  return SPECIALIZATION_LABELS[spec] || spec.replace(/_/g, ' ');
}

function formatLanguage(lang: string): string {
  return LANGUAGE_LABELS[lang] || lang;
}

function formatApproach(approach: string): string {
  return APPROACH_LABELS[approach] || approach.replace(/_/g, ' ');
}

// =============================================================================
// BATCH EXPLANATION GENERATION
// =============================================================================

/**
 * Generate explanations for multiple matches
 */
export function generateAllExplanations(
  client: ClientComplete,
  therapists: TherapistComplete[],
  scoringResults: ScoringResult[]
): Array<{
  therapistId: string;
  explanation: Omit<MatchingExplanation, 'id' | 'createdAt' | 'matchingScoreId'>;
}> {
  return scoringResults.map((result, index) => ({
    therapistId: result.score.therapistId,
    explanation: generateMatchExplanation(client, therapists[index], result),
  }));
}
