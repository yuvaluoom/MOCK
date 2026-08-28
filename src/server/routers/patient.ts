import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, patientProcedure } from '../trpc';
import {
  mockPatient,
  mockXFactorProfile,
  mockMatches,
  mockSessions,
  getMatchWithTherapist,
  getSessionWithDetails,
} from '../mock-data';
import { mockDb } from '@/lib/database/mock-db';
import { calculateDetailedMatch, getMatchQualityLabel, type DetailedMatchResult } from '@/lib/matching';

// Helper function to get therapist by ID from unified DB - only returns approved therapists for patient-facing queries
function getTherapistById(id: string) {
  const therapist = mockDb.getTherapistById(id);
  // For patient-facing routes, only return if approved and accepting patients
  if (!therapist || therapist.approvalStatus !== 'APPROVED') {
    return undefined;
  }
  return therapist;
}

// Get all approved therapists for matching
function getApprovedTherapists() {
  return mockDb.getApprovedTherapistsForMatching();
}

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  city: z.string().optional(),
  healthFund: z.enum(['CLALIT', 'MACCABI', 'MEUHEDET', 'LEUMIT', 'PRIVATE']).optional(),
  healthFundMemberId: z.string().optional(),
  preferredOnline: z.boolean().optional(),
});

const updatePreferencesSchema = z.object({
  preferredGender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).nullish(),
  preferredLanguages: z.array(z.string()).optional(),
  preferredApproaches: z.array(z.string()).optional(),
  preferredDays: z.array(z.string()).optional(),
  preferredTimeStart: z.string().optional(),
  preferredTimeEnd: z.string().optional(),
});

