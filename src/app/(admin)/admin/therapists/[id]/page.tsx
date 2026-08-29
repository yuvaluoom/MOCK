'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

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

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  PENDING_INFO: { label: 'Missing Info', badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Approved', badgeClass: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Rejected', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  SUSPENDED: { label: 'Suspended', badgeClass: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export default function TherapistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { data: therapist, isLoading } = trpc.admin.getTherapistApplication.useQuery({
    therapistId: id,
  });

  const approveMutation = trpc.admin.approveTherapist.useMutation({
    onSuccess: () => {
      utils.admin.getTherapistApplication.invalidate();
      router.push('/admin/therapists');
    },
  });

  const rejectMutation = trpc.admin.rejectTherapist.useMutation({
    onSuccess: () => {
      utils.admin.getTherapistApplication.invalidate();
      setShowRejectModal(false);
      setRejectReason('');
      router.push('/admin/therapists');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Therapist not found</p>
        <button onClick={() => router.push('/admin/therapists')} className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium">
          Back to Therapists
        </button>
      </div>
    );
  }

  const status = statusConfig[therapist.approvalStatus] ?? { label: therapist.approvalStatus, badgeClass: 'bg-gray-50 text-gray-600 border-gray-200' };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <BackIcon />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {therapist.firstName} {therapist.lastName}
          </h1>
          <p className="text-gray-500">Therapist Application Review</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${status.badgeClass}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-gray-900 font-medium">{therapist.firstName} {therapist.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-gray-900 capitalize">{therapist.gender?.toLowerCase() || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{therapist.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{therapist.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-gray-900">{therapist.city || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">License Number</p>
                <p className="text-gray-900 font-mono">{therapist.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Years of Experience</p>
                <p className="text-gray-900">{therapist.yearsOfExperience} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Price</p>
                <p className="text-gray-900">{therapist.sessionPrice > 0 ? `₪${therapist.sessionPrice}` : 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Duration</p>
                <p className="text-gray-900">{therapist.sessionDuration} minutes</p>
              </div>
            </div>

            {therapist.approaches.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Therapeutic Approaches</p>
                <div className="flex flex-wrap gap-2">
                  {therapist.approaches.map((approach: string) => (
                    <span key={approach} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                      {approach}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {therapist.specializations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {therapist.specializations.map((spec: string) => (
                    <span key={spec} className="px-3 py-1 text-sm bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {therapist.acceptedHealthFunds.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Accepted Health Funds</p>
                <div className="flex flex-wrap gap-2">
                  {therapist.acceptedHealthFunds.map((fund: string) => (
                    <span key={fund} className="px-3 py-1 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg">
                      {fund}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {therapist.languages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {therapist.languages.map((lang: string) => (
                    <span key={lang} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-200 rounded-lg">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          {therapist.bio && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bio</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{therapist.bio}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {therapist.approvalStatus === 'AWAITING_APPROVAL' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => approveMutation.mutate({ therapistId: id })}
                  disabled={approveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckIcon />
                  {approveMutation.isPending ? 'Approving...' : 'Approve Therapist'}
                </button>
                <button
                  onClick={() => { setShowRejectModal(true); setRejectReason(''); }}
                  disabled={rejectMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XIcon />
                  Reject Application
                </button>
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
            <div className="space-y-3">
              {therapist.availability?.length > 0 ? (
                therapist.availability.map((slot: { dayOfWeek: string; startTime: string; endTime: string; isOnline: boolean; isInPerson: boolean }, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{slot.dayOfWeek}</p>
                      <p className="text-xs text-gray-500">{slot.startTime} - {slot.endTime}</p>
                    </div>
                    <div className="flex gap-1">
                      {slot.isOnline && (
                        <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded">Online</span>
                      )}
                      {slot.isInPerson && (
                        <span className="px-2 py-0.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded">In-person</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No availability set</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
            {therapist.documents?.length > 0 ? (
              <div className="space-y-3">
                {therapist.documents.map((doc: { id: string; documentType: string; status: string; fileName?: string; fileUrl?: string }) => (
                  <div key={doc.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{doc.documentType}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${
                        doc.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        doc.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    {doc.fileName && (
                      <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                    )}
                    {doc.status === 'PENDING' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => showToast('Document approved')}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => showToast('Document rejected')}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400 text-sm">No documents uploaded</p>
                <p className="text-gray-400 text-xs mt-1">Therapist needs to upload verification documents</p>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID</span>
                <span className="text-gray-900 font-mono text-xs">{therapist.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Registered</span>
                <span className="text-gray-900">
                  {new Date(therapist.registeredAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Profile Complete</span>
                <span className={therapist.profileCompleted ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                  {therapist.profileCompleted ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
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
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate({ therapistId: id, reason: rejectReason })}
                disabled={rejectReason.length < 10 || rejectMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
