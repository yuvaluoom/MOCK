'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

type UserRole = 'PATIENT' | 'THERAPIST' | 'ADMIN';
type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

const roleColors: Record<UserRole, string> = {
  PATIENT: 'bg-blue-500/20 text-blue-400',
  THERAPIST: 'bg-green-500/20 text-green-400',
  ADMIN: 'bg-amber-500/20 text-amber-400',
};

const statusColors: Record<UserStatus, string> = {
  PENDING_VERIFICATION: 'bg-yellow-500/20 text-yellow-400',
  ACTIVE: 'bg-green-500/20 text-green-400',
  SUSPENDED: 'bg-red-500/20 text-red-400',
  DEACTIVATED: 'bg-slate-500/20 text-slate-400',
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

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.admin.getUsers.useQuery({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page,
    limit: 10,
  });

  // Status updates are handled through specific therapist actions (suspend, etc.)
  // For now, status display is read-only until updateUserStatus is implemented

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">
            View and manage all platform users
          </p>
        </div>
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
              placeholder="Search לפי Email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pr-10 pl-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All theתפקידs</option>
            <option value="PATIENT">Patient</option>
            <option value="THERAPIST">Therapist</option>
            <option value="ADMIN">Manager</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | '');
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All theStatuss</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_VERIFICATION">Pending</option>
            <option value="SUSPENDED">edTime</option>
            <option value="DEACTIVATED">edSat</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">User</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">תפקיד</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">הצטרף</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No Foundor Users
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => {
                  const name =
                    user.patient
                      ? `${user.patient.firstName} ${user.patient.lastName}`
                      : user.therapist
                      ? `${user.therapist.firstName} ${user.therapist.lastName}`
                      : (user.role === 'ADMIN' || user.role === 'OWNER')
                      ? user.email.split('@')[0]
                      : 'No Known';

                  return (
                    <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="text-slate-300 font-medium">
                              {name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${roleColors[user.role as UserRole]}`}>
                          {user.role === 'PATIENT' ? 'Patient' : user.role === 'THERAPIST' ? 'Therapist' : user.role === 'ADMIN' ? 'Manager' : user.role === 'OWNER' ? 'בעלs' : user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[user.status as UserStatus]}`}>
                          {user.status === 'ACTIVE' ? 'Active' : user.status === 'PENDING_VERIFICATION' ? 'Pending Noימs' : user.status === 'SUSPENDED' ? 'edTime' : user.status === 'DEACTIVATED' ? 'edSat' : user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-6 py-4 text-left">
                        {user.role === 'THERAPIST' && user.therapist ? (
                          <a
                            href={`/admin/therapists/${user.id.replace('user-', 'therapist-')}`}
                            className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                          >
                            Management
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
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
              {data.pagination.total} Users
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
    </div>
  );
}
