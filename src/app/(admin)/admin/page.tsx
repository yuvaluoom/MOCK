'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { useAdminRealtimeSync, type RealtimeEvent } from '@/lib/realtime/useAdminRealtimeSync';

// ============ TAB TYPES ============
type TabId = 'overview' | 'therapists' | 'sessions' | 'notifications' | 'realtime' | 'match-insights';

// ============ ICONS ============
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TherapistIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" />
    <path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
    <path d="m9 22 3-3 3 3" />
    <path d="M12 6v3" />
    <path d="M10 8h4" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LiveIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </svg>
);

const MatchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
    <path d="M10 2c1 .5 2 2 2 5" />
  </svg>
);

// ============ STAT CARD COMPONENT ============
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'slate',
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; label: string };
  color?: 'slate' | 'amber' | 'green' | 'blue' | 'purple' | 'red';
  href?: string;
}) {
  const colorClasses = {
    slate: 'bg-slate-700/50 text-slate-300',
    amber: 'bg-amber-500/20 text-amber-400',
    green: 'bg-green-500/20 text-green-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    red: 'bg-red-500/20 text-red-400',
  };

  const content = (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// ============ APPROVAL STATUS BADGE ============
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    PENDING_INFO: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pending Info' },
    AWAITING_APPROVAL: { color: 'bg-amber-500/20 text-amber-400', label: 'Awaiting Review' },
    APPROVED: { color: 'bg-green-500/20 text-green-400', label: 'Approved' },
    REJECTED: { color: 'bg-red-500/20 text-red-400', label: 'Rejected' },
    SUSPENDED: { color: 'bg-gray-500/20 text-gray-400', label: 'Suspended' },
  };

  const config = statusConfig[status] || { color: 'bg-slate-500/20 text-slate-400', label: status };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}

// ============ TAB DEFINITIONS ============
const tabs = [
  { id: 'overview' as TabId, name: 'Overview', icon: DashboardIcon },
  { id: 'therapists' as TabId, name: 'Therapist Approvals', icon: TherapistIcon },
  { id: 'sessions' as TabId, name: 'Session Monitoring', icon: CalendarIcon },
  { id: 'notifications' as TabId, name: 'Alert Log', icon: BellIcon },
  { id: 'realtime' as TabId, name: 'Real-Time', icon: LiveIcon },
  { id: 'match-insights' as TabId, name: 'Match Insights', icon: MatchIcon },
];

