/**
 * MatchMind Document Storage Service
 *
 * Mock implementation using in-memory storage with globalThis singleton.
 * In production, replace with S3 + KMS for encrypted cloud storage.
 *
 * Security protocol:
 * 1. File validation (type, size, content sniffing)
 * 2. SHA-256 integrity checksum on upload
 * 3. AES-256 encryption at rest (simulated via flag)
 * 4. Role-based access control on every read
 * 5. Full audit trail for all operations
 * 6. Automatic expiry detection
 * 7. Retention policy enforcement
 */

import {
  type StoredDocument,
  type DocumentAuditEntry,
  type DocumentAccessRule,
  type DocumentCategory,
  type DocumentStatus,
  type AuditAction,
  type UploadRequest,
  type DocumentFilter,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  SECURITY_LEVELS,
  RETENTION_DAYS,
} from './types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function computeChecksum(content: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

const FILE_SIGNATURES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46],   // %PDF
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
};

function validateFileSignature(base64Content: string, declaredMimeType: string): boolean {
  try {
    const raw = atob(base64Content.slice(0, 20));
    const bytes = Array.from(raw).map(c => c.charCodeAt(0));
    const signature = FILE_SIGNATURES[declaredMimeType];
    if (!signature) return true;
    return signature.every((byte, i) => bytes[i] === byte);
  } catch {
    return false;
  }
}

// =============================================================================
// STORAGE SERVICE
// =============================================================================

class DocumentStorageService {
  private documents: Map<string, StoredDocument> = new Map();
  private fileStore: Map<string, string> = new Map(); // id -> base64 content
  private auditLog: DocumentAuditEntry[] = [];
  private accessRules: Map<string, DocumentAccessRule[]> = new Map();

  constructor() {
    this.seedData();
  }

  // ---------------------------------------------------------------------------
  // UPLOAD
  // ---------------------------------------------------------------------------

  async upload(
    request: UploadRequest,
    uploadedBy: string,
    uploaderRole: 'THERAPIST' | 'PATIENT' | 'ADMIN',
  ): Promise<StoredDocument> {
    // 1. Validate MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[request.category] ?? [];
    if (!allowedTypes.includes(request.file.type)) {
      throw new Error(`File type ${request.file.type} is not allowed for ${request.category} documents`);
    }

    // 2. Validate file size
    const maxSize = MAX_FILE_SIZE[request.category] ?? 10 * 1024 * 1024;
    if (request.file.size > maxSize) {
      throw new Error(`File size exceeds the ${Math.round(maxSize / 1024 / 1024)}MB limit`);
    }

    // 3. Validate file signature (magic bytes)
    if (!validateFileSignature(request.file.content, request.file.type)) {
      throw new Error('File content does not match declared type — possible tampering detected');
    }

    // 4. Compute integrity checksum
    const checksum = await computeChecksum(request.file.content);

    // 5. Generate storage metadata
    const docId = `doc-${generateId()}`;
    const sanitizedName = request.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const encryptionKeyId = `kms-${generateId().slice(0, 8)}`;

    const retentionDays = RETENTION_DAYS[request.category] ?? 365 * 2;

    const document: StoredDocument = {
      id: docId,
      category: request.category,
      documentType: request.documentType,
      fileName: `${docId}_${sanitizedName}`,
      originalFileName: request.file.name,
      mimeType: request.file.type,
      fileSize: request.file.size,
      uploadedBy,
      uploaderRole,
      therapistId: request.therapistId,
      patientId: request.patientId,
      sessionId: request.sessionId,
      securityLevel: SECURITY_LEVELS[request.category] ?? 'STANDARD',
      encryptionKeyId,
      checksum,
      isEncrypted: true,
      status: uploaderRole === 'ADMIN' ? 'APPROVED' : 'PENDING_REVIEW',
      version: 1,
      retentionDays,
      uploadedAt: new Date(),
      updatedAt: new Date(),
      expiresAt: request.expiresAt ? new Date(request.expiresAt) : undefined,
    };

    // 6. Store file content and metadata
    this.fileStore.set(docId, request.file.content);
    this.documents.set(docId, document);

    // 7. Audit
    this.logAudit(docId, 'UPLOAD', uploadedBy, uploaderRole, `Uploaded ${request.file.name} (${this.formatBytes(request.file.size)})`);

    return document;
  }

