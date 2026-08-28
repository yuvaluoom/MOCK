/**
 * Email Service
 *
 * Modular email notification service that handles:
 * - Email sending via configurable provider
 * - Template rendering
 * - Error handling and logging
 * - Queue support (for production with BullMQ)
 *
 * In production, this would integrate with Resend API.
 * For development, it logs emails to console.
 */

import type { EmailPayload, EmailResult, EmailServiceConfig } from './types';
import { getEmailTemplate } from './templates';

// Default configuration
const defaultConfig: EmailServiceConfig = {
  from: 'MatchMind <noreply@matchmind.com>',
  replyTo: 'support@matchmind.com',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
};

// Check if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Mock email storage for development/testing
const sentEmails: Array<{
  to: string;
  subject: string;
  sentAt: Date;
  payload: EmailPayload;
}> = [];

/**
 * Send an email notification
 *
 * In production, this would call the Resend API.
 * In development, it logs to console and stores in memory.
 */
export async function sendEmail(
  payload: EmailPayload,
  config: Partial<EmailServiceConfig> = {}
): Promise<EmailResult> {
  const finalConfig = { ...defaultConfig, ...config };

  try {
    // Generate email content from template
    const template = getEmailTemplate(payload);

    // In development, log and store the email
    if (isDev) {
      console.log('\n📧 [EMAIL SERVICE] Sending email:');
      console.log('  To:', payload.to);
      console.log('  Subject:', template.subject);
      console.log('  Type:', payload.type);
      console.log('---');

      // Store for testing purposes
      sentEmails.push({
        to: payload.to,
        subject: template.subject,
        sentAt: new Date(),
        payload,
      });

      return {
        success: true,
        messageId: `dev-${Date.now()}`,
      };
    }

    // In production, this would call Resend API:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const { data, error } = await resend.emails.send({
    //   from: finalConfig.from,
    //   to: payload.to,
    //   replyTo: finalConfig.replyTo,
    //   subject: template.subject,
    //   html: template.html,
    //   text: template.text,
    // });

    // Simulated success for now
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Queue an email for later sending (for production use with BullMQ)
 *
 * In development, this immediately sends the email.
 */
export async function queueEmail(
  payload: EmailPayload,
  delay?: number
): Promise<{ queued: boolean; jobId?: string }> {
  // In development/without Redis, send immediately
  if (isDev) {
    const result = await sendEmail(payload);
    return {
      queued: result.success,
      jobId: result.messageId,
    };
  }

  // In production, this would add to BullMQ queue:
  // const queue = new Queue('email-queue', { connection: redis });
  // const job = await queue.add('send-email', payload, {
  //   delay,
  //   attempts: 3,
  //   backoff: { type: 'exponential', delay: 1000 },
  // });
  // return { queued: true, jobId: job.id };

  // For now, send immediately
  const result = await sendEmail(payload);
  return {
    queued: result.success,
    jobId: result.messageId,
  };
}

/**
 * Get sent emails (for testing/development)
 */
export function getSentEmails() {
  return [...sentEmails];
}

/**
 * Clear sent emails (for testing)
 */
export function clearSentEmails() {
  sentEmails.length = 0;
}

// ============================================
// Convenience functions for common email types
// ============================================

/**
 * Send welcome email to new patient
 */
export async function sendWelcomePatient(
  to: string,
  recipientName: string
): Promise<EmailResult> {
  return sendEmail({
    type: 'WELCOME_PATIENT',
    to,
    recipientName,
  });
}

/**
 * Send welcome email to new therapist
 */
export async function sendWelcomeTherapist(
  to: string,
  recipientName: string
): Promise<EmailResult> {
  return sendEmail({
    type: 'WELCOME_THERAPIST',
    to,
    recipientName,
  });
}

/**
 * Send therapist approval notification
 */
export async function sendTherapistApproved(
  to: string,
  recipientName: string
): Promise<EmailResult> {
  return sendEmail({
    type: 'THERAPIST_APPROVED',
    to,
    recipientName,
  });
}

/**
 * Send therapist rejection notification
 */
export async function sendTherapistRejected(
  to: string,
  recipientName: string,
  reason?: string
): Promise<EmailResult> {
  return sendEmail({
    type: 'THERAPIST_REJECTED',
    to,
    recipientName,
    reason,
  });
}

/**
 * Send session request notification to therapist
 */
export async function sendSessionRequested(
  to: string,
  recipientName: string,
  patientName: string,
  therapistName: string,
  scheduledAt: Date,
  isOnline: boolean
): Promise<EmailResult> {
  return sendEmail({
    type: 'SESSION_REQUESTED',
    to,
    recipientName,
    patientName,
    therapistName,
    scheduledAt,
    isOnline,
  });
}

/**
 * Send session approval notification to patient
 */
export async function sendSessionApproved(
  to: string,
  recipientName: string,
  therapistName: string,
  scheduledAt: Date,
  isOnline: boolean,
  meetingLink?: string,
  address?: string
): Promise<EmailResult> {
  return sendEmail({
    type: 'SESSION_APPROVED',
    to,
    recipientName,
    therapistName,
    scheduledAt,
    isOnline,
    meetingLink,
    address,
  });
}

/**
 * Send session rejection notification to patient
 */
export async function sendSessionRejected(
  to: string,
  recipientName: string,
  therapistName: string,
  reason?: string
): Promise<EmailResult> {
  return sendEmail({
    type: 'SESSION_REJECTED',
    to,
    recipientName,
    therapistName,
    reason,
  });
}

/**
 * Send session cancellation notification
 */
export async function sendSessionCancelled(
  to: string,
  recipientName: string,
  otherPartyName: string,
  scheduledAt: Date,
  cancelledBy: 'patient' | 'therapist'
): Promise<EmailResult> {
  return sendEmail({
    type: 'SESSION_CANCELLED',
    to,
    recipientName,
    otherPartyName,
    scheduledAt,
    cancelledBy,
  });
}

/**
 * Send session reminder
 */
export async function sendSessionReminder(
  to: string,
  recipientName: string,
  therapistName: string,
  scheduledAt: Date,
  isOnline: boolean,
  hoursUntil: number,
  meetingLink?: string,
  address?: string
): Promise<EmailResult> {
  return sendEmail({
    type: 'SESSION_REMINDER',
    to,
    recipientName,
    therapistName,
    scheduledAt,
    isOnline,
    hoursUntil,
    meetingLink,
    address,
  });
}

/**
 * Send new message notification
 */
export async function sendNewMessageNotification(
  to: string,
  recipientName: string,
  senderName: string,
  messagePreview: string
): Promise<EmailResult> {
  return sendEmail({
    type: 'NEW_MESSAGE',
    to,
    recipientName,
    senderName,
    messagePreview,
  });
}

/**
 * Send new matches notification
 */
export async function sendNewMatchesAvailable(
  to: string,
  recipientName: string,
  matchCount: number,
  topMatchScore: number
): Promise<EmailResult> {
  return sendEmail({
    type: 'NEW_MATCHES_AVAILABLE',
    to,
    recipientName,
    matchCount,
    topMatchScore,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  to: string,
  recipientName: string,
  resetLink: string,
  expiresIn: string = '1 hour'
): Promise<EmailResult> {
  return sendEmail({
    type: 'PASSWORD_RESET',
    to,
    recipientName,
    resetLink,
    expiresIn,
  });
}
