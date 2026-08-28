/**
 * MatchMind Clinical Documentation - Access Control
 *
 * Strict access control for clinical data.
 * Implements role-based and relationship-based access control.
 *
 * Access Rules:
 * - Therapist: Can only access their own patients' records
 * - Admin: Can see existence and compliance info, NOT clinical content
 * - Patient: Can see shared summaries only
 *
 * SECURITY CLASSIFICATION: CRITICAL
 */

import type {
  SessionRecord,
  ClinicalNotes,
  PatientSessionSummary,
  ClinicalAuditAction,
} from '../types';

// =============================================================================
// TYPES
// =============================================================================

export type UserRole = 'therapist' | 'patient' | 'admin' | 'support';

export interface AccessContext {
  userId: string;
  userRole: UserRole;
  therapistId?: string;   // Set if user is a therapist
  patientId?: string;     // Set if user is a patient
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export type ClinicalPermission =
  | 'session:create'
  | 'session:read'
  | 'session:read_metadata'
  | 'session:update'
  | 'session:submit'
  | 'session:amend'
  | 'session:lock'
  | 'clinical_notes:read'
  | 'clinical_notes:write'
  | 'patient_summary:read'
  | 'patient_summary:write'
  | 'patient_summary:share'
  | 'treatment_plan:read'
  | 'treatment_plan:write'
  | 'compliance:view'
  | 'export:json'
  | 'export:pdf';

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  reasonHe: string;
  requiredPermissions?: ClinicalPermission[];
}

export interface AuditLogInput {
  context: AccessContext;
  action: ClinicalAuditAction;
  entityType: string;
  entityId: string;
  patientId?: string;
  actionDetails?: Record<string, unknown>;
  wasSuccessful: boolean;
  failureReason?: string;
}

// =============================================================================
// ACCESS CONTROL RULES
// =============================================================================

/**
 * Check if a user can access a session record
 */
export function canAccessSession(
  context: AccessContext,
  session: SessionRecord,
  permission: ClinicalPermission
): AccessDecision {
  const { userRole, therapistId, patientId } = context;

  // THERAPIST ACCESS
  if (userRole === 'therapist') {
    // Therapist can only access their own sessions
    if (session.therapistId !== therapistId) {
      return {
        allowed: false,
        reason: 'You can only access sessions with your own patients',
        reasonHe: 'ניתן לגשת רק לפגישות עם המטופלים שלך',
      };
    }

    // Check specific permission
    return checkTherapistPermission(permission, session);
  }

  // PATIENT ACCESS
  if (userRole === 'patient') {
    // Patient can only access their own sessions
    if (session.patientId !== patientId) {
      return {
        allowed: false,
        reason: 'You can only access your own sessions',
        reasonHe: 'ניתן לגשת רק לפגישות שלך',
      };
    }

    // Patients have very limited access
    return checkPatientPermission(permission);
  }

  // ADMIN ACCESS
  if (userRole === 'admin') {
    // Admin can only access metadata and compliance info
    return checkAdminPermission(permission);
  }

  // SUPPORT ACCESS
  if (userRole === 'support') {
    // Support can only access metadata
    return checkSupportPermission(permission);
  }

  return {
    allowed: false,
    reason: 'Access denied',
    reasonHe: 'הגישה נדחתה',
  };
}

/**
 * Check therapist-specific permissions
 */
function checkTherapistPermission(
  permission: ClinicalPermission,
  session: SessionRecord
): AccessDecision {
  // Therapist can do almost everything with their own sessions
  const allowed = [
    'session:create',
    'session:read',
    'session:read_metadata',
    'clinical_notes:read',
    'patient_summary:read',
    'treatment_plan:read',
    'treatment_plan:write',
    'export:json',
    'export:pdf',
  ];

  // Writing permissions depend on documentation status
  if (permission === 'session:update' || permission === 'clinical_notes:write') {
    if (session.documentationStatus === 'DRAFT') {
      return {
        allowed: true,
        reason: 'Therapist can edit draft sessions',
        reasonHe: 'ניתן לערוך טיוטות',
      };
    }
    return {
      allowed: false,
      reason: 'Cannot edit submitted or locked sessions',
      reasonHe: 'לא ניתן לערוך פגישות שהוגשו או ננעלו',
    };
  }

  if (permission === 'session:submit') {
    if (session.documentationStatus !== 'DRAFT') {
      return {
        allowed: false,
        reason: 'Session is already submitted',
        reasonHe: 'הפגישה כבר הוגשה',
      };
    }
    return {
      allowed: true,
      reason: 'Therapist can submit draft sessions',
      reasonHe: 'ניתן להגיש טיוטות',
    };
  }

  if (permission === 'session:amend') {
    if (session.documentationStatus === 'DRAFT') {
      return {
        allowed: false,
        reason: 'Cannot amend draft sessions - just update them',
        reasonHe: 'לא ניתן לתקן טיוטות - פשוט ערוך אותן',
      };
    }
    if (session.documentationStatus === 'LOCKED') {
      return {
        allowed: false,
        reason: 'Cannot amend locked sessions',
        reasonHe: 'לא ניתן לתקן פגישות נעולות',
      };
    }
    return {
      allowed: true,
      reason: 'Therapist can amend submitted sessions with documented reason',
      reasonHe: 'ניתן לתקן פגישות שהוגשו עם סיבה מתועדת',
    };
  }

  if (permission === 'session:lock') {
    if (session.documentationStatus === 'LOCKED') {
      return {
        allowed: false,
        reason: 'Session is already locked',
        reasonHe: 'הפגישה כבר נעולה',
      };
    }
    return {
      allowed: true,
      reason: 'Therapist can lock sessions',
      reasonHe: 'ניתן לנעול פגישות',
    };
  }

  if (permission === 'patient_summary:write' || permission === 'patient_summary:share') {
    return {
      allowed: true,
      reason: 'Therapist can create and share patient summaries',
      reasonHe: 'ניתן ליצור ולשתף סיכומים למטופל',
    };
  }

  if (allowed.includes(permission)) {
    return {
      allowed: true,
      reason: 'Therapist has access to their patient sessions',
      reasonHe: 'למטפל יש גישה לפגישות עם המטופלים שלו',
    };
  }

  return {
    allowed: false,
    reason: 'Permission not granted',
    reasonHe: 'ההרשאה לא ניתנה',
    requiredPermissions: [permission],
  };
}