// ============ MAIN DASHBOARD COMPONENT ============
// ============ EVENT TYPE LABELS ============
const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  USER_CREATED:              { label: 'User Created',        color: 'text-blue-400' },
  USER_UPDATED:              { label: 'User Updated',        color: 'text-blue-300' },
  THERAPIST_STATUS_CHANGED:  { label: 'Status Changed',      color: 'text-amber-400' },
  THERAPIST_PROFILE_UPDATED: { label: 'Profile Updated',     color: 'text-purple-400' },
  SESSION_STATUS_CHANGED:    { label: 'Session Update',      color: 'text-green-400' },
  NOTIFICATION_CREATED:      { label: 'Notification',        color: 'text-cyan-400' },
  MATCH_UPDATED:             { label: 'Match Updated',       color: 'text-pink-400' },
  EMAIL_SENT:                { label: 'Email Sent',          color: 'text-green-300' },
  AUDIT_LOG_CREATED:         { label: 'Audit Log',           color: 'text-slate-400' },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // ─── Real-time sync — auto-invalidates React Query on every platform event ───
  const { isConnected, eventCount, lastEvent, eventLog, connectionStatus } = useAdminRealtimeSync();

  // Fetch data — these will auto-refetch when the SSE stream triggers invalidation
  const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: pendingTherapists, refetch: refetchTherapists } = trpc.admin.getTherapistApplications.useQuery({
    status: 'AWAITING_APPROVAL',
    limit: 10,
  });
  const { data: allTherapists } = trpc.admin.getTherapistApplications.useQuery({
    status: 'ALL',
    limit: 20,
  });
  const { data: auditLogs } = trpc.admin.getAuditLogs.useQuery({ limit: 10 });

  // Mutations
  const approveMutation = trpc.admin.approveTherapist.useMutation({
    onSuccess: () => refetchTherapists(),
  });
  const rejectMutation = trpc.admin.rejectTherapist.useMutation({
    onSuccess: () => refetchTherapists(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Manage and monitor platform activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time connection indicator */}
          <span className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full ${
            isConnected
              ? 'bg-green-500/20 text-green-400'
              : connectionStatus === 'reconnecting'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400 animate-pulse' : connectionStatus === 'reconnecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
            }`} />
            {isConnected ? 'LIVE' : connectionStatus === 'reconnecting' ? 'Connecting...' : 'Disconnected'}
          </span>

          {/* Event counter */}
          {eventCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
              <LiveIcon className="w-3 h-3" />
              {eventCount} events
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
              {tab.id === 'therapists' && (stats?.therapists?.awaitingApproval ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                  {stats?.therapists?.awaitingApproval}
                </span>
              )}
              {tab.id === 'realtime' && isConnected && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Patients"
                value={stats?.patients.total ?? 0}
                icon={UsersIcon}
                color="blue"
                href="/admin/users"
              />
              <StatCard
                title="Active Therapists"
                value={stats?.therapists.approved ?? 0}
                icon={TherapistIcon}
                color="green"
                href="/admin/therapists"
              />
              <StatCard
                title="Total Sessions"
                value={stats?.sessions.total ?? 0}
                icon={CalendarIcon}
                color="purple"
                href="/admin/sessions"
              />
              <StatCard
                title="Pending Approval"
                value={stats?.therapists.awaitingApproval ?? 0}
                icon={ClockIcon}
                color="amber"
                href="/admin/therapists"
              />
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals Summary */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl">
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-amber-400" />
                    Pending Approval
                  </h3>
                  <Link
                    href="/admin/therapists"
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    Show All
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
                <div className="p-4">
                  {pendingTherapists?.applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <CheckIcon className="w-12 h-12 mb-4 text-green-400" />
                      <p>No therapists pending approval</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingTherapists?.applications.slice(0, 5).map((therapist) => (
                        <div
                          key={therapist.id}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <span className="text-amber-400 font-medium">
                                {therapist.firstName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {therapist.firstName} {therapist.lastName}
                              </p>
                              <p className="text-xs text-slate-400">
                                {therapist.city} • {therapist.daysInQueue} days in queue
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/admin/therapists/${therapist.id}`}
                            className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Review
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl">
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <AlertIcon className="w-5 h-5 text-blue-400" />
                    Recent Activity
                  </h3>
                  <Link
                    href="/admin/audit"
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    Full Log
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                  </Link>
                </div>
                <div className="p-4">
                  {auditLogs?.logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <AlertIcon className="w-12 h-12 mb-4" />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs?.logs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-300 text-xs font-medium">
                              {log.action[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">
                              <span className="font-medium">{log.action}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {log.userName} • {new Date(log.createdAt).toLocaleString('en-US')}
                            </p>
                          </div>
                          {log.emailTriggered && (
                            <MailIcon className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System Health — Live */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                System Health
                {isConnected && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-full uppercase tracking-wider">live</span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-white">API Server</p>
                    <p className="text-xs text-slate-400">Active • 99.9% uptime</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-white">Database</p>
                    <p className="text-xs text-slate-400">Connected • 12ms latency</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-white">Email Service</p>
                    <p className="text-xs text-slate-400">Active • 0 in queue</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">Real-Time Channel</p>
                    <p className="text-xs text-slate-400">
                      {isConnected ? `Connected • ${eventCount} events` : connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last event flash */}
              {lastEvent && lastEvent.entityType !== 'SYSTEM' && (
                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-3">
                  <LiveIcon className="w-4 h-4 text-amber-400 animate-pulse" />
                  <p className="text-xs text-slate-400">
                    Last event: <span className={EVENT_LABELS[lastEvent.type]?.color ?? 'text-white'}>{EVENT_LABELS[lastEvent.type]?.label ?? lastEvent.type}</span>
                    {' '}• {new Date(lastEvent.timestamp).toLocaleTimeString('en-US')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ THERAPIST APPROVALS TAB ============ */}
        {activeTab === 'therapists' && (
          <div className="space-y-6">
            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { status: 'PENDING_INFO', label: 'Pending Info', count: stats?.therapists.pendingInfo ?? 0, color: 'yellow' },
                { status: 'AWAITING_APPROVAL', label: 'Awaiting Approval', count: stats?.therapists.awaitingApproval ?? 0, color: 'amber' },
                { status: 'APPROVED', label: 'Approved', count: stats?.therapists.approved ?? 0, color: 'green' },
                { status: 'REJECTED', label: 'Rejected', count: stats?.therapists.rejected ?? 0, color: 'red' },
                { status: 'SUSPENDED', label: 'Suspended', count: stats?.therapists.suspended ?? 0, color: 'gray' },
              ].map((item) => (
                <div
                  key={item.status}
                  className={`bg-slate-800 border border-slate-700 rounded-lg p-4 text-center`}
                >
                  <p className="text-2xl font-bold text-white">{item.count}</p>
                  <p className="text-xs text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Therapist Applications Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">All Applications</h3>
                <Link
                  href="/admin/therapists"
                  className="text-sm text-amber-400 hover:text-amber-300"
                >
                  Detailed View →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Therapist</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">City</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Profile Completeness</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {allTherapists?.applications.map((therapist) => (
                      <tr key={therapist.id} className="hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                              <span className="text-slate-300 text-sm font-medium">
                                {therapist.firstName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {therapist.firstName} {therapist.lastName}
                              </p>
                              <p className="text-xs text-slate-400">{therapist.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{therapist.city}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={therapist.approvalStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${therapist.profileCompleteness}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400">{therapist.profileCompleteness}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {therapist.approvalStatus === 'AWAITING_APPROVAL' && (
                              <>
                                <button
                                  onClick={() => approveMutation.mutate({ therapistId: therapist.id })}
                                  disabled={approveMutation.isPending}
                                  className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = window.prompt('Rejection reason:');
                                    if (reason) {
                                      rejectMutation.mutate({ therapistId: therapist.id, reason });
                                    }
                                  }}
                                  disabled={rejectMutation.isPending}
                                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <Link
                              href={`/admin/therapists/${therapist.id}`}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
                              title="View Details"
                            >
                              <ChevronRightIcon className="w-4 h-4 rotate-180" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-400">Important note</h4>
                  <p className="text-sm text-slate-300 mt-1">
                    כל פעולת Confirm or Rejection מup toכנת את מסד הנתונs בorפן מיידי, שולחת Email לTherapist,
                    ומתup toת בLog הביקורת. Therapists Approveds edפיעs מיידית במערכת ההתאמs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ SESSIONS TAB ============ */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Session Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats?.sessions.total ?? 0}</p>
                <p className="text-xs text-slate-400">Total״כ Sessions</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{stats?.sessions.pending ?? 0}</p>
                <p className="text-xs text-slate-400">Pending Approval</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{stats?.sessions.approved ?? 0}</p>
                <p className="text-xs text-slate-400">Approveds</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{stats?.sessions.completed ?? 0}</p>
                <p className="text-xs text-slate-400">הושלed</p>
              </div>
            </div>

            {/* Link to full sessions page */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Session Monitoring מNo</h3>
              <p className="text-sm text-slate-400 mb-4">
                צפה בAll theSessions, סנן לפי Therapist or Patient, ועקוב Other Statuss
              </p>
              <Link
                href="/admin/sessions"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                לדף הSessions המNo
                <ChevronRightIcon className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        )}

        {/* ============ NOTIFICATIONS TAB ============ */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Recent Audit Logs */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Log Actions</h3>
                <Link
                  href="/admin/audit"
                  className="text-sm text-amber-400 hover:text-amber-300"
                >
                  Full Log →
                </Link>
              </div>
              <div className="divide-y divide-slate-700">
                {auditLogs?.logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        log.action.includes('APPROVED') ? 'bg-green-500/20' :
                        log.action.includes('REJECTED') ? 'bg-red-500/20' :
                        log.action.includes('SUSPENDED') ? 'bg-gray-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {log.action.includes('APPROVED') ? (
                          <CheckIcon className="w-5 h-5 text-green-400" />
                        ) : log.action.includes('REJECTED') ? (
                          <XIcon className="w-5 h-5 text-red-400" />
                        ) : (
                          <AlertIcon className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-white">{log.action}</p>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-400">{log.entityType}</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          Completed ע״י {log.userName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(log.createdAt).toLocaleString('he-IL', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.emailTriggered && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                            <MailIcon className="w-3 h-3" />
                            Email נSend
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* ============ REAL-TIME TAB ============ */}
        {activeTab === 'realtime' && (
          <div className="space-y-6">
            {/* Connection Status Banner */}
            <div className={`rounded-xl p-6 border ${
              isConnected
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isConnected ? 'Real-Time Stream Active' : 'Disconnected'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {isConnected
                        ? 'כל פעולה בפלטפורמה edפיעה כאן מיידית לNo ריענון'
                        : 'מנTotal להתחבר מחדש...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{eventCount}</p>
                    <p className="text-xs text-slate-400">אירועs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{eventLog.filter(e => e.entityType !== 'SYSTEM').length}</p>
                    <p className="text-xs text-slate-400">Actions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Diagram */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Synchronized Dual-Surface Architecture</h3>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="px-4 py-3 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-center">
                  <p className="font-bold">User Platform</p>
                  <p className="text-xs text-slate-400 mt-1">Actions User</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-amber-400 text-lg">⟷</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">SSE Stream</span>
                </div>
                <div className="px-4 py-3 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 text-center">
                  <p className="font-bold">Admin Dashboard</p>
                  <p className="text-xs text-slate-400 mt-1">שיקוף מיידי</p>
                </div>
              </div>
            </div>

            {/* Live Event Stream */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <LiveIcon className="w-5 h-5 text-amber-400" />
                  זרם אירועs חי / Live Event Stream
                </h3>
                <span className="text-xs text-slate-500">
                  {eventLog.length} אירועs בזיכרון
                </span>
              </div>

              {eventLog.length === 0 ? (
                <div className="p-12 text-center">
                  <LiveIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-slate-400 mb-2">Pending Noירועs...</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    בצע פעולה בפלטפורמה (רישום Therapist, Confirm, Sending Message) והיא תופיע כאן מיידית
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
                  {eventLog
                    .filter(e => e.entityType !== 'SYSTEM')
                    .map((event) => {
                      const meta = EVENT_LABELS[event.type] || { label: event.type, color: 'text-slate-400' };
                      return (
                        <div key={event.id} className="p-4 hover:bg-slate-700/30 transition-colors animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-4">
                            {/* Event type indicator */}
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                              {event.type.includes('EMAIL') ? (
                                <MailIcon className="w-5 h-5 text-green-400" />
                              ) : event.type.includes('THERAPIST') ? (
                                <TherapistIcon className="w-5 h-5 text-amber-400" />
                              ) : event.type.includes('SESSION') ? (
                                <CalendarIcon className="w-5 h-5 text-purple-400" />
                              ) : event.type.includes('USER') ? (
                                <UsersIcon className="w-5 h-5 text-blue-400" />
                              ) : event.type.includes('NOTIFICATION') ? (
                                <BellIcon className="w-5 h-5 text-cyan-400" />
                              ) : (
                                <AlertIcon className="w-5 h-5 text-slate-400" />
                              )}
                            </div>

                            {/* Event details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
                                <span className="text-[10px] text-slate-600 font-mono">{event.type}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">
                                {event.entityType} • ID: <span className="font-mono text-slate-500">{event.entityId}</span>
                              </p>
                              {/* Invalidated queries */}
                              {event.invalidates.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {event.invalidates.map((key) => (
                                    <span key={key} className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-400 rounded">
                                      {key}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Timestamp */}
                            <div className="text-left flex-shrink-0">
                              <p className="text-xs text-slate-500 font-mono">
                                {new Date(event.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </p>
                              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                                {event.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Technical Info */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="text-amber-400 font-semibold">Real-Time Architecture:</span>{' '}
                mock-db events → AdminSyncBus → SSE Stream (/api/admin/realtime) → useAdminRealtimeSync hook → React Query invalidation → UI auto-refresh.
                Every mutation on the user platform triggers an event that propagates to this dashboard within milliseconds.
              </p>
            </div>
          </div>
        )}

        {/* ==================== MATCH INSIGHTS TAB ==================== */}
        {activeTab === 'match-insights' && (
          <MatchInsightsTab />
        )}
      </div>
    </div>
  );
}

// ============ MATCH INSIGHTS TAB COMPONENT ============
function MatchInsightsTab() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const { data: insights, isLoading } = trpc.admin.getMatchInsights.useQuery({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">מחשב Match Insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const { summary, results } = insights;

  const qualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'great': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'good': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'moderate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const qualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excellent';
      case 'great': return 'Good מorד';
      case 'good': return 'Good';
      case 'moderate': return 'Moderate';
      case 'low': return 'Low';
      default: return quality;
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 55) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400">Average Score</p>
          <p className={`text-3xl font-bold mt-2 ${scoreColor(summary.averageScore)}`}>
            {summary.averageScore}%
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400">Total&quot;כ Thisגs</p>
          <p className="text-3xl font-bold text-white mt-2">{summary.totalPairs}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400">Excellent + Very Good</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {summary.qualityDistribution.excellent + summary.qualityDistribution.great}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400">Low</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            {summary.qualityDistribution.low}
          </p>
        </div>
      </div>

      {/* Quality Distribution Bar */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Match Quality Distribution</h3>
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          {summary.qualityDistribution.excellent > 0 && (
            <div className="bg-green-500 transition-all" style={{ flex: summary.qualityDistribution.excellent }} title={`Excellent: ${summary.qualityDistribution.excellent}`} />
          )}
          {summary.qualityDistribution.great > 0 && (
            <div className="bg-blue-500 transition-all" style={{ flex: summary.qualityDistribution.great }} title={`Good מorד: ${summary.qualityDistribution.great}`} />
          )}
          {summary.qualityDistribution.good > 0 && (
            <div className="bg-cyan-500 transition-all" style={{ flex: summary.qualityDistribution.good }} title={`Good: ${summary.qualityDistribution.good}`} />
          )}
          {summary.qualityDistribution.moderate > 0 && (
            <div className="bg-amber-500 transition-all" style={{ flex: summary.qualityDistribution.moderate }} title={`Moderate: ${summary.qualityDistribution.moderate}`} />
          )}
          {summary.qualityDistribution.low > 0 && (
            <div className="bg-red-500 transition-all" style={{ flex: summary.qualityDistribution.low }} title={`Low: ${summary.qualityDistribution.low}`} />
          )}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Excellent ({summary.qualityDistribution.excellent})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Good מorד ({summary.qualityDistribution.great})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Good ({summary.qualityDistribution.good})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Moderate ({summary.qualityDistribution.moderate})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Low ({summary.qualityDistribution.low})</span>
        </div>
      </div>

      {/* Match Pairs Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MatchIcon className="w-5 h-5 text-amber-400" />
            Match Pairs Detail
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-right">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Therapist</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Overall Score</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Objective</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Subjective</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Quality</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {results.map((r) => (
                <React.Fragment key={r.therapistId}>
                  <tr className="hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === r.therapistId ? null : r.therapistId)}>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-medium">{r.therapistTitle ? `${r.therapistTitle} ` : ''}{r.therapistName}</p>
                        <p className="text-xs text-slate-500">{r.therapistCity}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{r.patientName}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xl font-bold ${scoreColor(r.overallScore)}`}>{r.overallScore}%</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-semibold ${scoreColor(r.objectiveFitScore)}`}>{r.objectiveFitScore}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-semibold ${scoreColor(r.subjectiveFitScore)}`}>{r.subjectiveFitScore}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${qualityColor(r.matchQuality)}`}>
                        {qualityLabel(r.matchQuality)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button className="text-slate-400 hover:text-white transition-colors">
                        <ChevronRightIcon className={`w-5 h-5 transition-transform ${expandedRow === r.therapistId ? 'rotate-90' : ''}`} />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRow === r.therapistId && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-slate-850">
                        <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
                          {/* Factor Breakdown Bars */}
                          <div>
                            <h4 className="text-sm font-semibold text-slate-300 mb-3">פירוט גורמs</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {r.factors.map((f) => (
                                <div key={f.key} className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">{f.label}</span>
                                    <span className={`font-semibold ${scoreColor(f.score)}`}>{f.score} ({Math.round(f.weight * 100)}%)</span>
                                  </div>
                                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        f.score >= 85 ? 'bg-green-500' :
                                        f.score >= 70 ? 'bg-blue-500' :
                                        f.score >= 55 ? 'bg-amber-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${f.score}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Explanation Items */}
                          {r.explanationItems.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-300 mb-3">Private Match</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {r.explanationItems.map((item, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm">
                                    {item.matched ? (
                                      <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    ) : (
                                      <XIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    )}
                                    <span className={item.matched ? 'text-slate-300' : 'text-slate-500'}>{item.labelEn}</span>
                                    <span className="text-xs text-slate-600 mr-auto">[{item.category}]</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Top Reasons & Warnings */}
                          <div className="flex gap-6">
                            {r.topReasons.length > 0 && (
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-green-400 mb-2">סיבs עיקריs</h4>
                                <ul className="space-y-1">
                                  {r.topReasons.map((reason, i) => (
                                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                                      <span className="text-green-500 mt-0.5">+</span>
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {r.warnings.length > 0 && (
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-amber-400 mb-2">אזהרs</h4>
                                <ul className="space-y-1">
                                  {r.warnings.map((warning, i) => (
                                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                                      <span className="text-amber-500 mt-0.5">!</span>
                                      {warning}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
