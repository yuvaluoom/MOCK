import { mockNotifications, type MockNotification, type NotificationType } from '@/server/routers/notification';
import {
  sendSessionApproved,
  sendSessionCancelled,
  sendSessionRequested,
  sendNewMessageNotification,
  sendNewMatchesAvailable,
} from '@/lib/email';

// Which notification types should also trigger an email
const EMAIL_WORTHY_TYPES: NotificationType[] = [
  'MATCH_NEW',
  'SESSION_APPROVED',
  'SESSION_CANCELLED',
  'SESSION_REMINDER',
  'PROFILE_APPROVED',
  'MESSAGE_NEW',
];

interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: {
    patientName?: string;
    therapistName?: string;
    sessionId?: string;
    matchScore?: number;
  };
}

export function createNotification(input: CreateNotificationInput): MockNotification {
  const notification: MockNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: input.recipientId,
    type: input.type,
    title: input.title,
    titleHe: input.title,
    message: input.message,
    messageHe: input.message,
    link: input.link || null,
    isRead: false,
    emailSent: false,
    createdAt: new Date(),
  };

  mockNotifications.unshift(notification);

  if (EMAIL_WORTHY_TYPES.includes(input.type)) {
    notification.emailSent = true;
    console.log(`[EMAIL] → ${input.recipientId}: "${input.title}" — ${input.message}`);
  }

  return notification;
}

// ============ EVENT-SPECIFIC HELPERS ============

export function notifySessionRequested(therapistId: string, patientName: string, scheduledAt: Date) {
  createNotification({
    recipientId: therapistId,
    type: 'PATIENT_REQUEST',
    title: 'New session request',
    message: `${patientName} has requested a session on ${scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at ${scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`,
    link: '/therapist/sessions?tab=pending',
    priority: 'high',
    metadata: { patientName },
  });
}

export function notifySessionApproved(patientId: string, therapistName: string, scheduledAt: Date, isOnline: boolean) {
  createNotification({
    recipientId: patientId,
    type: 'SESSION_APPROVED',
    title: 'Session confirmed!',
    message: `Your session with ${therapistName} on ${scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} has been approved.${isOnline ? ' A meeting link will be shared before the session.' : ''}`,
    link: '/sessions',
    priority: 'high',
    metadata: { therapistName },
  });
}

export function notifySessionRejected(patientId: string, therapistName: string, reason?: string) {
  createNotification({
    recipientId: patientId,
    type: 'SESSION_CANCELLED',
    title: 'Session not available',
    message: `${therapistName} was unable to accommodate your session request.${reason ? ` Note: ${reason}` : ' Please try a different time slot.'}`,
    link: '/sessions',
    metadata: { therapistName },
  });
}

export function notifySessionCancelledByPatient(therapistId: string, patientName: string, scheduledAt: Date) {
  createNotification({
    recipientId: therapistId,
    type: 'SESSION_CANCELLED',
    title: 'Session cancelled',
    message: `${patientName} has cancelled the session scheduled for ${scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.`,
    link: '/therapist/sessions',
    priority: 'high',
    metadata: { patientName },
  });
}

export function notifySessionCancelledByTherapist(patientId: string, therapistName: string, scheduledAt: Date) {
  createNotification({
    recipientId: patientId,
    type: 'SESSION_CANCELLED',
    title: 'Session cancelled by therapist',
    message: `${therapistName} has cancelled your session scheduled for ${scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}. Please reschedule at your convenience.`,
    link: '/sessions',
    priority: 'high',
    metadata: { therapistName },
  });
}

export function notifyNewMessage(recipientId: string, senderName: string, preview: string, isTherapist: boolean) {
  createNotification({
    recipientId,
    type: 'MESSAGE_NEW',
    title: `New message from ${senderName}`,
    message: preview.length > 80 ? preview.slice(0, 80) + '…' : preview,
    link: isTherapist ? '/therapist/messages' : '/messages',
  });
}

export function notifyNewMatch(patientId: string, therapistName: string, matchScore: number) {
  createNotification({
    recipientId: patientId,
    type: 'MATCH_NEW',
    title: 'New therapist match found!',
    message: `We found a new match for you: ${therapistName} with ${matchScore}% compatibility. Review your matches to learn more.`,
    link: '/matches',
    metadata: { therapistName, matchScore },
  });
}

export function notifyMatchUpdated(patientId: string) {
  createNotification({
    recipientId: patientId,
    type: 'MATCH_UPDATED',
    title: 'Your matches have been updated',
    message: 'Based on your questionnaire responses, we\'ve updated your therapist recommendations.',
    link: '/matches',
  });
}

export function notifyTherapistProfileApproved(therapistId: string) {
  createNotification({
    recipientId: therapistId,
    type: 'PROFILE_APPROVED',
    title: 'Profile approved!',
    message: 'Your therapist profile has been approved by our team. You can now receive patient requests and start accepting sessions.',
    link: '/therapist/profile',
    priority: 'high',
  });
}

export function notifySessionReminder(recipientId: string, otherPartyName: string, scheduledAt: Date, isTherapist: boolean) {
  const timeStr = scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  createNotification({
    recipientId,
    type: 'SESSION_REMINDER',
    title: 'Upcoming session reminder',
    message: `Reminder: You have a session with ${otherPartyName} today at ${timeStr}.`,
    link: isTherapist ? '/therapist/sessions' : '/sessions',
    priority: 'high',
  });
}
