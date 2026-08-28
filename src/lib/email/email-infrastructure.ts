/**
 * Production-Ready Email Infrastructure
 *
 * Complete email system with:
 * - Multi-provider support (SendGrid, AWS SES, Postmark, Resend)
 * - Template rendering with dynamic placeholders
 * - Email logging and tracking
 * - Broadcast capabilities
 * - Admin control integration
 */

import { mockDb } from '@/lib/database/mock-db';
import { getEmailProvider, type EmailMessage, type EmailSendResult } from './providers';
import { getEmailTemplate } from './templates';
import type { EmailPayload, EmailType } from './types';

// ============================================
// Types
// ============================================

export interface EmailRecord {
  id: string;
  to: string;
  from: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type: EmailType | 'BROADCAST' | 'ADMIN_PERSONAL';
  triggerEvent: string;
  status: 'QUEUED' | 'SENT' | 'FAILED' | 'DELIVERED' | 'BOUNCED';
  provider: string;
  messageId?: string;
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
}

export interface BroadcastEmailRequest {
  subject: string;
  htmlContent: string;
  textContent?: string;
  targetAudience: BroadcastAudience;
  customFilter?: UserFilter;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export type BroadcastAudience =
  | 'ALL_CLIENTS'
  | 'ALL_THERAPISTS'
  | 'PENDING_THERAPISTS'
  | 'APPROVED_THERAPISTS'
  | 'ACTIVE_CLIENTS'
  | 'INACTIVE_CLIENTS'
  | 'CUSTOM';

export interface UserFilter {
  role?: 'patient' | 'therapist';
  status?: string;
  registeredAfter?: Date;
  registeredBefore?: Date;
  hasCompletedQuestionnaire?: boolean;
  city?: string;
  healthFund?: string;
}

export interface PersonalEmailRequest {
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  metadata?: Record<string, any>;
}

// ============================================
// Email Storage (In-memory for now, would be database in production)
// ============================================

const emailStore: EmailRecord[] = [];

// ============================================
// Core Email Functions
// ============================================

/**
 * Send a templated email based on system event
 */
export async function sendTemplatedEmail(
  payload: EmailPayload,
  metadata?: Record<string, any>
): Promise<EmailSendResult> {
  const provider = getEmailProvider();
  const template = getEmailTemplate(payload);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Replace placeholder URLs in template
  const htmlWithUrls = template.html.replace(/https:\/\/matchmind\.com/g, baseUrl);
  const textWithUrls = template.text.replace(/https:\/\/matchmind\.com/g, baseUrl);

  const message: EmailMessage = {
    to: payload.to,
    from: process.env.EMAIL_FROM || 'MatchMind <noreply@matchmind.co.il>',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@matchmind.co.il',
    subject: template.subject,
    html: htmlWithUrls,
    text: textWithUrls,
    metadata: {
      emailType: payload.type,
      recipientName: payload.recipientName,
      ...metadata,
    },
  };

  // Create email record
  const emailRecord: EmailRecord = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    to: payload.to,
    from: message.from!,
    subject: template.subject,
    htmlContent: htmlWithUrls,
    textContent: textWithUrls,
    type: payload.type,
    triggerEvent: payload.type,
    status: 'QUEUED',
    provider: provider.name,
    metadata: message.metadata || {},
    createdAt: new Date(),
  };

  emailStore.push(emailRecord);

