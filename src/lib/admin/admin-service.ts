/**
 * Admin Service - Unified Business Logic Layer
 *
 * This service ensures that ALL admin actions:
 * 1. Update the unified mock database
 * 2. Enforce state machine transitions
 * 3. Trigger transactional emails (with idempotency)
 * 4. Create notifications for affected users
 * 5. Log all actions to audit trail
 * 6. Sync with matching engine visibility
 *
 * NO UI-ONLY ACTIONS - Every button press results in real system changes.
 */

import {
  mockDb,
  type DbTherapist,
  type DbAuditLog,
  type DbNotification,
  type DbEmailLog,
  type TherapistApprovalStatus,
  isValidTransition,
} from '../database/mock-db';
import {
  sendEmail,
  sendTherapistApproved,
  sendTherapistRejected,
} from '../email/service';
import type { EmailPayload } from '../email/types';

// =============================================================================
// TYPES
// =============================================================================

export interface AdminContext {
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: 'ADMIN' | 'OWNER';
  ipAddress?: string;
  userAgent?: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  auditLogId?: string;
  emailId?: string;
  notificationId?: string;
}

export interface TherapistApplicationResult {
  therapist: DbTherapist;
  auditLog: DbAuditLog;
  notification: DbNotification;
  emailLog: DbEmailLog | null;
}

// =============================================================================
// EMAIL CONTENT GENERATORS
// =============================================================================

function generateApprovalEmail(therapist: DbTherapist): {
  subject: string;
  body: string;
  bodyHe: string;
} {
  return {
    subject: 'Welcome to MatchMind - Your Application Has Been Approved! / ברוכים הבאים ל-MatchMind',
    body: `
Dear ${therapist.firstName} ${therapist.lastName},

Congratulations! Your application to join MatchMind as a therapist has been approved.

Your profile is now live and patients can find you in our matching system.

Next Steps:
1. Log in to your dashboard to review your profile
2. Set your availability schedule
3. Start receiving patient match requests

Thank you for joining MatchMind!

Best regards,
The MatchMind Team
    `.trim(),
    bodyHe: `
שלום ${therapist.firstName} ${therapist.lastName},

מזל טוב! בקשתך להצטרף ל-MatchMind כמטפל/ת אושרה.

הפרופיל שלך כעת פעיל ומטופלים יכולים למצוא אותך במערכת ההתאמות שלנו.

השלבים הבאים:
1. התחבר/י ללוח הבקרה שלך כדי לבדוק את הפרופיל
2. הגדר/י את לוח הזמינות שלך
3. התחל/י לקבל בקשות התאמה ממטופלים

תודה שהצטרפת ל-MatchMind!

בברכה,
צוות MatchMind
    `.trim(),
  };
}

function generateRejectionEmail(
  therapist: DbTherapist,
  reason: string
): { subject: string; body: string; bodyHe: string } {
  return {
    subject: 'MatchMind Application Status Update / עדכון סטטוס בקשה ל-MatchMind',
    body: `
Dear ${therapist.firstName} ${therapist.lastName},

Thank you for your interest in joining MatchMind as a therapist.

After careful review, we regret to inform you that we are unable to approve your application at this time.

Reason: ${reason}

If you believe this decision was made in error, or if your circumstances have changed, you are welcome to reapply in the future.

Best regards,
The MatchMind Team
    `.trim(),
    bodyHe: `
שלום ${therapist.firstName} ${therapist.lastName},

תודה על התעניינותך להצטרף ל-MatchMind כמטפל/ת.

לאחר בדיקה מעמיקה, אנו מצטערים להודיע לך שאיננו יכולים לאשר את בקשתך בשלב זה.

סיבה: ${reason}

אם את/ה מאמין/ה שהוחלטה בטעות, או אם הנסיבות שלך השתנו, את/ה מוזמן/ת להגיש בקשה חדשה בעתיד.

בברכה,
צוות MatchMind
    `.trim(),
  };
}

