/**
 * MatchMind Clinical Documentation Router
 *
 * tRPC endpoints for medical-grade session documentation.
 * Implements strict access control and audit logging.
 *
 * SECURITY CLASSIFICATION: CRITICAL - MEDICAL DATA
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  router,
  protectedProcedure,
  approvedTherapistProcedure,
  adminProcedure,
  patientProcedure,
} from '../trpc';
import type {
  SessionRecord,
  ClinicalNotes,
  SessionType,
  SessionStatus,
  DocumentationStatus,
  TherapeuticMethod,
  ProgressIndicator,
  RiskLevel,
  PatientSessionSummary,
  ComplianceFlag,
  ClinicalAuditAction,
} from '@/lib/clinical/types';
import {
  canAccessSession,
  canExportSession,
  canPatientViewSummary,
  toComplianceView,
  createAuditLogEntry,
  type AccessContext,
  type UserRole,
} from '@/lib/clinical/security/access-control';

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

const sessionTypeSchema = z.enum([
  'IN_PERSON',
  'REMOTE_VIDEO',
  'REMOTE_PHONE',
  'HOME_VISIT',
]);

const sessionStatusSchema = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

const therapeuticMethodSchema = z.enum([
  'CBT',
  'DBT',
  'PSYCHODYNAMIC',
  'HUMANISTIC',
  'EMDR',
  'MINDFULNESS',
  'FAMILY_THERAPY',
  'COUPLES_THERAPY',
  'PLAY_THERAPY',
  'ART_THERAPY',
  'NARRATIVE',
  'SOLUTION_FOCUSED',
  'INTEGRATIVE',
  'OTHER',
]);

const progressIndicatorSchema = z.enum([
  'SIGNIFICANT_IMPROVEMENT',
  'MODERATE_IMPROVEMENT',
  'SLIGHT_IMPROVEMENT',
  'NO_CHANGE',
  'SLIGHT_DECLINE',
  'MODERATE_DECLINE',
  'SIGNIFICANT_DECLINE',
  'UNABLE_TO_ASSESS',
]);

const riskLevelSchema = z.enum(['NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL']);

const safetyAssessmentSchema = z.object({
  suicidalIdeation: z.boolean(),
  suicidalPlan: z.boolean(),
  suicidalIntent: z.boolean(),
  homicidalIdeation: z.boolean(),
  selfHarmBehavior: z.boolean(),
  protectiveFactors: z.array(z.string()).optional(),
  riskFactors: z.array(z.string()).optional(),
  safetyPlan: z.string().optional(),
  emergencyContacts: z
    .array(
      z.object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string(),
        isAwareOfTreatment: z.boolean(),
      })
    )
    .optional(),
});

const mentalStatusExamSchema = z.object({
  appearance: z.string().optional(),
  behavior: z.string().optional(),
  speech: z.string().optional(),
  mood: z.string().optional(),
  affect: z.string().optional(),
  thoughtProcess: z.string().optional(),
  thoughtContent: z.string().optional(),
  perceptions: z.string().optional(),
  cognition: z.string().optional(),
  insight: z.string().optional(),
  judgment: z.string().optional(),
});

const assessmentSchema = z.object({
  mentalStatusExam: mentalStatusExamSchema.optional(),
  functionalAssessment: z
    .object({
      dailyFunctioning: z.string().optional(),
      socialFunctioning: z.string().optional(),
      occupationalFunctioning: z.string().optional(),
      selfCare: z.string().optional(),
    })
    .optional(),
  safetyAssessment: safetyAssessmentSchema.optional(),
  additionalNotes: z.string().optional(),
});

const homeworkTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

const referralSchema = z.object({
  type: z.string(),
  specialist: z.string().optional(),
  reason: z.string(),
  urgency: z.enum(['routine', 'soon', 'urgent']),
});

const followUpSchema = z.object({
  nextSessionDate: z.string().datetime().optional(),
  frequency: z.string().optional(),
  homeworkTasks: z.array(homeworkTaskSchema).optional(),
  referrals: z.array(referralSchema).optional(),
  additionalRecommendations: z.string().optional(),
});

const saveClinicalNotesSchema = z.object({
  sessionRecordId: z.string(),
  presentingIssue: z.string().optional(),
  clinicalSummary: z.string().optional(),
  assessment: assessmentSchema.optional(),
  interventions: z.string().optional(),
  patientResponse: z.string().optional(),
  followUp: followUpSchema.optional(),
  therapeuticMethods: z.array(therapeuticMethodSchema).optional(),
  progressIndicator: progressIndicatorSchema.optional(),
  riskLevel: riskLevelSchema.optional(),
  icdCodes: z.array(z.string()).optional(),
  dsmCodes: z.array(z.string()).optional(),
  homeworkAssigned: z.boolean().optional(),
  nextSessionFocus: z.string().optional(),
  recommendedInterval: z.number().int().positive().optional(),
});

const shareWithPatientSchema = z.object({
  sessionRecordId: z.string(),
  summaryHebrew: z.string().optional(),
  topicsDiscussed: z.array(z.string()).optional(),
  keyTakeaways: z.array(z.string()).optional(),
  homework: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.string().datetime().optional(),
      })
    )
    .optional(),
});

// =============================================================================
// MOCK DATA (Replace with Prisma in production)
// =============================================================================

const mockSessionRecords: SessionRecord[] = [];
const mockClinicalNotes: Map<string, ClinicalNotes> = new Map();
const mockPatientSummaries: Map<string, PatientSessionSummary> = new Map();
const mockComplianceFlags: Map<string, ComplianceFlag[]> = new Map();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createAccessContext(user: {
  id: string;
  role: string;
  therapistId?: string;
  patientId?: string;
}): AccessContext {
  return {
    userId: user.id,
    userRole: user.role.toLowerCase() as UserRole,
    therapistId: user.therapistId || (user.role === 'THERAPIST' ? user.id : undefined),
    patientId: user.patientId || (user.role === 'PATIENT' ? user.id : undefined),
  };
}

function generateSessionNumber(therapistId: string, patientId: string): number {
  const existing = mockSessionRecords.filter(
    (s) => s.therapistId === therapistId && s.patientId === patientId
  );
  return existing.length + 1;
}

function calculateDocumentationDeadline(sessionDate: Date): Date {
  // 48 hours after session for documentation
  return new Date(sessionDate.getTime() + 48 * 60 * 60 * 1000);
}

// =============================================================================
// CLINICAL DOCUMENTATION ROUTER
// =============================================================================

export const clinicalRouter = router({
  // ===========================================================================
  // SESSION RECORD MANAGEMENT (Therapist)
  // ===========================================================================

  /**
   * Create a new session record
   */
  createSessionRecord: approvedTherapistProcedure
    .input(
      z.object({
        patientId: z.string(),
        treatmentPlanId: z.string().optional(),
        sessionDate: z.string().datetime(),
        scheduledStartTime: z.string().datetime(),
        scheduledEndTime: z.string().datetime(),
        sessionType: sessionTypeSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const therapistId = ctx.user.id;
      const sessionDate = new Date(input.sessionDate);

      const newRecord: SessionRecord = {
        id: `session-record-${Date.now()}`,
        therapistId,
        patientId: input.patientId,
        treatmentPlanId: input.treatmentPlanId,
        sessionNumber: generateSessionNumber(therapistId, input.patientId),
        sessionDate,
        scheduledStartTime: new Date(input.scheduledStartTime),
        scheduledEndTime: new Date(input.scheduledEndTime),
        sessionType: input.sessionType as SessionType,
        sessionStatus: 'SCHEDULED',
        documentationStatus: 'DRAFT',
        currentVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        documentationDeadline: calculateDocumentationDeadline(sessionDate),
        isOverdue: false,
      };

      mockSessionRecords.push(newRecord);

      // Initialize empty clinical notes
      const emptyNotes: ClinicalNotes = {
        id: `notes-${newRecord.id}`,
        sessionRecordId: newRecord.id,
        therapeuticMethods: [],
        riskLevel: 'NONE',
        icdCodes: [],
        dsmCodes: [],
        homeworkAssigned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockClinicalNotes.set(newRecord.id, emptyNotes);

      return {
        success: true,
        sessionRecord: newRecord,
        messageHe: 'רשומת Session נוצרה בהצלחה',
      };
    }),

  /**
   * Get session record with clinical notes (Therapist only - own patients)
   */
  getSessionRecord: approvedTherapistProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const session = mockSessionRecords.find((s) => s.id === input.sessionId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session record not found',
        });
      }

      const accessContext = createAccessContext(ctx.user);
      const accessDecision = canAccessSession(accessContext, session, 'session:read');

      if (!accessDecision.allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: accessDecision.reasonHe,
        });
      }

      const clinicalNotes = mockClinicalNotes.get(session.id);
      const patientSummary = mockPatientSummaries.get(session.id);
      const flags = mockComplianceFlags.get(session.id) || [];

      return {
        ...session,
        clinicalNotes,
        patientSummary,
        complianceFlags: flags,
      };
    }),

  /**
   * List session records for a patient (Therapist only - own patients)
   */
  listPatientSessions: approvedTherapistProcedure
    .input(
      z.object({
        patientId: z.string(),
        status: z
          .enum(['DRAFT', 'SUBMITTED', 'AMENDED', 'LOCKED', 'ALL'])
          .optional()
          .default('ALL'),
        limit: z.number().int().positive().max(100).optional().default(20),
        offset: z.number().int().min(0).optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const therapistId = ctx.user.id;

      let sessions = mockSessionRecords.filter(
        (s) => s.therapistId === therapistId && s.patientId === input.patientId
      );

      if (input.status !== 'ALL') {
        sessions = sessions.filter((s) => s.documentationStatus === input.status);
      }

      // Sort by session date descending
      sessions.sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime());

      const total = sessions.length;
      const paginatedSessions = sessions.slice(input.offset, input.offset + input.limit);

      return {
        sessions: paginatedSessions,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * List all pending documentation (Therapist dashboard)
   */
  listPendingDocumentation: approvedTherapistProcedure.query(async ({ ctx }) => {
    const therapistId = ctx.user.id;
    const now = new Date();

    const pendingSessions = mockSessionRecords.filter(
      (s) =>
        s.therapistId === therapistId &&
        s.documentationStatus === 'DRAFT' &&
        s.sessionStatus === 'COMPLETED'
    );

    // Mark overdue sessions
    const sessionsWithOverdue = pendingSessions.map((s) => ({
      ...s,
      isOverdue: s.documentationDeadline < now,
    }));

    // Sort by deadline (oldest first)
    sessionsWithOverdue.sort(
      (a, b) => a.documentationDeadline.getTime() - b.documentationDeadline.getTime()
    );

    return {
      sessions: sessionsWithOverdue,
      overdueCount: sessionsWithOverdue.filter((s) => s.isOverdue).length,
      totalPending: sessionsWithOverdue.length,
    };
  }),

  // ===========================================================================
  // CLINICAL NOTES MANAGEMENT
  // ===========================================================================

  /**
   * Save clinical notes (auto-save during editing)
   */
  saveClinicalNotes: approvedTherapistProcedure
    .input(saveClinicalNotesSchema)
    .mutation(async ({ input, ctx }) => {
      const session = mockSessionRecords.find((s) => s.id === input.sessionRecordId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session record not found',
        });
      }

      const accessContext = createAccessContext(ctx.user);
      const accessDecision = canAccessSession(
        accessContext,
        session,
        'clinical_notes:write'
      );

      if (!accessDecision.allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: accessDecision.reasonHe,
        });
      }

      const existingNotes = mockClinicalNotes.get(session.id);

      const updatedNotes: ClinicalNotes = {
        id: existingNotes?.id || `notes-${session.id}`,
        sessionRecordId: session.id,
        presentingIssue: input.presentingIssue ?? existingNotes?.presentingIssue,
        clinicalSummary: input.clinicalSummary ?? existingNotes?.clinicalSummary,
        assessment: input.assessment ?? existingNotes?.assessment,
        interventions: input.interventions ?? existingNotes?.interventions,
        patientResponse: input.patientResponse ?? existingNotes?.patientResponse,
        followUp: input.followUp
          ? {
              ...input.followUp,
              nextSessionDate: input.followUp.nextSessionDate
                ? new Date(input.followUp.nextSessionDate)
                : undefined,
              homeworkTasks: input.followUp.homeworkTasks?.map((t) => ({
                ...t,
                dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
              })),
            }
          : existingNotes?.followUp,
        therapeuticMethods:
          (input.therapeuticMethods as TherapeuticMethod[]) ??
          existingNotes?.therapeuticMethods ??
          [],
        progressIndicator:
          (input.progressIndicator as ProgressIndicator) ??
          existingNotes?.progressIndicator,
        riskLevel: (input.riskLevel as RiskLevel) ?? existingNotes?.riskLevel ?? 'NONE',
        riskAssessmentDate: input.riskLevel ? new Date() : existingNotes?.riskAssessmentDate,
        icdCodes: input.icdCodes ?? existingNotes?.icdCodes ?? [],
        dsmCodes: input.dsmCodes ?? existingNotes?.dsmCodes ?? [],
        homeworkAssigned: input.homeworkAssigned ?? existingNotes?.homeworkAssigned ?? false,
        nextSessionFocus: input.nextSessionFocus ?? existingNotes?.nextSessionFocus,
        recommendedInterval:
          input.recommendedInterval ?? existingNotes?.recommendedInterval,
        createdAt: existingNotes?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };

      mockClinicalNotes.set(session.id, updatedNotes);
      session.updatedAt = new Date();

      return {
        success: true,
        savedAt: new Date(),
        messageHe: 'Clinical notes נשמרו',
      };
    }),

  /**
   * Submit session documentation (lock from regular editing)
   */
  submitSession: approvedTherapistProcedure
    .input(
      z.object({
        sessionRecordId: z.string(),
        finalReview: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.finalReview) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Required לApprove סקירה סופית לפני הגשה',
        });
      }

      const session = mockSessionRecords.find((s) => s.id === input.sessionRecordId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session record not found',
        });
      }

      const accessContext = createAccessContext(ctx.user);
      const accessDecision = canAccessSession(accessContext, session, 'session:submit');

      if (!accessDecision.allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: accessDecision.reasonHe,
        });
      }

      // Validate required fields before submission
      const notes = mockClinicalNotes.get(session.id);
      const validationErrors: string[] = [];

      if (!notes?.clinicalSummary) {
        validationErrors.push('Clinical Summary Required');
      }
      if (!notes?.riskLevel) {
        validationErrors.push('Assessment סיכון Requiredת');
      }

      if (validationErrors.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: validationErrors.join(', '),
        });
      }

      session.documentationStatus = 'SUBMITTED';
      session.submittedAt = new Date();
      session.updatedAt = new Date();
      session.currentVersion += 1;

      return {
        success: true,
        submittedAt: session.submittedAt,
        messageHe: 'הDocumentation הוגש בהצלחה',
      };
    }),

  /**
   * Amend submitted session (with required reason)
   */
  amendSession: approvedTherapistProcedure
    .input(
      z.object({
        sessionRecordId: z.string(),
        amendmentReason: z.string().min(10, 'סיבת התיקון חייבת להכיל at least 10 characters'),
        changes: saveClinicalNotesSchema.omit({ sessionRecordId: true }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const session = mockSessionRecords.find((s) => s.id === input.sessionRecordId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session record not found',
        });
      }

      const accessContext = createAccessContext(ctx.user);
      const accessDecision = canAccessSession(accessContext, session, 'session:amend');

      if (!accessDecision.allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: accessDecision.reasonHe,
        });
      }

      // Store previous version (in production, save to SessionRecordVersion table)
      const previousNotes = mockClinicalNotes.get(session.id);

      // Apply changes - properly handle type conversions
      const changes = input.changes;
      const updatedNotes: ClinicalNotes = {
        id: previousNotes?.id || `notes-${session.id}`,
        sessionRecordId: session.id,
        presentingIssue: changes.presentingIssue ?? previousNotes?.presentingIssue,
        clinicalSummary: changes.clinicalSummary ?? previousNotes?.clinicalSummary,
        assessment: changes.assessment ?? previousNotes?.assessment,
        interventions: changes.interventions ?? previousNotes?.interventions,
        patientResponse: changes.patientResponse ?? previousNotes?.patientResponse,
        followUp: changes.followUp
          ? {
              ...changes.followUp,
              nextSessionDate: changes.followUp.nextSessionDate
                ? new Date(changes.followUp.nextSessionDate)
                : undefined,
              homeworkTasks: changes.followUp.homeworkTasks?.map((t) => ({
                ...t,
                dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
              })),
            }
          : previousNotes?.followUp,
        therapeuticMethods:
          (changes.therapeuticMethods as TherapeuticMethod[]) ??
          previousNotes?.therapeuticMethods ??
          [],
        progressIndicator:
          (changes.progressIndicator as ProgressIndicator) ??
          previousNotes?.progressIndicator,
        riskLevel:
          (changes.riskLevel as RiskLevel) ?? previousNotes?.riskLevel ?? 'NONE',
        riskAssessmentDate: changes.riskLevel ? new Date() : previousNotes?.riskAssessmentDate,
        icdCodes: changes.icdCodes ?? previousNotes?.icdCodes ?? [],
        dsmCodes: changes.dsmCodes ?? previousNotes?.dsmCodes ?? [],
        homeworkAssigned: changes.homeworkAssigned ?? previousNotes?.homeworkAssigned ?? false,
        nextSessionFocus: changes.nextSessionFocus ?? previousNotes?.nextSessionFocus,
        recommendedInterval: changes.recommendedInterval ?? previousNotes?.recommendedInterval,
        createdAt: previousNotes?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };

      mockClinicalNotes.set(session.id, updatedNotes);
      session.documentationStatus = 'AMENDED';
      session.updatedAt = new Date();
      session.currentVersion += 1;

      // Audit log would include amendmentReason
      console.log(`Amendment reason: ${input.amendmentReason}`);

      return {
        success: true,
        version: session.currentVersion,
        messageHe: 'הDocumentation Fixed בהצלחה',
      };
    }),

  /**
   * Lock session permanently (final state)
   */
  lockSession: approvedTherapistProcedure
    .input(z.object({ sessionRecordId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = mockSessionRecords.find((s) => s.id === input.sessionRecordId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session record not found',
        });
      }

      const accessContext = createAccessContext(ctx.user);
      const accessDecision = canAccessSession(accessContext, session, 'session:lock');

      if (!accessDecision.allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: accessDecision.reasonHe,
        });
      }

      session.documentationStatus = 'LOCKED';
      session.lockedAt = new Date();
      session.lockedBy = ctx.user.id;
      session.updatedAt = new Date();

      return {
        success: true,
        lockedAt: session.lockedAt,
        messageHe: 'הDocumentation ננעל לצמיתs',
      };
    }),

  // ===========================================================================
  // PATIENT SUMMARY (Sharing with patients)
  // ===========================================================================

  /**
   * Create/update patient-visible summary
   */
  shareWithPatient: approvedTherapistProcedure
    .input(shareWithPatientSchema)
    .mutation(async ({ input, ctx }) => {
      const session = mockSessionRecords.find((s) => s.id === input.sessionRecordId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session record not found',
        });
      }

      const accessContext = createAccessContext(ctx.user);
      const accessDecision = canAccessSession(
        accessContext,
        session,
        'patient_summary:share'
      );

      if (!accessDecision.allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: accessDecision.reasonHe,
        });
      }

      const existingSummary = mockPatientSummaries.get(session.id);

      const summary: PatientSessionSummary = {
        id: existingSummary?.id || `summary-${session.id}`,
        sessionRecordId: session.id,
        summaryHebrew: input.summaryHebrew ?? existingSummary?.summaryHebrew,
        topicsDiscussed: input.topicsDiscussed ?? existingSummary?.topicsDiscussed ?? [],
        keyTakeaways: input.keyTakeaways ?? existingSummary?.keyTakeaways ?? [],
        homework:
          input.homework?.map((h, i) => ({
            id: `hw-${session.id}-${i}`,
            ...h,
            dueDate: h.dueDate ? new Date(h.dueDate) : undefined,
            isCompleted: false,
          })) ??
          existingSummary?.homework ??
          [],
        isVisibleToPatient: true,
        sharedAt: new Date(),
        sharedByTherapist: true,
        createdAt: existingSummary?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };

      mockPatientSummaries.set(session.id, summary);

      return {
        success: true,
        sharedAt: summary.sharedAt,
        messageHe: 'הSummary שsף With הPatient',
      };
    }),

  /**
   * Get patient-visible summary (Patient access)
   */
  getPatientSummary: patientProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const session = mockSessionRecords.find((s) => s.id === input.sessionId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session record not found',
        });
      }

      const accessContext = createAccessContext(ctx.user);
      const summary = mockPatientSummaries.get(session.id);
      const accessDecision = canPatientViewSummary(accessContext, session, summary);

      if (!accessDecision.allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: accessDecision.reasonHe,
        });
      }

      return {
        sessionDate: session.sessionDate,
        sessionNumber: session.sessionNumber,
        summary,
      };
    }),

  /**
   * List patient's session summaries (Patient dashboard)
   */
  listPatientSummaries: patientProcedure.query(async ({ ctx }) => {
    const patientId = ctx.user.id;

    const patientSessions = mockSessionRecords.filter(
      (s) => s.patientId === patientId
    );

    const summaries = patientSessions
      .map((session) => {
        const summary = mockPatientSummaries.get(session.id);
        if (!summary?.isVisibleToPatient) return null;

        return {
          sessionId: session.id,
          sessionDate: session.sessionDate,
          sessionNumber: session.sessionNumber,
          summary,
        };
      })
      .filter(Boolean);

    return { summaries };
  }),

  // ===========================================================================
  // COMPLIANCE DASHBOARD (Admin)
  // ===========================================================================

  /**
   * Get compliance overview (Admin only - no clinical content)
   */
  getComplianceOverview: adminProcedure.query(async () => {
    const now = new Date();

    // Group by therapist
    const therapistStats = new Map<
      string,
      {
        total: number;
        submitted: number;
        overdue: number;
        draft: number;
      }
    >();

    mockSessionRecords.forEach((session) => {
      const existing = therapistStats.get(session.therapistId) || {
        total: 0,
        submitted: 0,
        overdue: 0,
        draft: 0,
      };

      existing.total += 1;

      if (
        session.documentationStatus === 'SUBMITTED' ||
        session.documentationStatus === 'LOCKED'
      ) {
        existing.submitted += 1;
      }

      if (
        session.documentationStatus === 'DRAFT' &&
        session.documentationDeadline < now
      ) {
        existing.overdue += 1;
      }

      if (session.documentationStatus === 'DRAFT') {
        existing.draft += 1;
      }

      therapistStats.set(session.therapistId, existing);
    });

    const therapistComplianceList = Array.from(therapistStats.entries()).map(
      ([therapistId, stats]) => ({
        therapistId,
        therapistName: `Therapist ${therapistId.slice(-4)}`, // Placeholder
        ...stats,
        complianceRate:
          stats.total > 0
            ? Math.round((stats.submitted / stats.total) * 100)
            : 100,
      })
    );

    const overallStats = {
      totalSessions: mockSessionRecords.length,
      submittedCount: mockSessionRecords.filter(
        (s) => s.documentationStatus === 'SUBMITTED' || s.documentationStatus === 'LOCKED'
      ).length,
      overdueCount: mockSessionRecords.filter(
        (s) => s.documentationStatus === 'DRAFT' && s.documentationDeadline < now
      ).length,
      draftCount: mockSessionRecords.filter((s) => s.documentationStatus === 'DRAFT')
        .length,
    };

    return {
      overall: {
        ...overallStats,
        complianceRate:
          overallStats.totalSessions > 0
            ? Math.round(
                (overallStats.submittedCount / overallStats.totalSessions) * 100
              )
            : 100,
      },
      byTherapist: therapistComplianceList,
    };
  }),

  /**
   * Get compliance details for a therapist (Admin - no clinical content)
   */
  getTherapistCompliance: adminProcedure
    .input(
      z.object({
        therapistId: z.string(),
        period: z
          .object({
            start: z.string().datetime(),
            end: z.string().datetime(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const now = new Date();
      let sessions = mockSessionRecords.filter(
        (s) => s.therapistId === input.therapistId
      );

      if (input.period) {
        const start = new Date(input.period.start);
        const end = new Date(input.period.end);
        sessions = sessions.filter(
          (s) => s.sessionDate >= start && s.sessionDate <= end
        );
      }

      // Convert to compliance view (strips clinical content)
      const complianceSessions = sessions.map((session) => {
        const flags = mockComplianceFlags.get(session.id) || [];
        return toComplianceView(
          session,
          `Therapist ${session.therapistId.slice(-4)}`,
          flags.map((f) => f.flagType)
        );
      });

      const stats = {
        totalSessions: sessions.length,
        documentedOnTime: sessions.filter(
          (s) =>
            (s.documentationStatus === 'SUBMITTED' ||
              s.documentationStatus === 'LOCKED') &&
            s.submittedAt &&
            s.submittedAt <= s.documentationDeadline
        ).length,
        overdueCount: sessions.filter(
          (s) => s.documentationStatus === 'DRAFT' && s.documentationDeadline < now
        ).length,
        draftCount: sessions.filter((s) => s.documentationStatus === 'DRAFT').length,
        incompleteCount: sessions.filter((s) => {
          const flags = mockComplianceFlags.get(s.id) || [];
          return flags.some((f) => f.flagType === 'INCOMPLETE');
        }).length,
      };

      return {
        therapistId: input.therapistId,
        therapistName: `Therapist ${input.therapistId.slice(-4)}`,
        stats: {
          ...stats,
          complianceRate:
            stats.totalSessions > 0
              ? Math.round(
                  ((stats.documentedOnTime +
                    (stats.totalSessions - stats.draftCount - stats.overdueCount)) /
                    stats.totalSessions) * 100
                )
              : 100,
          averageDocumentationTime: 0, // Would calculate from actual data
        },
        sessions: complianceSessions,
      };
    }),

  // ===========================================================================
  // EXPORT (Therapist)
  // ===========================================================================

  /**
   * Export session as JSON
   */
  exportSessionJson: approvedTherapistProcedure
    .input(
      z.object({
        sessionRecordId: z.string(),
        purpose: z.string(),
        includePatientSummary: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const session = mockSessionRecords.find((s) => s.id === input.sessionRecordId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session record not found',
        });
      }

      const accessDecision = canExportSession(
        createAccessContext(ctx.user),
        session,
        'JSON'
      );

      if (!accessDecision.allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: accessDecision.reasonHe,
        });
      }

      const notes = mockClinicalNotes.get(session.id);
      const summary = input.includePatientSummary
        ? mockPatientSummaries.get(session.id)
        : undefined;

      const exportData = {
        exportedAt: new Date().toISOString(),
        exportedBy: ctx.user.id,
        purpose: input.purpose,
        session: {
          ...session,
          sessionDate: session.sessionDate.toISOString(),
          scheduledStartTime: session.scheduledStartTime.toISOString(),
          scheduledEndTime: session.scheduledEndTime.toISOString(),
        },
        clinicalNotes: notes,
        patientSummary: summary,
      };

      // In production, would also:
      // 1. Create SessionExport record
      // 2. Generate file hash
      // 3. Store in S3
      // 4. Set expiration

      return {
        format: 'JSON',
        content: JSON.stringify(exportData, null, 2),
        exportedAt: new Date(),
        messageHe: 'הSession יוצאה בהצלחה',
      };
    }),
});