  // ---------------------------------------------------------------------------
  // RETRIEVAL
  // ---------------------------------------------------------------------------

  getDocument(id: string): StoredDocument | undefined {
    return this.documents.get(id);
  }

  getFileContent(id: string): string | undefined {
    return this.fileStore.get(id);
  }

  listDocuments(filter?: DocumentFilter): StoredDocument[] {
    let docs = Array.from(this.documents.values());

    if (filter?.category) {
      docs = docs.filter(d => d.category === filter.category);
    }
    if (filter?.status) {
      docs = docs.filter(d => d.status === filter.status);
    }
    if (filter?.therapistId) {
      docs = docs.filter(d => d.therapistId === filter.therapistId);
    }
    if (filter?.patientId) {
      docs = docs.filter(d => d.patientId === filter.patientId);
    }
    if (filter?.sessionId) {
      docs = docs.filter(d => d.sessionId === filter.sessionId);
    }
    if (filter?.uploadedAfter) {
      docs = docs.filter(d => d.uploadedAt >= filter.uploadedAfter!);
    }
    if (filter?.uploadedBefore) {
      docs = docs.filter(d => d.uploadedAt <= filter.uploadedBefore!);
    }

    return docs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  getDocumentsByTherapist(therapistId: string): StoredDocument[] {
    return this.listDocuments({ therapistId });
  }

  getDocumentsByPatient(patientId: string): StoredDocument[] {
    return this.listDocuments({ patientId });
  }

  // ---------------------------------------------------------------------------
  // REVIEW / STATUS MANAGEMENT
  // ---------------------------------------------------------------------------

  approveDocument(id: string, reviewedBy: string, notes?: string): StoredDocument | null {
    return this.updateStatus(id, 'APPROVED', reviewedBy, undefined, notes);
  }

  rejectDocument(id: string, reviewedBy: string, reason: string): StoredDocument | null {
    return this.updateStatus(id, 'REJECTED', reviewedBy, reason);
  }

  requestUpdate(id: string, reviewedBy: string, reason: string): StoredDocument | null {
    return this.updateStatus(id, 'REQUIRES_UPDATE', reviewedBy, reason);
  }

  archiveDocument(id: string, archivedBy: string): StoredDocument | null {
    const doc = this.documents.get(id);
    if (!doc) return null;

    const updated: StoredDocument = {
      ...doc,
      status: 'ARCHIVED',
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    this.logAudit(id, 'ARCHIVE', archivedBy, 'ADMIN', 'Document archived');
    return updated;
  }

  private updateStatus(
    id: string,
    status: DocumentStatus,
    reviewedBy: string,
    rejectionReason?: string,
    reviewNotes?: string,
  ): StoredDocument | null {
    const doc = this.documents.get(id);
    if (!doc) return null;

    const updated: StoredDocument = {
      ...doc,
      status,
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason,
      reviewNotes,
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);

    const action: AuditAction = status === 'APPROVED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'UPDATE_STATUS';
    this.logAudit(id, action, reviewedBy, 'ADMIN', rejectionReason ?? reviewNotes ?? `Status → ${status}`);

    return updated;
  }

  // ---------------------------------------------------------------------------
  // DELETE (SOFT)
  // ---------------------------------------------------------------------------

  deleteDocument(id: string, deletedBy: string, role: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    const updated: StoredDocument = {
      ...doc,
      status: 'ARCHIVED',
      scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days grace
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    this.logAudit(id, 'DELETE', deletedBy, role, 'Soft-deleted, scheduled for permanent removal in 30 days');
    return true;
  }

  // ---------------------------------------------------------------------------
  // ACCESS CONTROL
  // ---------------------------------------------------------------------------

  grantAccess(documentId: string, grantedTo: string, grantedToRole: string, grantedBy: string, permissions: Array<'VIEW' | 'DOWNLOAD'> = ['VIEW']): void {
    const rules = this.accessRules.get(documentId) ?? [];
    rules.push({
      documentId,
      grantedTo,
      grantedToRole,
      permissions,
      grantedBy,
      grantedAt: new Date(),
      revoked: false,
    });
    this.accessRules.set(documentId, rules);
    this.logAudit(documentId, 'SHARE', grantedBy, 'ADMIN', `Access granted to ${grantedTo} (${permissions.join(', ')})`);
  }

  revokeAccess(documentId: string, grantedTo: string, revokedBy: string): void {
    const rules = this.accessRules.get(documentId) ?? [];
    for (const rule of rules) {
      if (rule.grantedTo === grantedTo && !rule.revoked) {
        rule.revoked = true;
      }
    }
    this.accessRules.set(documentId, rules);
    this.logAudit(documentId, 'REVOKE_ACCESS', revokedBy, 'ADMIN', `Access revoked for ${grantedTo}`);
  }

  canAccess(documentId: string, userId: string, userRole: string, action: 'VIEW' | 'DOWNLOAD' = 'VIEW'): boolean {
    const doc = this.documents.get(documentId);
    if (!doc) return false;

    // Admin can always access
    if (userRole === 'ADMIN' || userRole === 'OWNER') return true;

    // Owner can always access their own documents
    if (doc.uploadedBy === userId) return true;

    // Therapist can access their own therapist documents
    if (userRole === 'THERAPIST' && doc.therapistId === userId) return true;

    // Check explicit access rules
    const rules = this.accessRules.get(documentId) ?? [];
    return rules.some(r =>
      r.grantedTo === userId &&
      !r.revoked &&
      r.permissions.includes(action) &&
      (!r.expiresAt || r.expiresAt > new Date())
    );
  }

  // ---------------------------------------------------------------------------
  // AUDIT TRAIL
  // ---------------------------------------------------------------------------

  logView(documentId: string, viewedBy: string, role: string): void {
    this.logAudit(documentId, 'VIEW', viewedBy, role);
  }

  logDownload(documentId: string, downloadedBy: string, role: string): void {
    this.logAudit(documentId, 'DOWNLOAD', downloadedBy, role);
  }

  getAuditLog(documentId?: string, limit = 50): DocumentAuditEntry[] {
    let entries = this.auditLog;
    if (documentId) {
      entries = entries.filter(e => e.documentId === documentId);
    }
    return entries.slice(-limit).reverse();
  }

  getFullAuditLog(limit = 100): DocumentAuditEntry[] {
    return this.auditLog.slice(-limit).reverse();
  }

  private logAudit(documentId: string, action: AuditAction, performedBy: string, performedByRole: string, details?: string): void {
    this.auditLog.push({
      id: `audit-${generateId()}`,
      documentId,
      action,
      performedBy,
      performedByRole,
      ipAddress: '127.0.0.1',
      userAgent: 'MatchMind/1.0',
      details,
      timestamp: new Date(),
    });
  }

  // ---------------------------------------------------------------------------
  // EXPIRY CHECK
  // ---------------------------------------------------------------------------

  getExpiredDocuments(): StoredDocument[] {
    const now = new Date();
    return Array.from(this.documents.values()).filter(
      d => d.expiresAt && d.expiresAt < now && d.status !== 'EXPIRED' && d.status !== 'ARCHIVED'
    );
  }

  getExpiringSoonDocuments(withinDays = 30): StoredDocument[] {
    const now = new Date();
    const threshold = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
    return Array.from(this.documents.values()).filter(
      d => d.expiresAt && d.expiresAt > now && d.expiresAt < threshold && d.status === 'APPROVED'
    );
  }

  // ---------------------------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------------------------

  getStats(): {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    totalSize: number;
    pendingReview: number;
    expiringSoon: number;
    expired: number;
  } {
    const docs = Array.from(this.documents.values());
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalSize = 0;

    for (const doc of docs) {
      byStatus[doc.status] = (byStatus[doc.status] ?? 0) + 1;
      byCategory[doc.category] = (byCategory[doc.category] ?? 0) + 1;
      totalSize += doc.fileSize;
    }

    return {
      total: docs.length,
      byStatus,
      byCategory,
      totalSize,
      pendingReview: docs.filter(d => d.status === 'PENDING_REVIEW').length,
      expiringSoon: this.getExpiringSoonDocuments().length,
      expired: this.getExpiredDocuments().length,
    };
  }

  // ---------------------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------------------

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ---------------------------------------------------------------------------
  // SEED DATA
  // ---------------------------------------------------------------------------

  private seedData(): void {
    const seedDocs: Array<Omit<StoredDocument, 'id' | 'uploadedAt' | 'updatedAt'>> = [
      // Therapist 1 — fully approved
      {
        category: 'CREDENTIAL', documentType: 'LICENSE', fileName: 'license_rachel_cohen.pdf',
        originalFileName: 'license_rachel_cohen.pdf', mimeType: 'application/pdf', fileSize: 245678,
        uploadedBy: 'therapist-1', uploaderRole: 'THERAPIST', therapistId: 'therapist-1',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-01', checksum: 'a1b2c3d4e5f6',
        isEncrypted: true, status: 'APPROVED', reviewedBy: 'user-admin-1',
        reviewedAt: new Date('2024-01-14'), expiresAt: new Date('2026-01-12'),
        version: 1, retentionDays: 2555,
      },
      {
        category: 'CREDENTIAL', documentType: 'DIPLOMA', fileName: 'diploma_tel_aviv.pdf',
        originalFileName: 'diploma_tel_aviv.pdf', mimeType: 'application/pdf', fileSize: 567890,
        uploadedBy: 'therapist-1', uploaderRole: 'THERAPIST', therapistId: 'therapist-1',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-02', checksum: 'f6e5d4c3b2a1',
        isEncrypted: true, status: 'APPROVED', reviewedBy: 'user-admin-1',
        reviewedAt: new Date('2024-01-14'),
        version: 1, retentionDays: 2555,
      },
      {
        category: 'CREDENTIAL', documentType: 'INSURANCE', fileName: 'insurance_2024.pdf',
        originalFileName: 'insurance_2024.pdf', mimeType: 'application/pdf', fileSize: 123456,
        uploadedBy: 'therapist-1', uploaderRole: 'THERAPIST', therapistId: 'therapist-1',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-03', checksum: '112233445566',
        isEncrypted: true, status: 'APPROVED', reviewedBy: 'user-admin-1',
        reviewedAt: new Date('2024-01-14'), expiresAt: new Date('2025-01-01'),
        version: 1, retentionDays: 2555,
      },

      // Therapist 2 — approved
      {
        category: 'CREDENTIAL', documentType: 'LICENSE', fileName: 'license_david.pdf',
        originalFileName: 'license_david.pdf', mimeType: 'application/pdf', fileSize: 234567,
        uploadedBy: 'therapist-2', uploaderRole: 'THERAPIST', therapistId: 'therapist-2',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-04', checksum: 'aabbccddee',
        isEncrypted: true, status: 'APPROVED', reviewedBy: 'user-admin-1',
        reviewedAt: new Date('2024-02-01'), expiresAt: new Date('2025-12-01'),
        version: 1, retentionDays: 2555,
      },
      {
        category: 'CREDENTIAL', documentType: 'DIPLOMA', fileName: 'diploma_huji.pdf',
        originalFileName: 'diploma_huji.pdf', mimeType: 'application/pdf', fileSize: 456789,
        uploadedBy: 'therapist-2', uploaderRole: 'THERAPIST', therapistId: 'therapist-2',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-05', checksum: 'ffeeddccbb',
        isEncrypted: true, status: 'APPROVED', reviewedBy: 'user-admin-1',
        reviewedAt: new Date('2024-02-01'),
        version: 1, retentionDays: 2555,
      },

      // Therapist 6 — awaiting approval (documents pending)
      {
        category: 'CREDENTIAL', documentType: 'LICENSE', fileName: 'license_sarah.pdf',
        originalFileName: 'license_sarah.pdf', mimeType: 'application/pdf', fileSize: 278901,
        uploadedBy: 'therapist-6', uploaderRole: 'THERAPIST', therapistId: 'therapist-6',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-06', checksum: '667788990011',
        isEncrypted: true, status: 'PENDING_REVIEW',
        version: 1, retentionDays: 2555,
      },
      {
        category: 'CREDENTIAL', documentType: 'DIPLOMA', fileName: 'diploma_haifa.pdf',
        originalFileName: 'diploma_haifa.pdf', mimeType: 'application/pdf', fileSize: 389012,
        uploadedBy: 'therapist-6', uploaderRole: 'THERAPIST', therapistId: 'therapist-6',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-07', checksum: '223344556677',
        isEncrypted: true, status: 'PENDING_REVIEW',
        version: 1, retentionDays: 2555,
      },

      // Therapist 7 — pending info (missing documents)
      {
        category: 'CREDENTIAL', documentType: 'INSURANCE', fileName: 'insurance_avi.pdf',
        originalFileName: 'insurance_avi.pdf', mimeType: 'application/pdf', fileSize: 167890,
        uploadedBy: 'therapist-7', uploaderRole: 'THERAPIST', therapistId: 'therapist-7',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-08', checksum: '889900112233',
        isEncrypted: true, status: 'PENDING_REVIEW', reviewNotes: 'Waiting for license and diploma',
        version: 1, retentionDays: 2555,
      },

      // A clinical document example
      {
        category: 'CLINICAL', documentType: 'SESSION_NOTES', fileName: 'session5_notes_scan.pdf',
        originalFileName: 'session5_notes_scan.pdf', mimeType: 'application/pdf', fileSize: 892345,
        uploadedBy: 'therapist-1', uploaderRole: 'THERAPIST', therapistId: 'therapist-1',
        patientId: 'patient-1', sessionId: 'session-5',
        securityLevel: 'HIGHLY_SENSITIVE', encryptionKeyId: 'kms-seed-09', checksum: '445566778899',
        isEncrypted: true, status: 'APPROVED', reviewedBy: 'therapist-1',
        reviewedAt: new Date('2024-02-07'),
        version: 1, retentionDays: 2555,
      },

      // A consent document example
      {
        category: 'CONSENT', documentType: 'INFORMED_CONSENT', fileName: 'consent_patient1.pdf',
        originalFileName: 'informed_consent_signed.pdf', mimeType: 'application/pdf', fileSize: 345678,
        uploadedBy: 'therapist-1', uploaderRole: 'THERAPIST', therapistId: 'therapist-1',
        patientId: 'patient-1',
        securityLevel: 'SENSITIVE', encryptionKeyId: 'kms-seed-10', checksum: 'aabb11223344',
        isEncrypted: true, status: 'APPROVED', reviewedBy: 'therapist-1',
        reviewedAt: new Date('2024-01-20'),
        version: 1, retentionDays: 2555,
      },
    ];

    seedDocs.forEach((doc, i) => {
      const stored: StoredDocument = {
        ...doc,
        id: `doc-seed-${i + 1}`,
        uploadedAt: doc.reviewedAt ? new Date(doc.reviewedAt.getTime() - 2 * 24 * 60 * 60 * 1000) : new Date(),
        updatedAt: doc.reviewedAt ?? new Date(),
      };
      this.documents.set(stored.id, stored);
    });

    // Seed some audit entries
    this.logAudit('doc-seed-1', 'UPLOAD', 'therapist-1', 'THERAPIST', 'Uploaded license_rachel_cohen.pdf');
    this.logAudit('doc-seed-1', 'APPROVE', 'user-admin-1', 'ADMIN', 'License verified');
  }
}

// =============================================================================
// SINGLETON (survives Next.js HMR)
// =============================================================================

const g = globalThis as unknown as { __documentStorage?: DocumentStorageService };
export const documentStorage = g.__documentStorage ?? (g.__documentStorage = new DocumentStorageService());
