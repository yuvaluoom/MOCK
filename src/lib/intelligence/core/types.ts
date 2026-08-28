/**
 * Core Intelligence Layer Types
 *
 * Defines the foundational types for the matching intelligence system.
 * This layer is completely abstracted from UI and can be replaced with
 * ML models without affecting the rest of the application.
 */

// ============================================================================
// PROFILE LAYERS
// ============================================================================

/**
 * User Profile Layer - Basic identity and demographics
 * This is public-facing data that users control
 */
export interface UserProfileData {
  userId: string;
  role: 'PATIENT' | 'THERAPIST';
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  language: string[];
  createdAt: Date;
  lastActiveAt?: Date;
}

/**
 * Client Clinical Profile - Required intake data
 * Mandatory for matching to function
 */
export interface ClientClinicalProfile {
  clientId: string;
  primaryConcerns: string[];
  sessionFormat: 'ONLINE' | 'IN_PERSON' | 'BOTH';
  healthFund?: string;
  locationPreference?: string;
  availabilitySlots: AvailabilitySlot[];
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  previousTherapyExperience?: boolean;
  intakeCompletedAt: Date;
}

/**
 * Client Preference Profile - Optional preferences
 * Enhances matching but not required
 */
export interface ClientPreferenceProfile {
  clientId: string;
  therapistGenderPreference?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'NO_PREFERENCE';
  therapistAgePreference?: 'YOUNGER' | 'SIMILAR' | 'OLDER' | 'NO_PREFERENCE';
  experienceLevelPreference?: 'JUNIOR' | 'MID' | 'SENIOR' | 'NO_PREFERENCE';
  approachPreferences: string[];
  priceRange?: { min: number; max: number };
  sessionDurationPreference?: number;
}

/**
 * Client X-Factor Profile - Optional psychological/behavioral data
 * Completely optional - system works without it
 * Stored separately for GDPR compliance
 */
export interface ClientXFactorProfile {
  clientId: string;
  consentGiven: boolean;
  consentTimestamp?: Date;

  // Communication & Personality
  communicationStyle?: number; // 1-5 scale
  emotionalExpression?: number;
  structurePreference?: number;
  feedbackStyle?: number;
  pacePreference?: number;

  // Lifestyle Factors
  sleepQuality?: number;
  exerciseFrequency?: number;
  socialSupport?: number;
  stressLevel?: number;

  // Motivation & Readiness
  changeReadiness?: number;
  selfAwareness?: number;
  therapyExpectations?: string;
}

/**
 * Therapist Professional Profile
 */
export interface TherapistProfessionalProfile {
  therapistId: string;
  title: string;
  licenseNumber: string;
  yearsOfExperience: number;
  specializations: SpecializationEntry[];
  approaches: ApproachEntry[];
  education: string[];
  offersOnline: boolean;
  offersInPerson: boolean;
  acceptedHealthFunds: string[];
  sessionPrice: number;
  sessionDuration: number;
  languages: LanguageEntry[];
  availabilitySlots: AvailabilitySlot[];
  isAcceptingPatients: boolean;
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface AvailabilitySlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // HH:mm
  endTime: string;
}

export interface SpecializationEntry {
  name: string;
  isPrimary: boolean;
  yearsInSpecialization?: number;
}

export interface ApproachEntry {
  name: string;
  proficiencyLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export interface LanguageEntry {
  language: string;
  proficiency: 'NATIVE' | 'FLUENT' | 'CONVERSATIONAL' | 'BASIC';
}

// ============================================================================
// BEHAVIORAL DATA LAYER
// ============================================================================

/**
 * User Engagement Metrics - Collected automatically
 * Used for behavioral learning and internal scoring
 */
export interface UserEngagementMetrics {
  userId: string;
  role: 'PATIENT' | 'THERAPIST';

  // Session Metrics
  totalSessionsBooked: number;
  totalSessionsCompleted: number;
  totalSessionsCancelled: number;
  averageSessionRating?: number;

  // Platform Engagement
  profileViewCount: number;
  matchViewCount: number;
  messagesSent: number;
  averageResponseTimeMs?: number;
  lastActivityAt: Date;

  // For Patients
  therapistsContacted?: number;
  matchesViewed?: number;
  matchesFavorited?: number;
  matchesHidden?: number;

  // For Therapists
  patientInquiriesReceived?: number;
  patientInquiriesAccepted?: number;
  averagePatientRetention?: number;
}

/**
 * Match Outcome Tracking - For learning
 */
export interface MatchOutcome {
  matchId: string;
  clientId: string;
  therapistId: string;
  matchScore: number;
  algorithmVersion: string;

