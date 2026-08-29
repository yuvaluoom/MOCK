import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, patientProcedure, adminProcedure } from '../trpc';
import { mockQuestionnaireQuestions, mockPatient, mockXFactorProfile } from '../mock-data';
import { notifyMatchUpdated, notifyNewMatch } from '@/lib/notifications/service';

// In-memory answer store: Record<questionId, value>
const mockAnswers: Record<string, any> = {};
let mockResponseStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
let mockResponseId = 'response-1';
let mockResponseStartedAt: Date | null = null;
let mockLastSavedAt: Date | null = null;

// In-memory questionnaire versions store
const mockVersions = [
  {
    id: 'version-1',
    name: 'X-Factor Questionnaire v1',
    nameHebrew: 'X-Factor Questionnaire v1',
    introText: 'This questionnaire helps us find the best therapist match for you.',
    description: 'Initial version of the X-Factor matching questionnaire',
    descriptionHebrew: 'Initial version of the matching questionnaire',
    version: 1,
    isActive: true,
    publishedAt: new Date('2024-01-01') as Date | null,
    createdAt: new Date('2024-01-01'),
  },
];

export const questionnaireRouter = router({
  /**
   * Get active questionnaire for patient
   */
  getActiveQuestionnaire: patientProcedure.query(async () => {
    const activeVersion = mockVersions.find((v) => v.isActive);

    if (!activeVersion) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active questionnaire found',
      });
    }

    // Group questions by section
    const sections: Record<string, any[]> = {};
    for (const question of mockQuestionnaireQuestions) {
      if (!sections[question.sectionId]) {
        sections[question.sectionId] = [];
      }
      sections[question.sectionId].push({
        ...question,
        existingAnswer: mockAnswers[question.id] ?? undefined,
      });
    }

    return {
      id: activeVersion.id,
      name: activeVersion.name,
      nameHebrew: activeVersion.nameHebrew,
      introText: activeVersion.introText,
      sections: Object.entries(sections).map(([sectionId, questions]) => ({
        id: sectionId,
        name: questions[0].sectionName,
        nameHe: questions[0].sectionNameHe,
        questions,
      })),
      response:
        mockResponseStatus !== 'not_started'
          ? {
              id: mockResponseId,
              status: mockResponseStatus,
              startedAt: mockResponseStartedAt,
              lastSavedAt: mockLastSavedAt,
            }
          : null,
    };
  }),

  /**
   * Save single answer (auto-save)
   */
  saveAnswer: patientProcedure
    .input(
      z.object({
        questionId: z.string(),
        value: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      // Start response if not started
      if (mockResponseStatus === 'not_started') {
        mockResponseStatus = 'in_progress';
        mockResponseStartedAt = new Date();
      }

      mockAnswers[input.questionId] = input.value;
      mockLastSavedAt = new Date();

      return { success: true };
    }),

  /**
   * Submit completed questionnaire
   */
  submitQuestionnaire: patientProcedure.mutation(async () => {
    if (mockResponseStatus === 'not_started') {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No questionnaire response found',
      });
    }

    // Mark as completed
    mockResponseStatus = 'completed';
    mockPatient.questionnaireCompleted = true;

    // Notify patient about new matches
    notifyNewMatch(mockPatient.id, 'Dr. Rachel Cohen', 92);
    notifyNewMatch(mockPatient.id, 'Dr. David Levi', 87);
    notifyNewMatch(mockPatient.id, 'Dr. Sarah Mizrahi', 84);
    notifyMatchUpdated(mockPatient.id);

    return { success: true };
  }),

  /**
   * Get questionnaire progress
   */
  getProgress: patientProcedure.query(async () => {
    const totalQuestions = mockQuestionnaireQuestions.length;
    const answeredQuestions = Object.keys(mockAnswers).length;

    return {
      totalQuestions,
      answeredQuestions,
      progress: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
      status: mockResponseStatus,
    };
  }),

  // ==================== ADMIN PROCEDURES ====================

  /**
   * Get all questionnaire versions (admin)
   */
  getVersions: adminProcedure.query(async () => {
    return mockVersions.map((v) => ({
      ...v,
      _count: {
        questions: mockQuestionnaireQuestions.length,
        responses: mockResponseStatus !== 'not_started' ? 1 : 0,
      },
    }));
  }),

  /**
   * Create new questionnaire version (admin)
   */
  createVersion: adminProcedure
    .input(
      z.object({
        name: z.string(),
        nameHebrew: z.string(),
        description: z.string().optional(),
        descriptionHebrew: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const newVersion = {
        id: `version-${Date.now()}`,
        name: input.name,
        nameHebrew: input.nameHebrew,
        introText: input.description ?? '',
        description: input.description ?? '',
        descriptionHebrew: input.descriptionHebrew ?? '',
        version: mockVersions.length + 1,
        isActive: false,
        publishedAt: null as Date | null,
        createdAt: new Date(),
      };

      mockVersions.push(newVersion);
      return newVersion;
    }),

  /**
   * Add question to version (admin)
   */
  addQuestion: adminProcedure
    .input(
      z.object({
        versionId: z.string(),
        sectionId: z.string(),
        sectionName: z.string(),
        sectionNameHe: z.string(),
        questionText: z.string(),
        questionTextHe: z.string(),
        helpText: z.string().optional(),
        helpTextHe: z.string().optional(),
        questionType: z.enum(['SCALE', 'MULTIPLE_CHOICE', 'MULTI_SELECT', 'TEXT', 'RANKING', 'YES_NO']),
        options: z.any().optional(),
        dimension: z.string(),
        scoringWeight: z.number().default(1.0),
        isRequired: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const order = mockQuestionnaireQuestions.length + 1;

      const question = {
        id: `q-${Date.now()}`,
        ...input,
        helpText: input.helpText ?? null,
        helpTextHe: input.helpTextHe ?? null,
        options: input.options ?? null,
        order,
      };

      mockQuestionnaireQuestions.push(question as any);
      return question;
    }),

  /**
   * Activate questionnaire version (admin)
   */
  activateVersion: adminProcedure
    .input(z.object({ versionId: z.string() }))
    .mutation(async ({ input }) => {
      // Deactivate all versions first
      for (const v of mockVersions) {
        v.isActive = false;
      }

      // Activate the selected version
      const version = mockVersions.find((v) => v.id === input.versionId);

      if (!version) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Version not found',
        });
      }

      version.isActive = true;
      version.publishedAt = new Date();

      return version;
    }),
});
