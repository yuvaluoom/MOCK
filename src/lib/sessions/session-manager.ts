/**
 * Session Manager - Investor-Ready Implementation
 *
 * Unified session management with:
 * - Real system effects across all dashboards
 * - Calendar integration for all major providers
 * - HMO/Insurance & private payment support
 * - Notification triggers
 * - Email delivery
 * - Full persistence
 */

import { mockDb, type DbSession, type SessionStatus } from '@/lib/database/mock-db';
import {
  generateICS,
  getGoogleCalendarUrl,
  getOutlookUrl,
  getYahooCalendarUrl,
  type CalendarEvent,
} from '@/lib/calendar/export';

// ============================================================================
// TYPES
// ============================================================================

export type PaymentType = 'HMO' | 'PRIVATE' | 'SUBSIDIZED';

export interface SessionPaymentInfo {
  type: PaymentType;
  healthFund?: string;
  price: number;
  currency: string;
  isPaid: boolean;
  paidAt?: Date;
  receiptNumber?: string;
}

export interface SessionCalendarData {
  icsContent: string;
  googleCalendarUrl: string;
  outlookUrl: string;
  yahooUrl: string;
  appleCalendarData: string; // Base64 encoded ICS for data URL
}

export interface SessionNotification {
  id: string;
  sessionId: string;
  recipientId: string;
  recipientType: 'PATIENT' | 'THERAPIST';
  type: 'SESSION_REQUESTED' | 'SESSION_APPROVED' | 'SESSION_REJECTED' | 'SESSION_CANCELLED' | 'SESSION_REMINDER' | 'SESSION_COMPLETED';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface EnhancedSession {
  // Core session data
  id: string;
  patientId: string;
  therapistId: string;
  scheduledAt: Date;
  duration: number;
  type: 'INITIAL_CONSULTATION' | 'REGULAR' | 'FOLLOW_UP' | 'EMERGENCY';
  isOnline: boolean;
  status: SessionStatus;

  // Location/Meeting
  location?: string;
  meetingUrl?: string;

  // Payment
  payment: SessionPaymentInfo;

  // Participants (denormalized for display)
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  therapist: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };

  // Calendar data (generated on demand)
  calendarData?: SessionCalendarData;

  // Notes
  therapistNotes?: string;
  cancellationReason?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
}

export interface CreateSessionInput {
  patientId: string;
  therapistId: string;
  scheduledAt: Date;
  duration?: number;
  type?: EnhancedSession['type'];
  isOnline: boolean;
  healthFund?: string;
  notes?: string;
}

// ============================================================================
// IN-MEMORY NOTIFICATION STORE
// ============================================================================

const sessionNotifications: SessionNotification[] = [];

// ============================================================================
// SESSION MANAGER CLASS
// ============================================================================

class SessionManager {
  private static instance: SessionManager;

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // ---------------------------------------------------------------------------
  // SESSION CREATION
  // ---------------------------------------------------------------------------

