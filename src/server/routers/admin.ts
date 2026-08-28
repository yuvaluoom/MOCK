/**
 * Admin Router - Therapist Arbitration & Management
 *
 * This router connects to the unified AdminService which ensures:
 * - Single source of truth (unified mock database)
 * - Strict state machine transitions
 * - Transactional email notifications
 * - Cross-platform notification sync
 * - Comprehensive audit logging
 *
 * NO UI-ONLY ACTIONS - Every action has real backend effects.
 */

import { z } from 'zod';
import { router, adminProcedure, ownerProcedure } from '../trpc';
import { adminService, type AdminContext } from '@/lib/admin/admin-service';
import { mockDb } from '@/lib/database/mock-db';
import type { TherapistApprovalStatus } from '@/lib/database/mock-db';
import { calculateDetailedMatch, DEFAULT_CONFIG } from '@/lib/matching/algorithm';
import { mockPatient, mockXFactorProfile, mockTherapists } from '../mock-data';

// =============================================================================
// HELPER: Create Admin Context
// =============================================================================

function createAdminContext(adminId: string = 'user-admin-1'): AdminContext {
  // In production, this would come from the authenticated session
  const admin = mockDb.getUserById(adminId);
  return {
    adminId,
    adminName: admin?.email?.split('@')[0] || 'Admin',
    adminEmail: admin?.email || 'admin@matchmind.co.il',
    adminRole: (admin?.role as 'ADMIN' | 'OWNER') || 'ADMIN',
  };
}

// =============================================================================
// ADMIN ROUTER
// =============================================================================

