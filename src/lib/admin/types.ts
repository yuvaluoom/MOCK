/**
 * MatchMind Admin Management System - Type Definitions
 *
 * Types for therapist arbitration, notifications, and audit logging.
 */

// =============================================================================
// THERAPIST APPROVAL
// =============================================================================

export type TherapistApprovalStatus =
  | 'PENDING_INFO'        // Incomplete profile
  | 'AWAITING_APPROVAL'   // Ready for review
  | 'APPROVED'            // Active and can see patients
  | 'REJECTED'            // Denied by admin
  | 'SUSPENDED'           // Temporarily disabled
  | 'MISSING_DOCUMENTS';  // Needs to upload documents

export interface TherapistApplication {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  city: string;
  licenseNumber: string;
  title?: string;
  yearsOfExperience: number;
  bio?: string;
  bioHebrew?: string;

  // Professional details
  approaches: string[];
  specializations: string[];
  languages: string[];
  acceptedHealthFunds: string[];

  // Photo
  photoUrl?: string;
  photoThumbnailUrl?: string;

  // Profile status
  profileCompleted: boolean;
  approvalStatus: TherapistApprovalStatus;
  approvalNote?: string;

  // Documents
  documents: TherapistDocument[];
  documentsComplete: boolean;

  // Timestamps
  registeredAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  approvedBy?: string;

  // Internal notes (admin-only)
  internalNotes: AdminNote[];

  // Calculated fields
  profileCompleteness: number; // 0-100
  daysInQueue: number;
}

export interface TherapistDocument {
  id: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  expiresAt?: Date;
}

export type DocumentType =
  | 'LICENSE'
  | 'CERTIFICATION'
  | 'INSURANCE'
  | 'DIPLOMA'
  | 'OTHER';

export type DocumentStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REQUIRES_UPDATE'
  | 'EXPIRED';

export interface AdminNote {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  isPrivate: boolean;
}

// =============================================================================
// ADMIN ACTIONS
// =============================================================================

export type AdminAction =
  | 'APPROVE_THERAPIST'
  | 'REJECT_THERAPIST'
  | 'SUSPEND_THERAPIST'
  | 'UNSUSPEND_THERAPIST'
  | 'REQUEST_DOCUMENTS'
  | 'REQUEST_INFO'
  | 'APPROVE_DOCUMENT'
  | 'REJECT_DOCUMENT'
  | 'ADD_NOTE'
  | 'DELETE_THERAPIST'
  | 'OVERRIDE_STATUS'; // Owner only

export interface AdminActionPayload {
  action: AdminAction;
  therapistId: string;
  reason?: string;
  note?: string;
  documentIds?: string[];
  targetStatus?: TherapistApprovalStatus;
}

export interface AdminActionResult {
  success: boolean;
  action: AdminAction;
  therapistId: string;
  previousStatus?: TherapistApprovalStatus;
  newStatus?: TherapistApprovalStatus;
  message: string;
  messageHe: string;
  timestamp: Date;
  performedBy: string;
  notificationSent: boolean;
  emailSent: boolean;
  auditLogId: string;
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export type AdminNotificationType =
  | 'NEW_THERAPIST_REGISTRATION'
  | 'THERAPIST_PROFILE_COMPLETE'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_EXPIRING'
  | 'DOCUMENT_EXPIRED'
  | 'PENDING_APPROVAL_REMINDER'
  | 'ACTION_REQUIRED'
  | 'SYSTEM_ALERT';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  titleHe: string;
  message: string;
  messageHe: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Related entity
  entityType?: string;
  entityId?: string;

  // Action
  actionUrl?: string;
  actionLabel?: string;
  actionLabelHe?: string;

  // Status
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationBadge {
  totalUnread: number;
  byType: Record<AdminNotificationType, number>;
  urgent: number;
}

// =============================================================================
// AUDIT LOG
// =============================================================================

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'SUSPEND'
  | 'UNSUSPEND'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'EXPORT'
  | 'OVERRIDE';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;

  action: AuditAction;
  entityType: string;
  entityId?: string;