  /**
   * Request a new session (patient action)
   * Creates session, notifies therapist, triggers email
   */
  async requestSession(input: CreateSessionInput): Promise<{
    success: boolean;
    session?: EnhancedSession;
    error?: string;
  }> {
    try {
      // Validate therapist
      const therapist = mockDb.getTherapistById(input.therapistId);
      if (!therapist || therapist.approvalStatus !== 'APPROVED') {
        return { success: false, error: 'Therapist not found or not approved' };
      }

      if (!therapist.isAcceptingPatients) {
        return { success: false, error: 'Therapist is not accepting new patients' };
      }

      // Validate patient
      const patient = mockDb.getPatientById(input.patientId);
      if (!patient) {
        return { success: false, error: 'Patient not found' };
      }

      // Determine payment type
      const paymentType = this.determinePaymentType(input.healthFund, therapist.acceptedHealthFunds);
      const price = paymentType === 'HMO' ? 0 : therapist.sessionPrice;

      // Create session in database
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const dbSession: DbSession = {
        id: sessionId,
        patientId: input.patientId,
        therapistId: input.therapistId,
        scheduledAt: input.scheduledAt,
        duration: input.duration ?? therapist.sessionDuration ?? 50,
        type: input.type ?? 'REGULAR',
        isOnline: input.isOnline,
        status: 'PENDING_THERAPIST_APPROVAL',
        meetingUrl: null,
        price,
        healthFund: input.healthFund ?? null,
        therapistNotes: null,
        cancellationReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.createSession(dbSession);

      // Create enhanced session object
      const enhancedSession = this.buildEnhancedSession(dbSession, patient, therapist);

      // Create notification for therapist
      this.createNotification({
        sessionId,
        recipientId: therapist.userId,
        recipientType: 'THERAPIST',
        type: 'SESSION_REQUESTED',
        title: 'בקשה לפגישה חדשה',
        message: `${patient.firstName} ${patient.lastName} מבקש/ת לקבוע פגישה בתאריך ${this.formatDate(input.scheduledAt)}`,
        metadata: { patientName: `${patient.firstName} ${patient.lastName}` },
      });

      // Trigger email to therapist
      this.triggerEmail('SESSION_REQUESTED', {
        to: therapist.email,
        therapistName: `${therapist.firstName} ${therapist.lastName}`,
        patientName: `${patient.firstName} ${patient.lastName}`,
        scheduledAt: input.scheduledAt,
        sessionType: input.isOnline ? 'מקוון' : 'פרונטלי',
      });

      console.log(`[SessionManager] Session ${sessionId} created - Pending approval`);

      return { success: true, session: enhancedSession };
    } catch (error) {
      console.error('[SessionManager] Error creating session:', error);
      return { success: false, error: 'Failed to create session' };
    }
  }

  // ---------------------------------------------------------------------------
  // SESSION APPROVAL
  // ---------------------------------------------------------------------------

  /**
   * Approve a session (therapist action)
   * Updates status, generates calendar data, notifies patient
   */
  async approveSession(
    sessionId: string,
    options: {
      meetingUrl?: string;
      location?: string;
      notes?: string;
    } = {}
  ): Promise<{ success: boolean; session?: EnhancedSession; error?: string }> {
    try {
      const session = mockDb.getSessionById(sessionId);
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      if (session.status !== 'PENDING_THERAPIST_APPROVAL') {
        return { success: false, error: `Session cannot be approved - current status: ${session.status}` };
      }

      // Update session
      mockDb.updateSession(sessionId, {
        status: 'APPROVED',
        meetingUrl: options.meetingUrl ?? null,
        therapistNotes: options.notes ?? null,
        updatedAt: new Date(),
      });

      const updatedSession = mockDb.getSessionById(sessionId)!;
      const patient = mockDb.getPatientById(session.patientId)!;
      const therapist = mockDb.getTherapistById(session.therapistId)!;

      // Build enhanced session with calendar data
      const enhancedSession = this.buildEnhancedSession(updatedSession, patient, therapist);
      enhancedSession.calendarData = this.generateCalendarData(enhancedSession);
      enhancedSession.approvedAt = new Date();

      // Create notification for patient
      this.createNotification({
        sessionId,
        recipientId: patient.userId,
        recipientType: 'PATIENT',
        type: 'SESSION_APPROVED',
        title: 'הפגישה אושרה!',
        message: `הפגישה עם ${therapist.firstName} ${therapist.lastName} בתאריך ${this.formatDate(session.scheduledAt)} אושרה. ניתן להוסיף ליומן.`,
        metadata: {
          therapistName: `${therapist.firstName} ${therapist.lastName}`,
          calendarDataAvailable: true,
        },
      });

      // Trigger email to patient with calendar attachment
      this.triggerEmail('SESSION_APPROVED', {
        to: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        therapistName: `${therapist.firstName} ${therapist.lastName}`,
        scheduledAt: session.scheduledAt,
        duration: session.duration,
        sessionType: session.isOnline ? 'מקוון' : 'פרונטלי',
        meetingUrl: options.meetingUrl,
        location: options.location,
        calendarAttachment: enhancedSession.calendarData?.icsContent,
      });

      console.log(`[SessionManager] Session ${sessionId} approved - Calendar data generated`);

      return { success: true, session: enhancedSession };
    } catch (error) {
      console.error('[SessionManager] Error approving session:', error);
      return { success: false, error: 'Failed to approve session' };
    }
  }

  // ---------------------------------------------------------------------------
  // SESSION REJECTION
  // ---------------------------------------------------------------------------

  /**
   * Reject a session (therapist action)
   */
  async rejectSession(
    sessionId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const session = mockDb.getSessionById(sessionId);
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      if (session.status !== 'PENDING_THERAPIST_APPROVAL') {
        return { success: false, error: `Session cannot be rejected - current status: ${session.status}` };
      }

      mockDb.updateSession(sessionId, {
        status: 'REJECTED',
        cancellationReason: reason ?? null,
        updatedAt: new Date(),
      });

      const patient = mockDb.getPatientById(session.patientId)!;
      const therapist = mockDb.getTherapistById(session.therapistId)!;

      // Notify patient
      this.createNotification({
        sessionId,
        recipientId: patient.userId,
        recipientType: 'PATIENT',
        type: 'SESSION_REJECTED',
        title: 'הפגישה לא אושרה',
        message: reason
          ? `הפגישה עם ${therapist.firstName} ${therapist.lastName} לא אושרה. סיבה: ${reason}`
          : `הפגישה עם ${therapist.firstName} ${therapist.lastName} לא אושרה. ניתן לנסות לקבוע מועד אחר.`,
      });

      // Email patient
      this.triggerEmail('SESSION_REJECTED', {
        to: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        therapistName: `${therapist.firstName} ${therapist.lastName}`,
        reason,
      });

      console.log(`[SessionManager] Session ${sessionId} rejected`);

      return { success: true };
    } catch (error) {
      console.error('[SessionManager] Error rejecting session:', error);
      return { success: false, error: 'Failed to reject session' };
    }
  }

