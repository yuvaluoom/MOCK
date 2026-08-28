'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

// Inline Icons (consistent with other admin pages - no lucide dependency)
const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? 'w-5 h-5'}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ShieldAlertIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? 'w-5 h-5'}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const ShieldXIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? 'w-5 h-5'}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m14.5 9.5-5 5" />
    <path d="m9.5 9.5 5 5" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? 'w-5 h-5'}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FileWarningIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? 'w-5 h-5'}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? 'w-5 h-5'}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? 'w-5 h-5'}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const HelpCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className ?? 'w-3 h-3'}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

// Structured Compliance Status System
const verificationStatusConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  Icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  action: string;
}> = {
  VERIFIED: {
    label: 'מorמת',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    Icon: ShieldCheckIcon,
    tooltip: 'All documents orשרו ובתוקף. הTherapist עומד בכל דרישs הציs.',
    action: 'No Requiredת פעולה',
  },
  PENDING_VERIFICATION: {
    label: 'Pending Noימs',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    Icon: ClockIcon,
    tooltip: 'מסמכs הועלו אך טרם Reviewed על ידי Team הManagers.',
    action: 'יש לReview את המסמכs הPending',
  },
  PARTIALLY_VERIFIED: {
    label: 'מorמת חלקית',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    Icon: ShieldAlertIcon,
    tooltip: 'חלק מהמסמכs orשרו, אך ישנם מסמכs שטרם orשרו or Missing.',
    action: 'יש להשלs את תהליך האימs',
  },
  MISSING_DOCUMENTATION: {
    label: 'Missing documents',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    Icon: ShieldXIcon,
    tooltip: 'No הועלו מסמכs כלל. על הTherapist להעלs את All documents הRequireds.',
    action: 'יש לבקש העNoת מסמכs',
  },
  EXPIRED_CREDENTIALS: {
    label: 'תוקף פג',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    Icon: FileWarningIcon,
    tooltip: 'לTherapist מסמכs שפג תוקפם. יש לחדש את הConfirms הרלוונטיs.',
    action: 'יש לבקש חידוש מסמכs',
  },
};

