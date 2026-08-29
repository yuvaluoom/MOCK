'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

type ApprovalStatus = 'PENDING_INFO' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

const statusConfig: Record<ApprovalStatus, {
  label: string;
  badgeClass: string;
  cardBorder: string;
  icon: string;
}> = {
  PENDING_INFO: {
    label: 'Missing Info',
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    cardBorder: 'border-yellow-200 bg-yellow-50/50',
    icon: '📋',
  },
  AWAITING_APPROVAL: {
    label: 'Awaiting Approval',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    cardBorder: 'border-amber-200 bg-amber-50/50',
    icon: '⏳',
  },
  APPROVED: {
    label: 'Approved',
    badgeClass: 'bg-green-50 text-green-700 border-green-200',
    cardBorder: 'border-green-200 bg-green-50/50',
    icon: '✅',
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    cardBorder: 'border-red-200 bg-red-50/50',
    icon: '❌',
  },
  SUSPENDED: {
    label: 'Suspended',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    cardBorder: 'border-gray-200 bg-gray-50',
    icon: '⛔',
  },
};

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

function ProfileCompletenessBar({ percentage }: { percentage: number }) {
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8">{percentage}%</span>
    </div>
  );
}

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

  const { data, isLoading, refetch } = trpc.admin.getTherapistApplications.useQuery({
    status: statusFilter,
    search: searchQuery || undefined,
    page,
    limit: 10,
  });

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

  const handleApprove = async (therapistId: string) => {
    await approveMutation.mutateAsync({ therapistId });
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
    await unsuspendMutation.mutateAsync({ therapistId });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapist Applications</h1>
          <p className="text-gray-500 mt-1">Review and manage therapist registrations</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          Refresh
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(['AWAITING_APPROVAL', 'PENDING_INFO', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`p-4 rounded-xl border transition-all text-left ${
              statusFilter === status
                ? statusConfig[status].cardBorder + ' ring-2 ring-offset-1 ring-gray-300'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{statusConfig[status].icon}</span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${statusConfig[status].badgeClass}`}>
                {statusCounts[status] ?? 0}
              </span>
            </div>
            <p className="text-sm text-gray-900 font-medium">{statusConfig[status].label}</p>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search by name or license..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => { setStatusFilter('ALL'); setPage(1); }}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({statusCounts['ALL'] ?? 0})
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Therapist</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">License</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Queue</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                    <p className="text-gray-400 mt-2 text-sm">Loading...</p>
                  </td>
                </tr>
              ) : data?.applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-900 font-medium">No applications found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                data?.applications.map((therapist) => {
                  const status = therapist.approvalStatus as ApprovalStatus;
                  const isUrgent = therapist.daysInQueue > 3 && status === 'AWAITING_APPROVAL';

                  return (
                    <tr key={therapist.id} className={`hover:bg-gray-50 ${isUrgent ? 'bg-red-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {therapist.photoThumbnailUrl ? (
                              <img
                                src={therapist.photoThumbnailUrl}
                                alt={`${therapist.firstName} ${therapist.lastName}`}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-sm text-gray-600 font-semibold">
                                {therapist.firstName[0]}{therapist.lastName[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {therapist.title} {therapist.firstName} {therapist.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{therapist.city} &middot; {therapist.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 font-mono">{therapist.licenseNumber}</span>
                        <p className="text-xs text-gray-500">{therapist.yearsOfExperience} years exp.</p>
                      </td>

                      <td className="px-6 py-4 w-36">
                        <ProfileCompletenessBar percentage={therapist.profileCompleteness} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon />
                          <span className={`text-sm ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                            {therapist.daysInQueue}d
                          </span>
                        </div>
                        {isUrgent && <span className="text-xs text-red-500 font-medium">Urgent</span>}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${statusConfig[status]?.badgeClass}`}>
                          {statusConfig[status]?.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={`/admin/therapists/${therapist.id}`}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon />
                          </a>

                          {status === 'AWAITING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => handleApprove(therapist.id)}
                                disabled={approveMutation.isPending}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckIcon />
                              </button>
                              <button
                                onClick={() => { setSelectedTherapist(therapist.id); setShowRejectModal(true); }}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XIcon />
                              </button>
                              <button
                                onClick={() => { setSelectedTherapist(therapist.id); setShowDocumentModal(true); }}
                                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Request Documents"
                              >
                                <FileIcon />
                              </button>
                            </>
                          )}

                          {status === 'APPROVED' && (
                            <button
                              onClick={() => { setSelectedTherapist(therapist.id); setShowSuspendModal(true); }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Suspend"
                            >
                              <SuspendIcon />
                            </button>
                          )}

                          {status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleUnsuspend(therapist.id)}
                              disabled={unsuspendMutation.isPending}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Unsuspend"
                            >
                              <CheckIcon />
                            </button>
                          )}

                          {status === 'PENDING_INFO' && (
                            <button
                              onClick={() => { setSelectedTherapist(therapist.id); setShowDocumentModal(true); }}
                              className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Send Reminder"
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

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              {(page - 1) * data.pagination.limit + 1}–{Math.min(page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 px-3">
                {page} / {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Reject Application</h3>
            <p className="text-sm text-gray-500 mb-4">The therapist will be notified of this decision.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (at least 10 characters)..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedTherapist(null); }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectReason.length < 10 || rejectMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Suspend Therapist</h3>
            <p className="text-sm text-gray-500 mb-4">The therapist will be hidden from patients until unsuspended.</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension (at least 10 characters)..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowSuspendModal(false); setSuspendReason(''); setSelectedTherapist(null); }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={suspendReason.length < 10 || suspendMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {suspendMutation.isPending ? 'Processing...' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Documents Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Request Documents</h3>
            <p className="text-sm text-gray-500 mb-4">The therapist will receive a notification with your request.</p>
            <textarea
              value={documentNote}
              onChange={(e) => setDocumentNote(e.target.value)}
              placeholder="Specify which documents are required..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowDocumentModal(false); setDocumentNote(''); setSelectedTherapist(null); }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDocuments}
                disabled={documentNote.length < 5 || requestDocumentsMutation.isPending}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {requestDocumentsMutation.isPending ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
