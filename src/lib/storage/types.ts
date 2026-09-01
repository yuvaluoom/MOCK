/**
 * MatchMind Document Management System — Type Definitions
 *
 * Security classification follows Israeli Privacy Protection Regulations (5741-1981)
 * and Health Ministry guidelines for digital health records.
 */

// =============================================================================
// DOCUMENT CLASSIFICATION
// =============================================================================

export type DocumentCategory =
  | 'CREDENTIAL'    // Therapist practice documents (license, diploma, insurance)
  | 'CLINICAL'      // Session-related clinical files (scanned notes, assessments)
  | 'CONSENT'       // Patient consent forms
  | 'IDENTITY'      // ID verification documents
  | 'ATTACHMENT';   // General attachments

export type CredentialType =
  | 'LICENSE'           // Practice license (רישיון עיסוק)
  | 'DIPLOMA'           // Academic diploma
  | 'CERTIFICATION'     // Professional certification
  | 'INSURANCE'         // Professional liability insurance
  | 'SUPERVISION'       // Supervision certificate
  | 'CONTINUING_ED';    // Continuing education certificate

export type ClinicalDocType =
  | 'SESSION_NOTES'     // Scanned/uploaded session notes
  | 'ASSESSMENT'        // Clinical assessment documents
  | 'TREATMENT_PLAN'    // Treatment plan files
  | 'REFERRAL'          // Referral letters
  | 'DISCHARGE_SUMMARY' // Discharge summary
  | 'LAB_RESULTS';      // Lab/test results

export type ConsentDocType =
  | 'INFORMED_CONSENT'  // Informed consent for treatment
  | 'PRIVACY_CONSENT'   // Privacy & data processing consent
  | 'RECORDING_CONSENT'; // Session recording consent

export type SecurityLevel =
  | 'STANDARD'          // General business documents
  | 'SENSITIVE'         // Contains personal information
  | 'HIGHLY_SENSITIVE'; // Contains medical/clinical data (PHI)

export type DocumentStatus =
  | 'UPLOADING'         // Upload in progress
  | 'PENDING_REVIEW'    // Uploaded, awaiting admin review
  | 'APPROVED'          // Reviewed and approved
  | 'REJECTED'          // Reviewed and rejected
  | 'REQUIRES_UPDATE'   // Approved but needs updated version
  | 'EXPIRED'           // Past expiry date
  | 'ARCHIVED';         // Retained but no longer active

// =============================================================================
// STORED DOCUMENT
// =============================================================================

export interface StoredDocument {
  id: string;
  category: DocumentCategory;
  documentType: string; // One of CredentialType | ClinicalDocType | ConsentDocType | 'OTHER'

  // File metadata
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;

  // Ownership & associations
  uploadedBy: string;
  uploaderRole: 'THERAPIST' | 'PATIENT' | 'ADMIN';
  therapistId?: string;
  patientId?: string;
  sessionId?: string;

  // Security
  securityLevel: SecurityLevel;
  encryptionKeyId: string;
  checksum: string;
  isEncrypted: boolean;

  // Status & review
  status: DocumentStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  reviewNotes?: string;

  // Expiry & retention
  expiresAt?: Date;
  retentionDays: number;
  scheduledDeletionAt?: Date;

  // Versioning
  version: number;
  previousVersionId?: string;

  // Timestamps
  uploadedAt: Date;
  updatedAt: Date;
}

// =============================================================================
// DOCUMENT ACCESS LOG (AUDIT TRAIL)
// =============================================================================

export type AuditAction =
  | 'UPLOAD'
  | 'VIEW'
  | 'DOWNLOAD'
  | 'APPROVE'
  | 'REJECT'
  | 'DELETE'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'UPDATE_STATUS'
  | 'SHARE'
  | 'REVOKE_ACCESS';

export interface DocumentAuditEntry {
  id: string;
  documentId: string;
  action: AuditAction;
  performedBy: string;
  performedByRole: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
  timestamp: Date;
}

