'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

const actionConfig: Record<string, { color: string; label: string }> = {
  CREATE: { color: 'bg-green-500/20 text-green-400', label: 'יצירה' },
  UPDATE: { color: 'bg-blue-500/20 text-blue-400', label: 'עדכון' },
  DELETE: { color: 'bg-red-500/20 text-red-400', label: 'מחיקה' },
  APPROVE: { color: 'bg-green-500/20 text-green-400', label: 'אישור' },
  REJECT: { color: 'bg-red-500/20 text-red-400', label: 'דחייה' },
  LOGIN: { color: 'bg-purple-500/20 text-purple-400', label: 'כניסה' },
  LOGOUT: { color: 'bg-slate-500/20 text-slate-400', label: 'יציאה' },
  THERAPIST_APPROVED: { color: 'bg-green-500/20 text-green-400', label: 'מטפל אושר' },
  THERAPIST_REJECTED: { color: 'bg-red-500/20 text-red-400', label: 'מטפל נדחה' },
  THERAPIST_SUSPENDED: { color: 'bg-orange-500/20 text-orange-400', label: 'מטפל הושעה' },
  THERAPIST_UNSUSPENDED: { color: 'bg-green-500/20 text-green-400', label: 'השעיה בוטלה' },
  DOCUMENTS_REQUESTED: { color: 'bg-amber-500/20 text-amber-400', label: 'בקשת מסמכים' },
  OWNER_STATUS_OVERRIDE: { color: 'bg-purple-500/20 text-purple-400', label: 'דריסת סטטוס (בעלים)' },
};

const entityTypeLabels: Record<string, string> = {
  THERAPIST: 'מטפל',
  PATIENT: 'מטופל',
  USER: 'משתמש',
  SESSION: 'פגישה',
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
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">יומן ביקורת</h1>
        <p className="text-slate-400 mt-1">
          מעקב אחר כל הפעילויות והשינויים במערכת
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
              placeholder="חיפוש ביומן..."
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
            <option value="">כל הישויות</option>
            <option value="USER">משתמש</option>
            <option value="THERAPIST">מטפל</option>
            <option value="PATIENT">מטופל</option>
            <option value="SESSION">פגישה</option>
            <option value="DOCUMENT">מסמך</option>
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-slate-400">עד</span>
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
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">חותמת זמן</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">משתמש</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">פעולה</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">ישות</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">פרטים</th>
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
                    לא נמצאו רשומות ביקורת
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
                          הצג שינויים
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
              מציג {(page - 1) * data.pagination.limit + 1} עד{' '}
              {Math.min(page * data.pagination.limit, data.pagination.total)} מתוך{' '}
              {data.pagination.total} רשומות
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
                עמוד {page} מתוך {data.pagination.totalPages}
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
        <h3 className="text-sm font-medium text-slate-400 mb-2">אודות יומן ביקורת</h3>
        <p className="text-sm text-slate-500">
          יומן הביקורת עוקב אחר כל הפעולות המשמעותיות שבוצעו במערכת, כולל ניהול משתמשים,
          אישורי מטפלים, שינויי פגישות ושינויים ניהוליים. הרשומות נשמרות
          למשך 90 יום וניתן לייצא אותן לצרכי תאימות.
        </p>
      </div>
    </div>
  );
}