function generateDocumentsRequestEmail(
  therapist: DbTherapist,
  documents: string[],
  note: string
): { subject: string; body: string; bodyHe: string } {
  const documentList = documents.map((d) => `- ${d}`).join('\n');
  return {
    subject: 'MatchMind - Additional Documents Required / נדרשים מסמכים נוספים',
    body: `
Dear ${therapist.firstName} ${therapist.lastName},

Thank you for your application to join MatchMind.

To complete your application, we need the following documents:
${documentList}

Note from our team: ${note}

Please log in to your dashboard and upload the required documents.

Best regards,
The MatchMind Team
    `.trim(),
    bodyHe: `
שלום ${therapist.firstName} ${therapist.lastName},

תודה על בקשתך להצטרף ל-MatchMind.

להשלמת הבקשה, אנו צריכים את המסמכים הבאים:
${documentList}

הערה מהצוות שלנו: ${note}

אנא התחבר/י ללוח הבקרה שלך והעלה/י את המסמכים הנדרשים.

בברכה,
צוות MatchMind
    `.trim(),
  };
}

function generateSuspensionEmail(
  therapist: DbTherapist,
  reason: string
): { subject: string; body: string; bodyHe: string } {
  return {
    subject: 'MatchMind Account Suspended / החשבון שלך הושעה',
    body: `
Dear ${therapist.firstName} ${therapist.lastName},

Your MatchMind therapist account has been temporarily suspended.

Reason: ${reason}

During this suspension:
- Your profile will not be visible to patients
- You cannot receive new patient requests
- Existing sessions remain scheduled

If you have questions about this suspension, please contact our support team.

Best regards,
The MatchMind Team
    `.trim(),
    bodyHe: `
שלום ${therapist.firstName} ${therapist.lastName},

חשבון המטפל שלך ב-MatchMind הושעה באופן זמני.

סיבה: ${reason}

במהלך ההשעיה:
- הפרופיל שלך לא יהיה גלוי למטופלים
- לא תוכל/י לקבל בקשות מטופלים חדשות
- פגישות קיימות נשארות מתוכננות

אם יש לך שאלות לגבי ההשעיה, אנא פנה/י לצוות התמיכה שלנו.

בברכה,
צוות MatchMind
    `.trim(),
  };
}

// =============================================================================
// ADMIN SERVICE CLASS
// =============================================================================

