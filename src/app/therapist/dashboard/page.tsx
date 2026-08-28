'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { PatientProfileModal } from '@/components/PatientProfileModal';

// Icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function TherapistDashboardPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = trpc.therapist.getDashboardStats.useQuery();

  // Fetch pending patient requests
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = trpc.therapist.getPatientRequests.useQuery({
    status: 'PENDING',
    page: 1,
    limit: 5,
  });

  // Mutations for approve/decline
  const approveRequestMutation = trpc.therapist.approvePatientRequest.useMutation({
    onSuccess: () => refetchRequests(),
  });

  const declineRequestMutation = trpc.therapist.declinePatientRequest.useMutation({
    onSuccess: () => refetchRequests(),
  });

  const handleApprove = (requestId: string) => {
    approveRequestMutation.mutate({ requestId });
  };

  const handleDecline = (requestId: string) => {
    declineRequestMutation.mutate({ requestId, reason: 'לא זמין כרגע' });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">שלום, ד״ר רונית שפירא</h1>
        <p className="text-gray-600 mt-1">לוח הבקרה שלך</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-calm-100 flex items-center justify-center text-calm-600">
                <CalendarIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : stats?.todaySessions ?? 0}
                </p>
                <p className="text-sm text-gray-500">פגישות היום</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <ClockIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : stats?.pendingRequests ?? 0}
                </p>
                <p className="text-sm text-gray-500">בקשות ממתינות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <MessageIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : stats?.unreadMessages ?? 0}
                </p>
                <p className="text-sm text-gray-500">הודעות חדשות</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <UsersIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : stats?.totalPatients ?? 0}
                </p>
                <p className="text-sm text-gray-500">מטופלים פעילים</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon />
                פגישות היום
              </CardTitle>
              <Link
                href="/therapist/sessions"
                className="text-sm text-calm-600 hover:text-calm-700 font-medium"
              >
                הכל →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {statsLoading ? (
              <div className="p-6 text-center text-gray-500">טוען...</div>
            ) : stats?.upcomingSessions && stats.upcomingSessions.length > 0 ? (
              <ul className="divide-y">
                {stats.upcomingSessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-calm-100 flex items-center justify-center">
                        <span className="text-calm-700 font-medium">
                          {session.patientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{session.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {session.time} • {session.type === 'online' ? 'מקוון' : 'פרונטלי'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.type === 'online' && (
                        <Button size="sm" variant="calm">הצטרף</Button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedPatientId('patient-1')}
                        className="p-2 text-gray-500 hover:text-calm-600 hover:bg-calm-50 rounded-lg transition-colors"
                        title="צפייה בפרופיל"
                      >
                        <EyeIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <CalendarIcon />
                <p className="mt-2">אין פגישות מתוכננות להיום</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Patient Requests */}
        <Card>
          <CardHeader className="border-b bg-amber-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                <ClockIcon />
                בקשות ממתינות לאישור
              </CardTitle>
              <Link
                href="/therapist/sessions?tab=pending"
                className="text-sm text-amber-700 hover:text-amber-800 font-medium"
              >
                הכל →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {requestsLoading ? (
              <div className="p-6 text-center text-gray-500">טוען...</div>
            ) : requestsData?.requests && requestsData.requests.length > 0 ? (
              <ul className="divide-y">
                {requestsData.requests.map((request) => (
                  <li
                    key={request.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-700 font-medium">
                            {request.patient.firstName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.patient.firstName} {request.patient.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.patient.city} • {request.patient.healthFund}
                          </p>
                          {request.session && (
                            <p className="text-sm text-gray-600 mt-1">
                              פגישה מבוקשת: {new Date(request.session.scheduledAt).toLocaleDateString('he-IL')}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            נשלח: {new Date(request.createdAt).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPatientId(request.patientId)}
                          className="text-xs text-calm-600 hover:text-calm-700 font-medium"
                        >
                          צפייה בפרופיל
                        </button>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="calm"
                            className="flex items-center gap-1"
                            onClick={() => handleApprove(request.id)}
                            disabled={approveRequestMutation.isPending}
                          >
                            <CheckIcon />
                            אשר
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDecline(request.id)}
                            disabled={declineRequestMutation.isPending}
                          >
                            <XIcon />
                            דחה
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <CheckIcon />
                <p className="mt-2">אין בקשות ממתינות</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">פעולות מהירות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/therapist/sessions"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 border rounded-lg hover:border-calm-300 hover:bg-calm-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-calm-100 flex items-center justify-center text-calm-600">
                <CalendarIcon />
              </div>
              <span className="text-sm font-medium text-gray-700">ניהול פגישות</span>
            </Link>
            <Link
              href="/therapist/patients"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 border rounded-lg hover:border-calm-300 hover:bg-calm-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <UsersIcon />
              </div>
              <span className="text-sm font-medium text-gray-700">המטופלים שלי</span>
            </Link>
            <Link
              href="/therapist/messages"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 border rounded-lg hover:border-calm-300 hover:bg-calm-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <MessageIcon />
              </div>
              <span className="text-sm font-medium text-gray-700">הודעות</span>
            </Link>
            <Link
              href="/therapist/schedule"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 border rounded-lg hover:border-calm-300 hover:bg-calm-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <ClockIcon />
              </div>
              <span className="text-sm font-medium text-gray-700">ניהול זמינות</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Patient Profile Modal */}
      {selectedPatientId && (
        <PatientProfileModal
          patientId={selectedPatientId}
          isOpen={!!selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
}
