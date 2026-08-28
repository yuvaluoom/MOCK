/**
 * MatchMind Matching Engine - Type Definitions
 *
 * Core types for the modular matching engine infrastructure
 */

// =============================================================================
// DATA MODELS
// =============================================================================

export interface PatientProfile {
  id: string;

  // Demographics
  gender?: string;
  city?: string;
  region?: string;
  coordinates?: { lat: number; lng: number };

  // Health fund
  healthFund?: string;
  healthFundMemberId?: string;
  organizationMemberships?: OrganizationMembership[];

  // Preferences
  preferredGender?: string;
  preferredLanguages: string[];
  preferredApproaches: string[];
  preferredDays: string[];
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
  preferredOnline: boolean;
  maxTravelDistance?: number;
  maxSessionPrice?: number;

  // Status
  urgencyLevel: number;
  isActivelySearching: boolean;
}

export interface OrganizationMembership {
  organizationId: string;
  organizationCode: string;
  memberId?: string;
  planType?: string;
  coverageDetails?: Record<string, unknown>;
  isActive: boolean;
}

export interface XFactorProfile {
  id: string;
  patientId: string;
  version: number;

  // Core psychological dimensions (0-100)
  openness: number;
  emotionalIntensity: number;
  structurePreference: number;
  relationshipStyle: number;
  communicationStyle: number;
  changeReadiness: number;

  // Context dimensions
  sleepQuality?: number;
  stressLevel?: number;
  militaryStress?: number;
  emotionalLoad?: number;
  socialSupport?: number;
  copingStyle?: number;

  // Constraint signals
  geographicFlexibility?: number;
  scheduleFlexibility?: number;
  budgetFlexibility?: number;

  // Computed composites
  therapeuticNeedIntensity?: number;
  matchingDifficulty?: number;

  // Metadata
  isComplete: boolean;
  completionPercentage: number;
  confidenceScore: number;
  algorithmVersion: string;
}

export interface TherapistProfile {
  id: string;

  // Personal
  firstName: string;
  lastName: string;
  gender: string;
  photoUrl?: string;

  // Professional
  title?: string;
  licenseNumber: string;
  licenseType?: string;
  yearsOfExperience: number;

  // Location
  city: string;
  region?: string;
  coordinates?: { lat: number; lng: number };
  offersOnline: boolean;
  offersInPerson: boolean;
  serviceRadius?: number;

  // Services
  languages: string[];
  approaches: string[];
  specializations: string[];
  sessionPrice?: number;
  sessionDuration: number;

  // Health funds
  acceptedHealthFunds: string[];
  organizationAffiliations?: TherapistOrganizationAffiliation[];

  // Availability
  isAcceptingPatients: boolean;
  currentPatientCount: number;
  maxWeeklyPatients?: number;
  availability: AvailabilitySlot[];

  // Performance (for matching quality)
  performanceMetrics?: TherapistPerformanceMetrics;

  // Bio
  bio?: string;
  bioHebrew?: string;
  therapeuticPhilosophy?: string;
}

export interface TherapistOrganizationAffiliation {
  organizationId: string;
  organizationCode: string;
  affiliationType: string;
  coveredServices?: string[];
  priceOverride?: number;
  isActive: boolean;
}

export interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  isInPerson: boolean;
}

export interface TherapistPerformanceMetrics {
  matchAcceptanceRate?: number;
  sessionCompletionRate?: number;
  averageFeedbackScore?: number;
  retentionRate?: number;
  responseTimeHours?: number;
}

// =============================================================================
// FEATURE EXTRACTION
// =============================================================================

export interface ExtractedFeatures {
  patientFeatures: PatientFeatures;
  therapistFeatures: TherapistFeatures;
  derivedFeatures: DerivedFeatures;
}

export interface PatientFeatures {
  // Demographics
  location: LocationFeature;
  healthFundFeature: HealthFundFeature;

  // X-Factor derived
  therapeuticNeedProfile: TherapeuticNeedProfile;
  constraintProfile: ConstraintProfile;
  preferenceProfile: PreferenceProfile;
}

export interface TherapistFeatures {
  // Demographics
  location: LocationFeature;
  healthFundFeature: HealthFundFeature;

  // Professional
  expertiseProfile: ExpertiseProfile;
  availabilityProfile: AvailabilityProfile;
  capacityProfile: CapacityProfile;
}

export interface DerivedFeatures {
  // Computed compatibility signals
  distanceKm?: number;
  scheduleOverlapScore: number;
  expertiseMatchScore: number;
  communicationStyleAlignment: number;
}

export interface LocationFeature {
  city?: string;
  region?: string;
  coordinates?: { lat: number; lng: number };
  prefersOnline: boolean;
  prefersInPerson: boolean;
  maxTravelDistance?: number;
}

