'use client';

import { trpc } from '@/lib/trpc/client';

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const fundColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-slate-500', 'bg-rose-500'];

export default function ReportsPage() {
  const { data: reports, isLoading } = trpc.admin.getReportsData.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-slate-400 mt-1">
            Performance data and platform growth metrics
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors self-start">
          <DownloadIcon />
          ייצוא
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400">Total״כ Patients</p>
          <p className="text-3xl font-bold text-white mt-2">
            {isLoading ? '...' : reports?.totalPatients ?? 0}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400">Active Therapists</p>
          <p className="text-3xl font-bold text-white mt-2">
            {isLoading ? '...' : reports?.approvedTherapists ?? 0}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400">Total״כ Sessions</p>
          <p className="text-3xl font-bold text-white mt-2">
            {isLoading ? '...' : reports?.totalSessions ?? 0}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <p className="text-sm text-slate-400">שיעור Match</p>
          <p className="text-3xl font-bold text-white mt-2">
            {isLoading ? '...' : `${reports?.matchRate ?? 0}%`}
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">סטטיסטיקת Sessions</h2>
          {isLoading ? (
            <p className="text-slate-400">Loading...</p>
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
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">Approveds</span>
                        <span className="text-white font-medium">{approved}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.round((approved / total) * 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">הושלed</span>
                        <span className="text-white font-medium">{completed}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.round((completed / total) * 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">ממתינs</span>
                        <span className="text-white font-medium">{pending}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.round((pending / total) * 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">Cancelledו</span>
                        <span className="text-white font-medium">{cancelled}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.round((cancelled / total) * 100)}%` }} />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Health Fund Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">התפלגs Health Funds</h2>
          {isLoading ? (
            <p className="text-slate-400">Loading...</p>
          ) : reports?.healthFundDistribution?.length ? (
            <div className="space-y-3">
              {reports.healthFundDistribution.map((fund, i) => (
                <div key={fund.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded ${fundColors[i % fundColors.length]}`} />
                  <span className="text-slate-400 flex-1">{fund.name}</span>
                  <span className="text-white font-medium">{fund.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">אין נתונs</p>
          )}
        </div>

        {/* Top Therapists */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Therapists edבילs</h2>
          {isLoading ? (
            <p className="text-slate-400">Loading...</p>
          ) : reports?.topTherapists?.length ? (
            <div className="space-y-3">
              {reports.topTherapists.map((therapist, index) => (
                <div
                  key={therapist.id}
                  className="flex items-center gap-3 p-2 bg-slate-700/50 rounded-lg"
                >
                  <span className="text-amber-400 font-medium w-6">{index + 1}</span>
                  <span className="text-white flex-1">{therapist.name}</span>
                  <span className="text-slate-400 text-sm">{therapist.sessions} Sessions</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">אין נתונs</p>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">ייצוא דוחs</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-right">
            <p className="text-white font-medium">דוח Users</p>
            <p className="text-slate-400 text-sm mt-1">All theUsers With Status וActives</p>
          </button>
          <button className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-right">
            <p className="text-white font-medium">דוח Sessions</p>
            <p className="text-slate-400 text-sm mt-1">היסטוריית Sessions וסטטיסטיקה</p>
          </button>
          <button className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-right">
            <p className="text-white font-medium">דוח פיננסי</p>
            <p className="text-slate-400 text-sm mt-1">הכנסs ונתוני חיוב</p>
          </button>
          <button className="p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-right">
            <p className="text-white font-medium">דוח ציs</p>
            <p className="text-slate-400 text-sm mt-1">יומני ביקורת ואירועי אבטחה</p>
          </button>
        </div>
      </div>
    </div>
  );
}
