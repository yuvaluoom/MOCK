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
    userId: 'user-patient-1',
    type: 'MATCH_NEW',
    title: 'New therapist match found!',
    titleHe: 'נמצאה התאמה חדשה למטפל!',
    message: 'We found a new therapist match for you with 92% compatibility.',
    messageHe: 'מצאנו לך התאמה חדשה עם מטפל/ת עם 92% התאמה.',
    link: '/matches',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: 'notif-2',
    userId: 'user-patient-1',
    type: 'MESSAGE_NEW',
    title: 'New message from Dr. Rachel Cohen',
    titleHe: 'הודעה חדשה מד"ר רחל כהן',
    message: 'You have a new message regarding your upcoming session.',
    messageHe: 'יש לך הודעה חדשה בנוגע לפגישה הקרובה שלך.',
    link: '/messages',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'notif-3',
    userId: 'user-patient-1',
    type: 'SESSION_APPROVED',
    title: 'Session confirmed!',
    titleHe: 'הפגישה אושרה!',
    message: 'Your session with Dr. Rachel Cohen has been confirmed for Sunday at 10:00.',
    messageHe: 'הפגישה שלך עם ד"ר רחל כהן אושרה ליום ראשון בשעה 10:00.',
    link: '/sessions',
    isRead: true,
    emailSent: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'notif-4',
    userId: 'user-patient-1',
    type: 'SESSION_REMINDER',
    title: 'Session reminder',
    titleHe: 'תזכורת לפגישה',
    message: 'Your session is scheduled for tomorrow at 10:00 AM.',
    messageHe: 'הפגישה שלך מתוכננת למחר בשעה 10:00.',
    link: '/sessions',
    isRead: true,
    emailSent: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
  },
  // Therapist notifications
  {
    id: 'notif-therapist-1',
    userId: 'therapist-1',
    type: 'MATCH_NEW',
    title: 'New patient request!',
    titleHe: 'בקשת מטופל חדשה!',
    message: 'A new patient has requested to schedule a session with you.',
    messageHe: 'מטופל חדש ביקש לקבוע פגישה איתך.',
    link: '/therapist/sessions?tab=pending',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
  {
    id: 'notif-therapist-2',
    userId: 'therapist-1',
    type: 'MESSAGE_NEW',
    title: 'New message from patient',
    titleHe: 'הודעה חדשה ממטופל',
    message: 'You have a new message from ישראל ישראלי.',
    messageHe: 'יש לך הודעה חדשה מישראל ישראלי.',
    link: '/therapist/messages',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: 'notif-therapist-3',
    userId: 'therapist-1',
    type: 'SESSION_REMINDER',
    title: 'Session in 1 hour',
    titleHe: 'פגישה בעוד שעה',
    message: 'Reminder: You have a session with שרה כהן at 11:30.',
    messageHe: 'תזכורת: יש לך פגישה עם שרה כהן בשעה 11:30.',
    link: '/therapist/sessions',
    isRead: false,
    emailSent: true,
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
  },
  {
    id: 'notif-therapist-4',
    userId: 'therapist-1',
    type: 'PROFILE_APPROVED',
    title: 'Profile approved!',
    titleHe: 'הפרופיל שלך אושר!',
    message: 'Your therapist profile has been approved. You can now receive patient requests.',
    messageHe: 'פרופיל המטפל שלך אושר. כעת תוכל/י לקבל בקשות ממטופלים.',
    link: '/therapist/profile',
    isRead: true,
    emailSent: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
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
      const userId = ctx.session?.user?.id || 'user-patient-1'; // Mock for demo
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
    const userId = ctx.session?.user?.id || 'user-patient-1';
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
    const userId = ctx.session?.user?.id || 'user-patient-1';
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
  // In production, this would use a real email service like SendGrid, Mailgun, or Resend
  console.log(`[EMAIL] Sending notification email to user ${userId}:`);
  console.log(`  Subject: ${notification.title}`);
  console.log(`  Body: ${notification.message}`);
  console.log(`  Link: ${notification.link}`);

  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 100));
}
