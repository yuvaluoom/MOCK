'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

type UserRole = 'PATIENT' | 'THERAPIST' | 'ADMIN';
type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

const roleColors: Record<UserRole, string> = {
  PATIENT: 'bg-blue-50 text-blue-700 border-blue-200',
  THERAPIST: 'bg-green-50 text-green-700 border-green-200',
  ADMIN: 'bg-amber-50 text-amber-700 border-amber-200',
};

const statusColors: Record<UserStatus, string> = {
  PENDING_VERIFICATION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
  DEACTIVATED: 'bg-gray-100 text-gray-500 border-gray-200',
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

const MoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading } = trpc.admin.getUsers.useQuery({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page,
    limit: 10,
  });

  const handleAction = (userId: string, action: string) => {
    setActionMenu(null);
    switch (action) {
      case 'view':
        showToast('User profile opened');
        break;
      case 'suspend':
        showToast('User suspended successfully');
        break;
      case 'activate':
        showToast('User activated successfully');
        break;
      case 'email':
        window.location.href = '/admin/emails';
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">
            View and manage all platform users
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {data ? `${data.pagination.total} users total` : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pr-10 pl-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setPage(1);
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <option value="">All Roles</option>
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
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_VERIFICATION">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No users found
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
                      : 'Unknown';

                  return (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${roleColors[user.role as UserRole] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {user.role === 'PATIENT' ? 'Patient' : user.role === 'THERAPIST' ? 'Therapist' : user.role === 'ADMIN' ? 'Manager' : user.role === 'OWNER' ? 'Owner' : user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[user.status as UserStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {user.status === 'ACTIVE' ? 'Active' : user.status === 'PENDING_VERIFICATION' ? 'Pending' : user.status === 'SUSPENDED' ? 'Suspended' : user.status === 'DEACTIVATED' ? 'Deactivated' : user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          {user.role === 'THERAPIST' && user.therapist ? (
                            <div className="flex items-center gap-2 justify-end">
                              <a
                                href={`/admin/therapists/${user.id.replace('user-', 'therapist-')}`}
                                className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                              >
                                Manage
                              </a>
                              <button
                                onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                              >
                                <MoreIcon />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <MoreIcon />
                            </button>
                          )}

                          {actionMenu === user.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                <button
                                  onClick={() => handleAction(user.id, 'view')}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  View Profile
                                </button>
                                <button
                                  onClick={() => handleAction(user.id, 'email')}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Send Email
                                </button>
                                {user.status === 'ACTIVE' && (
                                  <button
                                    onClick={() => handleAction(user.id, 'suspend')}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Suspend User
                                  </button>
                                )}
                                {user.status === 'SUSPENDED' && (
                                  <button
                                    onClick={() => handleAction(user.id, 'activate')}
                                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                                  >
                                    Activate User
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * data.pagination.limit + 1} to{' '}
              {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} users
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