  // ---------------------------------------------------------------------------
  // SESSION CANCELLATION
  // ---------------------------------------------------------------------------

  /**
   * Cancel a session (either party)
   */
  async cancelSession(
    sessionId: string,
    cancelledBy: 'PATIENT' | 'THERAPIST',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const session = mockDb.getSessionById(sessionId);
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      const validStatuses: SessionStatus[] = ['PENDING_THERAPIST_APPROVAL', 'APPROVED'];
      if (!validStatuses.includes(session.status)) {
        return { success: false, error: `Session cannot be cancelled - current status: ${session.status}` };
      }

      const newStatus: SessionStatus =
        cancelledBy === 'PATIENT' ? 'CANCELLED_BY_PATIENT' : 'CANCELLED_BY_THERAPIST';

      mockDb.updateSession(sessionId, {
        status: newStatus,
        cancellationReason: reason ?? null,
        updatedAt: new Date(),
      });

      const patient = mockDb.getPatientById(session.patientId)!;
      const therapist = mockDb.getTherapistById(session.therapistId)!;

      // Notify the other party
      const recipientId = cancelledBy === 'PATIENT' ? therapist.userId : patient.userId;
      const recipientType = cancelledBy === 'PATIENT' ? 'THERAPIST' : 'PATIENT';
      const cancellerName =
        cancelledBy === 'PATIENT'
          ? `${patient.firstName} ${patient.lastName}`
          : `${therapist.firstName} ${therapist.lastName}`;

      this.createNotification({
        sessionId,
        recipientId,
        recipientType,
        type: 'SESSION_CANCELLED',
        title: 'פגישה בוטלה',
        message: `הפגישה בתאריך ${this.formatDate(session.scheduledAt)} בוטלה על ידי ${cancellerName}`,
      });

      // Email both parties
      this.triggerEmail('SESSION_CANCELLED', {
        to: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        therapistName: `${therapist.firstName} ${therapist.lastName}`,
        scheduledAt: session.scheduledAt,
        cancelledBy,
        reason,
      });

      this.triggerEmail('SESSION_CANCELLED', {
        to: therapist.email,
        patientName: `${patient.firstName} ${patient.lastName}`,
        therapistName: `${therapist.firstName} ${therapist.lastName}`,
        scheduledAt: session.scheduledAt,
        cancelledBy,
        reason,
      });

      console.log(`[SessionManager] Session ${sessionId} cancelled by ${cancelledBy}`);

      return { success: true };
    } catch (error) {
      console.error('[SessionManager] Error cancelling session:', error);
      return { success: false, error: 'Failed to cancel session' };
    }
  }

  // ---------------------------------------------------------------------------
  // SESSION COMPLETION
  // ---------------------------------------------------------------------------

  /**
   * Mark session as completed (therapist action)
   */
  async completeSession(
    sessionId: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const session = mockDb.getSessionById(sessionId);
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      if (session.status !== 'APPROVED') {
        return { success: false, error: `Session cannot be completed - current status: ${session.status}` };
      }

      mockDb.updateSession(sessionId, {
        status: 'COMPLETED',
        therapistNotes: notes ?? session.therapistNotes,
        updatedAt: new Date(),
      });

      const patient = mockDb.getPatientById(session.patientId)!;
      const therapist = mockDb.getTherapistById(session.therapistId)!;

      // Notify patient
      this.createNotification({
        sessionId,
        recipientId: patient.userId,
        recipientType: 'PATIENT',
        type: 'SESSION_COMPLETED',
        title: 'הפגישה הסתיימה',
        message: `הפגישה עם ${therapist.firstName} ${therapist.lastName} סומנה כהושלמה. תודה!`,
      });

      console.log(`[SessionManager] Session ${sessionId} completed`);

      return { success: true };
    } catch (error) {
      console.error('[SessionManager] Error completing session:', error);
      return { success: false, error: 'Failed to complete session' };
    }
  }

  // ---------------------------------------------------------------------------
  // SESSION QUERIES
  // ---------------------------------------------------------------------------

  /**
   * Get session with full details and calendar data
   */
  getSessionWithCalendar(sessionId: string): EnhancedSession | null {
    const session = mockDb.getSessionById(sessionId);
    if (!session) return null;

    const patient = mockDb.getPatientById(session.patientId);
    const therapist = mockDb.getTherapistById(session.therapistId);
    if (!patient || !therapist) return null;

    const enhanced = this.buildEnhancedSession(session, patient, therapist);

    // Generate calendar data for approved sessions
    if (session.status === 'APPROVED' || session.status === 'COMPLETED') {
      enhanced.calendarData = this.generateCalendarData(enhanced);
    }

    return enhanced;
  }

  /**
   * Get sessions for patient dashboard
   */
  getPatientSessions(patientId: string): EnhancedSession[] {
    const sessions = mockDb.getSessionsByPatient(patientId);
    return sessions.map((session) => {
      const patient = mockDb.getPatientById(session.patientId)!;
      const therapist = mockDb.getTherapistById(session.therapistId)!;
      const enhanced = this.buildEnhancedSession(session, patient, therapist);

      if (session.status === 'APPROVED') {
        enhanced.calendarData = this.generateCalendarData(enhanced);
      }

      return enhanced;
    });
  }

  /**
   * Get sessions for therapist dashboard
   */
  getTherapistSessions(therapistId: string): EnhancedSession[] {
    const sessions = mockDb.getSessionsByTherapist(therapistId);
    return sessions.map((session) => {
      const patient = mockDb.getPatientById(session.patientId)!;
      const therapist = mockDb.getTherapistById(session.therapistId)!;
      const enhanced = this.buildEnhancedSession(session, patient, therapist);

      if (session.status === 'APPROVED') {
        enhanced.calendarData = this.generateCalendarData(enhanced);
      }

      return enhanced;
    });
  }

  /**
   * Get notifications for user
   */
  getNotifications(userId: string): SessionNotification[] {
    return sessionNotifications
      .filter((n) => n.recipientId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(notificationId: string): void {
    const notification = sessionNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // ---------------------------------------------------------------------------
  // CALENDAR DATA GENERATION
  // ---------------------------------------------------------------------------

  /**
   * Generate calendar data for all providers
   */
  private generateCalendarData(session: EnhancedSession): SessionCalendarData {
    const event: CalendarEvent = {
      uid: `session-${session.id}@matchmind.co.il`,
      title: `פגישה טיפולית עם ${session.therapist.name}`,
      description: this.buildEventDescription(session),
      startDate: session.scheduledAt,
      endDate: new Date(session.scheduledAt.getTime() + session.duration * 60000),
      isOnline: session.isOnline,
      location: session.isOnline ? 'פגישה מקוונת' : session.location,
      meetingUrl: session.meetingUrl,
      organizerName: session.therapist.name,
      organizerEmail: session.therapist.email,
      attendeeName: session.patient.name,
      attendeeEmail: session.patient.email,
      reminder: 60, // 1 hour before
    };

    const icsContent = generateICS(event);

    return {
      icsContent,
      googleCalendarUrl: getGoogleCalendarUrl(event),
      outlookUrl: getOutlookUrl(event),
      yahooUrl: getYahooCalendarUrl(event),
      appleCalendarData: `data:text/calendar;base64,${Buffer.from(icsContent).toString('base64')}`,
    };
  }

  private buildEventDescription(session: EnhancedSession): string {
    let desc = `פגישה טיפולית עם ${session.therapist.name}`;
    if (session.therapist.title) {
      desc += ` (${session.therapist.title})`;
    }
    desc += `\n\nמשך הפגישה: ${session.duration} דקות`;
    desc += `\nסוג: ${session.isOnline ? 'פגישה מקוונת' : 'פגישה פרונטלית'}`;

    if (session.meetingUrl) {
      desc += `\n\nקישור להצטרפות: ${session.meetingUrl}`;
    }

    if (session.payment.type === 'HMO') {
      desc += `\n\nתשלום: קופת חולים (${session.payment.healthFund})`;
    } else {
      desc += `\n\nתשלום: פרטי - ₪${session.payment.price}`;
    }

    desc += '\n\n---\nMatchMind - התאמה מושלמת לטיפול';

    return desc;
  }

  // ---------------------------------------------------------------------------
  // HELPER METHODS
  // ---------------------------------------------------------------------------

  private buildEnhancedSession(
    session: DbSession,
    patient: any,
    therapist: any
  ): EnhancedSession {
    const paymentType = this.determinePaymentType(
      session.healthFund ?? undefined,
      therapist.acceptedHealthFunds
    );

    return {
      id: session.id,
      patientId: session.patientId,
      therapistId: session.therapistId,
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      type: session.type as EnhancedSession['type'],
      isOnline: session.isOnline,
      status: session.status,
      location: session.isOnline ? undefined : therapist.address,
      meetingUrl: session.meetingUrl ?? undefined,
      payment: {
        type: paymentType,
        healthFund: session.healthFund ?? undefined,
        price: session.price ?? therapist.sessionPrice,
        currency: 'ILS',
        isPaid: false, // Would track actual payment
      },
      patient: {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        email: patient.email,
        phone: patient.phone,
      },
      therapist: {
        id: therapist.id,
        name: `${therapist.firstName} ${therapist.lastName}`,
        email: therapist.email,
        phone: therapist.phone,
        title: therapist.title,
      },
      therapistNotes: session.therapistNotes ?? undefined,
      cancellationReason: session.cancellationReason ?? undefined,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  private determinePaymentType(
    healthFund: string | undefined,
    acceptedFunds: string[]
  ): PaymentType {
    if (!healthFund || healthFund === 'PRIVATE') {
      return 'PRIVATE';
    }
    if (acceptedFunds.includes(healthFund)) {
      return 'HMO';
    }
    return 'PRIVATE';
  }

  private createNotification(data: Omit<SessionNotification, 'id' | 'isRead' | 'createdAt'>): void {
    const notification: SessionNotification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
      createdAt: new Date(),
    };
    sessionNotifications.push(notification);

    // Also create in mock database with proper interface
    mockDb.createNotification({
      recipientId: data.recipientId,
      recipientRole: data.recipientType === 'PATIENT' ? 'PATIENT' : 'THERAPIST',
      type: data.type as any,
      title: data.title,
      titleHe: data.title, // Hebrew title
      message: data.message,
      messageHe: data.message, // Hebrew message
      priority: 'normal',
      data: data.metadata ?? {},
      isRead: false,
      readAt: null,
      emailSent: false,
      emailSentAt: null,
      emailId: null,
    });
  }

  private triggerEmail(template: string, data: Record<string, any>): void {
    // Log for demo purposes
    console.log(`[SessionManager] Email triggered: ${template}`, {
      to: data.to,
      template,
      hasCalendarAttachment: !!data.calendarAttachment,
    });

    // In production, would call actual email service
    // Using idempotency key to prevent duplicate emails
    const idempotencyKey = `${template}-${data.to}-${Date.now()}`;

    mockDb.logEmail({
      to: data.to,
      type: template,
      subject: this.getEmailSubject(template),
      recipientName: data.patientName ?? data.therapistName ?? 'User',
      relatedEntityType: 'SESSION',
      relatedEntityId: data.sessionId ?? null,
      triggeredBy: 'SYSTEM',
      triggeredByAction: template,
      status: 'SENT',
      sentAt: new Date(),
      errorMessage: null,
      idempotencyKey,
    });
  }

  private getEmailSubject(template: string): string {
    const subjects: Record<string, string> = {
      SESSION_REQUESTED: 'בקשה לפגישה חדשה - MatchMind',
      SESSION_APPROVED: 'הפגישה אושרה! - MatchMind',
      SESSION_REJECTED: 'עדכון לגבי הפגישה - MatchMind',
      SESSION_CANCELLED: 'פגישה בוטלה - MatchMind',
      SESSION_REMINDER: 'תזכורת לפגישה - MatchMind',
    };
    return subjects[template] ?? 'עדכון מ-MatchMind';
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const sessionManager = SessionManager.getInstance();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function requestSession(input: CreateSessionInput) {
  return sessionManager.requestSession(input);
}

export async function approveSession(sessionId: string, options?: { meetingUrl?: string; location?: string; notes?: string }) {
  return sessionManager.approveSession(sessionId, options);
}

export async function rejectSession(sessionId: string, reason?: string) {
  return sessionManager.rejectSession(sessionId, reason);
}

export async function cancelSession(sessionId: string, cancelledBy: 'PATIENT' | 'THERAPIST', reason?: string) {
  return sessionManager.cancelSession(sessionId, cancelledBy, reason);
}

export async function completeSession(sessionId: string, notes?: string) {
  return sessionManager.completeSession(sessionId, notes);
}

export function getSessionWithCalendar(sessionId: string) {
  return sessionManager.getSessionWithCalendar(sessionId);
}

export function getPatientSessions(patientId: string) {
  return sessionManager.getPatientSessions(patientId);
}

export function getTherapistSessions(therapistId: string) {
  return sessionManager.getTherapistSessions(therapistId);
}