export interface HealthFundFeature {
  primaryFund?: string;
  acceptedFunds: string[];
  organizationCodes: string[];
  acceptsPrivate: boolean;
}

export interface TherapeuticNeedProfile {
  // Core needs mapped from X-Factor
  needsHighStructure: boolean;
  needsEmotionalSupport: boolean;
  needsDirectiveApproach: boolean;
  needsVerbalProcessing: boolean;

  // Specific indicators
  traumaIndicators: boolean;
  militaryRelatedNeeds: boolean;
  sleepIssues: boolean;
  highStress: boolean;

  // Intensity
  overallIntensity: number;
}

export interface ConstraintProfile {
  // Hard constraints
  healthFundRequired: boolean;
  onlineOnly: boolean;
  inPersonOnly: boolean;
  specificCityRequired: boolean;

  // Soft constraints
  genderPreference?: string;
  languageRequirements: string[];
  maxPrice?: number;
  scheduleConstraints: ScheduleConstraint[];

  // Flexibility scores
  geographicFlexibility: number;
  scheduleFlexibility: number;
  budgetFlexibility: number;
}

export interface ScheduleConstraint {
  preferredDays: string[];
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
}

export interface PreferenceProfile {
  // Therapy preferences
  preferredApproaches: string[];
  preferredSpecializations: string[];

  // Style preferences
  preferredGender?: string;
  preferredExperienceLevel?: 'junior' | 'mid' | 'senior';

  // Weights (importance to patient)
  approachImportance: number;
  experienceImportance: number;
  genderImportance: number;
}

export interface ExpertiseProfile {
  approaches: string[];
  specializations: string[];

  // Strength indicators
  primaryApproach?: string;
  primarySpecializations: string[];

  // Experience level
  yearsOfExperience: number;
  experienceLevel: 'junior' | 'mid' | 'senior';

  // Specific capabilities
  traumaExpertise: boolean;
  militaryExpertise: boolean;
  childrenExpertise: boolean;
}

export interface AvailabilityProfile {
  totalWeeklySlots: number;
  onlineSlots: number;
  inPersonSlots: number;

  // By day
  slotsByDay: Record<string, number>;

  // Flexibility
  offersBothFormats: boolean;
  hasEveningSlots: boolean;
  hasWeekendSlots: boolean;
}

export interface CapacityProfile {
  isAccepting: boolean;
  currentLoad: number; // 0-1
  estimatedWaitTime?: number; // days
  responseSpeed: 'fast' | 'normal' | 'slow';
}

// =============================================================================
// SCORING
// =============================================================================

export interface MatchScore {
  overall: number;
  quality: MatchQuality;

  // Component scores
  components: MatchScoreComponents;

  // Constraint satisfaction
  constraintSatisfaction: ConstraintSatisfactionResult;

  // Confidence
  confidence: number;
}

export interface MatchScoreComponents {
  xFactor: ComponentScore;
  healthFund: ComponentScore;
  availability: ComponentScore;
  location: ComponentScore;
  preferences: ComponentScore;
}

export interface ComponentScore {
  score: number;  // 0-100
  weight: number; // 0-1
  weighted: number; // score * weight

  // Sub-components
  breakdown: ScoreBreakdownItem[];

  // Reasons
  positiveFactors: string[];
  negativeFactors: string[];
}

export interface ScoreBreakdownItem {
  key: string;
  label: string;
  labelHe: string;
  score: number;
  maxScore: number;
  contribution: number;
  reason?: string;
  reasonHe?: string;
}

export interface ConstraintSatisfactionResult {
  allSatisfied: boolean;
  satisfiedConstraints: string[];
  unsatisfiedConstraints: ConstraintViolation[];
  partiallyMetConstraints: PartialConstraint[];
}

export interface ConstraintViolation {
  constraintType: string;
  description: string;
  descriptionHe: string;
  severity: 'hard' | 'soft';
  impact: number; // Score reduction
}

export interface PartialConstraint {
  constraintType: string;
  satisfactionLevel: number; // 0-1
  description: string;
  descriptionHe: string;
}

export type MatchQuality = 'excellent' | 'great' | 'good' | 'moderate' | 'low';

// =============================================================================
// EXPLAINABILITY
// =============================================================================

export interface MatchExplanation {
  // Summary
  summaryEn: string;
  summaryHe: string;

  // Top reasons (positive)
  topReasons: MatchReason[];

  // Concerns (if any)
  concerns: MatchConcern[];

  // Insights
  insights: MatchInsight[];

  // Component explanations
  componentExplanations: ComponentExplanation[];
}