  try {
    const result = await provider.send(message);

    // Update record
    emailRecord.status = result.success ? 'SENT' : 'FAILED';
    emailRecord.messageId = result.messageId;
    emailRecord.sentAt = result.timestamp;

    if (!result.success) {
      emailRecord.errorMessage = result.error;
    }

    // Log to mock database
    mockDb.logEmail({
      to: payload.to,
      type: payload.type,
      subject: template.subject,
      recipientName: payload.recipientName,
      relatedEntityType: null,
      relatedEntityId: null,
      triggeredBy: 'SYSTEM',
      triggeredByAction: payload.type,
      status: result.success ? 'SENT' : 'FAILED',
      sentAt: result.success ? new Date() : null,
      errorMessage: result.error || null,
      idempotencyKey: emailRecord.id,
    });

    return result;
  } catch (error) {
    emailRecord.status = 'FAILED';
    emailRecord.errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      provider: provider.name,
      error: emailRecord.errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Send a broadcast email to a group of users
 */
export async function sendBroadcastEmail(
  request: BroadcastEmailRequest,
  adminId: string
): Promise<{ sent: number; failed: number; results: EmailSendResult[] }> {
  const provider = getEmailProvider();
  const recipients = getRecipientsByAudience(request.targetAudience, request.customFilter);

  const results: EmailSendResult[] = [];
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    // Replace placeholders in content
    const personalizedHtml = replacePlaceholders(request.htmlContent, {
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      email: recipient.email,
    });

    const personalizedText = request.textContent
      ? replacePlaceholders(request.textContent, {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
        })
      : undefined;

    const message: EmailMessage = {
      to: recipient.email,
      from: process.env.EMAIL_FROM || 'MatchMind <noreply@matchmind.co.il>',
      subject: replacePlaceholders(request.subject, { firstName: recipient.firstName }),
      html: personalizedHtml,
      text: personalizedText,
      metadata: {
        broadcastType: request.targetAudience,
        adminId,
        ...request.metadata,
      },
    };

    // Create record
    const emailRecord: EmailRecord = {
      id: `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      to: recipient.email,
      from: message.from!,
      subject: message.subject,
      htmlContent: personalizedHtml,
      textContent: personalizedText || '',
      type: 'BROADCAST',
      triggerEvent: `BROADCAST_${request.targetAudience}`,
      status: 'QUEUED',
      provider: provider.name,
      metadata: message.metadata || {},
      createdAt: new Date(),
    };

    emailStore.push(emailRecord);

    try {
      const result = await provider.send(message);
      results.push(result);

      emailRecord.status = result.success ? 'SENT' : 'FAILED';
      emailRecord.messageId = result.messageId;
      emailRecord.sentAt = result.timestamp;

      if (result.success) {
        sent++;
      } else {
        failed++;
        emailRecord.errorMessage = result.error;
      }

      // Log to database
      mockDb.logEmail({
        to: recipient.email,
        type: 'BROADCAST',
        subject: message.subject,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        relatedEntityType: null,
        relatedEntityId: null,
        triggeredBy: 'ADMIN',
        triggeredByAction: `BROADCAST_${request.targetAudience}`,
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
        errorMessage: result.error || null,
        idempotencyKey: emailRecord.id,
      });
    } catch (error) {
      failed++;
      emailRecord.status = 'FAILED';
      emailRecord.errorMessage = error instanceof Error ? error.message : 'Unknown error';

      results.push({
        success: false,
        provider: provider.name,
        error: emailRecord.errorMessage,
        timestamp: new Date(),
      });
    }
  }

  return { sent, failed, results };
}

/**
 * Send a personal email from admin to a specific user
 */
export async function sendPersonalEmail(
  request: PersonalEmailRequest,
  adminId: string
): Promise<EmailSendResult> {
  const provider = getEmailProvider();

  // Replace placeholders
  const personalizedHtml = replacePlaceholders(request.htmlContent, {
    firstName: request.userName.split(' ')[0],
    lastName: request.userName.split(' ').slice(1).join(' '),
    email: request.userEmail,
  });

  const message: EmailMessage = {
    to: request.userEmail,
    from: process.env.EMAIL_FROM || 'MatchMind <noreply@matchmind.co.il>',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@matchmind.co.il',
    subject: request.subject,
    html: personalizedHtml,
    text: request.textContent,
    metadata: {
      personalEmail: 'true',
      adminId,
      userId: request.userId,
      ...request.metadata,
    },
  };

  const emailRecord: EmailRecord = {
    id: `personal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    to: request.userEmail,
    from: message.from!,
    subject: request.subject,
    htmlContent: personalizedHtml,
    textContent: request.textContent || '',
    type: 'ADMIN_PERSONAL',
    triggerEvent: 'ADMIN_PERSONAL_EMAIL',
    status: 'QUEUED',
    provider: provider.name,
    metadata: message.metadata || {},
    createdAt: new Date(),
  };

  emailStore.push(emailRecord);

  try {
    const result = await provider.send(message);

    emailRecord.status = result.success ? 'SENT' : 'FAILED';
    emailRecord.messageId = result.messageId;
    emailRecord.sentAt = result.timestamp;

    if (!result.success) {
      emailRecord.errorMessage = result.error;
    }

    mockDb.logEmail({
      to: request.userEmail,
      type: 'ADMIN_PERSONAL',
      subject: request.subject,
      recipientName: request.userName,
      relatedEntityType: 'USER',
      relatedEntityId: request.userId,
      triggeredBy: 'ADMIN',
      triggeredByAction: 'PERSONAL_EMAIL',
      status: result.success ? 'SENT' : 'FAILED',
      sentAt: result.success ? new Date() : null,
      errorMessage: result.error || null,
      idempotencyKey: emailRecord.id,
    });

    return result;
  } catch (error) {
    emailRecord.status = 'FAILED';
    emailRecord.errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      provider: provider.name,
      error: emailRecord.errorMessage,
      timestamp: new Date(),
    };
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get recipients based on audience type
 */
function getRecipientsByAudience(
  audience: BroadcastAudience,
  customFilter?: UserFilter
): Array<{ id: string; email: string; firstName: string; lastName: string }> {
  const allPatients = mockDb.getAllPatients();
  const allTherapists = mockDb.getAllTherapists();

  let recipients: Array<{ id: string; email: string; firstName: string; lastName: string }> = [];

  switch (audience) {
    case 'ALL_CLIENTS':
      recipients = allPatients.map(p => ({
        id: p.id,
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
      }));
      break;

    case 'ALL_THERAPISTS':
      recipients = allTherapists.map(t => ({
        id: t.id,
        email: t.email,
        firstName: t.firstName,
        lastName: t.lastName,
      }));
      break;

    case 'PENDING_THERAPISTS':
      recipients = allTherapists
        .filter(t => t.approvalStatus === 'AWAITING_APPROVAL')
        .map(t => ({
          id: t.id,
          email: t.email,
          firstName: t.firstName,
          lastName: t.lastName,
        }));
      break;

    case 'APPROVED_THERAPISTS':
      recipients = allTherapists
        .filter(t => t.approvalStatus === 'APPROVED')
        .map(t => ({
          id: t.id,
          email: t.email,
          firstName: t.firstName,
          lastName: t.lastName,
        }));
      break;

    case 'ACTIVE_CLIENTS':
      // Clients who have completed questionnaire
      recipients = allPatients
        .filter(p => p.questionnaireCompleted)
        .map(p => ({
          id: p.id,
          email: p.email,
          firstName: p.firstName,
          lastName: p.lastName,
        }));
      break;

    case 'INACTIVE_CLIENTS':
      // Clients who haven't completed questionnaire
      recipients = allPatients
        .filter(p => !p.questionnaireCompleted)
        .map(p => ({
          id: p.id,
          email: p.email,
          firstName: p.firstName,
          lastName: p.lastName,
        }));
      break;

    case 'CUSTOM':
      if (customFilter) {
        if (customFilter.role === 'patient') {
          recipients = allPatients.map(p => ({
            id: p.id,
            email: p.email,
            firstName: p.firstName,
            lastName: p.lastName,
          }));
        } else if (customFilter.role === 'therapist') {
          recipients = allTherapists.map(t => ({
            id: t.id,
            email: t.email,
            firstName: t.firstName,
            lastName: t.lastName,
          }));
        }
      }
      break;
  }

  return recipients;
}

/**
 * Replace placeholders in content
 */
function replacePlaceholders(
  content: string,
  data: Record<string, string | number | undefined>
): string {
  let result = content;

  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, String(value ?? ''));
  }

  return result;
}

// ============================================
// Admin Email Functions
// ============================================

/**
 * Get all sent emails for admin view
 */
export function getAllEmailRecords(options?: {
  limit?: number;
  offset?: number;
  type?: EmailType | 'BROADCAST' | 'ADMIN_PERSONAL';
  status?: EmailRecord['status'];
  fromDate?: Date;
  toDate?: Date;
}): { records: EmailRecord[]; total: number } {
  let records = [...emailStore];

  // Filter by type
  if (options?.type) {
    records = records.filter(r => r.type === options.type);
  }

  // Filter by status
  if (options?.status) {
    records = records.filter(r => r.status === options.status);
  }

  // Filter by date range
  if (options?.fromDate) {
    records = records.filter(r => r.createdAt >= options.fromDate!);
  }
  if (options?.toDate) {
    records = records.filter(r => r.createdAt <= options.toDate!);
  }

  // Sort by date descending
  records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = records.length;

  // Apply pagination
  if (options?.offset) {
    records = records.slice(options.offset);
  }
  if (options?.limit) {
    records = records.slice(0, options.limit);
  }

  return { records, total };
}

/**
 * Get email statistics
 */
export function getEmailStatistics(): {
  total: number;
  sent: number;
  failed: number;
  byType: Record<string, number>;
  last24Hours: number;
  last7Days: number;
} {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const byType: Record<string, number> = {};

  for (const record of emailStore) {
    byType[record.type] = (byType[record.type] || 0) + 1;
  }

  return {
    total: emailStore.length,
    sent: emailStore.filter(r => r.status === 'SENT' || r.status === 'DELIVERED').length,
    failed: emailStore.filter(r => r.status === 'FAILED' || r.status === 'BOUNCED').length,
    byType,
    last24Hours: emailStore.filter(r => r.createdAt >= oneDayAgo).length,
    last7Days: emailStore.filter(r => r.createdAt >= sevenDaysAgo).length,
  };
}

/**
 * Get recipient counts for broadcast targeting
 */
export function getBroadcastRecipientCounts(): Record<BroadcastAudience, number> {
  return {
    ALL_CLIENTS: mockDb.getAllPatients().length,
    ALL_THERAPISTS: mockDb.getAllTherapists().length,
    PENDING_THERAPISTS: mockDb.getAllTherapists().filter(t => t.approvalStatus === 'AWAITING_APPROVAL').length,
    APPROVED_THERAPISTS: mockDb.getAllTherapists().filter(t => t.approvalStatus === 'APPROVED').length,
    ACTIVE_CLIENTS: mockDb.getAllPatients().filter(p => p.questionnaireCompleted).length,
    INACTIVE_CLIENTS: mockDb.getAllPatients().filter(p => !p.questionnaireCompleted).length,
    CUSTOM: 0,
  };
}

// ============================================
// Event-Triggered Email Functions
// ============================================

/**
 * Trigger email on user signup
 */
export async function onUserSignup(
  email: string,
  name: string,
  role: 'patient' | 'therapist'
): Promise<EmailSendResult> {
  if (role === 'patient') {
    return sendTemplatedEmail({
      type: 'WELCOME_PATIENT',
      to: email,
      recipientName: name,
    });
  } else {
    return sendTemplatedEmail({
      type: 'WELCOME_THERAPIST',
      to: email,
      recipientName: name,
    });
  }
}

/**
 * Trigger email on therapist status change
 */
export async function onTherapistStatusChange(
  email: string,
  name: string,
  newStatus: 'APPROVED' | 'REJECTED' | 'DOCUMENTS_REQUESTED',
  details?: { reason?: string; documents?: string[]; note?: string }
): Promise<EmailSendResult> {
  switch (newStatus) {
    case 'APPROVED':
      return sendTemplatedEmail({
        type: 'THERAPIST_APPROVED',
        to: email,
        recipientName: name,
      });
    case 'REJECTED':
      return sendTemplatedEmail({
        type: 'THERAPIST_REJECTED',
        to: email,
        recipientName: name,
        reason: details?.reason,
      });
    case 'DOCUMENTS_REQUESTED':
      return sendTemplatedEmail({
        type: 'THERAPIST_DOCUMENTS_REQUESTED',
        to: email,
        recipientName: name,
        documents: details?.documents || [],
        note: details?.note || '',
      });
    default:
      throw new Error(`Unknown status: ${newStatus}`);
  }
}

/**
 * Trigger email on session event
 */
export async function onSessionEvent(
  eventType: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
  recipientEmail: string,
  recipientName: string,
  sessionDetails: {
    patientName?: string;
    therapistName: string;
    scheduledAt: Date;
    isOnline: boolean;
    meetingLink?: string;
    address?: string;
    reason?: string;
    cancelledBy?: 'patient' | 'therapist';
  }
): Promise<EmailSendResult> {
  switch (eventType) {
    case 'REQUESTED':
      return sendTemplatedEmail({
        type: 'SESSION_REQUESTED',
        to: recipientEmail,
        recipientName,
        patientName: sessionDetails.patientName || '',
        therapistName: sessionDetails.therapistName,
        scheduledAt: sessionDetails.scheduledAt,
        isOnline: sessionDetails.isOnline,
      });
    case 'APPROVED':
      return sendTemplatedEmail({
        type: 'SESSION_APPROVED',
        to: recipientEmail,
        recipientName,
        therapistName: sessionDetails.therapistName,
        scheduledAt: sessionDetails.scheduledAt,
        isOnline: sessionDetails.isOnline,
        meetingLink: sessionDetails.meetingLink,
        address: sessionDetails.address,
      });
    case 'REJECTED':
      return sendTemplatedEmail({
        type: 'SESSION_REJECTED',
        to: recipientEmail,
        recipientName,
        therapistName: sessionDetails.therapistName,
        reason: sessionDetails.reason,
      });
    case 'CANCELLED':
      return sendTemplatedEmail({
        type: 'SESSION_CANCELLED',
        to: recipientEmail,
        recipientName,
        otherPartyName: sessionDetails.therapistName,
        scheduledAt: sessionDetails.scheduledAt,
        cancelledBy: sessionDetails.cancelledBy || 'patient',
      });
    default:
      throw new Error(`Unknown event type: ${eventType}`);
  }
}

/**
 * Trigger email on new message
 */
export async function onNewMessage(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string
): Promise<EmailSendResult> {
  return sendTemplatedEmail({
    type: 'NEW_MESSAGE',
    to: recipientEmail,
    recipientName,
    senderName,
    messagePreview,
  });
}

/**
 * Trigger password reset email
 */
export async function onPasswordResetRequest(
  email: string,
  name: string,
  resetToken: string
): Promise<EmailSendResult> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  return sendTemplatedEmail({
    type: 'PASSWORD_RESET',
    to: email,
    recipientName: name,
    resetLink,
    expiresIn: '1 hour',
  });
}