class AdminService {
  /**
   * Approve a therapist application
   *
   * This action:
   * 1. Validates state transition (must be from AWAITING_APPROVAL)
   * 2. Updates therapist status in database
   * 3. Makes therapist visible in matching engine
   * 4. Sends approval email (idempotent)
   * 5. Creates notification for therapist
   * 6. Logs to audit trail
   */
  async approveTherapist(
    therapistId: string,
    ctx: AdminContext,
    options?: { note?: string }
  ): Promise<ActionResult<TherapistApplicationResult>> {
    const therapist = mockDb.getTherapistById(therapistId);
    if (!therapist) {
      return { success: false, error: 'Therapist not found' };
    }

    // Validate state transition
    if (therapist.approvalStatus !== 'AWAITING_APPROVAL') {
      return {
        success: false,
        error: `Cannot approve therapist with status: ${therapist.approvalStatus}. Must be AWAITING_APPROVAL.`,
      };
    }

    const previousStatus = therapist.approvalStatus;

    // Perform state transition
    const result = mockDb.transitionTherapistStatus(therapistId, 'APPROVED', {
      adminId: ctx.adminId,
      adminName: ctx.adminName,
      reason: options?.note,
    });

    if (!result.success || !result.therapist) {
      return { success: false, error: result.error };
    }

    // Generate idempotency key
    const idempotencyKey = `approve-${therapistId}-${new Date().toISOString().split('T')[0]}`;

    // Send email (with idempotency protection)
    let emailLog: DbEmailLog | null = null;
    if (!mockDb.wasEmailSent(idempotencyKey)) {
      const emailContent = generateApprovalEmail(result.therapist);

      // Send via email service
      const emailResult = await sendTherapistApproved(
        result.therapist.email,
        `${result.therapist.firstName} ${result.therapist.lastName}`
      );

      // Log email
      emailLog = mockDb.logEmail({
        to: result.therapist.email,
        type: 'THERAPIST_APPROVED',
        subject: emailContent.subject,
        recipientName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        relatedEntityType: 'THERAPIST',
        relatedEntityId: therapistId,
        triggeredBy: ctx.adminId,
        triggeredByAction: 'APPROVE_THERAPIST',
        status: emailResult.success ? 'SENT' : 'FAILED',
        sentAt: emailResult.success ? new Date() : null,
        errorMessage: emailResult.error || null,
        idempotencyKey,
      });
    }

    // Create notification for therapist
    const notification = mockDb.createNotification({
      recipientId: result.therapist.userId,
      recipientRole: 'THERAPIST',
      type: 'THERAPIST_APPROVED',
      title: 'Application Approved',
      titleHe: 'הבקשה אושרה',
      message: 'Congratulations! Your application has been approved.',
      messageHe: 'מזל טוב! בקשתך אושרה.',
      priority: 'high',
      data: { therapistId, approvedBy: ctx.adminName },
      isRead: false,
      readAt: null,
      emailSent: emailLog !== null,
      emailSentAt: emailLog?.sentAt || null,
      emailId: emailLog?.id || null,
    });

    // Create audit log
    const auditLog = mockDb.createAuditLog({
      action: 'THERAPIST_APPROVED',
      entityType: 'THERAPIST',
      entityId: therapistId,
      userId: ctx.adminId,
      userName: ctx.adminName,
      userRole: ctx.adminRole,
      previousValue: { approvalStatus: previousStatus },
      newValue: { approvalStatus: 'APPROVED', note: options?.note },
      metadata: {
        therapistName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        therapistEmail: result.therapist.email,
      },
      emailTriggered: emailLog !== null,
      emailId: emailLog?.id || null,
      ipAddress: ctx.ipAddress || null,
      userAgent: ctx.userAgent || null,
    });

    return {
      success: true,
      data: {
        therapist: result.therapist,
        auditLog,
        notification,
        emailLog,
      },
      auditLogId: auditLog.id,
      emailId: emailLog?.id,
      notificationId: notification.id,
    };
  }

