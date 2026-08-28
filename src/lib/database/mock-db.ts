/**
 * Unified Mock Database
 *
 * SINGLE SOURCE OF TRUTH for all platform data in development mode.
 *
 * This module provides:
 * - Centralized data store with state persistence
 * - Event-driven state changes for cross-platform sync
 * - Strict state machine enforcement
 * - Audit logging for all mutations
 * - Email trigger integration
 * - Notification system integration
 *
 * In production, this would be replaced by Prisma database queries.
 */

// =============================================================================
// TYPES & ENUMS
// =============================================================================

export type UserRole = 'PATIENT' | 'THERAPIST' | 'ADMIN' | 'OWNER';

export type TherapistApprovalStatus =
  | 'PENDING_INFO'        // Just registered, profile incomplete
  | 'AWAITING_APPROVAL'   // Profile complete, waiting for admin review
  | 'APPROVED'            // Approved by admin, visible in matching
  | 'REJECTED'            // Rejected by admin
  | 'SUSPENDED';          // Approved but temporarily suspended

export type NotificationType =
  | 'THERAPIST_APPLICATION_RECEIVED'
  | 'THERAPIST_DOCUMENTS_REQUESTED'
  | 'THERAPIST_APPROVED'
  | 'THERAPIST_REJECTED'
  | 'THERAPIST_SUSPENDED'
  | 'SESSION_REQUESTED'
  | 'SESSION_APPROVED'
  | 'SESSION_REJECTED'
  | 'SESSION_CANCELLED'
  | 'SESSION_REMINDER'
  | 'NEW_MESSAGE'
  | 'NEW_MATCH'
  | 'PROFILE_UPDATED';

export type SessionStatus =
  | 'PENDING_THERAPIST_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED_BY_PATIENT'
  | 'CANCELLED_BY_THERAPIST'
  | 'COMPLETED'
  | 'NO_SHOW';

// =============================================================================
// STATE MACHINE: Valid Transitions
// =============================================================================

const VALID_THERAPIST_TRANSITIONS: Record<TherapistApprovalStatus, TherapistApprovalStatus[]> = {
  PENDING_INFO: ['AWAITING_APPROVAL'],
  AWAITING_APPROVAL: ['APPROVED', 'REJECTED', 'PENDING_INFO'],
  APPROVED: ['SUSPENDED'],
  REJECTED: ['PENDING_INFO'], // Can re-apply
  SUSPENDED: ['APPROVED', 'REJECTED'],
};

export function isValidTransition(
  from: TherapistApprovalStatus,
  to: TherapistApprovalStatus
): boolean {
  return VALID_THERAPIST_TRANSITIONS[from]?.includes(to) ?? false;
}

// =============================================================================
// ENTITY INTERFACES
// =============================================================================

export interface DbUser {
  id: string;
  email: string;
  role: UserRole;
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: Date;
  updatedAt: Date;
}

// Matching metadata types (mirrored from mock-data.ts)
export type CommunicationStylePreference = 'DIRECT' | 'GENTLE' | 'ANALYTICAL' | 'SPIRITUAL' | 'STRUCTURED';
export type TherapyStylePreference = 'DIRECTIVE' | 'EXPLORATORY' | 'STRUCTURED' | 'FLEXIBLE';
export type EmotionalNeed = 'VALIDATION' | 'TOOLS' | 'EXPLORATION' | 'ACCOUNTABILITY';
export type ReligiousAffiliation = 'SECULAR' | 'TRADITIONAL' | 'RELIGIOUS' | 'ULTRA_ORTHODOX' | 'OTHER';
export type MilitaryServiceType = 'NONE' | 'MANDATORY' | 'CAREER' | 'RESERVE';
export type MaritalStatus = 'SINGLE' | 'IN_RELATIONSHIP' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type WorkStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'RETIRED' | 'MILITARY_SERVICE';
export type EducationLevel = 'HIGH_SCHOOL' | 'SOME_COLLEGE' | 'BACHELORS' | 'MASTERS' | 'DOCTORATE' | 'OTHER';
export type AgeGroup = 'CHILDREN' | 'ADOLESCENTS' | 'ADULTS' | 'ELDERLY';

export interface DbTherapist {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  title: string;
  bio: string;
  bioHebrew: string;
  city: string;
  address: string;
  licenseNumber: string;
  photoUrl: string | null;
  photoThumbnailUrl: string | null;
  offersOnline: boolean;
  offersInPerson: boolean;
  languages: string[];
  approaches: string[];
  specializations: string[];
  acceptedHealthFunds: string[];
  sessionPrice: number;
  sessionDuration: number;
  yearsOfExperience: number;
  education: string[];
  // State management
  approvalStatus: TherapistApprovalStatus;
  approvalNote: string | null;
  approvedBy: string | null;
  rejectionReason: string | null;
  suspensionReason: string | null;
  missingDocuments: string[];
  profileCompleted: boolean;
  isAcceptingPatients: boolean;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  suspendedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Matching metadata
  communicationStyles?: CommunicationStylePreference[];
  therapyStyles?: TherapyStylePreference[];
  emotionalFocus?: EmotionalNeed[];
  religiousAffiliation?: ReligiousAffiliation;
  militaryExperience?: boolean;
  treatsAgeGroups?: AgeGroup[];
}

export interface DbPatient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  healthFund: string;
  preferredOnline: boolean;
  preferredGender: string | null;
  preferredLanguages: string[];
  preferredApproaches: string[];
  preferredDays: string[];
  onboardingCompleted: boolean;
  questionnaireCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Objective demographic fields
  age?: number;
  dateOfBirth?: Date;
  gender?: string;
  maritalStatus?: MaritalStatus;
  hasChildren?: boolean;
  numberOfChildren?: number;
  militaryService?: MilitaryServiceType;
  religiousAffiliation?: ReligiousAffiliation;
  nativeLanguage?: string;
  workStatus?: WorkStatus;
  educationLevel?: EducationLevel;
}