export const patientRouter = router({
  /**
   * Get patient profile
   */
  getProfile: patientProcedure.query(async () => {
    return {
      ...mockPatient,
      xFactorProfile: mockXFactorProfile,
    };
  }),

  /**
   * Update patient profile
   */
  updateProfile: patientProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input }) => {
      // Apply updates to mock patient in memory
      Object.assign(mockPatient, input);
      return {
        ...mockPatient,
        xFactorProfile: mockXFactorProfile,
      };
    }),

  /**
   * Update matching preferences
   */
  updatePreferences: patientProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ input }) => {
      // Apply preference updates to mock patient in memory
      if (input.preferredGender !== undefined) mockPatient.preferredGender = input.preferredGender ?? null;
      if (input.preferredLanguages) mockPatient.preferredLanguages = input.preferredLanguages;
      if (input.preferredApproaches) mockPatient.preferredApproaches = input.preferredApproaches;
      if (input.preferredDays) mockPatient.preferredDays = input.preferredDays;

      return mockPatient;
    }),

  /**
   * Get patient's matches with advanced filtering
   */
  getMatches: patientProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
        sortBy: z.enum(['overallScore', 'xFactorScore', 'createdAt']).default('overallScore'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        showHidden: z.boolean().default(false),
        // Filters
        sessionType: z.enum(['all', 'online', 'inPerson']).default('all'),
        healthFundMatch: z.boolean().optional(),
        minScore: z.number().min(0).max(100).optional(),
        specializations: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      // Get all eligible therapists from unified database (only approved + accepting patients)
      const eligibleTherapists = getApprovedTherapists();

      // Compute detailed matches for each therapist
      const computedMatches = eligibleTherapists.map((therapist) => {
        const detailedMatch = calculateDetailedMatch(
          mockPatient,
          mockXFactorProfile,
          therapist
        );

        return {
          id: `match-${therapist.id}`,
          patientId: mockPatient.id,
          therapistId: therapist.id,
          overallScore: detailedMatch.overallScore,
          matchQuality: detailedMatch.matchQuality,
          matchQualityLabel: getMatchQualityLabel(detailedMatch.matchQuality),
          xFactorScore: detailedMatch.factors.find(f => f.key === 'xFactor')?.score ?? 0,
          healthFundScore: detailedMatch.factors.find(f => f.key === 'healthFund')?.score ?? 0,
          availabilityScore: detailedMatch.factors.find(f => f.key === 'availability')?.score ?? 0,
          preferenceScore: detailedMatch.factors.find(f => f.key === 'preferences')?.score ?? 0,
          factors: detailedMatch.factors,
          topReasons: detailedMatch.topReasons,
          warnings: detailedMatch.warnings,
          insights: detailedMatch.insights,
          isViewed: mockMatches.find(m => m.therapistId === therapist.id)?.isViewed ?? false,
          isFavorited: mockMatches.find(m => m.therapistId === therapist.id)?.isFavorited ?? false,
          isHidden: mockMatches.find(m => m.therapistId === therapist.id)?.isHidden ?? false,
          createdAt: new Date(),
          therapist: {
            id: therapist.id,
            firstName: therapist.firstName,
            lastName: therapist.lastName,
            title: therapist.title,
            photoUrl: therapist.photoUrl,
            photoThumbnailUrl: therapist.photoThumbnailUrl,
            city: therapist.city,
            offersOnline: therapist.offersOnline,
            offersInPerson: therapist.offersInPerson,
            approaches: therapist.approaches,
            specializations: therapist.specializations,
            acceptedHealthFunds: therapist.acceptedHealthFunds,
            sessionPrice: therapist.sessionPrice,
            sessionDuration: therapist.sessionDuration,
            bio: therapist.bio,
            bioHebrew: therapist.bioHebrew,
            yearsOfExperience: therapist.yearsOfExperience,
            languages: therapist.languages,
            gender: therapist.gender,
          },
        };
      });

      // Apply filters
      let filtered = input.showHidden
        ? computedMatches
        : computedMatches.filter((m) => !m.isHidden);

      // Session type filter
      if (input.sessionType === 'online') {
        filtered = filtered.filter((m) => m.therapist.offersOnline);
      } else if (input.sessionType === 'inPerson') {
        filtered = filtered.filter((m) => m.therapist.offersInPerson);
      }

      // Health fund match filter
      if (input.healthFundMatch) {
        filtered = filtered.filter((m) =>
          m.therapist.acceptedHealthFunds.includes(mockPatient.healthFund)
        );
      }

      // Minimum score filter
      if (input.minScore !== undefined) {
        filtered = filtered.filter((m) => m.overallScore >= input.minScore!);
      }

      // Specializations filter
      if (input.specializations && input.specializations.length > 0) {
        filtered = filtered.filter((m) =>
          input.specializations!.some((s) => m.therapist.specializations.includes(s))
        );
      }

      // Sort
      filtered.sort((a, b) => {
        let aVal: number, bVal: number;
        if (input.sortBy === 'overallScore') {
          aVal = a.overallScore;
          bVal = b.overallScore;
        } else if (input.sortBy === 'xFactorScore') {
          aVal = a.xFactorScore;
          bVal = b.xFactorScore;
        } else {
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
        }
        if (input.sortOrder === 'desc') return bVal - aVal;
        return aVal - bVal;
      });

      const total = filtered.length;
      const skip = (input.page - 1) * input.limit;
      const paged = filtered.slice(skip, skip + input.limit);

      return {
        matches: paged,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
          hasMore: skip + paged.length < total,
        },
        filterStats: {
          totalTherapists: eligibleTherapists.length,
          onlineAvailable: eligibleTherapists.filter(t => t.offersOnline).length,
          inPersonAvailable: eligibleTherapists.filter(t => t.offersInPerson).length,
          healthFundMatches: eligibleTherapists.filter(t =>
            t.acceptedHealthFunds.includes(mockPatient.healthFund)
          ).length,
        },
      };
    }),

  /**
   * Get therapist details with match data (for dedicated therapist page)
   */
  getTherapistDetails: patientProcedure
    .input(z.object({ therapistId: z.string() }))
    .query(async ({ input }) => {
      const therapist = getTherapistById(input.therapistId);

      if (!therapist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Therapist not found',
        });
      }

      // Calculate detailed match
      const detailedMatch = calculateDetailedMatch(
        mockPatient,
        mockXFactorProfile,
        therapist
      );

      return {
        therapist: {
          id: therapist.id,
          firstName: therapist.firstName,
          lastName: therapist.lastName,
          title: therapist.title,
          photoUrl: therapist.photoUrl,
          photoThumbnailUrl: therapist.photoThumbnailUrl,
          bio: therapist.bio,
          bioHebrew: therapist.bioHebrew,
          city: therapist.city,
          address: therapist.address,
          offersOnline: therapist.offersOnline,
          offersInPerson: therapist.offersInPerson,
          approaches: therapist.approaches,
          specializations: therapist.specializations,
          acceptedHealthFunds: therapist.acceptedHealthFunds,
          sessionPrice: therapist.sessionPrice,
          sessionDuration: therapist.sessionDuration,
          yearsOfExperience: therapist.yearsOfExperience,
          languages: therapist.languages,
          gender: therapist.gender,
          education: therapist.education || [
            'תואר ראשון בפסיכולוגיה',
            'תואר שני בפסיכולוגיה קלינית',
            'רישיון פסיכולוג/ית קליני/ת - משרד הבריאות',
          ],
        },
        matchScore: detailedMatch.overallScore,
        matchQuality: detailedMatch.matchQuality,
        matchBreakdown: {
          xFactor: Math.round(detailedMatch.factors.find(f => f.key === 'xFactor')?.score ?? 0),
          healthFund: Math.round(detailedMatch.factors.find(f => f.key === 'healthFund')?.score ?? 0),
          availability: Math.round(detailedMatch.factors.find(f => f.key === 'availability')?.score ?? 0),
          preferences: Math.round(detailedMatch.factors.find(f => f.key === 'preferences')?.score ?? 0),
        },
        topReasons: detailedMatch.topReasons,
        insights: detailedMatch.insights,
      };
    }),

  /**
   * Get detailed match breakdown for a therapist
   */
  getMatchDetails: patientProcedure
    .input(z.object({ therapistId: z.string() }))
    .query(async ({ input }) => {
      const therapist = getTherapistById(input.therapistId);

      if (!therapist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Therapist not found',
        });
      }

      // Calculate detailed match
      const detailedMatch = calculateDetailedMatch(
        mockPatient,
        mockXFactorProfile,
        therapist
      );

      // Mark as viewed in mock data
      const existingMatch = mockMatches.find(m => m.therapistId === input.therapistId);
      if (existingMatch && !existingMatch.isViewed) {
        existingMatch.isViewed = true;
      }

      return {
        therapistId: therapist.id,
        overallScore: detailedMatch.overallScore,
        matchQuality: detailedMatch.matchQuality,
        matchQualityLabel: getMatchQualityLabel(detailedMatch.matchQuality),
        factors: detailedMatch.factors,
        topReasons: detailedMatch.topReasons,
        warnings: detailedMatch.warnings,
        insights: detailedMatch.insights,
        isFavorited: existingMatch?.isFavorited ?? false,
        therapist: {
          ...therapist,
          availability: [
            { dayOfWeek: 'SUNDAY', startTime: '09:00', endTime: '17:00', isOnline: true, isInPerson: true },
            { dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '18:00', isOnline: true, isInPerson: true },
            { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '15:00', isOnline: true, isInPerson: false },
          ],
        },
      };
    }),

  /**
   * Get X-Factor profile for updating
   */
  getXFactorProfile: patientProcedure.query(async () => {
    return mockXFactorProfile;
  }),

  /**
   * Update X-Factor profile (triggers match recalculation)
   */
  updateXFactorProfile: patientProcedure
    .input(
      z.object({
        openness: z.number().min(0).max(100).optional(),
        emotionalIntensity: z.number().min(0).max(100).optional(),
        structurePreference: z.number().min(0).max(100).optional(),
        relationshipStyle: z.number().min(0).max(100).optional(),
        communicationStyle: z.number().min(0).max(100).optional(),
        changeReadiness: z.number().min(0).max(100).optional(),
        sleepQuality: z.number().min(0).max(100).optional(),
        stressLevel: z.number().min(0).max(100).optional(),
        militaryStress: z.number().min(0).max(100).optional(),
        emotionalLoad: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Update mock X-Factor profile
      Object.assign(mockXFactorProfile, input);
      mockXFactorProfile.version += 1;
      mockXFactorProfile.calculatedAt = new Date();

      return {
        profile: mockXFactorProfile,
        message: 'Profile updated. Your matches have been recalculated.',
      };
    }),

  /**
   * Toggle match favorite status
   */
  toggleMatchFavorite: patientProcedure
    .input(z.object({ matchId: z.string() }))
    .mutation(async ({ input }) => {
      const match = mockMatches.find((m) => m.id === input.matchId);

      if (!match) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Match not found',
        });
      }

      match.isFavorited = !match.isFavorited;
      return { isFavorited: match.isFavorited };
    }),

  /**
   * Hide a match
   */
  hideMatch: patientProcedure
    .input(z.object({ matchId: z.string() }))
    .mutation(async ({ input }) => {
      const match = mockMatches.find((m) => m.id === input.matchId);

      if (!match) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Match not found',
        });
      }

      match.isHidden = true;
      return { success: true };
    }),

  /**
   * Get patient's sessions
   */
  getSessions: patientProcedure
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
      let filtered = [...mockSessions];

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

      // Enrich with therapist data
      const sessions = paged.map((session) => {
        const therapist = getTherapistById(session.therapistId);
        return {
          ...session,
          therapist: therapist
            ? {
                id: therapist.id,
                firstName: therapist.firstName,
                lastName: therapist.lastName,
                title: therapist.title,
                photoUrl: therapist.photoUrl,
                photoThumbnailUrl: therapist.photoThumbnailUrl,
              }
            : null,
        };
      });

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
});