  /**
   * Reject a therapist application
   */
  async rejectTherapist(
    therapistId: string,
    ctx: AdminContext,
    reason: string
  ): Promise<ActionResult<TherapistApplicationResult>> {
    const therapist = mockDb.getTherapistById(therapistId);
    if (!therapist) {
      return { success: false, error: 'Therapist not found' };
    }

    if (
      therapist.approvalStatus !== 'AWAITING_APPROVAL' &&
      therapist.approvalStatus !== 'SUSPENDED'
    ) {
      return {
        success: false,
        error: `Cannot reject therapist with status: ${therapist.approvalStatus}`,
      };
    }

    const previousStatus = therapist.approvalStatus;

    const result = mockDb.transitionTherapistStatus(therapistId, 'REJECTED', {
      adminId: ctx.adminId,
      adminName: ctx.adminName,
      reason,
    });

    if (!result.success || !result.therapist) {
      return { success: false, error: result.error };
    }

    const idempotencyKey = `reject-${therapistId}-${Date.now()}`;

    let emailLog: DbEmailLog | null = null;
    if (!mockDb.wasEmailSent(idempotencyKey)) {
      const emailContent = generateRejectionEmail(result.therapist, reason);

      const emailResult = await sendTherapistRejected(
        result.therapist.email,
        `${result.therapist.firstName} ${result.therapist.lastName}`,
        reason
      );

      emailLog = mockDb.logEmail({
        to: result.therapist.email,
        type: 'THERAPIST_REJECTED',
        subject: emailContent.subject,
        recipientName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        relatedEntityType: 'THERAPIST',
        relatedEntityId: therapistId,
        triggeredBy: ctx.adminId,
        triggeredByAction: 'REJECT_THERAPIST',
        status: emailResult.success ? 'SENT' : 'FAILED',
        sentAt: emailResult.success ? new Date() : null,
        errorMessage: emailResult.error || null,
        idempotencyKey,
      });
    }

    const notification = mockDb.createNotification({
      recipientId: result.therapist.userId,
      recipientRole: 'THERAPIST',
      type: 'THERAPIST_REJECTED',
      title: 'Application Status Update',
      titleHe: 'עדכון סטטוס בקשה',
      message: `Your application has been reviewed. Reason: ${reason}`,
      messageHe: `הבקשה שלך נבדקה. סיבה: ${reason}`,
      priority: 'high',
      data: { therapistId, reason, rejectedBy: ctx.adminName },
      isRead: false,
      readAt: null,
      emailSent: emailLog !== null,
      emailSentAt: emailLog?.sentAt || null,
      emailId: emailLog?.id || null,
    });

    const auditLog = mockDb.createAuditLog({
      action: 'THERAPIST_REJECTED',
      entityType: 'THERAPIST',
      entityId: therapistId,
      userId: ctx.adminId,
      userName: ctx.adminName,
      userRole: ctx.adminRole,
      previousValue: { approvalStatus: previousStatus },
      newValue: { approvalStatus: 'REJECTED', reason },
      metadata: {
        therapistName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        therapistEmail: result.therapist.email,
        reason,
      },
      emailTriggered: emailLog !== null,
      emailId: emailLog?.id || null,
      ipAddress: ctx.ipAddress || null,
      userAgent: ctx.userAgent || null,
    });

    return {
      success: true,
      data: {
        therapist: result.therapist,
        auditLog,
        notification,
        emailLog,
      },
    };
  }

  /**
   * Request additional documents from therapist
   */
  async requestDocuments(
    therapistId: string,
    ctx: AdminContext,
    documents: string[],
    note: string
  ): Promise<ActionResult<TherapistApplicationResult>> {
    const therapist = mockDb.getTherapistById(therapistId);
    if (!therapist) {
      return { success: false, error: 'Therapist not found' };
    }

    if (therapist.approvalStatus !== 'AWAITING_APPROVAL') {
      return {
        success: false,
        error: `Cannot request documents from therapist with status: ${therapist.approvalStatus}`,
      };
    }

    const previousStatus = therapist.approvalStatus;

    const result = mockDb.transitionTherapistStatus(therapistId, 'PENDING_INFO', {
      adminId: ctx.adminId,
      adminName: ctx.adminName,
      reason: note,
      missingDocuments: documents,
    });

    if (!result.success || !result.therapist) {
      return { success: false, error: result.error };
    }

    const idempotencyKey = `docs-request-${therapistId}-${Date.now()}`;

    let emailLog: DbEmailLog | null = null;
    if (!mockDb.wasEmailSent(idempotencyKey)) {
      const emailContent = generateDocumentsRequestEmail(
        result.therapist,
        documents,
        note
      );

      const emailResult = await sendEmail({
        type: 'THERAPIST_DOCUMENTS_REQUESTED',
        to: result.therapist.email,
        recipientName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        documents,
        note,
      } as EmailPayload);

      emailLog = mockDb.logEmail({
        to: result.therapist.email,
        type: 'THERAPIST_DOCUMENTS_REQUESTED',
        subject: emailContent.subject,
        recipientName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        relatedEntityType: 'THERAPIST',
        relatedEntityId: therapistId,
        triggeredBy: ctx.adminId,
        triggeredByAction: 'REQUEST_DOCUMENTS',
        status: emailResult.success ? 'SENT' : 'FAILED',
        sentAt: emailResult.success ? new Date() : null,
        errorMessage: emailResult.error || null,
        idempotencyKey,
      });
    }

    const notification = mockDb.createNotification({
      recipientId: result.therapist.userId,
      recipientRole: 'THERAPIST',
      type: 'THERAPIST_DOCUMENTS_REQUESTED',
      title: 'Documents Required',
      titleHe: 'נדרשים מסמכים',
      message: `Please upload the following documents: ${documents.join(', ')}`,
      messageHe: `אנא העלה/י את המסמכים הבאים: ${documents.join(', ')}`,
      priority: 'high',
      data: { therapistId, documents, note },
      isRead: false,
      readAt: null,
      emailSent: emailLog !== null,
      emailSentAt: emailLog?.sentAt || null,
      emailId: emailLog?.id || null,
    });

    const auditLog = mockDb.createAuditLog({
      action: 'THERAPIST_DOCUMENTS_REQUESTED',
      entityType: 'THERAPIST',
      entityId: therapistId,
      userId: ctx.adminId,
      userName: ctx.adminName,
      userRole: ctx.adminRole,
      previousValue: { approvalStatus: previousStatus, missingDocuments: [] },
      newValue: { approvalStatus: 'PENDING_INFO', missingDocuments: documents },
      metadata: {
        therapistName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        documents,
        note,
      },
      emailTriggered: emailLog !== null,
      emailId: emailLog?.id || null,
      ipAddress: ctx.ipAddress || null,
      userAgent: ctx.userAgent || null,
    });

    return {
      success: true,
      data: {
        therapist: result.therapist,
        auditLog,
        notification,
        emailLog,
      },
    };
  }

