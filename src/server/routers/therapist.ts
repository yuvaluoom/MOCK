import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, therapistProcedure, approvedTherapistProcedure } from '../trpc';
import { mockTherapists, mockSessions, mockPatient, mockXFactorProfile, mockMatches, getTherapistById, type MockTherapist } from '../mock-data';
import { calculateDetailedMatch, DEFAULT_CONFIG } from '@/lib/matching/algorithm';

// ============ THERAPIST NOTIFICATIONS ============

interface TherapistNotification {
  id: string;
  therapistId: string;
  type: string;
  title: string;
  titleHe: string;
  message: string;
  messageHe: string;
  link: string | null;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  emailSent: boolean;
  createdAt: Date;
  metadata?: {
    patientName?: string;
    patientId?: string;
    sessionId?: string;
    documentType?: string;
    adminNote?: string;
  };
}

// In-memory notifications for therapists
const mockTherapistNotifications: TherapistNotification[] = [
  {
    id: 'tnotif-1',
    therapistId: 'therapist-1',
    type: 'NEW_PATIENT_REQUEST',
    title: 'New Patient Request',
    titleHe: 'New request fromPatient',
    message: 'Israel Israeli has requested an appointment with you.',
    messageHe: 'Israel Israeli has requested to schedule a session with you.',
    link: '/therapist/sessions',
    isRead: false,
    priority: 'high',
    emailSent: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    metadata: { patientName: 'Israel Israeli', patientId: 'patient-1', sessionId: 'session-2' },
  },
  {
    id: 'tnotif-2',
    therapistId: 'therapist-1',
    type: 'MESSAGE_NEW',
    title: 'New Message from Patient',
    titleHe: 'New Message from Patient',
    message: 'You have a new message from Israel Israeli.',
    messageHe: 'You have a new message from Israel Israeli.',
    link: '/therapist/messages',
    isRead: false,
    priority: 'normal',
    emailSent: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    metadata: { patientName: 'Israel Israeli', patientId: 'patient-1' },
  },
  {
    id: 'tnotif-3',
    therapistId: 'therapist-1',
    type: 'SESSION_REMINDER',
    title: 'Session Tomorrow',
    titleHe: 'Session Tomorrow',
    message: 'Reminder: You have a session scheduled for tomorrow at 10:00.',
    messageHe: 'Reminder: You have a session scheduled for tomorrow at 10:00.',
    link: '/therapist/sessions',
    isRead: true,
    priority: 'normal',
    emailSent: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    metadata: { patientName: 'Sarah Cohen', sessionId: 'session-1' },
  },
  {
    id: 'tnotif-4',
    therapistId: 'therapist-1',
    type: 'PROFILE_APPROVED',
    title: 'Profile Approved!',
    titleHe: 'Profile Approved!',
    message: 'Your therapist profile has been approved. You can now accept patients.',
    messageHe: 'Your therapist profile has been approved. You can now receive patients.',
    link: '/therapist/dashboard',
    isRead: true,
    priority: 'high',
    emailSent: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
];

// Patient request type for therapist decision workflow
interface PatientRequest {
  id: string;
  patientId: string;
  therapistId: string;
  sessionId: string | null;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'INFO_REQUESTED';
  declineReason?: string;
  infoRequestNote?: string;
  therapistNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock patient requests
const mockPatientRequests: PatientRequest[] = [
  {
    id: 'request-1',
    patientId: 'patient-1',
    therapistId: 'therapist-1',
    sessionId: 'session-2',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// Audit log for therapist actions
interface TherapistAuditLog {
  id: string;
  therapistId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  createdAt: Date;
}

const mockTherapistAuditLogs: TherapistAuditLog[] = [];

// ============ VALIDATION SCHEMAS ============

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(9).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  bioHebrew: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  offersOnline: z.boolean().optional(),
  offersInPerson: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  approaches: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  acceptedHealthFunds: z.array(z.string()).optional(),
  sessionPrice: z.number().int().positive().optional(),
  sessionDuration: z.number().int().positive().optional(),
  yearsOfExperience: z.number().int().nonnegative().optional(),
});

const availabilitySlotSchema = z.object({
  dayOfWeek: z.enum(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  isOnline: z.boolean().default(true),
  isInPerson: z.boolean().default(true),
});

// In-memory mock availability
let mockAvailability = [
  { id: 'avail-1', therapistId: 'therapist-1', dayOfWeek: 'SUNDAY', startTime: '09:00', endTime: '17:00', isOnline: true, isInPerson: true },
  { id: 'avail-2', therapistId: 'therapist-1', dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '18:00', isOnline: true, isInPerson: true },
  { id: 'avail-3', therapistId: 'therapist-1', dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '15:00', isOnline: true, isInPerson: false },
];

// In-memory mock blocked times
let mockBlockedTimes: Array<{
  id: string;
  therapistId: string;
  startDateTime: Date;
  endDateTime: Date;
  reason?: string;
}> = [];

// Use the first therapist as the "current" therapist
const currentTherapist = mockTherapists[0];

// ============ HELPER FUNCTIONS ============

/**
 * Create therapist notification and send email
 */
function createTherapistNotification(notification: Omit<TherapistNotification, 'id' | 'createdAt' | 'emailSent'>): TherapistNotification {
  const newNotification: TherapistNotification = {
    ...notification,
    id: `tnotif-${Date.now()}`,
    emailSent: false,
    createdAt: new Date(),
  };

  mockTherapistNotifications.unshift(newNotification);

  newNotification.emailSent = true;

  return newNotification;
}

/**
 * Log therapist action for audit trail
 */
function logTherapistAction(therapistId: string, action: string, entityType: string, entityId: string, details: Record<string, any>): void {
  mockTherapistAuditLogs.push({
    id: `taudit-${Date.now()}`,
    therapistId,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date(),
  });
}

/**
 * Check if therapist profile is complete for approval
 */
function checkProfileCompletion(therapist: typeof currentTherapist): boolean {
  const requiredFields: (keyof typeof therapist)[] = [
    'firstName',
    'lastName',
    'phone',
    'gender',
    'city',
    'licenseNumber',
    'approaches',
    'specializations',
  ];

  for (const field of requiredFields) {
    const value = therapist[field];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return false;
    }
  }

  return true;
}

// ============ ROUTER ============

export const therapistRouter = router({
  // ============ NOTIFICATIONS ============

  /**
   * Get therapist notifications
   */
  getNotifications: therapistProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(50).default(15),
        unreadOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async () => {
      const therapistId = currentTherapist.id;
      const limit = 15;

      let notifications = mockTherapistNotifications.filter((n) => n.therapistId === therapistId);

      // Sort by priority (urgent first) then by date
      notifications.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      const unreadCount = notifications.filter((n) => !n.isRead).length;
      notifications = notifications.slice(0, limit);

      return {
        notifications,
        unreadCount,
      };
    }),

  /**
   * Mark notification as read
   */
  markNotificationAsRead: therapistProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input }) => {
      const notification = mockTherapistNotifications.find((n) => n.id === input.notificationId);
      if (notification) {
        notification.isRead = true;
      }
      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: therapistProcedure.mutation(async () => {
    const therapistId = currentTherapist.id;
    mockTherapistNotifications.forEach((n) => {
      if (n.therapistId === therapistId) {
        n.isRead = true;
      }
    });
    return { success: true };
  }),

  // ============ PATIENT DATA ============

  /**
   * Get full patient profile with X-Factor data
   */
  getPatientProfile: approvedTherapistProcedure
    .input(z.object({ patientId: z.string() }))
    .query(async ({ input }) => {
      if (input.patientId !== mockPatient.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Patient not found',
        });
      }

      // Get match data for this patient-therapist pair
      const match = mockMatches.find(
        (m) => m.patientId === input.patientId && m.therapistId === currentTherapist.id
      );

      // Get sessions with this patient
      const sessions = mockSessions.filter(
        (s) => s.patientId === input.patientId && s.therapistId === currentTherapist.id
      );

      return {
        // Basic info
        id: mockPatient.id,
        firstName: mockPatient.firstName,
        lastName: mockPatient.lastName,
        email: mockPatient.email,
        phone: mockPatient.phone,
        city: mockPatient.city,
        createdAt: mockPatient.createdAt,

        // Preferences
        preferences: {
          healthFund: mockPatient.healthFund,
          preferredOnline: mockPatient.preferredOnline,
          preferredGender: mockPatient.preferredGender,
          preferredLanguages: mockPatient.preferredLanguages,
          preferredApproaches: mockPatient.preferredApproaches,
          preferredDays: mockPatient.preferredDays,
        },

        // X-Factor Profile
        xFactorProfile: {
          openness: mockXFactorProfile.openness,
          emotionalIntensity: mockXFactorProfile.emotionalIntensity,
          structurePreference: mockXFactorProfile.structurePreference,
          relationshipStyle: mockXFactorProfile.relationshipStyle,
          communicationStyle: mockXFactorProfile.communicationStyle,
          changeReadiness: mockXFactorProfile.changeReadiness,
          sleepQuality: mockXFactorProfile.sleepQuality,
          stressLevel: mockXFactorProfile.stressLevel,
          emotionalLoad: mockXFactorProfile.emotionalLoad,
          calculatedAt: mockXFactorProfile.calculatedAt,
        },

        // Match data
        matchData: match ? {
          overallScore: match.overallScore,
          xFactorScore: match.xFactorScore,
          explanationHe: match.explanationHe,
          explanationEn: match.explanationEn,
          scoreBreakdown: match.scoreBreakdown,
        } : null,

        // Session history
        sessionHistory: {
          total: sessions.length,
          completed: sessions.filter((s) => s.status === 'COMPLETED').length,
          upcoming: sessions.filter((s) => s.status === 'APPROVED' && s.scheduledAt > new Date()).length,
          pending: sessions.filter((s) => s.status === 'PENDING_THERAPIST_APPROVAL').length,
        },

        // Status flags
        questionnaireCompleted: mockPatient.questionnaireCompleted,
        onboardingCompleted: mockPatient.onboardingCompleted,
      };
    }),

  /**
   * Get patient requests (pending approvals)
   */
  getPatientRequests: approvedTherapistProcedure
    .input(
      z.object({
        status: z.enum(['PENDING', 'APPROVED', 'DECLINED', 'INFO_REQUESTED']).optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      let filtered = mockPatientRequests.filter((r) => r.therapistId === currentTherapist.id);

      if (input.status) {
        filtered = filtered.filter((r) => r.status === input.status);
      }

      // Sort by createdAt desc
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const total = filtered.length;
      const skip = (input.page - 1) * input.limit;
      const paged = filtered.slice(skip, skip + input.limit);

      // Enrich with patient data
      const requests = paged.map((request) => ({
        ...request,
        patient: {
          id: mockPatient.id,
          firstName: mockPatient.firstName,
          lastName: mockPatient.lastName,
          city: mockPatient.city,
          healthFund: mockPatient.healthFund,
          preferredOnline: mockPatient.preferredOnline,
        },
        session: request.sessionId
          ? mockSessions.find((s) => s.id === request.sessionId)
          : null,
      }));

      return {
        requests,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Approve patient request
   */
  approvePatientRequest: approvedTherapistProcedure
    .input(
      z.object({
        requestId: z.string(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const request = mockPatientRequests.find((r) => r.id === input.requestId);

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (request.therapistId !== currentTherapist.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized',
        });
      }

      // Update request
      request.status = 'APPROVED';
      request.therapistNote = input.note;
      request.updatedAt = new Date();

      // Update associated session if exists
      if (request.sessionId) {
        const session = mockSessions.find((s) => s.id === request.sessionId);
        if (session) {
          session.status = 'APPROVED';
        }
      }

      // Log action
      logTherapistAction(currentTherapist.id, 'APPROVE_PATIENT', 'PatientRequest', request.id, {
        patientId: request.patientId,
        note: input.note,
      });

      // TODO: Send notification to patient (would use createNotification from notification router)

      return { success: true };
    }),

  /**
   * Decline patient request
   */
  declinePatientRequest: approvedTherapistProcedure
    .input(
      z.object({
        requestId: z.string(),
        reason: z.string().min(1, 'Decline reason is required'),
      })
    )
    .mutation(async ({ input }) => {
      const request = mockPatientRequests.find((r) => r.id === input.requestId);

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (request.therapistId !== currentTherapist.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized',
        });
      }

      // Update request
      request.status = 'DECLINED';
      request.declineReason = input.reason;
      request.updatedAt = new Date();

      // Update associated session if exists
      if (request.sessionId) {
        const session = mockSessions.find((s) => s.id === request.sessionId);
        if (session) {
          session.status = 'REJECTED';
        }
      }

      // Log action
      logTherapistAction(currentTherapist.id, 'DECLINE_PATIENT', 'PatientRequest', request.id, {
        patientId: request.patientId,
        reason: input.reason,
      });

      return { success: true };
    }),

  /**
   * Request more info from patient
   */
  requestPatientInfo: approvedTherapistProcedure
    .input(
      z.object({
        requestId: z.string(),
        note: z.string().min(1, 'Note is required'),
      })
    )
    .mutation(async ({ input }) => {
      const request = mockPatientRequests.find((r) => r.id === input.requestId);

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found',
        });
      }

      if (request.therapistId !== currentTherapist.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized',
        });
      }

      // Update request
      request.status = 'INFO_REQUESTED';
      request.infoRequestNote = input.note;
      request.updatedAt = new Date();

      // Log action
      logTherapistAction(currentTherapist.id, 'REQUEST_INFO', 'PatientRequest', request.id, {
        patientId: request.patientId,
        note: input.note,
      });

      return { success: true };
    }),

  // ============ DASHBOARD STATS ============

  /**
   * Get therapist dashboard stats
   */
  getDashboardStats: approvedTherapistProcedure.query(async () => {
    const therapistId = currentTherapist.id;

    // Today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = mockSessions.filter(
      (s) =>
        s.therapistId === therapistId &&
        s.scheduledAt >= today &&
        s.scheduledAt < tomorrow &&
        s.status === 'APPROVED'
    );

    // Pending requests
    const pendingRequests = mockPatientRequests.filter(
      (r) => r.therapistId === therapistId && r.status === 'PENDING'
    );

    // Unread notifications
    const unreadNotifications = mockTherapistNotifications.filter(
      (n) => n.therapistId === therapistId && !n.isRead
    );

    // Active patients (with at least one completed or approved session)
    const patientIds = new Set(
      mockSessions
        .filter(
          (s) =>
            s.therapistId === therapistId &&
            (s.status === 'APPROVED' || s.status === 'COMPLETED')
        )
        .map((s) => s.patientId)
    );

    return {
      todaySessions: todaySessions.length,
      pendingRequests: pendingRequests.length,
      unreadMessages: unreadNotifications.filter((n) => n.type === 'MESSAGE_NEW').length,
      totalPatients: patientIds.size,
      upcomingSessions: todaySessions.map((s) => ({
        id: s.id,
        patientName: `${mockPatient.firstName} ${mockPatient.lastName}`,
        time: s.scheduledAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        type: s.isOnline ? 'online' : 'in-person',
      })),
    };
  }),

  // ============ PROFILE MANAGEMENT ============

  /**
   * Get therapist profile
   */
  getProfile: therapistProcedure.query(async () => {
    return {
      ...currentTherapist,
      documents: [],
      availability: mockAvailability,
    };
  }),

  /**
   * Update therapist profile
   */
  updateProfile: therapistProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input }) => {
      // Apply updates to mock therapist in memory
      Object.assign(currentTherapist, input);

      // Check if profile is now complete and update status if needed
      if (currentTherapist.approvalStatus === 'PENDING_INFO') {
        const isComplete = checkProfileCompletion(currentTherapist);
        if (isComplete) {
          currentTherapist.profileCompleted = true;
          currentTherapist.approvalStatus = 'AWAITING_APPROVAL';
        }
      }

      // Log action
      logTherapistAction(currentTherapist.id, 'UPDATE_PROFILE', 'Therapist', currentTherapist.id, input);

      return { ...currentTherapist };
    }),

  /**
   * Upload profile photo (returns presigned URL)
   */
  getPhotoUploadUrl: therapistProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number().max(5 * 1024 * 1024, 'File too large (max 5MB)'),
      })
    )
    .mutation(async ({ input }) => {
      const uploadUrl = `https://s3.amazonaws.com/matchmind-storage/therapists/${currentTherapist.id}/photos/upload`;
      const key = `therapists/${currentTherapist.id}/photos/${Date.now()}-${input.fileName}`;

      return {
        uploadUrl,
        key,
        fields: {},
      };
    }),

  /**
   * Save photo crop data
   */
  savePhotoCrop: therapistProcedure
    .input(
      z.object({
        photoUrl: z.string().url(),
        cropData: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      currentTherapist.photoUrl = input.photoUrl;
      currentTherapist.photoThumbnailUrl = input.photoUrl;

      return { ...currentTherapist };
    }),

  // ============ AVAILABILITY ============

  /**
   * Get availability slots
   */
  getAvailability: therapistProcedure.query(async () => {
    return mockAvailability;
  }),

  /**
   * Set availability (replaces all slots)
   */
  setAvailability: therapistProcedure
    .input(z.object({ slots: z.array(availabilitySlotSchema) }))
    .mutation(async ({ input }) => {
      mockAvailability = input.slots.map((slot, i) => ({
        id: `avail-${Date.now()}-${i}`,
        therapistId: currentTherapist.id,
        ...slot,
      }));

      logTherapistAction(currentTherapist.id, 'UPDATE_AVAILABILITY', 'Availability', currentTherapist.id, {
        slots: input.slots.length,
      });

      return { success: true };
    }),

  /**
   * Add blocked time
   */
  addBlockedTime: therapistProcedure
    .input(
      z.object({
        startDateTime: z.string().datetime(),
        endDateTime: z.string().datetime(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const blocked = {
        id: `blocked-${Date.now()}`,
        therapistId: currentTherapist.id,
        startDateTime: new Date(input.startDateTime),
        endDateTime: new Date(input.endDateTime),
        reason: input.reason,
      };

      mockBlockedTimes.push(blocked);
      return blocked;
    }),

  /**
   * Remove blocked time
   */
  removeBlockedTime: therapistProcedure
    .input(z.object({ blockedTimeId: z.string() }))
    .mutation(async ({ input }) => {
      mockBlockedTimes = mockBlockedTimes.filter(
        (bt) => bt.id !== input.blockedTimeId
      );

      return { success: true };
    }),

  // ============ SESSIONS ============

  /**
   * Get therapist's sessions (approved therapists only)
   */
  getSessions: approvedTherapistProcedure
    .input(
      z.object({
        status: z
          .enum([
            'PENDING_THERAPIST_APPROVAL',
            'APPROVED',
            'REJECTED',
            'CANCELLED_BY_PATIENT',
            'CANCELLED_BY_THERAPIST',
            'COMPLETED',
            'NO_SHOW',
          ])
          .optional(),
        upcoming: z.boolean().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      let filtered = mockSessions.filter((s) => s.therapistId === currentTherapist.id);

      if (input.status) {
        filtered = filtered.filter((s) => s.status === input.status);
      }

      if (input.upcoming) {
        const now = new Date();
        filtered = filtered.filter(
          (s) =>
            s.scheduledAt >= now &&
            (s.status === 'PENDING_THERAPIST_APPROVAL' || s.status === 'APPROVED')
        );
        filtered.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
      } else {
        filtered.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
      }

      const total = filtered.length;
      const skip = (input.page - 1) * input.limit;
      const paged = filtered.slice(skip, skip + input.limit);

      const sessions = paged.map((session) => ({
        ...session,
        patient: {
          id: mockPatient.id,
          firstName: mockPatient.firstName,
          lastName: mockPatient.lastName,
          city: mockPatient.city,
          healthFund: mockPatient.healthFund,
        },
      }));

      return {
        sessions,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
          hasMore: skip + paged.length < total,
        },
      };
    }),

  /**
   * Approve session
   */
  approveSession: approvedTherapistProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const session = mockSessions.find((s) => s.id === input.sessionId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      if (session.therapistId !== currentTherapist.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized',
        });
      }

      session.status = 'APPROVED';

      logTherapistAction(currentTherapist.id, 'APPROVE_SESSION', 'Session', session.id, {
        patientId: session.patientId,
      });

      return { success: true };
    }),

  /**
   * Reject session
   */
  rejectSession: approvedTherapistProcedure
    .input(
      z.object({
        sessionId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = mockSessions.find((s) => s.id === input.sessionId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      if (session.therapistId !== currentTherapist.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized',
        });
      }

      session.status = 'REJECTED';

      logTherapistAction(currentTherapist.id, 'REJECT_SESSION', 'Session', session.id, {
        patientId: session.patientId,
        reason: input.reason,
      });

      return { success: true };
    }),

  // ============ PATIENTS ============

  /**
   * Get therapist's patients (approved therapists only)
   */
  getPatients: approvedTherapistProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      // Get unique patients from sessions
      const patientIds = new Set(
        mockSessions
          .filter(
            (s) =>
              s.therapistId === currentTherapist.id &&
              (s.status === 'APPROVED' || s.status === 'COMPLETED')
          )
          .map((s) => s.patientId)
      );

      const patients = Array.from(patientIds).map((patientId) => {
        const patientSessions = mockSessions.filter(
          (s) => s.patientId === patientId && s.therapistId === currentTherapist.id
        );

        const lastSession = patientSessions
          .filter((s) => s.status === 'COMPLETED')
          .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())[0];

        const nextSession = patientSessions
          .filter((s) => s.status === 'APPROVED' && s.scheduledAt > new Date())
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];

        return {
          id: mockPatient.id,
          firstName: mockPatient.firstName,
          lastName: mockPatient.lastName,
          city: mockPatient.city,
          healthFund: mockPatient.healthFund,
          totalSessions: patientSessions.filter((s) => s.status === 'COMPLETED').length,
          lastSession: lastSession?.scheduledAt || null,
          nextSession: nextSession?.scheduledAt || null,
          status: nextSession ? 'active' : lastSession ? 'inactive' : 'new',
          createdAt: mockPatient.createdAt,
        };
      });

      return {
        patients,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: patients.length,
          hasMore: false,
        },
      };
    }),

  /**
   * Toggle accepting new patients
   */
  toggleAcceptingPatients: approvedTherapistProcedure.mutation(async () => {
    currentTherapist.isAcceptingPatients = !currentTherapist.isAcceptingPatients;

    logTherapistAction(currentTherapist.id, 'TOGGLE_ACCEPTING_PATIENTS', 'Therapist', currentTherapist.id, {
      isAcceptingPatients: currentTherapist.isAcceptingPatients,
    });

    return { isAcceptingPatients: currentTherapist.isAcceptingPatients };
  }),

  /**
   * Get matched patients with detailed match explanation
   * Shows the therapist how well they match with their patients + reasoning
   */
  getMatchedPatients: approvedTherapistProcedure.query(async () => {
    // Get matches for this therapist
    const therapistMatches = mockMatches.filter(
      (m) => m.therapistId === currentTherapist.id
    );

    if (therapistMatches.length === 0) {
      // Compute a live match for demo purposes
      const therapist = mockTherapists.find((t) => t.id === currentTherapist.id);
      if (!therapist) return { matches: [] };

      const result = calculateDetailedMatch(
        mockPatient,
        mockXFactorProfile,
        therapist as MockTherapist,
        DEFAULT_CONFIG
      );

      return {
        matches: [
          {
            patientId: mockPatient.id,
            patientName: `${mockPatient.firstName} ${mockPatient.lastName}`,
            patientCity: mockPatient.city,
            overallScore: result.overallScore,
            objectiveFitScore: result.objectiveFitScore,
            subjectiveFitScore: result.subjectiveFitScore,
            matchQuality: result.matchQuality,
            explanationItems: result.explanationItems,
            topReasons: result.topReasons,
            insights: result.insights,
          },
        ],
      };
    }

    // Map existing matches with detailed explanation
    return {
      matches: therapistMatches.map((match) => ({
        patientId: match.patientId,
        patientName: `${mockPatient.firstName} ${mockPatient.lastName}`,
        patientCity: mockPatient.city,
        overallScore: match.overallScore,
        objectiveFitScore: match.objectiveFitScore,
        subjectiveFitScore: match.subjectiveFitScore,
        matchQuality:
          match.overallScore >= 90 ? 'excellent' as const :
          match.overallScore >= 80 ? 'great' as const :
          match.overallScore >= 70 ? 'good' as const :
          match.overallScore >= 55 ? 'moderate' as const : 'low' as const,
        explanationItems: match.explanationItems,
        topReasons: match.explanationItems
          .filter((item) => item.matched)
          .map((item) => item.labelHe)
          .slice(0, 4),
        insights: [],
      })),
    };
  }),
});