/**
 * Check patient-specific permissions
 */
function checkPatientPermission(permission: ClinicalPermission): AccessDecision {
  // Patients can only read shared summaries
  const allowed: ClinicalPermission[] = [
    'session:read_metadata',
    'patient_summary:read',
  ];

  if (allowed.includes(permission)) {
    return {
      allowed: true,
      reason: 'Patient can view their session summaries',
      reasonHe: 'ניתן לצפות בסיכומי הפגישות שלך',
    };
  }

  return {
    allowed: false,
    reason: 'Patients cannot access clinical documentation',
    reasonHe: 'מטופלים לא יכולים לגשת לתיעוד קליני',
    requiredPermissions: [permission],
  };
}

/**
 * Check admin-specific permissions
 */
function checkAdminPermission(permission: ClinicalPermission): AccessDecision {
  // Admin can ONLY see metadata and compliance - NO clinical content
  const allowed: ClinicalPermission[] = [
    'session:read_metadata',
    'compliance:view',
  ];

  if (allowed.includes(permission)) {
    return {
      allowed: true,
      reason: 'Admin can view session metadata and compliance',
      reasonHe: 'מנהל יכול לצפות במטא-דאטא ותאימות',
    };
  }

  if (permission === 'clinical_notes:read') {
    return {
      allowed: false,
      reason: 'Administrators cannot access clinical content',
      reasonHe: 'מנהלים לא יכולים לגשת לתוכן קליני',
    };
  }

  return {
    allowed: false,
    reason: 'Permission not granted to administrators',
    reasonHe: 'ההרשאה לא ניתנה למנהלים',
    requiredPermissions: [permission],
  };
}

/**
 * Check support-specific permissions
 */
function checkSupportPermission(permission: ClinicalPermission): AccessDecision {
  // Support can only see very basic metadata
  const allowed: ClinicalPermission[] = [
    'session:read_metadata',
  ];

  if (allowed.includes(permission)) {
    return {
      allowed: true,
      reason: 'Support can view basic session metadata',
      reasonHe: 'תמיכה יכולה לצפות במטא-דאטא בסיסי',
    };
  }

  return {
    allowed: false,
    reason: 'Support personnel cannot access clinical data',
    reasonHe: 'אנשי תמיכה לא יכולים לגשת לנתונים קליניים',
    requiredPermissions: [permission],
  };
}

// =============================================================================
// PATIENT SUMMARY ACCESS
// =============================================================================

/**
 * Check if a patient can view a session summary
 */
export function canPatientViewSummary(
  context: AccessContext,
  session: SessionRecord,
  summary?: PatientSessionSummary
): AccessDecision {
  if (context.userRole !== 'patient') {
    return {
      allowed: false,
      reason: 'This check is for patients only',
      reasonHe: 'בדיקה זו למטופלים בלבד',
    };
  }

  if (session.patientId !== context.patientId) {
    return {
      allowed: false,
      reason: 'This is not your session',
      reasonHe: 'זו לא הפגישה שלך',
    };
  }

  if (!summary) {
    return {
      allowed: false,
      reason: 'No summary has been shared for this session',
      reasonHe: 'לא שותף סיכום לפגישה זו',
    };
  }

  if (!summary.isVisibleToPatient) {
    return {
      allowed: false,
      reason: 'The therapist has not shared a summary yet',
      reasonHe: 'המטפל טרם שיתף סיכום',
    };
  }

  return {
    allowed: true,
    reason: 'Summary is visible to patient',
    reasonHe: 'הסיכום זמין לצפייה',
  };
}