  /**
   * Suspend an approved therapist
   */
  async suspendTherapist(
    therapistId: string,
    ctx: AdminContext,
    reason: string
  ): Promise<ActionResult<TherapistApplicationResult>> {
    const therapist = mockDb.getTherapistById(therapistId);
    if (!therapist) {
      return { success: false, error: 'Therapist not found' };
    }

    if (therapist.approvalStatus !== 'APPROVED') {
      return {
        success: false,
        error: `Cannot suspend therapist with status: ${therapist.approvalStatus}. Must be APPROVED.`,
      };
    }

    const previousStatus = therapist.approvalStatus;

    const result = mockDb.transitionTherapistStatus(therapistId, 'SUSPENDED', {
      adminId: ctx.adminId,
      adminName: ctx.adminName,
      reason,
    });

    if (!result.success || !result.therapist) {
      return { success: false, error: result.error };
    }

    const idempotencyKey = `suspend-${therapistId}-${Date.now()}`;

    let emailLog: DbEmailLog | null = null;
    if (!mockDb.wasEmailSent(idempotencyKey)) {
      const emailContent = generateSuspensionEmail(result.therapist, reason);

      const emailResult = await sendEmail({
        type: 'THERAPIST_SUSPENDED',
        to: result.therapist.email,
        recipientName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        reason,
      } as EmailPayload);

      emailLog = mockDb.logEmail({
        to: result.therapist.email,
        type: 'THERAPIST_SUSPENDED',
        subject: emailContent.subject,
        recipientName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        relatedEntityType: 'THERAPIST',
        relatedEntityId: therapistId,
        triggeredBy: ctx.adminId,
        triggeredByAction: 'SUSPEND_THERAPIST',
        status: emailResult.success ? 'SENT' : 'FAILED',
        sentAt: emailResult.success ? new Date() : null,
        errorMessage: emailResult.error || null,
        idempotencyKey,
      });
    }

    const notification = mockDb.createNotification({
      recipientId: result.therapist.userId,
      recipientRole: 'THERAPIST',
      type: 'THERAPIST_SUSPENDED',
      title: 'Account Suspended',
      titleHe: 'החשבון הושעה',
      message: `Your account has been suspended. Reason: ${reason}`,
      messageHe: `החשבון שלך הושעה. סיבה: ${reason}`,
      priority: 'urgent',
      data: { therapistId, reason, suspendedBy: ctx.adminName },
      isRead: false,
      readAt: null,
      emailSent: emailLog !== null,
      emailSentAt: emailLog?.sentAt || null,
      emailId: emailLog?.id || null,
    });

    const auditLog = mockDb.createAuditLog({
      action: 'THERAPIST_SUSPENDED',
      entityType: 'THERAPIST',
      entityId: therapistId,
      userId: ctx.adminId,
      userName: ctx.adminName,
      userRole: ctx.adminRole,
      previousValue: { approvalStatus: previousStatus, isAcceptingPatients: true },
      newValue: { approvalStatus: 'SUSPENDED', isAcceptingPatients: false, reason },
      metadata: {
        therapistName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        reason,
      },
      emailTriggered: emailLog !== null,
      emailId: emailLog?.id || null,
      ipAddress: ctx.ipAddress || null,
      userAgent: ctx.userAgent || null,
    });

    return {
      success: true,
      data: {
        therapist: result.therapist,
        auditLog,
        notification,
        emailLog,
      },
    };
  }

