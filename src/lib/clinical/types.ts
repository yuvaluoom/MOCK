/**
 * MatchMind Clinical Documentation System - Type Definitions
 *
 * Types for session documentation, clinical notes, and compliance.
 * Designed for Israeli healthcare regulations and GDPR compliance.
 *
 * SECURITY CLASSIFICATION: HIGHLY SENSITIVE MEDICAL DATA
 */

// =============================================================================
// ENUMS
// =============================================================================

export type SessionType =
  | 'IN_PERSON'      // פגישה פרונטלית
  | 'REMOTE_VIDEO'   // טיפול מרחוק - וידאו
  | 'REMOTE_PHONE'   // טיפול מרחוק - טלפון
  | 'HOME_VISIT';    // ביקור בית

export type SessionStatus =
  | 'SCHEDULED'      // מתוכננת
  | 'IN_PROGRESS'    // בתהליך
  | 'COMPLETED'      // הושלמה
  | 'CANCELLED'      // בוטלה
  | 'NO_SHOW';       // לא הגיע

export type DocumentationStatus =
  | 'DRAFT'          // טיוטה - ניתן לעריכה
  | 'SUBMITTED'      // הוגש - נעול לעריכה רגילה
  | 'AMENDED'        // תוקן - נעול עם תיקון מתועד
  | 'LOCKED';        // נעול סופית

export type TherapeuticMethod =
  | 'CBT'                    // טיפול קוגניטיבי-התנהגותי
  | 'DBT'                    // טיפול דיאלקטי-התנהגותי
  | 'PSYCHODYNAMIC'          // פסיכודינמי
  | 'HUMANISTIC'             // הומניסטי
  | 'EMDR'                   // EMDR
  | 'MINDFULNESS'            // מיינדפולנס
  | 'FAMILY_THERAPY'         // טיפול משפחתי
  | 'COUPLES_THERAPY'        // טיפול זוגי
  | 'PLAY_THERAPY'           // טיפול במשחק
  | 'ART_THERAPY'            // טיפול באמנות
  | 'NARRATIVE'              // טיפול נרטיבי
  | 'SOLUTION_FOCUSED'       // ממוקד פתרון
  | 'INTEGRATIVE'            // אינטגרטיבי
  | 'OTHER';                 // אחר

export type ProgressIndicator =
  | 'SIGNIFICANT_IMPROVEMENT'   // שיפור משמעותי
  | 'MODERATE_IMPROVEMENT'      // שיפור מתון
  | 'SLIGHT_IMPROVEMENT'        // שיפור קל
  | 'NO_CHANGE'                 // ללא שינוי
  | 'SLIGHT_DECLINE'            // הידרדרות קלה
  | 'MODERATE_DECLINE'          // הידרדרות מתונה
  | 'SIGNIFICANT_DECLINE'       // הידרדרות משמעותית
  | 'UNABLE_TO_ASSESS';         // לא ניתן להעריך

export type RiskLevel =
  | 'NONE'           // ללא סיכון
  | 'LOW'            // סיכון נמוך
  | 'MODERATE'       // סיכון בינוני
  | 'HIGH'           // סיכון גבוה
  | 'CRITICAL';      // סיכון קריטי - דורש התערבות מיידית

export type ConsentType =
  | 'TREATMENT'           // הסכמה לטיפול
  | 'DOCUMENTATION'       // הסכמה לתיעוד
  | 'DATA_SHARING'        // הסכמה לשיתוף נתונים
  | 'RESEARCH'            // הסכמה למחקר
  | 'RECORDING';          // הסכמה להקלטה

export type ExportFormat = 'JSON' | 'PDF' | 'HL7_FHIR';

export type ComplianceFlagType =
  | 'OVERDUE'                   // תיעוד באיחור
  | 'INCOMPLETE'                // תיעוד לא שלם
  | 'RISK_NOT_ASSESSED'         // הערכת סיכון חסרה
  | 'CONSENT_MISSING'           // הסכמה חסרה
  | 'CONSENT_EXPIRED'           // הסכמה פגה
  | 'REVIEW_OVERDUE';           // סקירה באיחור

export type ComplianceFlagSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

// =============================================================================
// SESSION RECORD
// =============================================================================

export interface SessionRecord {
  id: string;
  therapistId: string;
  patientId: string;
  treatmentPlanId?: string;

  // Session metadata
  sessionNumber: number;
  sessionDate: Date;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  actualDurationMinutes?: number;

