'use client';

import { use } from 'react';
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

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const statusColors: Record<string, string> = {
  PENDING_INFO: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  AWAITING_APPROVAL: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function TherapistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

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
        <p className="text-slate-400">Therapist not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <BackIcon />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            {therapist.firstName} {therapist.lastName}
          </h1>
          <p className="text-slate-400">Therapist Application Review</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${statusColors[therapist.approvalStatus]}`}>
          {therapist.approvalStatus.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Full Name</p>
                <p className="text-white">{therapist.firstName} {therapist.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Gender</p>
                <p className="text-white capitalize">{therapist.gender?.toLowerCase() ?? 'Not specified'}</p>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white">{therapist.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon />
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-white">{therapist.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon />
                <div>
                  <p className="text-sm text-slate-400">City</p>
                  <p className="text-white">{therapist.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Professional Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">License Number</p>
                <p className="text-white font-mono">{therapist.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Years of Experience</p>
                <p className="text-white">{therapist.yearsOfExperience} years</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Session Price</p>
                <p className="text-white">₪{therapist.sessionPrice}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Session Duration</p>
                <p className="text-white">{therapist.sessionDuration} minutes</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-slate-400 mb-2">Therapeutic Approaches</p>
              <div className="flex flex-wrap gap-2">
                {therapist.approaches.map((approach: string) => (
                  <span
                    key={approach}
                    className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-lg"
                  >
                    {approach}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Specializations</p>
              <div className="flex flex-wrap gap-2">
                {therapist.specializations.map((spec: string) => (
                  <span
                    key={spec}
                    className="px-3 py-1 text-sm bg-purple-500/20 text-purple-400 rounded-lg"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Accepted Health Funds</p>
              <div className="flex flex-wrap gap-2">
                {therapist.acceptedHealthFunds.map((fund: string) => (
                  <span
                    key={fund}
                    className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-lg"
                  >
                    {fund}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {therapist.languages.map((lang: string) => (
                  <span
                    key={lang}
                    className="px-3 py-1 text-sm bg-slate-600 text-slate-300 rounded-lg"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          {therapist.bio && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Bio</h2>
              <p className="text-slate-300 whitespace-pre-wrap">{therapist.bio}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {therapist.approvalStatus === 'AWAITING_APPROVAL' && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => approveMutation.mutate({ therapistId: id })}
                  disabled={approveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckIcon />
                  Approve Therapist
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) {
                      rejectMutation.mutate({ therapistId: id, reason });
                    }
                  }}
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
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Availability</h2>
            <div className="space-y-3">
              {therapist.availability?.length > 0 ? (
                therapist.availability.map((slot: { dayOfWeek: string; startTime: string; endTime: string; isOnline: boolean; isInPerson: boolean }, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{slot.dayOfWeek}</p>
                      <p className="text-xs text-slate-400">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {slot.isOnline && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                          Online
                        </span>
                      )}
                      {slot.isInPerson && (
                        <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                          In-person
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No availability set</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Documents</h2>
            {therapist.documents?.length > 0 ? (
              <div className="space-y-3">
                {therapist.documents.map((doc: { id: string; documentType: string; status: string; fileName?: string; fileUrl?: string }) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{doc.documentType}</span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        doc.status === 'APPROVED'
                          ? 'bg-green-500/20 text-green-400'
                          : doc.status === 'REJECTED'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    {doc.fileName && (
                      <p className="text-xs text-slate-400 mb-2 truncate">{doc.fileName}</p>
                    )}
                    <div className="flex gap-2">
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </a>
                      )}
                      {doc.status === 'PENDING' && (
                        <>
                          <button
                            className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                            onClick={() => {
                              // TODO: Implement document approval
                              alert('Document approval coming soon');
                            }}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                          <button
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            onClick={() => {
                              // TODO: Implement document rejection
                              alert('Document rejection coming soon');
                            }}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <svg className="w-10 h-10 mx-auto text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400 text-sm">No documents uploaded</p>
                <p className="text-slate-500 text-xs mt-1">Therapist needs to upload verification documents</p>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">User ID</span>
                <span className="text-white font-mono text-xs">{therapist.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered</span>
                <span className="text-white">
                  {new Date(therapist.registeredAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profile Complete</span>
                <span className={therapist.profileCompleted ? 'text-green-400' : 'text-amber-400'}>
                  {therapist.profileCompleted ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