export interface DbSession {
  id: string;
  patientId: string;
  therapistId: string;
  scheduledAt: Date;
  duration: number;
  type: string;
  isOnline: boolean;
  status: SessionStatus;
  meetingUrl: string | null;
  price: number | null;
  healthFund: string | null;
  therapistNotes: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbNotification {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  type: NotificationType;
  title: string;
  titleHe: string;
  message: string;
  messageHe: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: Date | null;
  emailSent: boolean;
  emailSentAt: Date | null;
  emailId: string | null;
  createdAt: Date;
}

export interface DbAuditLog {
  id: string;
  action: string;
  entityType: 'USER' | 'THERAPIST' | 'PATIENT' | 'SESSION' | 'NOTIFICATION' | 'SYSTEM';
  entityId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  emailTriggered: boolean;
  emailId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface DbEmailLog {
  id: string;
  to: string;
  type: string;
  subject: string;
  recipientName: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  triggeredBy: string;
  triggeredByAction: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'BOUNCED';
  sentAt: Date | null;
  errorMessage: string | null;
  idempotencyKey: string;
  createdAt: Date;
}

export interface DbMatchExplanationItem {
  category: 'objective' | 'subjective' | 'therapeutic' | 'practical';
  matched: boolean;
  labelHe: string;
  labelEn: string;
}

export interface DbMatch {
  id: string;
  patientId: string;
  therapistId: string;
  overallScore: number;
  xFactorScore: number;
  healthFundScore: number;
  availabilityScore: number;
  locationScore: number;
  preferenceScore: number;
  objectiveFitScore: number;
  subjectiveFitScore: number;
  scoreBreakdown: Record<string, unknown>;
  explanationHe: string;
  explanationEn: string;
  explanationItems: DbMatchExplanationItem[];
  isViewed: boolean;
  isFavorited: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbAvailabilitySlot {
  id: string;
  therapistId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  isInPerson: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbTherapistDocument {
  id: string;
  therapistId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  uploadedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  expiresAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// EVENT SYSTEM
// =============================================================================

export type DbEventType =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'THERAPIST_STATUS_CHANGED'
  | 'THERAPIST_PROFILE_UPDATED'
  | 'SESSION_STATUS_CHANGED'
  | 'NOTIFICATION_CREATED'
  | 'MATCH_UPDATED'
  | 'EMAIL_SENT'
  | 'AUDIT_LOG_CREATED';

export interface DbEvent {
  type: DbEventType;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

type EventListener = (event: DbEvent) => void;

// =============================================================================
// HELPER: Generate UUID
// =============================================================================

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =============================================================================
// MOCK DATABASE CLASS
// =============================================================================

class MockDatabase {
  // Data stores
  private users: Map<string, DbUser> = new Map();
  private therapists: Map<string, DbTherapist> = new Map();
  private patients: Map<string, DbPatient> = new Map();
  private sessions: Map<string, DbSession> = new Map();
  private notifications: Map<string, DbNotification> = new Map();
  private auditLogs: Map<string, DbAuditLog> = new Map();
  private emailLogs: Map<string, DbEmailLog> = new Map();
  private matches: Map<string, DbMatch> = new Map();
  private availabilitySlots: Map<string, DbAvailabilitySlot> = new Map();
  private therapistDocuments: Map<string, DbTherapistDocument> = new Map();

  // Idempotency tracking for emails
  private processedEmailKeys: Set<string> = new Set();

  // Event listeners
  private eventListeners: Map<DbEventType, EventListener[]> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  // ===========================================================================
  // EVENT SYSTEM
  // ===========================================================================

  public on(eventType: DbEventType, listener: EventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  public off(eventType: DbEventType, listener: EventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  private emit(event: DbEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(`[MockDB] Error in event listener:`, error);
      }
    });
  }

  // ===========================================================================
  // THERAPIST OPERATIONS WITH STATE MACHINE
  // ===========================================================================

  public getAllTherapists(): DbTherapist[] {
    return Array.from(this.therapists.values());
  }

  public getTherapistById(id: string): DbTherapist | undefined {
    return this.therapists.get(id);
  }

  public getTherapistByUserId(userId: string): DbTherapist | undefined {
    return Array.from(this.therapists.values()).find((t) => t.userId === userId);
  }

  public getTherapistsByStatus(status: TherapistApprovalStatus): DbTherapist[] {
    return Array.from(this.therapists.values()).filter(
      (t) => t.approvalStatus === status
    );
  }

  public getApprovedTherapistsForMatching(): DbTherapist[] {
    return Array.from(this.therapists.values()).filter(
      (t) => t.approvalStatus === 'APPROVED' && t.isAcceptingPatients
    );
  }

  // ===========================================================================
  // AVAILABILITY OPERATIONS
  // ===========================================================================

  public getAvailabilityByTherapistId(therapistId: string): DbAvailabilitySlot[] {
    return Array.from(this.availabilitySlots.values()).filter(
      (a) => a.therapistId === therapistId
    );
  }

  public createAvailabilitySlot(data: Omit<DbAvailabilitySlot, 'id' | 'createdAt' | 'updatedAt'>): DbAvailabilitySlot {
    const slot: DbAvailabilitySlot = {
      ...data,
      id: `avail-${generateId()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.availabilitySlots.set(slot.id, slot);
    return slot;
  }

  public deleteAvailabilitySlot(id: string): boolean {
    return this.availabilitySlots.delete(id);
  }

  // ===========================================================================
  // DOCUMENT OPERATIONS
  // ===========================================================================

  public getDocumentsByTherapistId(therapistId: string): DbTherapistDocument[] {
    return Array.from(this.therapistDocuments.values()).filter(
      (d) => d.therapistId === therapistId
    );
  }

  public getAllDocuments(): DbTherapistDocument[] {
    return Array.from(this.therapistDocuments.values());
  }

  public getDocumentById(id: string): DbTherapistDocument | undefined {
    return this.therapistDocuments.get(id);
  }

  public createDocument(data: Omit<DbTherapistDocument, 'id' | 'createdAt' | 'updatedAt'>): DbTherapistDocument {
    const doc: DbTherapistDocument = {
      ...data,
      id: `doc-${generateId()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.therapistDocuments.set(doc.id, doc);
    return doc;
  }

  public updateDocument(id: string, updates: Partial<DbTherapistDocument>): DbTherapistDocument | null {
    const doc = this.therapistDocuments.get(id);
    if (!doc) return null;

    const updated: DbTherapistDocument = {
      ...doc,
      ...updates,
      updatedAt: new Date(),
    };
    this.therapistDocuments.set(id, updated);
    return updated;
  }

  public createTherapist(data: Omit<DbTherapist, 'id' | 'createdAt' | 'updatedAt'>): DbTherapist {
    const therapist: DbTherapist = {
      ...data,
      id: `therapist-${generateId()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.therapists.set(therapist.id, therapist);

    this.emit({
      type: 'THERAPIST_PROFILE_UPDATED',
      entityType: 'THERAPIST',
      entityId: therapist.id,
      data: { action: 'CREATED', therapist },
      timestamp: new Date(),
    });

    return therapist;
  }

  public updateTherapist(
    id: string,
    updates: Partial<DbTherapist>
  ): DbTherapist | null {
    const therapist = this.therapists.get(id);
    if (!therapist) return null;

    const updated: DbTherapist = {
      ...therapist,
      ...updates,
      updatedAt: new Date(),
    };
    this.therapists.set(id, updated);

    this.emit({
      type: 'THERAPIST_PROFILE_UPDATED',
      entityType: 'THERAPIST',
      entityId: id,
      data: { previous: therapist, current: updated },
      timestamp: new Date(),
    });

    return updated;
  }

  /**
   * Transition therapist status with strict state machine enforcement
   */
  public transitionTherapistStatus(
    therapistId: string,
    newStatus: TherapistApprovalStatus,
    options: {
      adminId: string;
      adminName: string;
      reason?: string;
      missingDocuments?: string[];
    }
  ): { success: boolean; therapist?: DbTherapist; error?: string } {
    const therapist = this.therapists.get(therapistId);
    if (!therapist) {
      return { success: false, error: 'Therapist not found' };
    }

    const previousStatus = therapist.approvalStatus;

    // Validate state transition
    if (!isValidTransition(previousStatus, newStatus)) {
      return {
        success: false,
        error: `Invalid transition from ${previousStatus} to ${newStatus}`,
      };
    }

    // Apply state-specific updates
    const now = new Date();
    const updates: Partial<DbTherapist> = {
      approvalStatus: newStatus,
      updatedAt: now,
    };

    switch (newStatus) {
      case 'APPROVED':
        updates.approvedBy = options.adminId;
        updates.approvedAt = now;
        updates.approvalNote = options.reason || null;
        updates.rejectionReason = null;
        updates.suspensionReason = null;
        updates.missingDocuments = [];
        updates.isAcceptingPatients = true;
        break;
      case 'REJECTED':
        updates.rejectionReason = options.reason || 'No reason provided';
        updates.rejectedAt = now;
        updates.isAcceptingPatients = false;
        break;
      case 'SUSPENDED':
        updates.suspensionReason = options.reason || 'No reason provided';
        updates.suspendedAt = now;
        updates.isAcceptingPatients = false;
        break;
      case 'PENDING_INFO':
        updates.missingDocuments = options.missingDocuments || [];
        updates.isAcceptingPatients = false;
        break;
      case 'AWAITING_APPROVAL':
        updates.missingDocuments = [];
        break;
    }

    const updated: DbTherapist = {
      ...therapist,
      ...updates,
    };
    this.therapists.set(therapistId, updated);

    // Emit status change event
    this.emit({
      type: 'THERAPIST_STATUS_CHANGED',
      entityType: 'THERAPIST',
      entityId: therapistId,
      data: {
        previousStatus,
        newStatus,
        adminId: options.adminId,
        reason: options.reason,
      },
      timestamp: now,
    });

    // Refresh match visibility
    this.refreshMatchesForTherapist(therapistId);

    return { success: true, therapist: updated };
  }

  // ===========================================================================
  // PATIENT OPERATIONS
  // ===========================================================================

  public getAllPatients(): DbPatient[] {
    return Array.from(this.patients.values());
  }

  public getPatientById(id: string): DbPatient | undefined {
    return this.patients.get(id);
  }

  public getPatientByUserId(userId: string): DbPatient | undefined {
    return Array.from(this.patients.values()).find((p) => p.userId === userId);
  }

  // ===========================================================================
  // SESSION OPERATIONS
  // ===========================================================================

  public getAllSessions(): DbSession[] {
    return Array.from(this.sessions.values());
  }

  public getSessionById(id: string): DbSession | undefined {
    return this.sessions.get(id);
  }

  public getSessionsByPatient(patientId: string): DbSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.patientId === patientId);
  }

  public getSessionsByTherapist(therapistId: string): DbSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.therapistId === therapistId);
  }

  public createSession(data: Omit<DbSession, 'id' | 'createdAt' | 'updatedAt'>): DbSession {
    const session: DbSession = {
      ...data,
      id: `session-${generateId()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  public updateSessionStatus(
    sessionId: string,
    status: SessionStatus,
    options?: { reason?: string; meetingUrl?: string }
  ): DbSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const updated: DbSession = {
      ...session,
      status,
      ...(options?.meetingUrl && { meetingUrl: options.meetingUrl }),
      ...(options?.reason && { cancellationReason: options.reason }),
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, updated);

    this.emit({
      type: 'SESSION_STATUS_CHANGED',
      entityType: 'SESSION',
      entityId: sessionId,
      data: { previousStatus: session.status, newStatus: status },
      timestamp: new Date(),
    });

    return updated;
  }

  /**
   * Update any session fields (for session manager)
   */
  public updateSession(
    sessionId: string,
    updates: Partial<DbSession>
  ): DbSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const previousStatus = session.status;
    const updated: DbSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, updated);

    // Emit status change event if status changed
    if (updates.status && updates.status !== previousStatus) {
      this.emit({
        type: 'SESSION_STATUS_CHANGED',
        entityType: 'SESSION',
        entityId: sessionId,
        data: { previousStatus, newStatus: updates.status },
        timestamp: new Date(),
      });
    }

    return updated;
  }

  // ===========================================================================
  // NOTIFICATION OPERATIONS
  // ===========================================================================

  public createNotification(
    data: Omit<DbNotification, 'id' | 'createdAt'>
  ): DbNotification {
    const notification: DbNotification = {
      ...data,
      id: `notif-${generateId()}`,
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);

    this.emit({
      type: 'NOTIFICATION_CREATED',
      entityType: 'NOTIFICATION',
      entityId: notification.id,
      data: { notification },
      timestamp: new Date(),
    });

    return notification;
  }

  public getNotificationsByRecipient(recipientId: string): DbNotification[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getUnreadNotificationCount(recipientId: string): number {
    return Array.from(this.notifications.values()).filter(
      (n) => n.recipientId === recipientId && !n.isRead
    ).length;
  }

  public markNotificationRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.isRead = true;
    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);
    return true;
  }

  public markAllNotificationsRead(recipientId: string): number {
    let count = 0;
    this.notifications.forEach((n) => {
      if (n.recipientId === recipientId && !n.isRead) {
        n.isRead = true;
        n.readAt = new Date();
        count++;
      }
    });
    return count;
  }

  // ===========================================================================
  // AUDIT LOG OPERATIONS
  // ===========================================================================

  public createAuditLog(data: Omit<DbAuditLog, 'id' | 'createdAt'>): DbAuditLog {
    const auditLog: DbAuditLog = {
      ...data,
      id: `audit-${generateId()}`,
      createdAt: new Date(),
    };
    this.auditLogs.set(auditLog.id, auditLog);

    this.emit({
      type: 'AUDIT_LOG_CREATED',
      entityType: 'AUDIT',
      entityId: auditLog.id,
      data: { auditLog },
      timestamp: new Date(),
    });

    return auditLog;
  }

  public getAuditLogs(options?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }): { logs: DbAuditLog[]; total: number } {
    let logs = Array.from(this.auditLogs.values());

    if (options?.entityType) {
      logs = logs.filter((l) => l.entityType === options.entityType);
    }
    if (options?.entityId) {
      logs = logs.filter((l) => l.entityId === options.entityId);
    }
    if (options?.action) {
      const action = options.action;
      logs = logs.filter((l) => l.action.includes(action));
    }
    if (options?.userId) {
      logs = logs.filter((l) => l.userId === options.userId);
    }

    logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = logs.length;
    if (options?.offset) {
      logs = logs.slice(options.offset);
    }
    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }

    return { logs, total };
  }

  // ===========================================================================
  // EMAIL LOG OPERATIONS (WITH IDEMPOTENCY)
  // ===========================================================================

  /**
   * Check if email was already sent (idempotency check)
   */
  public wasEmailSent(idempotencyKey: string): boolean {
    return this.processedEmailKeys.has(idempotencyKey);
  }

  /**
   * Log email with idempotency protection
   */
  public logEmail(data: Omit<DbEmailLog, 'id' | 'createdAt'>): DbEmailLog | null {
    // Check idempotency
    if (this.processedEmailKeys.has(data.idempotencyKey)) {
      console.log(`[MockDB] Email already sent with key: ${data.idempotencyKey}`);
      return null;
    }

    const emailLog: DbEmailLog = {
      ...data,
      id: `email-${generateId()}`,
      createdAt: new Date(),
    };
    this.emailLogs.set(emailLog.id, emailLog);
    this.processedEmailKeys.add(data.idempotencyKey);

    this.emit({
      type: 'EMAIL_SENT',
      entityType: 'EMAIL',
      entityId: emailLog.id,
      data: { emailLog },
      timestamp: new Date(),
    });

    return emailLog;
  }

  public getEmailLogs(options?: {
    to?: string;
    type?: string;
    status?: string;
    limit?: number;
  }): DbEmailLog[] {
    let logs = Array.from(this.emailLogs.values());

    if (options?.to) {
      logs = logs.filter((l) => l.to === options.to);
    }
    if (options?.type) {
      logs = logs.filter((l) => l.type === options.type);
    }
    if (options?.status) {
      logs = logs.filter((l) => l.status === options.status);
    }

    logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }

  // ===========================================================================
  // MATCH OPERATIONS
  // ===========================================================================

  public getAllMatches(): DbMatch[] {
    return Array.from(this.matches.values());
  }

  public getMatchesByPatient(patientId: string): DbMatch[] {
    return Array.from(this.matches.values())
      .filter((m) => m.patientId === patientId && !m.isHidden)
      .sort((a, b) => b.overallScore - a.overallScore);
  }

  public updateMatch(matchId: string, updates: Partial<DbMatch>): DbMatch | null {
    const match = this.matches.get(matchId);
    if (!match) return null;

    const updated: DbMatch = {
      ...match,
      ...updates,
      updatedAt: new Date(),
    };
    this.matches.set(matchId, updated);

    this.emit({
      type: 'MATCH_UPDATED',
      entityType: 'MATCH',
      entityId: matchId,
      data: { previous: match, current: updated },
      timestamp: new Date(),
    });

    return updated;
  }

  /**
   * Recalculate matches visibility based on therapist status
   * Called when a therapist status changes
   */
  public refreshMatchesForTherapist(therapistId: string): void {
    const therapist = this.therapists.get(therapistId);
    if (!therapist) return;

    const isVisible = therapist.approvalStatus === 'APPROVED' && therapist.isAcceptingPatients;

    this.matches.forEach((match) => {
      if (match.therapistId === therapistId) {
        match.isHidden = !isVisible;
        match.updatedAt = new Date();
      }
    });
  }

  // ===========================================================================
  // USER OPERATIONS
  // ===========================================================================

  public getUserById(id: string): DbUser | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): DbUser | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  public getAllUsers(): DbUser[] {
    return Array.from(this.users.values());
  }

  public createUser(user: DbUser): DbUser {
    this.users.set(user.id, user);
    this.emit({
      type: 'USER_CREATED',
      entityType: 'USER',
      entityId: user.id,
      timestamp: new Date(),
      data: { email: user.email, role: user.role },
    });
    return user;
  }

  public updateUser(id: string, updates: Partial<DbUser>): DbUser | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    this.emit({
      type: 'USER_UPDATED',
      entityType: 'USER',
      entityId: id,
      timestamp: new Date(),
      data: updates,
    });
    return updated;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  public getStats() {
    const therapists = Array.from(this.therapists.values());
    const patients = Array.from(this.patients.values());
    const sessions = Array.from(this.sessions.values());

    return {
      therapists: {
        total: therapists.length,
        pendingInfo: therapists.filter((t) => t.approvalStatus === 'PENDING_INFO').length,
        awaitingApproval: therapists.filter((t) => t.approvalStatus === 'AWAITING_APPROVAL').length,
        approved: therapists.filter((t) => t.approvalStatus === 'APPROVED').length,
        rejected: therapists.filter((t) => t.approvalStatus === 'REJECTED').length,
        suspended: therapists.filter((t) => t.approvalStatus === 'SUSPENDED').length,
      },
      patients: {
        total: patients.length,
        active: patients.filter((p) => p.questionnaireCompleted).length,
      },
      sessions: {
        total: sessions.length,
        pending: sessions.filter((s) => s.status === 'PENDING_THERAPIST_APPROVAL').length,
        approved: sessions.filter((s) => s.status === 'APPROVED').length,
        completed: sessions.filter((s) => s.status === 'COMPLETED').length,
      },
      notifications: {
        total: this.notifications.size,
        unread: Array.from(this.notifications.values()).filter((n) => !n.isRead).length,
      },
      auditLogs: {
        total: this.auditLogs.size,
      },
      emails: {
        total: this.emailLogs.size,
        sent: Array.from(this.emailLogs.values()).filter((e) => e.status === 'SENT').length,
      },
    };
  }

  // ===========================================================================
  // INITIALIZATION WITH DEFAULT DATA
  // ===========================================================================

  private initializeDefaultData(): void {
    // Create admin user
    this.users.set('user-admin-1', {
      id: 'user-admin-1',
      email: 'admin@matchmind.co.il',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });

    // Create owner user
    this.users.set('user-owner-1', {
      id: 'user-owner-1',
      email: 'owner@matchmind.co.il',
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });

    // Create therapists (matching existing mock-data.ts structure)
    const therapistData: Array<Omit<DbTherapist, 'createdAt' | 'updatedAt'>> = [
      {
        id: 'therapist-1',
        userId: 'user-therapist-1',
        firstName: 'רחל',
        lastName: 'כהן',
        email: 'rachel.cohen@example.com',
        phone: '052-1234567',
        gender: 'FEMALE',
        title: 'ד"ר',
        bio: 'Specializing in cognitive behavioral therapy with over 12 years of experience.',
        bioHebrew: 'מתמחה בטיפול קוגניטיבי-התנהגותי עם ניסיון של למעלה מ-12 שנים.',
        city: 'תל אביב',
        address: 'רחוב דיזנגוף 120',
        licenseNumber: 'PSY-12345',
        photoUrl: null,
        photoThumbnailUrl: null,
        offersOnline: true,
        offersInPerson: true,
        languages: ['he', 'en'],
        approaches: ['CBT', 'PSYCHODYNAMIC'],
        specializations: ['ANXIETY', 'DEPRESSION', 'RELATIONSHIPS'],
        acceptedHealthFunds: ['MACCABI', 'CLALIT', 'PRIVATE'],
        sessionPrice: 450,
        sessionDuration: 50,
        yearsOfExperience: 12,
        education: ['PhD Psychology, Tel Aviv University'],
        approvalStatus: 'APPROVED',
        approvalNote: null,
        approvedBy: 'user-admin-1',
        rejectionReason: null,
        suspensionReason: null,
        missingDocuments: [],
        profileCompleted: true,
        isAcceptingPatients: true,
        approvedAt: new Date('2024-01-15'),
        rejectedAt: null,
        suspendedAt: null,
        // Matching metadata
        communicationStyles: ['DIRECT', 'STRUCTURED'],
        therapyStyles: ['STRUCTURED', 'DIRECTIVE'],
        emotionalFocus: ['TOOLS', 'ACCOUNTABILITY'],
        religiousAffiliation: 'SECULAR',
        militaryExperience: false,
        treatsAgeGroups: ['ADULTS', 'ELDERLY'],
      },
      {
        id: 'therapist-2',
        userId: 'user-therapist-2',
        firstName: 'דוד',
        lastName: 'לוי',
        email: 'david.levi@example.com',
        phone: '053-9876543',
        gender: 'MALE',
        title: '',
        bio: 'Experienced in trauma therapy and EMDR for veterans and civilians.',
        bioHebrew: 'מנוסה בטיפול בטראומה ו-EMDR למילואימניקים ואזרחים.',
        city: 'ירושלים',
        address: 'רחוב יפו 42',
        licenseNumber: 'PSY-23456',
        photoUrl: null,
        photoThumbnailUrl: null,
        offersOnline: true,
        offersInPerson: true,
        languages: ['he', 'en', 'ru'],
        approaches: ['EMDR', 'PSYCHODYNAMIC', 'INTEGRATIVE'],
        specializations: ['TRAUMA_PTSD', 'MILITARY_VETERANS', 'ANXIETY'],
        acceptedHealthFunds: ['CLALIT', 'MEUHEDET', 'PRIVATE'],
        sessionPrice: 500,
        sessionDuration: 50,
        yearsOfExperience: 18,
        education: ['MA Clinical Psychology, Hebrew University'],
        approvalStatus: 'APPROVED',
        approvalNote: null,
        approvedBy: 'user-admin-1',
        rejectionReason: null,
        suspensionReason: null,
        missingDocuments: [],
        profileCompleted: true,
        isAcceptingPatients: true,
        approvedAt: new Date('2024-02-01'),
        rejectedAt: null,
        suspendedAt: null,
        // Matching metadata
        communicationStyles: ['GENTLE', 'ANALYTICAL'],
        therapyStyles: ['EXPLORATORY', 'FLEXIBLE'],
        emotionalFocus: ['VALIDATION', 'EXPLORATION'],
        religiousAffiliation: 'SECULAR',
        militaryExperience: true,
        treatsAgeGroups: ['ADULTS'],
      },
      {
        id: 'therapist-3',
        userId: 'user-therapist-3',
        firstName: 'מיכל',
        lastName: 'אברהם',
        email: 'michal.avraham@example.com',
        phone: '054-5551234',
        gender: 'FEMALE',
        title: '',
        bio: 'Specializing in child and adolescent therapy with art therapy integration.',
        bioHebrew: 'מתמחה בטיפול בילדים ומתבגרים עם שילוב טיפול באמנות.',
        city: 'חיפה',
        address: 'רחוב הרצל 88',
        licenseNumber: 'PSY-34567',
        photoUrl: null,
        photoThumbnailUrl: null,
        offersOnline: true,
        offersInPerson: true,
        languages: ['he', 'en'],
        approaches: ['ART_THERAPY', 'PLAY_THERAPY', 'CBT'],
        specializations: ['CHILDREN', 'ADOLESCENTS', 'ANXIETY', 'ADHD'],
        acceptedHealthFunds: ['MACCABI', 'LEUMIT', 'PRIVATE'],
        sessionPrice: 400,
        sessionDuration: 45,
        yearsOfExperience: 8,
        education: ['MA Child Psychology, Haifa University'],
        approvalStatus: 'APPROVED',
        approvalNote: null,
        approvedBy: 'user-admin-1',
        rejectionReason: null,
        suspensionReason: null,
        missingDocuments: [],
        profileCompleted: true,
        isAcceptingPatients: true,
        approvedAt: new Date('2024-03-10'),
        rejectedAt: null,
        suspendedAt: null,
        // Matching metadata
        communicationStyles: ['GENTLE', 'SPIRITUAL'],
        therapyStyles: ['EXPLORATORY', 'FLEXIBLE'],
        emotionalFocus: ['VALIDATION', 'EXPLORATION'],
        religiousAffiliation: 'TRADITIONAL',
        militaryExperience: false,
        treatsAgeGroups: ['CHILDREN', 'ADOLESCENTS'],
      },
      {
        id: 'therapist-4',
        userId: 'user-therapist-4',
        firstName: 'יוסי',
        lastName: 'מזרחי',
        email: 'yossi.mizrachi@example.com',
        phone: '050-7778899',
        gender: 'MALE',
        title: 'פרופ\'',
        bio: 'Professor of clinical psychology specializing in couples and family therapy.',
        bioHebrew: 'פרופסור לפסיכולוגיה קלינית המתמחה בטיפול זוגי ומשפחתי.',
        city: 'תל אביב',
        address: 'רחוב רוטשילד 55',
        licenseNumber: 'PSY-45678',
        photoUrl: null,
        photoThumbnailUrl: null,
        offersOnline: true,
        offersInPerson: true,
        languages: ['he', 'en', 'fr'],
        approaches: ['PSYCHODYNAMIC', 'SYSTEMIC', 'EFT'],
        specializations: ['COUPLES', 'FAMILY', 'RELATIONSHIPS', 'LIFE_TRANSITIONS'],
        acceptedHealthFunds: ['MACCABI', 'CLALIT', 'MEUHEDET', 'PRIVATE'],
        sessionPrice: 600,
        sessionDuration: 50,
        yearsOfExperience: 25,
        education: ['PhD Clinical Psychology, Tel Aviv University'],
        approvalStatus: 'APPROVED',
        approvalNote: null,
        approvedBy: 'user-admin-1',
        rejectionReason: null,
        suspensionReason: null,
        missingDocuments: [],
        profileCompleted: true,
        isAcceptingPatients: true,
        approvedAt: new Date('2024-01-05'),
        rejectedAt: null,
        suspendedAt: null,
        // Matching metadata
        communicationStyles: ['ANALYTICAL', 'GENTLE'],
        therapyStyles: ['EXPLORATORY', 'STRUCTURED'],
        emotionalFocus: ['EXPLORATION', 'TOOLS'],
        religiousAffiliation: 'SECULAR',
        militaryExperience: false,
        treatsAgeGroups: ['ADULTS', 'ELDERLY'],
      },
      {
        id: 'therapist-5',
        userId: 'user-therapist-5',
        firstName: 'נועה',
        lastName: 'שרון',
        email: 'noa.sharon@example.com',
        phone: '052-3334455',
        gender: 'FEMALE',
        title: '',
        bio: 'Focusing on mindfulness-based therapy and stress management for young adults.',
        bioHebrew: 'מתמקדת בטיפול מבוסס מיינדפולנס וניהול לחץ למבוגרים צעירים.',
        city: 'רמת גן',
        address: 'רחוב ביאליק 12',
        licenseNumber: 'PSY-56789',
        photoUrl: null,
        photoThumbnailUrl: null,
        offersOnline: true,
        offersInPerson: false,
        languages: ['he', 'en'],
        approaches: ['MINDFULNESS', 'ACT', 'CBT'],
        specializations: ['STRESS', 'ANXIETY', 'DEPRESSION', 'SLEEP_DISORDERS'],
        acceptedHealthFunds: ['MACCABI', 'PRIVATE'],
        sessionPrice: 380,
        sessionDuration: 50,
        yearsOfExperience: 6,
        education: ['MA Clinical Psychology, Bar Ilan University'],
        approvalStatus: 'APPROVED',
        approvalNote: null,
        approvedBy: 'user-admin-1',
        rejectionReason: null,
        suspensionReason: null,
        missingDocuments: [],
        profileCompleted: true,
        isAcceptingPatients: true,
        approvedAt: new Date('2024-04-15'),
        rejectedAt: null,
        suspendedAt: null,
        // Matching metadata
        communicationStyles: ['STRUCTURED', 'DIRECT'],
        therapyStyles: ['STRUCTURED', 'DIRECTIVE'],
        emotionalFocus: ['TOOLS', 'ACCOUNTABILITY'],
        religiousAffiliation: 'SECULAR',
        militaryExperience: false,
        treatsAgeGroups: ['ADULTS', 'ADOLESCENTS'],
      },
      // NEW: Therapist awaiting approval
      {
        id: 'therapist-6',
        userId: 'user-therapist-6',
        firstName: 'שרה',
        lastName: 'גולדברג',
        email: 'sarah.goldberg@example.com',
        phone: '054-1112233',
        gender: 'FEMALE',
        title: '',
        bio: 'New therapist awaiting approval.',
        bioHebrew: 'מטפלת חדשה ממתינה לאישור.',
        city: 'חיפה',
        address: 'רחוב הנמל 15',
        licenseNumber: 'PSY-67890',
        photoUrl: null,
        photoThumbnailUrl: null,
        offersOnline: true,
        offersInPerson: true,
        languages: ['he', 'en'],
        approaches: ['CBT'],
        specializations: ['ANXIETY'],
        acceptedHealthFunds: ['MACCABI'],
        sessionPrice: 350,
        sessionDuration: 50,
        yearsOfExperience: 3,
        education: ['MA Psychology, Haifa University'],
        approvalStatus: 'AWAITING_APPROVAL',
        approvalNote: null,
        approvedBy: null,
        rejectionReason: null,
        suspensionReason: null,
        missingDocuments: [],
        profileCompleted: true,
        isAcceptingPatients: false,
        approvedAt: null,
        rejectedAt: null,
        suspendedAt: null,
        // Matching metadata
        communicationStyles: ['GENTLE'],
        therapyStyles: ['STRUCTURED'],
        emotionalFocus: ['VALIDATION'],
        religiousAffiliation: 'TRADITIONAL',
        militaryExperience: false,
        treatsAgeGroups: ['ADULTS'],
      },
      // NEW: Therapist with missing documents
      {
        id: 'therapist-7',
        userId: 'user-therapist-7',
        firstName: 'אבי',
        lastName: 'רוזן',
        email: 'avi.rosen@example.com',
        phone: '050-4445566',
        gender: 'MALE',
        title: '',
        bio: 'Therapist with missing documents.',
        bioHebrew: 'מטפל עם מסמכים חסרים.',
        city: 'באר שבע',
        address: 'רחוב רגר 8',
        licenseNumber: 'PSY-78901',
        photoUrl: null,
        photoThumbnailUrl: null,
        offersOnline: true,
        offersInPerson: false,
        languages: ['he'],
        approaches: ['PSYCHODYNAMIC'],
        specializations: ['DEPRESSION'],
        acceptedHealthFunds: ['CLALIT'],
        sessionPrice: 300,
        sessionDuration: 50,
        yearsOfExperience: 2,
        education: [],
        approvalStatus: 'PENDING_INFO',
        approvalNote: null,
        approvedBy: null,
        rejectionReason: null,
        suspensionReason: null,
        missingDocuments: ['license', 'diploma'],
        profileCompleted: false,
        isAcceptingPatients: false,
        approvedAt: null,
        rejectedAt: null,
        suspendedAt: null,
        // Matching metadata
        communicationStyles: ['ANALYTICAL'],
        therapyStyles: ['EXPLORATORY'],
        emotionalFocus: ['EXPLORATION'],
        religiousAffiliation: 'SECULAR',
        militaryExperience: false,
        treatsAgeGroups: ['ADULTS'],
      },
    ];

    therapistData.forEach((t) => {
      this.therapists.set(t.id, {
        ...t,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date(),
      });
      this.users.set(t.userId, {
        id: t.userId,
        email: t.email,
        role: 'THERAPIST',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date(),
      });
    });

    // Create patient
    const patientData: Omit<DbPatient, 'createdAt' | 'updatedAt'> = {
      id: 'patient-1',
      userId: 'user-patient-1',
      firstName: 'ישראל',
      lastName: 'ישראלי',
      email: 'patient@example.com',
      phone: '050-1234567',
      city: 'תל אביב',
      healthFund: 'MACCABI',
      preferredOnline: true,
      preferredGender: null,
      preferredLanguages: ['he'],
      preferredApproaches: [],
      preferredDays: ['SUNDAY', 'TUESDAY', 'THURSDAY'],
      onboardingCompleted: true,
      questionnaireCompleted: true,
      // Objective demographic data
      age: 34,
      dateOfBirth: new Date('1991-08-15'),
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      hasChildren: true,
      numberOfChildren: 2,
      militaryService: 'MANDATORY',
      religiousAffiliation: 'SECULAR',
      nativeLanguage: 'he',
      workStatus: 'EMPLOYED',
      educationLevel: 'BACHELORS',
    };
    this.patients.set(patientData.id, {
      ...patientData,
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date(),
    });
    this.users.set(patientData.userId, {
      id: patientData.userId,
      email: patientData.email,
      role: 'PATIENT',
      status: 'ACTIVE',
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date(),
    });

    // Create sample matches (only for approved therapists)
    const matchData: Array<Omit<DbMatch, 'createdAt' | 'updatedAt'>> = [
      {
        id: 'match-1',
        patientId: 'patient-1',
        therapistId: 'therapist-1',
        overallScore: 92,
        xFactorScore: 88,
        healthFundScore: 100,
        availabilityScore: 85,
        locationScore: 90,
        preferenceScore: 90,
        objectiveFitScore: 95,
        subjectiveFitScore: 90,
        scoreBreakdown: {},
        explanationHe: 'התאמה טיפולית גבוהה מאוד',
        explanationEn: 'Very high therapeutic compatibility',
        explanationItems: [
          { category: 'practical', matched: true, labelHe: 'קופת חולים תואמת', labelEn: 'Health fund match' },
          { category: 'subjective', matched: true, labelHe: 'סגנון תקשורת ישיר', labelEn: 'Direct communication style' },
          { category: 'objective', matched: true, labelHe: 'מטפלת במבוגרים', labelEn: 'Treats adults' },
        ],
        isViewed: true,
        isFavorited: true,
        isHidden: false,
      },
      {
        id: 'match-2',
        patientId: 'patient-1',
        therapistId: 'therapist-2',
        overallScore: 85,
        xFactorScore: 82,
        healthFundScore: 0,
        availabilityScore: 75,
        locationScore: 85,
        preferenceScore: 85,
        objectiveFitScore: 90,
        subjectiveFitScore: 70,
        scoreBreakdown: {},
        explanationHe: 'התאמה טיפולית גבוהה',
        explanationEn: 'High therapeutic compatibility',
        explanationItems: [
          { category: 'practical', matched: false, labelHe: 'קופת חולים לא תואמת', labelEn: 'Health fund mismatch' },
          { category: 'objective', matched: true, labelHe: 'ניסיון עם שירות צבאי', labelEn: 'Military experience' },
          { category: 'subjective', matched: false, labelHe: 'סגנון תקשורת לא תואם', labelEn: 'Communication style mismatch' },
        ],
        isViewed: false,
        isFavorited: false,
        isHidden: false,
      },
    ];

    matchData.forEach((m) => {
      this.matches.set(m.id, {
        ...m,
        createdAt: new Date('2024-05-16'),
        updatedAt: new Date(),
      });
    });

    // Create sample sessions
    const sessionData: Array<Omit<DbSession, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        patientId: 'patient-1',
        therapistId: 'therapist-1',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'REGULAR',
        isOnline: true,
        status: 'APPROVED',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        price: 0,
        healthFund: 'MACCABI',
        therapistNotes: null,
        cancellationReason: null,
      },
      {
        patientId: 'patient-1',
        therapistId: 'therapist-1',
        scheduledAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        duration: 50,
        type: 'REGULAR',
        isOnline: true,
        status: 'PENDING_THERAPIST_APPROVAL',
        meetingUrl: null,
        price: 0,
        healthFund: 'MACCABI',
        therapistNotes: null,
        cancellationReason: null,
      },
    ];