// =============================================================================
// ACCESS CONTROL
// =============================================================================

export interface DocumentAccessRule {
  documentId: string;
  grantedTo: string;
  grantedToRole: string;
  permissions: Array<'VIEW' | 'DOWNLOAD'>;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  revoked: boolean;
}

// =============================================================================
// UPLOAD / DOWNLOAD CONTRACTS
// =============================================================================

export interface UploadRequest {
  file: {
    name: string;
    size: number;
    type: string;
    content: string; // base64
  };
  category: DocumentCategory;
  documentType: string;
  therapistId?: string;
  patientId?: string;
  sessionId?: string;
  expiresAt?: string; // ISO date
}

export interface UploadResult {
  document: StoredDocument;
  uploadedAt: Date;
}

export interface DocumentFilter {
  category?: DocumentCategory;
  status?: DocumentStatus;
  therapistId?: string;
  patientId?: string;
  sessionId?: string;
  uploadedAfter?: Date;
  uploadedBefore?: Date;
}

// =============================================================================
// PROTOCOL CONFIGURATION
// =============================================================================

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  CREDENTIAL: ['application/pdf', 'image/jpeg', 'image/png'],
  CLINICAL: ['application/pdf', 'image/jpeg', 'image/png'],
  CONSENT: ['application/pdf', 'image/jpeg', 'image/png'],
  IDENTITY: ['application/pdf', 'image/jpeg', 'image/png'],
  ATTACHMENT: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const MAX_FILE_SIZE: Record<string, number> = {
  CREDENTIAL: 10 * 1024 * 1024,   // 10 MB
  CLINICAL: 15 * 1024 * 1024,     // 15 MB
  CONSENT: 5 * 1024 * 1024,       // 5 MB
  IDENTITY: 5 * 1024 * 1024,      // 5 MB
  ATTACHMENT: 20 * 1024 * 1024,   // 20 MB
};

export const SECURITY_LEVELS: Record<string, SecurityLevel> = {
  CREDENTIAL: 'SENSITIVE',
  CLINICAL: 'HIGHLY_SENSITIVE',
  CONSENT: 'SENSITIVE',
  IDENTITY: 'HIGHLY_SENSITIVE',
  ATTACHMENT: 'STANDARD',
};

export const RETENTION_DAYS: Record<string, number> = {
  CREDENTIAL: 365 * 7,     // 7 years after therapist deactivation
  CLINICAL: 365 * 7,       // 7 years per Israeli health record regulations
  CONSENT: 365 * 7,        // 7 years
  IDENTITY: 365 * 3,       // 3 years
  ATTACHMENT: 365 * 2,     // 2 years
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  LICENSE: 'Practice License',
  DIPLOMA: 'Academic Diploma',
  CERTIFICATION: 'Professional Certification',
  INSURANCE: 'Professional Insurance',
  SUPERVISION: 'Supervision Certificate',
  CONTINUING_ED: 'Continuing Education',
  SESSION_NOTES: 'Session Notes',
  ASSESSMENT: 'Clinical Assessment',
  TREATMENT_PLAN: 'Treatment Plan',
  REFERRAL: 'Referral Letter',
  DISCHARGE_SUMMARY: 'Discharge Summary',
  LAB_RESULTS: 'Lab Results',
  INFORMED_CONSENT: 'Informed Consent',
  PRIVACY_CONSENT: 'Privacy Consent',
  RECORDING_CONSENT: 'Recording Consent',
  OTHER: 'Other',
};

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  CREDENTIAL: 'Credentials',
  CLINICAL: 'Clinical Documents',
  CONSENT: 'Consent Forms',
  IDENTITY: 'Identity Verification',
  ATTACHMENT: 'Attachments',
};

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  UPLOADING: 'Uploading',
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REQUIRES_UPDATE: 'Requires Update',
  EXPIRED: 'Expired',
  ARCHIVED: 'Archived',
};
