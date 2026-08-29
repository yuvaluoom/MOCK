'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDownload } from '@/components/sessions/CalendarDownload';
import { trpc } from '@/lib/trpc/client';

type TabKey = 'upcoming' | 'pending' | 'past';

const tabs: { key: TabKey; label: string; status?: string; upcoming?: boolean }[] = [
  { key: 'upcoming', label: 'Upcoming', upcoming: true },
  { key: 'pending', label: 'Pending Approval', status: 'PENDING_THERAPIST_APPROVAL' },
  { key: 'past', label: 'History', status: 'COMPLETED' },
];

function fmt(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

function statusBadge(s: string) {
  const map: Record<string, { t: string; c: string }> = {
    APPROVED: { t: 'Approved', c: 'bg-green-100 text-green-700' },
    PENDING_THERAPIST_APPROVAL: { t: 'Pending', c: 'bg-amber-100 text-amber-700' },
    COMPLETED: { t: 'Completed', c: 'bg-gray-100 text-gray-600' },
    CANCELLED_BY_PATIENT: { t: 'Cancelled', c: 'bg-red-100 text-red-700' },
    CANCELLED_BY_THERAPIST: { t: 'Cancelled', c: 'bg-red-100 text-red-700' },
  };
  const v = map[s] ?? { t: s, c: 'bg-gray-100 text-gray-600' };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${v.c}`}>{v.t}</span>;
}

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const tab = tabs.find((t) => t.key === activeTab)!;
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.patient.getSessions.useQuery({
    status: tab.status as any,
    upcoming: tab.upcoming,
    page: 1,
    limit: 20,
  });

  const cancelMutation = trpc.session.cancelSessionAsPatient.useMutation({
    onSuccess: () => {
      setCancelSuccess(cancellingSessionId);
      setCancellingSessionId(null);
      setCancelReason('');
      utils.patient.getSessions.invalidate();
    },
  });

  const handleCancelClick = (sessionId: string) => {
    setCancellingSessionId(sessionId);
    setCancelReason('');
    setCancelSuccess(null);
    cancelMutation.reset();
  };

  const handleConfirmCancel = () => {
    if (!cancellingSessionId) return;
    cancelMutation.mutate({
      sessionId: cancellingSessionId,
      ...(cancelReason.trim() ? { reason: cancelReason.trim() } : {}),
    });
  };

  const sessions = data?.sessions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        <p className="text-gray-600 mt-1">Manage your sessions with therapists</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.key
                ? 'border-calm-600 text-calm-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Session list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600"></div>
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>No sessions to display</p>
              <Link href="/matches">
                <Button variant="calm" size="sm" className="mt-4">Find a Therapist</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          sessions.map((s) => (
            <Card key={s.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-calm-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-calm-700 font-medium">
                      {s.therapist?.firstName?.charAt(0) ?? 'T'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {s.therapist?.firstName} {s.therapist?.lastName}
                      </p>
                      {statusBadge(s.status)}
                    </div>
                    <p className="text-sm text-gray-500">{s.therapist?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {fmt(s.scheduledAt)} · {s.isOnline ? 'Online' : 'In-Person'}
                    </p>
                  </div>
                  {s.status === 'APPROVED' && (
                    <div className="flex items-center gap-2">
                      <CalendarDownload
                        sessionId={s.id}
                        scheduledAt={s.scheduledAt}
                        duration={s.duration ?? 50}
                        therapistName={`${s.therapist?.firstName ?? ''} ${s.therapist?.lastName ?? ''}`}
                        isOnline={s.isOnline}
                        meetingUrl={s.meetingUrl ?? undefined}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleCancelClick(s.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {s.status === 'PENDING_THERAPIST_APPROVAL' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleCancelClick(s.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>

                {/* Cancel confirmation inline */}
                {cancellingSessionId === s.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-red-800">
                      Are you sure you want to cancel this session?
                    </p>
                    <div>
                      <label htmlFor={`cancel-reason-${s.id}`} className="block text-sm text-gray-600 mb-1">
                        Reason (optional)
                      </label>
                      <textarea
                        id={`cancel-reason-${s.id}`}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Let the therapist know why you need to cancel..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 resize-none"
                      />
                    </div>
                    {cancelMutation.error && (
                      <p className="text-sm text-red-700">
                        {cancelMutation.error.message || 'Failed to cancel session. Please try again.'}
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCancellingSessionId(null);
                          setCancelReason('');
                          cancelMutation.reset();
                        }}
                      >
                        Keep Session
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleConfirmCancel}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Cancellation success message */}
                {cancelSuccess === s.id && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-800 font-medium">
                      Session cancelled successfully.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
