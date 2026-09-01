import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  router,
  protectedProcedure,
  therapistProcedure,
  adminProcedure,
} from '../trpc';
import { documentStorage } from '@/lib/storage';
import type { DocumentCategory } from '@/lib/storage/types';

const documentCategorySchema = z.enum([
  'CREDENTIAL', 'CLINICAL', 'CONSENT', 'IDENTITY', 'ATTACHMENT',
]);

const documentTypeSchema = z.string().min(1).max(50);

export const documentsRouter = router({
  // ===========================================================================
  // UPLOAD (therapist or admin)
  // ===========================================================================

  upload: protectedProcedure
    .input(z.object({
      fileName: z.string().min(1).max(255),
      fileSize: z.number().positive().max(20 * 1024 * 1024),
      fileType: z.string().min(1),
      fileContent: z.string().min(1), // base64
      category: documentCategorySchema,
      documentType: documentTypeSchema,
      therapistId: z.string().optional(),
      patientId: z.string().optional(),
      sessionId: z.string().optional(),
      expiresAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const therapistId = input.therapistId ?? (user.role === 'THERAPIST' ? user.id : undefined);

      const doc = await documentStorage.upload(
        {
          file: {
            name: input.fileName,
            size: input.fileSize,
            type: input.fileType,
            content: input.fileContent,
          },
          category: input.category as DocumentCategory,
          documentType: input.documentType,
          therapistId,
          patientId: input.patientId,
          sessionId: input.sessionId,
          expiresAt: input.expiresAt,
        },
        user.id,
        user.role as 'THERAPIST' | 'PATIENT' | 'ADMIN',
      );

      return {
        id: doc.id,
        fileName: doc.originalFileName,
        status: doc.status,
        category: doc.category,
        documentType: doc.documentType,
        fileSize: doc.fileSize,
        checksum: doc.checksum,
        uploadedAt: doc.uploadedAt,
      };
    }),

  // ===========================================================================
  // LIST — my documents (for therapist/patient)
  // ===========================================================================

  listMyDocuments: protectedProcedure
    .input(z.object({
      category: documentCategorySchema.optional(),
      status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_UPDATE', 'EXPIRED']).optional(),
    }).optional())
    .query(({ ctx, input }) => {
      const user = ctx.session.user;
      const filter: { therapistId?: string; patientId?: string; category?: DocumentCategory; status?: any } = {};

      if (user.role === 'THERAPIST') {
        filter.therapistId = user.id;
      } else if (user.role === 'PATIENT') {
        filter.patientId = user.id;
      }

      if (input?.category) filter.category = input.category as DocumentCategory;
      if (input?.status) filter.status = input.status;

      const docs = documentStorage.listDocuments(filter);
      return docs.map(d => ({
        id: d.id,
        category: d.category,
        documentType: d.documentType,
        fileName: d.originalFileName,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        status: d.status,
        securityLevel: d.securityLevel,
        checksum: d.checksum,
        expiresAt: d.expiresAt,
        rejectionReason: d.rejectionReason,
        reviewNotes: d.reviewNotes,
        version: d.version,
        uploadedAt: d.uploadedAt,
        updatedAt: d.updatedAt,
      }));
    }),

  // ===========================================================================
  // VIEW / DOWNLOAD — with access control + audit
  // ===========================================================================

  getDocument: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(({ ctx, input }) => {
      const user = ctx.session.user;
      const doc = documentStorage.getDocument(input.documentId);

      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      if (!documentStorage.canAccess(input.documentId, user.id, user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this document' });
      }

      documentStorage.logView(input.documentId, user.id, user.role);

      return {
        id: doc.id,
        category: doc.category,
        documentType: doc.documentType,
        fileName: doc.originalFileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        status: doc.status,
        securityLevel: doc.securityLevel,
        isEncrypted: doc.isEncrypted,
        checksum: doc.checksum,
        expiresAt: doc.expiresAt,
        rejectionReason: doc.rejectionReason,
        reviewNotes: doc.reviewNotes,
        reviewedBy: doc.reviewedBy,
        reviewedAt: doc.reviewedAt,
        version: doc.version,
        uploadedAt: doc.uploadedAt,
        updatedAt: doc.updatedAt,
        uploadedBy: doc.uploadedBy,
        uploaderRole: doc.uploaderRole,
        therapistId: doc.therapistId,
        patientId: doc.patientId,
        sessionId: doc.sessionId,
      };
    }),

  downloadDocument: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .query(({ ctx, input }) => {
      const user = ctx.session.user;
      const doc = documentStorage.getDocument(input.documentId);

      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      if (!documentStorage.canAccess(input.documentId, user.id, user.role, 'DOWNLOAD')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Download access denied' });
      }

      const content = documentStorage.getFileContent(input.documentId);
      if (!content) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File content not found' });
      }

      documentStorage.logDownload(input.documentId, user.id, user.role);

      return {
        fileName: doc.originalFileName,
        mimeType: doc.mimeType,
        content,
        checksum: doc.checksum,
      };
    }),

  // ===========================================================================
  // ADMIN: List all documents
  // ===========================================================================

  adminListDocuments: adminProcedure
    .input(z.object({
      category: documentCategorySchema.optional(),
      status: z.enum(['UPLOADING', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_UPDATE', 'EXPIRED', 'ARCHIVED']).optional(),
      therapistId: z.string().optional(),
      patientId: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(({ input }) => {
      const filter: any = {};
      if (input?.category) filter.category = input.category;
      if (input?.status) filter.status = input.status;
      if (input?.therapistId) filter.therapistId = input.therapistId;
      if (input?.patientId) filter.patientId = input.patientId;

      const allDocs = documentStorage.listDocuments(filter);
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const start = (page - 1) * limit;
      const paginated = allDocs.slice(start, start + limit);

      return {
        documents: paginated.map(d => ({
          id: d.id,
          category: d.category,
          documentType: d.documentType,
          fileName: d.originalFileName,
          fileSize: d.fileSize,
          mimeType: d.mimeType,
          status: d.status,
          securityLevel: d.securityLevel,
          isEncrypted: d.isEncrypted,
          checksum: d.checksum,
          expiresAt: d.expiresAt,
          rejectionReason: d.rejectionReason,
          reviewNotes: d.reviewNotes,
          reviewedBy: d.reviewedBy,
          reviewedAt: d.reviewedAt,
          version: d.version,
          uploadedAt: d.uploadedAt,
          updatedAt: d.updatedAt,
          uploadedBy: d.uploadedBy,
          uploaderRole: d.uploaderRole,
          therapistId: d.therapistId,
          patientId: d.patientId,
          sessionId: d.sessionId,
        })),
        pagination: {
          page,
          limit,
          total: allDocs.length,
          totalPages: Math.ceil(allDocs.length / limit),
        },
      };
    }),

  // ===========================================================================
  // ADMIN: Approve / Reject / Request Update
  // ===========================================================================

  adminApproveDocument: adminProcedure
    .input(z.object({
      documentId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(({ ctx, input }) => {
      const doc = documentStorage.approveDocument(input.documentId, ctx.session.user.id, input.notes);
      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }
      return { id: doc.id, status: doc.status };
    }),

  adminRejectDocument: adminProcedure
    .input(z.object({
      documentId: z.string(),
      reason: z.string().min(1, 'Rejection reason is required'),
    }))
    .mutation(({ ctx, input }) => {
      const doc = documentStorage.rejectDocument(input.documentId, ctx.session.user.id, input.reason);
      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }
      return { id: doc.id, status: doc.status };
    }),

  adminRequestUpdate: adminProcedure
    .input(z.object({
      documentId: z.string(),
      reason: z.string().min(1),
    }))
    .mutation(({ ctx, input }) => {
      const doc = documentStorage.requestUpdate(input.documentId, ctx.session.user.id, input.reason);
      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }
      return { id: doc.id, status: doc.status };
    }),

  adminArchiveDocument: adminProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(({ ctx, input }) => {
      const doc = documentStorage.archiveDocument(input.documentId, ctx.session.user.id);
      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }
      return { id: doc.id, status: doc.status };
    }),

  // ===========================================================================
  // ADMIN: Audit trail
  // ===========================================================================

  adminGetAuditLog: adminProcedure
    .input(z.object({
      documentId: z.string().optional(),
      limit: z.number().min(1).max(200).default(50),
    }).optional())
    .query(({ input }) => {
      if (input?.documentId) {
        return documentStorage.getAuditLog(input.documentId, input?.limit ?? 50);
      }
      return documentStorage.getFullAuditLog(input?.limit ?? 100);
    }),

  // ===========================================================================
  // ADMIN: Statistics & expiry
  // ===========================================================================

  adminGetStats: adminProcedure
    .query(() => {
      return documentStorage.getStats();
    }),

  adminGetExpiring: adminProcedure
    .input(z.object({ withinDays: z.number().min(1).max(365).default(30) }).optional())
    .query(({ input }) => {
      const expiring = documentStorage.getExpiringSoonDocuments(input?.withinDays ?? 30);
      const expired = documentStorage.getExpiredDocuments();
      return {
        expiring: expiring.map(d => ({
          id: d.id,
          documentType: d.documentType,
          fileName: d.originalFileName,
          therapistId: d.therapistId,
          expiresAt: d.expiresAt,
          status: d.status,
        })),
        expired: expired.map(d => ({
          id: d.id,
          documentType: d.documentType,
          fileName: d.originalFileName,
          therapistId: d.therapistId,
          expiresAt: d.expiresAt,
          status: d.status,
        })),
      };
    }),

  // ===========================================================================
  // DELETE (soft)
  // ===========================================================================

  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(({ ctx, input }) => {
      const user = ctx.session.user;
      const doc = documentStorage.getDocument(input.documentId);

      if (!doc) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
      }

      // Only owner or admin can delete
      if (doc.uploadedBy !== user.id && user.role !== 'ADMIN' && user.role !== 'OWNER') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the document owner or admin can delete' });
      }

      // Cannot delete approved credential documents (admin must archive instead)
      if (doc.category === 'CREDENTIAL' && doc.status === 'APPROVED' && user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Approved credential documents cannot be deleted by the uploader' });
      }

      documentStorage.deleteDocument(input.documentId, user.id, user.role);
      return { success: true };
    }),
});
