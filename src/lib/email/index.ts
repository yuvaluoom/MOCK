/**
 * Email Module
 *
 * Export all email-related functionality
 */

// Types
export type {
  EmailType,
  EmailPayload,
  EmailResult,
  EmailServiceConfig,
  BaseEmailPayload,
  WelcomePatientPayload,
  WelcomeTherapistPayload,
  TherapistApprovedPayload,
  TherapistRejectedPayload,
  SessionRequestedPayload,
  SessionApprovedPayload,
  SessionRejectedPayload,
  SessionCancelledPayload,
  SessionReminderPayload,
  NewMessagePayload,
  NewMatchesAvailablePayload,
  PasswordResetPayload,
} from './types';

// Templates
export { getEmailTemplate } from './templates';

// Service (main API)
export {
  sendEmail,
  queueEmail,
  getSentEmails,
  clearSentEmails,
  // Convenience functions
  sendWelcomePatient,
  sendWelcomeTherapist,
  sendTherapistApproved,
  sendTherapistRejected,
  sendSessionRequested,
  sendSessionApproved,
  sendSessionRejected,
  sendSessionCancelled,
  sendSessionReminder,
  sendNewMessageNotification,
  sendNewMatchesAvailable,
  sendPasswordReset,
} from './service';
