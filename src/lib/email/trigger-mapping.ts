/**
 * Email Trigger Mapping
 *
 * Complete mapping of system events to email notifications
 * Each trigger includes: event, recipient, subject template, and template name
 */

export interface EmailTrigger {
  event: string;
  eventDescription: string;
  recipient: 'patient' | 'therapist' | 'admin' | 'both_parties';
  subject: string;
  templateName: string;
  placeholders: string[];
  priority: 'high' | 'normal' | 'low';
  canDisable: boolean;
}

/**
 * Complete Email Trigger Mapping Table
 */
export const EMAIL_TRIGGERS: EmailTrigger[] = [
  // ============================================
  // Authentication & Account
  // ============================================
  {
    event: 'SIGNUP_PATIENT',
    eventDescription: 'Patient completes registration',
    recipient: 'patient',
    subject: 'Welcome to MatchMind - Find Your Ideal Therapist',
    templateName: 'WELCOME_PATIENT',
    placeholders: ['{{firstName}}', '{{actionLink}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'SIGNUP_THERAPIST',
    eventDescription: 'Therapist completes registration',
    recipient: 'therapist',
    subject: 'Welcome to MatchMind - Therapist Registration Received',
    templateName: 'WELCOME_THERAPIST',
    placeholders: ['{{firstName}}', '{{actionLink}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'PASSWORD_RESET_REQUEST',
    eventDescription: 'User requests password reset',
    recipient: 'patient',
    subject: 'Reset Your MatchMind Password',
    templateName: 'PASSWORD_RESET',
    placeholders: ['{{firstName}}', '{{resetLink}}', '{{expiresIn}}'],
    priority: 'high',
    canDisable: false,
  },

  // ============================================
  // Therapist Approval Flow
  // ============================================
  {
    event: 'THERAPIST_APPROVED',
    eventDescription: 'Admin approves therapist application',
    recipient: 'therapist',
    subject: 'Your MatchMind Therapist Account is Approved!',
    templateName: 'THERAPIST_APPROVED',
    placeholders: ['{{firstName}}', '{{actionLink}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'THERAPIST_REJECTED',
    eventDescription: 'Admin rejects therapist application',
    recipient: 'therapist',
    subject: 'MatchMind Therapist Application Update',
    templateName: 'THERAPIST_REJECTED',
    placeholders: ['{{firstName}}', '{{reason}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'THERAPIST_DOCUMENTS_REQUESTED',
    eventDescription: 'Admin requests additional documents from therapist',
    recipient: 'therapist',
    subject: 'MatchMind - Additional Documents Required',
    templateName: 'THERAPIST_DOCUMENTS_REQUESTED',
    placeholders: ['{{firstName}}', '{{documents}}', '{{note}}', '{{actionLink}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'THERAPIST_SUSPENDED',
    eventDescription: 'Admin suspends therapist account',
    recipient: 'therapist',
    subject: 'MatchMind - Account Suspended',
    templateName: 'THERAPIST_SUSPENDED',
    placeholders: ['{{firstName}}', '{{reason}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'THERAPIST_UNSUSPENDED',
    eventDescription: 'Admin reinstates therapist account',
    recipient: 'therapist',
    subject: 'MatchMind - Account Reinstated',
    templateName: 'THERAPIST_UNSUSPENDED',
    placeholders: ['{{firstName}}', '{{actionLink}}'],
    priority: 'high',
    canDisable: false,
  },

  // ============================================
  // Session/Meeting Flow
  // ============================================
  {
    event: 'SESSION_REQUESTED',
    eventDescription: 'Patient requests a session with therapist',
    recipient: 'therapist',
    subject: 'New Session Request from {{patientName}}',
    templateName: 'SESSION_REQUESTED',
    placeholders: ['{{firstName}}', '{{patientName}}', '{{meetingDate}}', '{{meetingTime}}', '{{sessionType}}', '{{actionLink}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'SESSION_APPROVED',
    eventDescription: 'Therapist approves session request',
    recipient: 'patient',
    subject: 'Session Confirmed with {{therapistName}}',
    templateName: 'SESSION_APPROVED',
    placeholders: ['{{firstName}}', '{{therapistName}}', '{{meetingDate}}', '{{meetingTime}}', '{{sessionType}}', '{{meetingLink}}', '{{address}}', '{{actionLink}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'SESSION_REJECTED',
    eventDescription: 'Therapist declines session request',
    recipient: 'patient',
    subject: 'Session Request with {{therapistName}} - Update',
    templateName: 'SESSION_REJECTED',
    placeholders: ['{{firstName}}', '{{therapistName}}', '{{reason}}', '{{actionLink}}'],
    priority: 'normal',
    canDisable: false,
  },
  {
    event: 'SESSION_CANCELLED_BY_PATIENT',
    eventDescription: 'Patient cancels scheduled session',
    recipient: 'therapist',
    subject: 'Session Cancelled',
    templateName: 'SESSION_CANCELLED',
    placeholders: ['{{firstName}}', '{{otherPartyName}}', '{{meetingDate}}', '{{meetingTime}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'SESSION_CANCELLED_BY_THERAPIST',
    eventDescription: 'Therapist cancels scheduled session',
    recipient: 'patient',
    subject: 'Session Cancelled',
    templateName: 'SESSION_CANCELLED',
    placeholders: ['{{firstName}}', '{{otherPartyName}}', '{{meetingDate}}', '{{meetingTime}}'],
    priority: 'high',
    canDisable: false,
  },
  {
    event: 'SESSION_REMINDER_24H',
    eventDescription: 'Reminder 24 hours before session',
    recipient: 'both_parties',
    subject: 'Session Reminder: 24 hours until your session',
    templateName: 'SESSION_REMINDER',
    placeholders: ['{{firstName}}', '{{therapistName}}', '{{meetingDate}}', '{{meetingTime}}', '{{sessionType}}', '{{meetingLink}}', '{{hoursUntil}}'],
    priority: 'normal',
    canDisable: true,
  },
  {
    event: 'SESSION_REMINDER_1H',
    eventDescription: 'Reminder 1 hour before session',
    recipient: 'both_parties',
    subject: 'Session Reminder: 1 hour until your session',
    templateName: 'SESSION_REMINDER',
    placeholders: ['{{firstName}}', '{{therapistName}}', '{{meetingDate}}', '{{meetingTime}}', '{{sessionType}}', '{{meetingLink}}', '{{hoursUntil}}'],
    priority: 'high',
    canDisable: true,
  },

  // ============================================
  // Messages
  // ============================================
  {
    event: 'NEW_MESSAGE_RECEIVED',
    eventDescription: 'User receives a new message',
    recipient: 'patient',
    subject: 'New message from {{senderName}}',
    templateName: 'NEW_MESSAGE',
    placeholders: ['{{firstName}}', '{{senderName}}', '{{messagePreview}}', '{{actionLink}}'],
    priority: 'normal',
    canDisable: true,
  },

  // ============================================
  // Matching
  // ============================================
  {
    event: 'NEW_MATCHES_AVAILABLE',
    eventDescription: 'New therapist matches found for patient',
    recipient: 'patient',
    subject: '{{matchCount}} New Therapist Matches Found!',
    templateName: 'NEW_MATCHES_AVAILABLE',
    placeholders: ['{{firstName}}', '{{matchCount}}', '{{topMatchScore}}', '{{actionLink}}'],
    priority: 'normal',
    canDisable: true,
  },

  // ============================================
  // Profile & Engagement
  // ============================================
  {
    event: 'PROFILE_COMPLETION_REMINDER',
    eventDescription: 'Reminder to complete profile (sent after 3 days)',
    recipient: 'patient',
    subject: 'Complete Your Profile to Find Your Ideal Therapist',
    templateName: 'PROFILE_COMPLETION_REMINDER',
    placeholders: ['{{firstName}}', '{{completionPercentage}}', '{{actionLink}}'],
    priority: 'low',
    canDisable: true,
  },
  {
    event: 'QUESTIONNAIRE_REMINDER',
    eventDescription: 'Reminder to complete questionnaire',
    recipient: 'patient',
    subject: 'Complete Your Questionnaire to Get Matched',
    templateName: 'QUESTIONNAIRE_REMINDER',
    placeholders: ['{{firstName}}', '{{actionLink}}'],
    priority: 'normal',
    canDisable: true,
  },

  // ============================================
  // Admin Notifications
  // ============================================
  {
    event: 'ADMIN_NEW_THERAPIST_APPLICATION',
    eventDescription: 'New therapist applies for approval',
    recipient: 'admin',
    subject: 'New Therapist Application: {{therapistName}}',
    templateName: 'ADMIN_NEW_APPLICATION',
    placeholders: ['{{therapistName}}', '{{email}}', '{{specializations}}', '{{actionLink}}'],
    priority: 'normal',
    canDisable: false,
  },
  {
    event: 'ADMIN_REPORT_SUBMITTED',
    eventDescription: 'User submits a report',
    recipient: 'admin',
    subject: 'New Report Submitted',
    templateName: 'ADMIN_REPORT',
    placeholders: ['{{reporterName}}', '{{reportType}}', '{{description}}', '{{actionLink}}'],
    priority: 'high',
    canDisable: false,
  },
];

/**
 * Get trigger by event name
 */
export function getTriggerByEvent(event: string): EmailTrigger | undefined {
  return EMAIL_TRIGGERS.find(t => t.event === event);
}

/**
 * Get all triggers for a recipient type
 */
export function getTriggersByRecipient(recipient: EmailTrigger['recipient']): EmailTrigger[] {
  return EMAIL_TRIGGERS.filter(t => t.recipient === recipient);
}

/**
 * Get all high priority triggers
 */
export function getHighPriorityTriggers(): EmailTrigger[] {
  return EMAIL_TRIGGERS.filter(t => t.priority === 'high');
}

/**
 * Get all disableable triggers
 */
export function getDisableableTriggers(): EmailTrigger[] {
  return EMAIL_TRIGGERS.filter(t => t.canDisable);
}

/**
 * Format trigger table for display
 */
export function formatTriggerTable(): string {
  const headers = ['Event', 'Recipient', 'Subject', 'Template'];
  const rows = EMAIL_TRIGGERS.map(t => [
    t.event,
    t.recipient,
    t.subject,
    t.templateName,
  ]);

  // Calculate column widths
  const widths = headers.map((h, i) => {
    const maxDataWidth = Math.max(...rows.map(r => r[i].length));
    return Math.max(h.length, maxDataWidth);
  });

  // Format header
  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join(' | ');
  const separator = widths.map(w => '-'.repeat(w)).join('-+-');

  // Format rows
  const dataLines = rows.map(r => r.map((c, i) => c.padEnd(widths[i])).join(' | '));

  return [headerLine, separator, ...dataLines].join('\n');
}
