import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { mockPatient, mockTherapists } from '../mock-data';
import { mockDb } from '@/lib/database/mock-db';
import { sendWelcomePatient, sendWelcomeTherapist } from '@/lib/email';

// Validation schemas
const registerPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerTherapistSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const updateConsentSchema = z.object({
  privacyConsent: z.boolean().optional(),
  cookieConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
});

// In-memory store to track "registered" emails for conflict detection
const registeredEmails = new Set<string>([mockPatient.email]);

export const authRouter = router({
  /**
   * Register a new patient
   */
  registerPatient: publicProcedure
    .input(registerPatientSchema)
    .mutation(async ({ input }) => {
      const { firstName, lastName, email } = input;

      // Check if user already exists
      if (registeredEmails.has(email)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this email already exists',
        });
      }

      registeredEmails.add(email);

      // Send welcome email
      await sendWelcomePatient(email, firstName);

      // Return mock created user
      const fakeId = `user-${Date.now()}`;
      return {
        id: fakeId,
        email,
        role: 'PATIENT' as const,
      };
    }),

  /**
   * Register a new therapist
   */
  registerTherapist: publicProcedure
    .input(registerTherapistSchema)
    .mutation(async ({ input }) => {
      const { email, firstName, lastName, phone, licenseNumber } = input;

      // Check if user already exists
      if (registeredEmails.has(email)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this email already exists',
        });
      }

      registeredEmails.add(email);

      // Create therapist in mock-db so it appears in admin dashboard
      const userId = `user-${Date.now()}`;
      const therapist = mockDb.createTherapist({
        userId,
        firstName,
        lastName,
        email,
        phone,
        gender: '',
        title: '',
        bio: '',
        bioHebrew: '',
        city: '',
        address: '',
        licenseNumber,
        photoUrl: null,
        photoThumbnailUrl: null,
        offersOnline: false,
        offersInPerson: false,
        languages: ['he'],
        approaches: [],
        specializations: [],
        acceptedHealthFunds: [],
        sessionPrice: 0,
        sessionDuration: 50,
        yearsOfExperience: 0,
        education: [],
        approvalStatus: 'PENDING_INFO',
        approvalNote: null,
        approvedBy: null,
        rejectionReason: null,
        suspensionReason: null,
        missingDocuments: ['license', 'diploma'],
        profileCompleted: false,
        isAcceptingPatients: false,
        approvedAt: null,
        rejectedAt: null,
        suspendedAt: null,
      });

      // Send welcome email
      await sendWelcomeTherapist(email, firstName);

      return {
        id: therapist.id,
        email,
        role: 'THERAPIST' as const,
        approvalStatus: 'PENDING_INFO',
      };
    }),

  /**
   * Get current user session info
   */
  getSession: protectedProcedure.query(async ({ ctx }) => {
    // Return mock session based on the mock patient by default
    return {
      id: mockPatient.userId,
      email: mockPatient.email,
      role: 'PATIENT' as const,
      status: 'ACTIVE' as const,
      patient: {
        firstName: mockPatient.firstName,
        lastName: mockPatient.lastName,
        onboardingCompleted: mockPatient.onboardingCompleted,
        questionnaireCompleted: mockPatient.questionnaireCompleted,
      },
      therapist: null,
      admin: null,
    };
  }),

  /**
   * Update user consent preferences
   */
  updateConsent: protectedProcedure
    .input(updateConsentSchema)
    .mutation(async ({ input }) => {
      // In mock mode, just acknowledge the update
      return { success: true };
    }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
      })
    )
    .mutation(async ({ input }) => {
      // In mock mode, simulate password validation
      // Accept any non-empty current password
      if (!input.currentPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        });
      }

      return { success: true };
    }),
});
