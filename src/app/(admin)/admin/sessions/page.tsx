'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

type SessionStatus =
  | 'PENDING_THERAPIST_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED_BY_PATIENT'
  | 'CANCELLED_BY_THERAPIST'
  | 'NO_SHOW';

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_THERAPIST_APPROVAL: {
    label: 'Pending Approval',
    color: 'bg-amber-500/20 text-amber-400',
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-500/20 text-green-400',
  },
  REJECTED: {
    label: 'נDecline',
    color: 'bg-red-500/20 text-red-400',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-blue-500/20 text-blue-400',
  },
  CANCELLED_BY_PATIENT: {
    label: 'Cancelled (Patient)',
    color: 'bg-slate-500/20 text-slate-400',
  },
  CANCELLED_BY_THERAPIST: {
    label: 'Cancelled (Therapist)',
    color: 'bg-slate-500/20 text-slate-400',
  },
  NO_SHOW: {
    label: 'No Arrived',
    color: 'bg-orange-500/20 text-orange-400',
  },
};

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function SessionsOverviewPage() {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = trpc.admin.getSessionsOverview.useQuery({
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    page: 1,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Session Review</h1>
          <p className="text-slate-400 mt-1">
            ניטור וManagement All theSessions הTherapyיs בפלטפורמה
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
            <span className="text-slate-400">Total״כ: </span>
            <span className="text-white font-medium">{data?.pagination.total ?? 0}</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
            <span className="text-slate-400">Pending: </span>
            <span className="text-amber-400 font-medium">
              {data?.sessions.filter(s => s.status === 'PENDING_THERAPIST_APPROVAL').length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search לפי Name Patient or Therapist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SessionStatus | '')}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All theStatuss</option>
            <option value="PENDING_THERAPIST_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">נDecline</option>
            <option value="CANCELLED_BY_PATIENT">Cancelled (Patient)</option>
            <option value="CANCELLED_BY_THERAPIST">Cancelled (Therapist)</option>
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Session</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Patient</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Therapist</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Type</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Price</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading Sessions...
                  </td>
                </tr>
              ) : !data?.sessions.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No Foundor Sessions
                  </td>
                </tr>
              ) : (
                data.sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-sm text-white">
                            <CalendarIcon />
                            {new Date(session.scheduledAt).toLocaleDateString('he-IL')}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <ClockIcon />
                            {new Date(session.scheduledAt).toLocaleTimeString('he-IL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            ({session.duration} דק׳)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-xs font-medium">
                            {session.patient.firstName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-white">
                          {session.patient.firstName} {session.patient.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-green-400 text-xs font-medium">
                            {session.therapist.firstName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-white">
                          {(session.therapist as { title?: string }).title ? `${(session.therapist as { title?: string }).title} ` : ''}
                          {session.therapist.firstName} {session.therapist.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig[session.status]?.color ?? 'bg-slate-500/20 text-slate-400'}`}
                      >
                        {statusConfig[session.status]?.label ?? session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate-300">
                        {session.isOnline ? <VideoIcon /> : <MapPinIcon />}
                        {session.isOnline ? 'Online' : 'In-Person'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left text-sm text-white font-medium">
                      {session.price != null && session.price > 0
                        ? `₪${session.price}`
                        : session.healthFund
                        ? `קופ״ח: ${session.healthFund}`
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400">Today's Sessions</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {data?.stats.todaySessions ?? 0}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400">השבוע</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {data?.stats.weekSessions ?? 0}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-400">הכנסs (Approveds)</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {data?.stats.totalRevenue != null && data.stats.totalRevenue > 0
              ? `₪${data.stats.totalRevenue.toLocaleString('he-IL')}`
              : 'קופ״ח'}
          </p>
        </div>
      </div>
    </div>
  );
}
