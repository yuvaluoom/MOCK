import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, patientProcedure, approvedTherapistProcedure } from '../trpc';
import {
  mockSessions,
  mockPatient,
  mockTherapists,
  getTherapistById,
  type MockSession,
} from '../mock-data';
import {
  sendSessionRequested,
  sendSessionApproved,
  sendSessionRejected,
  sendSessionCancelled,
} from '@/lib/email';

const requestSessionSchema = z.object({
  therapistId: z.string(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().positive().default(50),
  type: z.enum(['INITIAL_CONSULTATION', 'REGULAR', 'EMERGENCY']).default('REGULAR'),
  isOnline: z.boolean().default(true),
  healthFund: z.enum(['CLALIT', 'MACCABI', 'MEUHEDET', 'LEUMIT', 'PRIVATE']).optional(),
});

export const sessionRouter = router({
  /**
   * Request a session (patient)
   */
  requestSession: patientProcedure
    .input(requestSessionSchema)
    .mutation(async ({ input }) => {
      // Verify therapist exists and is approved
      const therapist = getTherapistById(input.therapistId);

      if (!therapist || therapist.approvalStatus !== 'APPROVED') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Therapist not found or not available',
        });
      }

      if (!therapist.isAcceptingPatients) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Therapist is not accepting new patients',
        });
      }

      // Create new mock session
      const newSession: MockSession = {
        id: `session-${Date.now()}`,
        patientId: mockPatient.id,
        therapistId: input.therapistId,
        scheduledAt: new Date(input.scheduledAt),
        duration: input.duration,
        type: input.type,
        isOnline: input.isOnline,
        status: 'PENDING_THERAPIST_APPROVAL',
        meetingUrl: null,
        price: input.healthFund && input.healthFund !== 'PRIVATE' ? 0 : therapist.sessionPrice,
        healthFund: input.healthFund ?? null,
        therapistNotes: null,
        createdAt: new Date(),
      };

      mockSessions.push(newSession);

      // Send email notification to therapist
      await sendSessionRequested(
        therapist.email,
        therapist.firstName,
        `${mockPatient.firstName} ${mockPatient.lastName}`,
        `${therapist.firstName} ${therapist.lastName}`,
        new Date(input.scheduledAt),
        input.isOnline
      );

      return {
        ...newSession,
        therapist: {
          firstName: therapist.firstName,
          lastName: therapist.lastName,
        },
      };
    }),

  /**
   * Approve session (therapist)
   */
  approveSession: approvedTherapistProcedure
    .input(
      z.object({
        sessionId: z.string(),
        meetingUrl: z.string().url().optional(),
        meetingLocation: z.string().optional(),
        responseNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = mockSessions.find(
        (s) => s.id === input.sessionId && s.status === 'PENDING_THERAPIST_APPROVAL'
      );

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found or cannot be approved',
        });
      }

      session.status = 'APPROVED';
      session.meetingUrl = input.meetingUrl ?? null;

      // Get therapist info for email
      const therapist = getTherapistById(session.therapistId);

      // Send email notification to patient
      await sendSessionApproved(
        mockPatient.email,
        mockPatient.firstName,
        therapist ? `${therapist.firstName} ${therapist.lastName}` : 'Your therapist',
        session.scheduledAt,
        session.isOnline,
        input.meetingUrl,
        input.meetingLocation
      );

      return {
        ...session,
        respondedAt: new Date(),
        responseNote: input.responseNote ?? null,
        meetingLocation: input.meetingLocation ?? null,
        patient: {
          firstName: mockPatient.firstName,
          lastName: mockPatient.lastName,
        },
      };
    }),

  /**
   * Reject session (therapist)
   */
  rejectSession: approvedTherapistProcedure
    .input(
      z.object({
        sessionId: z.string(),
        responseNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = mockSessions.find(
        (s) => s.id === input.sessionId && s.status === 'PENDING_THERAPIST_APPROVAL'
      );

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found or cannot be rejected',
        });
      }

      session.status = 'REJECTED';

      // Get therapist info for email
      const therapist = getTherapistById(session.therapistId);

      // Send email notification to patient
      await sendSessionRejected(
        mockPatient.email,
        mockPatient.firstName,
        therapist ? `${therapist.firstName} ${therapist.lastName}` : 'Your therapist',
        input.responseNote
      );

      return {
        ...session,
        respondedAt: new Date(),
        responseNote: input.responseNote ?? null,
      };
    }),

  /**
   * Cancel session (patient)
   */
  cancelSessionAsPatient: patientProcedure
    .input(
      z.object({
        sessionId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = mockSessions.find(
        (s) =>
          s.id === input.sessionId &&
          s.patientId === mockPatient.id &&
          (s.status === 'PENDING_THERAPIST_APPROVAL' || s.status === 'APPROVED')
      );

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found or cannot be cancelled',
        });
      }

      session.status = 'CANCELLED_BY_PATIENT';

      // Get therapist info for email
      const therapist = getTherapistById(session.therapistId);

      // Send email notification to therapist
      if (therapist) {
        await sendSessionCancelled(
          therapist.email,
          therapist.firstName,
          `${mockPatient.firstName} ${mockPatient.lastName}`,
          session.scheduledAt,
          'patient'
        );
      }

      return {
        ...session,
        cancelledAt: new Date(),
        cancellationReason: input.reason ?? null,
      };
    }),

  /**
   * Cancel session (therapist)
   */
  cancelSessionAsTherapist: approvedTherapistProcedure
    .input(
      z.object({
        sessionId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = mockSessions.find(
        (s) =>
          s.id === input.sessionId &&
          (s.status === 'PENDING_THERAPIST_APPROVAL' || s.status === 'APPROVED')
      );

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found or cannot be cancelled',
        });
      }

      session.status = 'CANCELLED_BY_THERAPIST';

      // Get therapist info for email
      const therapist = getTherapistById(session.therapistId);

      // Send email notification to patient
      await sendSessionCancelled(
        mockPatient.email,
        mockPatient.firstName,
        therapist ? `${therapist.firstName} ${therapist.lastName}` : 'Your therapist',
        session.scheduledAt,
        'therapist'
      );

      return {
        ...session,
        cancelledAt: new Date(),
        cancellationReason: input.reason ?? null,
      };
    }),

  /**
   * Mark session as completed (therapist)
   */
  completeSession: approvedTherapistProcedure
    .input(
      z.object({
        sessionId: z.string(),
        therapistNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = mockSessions.find(
        (s) => s.id === input.sessionId && s.status === 'APPROVED'
      );

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found or cannot be completed',
        });
      }

      session.status = 'COMPLETED';
      session.therapistNotes = input.therapistNotes ?? null;

      return {
        ...session,
        completedAt: new Date(),
      };
    }),

  /**
   * Update session notes (therapist - private)
   */
  updateSessionNotes: approvedTherapistProcedure
    .input(
      z.object({
        sessionId: z.string(),
        therapistNotes: z.string(),
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

      session.therapistNotes = input.therapistNotes;

      return { ...session };
    }),
});