    sessionData.forEach((s, i) => {
      const session: DbSession = {
        ...s,
        id: `session-${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.sessions.set(session.id, session);
    });

    // Create availability slots for approved therapists
    const availabilityData: Array<Omit<DbAvailabilitySlot, 'id' | 'createdAt' | 'updatedAt'>> = [
      // Therapist 1 availability
      { therapistId: 'therapist-1', dayOfWeek: 'Sunday', startTime: '09:00', endTime: '17:00', isOnline: true, isInPerson: true },
      { therapistId: 'therapist-1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isOnline: true, isInPerson: true },
      { therapistId: 'therapist-1', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '14:00', isOnline: true, isInPerson: false },
      { therapistId: 'therapist-1', dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '18:00', isOnline: true, isInPerson: true },
      // Therapist 2 availability
      { therapistId: 'therapist-2', dayOfWeek: 'Sunday', startTime: '10:00', endTime: '19:00', isOnline: true, isInPerson: true },
      { therapistId: 'therapist-2', dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '19:00', isOnline: true, isInPerson: true },
      { therapistId: 'therapist-2', dayOfWeek: 'Thursday', startTime: '12:00', endTime: '20:00', isOnline: true, isInPerson: true },
      // Therapist 3 availability
      { therapistId: 'therapist-3', dayOfWeek: 'Sunday', startTime: '08:00', endTime: '15:00', isOnline: true, isInPerson: true },
      { therapistId: 'therapist-3', dayOfWeek: 'Monday', startTime: '14:00', endTime: '20:00', isOnline: true, isInPerson: true },
      // Therapist 6 (awaiting approval) availability
      { therapistId: 'therapist-6', dayOfWeek: 'Sunday', startTime: '09:00', endTime: '16:00', isOnline: true, isInPerson: true },
      { therapistId: 'therapist-6', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '16:00', isOnline: true, isInPerson: true },
    ];

    availabilityData.forEach((a, i) => {
      const slot: DbAvailabilitySlot = {
        ...a,
        id: `avail-${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.availabilitySlots.set(slot.id, slot);
    });

    // Create documents for therapists
    const documentData: Array<Omit<DbTherapistDocument, 'id' | 'createdAt' | 'updatedAt'>> = [
      // Therapist 1 documents (all approved)
      { therapistId: 'therapist-1', documentType: 'LICENSE', fileName: 'license_rachel_cohen.pdf', fileUrl: '/uploads/license_1.pdf', fileSize: 245678, status: 'APPROVED', uploadedAt: new Date('2024-01-12'), reviewedAt: new Date('2024-01-14'), reviewedBy: 'user-admin-1', expiresAt: new Date('2026-01-12'), notes: null },
      { therapistId: 'therapist-1', documentType: 'DIPLOMA', fileName: 'diploma_tel_aviv.pdf', fileUrl: '/uploads/diploma_1.pdf', fileSize: 567890, status: 'APPROVED', uploadedAt: new Date('2024-01-12'), reviewedAt: new Date('2024-01-14'), reviewedBy: 'user-admin-1', expiresAt: null, notes: null },
      { therapistId: 'therapist-1', documentType: 'INSURANCE', fileName: 'insurance_2024.pdf', fileUrl: '/uploads/insurance_1.pdf', fileSize: 123456, status: 'APPROVED', uploadedAt: new Date('2024-01-12'), reviewedAt: new Date('2024-01-14'), reviewedBy: 'user-admin-1', expiresAt: new Date('2025-01-01'), notes: null },
      // Therapist 2 documents
      { therapistId: 'therapist-2', documentType: 'LICENSE', fileName: 'license_david.pdf', fileUrl: '/uploads/license_2.pdf', fileSize: 234567, status: 'APPROVED', uploadedAt: new Date('2024-01-28'), reviewedAt: new Date('2024-02-01'), reviewedBy: 'user-admin-1', expiresAt: new Date('2025-12-01'), notes: null },
      { therapistId: 'therapist-2', documentType: 'DIPLOMA', fileName: 'diploma_huji.pdf', fileUrl: '/uploads/diploma_2.pdf', fileSize: 456789, status: 'APPROVED', uploadedAt: new Date('2024-01-28'), reviewedAt: new Date('2024-02-01'), reviewedBy: 'user-admin-1', expiresAt: null, notes: null },
      // Therapist 6 documents (awaiting approval)
      { therapistId: 'therapist-6', documentType: 'LICENSE', fileName: 'license_sarah.pdf', fileUrl: '/uploads/license_6.pdf', fileSize: 278901, status: 'PENDING', uploadedAt: new Date(), reviewedAt: null, reviewedBy: null, expiresAt: null, notes: null },
      { therapistId: 'therapist-6', documentType: 'DIPLOMA', fileName: 'diploma_haifa.pdf', fileUrl: '/uploads/diploma_6.pdf', fileSize: 389012, status: 'PENDING', uploadedAt: new Date(), reviewedAt: null, reviewedBy: null, expiresAt: null, notes: null },
      // Therapist 7 documents (pending info - missing some)
      { therapistId: 'therapist-7', documentType: 'INSURANCE', fileName: 'insurance_avi.pdf', fileUrl: '/uploads/insurance_7.pdf', fileSize: 167890, status: 'PENDING', uploadedAt: new Date(), reviewedAt: null, reviewedBy: null, expiresAt: null, notes: 'Waiting for license and diploma' },
    ];

    documentData.forEach((d, i) => {
      const doc: DbTherapistDocument = {
        ...d,
        id: `doc-${i + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.therapistDocuments.set(doc.id, doc);
    });

    console.log('[MockDB] Initialized with default data');
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const mockDb = new MockDatabase();

// Export for testing
export { MockDatabase };