  /**
   * Unsuspend a therapist (restore to APPROVED)
   */
  async unsuspendTherapist(
    therapistId: string,
    ctx: AdminContext
  ): Promise<ActionResult<TherapistApplicationResult>> {
    const therapist = mockDb.getTherapistById(therapistId);
    if (!therapist) {
      return { success: false, error: 'Therapist not found' };
    }

    if (therapist.approvalStatus !== 'SUSPENDED') {
      return {
        success: false,
        error: `Cannot unsuspend therapist with status: ${therapist.approvalStatus}. Must be SUSPENDED.`,
      };
    }

    const previousStatus = therapist.approvalStatus;

    const result = mockDb.transitionTherapistStatus(therapistId, 'APPROVED', {
      adminId: ctx.adminId,
      adminName: ctx.adminName,
      reason: 'Suspension lifted',
    });

    if (!result.success || !result.therapist) {
      return { success: false, error: result.error };
    }

    const idempotencyKey = `unsuspend-${therapistId}-${Date.now()}`;

    let emailLog: DbEmailLog | null = null;
    if (!mockDb.wasEmailSent(idempotencyKey)) {
      const emailResult = await sendEmail({
        type: 'THERAPIST_UNSUSPENDED',
        to: result.therapist.email,
        recipientName: `${result.therapist.firstName} ${result.therapist.lastName}`,
      } as EmailPayload);

      emailLog = mockDb.logEmail({
        to: result.therapist.email,
        type: 'THERAPIST_UNSUSPENDED',
        subject: 'MatchMind - Your Account Has Been Restored',
        recipientName: `${result.therapist.firstName} ${result.therapist.lastName}`,
        relatedEntityType: 'THERAPIST',
        relatedEntityId: therapistId,
        triggeredBy: ctx.adminId,
        triggeredByAction: 'UNSUSPEND_THERAPIST',
        status: emailResult.success ? 'SENT' : 'FAILED',
        sentAt: emailResult.success ? new Date() : null,
        errorMessage: emailResult.error || null,
        idempotencyKey,
      });
    }

    const notification = mockDb.createNotification({
      recipientId: result.therapist.userId,
      recipientRole: 'THERAPIST',
      type: 'THERAPIST_APPROVED',
      title: 'Account Restored',
      titleHe: 'החשבון שוחזר',
      message: 'Your account suspension has been lifted. You are now active again.',
      messageHe: 'ההשעיה על החשבון שלך הוסרה. החשבון שלך פעיל שוב.',
      priority: 'high',
      data: { therapistId, restoredBy: ctx.adminName },
      isRead: false,
      readAt: null,
      emailSent: emailLog !== null,
      emailSentAt: emailLog?.sentAt || null,
      emailId: emailLog?.id || null,
    });

    const auditLog = mockDb.createAuditLog({
      action: 'THERAPIST_UNSUSPENDED',
      entityType: 'THERAPIST',
      entityId: therapistId,
      userId: ctx.adminId,
      userName: ctx.adminName,
      userRole: ctx.adminRole,
      previousValue: { approvalStatus: previousStatus, isAcceptingPatients: false },
      newValue: { approvalStatus: 'APPROVED', isAcceptingPatients: true },
      metadata: {
        therapistName: `${result.therapist.firstName} ${result.therapist.lastName}`,
      },
      emailTriggered: emailLog !== null,
      emailId: emailLog?.id || null,
      ipAddress: ctx.ipAddress || null,
      userAgent: ctx.userAgent || null,
    });

    return {
      success: true,
      data: {
        therapist: result.therapist,
        auditLog,
        notification,
        emailLog,
      },
    };
  }