  sessionType: SessionType;
  sessionStatus: SessionStatus;
  documentationStatus: DocumentationStatus;

  // Versioning
  currentVersion: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  lockedAt?: Date;
  lockedBy?: string;

  // Compliance
  documentationDeadline: Date;
  isOverdue: boolean;
}

export interface SessionRecordWithDetails extends SessionRecord {
  clinicalNotes?: ClinicalNotes;
  patientSummary?: PatientSessionSummary;
  complianceFlags: ComplianceFlag[];
  therapist?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// =============================================================================
// CLINICAL NOTES (DECRYPTED VIEW)
// =============================================================================

export interface ClinicalNotes {
  id: string;
  sessionRecordId: string;

  // Clinical content (decrypted)
  presentingIssue?: string;
  clinicalSummary?: string;
  assessment?: ClinicalAssessment;
  interventions?: string;
  patientResponse?: string;
  followUp?: FollowUpRecommendations;

  // Structured fields
  therapeuticMethods: TherapeuticMethod[];
  progressIndicator?: ProgressIndicator;
  riskLevel: RiskLevel;
  riskAssessmentDate?: Date;

  // Diagnostic codes
  icdCodes: string[];
  dsmCodes: string[];

  // Session planning
  homeworkAssigned: boolean;
  nextSessionFocus?: string;
  recommendedInterval?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicalAssessment {
  mentalStatusExam?: MentalStatusExam;
  functionalAssessment?: FunctionalAssessment;
  safetyAssessment?: SafetyAssessment;
  additionalNotes?: string;
}

export interface MentalStatusExam {
  appearance?: string;
  behavior?: string;
  speech?: string;
  mood?: string;
  affect?: string;
  thoughtProcess?: string;
  thoughtContent?: string;
  perceptions?: string;
  cognition?: string;
  insight?: string;
  judgment?: string;
}

export interface FunctionalAssessment {
  dailyFunctioning?: string;
  socialFunctioning?: string;
  occupationalFunctioning?: string;
  selfCare?: string;
}

export interface SafetyAssessment {
  suicidalIdeation: boolean;
  suicidalPlan: boolean;
  suicidalIntent: boolean;
  homicidalIdeation: boolean;
  selfHarmBehavior: boolean;
  protectiveFactors?: string[];
  riskFactors?: string[];
  safetyPlan?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isAwareOfTreatment: boolean;
}

export interface FollowUpRecommendations {
  nextSessionDate?: Date;
  frequency?: string;
  homeworkTasks?: HomeworkTask[];
  referrals?: Referral[];
  additionalRecommendations?: string;
}

export interface HomeworkTask {
  title: string;
  description?: string;
  dueDate?: Date;
}

export interface Referral {
  type: string;
  specialist?: string;
  reason: string;
  urgency: 'routine' | 'soon' | 'urgent';
}

// =============================================================================
// PATIENT-VISIBLE SUMMARY
// =============================================================================

export interface PatientSessionSummary {
  id: string;
  sessionRecordId: string;

  // Content
  summaryHebrew?: string;
  topicsDiscussed: string[];
  keyTakeaways: string[];
  homework: PatientHomework[];

  // Visibility
  isVisibleToPatient: boolean;
  sharedAt?: Date;
  sharedByTherapist: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface PatientHomework {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  patientNotes?: string;
}

// =============================================================================
// TREATMENT PLAN
// =============================================================================

export interface TreatmentPlan {
  id: string;
  therapistId: string;
  patientId: string;

  title?: string;
  goals: TreatmentGoal[];

  startDate: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;

  isActive: boolean;
  nextReviewDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentGoal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  status: 'not_started' | 'in_progress' | 'achieved' | 'revised' | 'discontinued';
  progressPercentage?: number;
  milestones?: GoalMilestone[];
}

export interface GoalMilestone {
  title: string;
  isAchieved: boolean;
  achievedDate?: Date;
}

// =============================================================================
// CONSENT
// =============================================================================

export interface PatientConsent {
  id: string;
  patientId: string;
  therapistId: string;
  consentType: ConsentType;

  isGranted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  expiresAt?: Date;

  scope?: string;
  signatureMethod?: string;
  signatureReference?: string;

  witnessName?: string;
  witnessRole?: string;
  consentDocumentUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// COMPLIANCE
// =============================================================================

export interface ComplianceFlag {
  id: string;
  sessionRecordId: string;
  flagType: ComplianceFlagType;
  flagSeverity: ComplianceFlagSeverity;
  description: string;

