'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';

// ============ ICONS ============
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

const MailIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ReportsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const AuditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    <path d="m15 5 3 3" />
  </svg>
);

// ============ STAT CARD ============
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'gray',
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; label: string };
  color?: 'gray' | 'amber' | 'green' | 'blue' | 'purple' | 'red';
  href?: string;
}) {
  const iconBg: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-500',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  const content = (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBg[color]}`}>
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

// ============ STATUS BADGE ============
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    PENDING_INFO: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending Info' },
    AWAITING_APPROVAL: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Awaiting Review' },
    APPROVED: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Approved' },
    REJECTED: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
    SUSPENDED: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Suspended' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-50 text-gray-600 border-gray-200', label: status };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
}

// ============ MAIN DASHBOARD ============
export default function AdminDashboard() {
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: pendingTherapists, refetch: refetchTherapists } = trpc.admin.getTherapistApplications.useQuery({
    status: 'AWAITING_APPROVAL',
    limit: 10,
  });
  const { data: auditLogs } = trpc.admin.getAuditLogs.useQuery({ limit: 8 });

  const approveMutation = trpc.admin.approveTherapist.useMutation({
    onSuccess: () => refetchTherapists(),
  });
  const rejectMutation = trpc.admin.rejectTherapist.useMutation({
    onSuccess: () => {
      refetchTherapists();
      setRejectModal(null);
      setRejectReason('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
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

      {/* Pending Actions & Recent Activity side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions -- Therapist Approvals */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-amber-500" />
              Pending Actions
            </h3>
            <Link
              href="/admin/therapists"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4">
            {pendingTherapists?.applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <CheckIcon className="w-12 h-12 mb-3 text-green-400" />
                <p className="text-sm font-medium text-gray-500">All caught up</p>
                <p className="text-xs text-gray-400 mt-1">No therapists pending approval</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTherapists?.applications.slice(0, 5).map((therapist) => (
                  <div
                    key={therapist.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-700 font-semibold text-sm">
                          {therapist.firstName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {therapist.firstName} {therapist.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {therapist.city} &middot; {therapist.daysInQueue} days in queue
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => approveMutation.mutate({ therapistId: therapist.id })}
                        disabled={approveMutation.isPending}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setRejectModal(therapist.id); setRejectReason(''); }}
                        disabled={rejectMutation.isPending}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/therapists/${therapist.id}`}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <AuditIcon className="w-5 h-5 text-blue-500" />
              Recent Activity
            </h3>
            <Link
              href="/admin/audit"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Full Log
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4">
            {auditLogs?.logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <AuditIcon className="w-12 h-12 mb-3" />
                <p className="text-sm font-medium text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs?.logs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      log.action.includes('APPROVED') ? 'bg-green-100' :
                      log.action.includes('REJECTED') ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      {log.action.includes('APPROVED') ? (
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      ) : log.action.includes('REJECTED') ? (
                        <XIcon className="w-4 h-4 text-red-600" />
                      ) : (
                        <AuditIcon className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {log.userName} &middot; {new Date(log.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    {log.emailTriggered && (
                      <MailIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Therapist Approvals', href: '/admin/therapists', icon: TherapistIcon, description: 'Review and approve therapist applications', color: 'text-amber-600 bg-amber-50' },
            { name: 'Reports & Analytics', href: '/admin/reports', icon: ReportsIcon, description: 'Platform metrics and performance data', color: 'text-blue-600 bg-blue-50' },
            { name: 'Audit Log', href: '/admin/audit', icon: AuditIcon, description: 'Full history of administrative actions', color: 'text-purple-600 bg-purple-50' },
            { name: 'System Settings', href: '/admin/settings', icon: SettingsIcon, description: 'Configure matching algorithm and system', color: 'text-gray-600 bg-gray-100' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className={`p-2.5 rounded-lg ${link.color}`}>
                <link.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                  {link.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {link.description}
                </p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors mt-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'API Server', status: 'Active', detail: '99.9% uptime' },
            { name: 'Database', status: 'Connected', detail: '12ms latency' },
            { name: 'Email Service', status: 'Active', detail: '0 in queue' },
            { name: 'Matching Engine', status: 'Active', detail: 'Ready' },
          ].map((service) => (
            <div key={service.name} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-900">{service.name}</p>
                <p className="text-xs text-gray-500">{service.status} &middot; {service.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
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
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate({ therapistId: rejectModal, reason: rejectReason })}
                disabled={rejectReason.length < 10 || rejectMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
