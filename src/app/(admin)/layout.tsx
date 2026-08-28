'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { trpc } from '@/lib/trpc/client';
import { Logo } from '@/components/ui/Logo';

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TherapistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" />
    <path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
    <path d="m9 22 3-3 3 3" />
    <path d="M12 6v3" />
    <path d="M10 8h4" />
  </svg>
);

const SessionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

const MessagesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
  </svg>
);

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const AuditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    <path d="m15 5 3 3" />
  </svg>
);

const ImportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'Therapist Approval', href: '/admin/therapists', icon: TherapistIcon },
  { name: 'Email Center', href: '/admin/emails', icon: MailIcon },
  { name: 'Data Import', href: '/admin/import', icon: ImportIcon },
  { name: 'Session Review', href: '/admin/sessions', icon: SessionsIcon },
  { name: 'Message Management', href: '/admin/messages', icon: MessagesIcon },
  { name: 'Reports & Analytics', href: '/admin/reports', icon: ReportsIcon },
  { name: 'Compliance & Verification', href: '/admin/compliance', icon: TherapistIcon },
  { name: 'Audit Log', href: '/admin/audit', icon: AuditIcon },
  { name: 'System Settings', href: '/admin/settings', icon: SettingsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get dashboard stats for notifications badge
  const { data: stats } = trpc.admin.getDashboardStats.useQuery();

  const handleLogout = () => {
    router.push('/login/admin');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Admin Badge */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Logo size="md" href="/admin" />
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                Admin
              </span>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 -m-2 text-slate-400"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              const showBadge = item.href === '/admin/therapists' && stats?.therapists?.awaitingApproval;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <item.icon />
                    {item.name}
                  </span>
                  {showBadge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full">
                      {stats.therapists.awaitingApproval}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin info & logout */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-medium">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-400 truncate">
                  admin@matchmind.co.il
                </p>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 mt-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
              onClick={handleLogout}
            >
              <LogOutIcon />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-slate-800 border-b border-slate-700 lg:px-8">
          <button
            type="button"
            className="p-2 -m-2 text-slate-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>

          <div className="flex-1 flex items-center gap-4 ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-white">
              Supervision Portal
            </h1>
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
              System Online
            </span>
          </div>

          {/* Quick stats */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="text-slate-400">
              <span className="text-white font-medium">{stats?.patients.total ?? 0}</span> Patients
            </div>
            <div className="text-slate-400">
              <span className="text-white font-medium">{stats?.therapists.approved ?? 0}</span> Therapists
            </div>
            <div className="text-slate-400">
              <span className="text-white font-medium">{stats?.sessions.total ?? 0}</span> Sessions
            </div>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="ml-4 p-2 text-slate-400 hover:text-white relative"
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {(stats?.therapists?.awaitingApproval ?? 0) > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