export const adminRouter = router({
  /**
   * Get dashboard statistics
   */
  getDashboardStats: adminProcedure.query(() => {
    return adminService.getStats();
  }),

  /**
   * Get therapist applications with filtering and pagination
   */
  getTherapistApplications: adminProcedure
    .input(
      z.object({
        status: z.enum(['ALL', 'PENDING_INFO', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
        search: z.string().optional(),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(10),
      })
    )
    .query(({ input }) => {
      return adminService.getTherapistApplications({
        status: input.status as TherapistApprovalStatus | 'ALL' | undefined,
        search: input.search,
        page: input.page,
        limit: input.limit,
      });
    }),

  /**
   * Get single therapist application detail
   */
  getTherapistApplication: adminProcedure
    .input(z.object({ therapistId: z.string() }))
    .query(({ input }) => {
      const therapist = adminService.getTherapistApplication(input.therapistId);
      if (!therapist) {
        throw new Error('Therapist not found');
      }
      return therapist;
    }),

  /**
   * Approve a therapist application
   *
   * This action:
   * - Updates status to APPROVED
   * - Makes therapist visible in matching
   * - Sends approval email
   * - Creates notification
   * - Logs to audit trail
   */
  approveTherapist: adminProcedure
    .input(
      z.object({
        therapistId: z.string(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const ctx = createAdminContext();
      const result = await adminService.approveTherapist(
        input.therapistId,
        ctx,
        { note: input.note }
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        therapist: result.data?.therapist,
        message: 'Therapist approved successfully. Email notification sent.',
        auditLogId: result.auditLogId,
        emailId: result.emailId,
      };
    }),

  /**
   * Reject a therapist application
   *
   * This action:
   * - Updates status to REJECTED
   * - Sends rejection email with reason
   * - Creates notification
   * - Logs to audit trail
   */
  rejectTherapist: adminProcedure
    .input(
      z.object({
        therapistId: z.string(),
        reason: z.string().min(10, 'Reason must be at least 10 characters'),
      })
    )
    .mutation(async ({ input }) => {
      const ctx = createAdminContext();
      const result = await adminService.rejectTherapist(
        input.therapistId,
        ctx,
        input.reason
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        therapist: result.data?.therapist,
        message: 'Therapist rejected. Email notification sent with reason.',
        auditLogId: result.auditLogId,
        emailId: result.emailId,
      };
    }),

  /**
   * Request additional documents from therapist
   *
   * This action:
   * - Updates status to PENDING_INFO
   * - Sends email with list of required documents
   * - Creates notification
   * - Logs to audit trail
   */
  requestDocuments: adminProcedure
    .input(
      z.object({
        therapistId: z.string(),
        documentTypes: z.array(z.string()).min(1),
        note: z.string().min(5, 'Note must be at least 5 characters'),
      })
    )
    .mutation(async ({ input }) => {
      const ctx = createAdminContext();
      const result = await adminService.requestDocuments(
        input.therapistId,
        ctx,
        input.documentTypes,
        input.note
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        therapist: result.data?.therapist,
        message: 'Document request sent to therapist.',
        auditLogId: result.auditLogId,
        emailId: result.emailId,
      };
    }),

  /**
   * Suspend an approved therapist
   *
   * This action:
   * - Updates status to SUSPENDED
   * - Removes from matching visibility
   * - Sends suspension email with reason
   * - Creates notification
   * - Logs to audit trail
   */
  suspendTherapist: adminProcedure
    .input(
      z.object({
        therapistId: z.string(),
        reason: z.string().min(10, 'Reason must be at least 10 characters'),
      })
    )
    .mutation(async ({ input }) => {
      const ctx = createAdminContext();
      const result = await adminService.suspendTherapist(
        input.therapistId,
        ctx,
        input.reason
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        therapist: result.data?.therapist,
        message: 'Therapist suspended. Email notification sent.',
        auditLogId: result.auditLogId,
        emailId: result.emailId,
      };
    }),

  /**
   * Unsuspend a therapist (restore to APPROVED)
   */
  unsuspendTherapist: adminProcedure
    .input(z.object({ therapistId: z.string() }))
    .mutation(async ({ input }) => {
      const ctx = createAdminContext();
      const result = await adminService.unsuspendTherapist(input.therapistId, ctx);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        therapist: result.data?.therapist,
        message: 'Therapist suspension lifted. Email notification sent.',
        auditLogId: result.auditLogId,
        emailId: result.emailId,
      };
    }),

  /**
   * Get audit logs with filtering
   */
  getAuditLogs: adminProcedure
    .input(
      z.object({
        entityType: z.string().optional(),
        entityId: z.string().optional(),
        action: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(({ input }) => {
      const result = adminService.getAuditLogs({
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        limit: input.limit,
        offset: input.offset,
      });

      return {
        logs: result.logs,
        pagination: {
          total: result.total,
          limit: input.limit,
          offset: input.offset,
          totalPages: Math.ceil(result.total / input.limit),
        },
      };
    }),

  /**
   * Get email logs
   */
  getEmailLogs: adminProcedure
    .input(
      z.object({
        to: z.string().optional(),
        type: z.string().optional(),
        limit: z.number().optional().default(50),
      })
    )
    .query(({ input }) => {
      return adminService.getEmailLogs({
        to: input.to,
        type: input.type,
        limit: input.limit,
      });
    }),

  /**
   * Get all users with filtering (legacy endpoint)
   */
  getUsers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.string().optional(),
        status: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
      })
    )
    .query(({ input }) => {
      let users = mockDb.getAllUsers();

      // Filter by role
      if (input.role) {
        users = users.filter((u) => u.role === input.role);
      }

      // Filter by status
      if (input.status) {
        users = users.filter((u) => u.status === input.status);
      }

      // Search
      if (input.search) {
        const search = input.search.toLowerCase();
        users = users.filter((u) => u.email.toLowerCase().includes(search));
      }

      // Enrich with therapist/patient data
      const enrichedUsers = users.map((user) => {
        const therapist = mockDb.getTherapistByUserId(user.id);
        const patient = mockDb.getPatientByUserId(user.id);
        return {
          ...user,
          therapist: therapist
            ? { firstName: therapist.firstName, lastName: therapist.lastName }
            : null,
          patient: patient
            ? { firstName: patient.firstName, lastName: patient.lastName }
            : null,
        };
      });

      // Pagination
      const total = enrichedUsers.length;
      const totalPages = Math.ceil(total / input.limit);
      const offset = (input.page - 1) * input.limit;
      const paginated = enrichedUsers.slice(offset, offset + input.limit);

      return {
        users: paginated,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages,
        },
      };
    }),

  /**
   * Get admin notifications
   */
  getNotifications: adminProcedure.query(() => {
    // Get notifications for admin users
    const notifications = mockDb.getNotificationsByRecipient('user-admin-1');
    const unreadCount = mockDb.getUnreadNotificationCount('user-admin-1');

    return {
      notifications,
      unreadCount,
      urgentCount: notifications.filter(
        (n) => !n.isRead && n.priority === 'urgent'
      ).length,
    };
  }),

  /**
   * Mark notification as read
   */
  markNotificationRead: adminProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(({ input }) => {
      const success = mockDb.markNotificationRead(input.notificationId);
      return { success };
    }),

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: adminProcedure.mutation(() => {
    const count = mockDb.markAllNotificationsRead('user-admin-1');
    return { success: true, count };
  }),

  // ==========================================================================
  // OWNER-ONLY ENDPOINTS
  // ==========================================================================

  /**
   * Owner override - Force any status transition (bypasses state machine)
   */
  ownerOverrideStatus: ownerProcedure
    .input(
      z.object({
        therapistId: z.string(),
        newStatus: z.enum(['PENDING_INFO', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED']),
        reason: z.string().min(5),
      })
    )
    .mutation(async ({ input }) => {
      const therapist = mockDb.getTherapistById(input.therapistId);
      if (!therapist) {
        throw new Error('Therapist not found');
      }

      const previousStatus = therapist.approvalStatus;

      // Direct update (bypasses state machine validation)
      const updated = mockDb.updateTherapist(input.therapistId, {
        approvalStatus: input.newStatus as TherapistApprovalStatus,
        isAcceptingPatients: input.newStatus === 'APPROVED',
      });

      // Refresh match visibility
      mockDb.refreshMatchesForTherapist(input.therapistId);

      // Log the override
      mockDb.createAuditLog({
        action: 'OWNER_STATUS_OVERRIDE',
        entityType: 'THERAPIST',
        entityId: input.therapistId,
        userId: 'user-owner-1',
        userName: 'Owner',
        userRole: 'OWNER',
        previousValue: { approvalStatus: previousStatus },
        newValue: { approvalStatus: input.newStatus, reason: input.reason },
        metadata: {
          isOverride: true,
          bypassedStateMachine: true,
        },
        emailTriggered: false,
        emailId: null,
        ipAddress: null,
        userAgent: null,
      });

      return {
        success: true,
        therapist: updated,
        message: `Status overridden from ${previousStatus} to ${input.newStatus}`,
      };
    }),

  /**
   * Get sessions overview for admin dashboard
   * Sources ALL data from mock-db sessions
   */
  getSessionsOverview: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
      })
    )
    .query(({ input }) => {
      let sessions = mockDb.getAllSessions();

      // Filter by status
      if (input.status && input.status !== 'ALL') {
        sessions = sessions.filter((s) => s.status === input.status);
      }

      // Search by patient/therapist name
      if (input.search) {
        const search = input.search.toLowerCase();
        sessions = sessions.filter((s) => {
          const patient = mockDb.getPatientById(s.patientId);
          const therapist = mockDb.getTherapistById(s.therapistId);
          const patientName = patient
            ? `${patient.firstName} ${patient.lastName}`.toLowerCase()
            : '';
          const therapistName = therapist
            ? `${therapist.firstName} ${therapist.lastName}`.toLowerCase()
            : '';
          return patientName.includes(search) || therapistName.includes(search);
        });
      }

      // Sort by date descending
      sessions.sort(
        (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );

      // Compute stats from real data
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 24 * 60 * 60 * 1000);
      const allSessions = mockDb.getAllSessions();

      const todaySessions = allSessions.filter(
        (s) => new Date(s.scheduledAt) >= todayStart && new Date(s.scheduledAt) < todayEnd
      ).length;
      const weekSessions = allSessions.filter(
        (s) => new Date(s.scheduledAt) >= weekStart && new Date(s.scheduledAt) < todayEnd
      ).length;
      const totalRevenue = allSessions
        .filter((s) => s.status === 'APPROVED' || s.status === 'COMPLETED')
        .reduce((sum, s) => sum + (s.price ?? 0), 0);

      // Pagination
      const total = sessions.length;
      const offset = (input.page - 1) * input.limit;
      const paginated = sessions.slice(offset, offset + input.limit);

      // Enrich with names
      const enriched = paginated.map((s) => {
        const patient = mockDb.getPatientById(s.patientId);
        const therapist = mockDb.getTherapistById(s.therapistId);
        return {
          ...s,
          patient: patient
            ? { firstName: patient.firstName, lastName: patient.lastName }
            : { firstName: 'לא ידוע', lastName: '' },
          therapist: therapist
            ? { firstName: therapist.firstName, lastName: therapist.lastName, title: therapist.title }
            : { firstName: 'לא ידוע', lastName: '', title: '' },
        };
      });

      return {
        sessions: enriched,
        stats: { todaySessions, weekSessions, totalRevenue },
        pagination: { page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit) },
      };
    }),

  /**
   * Get reports/analytics data from real platform activity
   */
  getReportsData: adminProcedure.query(() => {
    const allTherapists = mockDb.getAllTherapists();
    const allSessions = mockDb.getAllSessions();
    const allPatients = mockDb.getAllPatients();

    // Therapist stats
    const approvedTherapists = allTherapists.filter((t) => t.approvalStatus === 'APPROVED');

    // Health fund distribution from actual patients
    const healthFundCounts: Record<string, number> = {};
    allPatients.forEach((p) => {
      const fund = p.healthFund || 'אחר';
      healthFundCounts[fund] = (healthFundCounts[fund] || 0) + 1;
    });
    const totalPatientsFunds = allPatients.length || 1;
    const healthFundDistribution = Object.entries(healthFundCounts).map(([name, count]) => ({
      name,
      percent: Math.round((count / totalPatientsFunds) * 100),
    }));

    // Top therapists by session count
    const therapistSessionCounts: Record<string, number> = {};
    allSessions.forEach((s) => {
      therapistSessionCounts[s.therapistId] = (therapistSessionCounts[s.therapistId] || 0) + 1;
    });
    const topTherapists = Object.entries(therapistSessionCounts)
      .map(([id, sessions]) => {
        const t = mockDb.getTherapistById(id);
        return {
          id,
          name: t ? `${t.title} ${t.firstName} ${t.lastName}`.trim() : id,
          sessions,
        };
      })
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    // Match rate (approved / total sessions)
    const matchRate = allSessions.length > 0
      ? Math.round(
          (allSessions.filter((s) => s.status === 'APPROVED' || s.status === 'COMPLETED').length /
            allSessions.length) *
            100
        )
      : 0;

    return {
      totalTherapists: allTherapists.length,
      approvedTherapists: approvedTherapists.length,
      totalPatients: allPatients.length,
      totalSessions: allSessions.length,
      matchRate,
      healthFundDistribution,
      topTherapists,
      sessionsByStatus: {
        approved: allSessions.filter((s) => s.status === 'APPROVED').length,
        pending: allSessions.filter((s) => s.status === 'PENDING_THERAPIST_APPROVAL').length,
        completed: allSessions.filter((s) => s.status === 'COMPLETED').length,
        cancelled: allSessions.filter(
          (s) => s.status === 'CANCELLED_BY_PATIENT' || s.status === 'CANCELLED_BY_THERAPIST'
        ).length,
      },
    };
  }),

  /**
   * Get compliance data from real therapist/session data
   */
  getComplianceData: adminProcedure.query(() => {
    const allTherapists = mockDb.getAllTherapists();
    const allSessions = mockDb.getAllSessions();
    const allDocuments = mockDb.getAllDocuments();

    const therapistCompliance = allTherapists
      .filter((t) => t.approvalStatus === 'APPROVED' || t.approvalStatus === 'SUSPENDED')
      .map((t) => {
        const sessions = allSessions.filter((s) => s.therapistId === t.id);
        const docs = allDocuments.filter((d) => d.therapistId === t.id);
        const approvedDocs = docs.filter((d) => d.status === 'APPROVED').length;
        const totalDocs = docs.length || 1;
        const expiredDocs = docs.filter(
          (d) => d.expiresAt && new Date(d.expiresAt) < new Date()
        );

        // Compute verification status
        let verificationStatus: string;
        if (approvedDocs === 0 && docs.length === 0) {
          verificationStatus = 'MISSING_DOCUMENTATION';
        } else if (expiredDocs.length > 0) {
          verificationStatus = 'EXPIRED_CREDENTIALS';
        } else if (docs.some((d) => d.status === 'PENDING')) {
          verificationStatus = 'PENDING_VERIFICATION';
        } else if (approvedDocs < totalDocs) {
          verificationStatus = 'PARTIALLY_VERIFIED';
        } else {
          verificationStatus = 'VERIFIED';
        }

        return {
          id: t.id,
          name: `${t.title} ${t.firstName} ${t.lastName}`.trim(),
          email: t.email,
          totalSessions: sessions.length,
          completedSessions: sessions.filter((s) => s.status === 'COMPLETED').length,
          documentCount: docs.length,
          approvedDocuments: approvedDocs,
          expiredDocuments: expiredDocs.length,
          pendingDocuments: docs.filter((d) => d.status === 'PENDING').length,
          documentComplianceRate: Math.round((approvedDocs / totalDocs) * 100),
          verificationStatus,
          missingDocuments: t.missingDocuments,
          profileCompleted: t.profileCompleted,
          approvalStatus: t.approvalStatus,
        };
      });

    const overallStats = {
      totalTherapists: therapistCompliance.length,
      verified: therapistCompliance.filter((t) => t.verificationStatus === 'VERIFIED').length,
      pendingVerification: therapistCompliance.filter(
        (t) => t.verificationStatus === 'PENDING_VERIFICATION'
      ).length,
      partiallyVerified: therapistCompliance.filter(
        (t) => t.verificationStatus === 'PARTIALLY_VERIFIED'
      ).length,
      missingDocs: therapistCompliance.filter(
        (t) => t.verificationStatus === 'MISSING_DOCUMENTATION'
      ).length,
      expiredCreds: therapistCompliance.filter(
        (t) => t.verificationStatus === 'EXPIRED_CREDENTIALS'
      ).length,
      overallComplianceRate:
        therapistCompliance.length > 0
          ? Math.round(
              therapistCompliance.reduce((sum, t) => sum + t.documentComplianceRate, 0) /
                therapistCompliance.length
            )
          : 0,
    };

    return { therapists: therapistCompliance, overallStats };
  }),

  /**
   * Owner: Get full system state
   */
  /**
   * Get match insights — computes detailed match analysis for all patient-therapist pairs.
   * Provides: per-pair scores, objective/subjective breakdowns, explanation items,
   * plus summary statistics (average, quality distribution).
   */
  getMatchInsights: adminProcedure
    .input(
      z.object({
        minScore: z.number().min(0).max(100).optional().default(0),
        page: z.number().min(1).optional().default(1),
        pageSize: z.number().min(1).max(50).optional().default(20),
      }).optional()
    )
    .query(({ input }) => {
      const minScore = input?.minScore ?? 0;
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;

      // Get all approved therapists
      const approvedTherapists = mockTherapists.filter(
        (t) => t.approvalStatus === 'APPROVED' && t.isAcceptingPatients
      );

      // Compute detailed match for each pair
      const allResults = approvedTherapists.map((therapist) => {
        const result = calculateDetailedMatch(
          mockPatient,
          mockXFactorProfile,
          therapist,
          DEFAULT_CONFIG
        );

        return {
          therapistId: therapist.id,
          therapistName: `${therapist.firstName} ${therapist.lastName}`,
          therapistTitle: therapist.title,
          therapistCity: therapist.city,
          patientId: mockPatient.id,
          patientName: `${mockPatient.firstName} ${mockPatient.lastName}`,
          overallScore: result.overallScore,
          objectiveFitScore: result.objectiveFitScore,
          subjectiveFitScore: result.subjectiveFitScore,
          matchQuality: result.matchQuality,
          factors: result.factors.map((f) => ({
            key: f.key,
            label: f.label,
            score: f.score,
            weight: f.weight,
            weightedScore: f.weightedScore,
            reasons: f.reasons,
          })),
          explanationItems: result.explanationItems,
          topReasons: result.topReasons,
          warnings: result.warnings,
          insights: result.insights,
        };
      });

      // Filter by minimum score
      const filteredResults = allResults.filter(
        (r) => r.overallScore >= minScore
      );

      // Sort by overall score descending
      filteredResults.sort((a, b) => b.overallScore - a.overallScore);

      // Calculate summary stats
      const totalPairs = filteredResults.length;
      const averageScore = totalPairs > 0
        ? Math.round(filteredResults.reduce((sum, r) => sum + r.overallScore, 0) / totalPairs)
        : 0;
      const qualityDistribution = {
        excellent: filteredResults.filter((r) => r.matchQuality === 'excellent').length,
        great: filteredResults.filter((r) => r.matchQuality === 'great').length,
        good: filteredResults.filter((r) => r.matchQuality === 'good').length,
        moderate: filteredResults.filter((r) => r.matchQuality === 'moderate').length,
        low: filteredResults.filter((r) => r.matchQuality === 'low').length,
      };

      // Paginate
      const startIdx = (page - 1) * pageSize;
      const paginatedResults = filteredResults.slice(startIdx, startIdx + pageSize);

      return {
        summary: {
          totalPairs,
          averageScore,
          qualityDistribution,
        },
        results: paginatedResults,
        pagination: {
          page,
          pageSize,
          totalPages: Math.ceil(totalPairs / pageSize),
          totalResults: totalPairs,
        },
      };
    }),

  getSystemState: ownerProcedure.query(() => {
    const stats = adminService.getStats();
    const recentAuditLogs = adminService.getAuditLogs({ limit: 10 });
    const emailLogs = adminService.getEmailLogs({ limit: 10 });

    return {
      stats,
      recentAuditLogs: recentAuditLogs.logs,
      emailLogs,
      systemHealth: {
        database: 'healthy',
        emailService: 'operational',
        matchingEngine: 'operational',
      },
    };
  }),
});
