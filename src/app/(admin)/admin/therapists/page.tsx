'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

// =============================================================================
// TYPES
// =============================================================================

type ApprovalStatus = 'PENDING_INFO' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

// =============================================================================
// CONFIGURATION - Hebrew & English
// =============================================================================

const statusConfig: Record<ApprovalStatus, {
  label: string;
  labelHe: string;
  color: string;
  icon: string;
  bgColor: string;
}> = {
  PENDING_INFO: {
    label: 'Missing Info',
    labelHe: 'חסרים פרטים',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bgColor: 'bg-yellow-500',
    icon: '📋',
  },
  AWAITING_APPROVAL: {
    label: 'Awaiting Approval',
    labelHe: 'ממתין לאישור',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    bgColor: 'bg-amber-500',
    icon: '⏳',
  },
  APPROVED: {
    label: 'Approved',
    labelHe: 'מאושר',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    bgColor: 'bg-green-500',
    icon: '✅',
  },
  REJECTED: {
    label: 'Rejected',
    labelHe: 'נדחה',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    bgColor: 'bg-red-500',
    icon: '❌',
  },
  SUSPENDED: {
    label: 'Suspended',
    labelHe: 'מושעה',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    bgColor: 'bg-slate-500',
    icon: '⛔',
  },
};

// =============================================================================
// ICONS
// =============================================================================

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SuspendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93 19.07 19.07" />
  </svg>
);

// =============================================================================
// PROFILE COMPLETENESS BAR
// =============================================================================