// =============================================================================
// COMPLIANCE VIEW ACCESS
// =============================================================================

/**
 * Get the compliance view that an admin can see (without clinical content)
 */
export interface ComplianceViewSession {
  id: string;
  therapistId: string;
  therapistName: string;
  patientId: string; // Pseudonymized
  sessionDate: Date;
  sessionType: string;
  documentationStatus: string;
  isOverdue: boolean;
  hasComplianceFlags: boolean;
  flagCount: number;
  flagTypes: string[];
  documentationDeadline: Date;
  submittedAt?: Date;
}

/**
 * Transform a session record to compliance view (strips clinical content)
 */
export function toComplianceView(
  session: SessionRecord,
  therapistName: string,
  flagTypes: string[]
): ComplianceViewSession {
  return {
    id: session.id,
    therapistId: session.therapistId,
    therapistName,
    patientId: pseudonymizePatientId(session.patientId),
    sessionDate: session.sessionDate,
    sessionType: session.sessionType,
    documentationStatus: session.documentationStatus,
    isOverdue: session.isOverdue,
    hasComplianceFlags: flagTypes.length > 0,
    flagCount: flagTypes.length,
    flagTypes,
    documentationDeadline: session.documentationDeadline,
    submittedAt: session.submittedAt,
  };
}

/**
 * Pseudonymize patient ID for admin views
 */
function pseudonymizePatientId(patientId: string): string {
  // Create a consistent hash that doesn't reveal the actual ID
  const crypto = require('crypto');
  return 'PT-' + crypto.createHash('sha256')
    .update(patientId)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

/**
 * Create an audit log entry for clinical data access
 */
export function createAuditLogEntry(input: AuditLogInput): {
  userId: string;
  userRole: string;
  userName: string;
  entityType: string;
  entityId: string;
  patientId?: string;
  action: string;
  actionDetails?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  wasSuccessful: boolean;
  failureReason?: string;
  occurredAt: Date;
} {
  return {
    userId: input.context.userId,
    userRole: input.context.userRole,
    userName: input.context.userId, // Would be resolved to actual name
    entityType: input.entityType,
    entityId: input.entityId,
    patientId: input.patientId,
    action: input.action,
    actionDetails: input.actionDetails ? JSON.stringify(input.actionDetails) : undefined,
    ipAddress: input.context.ipAddress,
    userAgent: input.context.userAgent,
    sessionId: input.context.sessionId,
    wasSuccessful: input.wasSuccessful,
    failureReason: input.failureReason,
    occurredAt: new Date(),
  };
}

// =============================================================================
// DATA EXPORT ACCESS
// =============================================================================

/**
 * Check if a user can export session data
 */
export function canExportSession(
  context: AccessContext,
  session: SessionRecord,
  format: 'JSON' | 'PDF'
): AccessDecision {
  // Only therapists can export
  if (context.userRole !== 'therapist') {
    return {
      allowed: false,
      reason: 'Only therapists can export session data',
      reasonHe: 'רק מטפלים יכולים לייצא נתוני פגישה',
    };
  }

  // Must be their patient
  if (session.therapistId !== context.therapistId) {
    return {
      allowed: false,
      reason: 'You can only export sessions with your own patients',
      reasonHe: 'ניתן לייצא רק פגישות עם המטופלים שלך',
    };
  }

  // Session must be submitted (not draft)
  if (session.documentationStatus === 'DRAFT') {
    return {
      allowed: false,
      reason: 'Cannot export draft sessions',
      reasonHe: 'לא ניתן לייצא טיוטות',
    };
  }

  return {
    allowed: true,
    reason: 'Therapist can export their submitted sessions',
    reasonHe: 'ניתן לייצא פגישות שהוגשו',
  };
}

// =============================================================================
// CONSENT VERIFICATION
// =============================================================================

/**
 * Check if required consents are in place for an action
 */
export function verifyConsent(
  consents: Array<{ consentType: string; isGranted: boolean; expiresAt?: Date }>,
  requiredConsents: string[]
): AccessDecision {
  const now = new Date();

  for (const required of requiredConsents) {
    const consent = consents.find(c => c.consentType === required);

    if (!consent) {
      return {
        allowed: false,
        reason: `Missing required consent: ${required}`,
        reasonHe: `חסרה הסכמה נדרשת: ${required}`,
      };
    }

    if (!consent.isGranted) {
      return {
        allowed: false,
        reason: `Consent not granted: ${required}`,
        reasonHe: `הסכמה לא ניתנה: ${required}`,
      };
    }

    if (consent.expiresAt && consent.expiresAt < now) {
      return {
        allowed: false,
        reason: `Consent expired: ${required}`,
        reasonHe: `הסכמה פגה: ${required}`,
      };
    }
  }

  return {
    allowed: true,
    reason: 'All required consents are in place',
    reasonHe: 'כל ההסכמות הנדרשות קיימות',
  };
}
