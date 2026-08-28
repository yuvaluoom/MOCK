/**
 * Admin Email Router
 *
 * tRPC endpoints for the Admin Email Control Center
 */

import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import {
  sendBroadcastEmail,
  sendPersonalEmail,
  getAllEmailRecords,
  getEmailStatistics,
  getBroadcastRecipientCounts,
  type BroadcastAudience,
} from '@/lib/email/email-infrastructure';
import { EMAIL_TRIGGERS } from '@/lib/email/trigger-mapping';
import { seedDemoEmails } from '@/lib/email/seed-emails';

// Seed demo emails once at startup
seedDemoEmails().catch(() => {});

export const adminEmailRouter = router({
  /**
   * Get email statistics for dashboard
   */
  getStatistics: adminProcedure.query(async () => {
    const stats = getEmailStatistics();
    const audienceCounts = getBroadcastRecipientCounts();

    return {
      ...stats,
      audienceCounts,
      providerStatus: {
        name: process.env.EMAIL_PROVIDER || 'development',
        connected: true,
      },
    };
  }),

  /**
   * Get list of sent emails with filtering and pagination
   */
  getEmailHistory: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        type: z.string().optional(),
        status: z.enum(['QUEUED', 'SENT', 'FAILED', 'DELIVERED', 'BOUNCED']).optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { records, total } = getAllEmailRecords({
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
        type: input.type as any,
        status: input.status,
        fromDate: input.fromDate ? new Date(input.fromDate) : undefined,
        toDate: input.toDate ? new Date(input.toDate) : undefined,
      });

      // Filter by search if provided
      let filteredRecords = records;
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredRecords = records.filter(
          r =>
            r.to.toLowerCase().includes(searchLower) ||
            r.subject.toLowerCase().includes(searchLower) ||
            r.type.toLowerCase().includes(searchLower)
        );
      }

      return {
        emails: filteredRecords.map(r => ({
          id: r.id,
          to: r.to,
          subject: r.subject,
          type: r.type,
          triggerEvent: r.triggerEvent,
          status: r.status,
          provider: r.provider,
          createdAt: r.createdAt.toISOString(),
          sentAt: r.sentAt?.toISOString() || null,
          errorMessage: r.errorMessage || null,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get single email details
   */
  getEmailDetails: adminProcedure
    .input(z.object({ emailId: z.string() }))
    .query(async ({ input }) => {
      const { records } = getAllEmailRecords();
      const email = records.find(r => r.id === input.emailId);

      if (!email) {
        throw new Error('Email not found');
      }

      return {
        ...email,
        createdAt: email.createdAt.toISOString(),
        sentAt: email.sentAt?.toISOString() || null,
        deliveredAt: email.deliveredAt?.toISOString() || null,
      };
    }),

  /**
   * Get all email triggers for reference
   */
  getTriggers: adminProcedure.query(async () => {
    return EMAIL_TRIGGERS;
  }),

  /**
   * Get recipient counts for broadcast targeting
   */
  getBroadcastAudiences: adminProcedure.query(async () => {
    const counts = getBroadcastRecipientCounts();

    return [
      { id: 'ALL_CLIENTS', name: 'All Clients', count: counts.ALL_CLIENTS, description: 'All registered patients' },
      { id: 'ALL_THERAPISTS', name: 'All Therapists', count: counts.ALL_THERAPISTS, description: 'All registered therapists' },
      { id: 'PENDING_THERAPISTS', name: 'Pending Therapists', count: counts.PENDING_THERAPISTS, description: 'Therapists awaiting approval' },
      { id: 'APPROVED_THERAPISTS', name: 'Approved Therapists', count: counts.APPROVED_THERAPISTS, description: 'Active approved therapists' },
      { id: 'ACTIVE_CLIENTS', name: 'Active Clients', count: counts.ACTIVE_CLIENTS, description: 'Clients who completed questionnaire' },
      { id: 'INACTIVE_CLIENTS', name: 'Inactive Clients', count: counts.INACTIVE_CLIENTS, description: "Clients who haven't completed questionnaire" },
    ];
  }),

  /**
   * Send broadcast email
   */
  sendBroadcast: adminProcedure
    .input(
      z.object({
        subject: z.string().min(1, 'Subject is required'),
        htmlContent: z.string().min(1, 'Content is required'),
        textContent: z.string().optional(),
        targetAudience: z.enum([
          'ALL_CLIENTS',
          'ALL_THERAPISTS',
          'PENDING_THERAPISTS',
          'APPROVED_THERAPISTS',
          'ACTIVE_CLIENTS',
          'INACTIVE_CLIENTS',
          'CUSTOM',
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const adminId = ctx.session?.user?.id || 'admin-1';

      const result = await sendBroadcastEmail(
        {
          subject: input.subject,
          htmlContent: input.htmlContent,
          textContent: input.textContent,
          targetAudience: input.targetAudience as BroadcastAudience,
        },
        adminId
      );

      return {
        success: true,
        sent: result.sent,
        failed: result.failed,
        total: result.sent + result.failed,
        message: `Broadcast sent: ${result.sent} succeeded, ${result.failed} failed`,
      };
    }),

  /**
   * Send personal email to specific user
   */
  sendPersonalEmail: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        userEmail: z.string().email(),
        userName: z.string(),
        subject: z.string().min(1, 'Subject is required'),
        htmlContent: z.string().min(1, 'Content is required'),
        textContent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const adminId = ctx.session?.user?.id || 'admin-1';

      const result = await sendPersonalEmail(
        {
          userId: input.userId,
          userEmail: input.userEmail,
          userName: input.userName,
          subject: input.subject,
          htmlContent: input.htmlContent,
          textContent: input.textContent,
        },
        adminId
      );

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    }),

  /**
   * Get users for personal email selection
   */
  getUsers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(['patient', 'therapist', 'all']).default('all'),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const { mockDb } = await import('@/lib/database/mock-db');

      let users: Array<{ id: string; email: string; name: string; role: string }> = [];

      if (input.role === 'all' || input.role === 'patient') {
        const patients = mockDb.getAllPatients();
        users.push(
          ...patients.map(p => ({
            id: p.id,
            email: p.email,
            name: `${p.firstName} ${p.lastName}`,
            role: 'patient' as const,
          }))
        );
      }

      if (input.role === 'all' || input.role === 'therapist') {
        const therapists = mockDb.getAllTherapists();
        users.push(
          ...therapists.map(t => ({
            id: t.id,
            email: t.email,
            name: `${t.firstName} ${t.lastName}`,
            role: 'therapist' as const,
          }))
        );
      }

      if (input.search) {
        const searchLower = input.search.toLowerCase();
        users = users.filter(
          u =>
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower)
        );
      }

      return users.slice(0, input.limit);
    }),

  /**
   * Preview email template with placeholders replaced
   */
  previewEmail: adminProcedure
    .input(
      z.object({
        subject: z.string(),
        htmlContent: z.string(),
        sampleData: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      let previewHtml = input.htmlContent;
      let previewSubject = input.subject;

      const sampleData = input.sampleData || {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        therapistName: 'Dr. Sarah Cohen',
        patientName: 'John Doe',
        meetingDate: new Date().toLocaleDateString(),
        meetingTime: '10:00 AM',
        status: 'Approved',
        actionLink: '#preview',
      };

      for (const [key, value] of Object.entries(sampleData)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        previewHtml = previewHtml.replace(placeholder, value);
        previewSubject = previewSubject.replace(placeholder, value);
      }

      return { subject: previewSubject, html: previewHtml };
    }),
});

export type AdminEmailRouter = typeof adminEmailRouter;