export interface MatchReason {
  category: string;
  reasonEn: string;
  reasonHe: string;
  importance: 'high' | 'medium' | 'low';
  icon?: string;
}

export interface MatchConcern {
  category: string;
  concernEn: string;
  concernHe: string;
  severity: 'warning' | 'info';
  suggestion?: string;
  suggestionHe?: string;
}

export interface MatchInsight {
  insightEn: string;
  insightHe: string;
  type: 'compatibility' | 'recommendation' | 'context';
}

export interface ComponentExplanation {
  component: string;
  score: number;
  explanationEn: string;
  explanationHe: string;
  details: string[];
  detailsHe: string[];
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface MatchingConfig {
  id: string;
  name: string;

  // Core weights
  weights: MatchingWeights;

  // Thresholds
  thresholds: MatchingThresholds;

  // Feature flags
  featureFlags: MatchingFeatureFlags;

  // Algorithm parameters
  parameters: MatchingParameters;
}

export interface MatchingWeights {
  xFactor: number;
  healthFund: number;
  availability: number;
  location: number;
  preferences: number;

  // Sub-weights
  xFactorSubWeights?: XFactorSubWeights;
  preferenceSubWeights?: PreferenceSubWeights;
}

export interface XFactorSubWeights {
  openness: number;
  emotionalIntensity: number;
  structurePreference: number;
  relationshipStyle: number;
  communicationStyle: number;
  changeReadiness: number;
  militaryStress: number;
  stressLevel: number;
}

export interface PreferenceSubWeights {
  approach: number;
  gender: number;
  language: number;
  experience: number;
}

export interface MatchingThresholds {
  minimumScore: number;
  excellent: number;
  great: number;
  good: number;
  moderate: number;
}

export interface MatchingFeatureFlags {
  enableMilitaryBoost: boolean;
  enableUrgencyBoost: boolean;
  enablePerformanceBoost: boolean;
  enableCapacityPenalty: boolean;
  enableDistanceDecay: boolean;
}

export interface MatchingParameters {
  // Distance
  distanceDecayRate: number;
  maxDistance: number;

  // Urgency
  urgencyBoostFactor: number;
  urgencyThreshold: number;

  // Military
  militaryBoostFactor: number;

  // Performance
  performanceBoostFactor: number;
  performanceThreshold: number;

  // Schedule
  scheduleOverlapMinimum: number;
}

// =============================================================================
// MATCHING RESULTS
// =============================================================================

export interface MatchResult {
  patientId: string;
  therapistId: string;

  // Scores
  score: MatchScore;

  // Explanation
  explanation: MatchExplanation;

  // Metadata
  metadata: MatchMetadata;
}

export interface MatchMetadata {
  algorithmVersion: string;
  configId: string;
  computedAt: Date;

  // Input snapshots for reproducibility
  patientProfileVersion?: number;
  xFactorProfileVersion?: number;
  therapistProfileVersion?: number;

  // Processing info
  processingTimeMs?: number;
  featureExtractionTimeMs?: number;
  scoringTimeMs?: number;
}

export interface MatchListResult {
  patientId: string;
  matches: RankedMatch[];

  // Stats
  totalCandidates: number;
  filteredOut: number;

  // Metadata
  computedAt: Date;
  algorithmVersion: string;
}

export interface RankedMatch extends MatchResult {
  rank: number;
}

// =============================================================================
// ENGINE INTERFACES
// =============================================================================

export interface IFeatureExtractor {
  extractPatientFeatures(
    patient: PatientProfile,
    xFactor: XFactorProfile
  ): PatientFeatures;

  extractTherapistFeatures(
    therapist: TherapistProfile
  ): TherapistFeatures;

  computeDerivedFeatures(
    patient: PatientFeatures,
    therapist: TherapistFeatures
  ): DerivedFeatures;
}

export interface IScorer {
  computeScore(
    features: ExtractedFeatures,
    config: MatchingConfig
  ): MatchScore;
}

export interface IExplainer {
  generateExplanation(
    features: ExtractedFeatures,
    score: MatchScore,
    patient: PatientProfile,
    therapist: TherapistProfile
  ): MatchExplanation;
}

export interface IConstraintChecker {
  checkConstraints(
    patient: PatientProfile,
    therapist: TherapistProfile,
    features: ExtractedFeatures
  ): ConstraintSatisfactionResult;
}

export interface IMatchingEngine {
  computeMatch(
    patient: PatientProfile,
    xFactor: XFactorProfile,
    therapist: TherapistProfile,
    config?: MatchingConfig
  ): MatchResult;

  computeMatches(
    patient: PatientProfile,
    xFactor: XFactorProfile,
    therapists: TherapistProfile[],
    config?: MatchingConfig
  ): MatchListResult;
}