function ProfileCompletenessBar({ percentage }: { percentage: number }) {
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8">{percentage}%</span>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TherapistApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'ALL'>('AWAITING_APPROVAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [documentNote, setDocumentNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const { data, isLoading, refetch } = trpc.admin.getTherapistApplications.useQuery({
    status: statusFilter,
    search: searchQuery || undefined,
    page,
    limit: 10,
  });

  // Mutations
  const approveMutation = trpc.admin.approveTherapist.useMutation({
    onSuccess: () => {
      utils.admin.getTherapistApplications.invalidate();
      utils.admin.getDashboardStats.invalidate();
    },
  });

  const rejectMutation = trpc.admin.rejectTherapist.useMutation({
    onSuccess: () => {
      utils.admin.getTherapistApplications.invalidate();
      utils.admin.getDashboardStats.invalidate();
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedTherapist(null);
    },
  });

  const suspendMutation = trpc.admin.suspendTherapist.useMutation({
    onSuccess: () => {
      utils.admin.getTherapistApplications.invalidate();
      utils.admin.getDashboardStats.invalidate();
      setShowSuspendModal(false);
      setSuspendReason('');
      setSelectedTherapist(null);
    },
  });

  const unsuspendMutation = trpc.admin.unsuspendTherapist.useMutation({
    onSuccess: () => {
      utils.admin.getTherapistApplications.invalidate();
      utils.admin.getDashboardStats.invalidate();
    },
  });

  const requestDocumentsMutation = trpc.admin.requestDocuments.useMutation({
    onSuccess: () => {
      utils.admin.getTherapistApplications.invalidate();
      setShowDocumentModal(false);
      setDocumentNote('');
      setSelectedTherapist(null);
    },
  });

  // Handlers
  const handleApprove = async (therapistId: string) => {
    if (confirm('אשר מטפל זה? / Approve this therapist?')) {
      await approveMutation.mutateAsync({ therapistId });
    }
  };

  const handleReject = async () => {
    if (!selectedTherapist || rejectReason.length < 10) return;
    await rejectMutation.mutateAsync({
      therapistId: selectedTherapist,
      reason: rejectReason,
    });
  };

  const handleSuspend = async () => {
    if (!selectedTherapist || suspendReason.length < 10) return;
    await suspendMutation.mutateAsync({
      therapistId: selectedTherapist,
      reason: suspendReason,
    });
  };

  const handleUnsuspend = async (therapistId: string) => {
    if (confirm('בטל השעיה של מטפל זה? / Unsuspend this therapist?')) {
      await unsuspendMutation.mutateAsync({ therapistId });
    }
  };

  const handleRequestDocuments = async () => {
    if (!selectedTherapist || documentNote.length < 5) return;
    await requestDocumentsMutation.mutateAsync({
      therapistId: selectedTherapist,
      documentTypes: ['license', 'diploma', 'insurance'],
      note: documentNote,
    });
  };

  const statusCounts: Record<string, number> = data?.statusCounts ?? {};

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">בקשות מטפלים</h1>
          <p className="text-slate-400 mt-1">
            Therapist Applications - סקירה ואישור הרשמות מטפלים
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          🔄 רענן / Refresh
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(['AWAITING_APPROVAL', 'PENDING_INFO', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`p-4 rounded-xl border transition-all ${
              statusFilter === status
                ? 'border-amber-500 bg-slate-800'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{statusConfig[status].icon}</span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${statusConfig[status].bgColor} text-white`}>
                {statusCounts[status] ?? 0}
              </span>
            </div>
            <p className="text-sm text-white font-medium">{statusConfig[status].labelHe}</p>
            <p className="text-xs text-slate-400">{statusConfig[status].label}</p>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="חיפוש לפי שם או רישיון... / Search by name or license..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pr-10 pl-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              dir="rtl"
            />
          </div>

          {/* All Filter */}
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            הכל ({statusCounts['ALL'] ?? 0})
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">מטפל / Therapist</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">רישיון / License</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">שלמות פרופיל</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">ימים בתור</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">סטטוס</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-slate-400">פעולות / Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="text-slate-400 mt-2">טוען נתונים...</p>
                  </td>
                </tr>
              ) : data?.applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-4">✨</div>
                    <p className="text-white font-medium">אין בקשות לסקירה</p>
                    <p className="text-slate-400 text-sm mt-1">No applications to review</p>
                  </td>
                </tr>
              ) : (
                data?.applications.map((therapist) => {
                  const status = therapist.approvalStatus as ApprovalStatus;
                  const isUrgent = therapist.daysInQueue > 3 && status === 'AWAITING_APPROVAL';

                  return (
                    <tr
                      key={therapist.id}
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${
                        isUrgent ? 'bg-red-500/5' : ''
                      }`}
                    >
                      {/* Therapist Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                            {therapist.photoThumbnailUrl ? (
                              <img
                                src={therapist.photoThumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-xl text-slate-300 font-medium">
                                {therapist.firstName[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {therapist.title} {therapist.firstName} {therapist.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{therapist.city}</p>
                            <p className="text-xs text-slate-500">{therapist.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* License */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-white font-mono">{therapist.licenseNumber}</span>
                        <p className="text-xs text-slate-400">{therapist.yearsOfExperience} שנות ניסיון</p>
                      </td>

                      {/* Profile Completeness */}
                      <td className="px-6 py-4 w-40">
                        <ProfileCompletenessBar percentage={therapist.profileCompleteness} />
                      </td>

                      {/* Days in Queue */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ClockIcon />
                          <span className={`text-sm ${isUrgent ? 'text-red-400 font-bold' : 'text-white'}`}>
                            {therapist.daysInQueue} ימים
                          </span>
                        </div>
                        {isUrgent && (
                          <span className="text-xs text-red-400">⚠️ דחוף!</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${statusConfig[status]?.color}`}>
                          {statusConfig[status]?.icon} {statusConfig[status]?.labelHe}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {/* View Details */}
                          <a
                            href={`/admin/therapists/${therapist.id}`}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            title="צפה בפרטים"
                          >
                            <EyeIcon />
                          </a>

                          {/* Status-specific actions */}
                          {status === 'AWAITING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleApprove(therapist.id)}
                                disabled={approveMutation.isPending}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50"
                                title="אשר מטפל"
                              >
                                <CheckIcon />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTherapist(therapist.id);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="דחה בקשה"
                              >
                                <XIcon />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTherapist(therapist.id);
                                  setShowDocumentModal(true);
                                }}
                                className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
                                title="בקש מסמכים"
                              >
                                <FileIcon />
                              </button>
                            </>
                          )}

                          {status === 'APPROVED' && (
                            <button
                              onClick={() => {
                                setSelectedTherapist(therapist.id);
                                setShowSuspendModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="השעה מטפל"
                            >
                              <SuspendIcon />
                            </button>
                          )}

                          {status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleUnsuspend(therapist.id)}
                              disabled={unsuspendMutation.isPending}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50"
                              title="בטל השעיה"
                            >
                              <CheckIcon />
                            </button>
                          )}

                          {status === 'PENDING_INFO' && (
                            <button
                              onClick={() => {
                                setSelectedTherapist(therapist.id);
                                setShowDocumentModal(true);
                              }}
                              className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
                              title="שלח תזכורת"
                            >
                              <FileIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              מציג {(page - 1) * data.pagination.limit + 1} עד{' '}
              {Math.min(page * data.pagination.limit, data.pagination.total)} מתוך{' '}
              {data.pagination.total} בקשות
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                הבא ←
              </button>
              <span className="text-sm text-white px-4">
                עמוד {page} מתוך {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                → הקודם
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS
      ========================================================================= */}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4" dir="rtl">
            <h3 className="text-lg font-semibold text-white mb-2">❌ דחה בקשת מטפל</h3>
            <p className="text-sm text-slate-400 mb-4">Reject Therapist Application</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="סיבת הדחייה (לפחות 10 תווים)..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              dir="rtl"
            />
            <p className="text-xs text-slate-500 mt-2">
              המטפל יקבל הודעה עם סיבת הדחייה
            </p>
            <div className="flex justify-start gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={rejectReason.length < 10 || rejectMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? '...מעבד' : 'אשר דחייה'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedTherapist(null);
                }}
                className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4" dir="rtl">
            <h3 className="text-lg font-semibold text-white mb-2">⛔ השעה מטפל</h3>
            <p className="text-sm text-slate-400 mb-4">Suspend Therapist</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="סיבת ההשעיה (לפחות 10 תווים)..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              dir="rtl"
            />
            <p className="text-xs text-slate-500 mt-2">
              המטפל לא יהיה גלוי במערכת עד לביטול ההשעיה
            </p>
            <div className="flex justify-start gap-3 mt-4">
              <button
                onClick={handleSuspend}
                disabled={suspendReason.length < 10 || suspendMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {suspendMutation.isPending ? '...מעבד' : 'אשר השעיה'}
              </button>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason('');
                  setSelectedTherapist(null);
                }}
                className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Documents Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4" dir="rtl">
            <h3 className="text-lg font-semibold text-white mb-2">📋 בקש מסמכים נוספים</h3>
            <p className="text-sm text-slate-400 mb-4">Request Additional Documents</p>
            <textarea
              value={documentNote}
              onChange={(e) => setDocumentNote(e.target.value)}
              placeholder="פרט אילו מסמכים נדרשים..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              dir="rtl"
            />
            <p className="text-xs text-slate-500 mt-2">
              המטפל יקבל הודעה עם בקשת המסמכים
            </p>
            <div className="flex justify-start gap-3 mt-4">
              <button
                onClick={handleRequestDocuments}
                disabled={documentNote.length < 5 || requestDocumentsMutation.isPending}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {requestDocumentsMutation.isPending ? '...שולח' : 'שלח בקשה'}
              </button>
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setDocumentNote('');
                  setSelectedTherapist(null);
                }}
                className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