export default function AdminCompliancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'docs'>('status');
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  const { data, isLoading } = trpc.admin.getComplianceData.useQuery();

  const filteredTherapists = (data?.therapists ?? [])
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'he');
      if (sortBy === 'status') {
        const order = ['EXPIRED_CREDENTIALS', 'MISSING_DOCUMENTATION', 'PENDING_VERIFICATION', 'PARTIALLY_VERIFIED', 'VERIFIED'];
        return order.indexOf(a.verificationStatus) - order.indexOf(b.verificationStatus);
      }
      return b.documentComplianceRate - a.documentComplianceRate;
    });

  const overallStats = data?.overallStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance & Verification מסמכs</h1>
          <p className="text-slate-400 mt-1">מעקב Other Status אימs וציs של Therapists בפלטפורמה</p>
        </div>
      </div>

      {/* Alerts for critical issues */}
      {!isLoading && (overallStats?.expiredCreds ?? 0) > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-6 h-6 text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400">Alertorת Criticals</h3>
              <p className="text-sm text-red-300 mt-1">
                ל-{overallStats?.expiredCreds} Therapists יש מסמכs שפג תוקפם. יש לטפל בכך בהקדם.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">מorמתs</p>
              <p className="text-2xl font-bold text-green-400">
                {isLoading ? '...' : overallStats?.verified ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-500/20">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending Noימs</p>
              <p className="text-2xl font-bold text-amber-400">
                {isLoading ? '...' : overallStats?.pendingVerification ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-amber-500/20">
              <ClockIcon className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">מorמתs חלקית</p>
              <p className="text-2xl font-bold text-blue-400">
                {isLoading ? '...' : overallStats?.partiallyVerified ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-500/20">
              <ShieldAlertIcon className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className={`bg-slate-800 border rounded-xl p-4 ${(overallStats?.missingDocs ?? 0) > 0 ? 'border-red-500/50' : 'border-slate-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Missing documents</p>
              <p className="text-2xl font-bold text-red-400">
                {isLoading ? '...' : overallStats?.missingDocs ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-red-500/20">
              <ShieldXIcon className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>

        <div className={`bg-slate-800 border rounded-xl p-4 ${(overallStats?.expiredCreds ?? 0) > 0 ? 'border-orange-500/50' : 'border-slate-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">תוקף פג</p>
              <p className="text-2xl font-bold text-orange-400">
                {isLoading ? '...' : overallStats?.expiredCreds ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-orange-500/20">
              <FileWarningIcon className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Compliance Rate */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className={`w-8 h-8 ${(overallStats?.overallComplianceRate ?? 0) >= 75 ? 'text-green-400' : 'text-red-400'}`} />
            <div>
              <p className="text-sm text-slate-400">שיעור ציs כללי</p>
              <p className="text-3xl font-bold text-white">
                {isLoading ? '...' : `${overallStats?.overallComplianceRate ?? 0}%`}
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            {overallStats?.totalTherapists ?? 0} Active Therapists
          </div>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 mt-3">
          <div
            className={`h-3 rounded-full transition-all ${
              (overallStats?.overallComplianceRate ?? 0) >= 90 ? 'bg-green-500' :
              (overallStats?.overallComplianceRate ?? 0) >= 75 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${overallStats?.overallComplianceRate ?? 0}%` }}
          />
        </div>
      </div>

      {/* Therapist Compliance Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">Status אימs לפי Therapist</h3>
          <div className="flex gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search Therapist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 pl-4 py-2 w-48 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="status">מיון: Status</option>
              <option value="docs">מיון: אחוז ציs</option>
              <option value="name">מיון: Name</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading נתוני ציs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-right py-3 px-6 text-sm font-medium text-slate-400">Therapist</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Status אימs</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">מסמכs</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">ציs</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Sessions</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">פעולה Requiredת</th>
                </tr>
              </thead>
              <tbody>
                {filteredTherapists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">אין Therapists תואמs</td>
                  </tr>
                ) : (
                  filteredTherapists.map((therapist) => {
                    const config = verificationStatusConfig[therapist.verificationStatus] ?? verificationStatusConfig.MISSING_DOCUMENTATION;
                    const IconComponent = config.Icon;
                    return (
                      <tr key={therapist.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                              <span className="text-slate-300 font-medium text-sm">
                                {therapist.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-white">{therapist.name}</span>
                              <p className="text-xs text-slate-400">{therapist.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="relative inline-block">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-help ${config.bgColor} ${config.color}`}
                              onMouseEnter={() => setTooltipId(therapist.id)}
                              onMouseLeave={() => setTooltipId(null)}
                            >
                              <IconComponent className="w-4 h-4" />
                              {config.label}
                              <HelpCircleIcon className="w-3 h-3 opacity-50" />
                            </span>
                            {/* Tooltip */}
                            {tooltipId === therapist.id && (
                              <div className="absolute z-50 w-64 p-3 bg-slate-900 border border-slate-600 text-white text-xs rounded-lg shadow-lg -top-2 right-full mr-2">
                                <p className="font-medium mb-1">{config.label}</p>
                                <p className="text-slate-300">{config.tooltip}</p>
                                <p className="text-amber-400 mt-2 font-medium">{config.action}</p>
                                <div className="absolute top-3 -right-1 w-2 h-2 bg-slate-900 border-r border-t border-slate-600 rotate-45" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-medium text-white">
                              {therapist.approvedDocuments}/{therapist.documentCount}
                            </span>
                            <span className="text-xs text-slate-400">
                              {therapist.pendingDocuments > 0 && `${therapist.pendingDocuments} Pending`}
                              {therapist.expiredDocuments > 0 && ` · ${therapist.expiredDocuments} פגי תוקף`}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            therapist.documentComplianceRate >= 90
                              ? 'bg-green-500/20 text-green-400'
                              : therapist.documentComplianceRate >= 75
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {therapist.documentComplianceRate}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-slate-300">
                          {therapist.totalSessions}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-xs text-slate-400">{config.action}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileTextIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium">Important note לציs</p>
            <p className="mt-1">
              דף זה Displays מידע סטטיסטי על ציs למסמכs בלבד.
              <strong> תוYes קליני אינו נגיש לManagers</strong> בהתאם לדרישs Privates רפואית.
              All theנתונs נשאבs ישירs ממסד הנתונs של הפלטפורמה בReal-Time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
