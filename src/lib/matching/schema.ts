/**
 * MatchMind Core Data Schema
 *
 * This file defines the normalized data structures for the matching system.
 * Designed for production scalability and future ML integration.
 *
 * Architecture Principles:
 * 1. X-Factor data is ALWAYS optional and stored separately
 * 2. Matching functions fully on required intake alone
 * 3. All data is normalized and type-safe
 * 4. GDPR-ready with clear data isolation
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const SESSION_FORMATS = ['ONLINE', 'IN_PERSON', 'HYBRID'] as const;
export type SessionFormat = typeof SESSION_FORMATS[number];

export const HEALTH_FUNDS = ['CLALIT', 'MACCABI', 'MEUHEDET', 'LEUMIT', 'PRIVATE', 'NONE'] as const;
export type HealthFund = typeof HEALTH_FUNDS[number];

export const GENDERS = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
export type Gender = typeof GENDERS[number];

export const LANGUAGES = ['HEBREW', 'ENGLISH', 'RUSSIAN', 'ARABIC', 'FRENCH', 'SPANISH', 'AMHARIC'] as const;
export type Language = typeof LANGUAGES[number];

export const SPECIALIZATIONS = [
  'ANXIETY',
  'DEPRESSION',
  'TRAUMA_PTSD',
  'RELATIONSHIPS',
  'STRESS_MANAGEMENT',
  'GRIEF_LOSS',
  'SELF_ESTEEM',
  'LIFE_TRANSITIONS',
  'FAMILY_ISSUES',
  'WORK_CAREER',
  'ANGER_MANAGEMENT',
  'ADDICTION',
  'EATING_DISORDERS',
  'OCD',
  'ADHD',
  'PERSONALITY_DISORDERS',
  'COUPLES_THERAPY',
  'CHILD_ADOLESCENT',
  'LGBTQ_ISSUES',
  'CULTURAL_IDENTITY',
  'CHRONIC_ILLNESS',
  'SLEEP_DISORDERS',
  'SEXUAL_ISSUES',
  'PARENTING',
] as const;
export type Specialization = typeof SPECIALIZATIONS[number];

export const THERAPY_APPROACHES = [
  'CBT',
  'PSYCHODYNAMIC',
  'HUMANISTIC',
  'EXISTENTIAL',
  'INTEGRATIVE',
  'MINDFULNESS',
  'DBT',
  'EMDR',
  'ACT',
  'GESTALT',
  'SOLUTION_FOCUSED',
  'NARRATIVE',
  'FAMILY_SYSTEMS',
  'ATTACHMENT_BASED',
  'ART_THERAPY',
  'SOMATIC',
] as const;
export type TherapyApproach = typeof THERAPY_APPROACHES[number];

export const AGE_GROUPS = ['18_25', '26_35', '36_45', '46_55', '56_65', '65_PLUS'] as const;
export type AgeGroup = typeof AGE_GROUPS[number];

export const EXPERIENCE_LEVELS = ['ENTRY', 'INTERMEDIATE', 'EXPERIENCED', 'SENIOR', 'EXPERT'] as const;
export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];

// =============================================================================
// TABLE: users (Base user account)
// =============================================================================

export interface User {
  id: string;
  email: string;
  role: 'PATIENT' | 'THERAPIST' | 'ADMIN' | 'OWNER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
}

// =============================================================================
// TABLE: therapists (Core therapist data)
// =============================================================================

export interface Therapist {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string; // Dr., etc.
  email: string;
  phone: string;
  gender: Gender;
  dateOfBirth: Date | null;
  photoUrl: string | null;
  bio: string | null;
  bioHebrew: string | null;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;

  // Session settings
  offersOnline: boolean;
  offersInPerson: boolean;
  sessionPrice: number;
  sessionDuration: number; // minutes

  // Experience
  yearsOfExperience: number;
  experienceLevel: ExperienceLevel;

  // Status
  approvalStatus: 'PENDING_INFO' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isAcceptingPatients: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
}

// =============================================================================
// TABLE: therapist_credentials (Normalized credentials)
// =============================================================================

export interface TherapistCredential {
  id: string;
  therapistId: string;
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  issuedAt: Date;
  expiresAt: Date | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TABLE: therapist_specializations (Many-to-many)
// =============================================================================

export interface TherapistSpecialization {
  id: string;
  therapistId: string;
  specialization: Specialization;
  isPrimary: boolean; // Primary vs secondary specialization
  yearsExperience: number; // Years in this specific area
  createdAt: Date;
}

// =============================================================================
// TABLE: therapist_approaches (Many-to-many)
// =============================================================================

export interface TherapistApproach {
  id: string;
  therapistId: string;
  approach: TherapyApproach;
  proficiencyLevel: 'BASIC' | 'PROFICIENT' | 'EXPERT';
  createdAt: Date;
}

// =============================================================================
// TABLE: therapist_health_funds (Many-to-many)
// =============================================================================

export interface TherapistHealthFund {
  id: string;
  therapistId: string;
  healthFund: HealthFund;
  agreementType: 'FULL' | 'PARTIAL' | 'NONE';
  maxSessionsCovered: number | null;
  createdAt: Date;
}

// =============================================================================
// TABLE: therapist_languages (Many-to-many)
// =============================================================================

export interface TherapistLanguage {
  id: string;
  therapistId: string;
  language: Language;
  proficiencyLevel: 'NATIVE' | 'FLUENT' | 'CONVERSATIONAL';
  createdAt: Date;
}

// =============================================================================
// TABLE: therapist_availability (Weekly schedule)
// =============================================================================

export interface TherapistAvailability {
  id: string;
  therapistId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // HH:MM format
  endTime: string;
  isOnline: boolean;
  isInPerson: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TABLE: client_profiles (Core client data)
// =============================================================================

export interface ClientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: Gender | null;
  dateOfBirth: Date | null;
  city: string | null;

  // Onboarding status
  intakeCompleted: boolean;
  preferencesCompleted: boolean;
  xFactorCompleted: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  intakeCompletedAt: Date | null;
  xFactorCompletedAt: Date | null;
}

// =============================================================================
// TABLE: client_intake_required (MANDATORY - Blocking step)
// =============================================================================

export interface ClientIntakeRequired {
  id: string;
  clientId: string;

  // Hard filter requirements
  preferredSessionFormat: SessionFormat;
  healthFund: HealthFund;
  healthFundMemberId: string | null;

  // Geographic requirements
  city: string;
  maxDistanceKm: number | null; // null = no limit (online only)

  // Basic matching requirements
  primaryConcerns: Specialization[]; // What they need help with
  preferredLanguages: Language[];

  // Availability
  preferredDays: number[]; // 0-6
  preferredTimeSlots: ('MORNING' | 'AFTERNOON' | 'EVENING')[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TABLE: client_preferences (OPTIONAL - Improves matching)
// =============================================================================

export interface ClientPreferences {
  id: string;
  clientId: string;

  // Therapist preferences
  preferredTherapistGender: Gender | null;
  preferredAgeGroup: AgeGroup | null;
  preferredExperienceLevel: ExperienceLevel | null;

  // Therapy preferences
  preferredApproaches: TherapyApproach[];

  // Session preferences
  preferredSessionDuration: number | null; // minutes
  maxPricePerSession: number | null;

  // Additional preferences
  importantFactors: string[]; // Free-text important factors

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TABLE: client_xfactor_optional (OPTIONAL - Statistical personalization)
// =============================================================================

export interface ClientXFactorOptional {
  id: string;
  clientId: string;

  // Personality indicators (1-5 scale or null)
  communicationStyle: number | null; // 1=direct, 5=indirect
  emotionalExpression: number | null; // 1=reserved, 5=expressive
  structurePreference: number | null; // 1=flexible, 5=structured
  feedbackStyle: number | null; // 1=gentle, 5=direct
  pacePreference: number | null; // 1=slow/deep, 5=fast/action-oriented

  // Behavioral patterns
  previousTherapyExperience: boolean | null;
  previousTherapyHelpful: boolean | null;
  comfortWithSilence: number | null; // 1-5
  homeworkWillingness: number | null; // 1-5

  // Lifestyle factors (for statistical correlation)
  sleepQuality: number | null; // 1-5
  exerciseFrequency: number | null; // 1-5
  socialSupport: number | null; // 1-5
  stressLevel: number | null; // 1-5

  // Goals and motivations
  primaryGoals: string[];
  motivationLevel: number | null; // 1-5
  readinessForChange: number | null; // 1-5

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Consent tracking (GDPR)
  consentGiven: boolean;
  consentTimestamp: Date | null;
}

// =============================================================================
// TABLE: matching_scores (Computed match results)
// =============================================================================

export interface MatchingScore {
  id: string;
  clientId: string;
  therapistId: string;

  // Layer scores (0-100)
  hardFiltersPassed: boolean; // Layer A result
  coreScore: number; // Layer B (0-100)
  xFactorScore: number | null; // Layer C (0-100, null if not available)

  // Component scores for transparency
  specializationScore: number;
  availabilityScore: number;
  languageScore: number;
  locationScore: number;
  experienceScore: number;
  priceScore: number;
  preferenceScore: number; // Gender, age, approach preferences

  // Final computed score
  finalScore: number; // Weighted combination (0-100)
  matchQuality: 'EXCELLENT' | 'GREAT' | 'GOOD' | 'MODERATE' | 'LOW';

  // Ranking
  rank: number; // Position among all matches for this client

  // Metadata
  algorithmVersion: string;
  weightsUsed: Record<string, number>; // Snapshot of weights used

  // Timestamps
  computedAt: Date;
  expiresAt: Date; // Scores should be recomputed periodically
}

// =============================================================================
// TABLE: matching_explanations (Human-readable explanations)
// =============================================================================

export interface MatchingExplanation {
  id: string;
  matchingScoreId: string;

  // Structured explanation components
  positiveFactors: ExplanationFactor[];
  neutralFactors: ExplanationFactor[];
  considerationFactors: ExplanationFactor[]; // Potential concerns

  // Summary
  summaryHebrew: string;
  summaryEnglish: string;

  // Top reasons (ordered by importance)
  topReasons: string[];

  // Timestamps
  createdAt: Date;
}

export interface ExplanationFactor {
  key: string;
  labelHebrew: string;
  labelEnglish: string;
  icon: string; // Icon identifier
  weight: number; // How much this affected the score
  details: string | null;
}

// =============================================================================
// TABLE: match_feedback (Future - outcome tracking)
// =============================================================================

export interface MatchFeedback {
  id: string;
  matchingScoreId: string;
  clientId: string;
  therapistId: string;

  // User actions
  viewed: boolean;
  viewedAt: Date | null;
  contacted: boolean;
  contactedAt: Date | null;
  sessionBooked: boolean;
  sessionBookedAt: Date | null;

  // Feedback (after interaction)
  matchAccuracy: number | null; // 1-5 rating
  wouldRecommend: boolean | null;
  feedbackText: string | null;

  // Outcome tracking
  sessionsCompleted: number;
  isOngoing: boolean;
  endedReason: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TABLE: algorithm_weights (Configurable weights)
// =============================================================================

export interface AlgorithmWeights {
  id: string;
  version: string;
  isActive: boolean;

  // Layer weights
  coreScoreWeight: number; // e.g., 0.5
  xFactorWeight: number; // e.g., 0.2
  preferenceWeight: number; // e.g., 0.3

  // Core component weights (must sum to 1.0)
  specializationWeight: number;
  availabilityWeight: number;
  languageWeight: number;
  locationWeight: number;
  experienceWeight: number;
  priceWeight: number;

  // Thresholds
  minimumScoreThreshold: number; // Don't show matches below this
  excellentThreshold: number;
  greatThreshold: number;
  goodThreshold: number;
  moderateThreshold: number;

  // Metadata
  description: string;
  createdAt: Date;
  activatedAt: Date | null;
  createdBy: string;
}

// =============================================================================
// COMPOSITE TYPES (Joined data for API responses)
// =============================================================================

export interface TherapistComplete {
  therapist: Therapist;
  credentials: TherapistCredential[];
  specializations: TherapistSpecialization[];
  approaches: TherapistApproach[];
  healthFunds: TherapistHealthFund[];
  languages: TherapistLanguage[];
  availability: TherapistAvailability[];
}

export interface ClientComplete {
  profile: ClientProfile;
  intake: ClientIntakeRequired | null;
  preferences: ClientPreferences | null;
  xFactor: ClientXFactorOptional | null;
}

export interface MatchResult {
  score: MatchingScore;
  explanation: MatchingExplanation;
  therapist: TherapistComplete;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function isIntakeComplete(client: ClientComplete): boolean {
  return client.intake !== null && client.profile.intakeCompleted;
}

export function canShowMatches(client: ClientComplete): boolean {
  return isIntakeComplete(client);
}

export function hasXFactor(client: ClientComplete): boolean {
  return client.xFactor !== null && client.profile.xFactorCompleted;
}