  isResolved: boolean;
  resolvedAt?: Date;
  resolvedById?: string;
  resolutionNotes?: string;

  createdAt: Date;
}

export interface ComplianceStats {
  totalSessions: number;
  documentedOnTime: number;
  overdueCount: number;
  draftCount: number;
  incompleteCount: number;
  complianceRate: number;
  averageDocumentationTime: number; // minutes after session
}

export interface TherapistComplianceReport {
  therapistId: string;
  therapistName: string;
  period: {
    start: Date;
    end: Date;
  };
  stats: ComplianceStats;
  outstandingFlags: ComplianceFlag[];
  recentSessions: SessionRecordSummary[];
}

export interface SessionRecordSummary {
  id: string;
  sessionDate: Date;
  patientName: string;
  documentationStatus: DocumentationStatus;
  isOverdue: boolean;
  hasFlags: boolean;
}

// =============================================================================
// AUDIT
// =============================================================================

export interface ClinicalAuditEntry {
  id: string;
  userId: string;
  userRole: string;
  userName: string;

  entityType: string;
  entityId: string;
  patientId?: string;

  action: ClinicalAuditAction;
  actionDetails?: Record<string, unknown>;

  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  wasSuccessful: boolean;
  failureReason?: string;

  occurredAt: Date;
}

export type ClinicalAuditAction =
  | 'VIEW_SESSION'
  | 'CREATE_SESSION'
  | 'UPDATE_SESSION'
  | 'SUBMIT_SESSION'
  | 'AMEND_SESSION'
  | 'LOCK_SESSION'
  | 'VIEW_CLINICAL_NOTES'
  | 'UPDATE_CLINICAL_NOTES'
  | 'EXPORT_SESSION'
  | 'PRINT_SESSION'
  | 'SHARE_WITH_PATIENT'
  | 'VIEW_TREATMENT_PLAN'
  | 'UPDATE_TREATMENT_PLAN';

// =============================================================================
// EXPORT
// =============================================================================

export interface SessionExport {
  id: string;
  sessionRecordId: string;
  format: ExportFormat;
  exportedById: string;
  exportedByName: string;
  purpose: string;
  recipientType?: string;
  recipientDetails?: string;
  consentId?: string;
  fileReference?: string;
  fileHash?: string;
  expiresAt?: Date;
  wasDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
}

export interface ExportRequest {
  sessionRecordId: string;
  format: ExportFormat;
  purpose: string;
  recipientType?: string;
  recipientDetails?: string;
  consentId?: string;
  includePatientSummary?: boolean;
  redactSensitiveInfo?: boolean;
}

export interface ExportResult {
  exportId: string;
  format: ExportFormat;
  content?: string;      // For JSON
  fileUrl?: string;      // For PDF
  fileHash: string;
  expiresAt: Date;
}

// =============================================================================
// FORM INPUT TYPES
// =============================================================================

export interface CreateSessionInput {
  patientId: string;
  treatmentPlanId?: string;
  sessionDate: Date;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  sessionType: SessionType;
}

export interface UpdateSessionMetadataInput {
  sessionId: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  sessionStatus?: SessionStatus;
}

export interface SaveClinicalNotesInput {
  sessionRecordId: string;
  presentingIssue?: string;
  clinicalSummary?: string;
  assessment?: ClinicalAssessment;
  interventions?: string;
  patientResponse?: string;
  followUp?: FollowUpRecommendations;
  therapeuticMethods?: TherapeuticMethod[];
  progressIndicator?: ProgressIndicator;
  riskLevel?: RiskLevel;
  icdCodes?: string[];
  dsmCodes?: string[];
  homeworkAssigned?: boolean;
  nextSessionFocus?: string;
  recommendedInterval?: number;
}

export interface SubmitSessionInput {
  sessionRecordId: string;
  finalReview: boolean; // Confirm therapist has reviewed
}

export interface AmendSessionInput {
  sessionRecordId: string;
  amendmentReason: string; // Required explanation
  changes: Partial<SaveClinicalNotesInput>;
}

export interface ShareWithPatientInput {
  sessionRecordId: string;
  summaryHebrew?: string;
  topicsDiscussed?: string[];
  keyTakeaways?: string[];
  homework?: Omit<PatientHomework, 'id' | 'isCompleted' | 'completedAt' | 'patientNotes'>[];
}

// =============================================================================
// VALIDATION
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  messageHe: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  messageHe: string;
  suggestion?: string;
}

// =============================================================================
// LABELS (Hebrew/English)
// =============================================================================

export const SESSION_TYPE_LABELS: Record<SessionType, { en: string; he: string }> = {
  IN_PERSON: { en: 'In-Person', he: 'פגישה פרונטלית' },
  REMOTE_VIDEO: { en: 'Video Call', he: 'שיחת וידאו' },
  REMOTE_PHONE: { en: 'Phone Call', he: 'שיחת טלפון' },
  HOME_VISIT: { en: 'Home Visit', he: 'ביקור בית' },
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, { en: string; he: string }> = {
  SCHEDULED: { en: 'Scheduled', he: 'מתוכננת' },
  IN_PROGRESS: { en: 'In Progress', he: 'בתהליך' },
  COMPLETED: { en: 'Completed', he: 'הושלמה' },
  CANCELLED: { en: 'Cancelled', he: 'בוטלה' },
  NO_SHOW: { en: 'No Show', he: 'לא הגיע' },
};

export const DOCUMENTATION_STATUS_LABELS: Record<DocumentationStatus, { en: string; he: string }> = {
  DRAFT: { en: 'Draft', he: 'טיוטה' },
  SUBMITTED: { en: 'Submitted', he: 'הוגש' },
  AMENDED: { en: 'Amended', he: 'תוקן' },
  LOCKED: { en: 'Locked', he: 'נעול' },
};

export const THERAPEUTIC_METHOD_LABELS: Record<TherapeuticMethod, { en: string; he: string }> = {
  CBT: { en: 'Cognitive Behavioral Therapy', he: 'טיפול קוגניטיבי-התנהגותי' },
  DBT: { en: 'Dialectical Behavior Therapy', he: 'טיפול דיאלקטי-התנהגותי' },
  PSYCHODYNAMIC: { en: 'Psychodynamic', he: 'פסיכודינמי' },
  HUMANISTIC: { en: 'Humanistic', he: 'הומניסטי' },
  EMDR: { en: 'EMDR', he: 'EMDR' },
  MINDFULNESS: { en: 'Mindfulness', he: 'מיינדפולנס' },
  FAMILY_THERAPY: { en: 'Family Therapy', he: 'טיפול משפחתי' },
  COUPLES_THERAPY: { en: 'Couples Therapy', he: 'טיפול זוגי' },
  PLAY_THERAPY: { en: 'Play Therapy', he: 'טיפול במשחק' },
  ART_THERAPY: { en: 'Art Therapy', he: 'טיפול באמנות' },
  NARRATIVE: { en: 'Narrative Therapy', he: 'טיפול נרטיבי' },
  SOLUTION_FOCUSED: { en: 'Solution-Focused', he: 'ממוקד פתרון' },
  INTEGRATIVE: { en: 'Integrative', he: 'אינטגרטיבי' },
  OTHER: { en: 'Other', he: 'אחר' },
};

export const PROGRESS_INDICATOR_LABELS: Record<ProgressIndicator, { en: string; he: string }> = {
  SIGNIFICANT_IMPROVEMENT: { en: 'Significant Improvement', he: 'שיפור משמעותי' },
  MODERATE_IMPROVEMENT: { en: 'Moderate Improvement', he: 'שיפור מתון' },
  SLIGHT_IMPROVEMENT: { en: 'Slight Improvement', he: 'שיפור קל' },
  NO_CHANGE: { en: 'No Change', he: 'ללא שינוי' },
  SLIGHT_DECLINE: { en: 'Slight Decline', he: 'הידרדרות קלה' },
  MODERATE_DECLINE: { en: 'Moderate Decline', he: 'הידרדרות מתונה' },
  SIGNIFICANT_DECLINE: { en: 'Significant Decline', he: 'הידרדרות משמעותית' },
  UNABLE_TO_ASSESS: { en: 'Unable to Assess', he: 'לא ניתן להעריך' },
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, { en: string; he: string; color: string }> = {
  NONE: { en: 'None', he: 'ללא סיכון', color: 'green' },
  LOW: { en: 'Low', he: 'נמוך', color: 'blue' },
  MODERATE: { en: 'Moderate', he: 'בינוני', color: 'yellow' },
  HIGH: { en: 'High', he: 'גבוה', color: 'orange' },
  CRITICAL: { en: 'Critical', he: 'קריטי', color: 'red' },
};
