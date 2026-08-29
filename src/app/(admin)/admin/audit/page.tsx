'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

const actionConfig: Record<string, { color: string; label: string }> = {
  CREATE: { color: 'bg-green-50 text-green-700', label: 'Create' },
  UPDATE: { color: 'bg-blue-50 text-blue-700', label: 'Update' },
  DELETE: { color: 'bg-red-50 text-red-700', label: 'Delete' },
  APPROVE: { color: 'bg-green-50 text-green-700', label: 'Approve' },
  REJECT: { color: 'bg-red-50 text-red-700', label: 'Reject' },
  LOGIN: { color: 'bg-purple-50 text-purple-700', label: 'Login' },
  LOGOUT: { color: 'bg-gray-100 text-gray-600', label: 'Logout' },
  THERAPIST_APPROVED: { color: 'bg-green-50 text-green-700', label: 'Therapist Approved' },
  THERAPIST_REJECTED: { color: 'bg-red-50 text-red-700', label: 'Therapist Rejected' },
  THERAPIST_SUSPENDED: { color: 'bg-orange-50 text-orange-700', label: 'Therapist Suspended' },
  THERAPIST_UNSUSPENDED: { color: 'bg-green-50 text-green-700', label: 'Suspension Lifted' },
  DOCUMENTS_REQUESTED: { color: 'bg-amber-50 text-amber-700', label: 'Documents Requested' },
  OWNER_STATUS_OVERRIDE: { color: 'bg-purple-50 text-purple-700', label: 'Status Override (Owner)' },
};

const entityTypeLabels: Record<string, string> = {
  THERAPIST: 'Therapist',
  PATIENT: 'Patient',
  USER: 'User',
  SESSION: 'Session',
  DOCUMENT: 'Document',
};

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function AuditLogsPage() {
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const limit = 20;
  const { data, isLoading } = trpc.admin.getAuditLogs.useQuery({
    entityType: entityTypeFilter || undefined,
    limit,
    offset: (page - 1) * limit,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500 mt-1">
          Track all significant activities and changes in the system
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pr-10 pl-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            />
          </div>

          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <option value="">All Entities</option>
            <option value="USER">User</option>
            <option value="THERAPIST">Therapist</option>
            <option value="PATIENT">Patient</option>
            <option value="SESSION">Session</option>
            <option value="DOCUMENT">Document</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                  </td>
                </tr>
              ) : data?.logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No audit records found
                  </td>
                </tr>
              ) : (
                data?.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{log.userName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${actionConfig[log.action]?.color ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {actionConfig[log.action]?.label ?? log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-gray-900 font-medium">{entityTypeLabels[log.entityType] ?? log.entityType}</span>
                        <span className="text-gray-400 ml-2 font-mono text-xs">
                          {log.entityId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.previousValue && (
                        <button
                          className="text-xs font-medium text-amber-600 hover:text-amber-700"
                          onClick={() => {
                            alert(JSON.stringify({ previous: log.previousValue, new: log.newValue }, null, 2));
                          }}
                        >
                          View Changes
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * data.pagination.limit + 1} to{' '}
              {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon />
              </button>
              <span className="text-sm text-gray-700 font-medium">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">About Audit Logs</h3>
        <p className="text-sm text-gray-500">
          The audit log tracks all significant actions performed in the system, including user management,
          therapist approvals, session changes, and administrative updates. Records are retained
          for 90 days and can be exported for compliance purposes.
        </p>
      </div>
    </div>
  );
}
