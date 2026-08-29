'use client';

import { useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/cn';

// Icons
const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// X-Factor dimension labels
const xFactorLabels: Record<string, string> = {
  openness: 'Openness to new approaches',
  emotionalIntensity: 'Emotional intensity',
  structurePreference: 'Structure preference',
  relationshipStyle: 'Relationship style',
  communicationStyle: 'Communication style',
  changeReadiness: 'Readiness for change',
  sleepQuality: 'Sleep quality',
  stressLevel: 'Stress level',
  emotionalLoad: 'Emotional load',
};

// Health fund labels
const healthFundLabels: Record<string, string> = {
  MACCABI: 'Maccabi',
  CLALIT: 'Clalit',
  MEUHEDET: 'Meuhedet',
  LEUMIT: 'Leumit',
  PRIVATE: 'Private',
};

// Day labels
const dayLabels: Record<string, string> = {
  SUNDAY: 'Sunday',
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
};

interface PatientProfileModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientProfileModal({ patientId, isOpen, onClose }: PatientProfileModalProps) {
  const { data: patient, isLoading, error } = trpc.therapist.getPatientProfile.useQuery(
    { patientId },
    { enabled: isOpen && !!patientId }
  );

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-profile-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-calm-600 to-trust-600 text-white px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 id="patient-profile-title" className="text-xl font-bold">
              Patient Profile
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-calm-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>Error loading patient details</p>
            </div>
          ) : patient ? (
            <div className="space-y-6">
              {/* Basic Info Section */}
              <section className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-calm-100 to-trust-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-calm-700">
                      {patient.firstName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MailIcon className="w-4 h-4" />
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{patient.city}</span>
                      </div>
                    </div>
                  </div>
                  {/* Session stats */}
                  <div className="text-left">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-calm-600">{patient.sessionHistory.total}</div>
                      <div className="text-xs text-gray-500">Total sessions</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Preferences Section */}
              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-calm-500 rounded-full" />
                  Treatment Preferences
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Health fund</div>
                    <div className="font-medium text-gray-900">
                      {healthFundLabels[patient.preferences.healthFund] || patient.preferences.healthFund}
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Session Format</div>
                    <div className="font-medium text-gray-900">
                      {patient.preferences.preferredOnline ? 'Online' : 'In-Person'}
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Gender Preference</div>
                    <div className="font-medium text-gray-900">
                      {patient.preferences.preferredGender === 'female' ? 'Female' :
                       patient.preferences.preferredGender === 'male' ? 'Male' : 'No Preference'}
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-3 col-span-2 md:col-span-3">
                    <div className="text-xs text-gray-500 mb-1">Preferred Days</div>
                    <div className="flex flex-wrap gap-2">
                      {patient.preferences.preferredDays.map((day) => (
                        <span key={day} className="px-2 py-1 bg-calm-100 text-calm-700 text-sm rounded">
                          {dayLabels[day] || day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* X-Factor Profile Section */}
              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-trust-500 rounded-full" />
                  X-Factor Profile
                </h4>
                <div className="bg-gradient-to-br from-trust-50 to-calm-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    These scores are based on the matching questionnaire and are used to calculate the therapeutic match quality.
                  </p>
                  <div className="space-y-3">
                    {Object.entries(patient.xFactorProfile)
                      .filter(([key]) => key !== 'calculatedAt' && xFactorLabels[key])
                      .map(([key, value]) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <div className="w-32 text-sm text-gray-600 flex-shrink-0">
                              {xFactorLabels[key]}
                            </div>
                            <div className="flex-1">
                              <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all',
                                    numValue >= 70 ? 'bg-green-500' :
                                    numValue >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                  )}
                                  style={{ width: `${numValue}%` }}
                                />
                              </div>
                            </div>
                            <div className="w-12 text-left text-sm font-medium text-gray-700">
                              {typeof value === 'number' ? `${value}%` : '-'}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-left">
                    Last updated: {new Date(patient.xFactorProfile.calculatedAt).toLocaleDateString('en-US')}
                  </p>
                </div>
              </section>

              {/* Match Data Section */}
              {patient.matchData && (
                <section>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-green-500 rounded-full" />
                    Match Data
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700 font-medium">Overall Match Score</span>
                      <span className="text-3xl font-bold text-green-600">{patient.matchData.overallScore}%</span>
                    </div>
                    <p className="text-sm text-gray-600 bg-white rounded-lg p-3">
                      {patient.matchData.explanationHe}
                    </p>
                    {/* Score breakdown */}
                    {patient.matchData.scoreBreakdown && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {Object.entries(patient.matchData.scoreBreakdown).map(([key, data]: [string, any]) => (
                          <div key={key} className="bg-white rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500 capitalize">{key}</div>
                            <div className="text-lg font-bold text-gray-800">{data.score}%</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Session History Section */}
              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                  Session History
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{patient.sessionHistory.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{patient.sessionHistory.completed}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{patient.sessionHistory.upcoming}</div>
                    <div className="text-xs text-gray-500">Upcoming</div>
                  </div>
                  <div className="bg-white border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{patient.sessionHistory.pending}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                </div>
              </section>

              {/* Status Indicators */}
              <section className="flex flex-wrap gap-3">
                <div className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium',
                  patient.questionnaireCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                )}>
                  {patient.questionnaireCompleted ? '✓ Questionnaire Completed' : '⏳ Questionnaire Not Completed'}
                </div>
                <div className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium',
                  patient.onboardingCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                )}>
                  {patient.onboardingCompleted ? '✓ Onboarding Completed' : '⏳ Onboarding Not Completed'}
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No Patient Details Found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            type="button"
            className="px-4 py-2 text-white bg-calm-600 rounded-lg hover:bg-calm-700 transition-colors font-medium"
            onClick={() => {
              // Would open messaging with this patient
              onClose();
            }}
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
