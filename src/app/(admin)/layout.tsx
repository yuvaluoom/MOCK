'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { trpc } from '@/lib/trpc/client';
import { Logo } from '@/components/ui/Logo';

// ============ ICONS ============

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

const ComplianceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
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

const ImportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

// ============ GROUPED NAVIGATION ============

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navigationGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Users', href: '/admin/users', icon: UsersIcon },
      { name: 'Therapists', href: '/admin/therapists', icon: TherapistIcon },
      { name: 'Sessions', href: '/admin/sessions', icon: SessionsIcon },
    ],
  },
  {
    label: 'Communication',
    items: [
      { name: 'Messages', href: '/admin/messages', icon: MessagesIcon },
      { name: 'Email Center', href: '/admin/emails', icon: MailIcon },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Reports', href: '/admin/reports', icon: ReportsIcon },
      { name: 'Compliance', href: '/admin/compliance', icon: ComplianceIcon },
      { name: 'Audit Log', href: '/admin/audit', icon: AuditIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Import Data', href: '/admin/import', icon: ImportIcon },
      { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
    ],
  },
];

// Flat list for resolving page names
const allNavItems = navigationGroups.flatMap((g) => g.items);

function getPageTitle(pathname: string): string {
  // Exact match first
  const exact = allNavItems.find((item) => item.href === pathname);
  if (exact) return exact.name;
  // Prefix match (e.g. /admin/therapists/123)
  const prefix = allNavItems
    .filter((item) => item.href !== '/admin')
    .find((item) => pathname.startsWith(item.href));
  if (prefix) return prefix.name;
  return 'Dashboard';
}

// ============ LAYOUT ============

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auth guard: require ADMIN role cookie
  useEffect(() => {
    setMounted(true);
    try {
      const raw = document.cookie
        .split('; ')
        .find((c) => c.startsWith('next-auth.session-token='));
      if (!raw) {
        router.replace('/login/admin');
        return;
      }
      const decoded = JSON.parse(decodeURIComponent(raw.split('=').slice(1).join('=')));
      if (decoded.role !== 'ADMIN') {
        router.replace('/login/admin');
        return;
      }
    } catch {
      router.replace('/login/admin');
    }
  }, [router]);

  const { data: stats } = trpc.admin.getDashboardStats.useQuery();

  const handleLogout = () => {
    document.cookie = 'next-auth.session-token=; path=/; max-age=0';
    router.push('/login/admin');
  };

  if (!mounted) return null;

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Admin Badge */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <Logo size="md" href="/admin" />
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-700 rounded-md tracking-wide uppercase">
                Admin
              </span>
            </div>
            <button
              type="button"
              className="lg:hidden p-2 -m-2 text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon />
            </button>
          </div>

          {/* Grouped Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navigationGroups.map((group) => (
              <div key={group.label} className="mb-5">
                <p className="px-3 mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/admin' && pathname.startsWith(item.href));
                    const showBadge =
                      item.href === '/admin/therapists' &&
                      stats?.therapists?.awaitingApproval;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={isActive ? 'text-amber-600' : 'text-gray-400'}>
                            <item.icon />
                          </span>
                          {item.name}
                        </span>
                        {showBadge && (
                          <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-amber-500 text-white rounded-full min-w-[20px] text-center">
                            {stats.therapists.awaitingApproval}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Admin info & logout */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-700 font-semibold text-sm">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@matchmind.co.il
                </p>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2.5 w-full px-3 py-2 mt-1 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
              onClick={handleLogout}
            >
              <LogOutIcon />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-gray-200 lg:px-8">
          <button
            type="button"
            className="p-2 -m-2 text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>

          <div className="flex-1 flex items-center gap-4 ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold text-gray-900">
              {pageTitle}
            </h1>
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              System Online
            </span>
          </div>

          {/* Quick stats */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="text-gray-500">
              <span className="text-gray-900 font-semibold">{stats?.patients.total ?? 0}</span> Patients
            </div>
            <div className="text-gray-500">
              <span className="text-gray-900 font-semibold">{stats?.therapists.approved ?? 0}</span> Therapists
            </div>
            <div className="text-gray-500">
              <span className="text-gray-900 font-semibold">{stats?.sessions.total ?? 0}</span> Sessions
            </div>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 relative"
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {(stats?.therapists?.awaitingApproval ?? 0) > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