  description: string;
  descriptionHe: string;

  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;

  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  };

  createdAt: Date;
}

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export interface AdminDashboardStats {
  // Therapist stats
  therapists: {
    total: number;
    approved: number;
    pending: number;
    awaitingApproval: number;
    rejected: number;
    suspended: number;
    missingDocuments: number;
  };

  // Patient stats
  patients: {
    total: number;
    active: number;
    completedQuestionnaire: number;
  };

  // Session stats
  sessions: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };

  // Document stats
  documents: {
    pendingReview: number;
    expiringSoon: number;
    expired: number;
  };

  // Recent activity
  recentActions: AuditLogEntry[];

  // Alerts
  alerts: {
    overduePending: number;
    expiredDocuments: number;
    systemIssues: number;
  };
}

// =============================================================================
// FILTERS & SORTING
// =============================================================================

export interface TherapistFilters {
  status?: TherapistApprovalStatus | 'ALL';
  search?: string;
  city?: string;
  specialization?: string;
  healthFund?: string;
  hasDocumentIssues?: boolean;
  daysInQueueMin?: number;
  daysInQueueMax?: number;
}

export type TherapistSortField =
  | 'name'
  | 'registeredAt'
  | 'submittedAt'
  | 'daysInQueue'
  | 'profileCompleteness'
  | 'status';

export type SortOrder = 'asc' | 'desc';

// =============================================================================
// OWNER CONTROLS
// =============================================================================

export interface OwnerOverrideRequest {
  therapistId: string;
  targetStatus: TherapistApprovalStatus;
  reason: string;
  bypassChecks: boolean;
}

export interface SystemStateView {
  database: {
    connected: boolean;
    latency: number;
  };
  email: {
    connected: boolean;
    pendingQueue: number;
  };
  storage: {
    connected: boolean;
    usedBytes: number;
    totalBytes: number;
  };
  matching: {
    isRunning: boolean;
    lastRun: Date;
    pendingMatches: number;
  };
  admins: {
    id: string;
    name: string;
    email: string;
    lastActive: Date;
    actionsToday: number;
  }[];
}

// =============================================================================
// LABELS
// =============================================================================

export const APPROVAL_STATUS_LABELS: Record<TherapistApprovalStatus, { en: string; he: string }> = {
  PENDING_INFO: { en: 'Pending Info', he: 'Awaiting information' },
  AWAITING_APPROVAL: { en: 'Awaiting Approval', he: 'Pending Approval' },
  APPROVED: { en: 'Approved', he: 'Approved' },
  REJECTED: { en: 'Rejected', he: 'Rejected' },
  SUSPENDED: { en: 'Suspended', he: 'edTime' },
  MISSING_DOCUMENTS: { en: 'Missing Documents', he: 'Missing documents' },
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, { en: string; he: string }> = {
  PENDING_REVIEW: { en: 'Pending Review', he: 'Pending Review' },
  APPROVED: { en: 'Approved', he: 'Approved' },
  REJECTED: { en: 'Rejected', he: 'Rejected' },
  REQUIRES_UPDATE: { en: 'Requires Update', he: 'Requires Update' },
  EXPIRED: { en: 'Expired', he: 'Expired' },
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, { en: string; he: string }> = {
  LICENSE: { en: 'Professional License', he: 'Professional License' },
  CERTIFICATION: { en: 'Certification', he: 'Certification' },
  INSURANCE: { en: 'Insurance', he: 'Professional Liability Insurance' },
  DIPLOMA: { en: 'Diploma', he: 'Academic Diploma' },
  OTHER: { en: 'Other', he: 'Other' },
};

export const NOTIFICATION_TYPE_LABELS: Record<AdminNotificationType, { en: string; he: string }> = {
  NEW_THERAPIST_REGISTRATION: { en: 'New Registration', he: 'New Registration' },
  THERAPIST_PROFILE_COMPLETE: { en: 'Profile Complete', he: 'Profile Complete' },
  DOCUMENT_UPLOADED: { en: 'Document Uploaded', he: 'Document Uploaded' },
  DOCUMENT_EXPIRING: { en: 'Document Expiring', he: 'Document Expiring' },
  DOCUMENT_EXPIRED: { en: 'Document Expired', he: 'Document Expired' },
  PENDING_APPROVAL_REMINDER: { en: 'Pending Reminder', he: 'Pending Reminder' },
  ACTION_REQUIRED: { en: 'Action Required', he: 'Action Required' },
  SYSTEM_ALERT: { en: 'System Alert', he: 'System Alert' },
};