  // Engagement
  wasViewed: boolean;
  viewedAt?: Date;
  wasFavorited: boolean;
  wasContacted: boolean;
  contactedAt?: Date;

  // Conversion
  sessionBooked: boolean;
  sessionBookedAt?: Date;
  firstSessionCompleted: boolean;
  firstSessionCompletedAt?: Date;

  // Retention (30-day lookback)
  sessionsIn30Days: number;
  isOngoingRelationship: boolean;

  // Feedback
  clientFeedbackScore?: number;
  therapistFeedbackScore?: number;
  clientFeedbackText?: string;
}

/**
 * Therapist Performance Metrics - Internal use only
 * Not exposed to users
 */
export interface TherapistPerformanceMetrics {
  therapistId: string;

  // Response Metrics
  averageResponseTimeHours: number;
  responseRate: number; // 0-1

  // Conversion Metrics
  inquiryToBookingRate: number;
  bookingToCompletionRate: number;

  // Retention Metrics
  averageClientTenure: number; // months
  clientRetentionRate: number;

  // Quality Metrics
  averageClientSatisfaction: number; // 1-5
  feedbackCount: number;
  complaintCount: number;

  // Calculated Scores (internal)
  overallPerformanceScore: number; // 0-100
  reliabilityScore: number;
  engagementScore: number;
}

// ============================================================================
// SCORING TYPES
// ============================================================================

/**
 * Match Score Result - Full breakdown
 */
export interface MatchScoreResult {
  matchId: string;
  clientId: string;
  therapistId: string;

  // Final Scores
  publicScore: number; // 0-100, shown to users
  internalScore: number; // 0-100, used for ranking (hidden)

  // Component Breakdown (public)
  publicBreakdown: {
    coreCompatibility: number;
    preferenceMatch: number;
    xFactorMatch?: number;
  };

  // Internal Breakdown (hidden)
  internalBreakdown: {
    therapistPerformance: number;
    predictedConversion: number;
    platformFit: number;
    behavioralMatch: number;
  };

  // Quality Assessment
  matchQuality: 'EXCELLENT' | 'GREAT' | 'GOOD' | 'MODERATE' | 'LOW';
  confidence: number; // 0-1, how confident we are in this match

  // Metadata
  algorithmVersion: string;
  computedAt: Date;
  xFactorUsed: boolean;
  internalFactorsUsed: boolean;
}

/**
 * Scoring Weights Configuration
 */
export interface ScoringWeights {
  // Public weights (visible in config)
  public: {
    coreCompatibility: number;
    preferenceMatch: number;
    xFactorMatch: number;
  };

  // Internal weights (hidden)
  internal: {
    therapistPerformance: number;
    predictedConversion: number;
    platformFit: number;
    behavioralMatch: number;
  };

  // How much internal vs public affects final ranking
  publicToInternalRatio: number; // 0-1, e.g., 0.7 means 70% public, 30% internal
}

// ============================================================================
// EXPLANATION TYPES
// ============================================================================

/**
 * Match Explanation - User-facing
 */
export interface MatchExplanation {
  matchId: string;
  summary: string;
  summaryHebrew: string;

  // Positive factors (shown to user)
  positiveFactors: ExplanationFactor[];

  // Neutral factors
  neutralFactors: ExplanationFactor[];

  // Considerations (gentle warnings)
  considerations: ExplanationFactor[];

  // Never expose internal scoring reasons
}

export interface ExplanationFactor {
  category: string;
  description: string;
  descriptionHebrew: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  icon?: string;
}

// ============================================================================
// ML INTEGRATION TYPES
// ============================================================================

/**
 * Training Data Point for ML model
 */
export interface MLTrainingDataPoint {
  // Features
  clientFeatures: Record<string, number>;
  therapistFeatures: Record<string, number>;
  matchFeatures: Record<string, number>;

  // Labels
  wasSuccessful: boolean;
  engagementScore: number;
  retentionDays: number;

  // Metadata
  matchId: string;
  timestamp: Date;
  algorithmVersion: string;
}

/**
 * ML Model Prediction
 */
export interface MLPrediction {
  matchId: string;
  predictedSuccessRate: number; // 0-1
  predictedEngagement: number; // 0-1
  predictedRetention: number; // days
  confidence: number;
  modelVersion: string;
}