  /**
   * Get dashboard statistics
   */
  getStats() {
    return mockDb.getStats();
  }

  /**
   * Get therapist applications with filtering
   */
  getTherapistApplications(options?: {
    status?: TherapistApprovalStatus | 'ALL';
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let therapists = mockDb.getAllTherapists();

    // Filter by status
    if (options?.status && options.status !== 'ALL') {
      therapists = therapists.filter((t) => t.approvalStatus === options.status);
    }

    // Search
    if (options?.search) {
      const search = options.search.toLowerCase();
      therapists = therapists.filter(
        (t) =>
          t.firstName.toLowerCase().includes(search) ||
          t.lastName.toLowerCase().includes(search) ||
          t.email.toLowerCase().includes(search) ||
          t.licenseNumber.toLowerCase().includes(search)
      );
    }

    // Sort by createdAt descending
    therapists.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate status counts
    const allTherapists = mockDb.getAllTherapists();
    const statusCounts = {
      ALL: allTherapists.length,
      PENDING_INFO: allTherapists.filter((t) => t.approvalStatus === 'PENDING_INFO').length,
      AWAITING_APPROVAL: allTherapists.filter((t) => t.approvalStatus === 'AWAITING_APPROVAL').length,
      APPROVED: allTherapists.filter((t) => t.approvalStatus === 'APPROVED').length,
      REJECTED: allTherapists.filter((t) => t.approvalStatus === 'REJECTED').length,
      SUSPENDED: allTherapists.filter((t) => t.approvalStatus === 'SUSPENDED').length,
    };

    // Pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const total = therapists.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = therapists.slice(offset, offset + limit);

    return {
      applications: paginated.map((t) => ({
        ...t,
        registeredAt: t.createdAt,
        profileCompleteness: this.calculateProfileCompleteness(t),
        daysInQueue: Math.floor(
          (Date.now() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
      statusCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get single therapist application detail
   */
  getTherapistApplication(therapistId: string) {
    const therapist = mockDb.getTherapistById(therapistId);
    if (!therapist) return null;

    // Get related data
    const availability = mockDb.getAvailabilityByTherapistId(therapistId);
    const documents = mockDb.getDocumentsByTherapistId(therapistId);

    return {
      ...therapist,
      registeredAt: therapist.createdAt,
      profileCompleteness: this.calculateProfileCompleteness(therapist),
      daysInQueue: Math.floor(
        (Date.now() - therapist.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      ),
      availability,
      documents,
    };
  }

  /**
   * Get audit logs
   */
  getAuditLogs(options?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }) {
    return mockDb.getAuditLogs(options);
  }

  /**
   * Get email logs
   */
  getEmailLogs(options?: { to?: string; type?: string; limit?: number }) {
    return mockDb.getEmailLogs(options);
  }

  /**
   * Calculate profile completeness percentage
   */
  private calculateProfileCompleteness(therapist: DbTherapist): number {
    const fields = [
      therapist.firstName,
      therapist.lastName,
      therapist.email,
      therapist.phone,
      therapist.bio,
      therapist.bioHebrew,
      therapist.city,
      therapist.licenseNumber,
      therapist.approaches.length > 0,
      therapist.specializations.length > 0,
      therapist.sessionPrice > 0,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const adminService = new AdminService();
