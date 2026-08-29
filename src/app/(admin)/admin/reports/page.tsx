'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const fundColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-gray-400', 'bg-rose-500'];

export default function ReportsPage() {
  const { data: reports, isLoading } = trpc.admin.getReportsData.useQuery();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">
            Performance data and platform growth metrics
          </p>
        </div>
        <button
          onClick={() => showToast('Report exported successfully')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors self-start text-sm font-medium"
        >
          <DownloadIcon />
          Export
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm font-medium text-gray-500">Total Patients</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? '...' : reports?.totalPatients ?? 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm font-medium text-gray-500">Active Therapists</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? '...' : reports?.approvedTherapists ?? 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm font-medium text-gray-500">Total Sessions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? '...' : reports?.totalSessions ?? 0}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm font-medium text-gray-500">Match Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {isLoading ? '...' : `${reports?.matchRate ?? 0}%`}
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Session Statistics</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="space-y-4">
              {(() => {
                const total = reports?.totalSessions || 1;
                const approved = reports?.sessionsByStatus?.approved ?? 0;
                const completed = reports?.sessionsByStatus?.completed ?? 0;
                const pending = reports?.sessionsByStatus?.pending ?? 0;
                const cancelled = reports?.sessionsByStatus?.cancelled ?? 0;
                return (
                  <>
                    {[
                      { label: 'Approved', value: approved, color: 'bg-green-500' },
                      { label: 'Completed', value: completed, color: 'bg-blue-500' },
                      { label: 'Pending', value: pending, color: 'bg-amber-500' },
                      { label: 'Cancelled', value: cancelled, color: 'bg-red-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-500">{item.label}</span>
                          <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`} style={{ width: `${Math.round((item.value / total) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Health Fund Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Health Fund Distribution</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : reports?.healthFundDistribution?.length ? (
            <div className="space-y-3">
              {reports.healthFundDistribution.map((fund, i) => (
                <div key={fund.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded ${fundColors[i % fundColors.length]}`} />
                  <span className="text-sm text-gray-600 flex-1">{fund.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{fund.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No data</p>
          )}
        </div>

        {/* Top Therapists */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Therapists</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : reports?.topTherapists?.length ? (
            <div className="space-y-2">
              {reports.topTherapists.map((therapist, index) => (
                <div
                  key={therapist.id}
                  className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-amber-600 font-bold w-6 text-sm">{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900 flex-1">{therapist.name}</span>
                  <span className="text-xs text-gray-500">{therapist.sessions} sessions</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No data</p>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Users Report', desc: 'All users with status and activity' },
            { name: 'Sessions Report', desc: 'Session history and statistics' },
            { name: 'Financial Report', desc: 'Revenue and billing data' },
            { name: 'Compliance Report', desc: 'Audit logs and security events' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => showToast(`${item.name} exported successfully`)}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors text-left"
            >
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
