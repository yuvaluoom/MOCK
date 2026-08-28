/**
 * MatchMind Clinical Documentation System
 *
 * A medical-grade session documentation system designed for
 * Israeli healthcare regulations and GDPR compliance.
 *
 * @example
 * ```typescript
 * import {
 *   type SessionRecord,
 *   type ClinicalNotes,
 *   canAccessSession,
 *   validateForSubmission,
 * } from '@/lib/clinical';
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export type {
  // Enums
  SessionType,
  SessionStatus,
  DocumentationStatus,
  TherapeuticMethod,
  ProgressIndicator,
  RiskLevel,
  ConsentType,
  ExportFormat,
  ComplianceFlagType,
  ComplianceFlagSeverity,
  ClinicalAuditAction,

  // Core Records
  SessionRecord,
  SessionRecordWithDetails,
  ClinicalNotes,
  ClinicalAssessment,
  MentalStatusExam,
  FunctionalAssessment,
  SafetyAssessment,
  EmergencyContact,
  FollowUpRecommendations,
  HomeworkTask,
  Referral,

  // Patient-Facing
  PatientSessionSummary,
  PatientHomework,

  // Treatment Plans
  TreatmentPlan,
  TreatmentGoal,
  GoalMilestone,

  // Consent
  PatientConsent,

  // Compliance
  ComplianceFlag,
  ComplianceStats,
  TherapistComplianceReport,
  SessionRecordSummary,

  // Audit
  ClinicalAuditEntry,

  // Export
  SessionExport,
  ExportRequest,
  ExportResult,

  // Form Inputs
  CreateSessionInput,
  UpdateSessionMetadataInput,
  SaveClinicalNotesInput,
  SubmitSessionInput,
  AmendSessionInput,
  ShareWithPatientInput,

  // Validation
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types';

// Labels
export {
  SESSION_TYPE_LABELS,
  SESSION_STATUS_LABELS,
  DOCUMENTATION_STATUS_LABELS,
  THERAPEUTIC_METHOD_LABELS,
  PROGRESS_INDICATOR_LABELS,
  RISK_LEVEL_LABELS,
} from './types';

// =============================================================================
// SECURITY
// =============================================================================

export {
  // Access Control
  canAccessSession,
  canPatientViewSummary,
  canExportSession,
  verifyConsent,
  toComplianceView,
  createAuditLogEntry,
  type AccessContext,
  type AccessDecision,
  type UserRole,
  type ClinicalPermission,
  type ComplianceViewSession,
  type AuditLogInput,
} from './security/access-control';

export {
  // Encryption
  encryptField,
  decryptField,
  encryptClinicalNotes,
  decryptClinicalNotes,
  encryptSnapshot,
  decryptSnapshot,
  createVersionSignature,
  verifyVersionChain,
  createFileHash,
  verifyFileHash,
  generateSecureToken,
  generateAuditSessionId,
  type EncryptedData,
  type EncryptedField,
  type EncryptionContext,
  type ClinicalNotesEncrypted,
  type ClinicalNotesPlaintext,
} from './security/encryption';

// =============================================================================
// VALIDATION
// =============================================================================

export {
  validateForSubmission,
  validateForAutoSave,
  validateSafetyAssessment,
  getCompletionStatus,
  getFieldLabelHe,
} from './validation/notes-validator';

// =============================================================================
// EXPORT
// =============================================================================

export {
  exportToJson,
  exportToPdf,
  exportToFhir,
  validateExportRequest,
  createExportAuditRecord,
  type ExportOptions,
  type ExportMetadata,
} from './export/export-service';
