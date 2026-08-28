'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

const actionConfig: Record<string, { color: string; label: string }> = {
  CREATE: { color: 'bg-green-500/20 text-green-400', label: 'Create' },
  UPDATE: { color: 'bg-blue-500/20 text-blue-400', label: 'up toכון' },
  DELETE: { color: 'bg-red-500/20 text-red-400', label: 'Delete' },
  APPROVE: { color: 'bg-green-500/20 text-green-400', label: 'Confirm' },
  REJECT: { color: 'bg-red-500/20 text-red-400', label: 'Rejection' },
  LOGIN: { color: 'bg-purple-500/20 text-purple-400', label: 'Login' },
  LOGOUT: { color: 'bg-slate-500/20 text-slate-400', label: 'Logout' },
  THERAPIST_APPROVED: { color: 'bg-green-500/20 text-green-400', label: 'Therapist orשר' },
  THERAPIST_REJECTED: { color: 'bg-red-500/20 text-red-400', label: 'Therapist נDecline' },
  THERAPIST_SUSPENDED: { color: 'bg-orange-500/20 text-orange-400', label: 'Therapist הוTime' },
  THERAPIST_UNSUSPENDED: { color: 'bg-green-500/20 text-green-400', label: 'השעיה Cancelledה' },
  DOCUMENTS_REQUESTED: { color: 'bg-amber-500/20 text-amber-400', label: 'בקשת מסמכs' },
  OWNER_STATUS_OVERRIDE: { color: 'bg-purple-500/20 text-purple-400', label: 'דריסת Status (בעלs)' },
};

const entityTypeLabels: Record<string, string> = {
  THERAPIST: 'Therapist',
  PATIENT: 'Patient',
  USER: 'User',
  SESSION: 'Session',
  DOCUMENT: 'מסמך',
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
        <h1 className="text-2xl font-bold text-white">Log ביקורת</h1>
        <p className="text-slate-400 mt-1">
          מעקב Other All theActiveויs והשינויs במערכת
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search בLog..."
              className="w-full pr-10 pl-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Entity Type Filter */}
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All theישויs</option>
            <option value="USER">User</option>
            <option value="THERAPIST">Therapist</option>
            <option value="PATIENT">Patient</option>
            <option value="SESSION">Session</option>
            <option value="DOCUMENT">מסמך</option>
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-slate-400">up to</span>
            <input
              type="date"
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">חsמת זמן</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">User</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">פעולה</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">ישs</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Details</th>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No Foundor רשומs ביקורת
                  </td>
                </tr>
              ) : (
                data?.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(log.createdAt).toLocaleString('he-IL')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white">{log.userName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${actionConfig[log.action]?.color ?? 'bg-slate-500/20 text-slate-400'}`}
                      >
                        {actionConfig[log.action]?.label ?? log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-white">{entityTypeLabels[log.entityType] ?? log.entityType}</span>
                        <span className="text-slate-500 mr-2 font-mono text-xs">
                          {log.entityId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.previousValue && (
                        <button
                          className="text-xs text-amber-400 hover:text-amber-300"
                          onClick={() => {
                            alert(JSON.stringify({ previous: log.previousValue, new: log.newValue }, null, 2));
                          }}
                        >
                          הצג שינויs
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Displays {(page - 1) * data.pagination.limit + 1} up to{' '}
              {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} רשומs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon />
              </button>
              <span className="text-sm text-white">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-2">orדs Log ביקורת</h3>
        <p className="text-sm text-slate-500">
          Log הביקורת עוקב Other All theActions המשמעsיs שCompletedו במערכת, כולל User Management,
          Confirmי Therapists, שינויי Sessions ושינויs Managementיs. הרשומs נשמרs
          למשך 90 יום וניתן לייצא orתן לצרכי תאימs.
        </p>
      </div>
    </div>
  );
}
