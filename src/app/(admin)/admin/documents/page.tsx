'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  DOCUMENT_TYPE_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  type DocumentCategory,
  type DocumentStatus,
} from '@/lib/storage/types';

const statusStyles: Record<string, { bg: string; text: string }> = {
  UPLOADING: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  PENDING_REVIEW: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
  APPROVED: { bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
  REJECTED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
  REQUIRES_UPDATE: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
  EXPIRED: { bg: 'bg-gray-100 border-gray-300', text: 'text-gray-600' },
  ARCHIVED: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500' },
};

const securityBadge: Record<string, { bg: string; text: string; label: string }> = {
  STANDARD: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Standard' },
  SENSITIVE: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Sensitive' },
  HIGHLY_SENSITIVE: { bg: 'bg-red-50', text: 'text-red-700', label: 'PHI' },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ViewMode = 'documents' | 'audit' | 'expiry';

export default function AdminDocumentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('documents');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ id: string; action: 'approve' | 'reject' | 'requestUpdate' } | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { data: docsData, refetch: refetchDocs } = trpc.documents.adminListDocuments.useQuery({
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
    page,
    limit: 15,
  });

  const { data: stats } = trpc.documents.adminGetStats.useQuery();
  const { data: expiryData } = trpc.documents.adminGetExpiring.useQuery({ withinDays: 60 });
  const { data: auditData } = trpc.documents.adminGetAuditLog.useQuery({ limit: 50 });
  const { data: docDetail } = trpc.documents.getDocument.useQuery(
    { documentId: selectedDoc! },
    { enabled: !!selectedDoc }
  );

  const approveMutation = trpc.documents.adminApproveDocument.useMutation({
    onSuccess: () => { showToast('Document approved'); setReviewModal(null); refetchDocs(); },
  });
  const rejectMutation = trpc.documents.adminRejectDocument.useMutation({
    onSuccess: () => { showToast('Document rejected'); setReviewModal(null); setReviewReason(''); refetchDocs(); },
  });
  const requestUpdateMutation = trpc.documents.adminRequestUpdate.useMutation({
    onSuccess: () => { showToast('Update requested'); setReviewModal(null); setReviewReason(''); refetchDocs(); },
  });

  const handleReviewSubmit = () => {
    if (!reviewModal) return;
    if (reviewModal.action === 'approve') {
      approveMutation.mutate({ documentId: reviewModal.id, notes: reviewReason || undefined });
    } else if (reviewModal.action === 'reject') {
      if (!reviewReason.trim()) return;
      rejectMutation.mutate({ documentId: reviewModal.id, reason: reviewReason });
    } else {
      if (!reviewReason.trim()) return;
      requestUpdateMutation.mutate({ documentId: reviewModal.id, reason: reviewReason });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Center</h1>
        <p className="text-gray-500 mt-1">Manage, review, and audit all platform documents</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Documents</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
            <p className="text-2xl font-bold text-yellow-700">{stats.pendingReview}</p>
            <p className="text-xs text-yellow-600">Pending Review</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <p className="text-2xl font-bold text-green-700">{stats.byStatus['APPROVED'] ?? 0}</p>
            <p className="text-xs text-green-600">Approved</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
            <p className="text-2xl font-bold text-orange-700">{stats.expiringSoon}</p>
            <p className="text-xs text-orange-600">Expiring Soon</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</p>
            <p className="text-xs text-gray-500">Total Storage</p>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'documents' as ViewMode, label: 'All Documents' },
          { id: 'audit' as ViewMode, label: 'Audit Trail' },
          { id: 'expiry' as ViewMode, label: 'Expiry Monitor' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DOCUMENTS VIEW */}
      {viewMode === 'documents' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value as DocumentCategory | ''); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-calm-500"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as DocumentStatus | ''); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-calm-500"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Document</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Security</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Uploaded</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {docsData?.documents.map(doc => {
                    const status = statusStyles[doc.status];
                    const security = securityBadge[doc.securityLevel];
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              {doc.mimeType === 'application/pdf' ? (
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9h4v1h-4v-1zm0 2h4v1h-4v-1zm-2-2h1v1H8v-1zm0 2h1v1H8v-1z"/></svg>
                              ) : (
                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">{doc.fileName}</p>
                              <p className="text-xs text-gray-500">{DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType} &bull; {formatBytes(doc.fileSize)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">{CATEGORY_LABELS[doc.category as DocumentCategory] ?? doc.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">{doc.therapistId ?? doc.patientId ?? doc.uploadedBy}</span>
                        </td>
                        <td className="px-4 py-3">
                          {security && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${security.bg} ${security.text}`}>
                              {security.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {status && (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.text}`}>
                              {STATUS_LABELS[doc.status as DocumentStatus] ?? doc.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString('en-US')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="View details"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {doc.status === 'PENDING_REVIEW' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setReviewModal({ id: doc.id, action: 'approve' })}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  title="Approve"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReviewModal({ id: doc.id, action: 'reject' })}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  title="Reject"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {docsData && docsData.pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {((page - 1) * docsData.pagination.limit) + 1}-{Math.min(page * docsData.pagination.limit, docsData.pagination.total)} of {docsData.pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= docsData.pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Document Detail Panel */}
          {selectedDoc && docDetail && (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Document Details</h3>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">File Name</p>
                  <p className="font-medium text-gray-900">{docDetail.fileName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{CATEGORY_LABELS[docDetail.category as DocumentCategory]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium text-gray-900">{DOCUMENT_TYPE_LABELS[docDetail.documentType] ?? docDetail.documentType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Size</p>
                  <p className="font-medium text-gray-900">{formatBytes(docDetail.fileSize)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Security Level</p>
                  <p className="font-medium text-gray-900">{docDetail.securityLevel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Encrypted</p>
                  <p className="font-medium text-green-700">{docDetail.isEncrypted ? 'AES-256' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Checksum (SHA-256)</p>
                  <p className="font-mono text-xs text-gray-700 truncate">{docDetail.checksum}</p>
                </div>
                <div>
                  <p className="text-gray-500">Version</p>
                  <p className="font-medium text-gray-900">v{docDetail.version}</p>
                </div>
                {docDetail.therapistId && (
                  <div>
                    <p className="text-gray-500">Therapist ID</p>
                    <p className="font-medium text-gray-900">{docDetail.therapistId}</p>
                  </div>
                )}
                {docDetail.expiresAt && (
                  <div>
                    <p className="text-gray-500">Expires</p>
                    <p className={`font-medium ${new Date(docDetail.expiresAt) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(docDetail.expiresAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                )}
                {docDetail.reviewedBy && (
                  <div>
                    <p className="text-gray-500">Reviewed By</p>
                    <p className="font-medium text-gray-900">{docDetail.reviewedBy}</p>
                  </div>
                )}
                {docDetail.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Rejection Reason</p>
                    <p className="font-medium text-red-700">{docDetail.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Review actions for pending documents */}
              {docDetail.status === 'PENDING_REVIEW' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setReviewModal({ id: docDetail.id, action: 'approve' })}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModal({ id: docDetail.id, action: 'reject' })}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModal({ id: docDetail.id, action: 'requestUpdate' })}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Request Update
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AUDIT TRAIL VIEW */}
      {viewMode === 'audit' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900">Document Audit Trail</h3>
            <p className="text-xs text-gray-500 mt-1">Complete log of all document operations — tamper-proof and immutable</p>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {auditData?.map(entry => (
              <div key={entry.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  entry.action === 'UPLOAD' ? 'bg-blue-100 text-blue-600' :
                  entry.action === 'APPROVE' ? 'bg-green-100 text-green-600' :
                  entry.action === 'REJECT' ? 'bg-red-100 text-red-600' :
                  entry.action === 'VIEW' ? 'bg-gray-100 text-gray-600' :
                  entry.action === 'DOWNLOAD' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <span className="text-xs font-bold">
                    {entry.action === 'UPLOAD' ? '↑' :
                     entry.action === 'APPROVE' ? '✓' :
                     entry.action === 'REJECT' ? '✗' :
                     entry.action === 'VIEW' ? '👁' :
                     entry.action === 'DOWNLOAD' ? '↓' :
                     entry.action === 'DELETE' ? '🗑' :
                     '•'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{entry.action}</span>
                    <span className="text-xs text-gray-500">by {entry.performedBy} ({entry.performedByRole})</span>
                  </div>
                  {entry.details && (
                    <p className="text-sm text-gray-600 mt-0.5">{entry.details}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(entry.timestamp).toLocaleString('en-US')} &bull; IP: {entry.ipAddress}
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-400 flex-shrink-0">{entry.documentId}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPIRY MONITOR VIEW */}
      {viewMode === 'expiry' && (
        <div className="space-y-6">
          {/* Expired Documents */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b bg-red-50">
              <h3 className="font-medium text-red-800">Expired Documents ({expiryData?.expired.length ?? 0})</h3>
              <p className="text-xs text-red-600 mt-1">These documents have passed their expiry date and require renewal</p>
            </div>
            {expiryData?.expired.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">No expired documents</div>
            ) : (
              <div className="divide-y">
                {expiryData?.expired.map(doc => (
                  <div key={doc.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{DOCUMENT_TYPE_LABELS[doc.documentType]} &bull; {doc.therapistId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        Expired {doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString('en-US') : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiring Soon */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b bg-orange-50">
              <h3 className="font-medium text-orange-800">Expiring Within 60 Days ({expiryData?.expiring.length ?? 0})</h3>
              <p className="text-xs text-orange-600 mt-1">Therapists should be notified to renew these documents</p>
            </div>
            {expiryData?.expiring.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">No documents expiring soon</div>
            ) : (
              <div className="divide-y">
                {expiryData?.expiring.map(doc => (
                  <div key={doc.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{DOCUMENT_TYPE_LABELS[doc.documentType]} &bull; {doc.therapistId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        Expires {doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString('en-US') : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">
              {reviewModal.action === 'approve' ? 'Approve Document' :
               reviewModal.action === 'reject' ? 'Reject Document' :
               'Request Document Update'}
            </h3>

            {reviewModal.action !== 'approve' ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {reviewModal.action === 'reject' ? 'Rejection Reason' : 'Update Reason'}
                </label>
                <textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  rows={3}
                  placeholder={reviewModal.action === 'reject'
                    ? 'Explain why this document was rejected...'
                    : 'Explain what needs to be updated...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-calm-500"
                />
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                This will mark the document as approved and verified. The therapist will be notified.
              </p>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => { setReviewModal(null); setReviewReason(''); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={reviewModal.action !== 'approve' && !reviewReason.trim()}
                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 ${
                  reviewModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  reviewModal.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {reviewModal.action === 'approve' ? 'Approve' :
                 reviewModal.action === 'reject' ? 'Reject' :
                 'Request Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
