'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

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

const verificationStatusConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  Icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  action: string;
}> = {
  VERIFIED: {
    label: 'Verified',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border border-green-200',
    Icon: ShieldCheckIcon,
    tooltip: 'All documents are approved and valid. The therapist meets all compliance requirements.',
    action: 'No action required',
  },
  PENDING_VERIFICATION: {
    label: 'Pending Verification',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border border-amber-200',
    Icon: ClockIcon,
    tooltip: 'Documents have been uploaded but not yet reviewed by the admin team.',
    action: 'Review pending documents',
  },
  PARTIALLY_VERIFIED: {
    label: 'Partially Verified',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border border-blue-200',
    Icon: ShieldAlertIcon,
    tooltip: 'Some documents have been approved, but others are still pending or missing.',
    action: 'Complete the verification process',
  },
  MISSING_DOCUMENTATION: {
    label: 'Missing Documents',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border border-red-200',
    Icon: ShieldXIcon,
    tooltip: 'No documents have been uploaded. The therapist must upload all required documents.',
    action: 'Request document upload',
  },
  EXPIRED_CREDENTIALS: {
    label: 'Expired Credentials',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border border-orange-200',
    Icon: FileWarningIcon,
    tooltip: 'The therapist has documents that have expired. Relevant credentials must be renewed.',
    action: 'Request document renewal',
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
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'en');
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
          <h1 className="text-2xl font-bold text-gray-900">Compliance & Document Verification</h1>
          <p className="text-gray-500 mt-1">Track verification status and compliance of therapists on the platform</p>
        </div>
      </div>

      {/* Alerts for critical issues */}
      {!isLoading && (overallStats?.expiredCreds ?? 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-6 h-6 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700">Critical Alerts</h3>
              <p className="text-sm text-red-600 mt-1">
                {overallStats?.expiredCreds} therapists have expired documents. Please address this urgently.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : overallStats?.verified ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-50">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Verification</p>
              <p className="text-2xl font-bold text-amber-600">
                {isLoading ? '...' : overallStats?.pendingVerification ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-amber-50">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Partially Verified</p>
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? '...' : overallStats?.partiallyVerified ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-50">
              <ShieldAlertIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`bg-white border rounded-xl p-4 ${(overallStats?.missingDocs ?? 0) > 0 ? 'border-red-300' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Missing Documents</p>
              <p className="text-2xl font-bold text-red-600">
                {isLoading ? '...' : overallStats?.missingDocs ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-red-50">
              <ShieldXIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`bg-white border rounded-xl p-4 ${(overallStats?.expiredCreds ?? 0) > 0 ? 'border-orange-300' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-orange-600">
                {isLoading ? '...' : overallStats?.expiredCreds ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-full bg-orange-50">
              <FileWarningIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Compliance Rate */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className={`w-8 h-8 ${(overallStats?.overallComplianceRate ?? 0) >= 75 ? 'text-green-600' : 'text-red-600'}`} />
            <div>
              <p className="text-sm text-gray-500">Overall Compliance Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : `${overallStats?.overallComplianceRate ?? 0}%`}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {overallStats?.totalTherapists ?? 0} Active Therapists
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mt-3">
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
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-gray-900">Verification Status by Therapist</h3>
          <div className="flex gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search therapist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 pl-4 py-2 w-48 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="status">Sort: Status</option>
              <option value="docs">Sort: Compliance %</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Therapist</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification Status</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Compliance</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Required Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTherapists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">No matching therapists found</td>
                  </tr>
                ) : (
                  filteredTherapists.map((therapist) => {
                    const config = verificationStatusConfig[therapist.verificationStatus] ?? verificationStatusConfig.MISSING_DOCUMENTATION;
                    const IconComponent = config.Icon;
                    return (
                      <tr key={therapist.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-sm">
                                {therapist.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 text-sm">{therapist.name}</span>
                              <p className="text-xs text-gray-500">{therapist.email}</p>
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
                              <IconComponent className="w-3.5 h-3.5" />
                              {config.label}
                              <HelpCircleIcon className="w-3 h-3 opacity-50" />
                            </span>
                            {tooltipId === therapist.id && (
                              <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 right-full mr-2">
                                <p className="font-medium mb-1">{config.label}</p>
                                <p className="text-gray-300">{config.tooltip}</p>
                                <p className="text-amber-400 mt-2 font-medium">{config.action}</p>
                                <div className="absolute top-3 -right-1 w-2 h-2 bg-gray-900 rotate-45" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-semibold text-gray-900">
                              {therapist.approvedDocuments}/{therapist.documentCount}
                            </span>
                            <span className="text-xs text-gray-500">
                              {therapist.pendingDocuments > 0 && `${therapist.pendingDocuments} pending`}
                              {therapist.expiredDocuments > 0 && ` · ${therapist.expiredDocuments} expired`}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            therapist.documentComplianceRate >= 90
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : therapist.documentComplianceRate >= 75
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {therapist.documentComplianceRate}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-gray-600">
                          {therapist.totalSessions}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-xs text-gray-500">{config.action}</span>
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileTextIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Important Compliance Note</p>
            <p className="mt-1 text-blue-700">
              This page displays statistical information about document compliance only.
              <strong> Clinical content is not accessible to administrators</strong> in accordance with medical privacy requirements.
              All data is pulled directly from the platform database in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
