/**
 * Email Notification Types
 *
 * Defines all email types and their payload structures
 */

export type EmailType =
  | 'WELCOME_PATIENT'
  | 'WELCOME_THERAPIST'
  | 'THERAPIST_APPROVED'
  | 'THERAPIST_REJECTED'
  | 'THERAPIST_DOCUMENTS_REQUESTED'
  | 'THERAPIST_SUSPENDED'
  | 'THERAPIST_UNSUSPENDED'
  | 'SESSION_REQUESTED'
  | 'SESSION_APPROVED'
  | 'SESSION_REJECTED'
  | 'SESSION_CANCELLED'
  | 'SESSION_REMINDER'
  | 'NEW_MESSAGE'
  | 'NEW_MATCHES_AVAILABLE'
  | 'PASSWORD_RESET';

export interface BaseEmailPayload {
  to: string;
  recipientName: string;
}

export interface WelcomePatientPayload extends BaseEmailPayload {
  type: 'WELCOME_PATIENT';
}

export interface WelcomeTherapistPayload extends BaseEmailPayload {
  type: 'WELCOME_THERAPIST';
}

export interface TherapistApprovedPayload extends BaseEmailPayload {
  type: 'THERAPIST_APPROVED';
}

export interface TherapistRejectedPayload extends BaseEmailPayload {
  type: 'THERAPIST_REJECTED';
  reason?: string;
}

export interface TherapistDocumentsRequestedPayload extends BaseEmailPayload {
  type: 'THERAPIST_DOCUMENTS_REQUESTED';
  documents: string[];
  note: string;
}

export interface TherapistSuspendedPayload extends BaseEmailPayload {
  type: 'THERAPIST_SUSPENDED';
  reason: string;
}

export interface TherapistUnsuspendedPayload extends BaseEmailPayload {
  type: 'THERAPIST_UNSUSPENDED';
}

export interface SessionRequestedPayload extends BaseEmailPayload {
  type: 'SESSION_REQUESTED';
  patientName: string;
  therapistName: string;
  scheduledAt: Date;
  isOnline: boolean;
}

export interface SessionApprovedPayload extends BaseEmailPayload {
  type: 'SESSION_APPROVED';
  therapistName: string;
  scheduledAt: Date;
  isOnline: boolean;
  meetingLink?: string;
  address?: string;
}

export interface SessionRejectedPayload extends BaseEmailPayload {
  type: 'SESSION_REJECTED';
  therapistName: string;
  reason?: string;
}

export interface SessionCancelledPayload extends BaseEmailPayload {
  type: 'SESSION_CANCELLED';
  otherPartyName: string;
  scheduledAt: Date;
  cancelledBy: 'patient' | 'therapist';
}

export interface SessionReminderPayload extends BaseEmailPayload {
  type: 'SESSION_REMINDER';
  therapistName: string;
  scheduledAt: Date;
  isOnline: boolean;
  meetingLink?: string;
  address?: string;
  hoursUntil: number;
}

export interface NewMessagePayload extends BaseEmailPayload {
  type: 'NEW_MESSAGE';
  senderName: string;
  messagePreview: string;
}

export interface NewMatchesAvailablePayload extends BaseEmailPayload {
  type: 'NEW_MATCHES_AVAILABLE';
  matchCount: number;
  topMatchScore: number;
}

export interface PasswordResetPayload extends BaseEmailPayload {
  type: 'PASSWORD_RESET';
  resetLink: string;
  expiresIn: string;
}

export type EmailPayload =
  | WelcomePatientPayload
  | WelcomeTherapistPayload
  | TherapistApprovedPayload
  | TherapistRejectedPayload
  | TherapistDocumentsRequestedPayload
  | TherapistSuspendedPayload
  | TherapistUnsuspendedPayload
  | SessionRequestedPayload
  | SessionApprovedPayload
  | SessionRejectedPayload
  | SessionCancelledPayload
  | SessionReminderPayload
  | NewMessagePayload
  | NewMatchesAvailablePayload
  | PasswordResetPayload;

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailServiceConfig {
  from: string;
  replyTo?: string;
  baseUrl: string;
}
