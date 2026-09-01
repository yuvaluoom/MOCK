import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// ============ NOTIFICATION TYPES ============

export type NotificationType =
  | 'MATCH_NEW'
  | 'MATCH_UPDATED'
  | 'MESSAGE_NEW'
  | 'SESSION_APPROVED'
  | 'SESSION_CANCELLED'
  | 'SESSION_REMINDER'
  | 'THERAPIST_RESPONSE'
  | 'PROFILE_APPROVED'
  | 'PATIENT_REQUEST'
  | 'SESSION_BOOKED'
  | 'SYSTEM';

export interface MockNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleHe: string;
  message: string;
  messageHe: string;
  link: string | null;
  isRead: boolean;
  emailSent: boolean;
  createdAt: Date;
}

// In-memory notifications store
export const mockNotifications: MockNotification[] = [
  // Patient notifications
  {
    id: 'notif-1',
    userId: 'patient-1',
    type: 'MATCH_NEW',
    title: 'New therapist match found!',
    titleHe: 'New therapist match found!',
    message: 'We found a new match: Dr. Rachel Cohen with 92% compatibility. Review your matches to learn more.',
    messageHe: 'We found a new match: Dr. Rachel Cohen with 92% compatibility.',
    link: '/matches',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'notif-2',
    userId: 'patient-1',
    type: 'MESSAGE_NEW',
    title: 'New message from Dr. Rachel Cohen',
    titleHe: 'New message from Dr. Rachel Cohen',
    message: 'Hi! I wanted to follow up on our conversation about scheduling your first session.',
    messageHe: 'Hi! I wanted to follow up on our conversation about scheduling.',
    link: '/messages',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'notif-3',
    userId: 'patient-1',
    type: 'SESSION_APPROVED',
    title: 'Session confirmed!',
    titleHe: 'Session confirmed!',
    message: 'Your session with Dr. Rachel Cohen on Sunday at 10:00 AM has been approved. A meeting link will be shared before the session.',
    messageHe: 'Your session with Dr. Rachel Cohen on Sunday at 10:00 has been approved.',
    link: '/sessions',
    isRead: true,
    emailSent: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'notif-4',
    userId: 'patient-1',
    type: 'SESSION_REMINDER',
    title: 'Upcoming session reminder',
    titleHe: 'Upcoming session reminder',
    message: 'Reminder: You have a session with Dr. Rachel Cohen tomorrow at 10:00 AM.',
    messageHe: 'Reminder: You have a session with Dr. Rachel Cohen tomorrow at 10:00.',
    link: '/sessions',
    isRead: true,
    emailSent: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: 'notif-5',
    userId: 'patient-1',
    type: 'MATCH_UPDATED',
    title: 'Your matches have been updated',
    titleHe: 'Your matches have been updated',
    message: 'Based on your questionnaire responses, we\'ve updated your therapist recommendations.',
    messageHe: 'Based on your questionnaire responses, we\'ve updated your recommendations.',
    link: '/matches',
    isRead: true,
    emailSent: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  // Therapist notifications
  {
    id: 'notif-therapist-1',
    userId: 'therapist-1',
    type: 'PATIENT_REQUEST',
    title: 'New session request',
    titleHe: 'New session request',
    message: 'Sarah Cohen has requested a session on Monday, Sep 15 at 02:00 PM.',
    messageHe: 'Sarah Cohen has requested a session on Monday, Sep 15.',
    link: '/therapist/sessions?tab=pending',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'notif-therapist-2',
    userId: 'therapist-1',
    type: 'MESSAGE_NEW',
    title: 'New message from Sarah Cohen',
    titleHe: 'New message from Sarah Cohen',
    message: 'I had a question about the intake form before our session.',
    messageHe: 'I had a question about the intake form before our session.',
    link: '/therapist/messages',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'notif-therapist-3',
    userId: 'therapist-1',
    type: 'SESSION_REMINDER',
    title: 'Upcoming session reminder',
    titleHe: 'Upcoming session reminder',
    message: 'Reminder: You have a session with Sarah Cohen today at 11:30 AM.',
    messageHe: 'Reminder: You have a session with Sarah Cohen today at 11:30.',
    link: '/therapist/sessions',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'notif-therapist-4',
    userId: 'therapist-1',
    type: 'PROFILE_APPROVED',
    title: 'Profile approved!',
    titleHe: 'Profile approved!',
    message: 'Your therapist profile has been approved by our team. You can now receive patient requests and start accepting sessions.',
    messageHe: 'Your therapist profile has been approved. You can now receive patients.',
    link: '/therapist/profile',
    isRead: true,
    emailSent: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'notif-therapist-5',
    userId: 'therapist-1',
    type: 'SESSION_CANCELLED',
    title: 'Session cancelled',
    titleHe: 'Session cancelled',
    message: 'David Levi has cancelled the session scheduled for Wednesday, Sep 10.',
    messageHe: 'David Levi has cancelled the session scheduled for Wednesday.',
    link: '/therapist/sessions',
    isRead: true,
    emailSent: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// ============ NOTIFICATION ROUTER ============

export const notificationRouter = router({
  /**
   * Get all notifications for current user
   */
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(50).default(20),
        unreadOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || 'patient-1';
      const limit = input?.limit ?? 20;
      const unreadOnly = input?.unreadOnly ?? false;

      let notifications = mockNotifications.filter((n) => n.userId === userId);

      if (unreadOnly) {
        notifications = notifications.filter((n) => !n.isRead);
      }

      // Sort by date descending (newest first)
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Limit results
      notifications = notifications.slice(0, limit);

      return {
        notifications,
        unreadCount: mockNotifications.filter((n) => n.userId === userId && !n.isRead).length,
      };
    }),

  /**
   * Get unread notification count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id || 'patient-1';
    return mockNotifications.filter((n) => n.userId === userId && !n.isRead).length;
  }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input }) => {
      const notification = mockNotifications.find((n) => n.id === input.notificationId);
      if (notification) {
        notification.isRead = true;
      }
      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session?.user?.id || 'patient-1';
    for (const notification of mockNotifications) {
      if (notification.userId === userId) {
        notification.isRead = true;
      }
    }
    return { success: true };
  }),

  /**
   * Delete notification
   */
  delete: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input }) => {
      const index = mockNotifications.findIndex((n) => n.id === input.notificationId);
      if (index !== -1) {
        mockNotifications.splice(index, 1);
      }
      return { success: true };
    }),
});

// ============ NOTIFICATION SERVICE ============

/**
 * Create a new notification and send email
 */
export async function createNotification({
  userId,
  type,
  title,
  titleHe,
  message,
  messageHe,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  titleHe: string;
  message: string;
  messageHe: string;
  link?: string;
}): Promise<MockNotification> {
  const notification: MockNotification = {
    id: `notif-${Date.now()}`,
    userId,
    type,
    title,
    titleHe,
    message,
    messageHe,
    link: link || null,
    isRead: false,
    emailSent: false,
    createdAt: new Date(),
  };

  mockNotifications.unshift(notification);

  // Send email notification (in production, this would use a real email service)
  try {
    await sendNotificationEmail(userId, notification);
    notification.emailSent = true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }

  return notification;
}

/**
 * Send notification email (mock implementation)
 */
async function sendNotificationEmail(userId: string, notification: MockNotification): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));
}
