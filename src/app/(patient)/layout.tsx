'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { trpc } from '@/lib/trpc/client';
import { NotificationBell } from '@/components/NotificationBell';
import { Logo } from '@/components/ui/Logo';

// Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
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

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Recommended Therapists', href: '/matches', icon: UsersIcon },
  { name: 'My Sessions', href: '/sessions', icon: CalendarIcon },
  { name: 'Messages', href: '/messages', icon: MessageIcon },
  { name: 'Matching Questionnaire', href: '/questionnaire', icon: ClipboardIcon },
  { name: 'My Profile', href: '/profile', icon: UserIcon },
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auth guard: require PATIENT role cookie
  useEffect(() => {
    setMounted(true);
    try {
      const raw = document.cookie
        .split('; ')
        .find((c) => c.startsWith('next-auth.session-token='));
      if (!raw) {
        router.replace('/login/patient');
        return;
      }
      const decoded = JSON.parse(decodeURIComponent(raw.split('=').slice(1).join('=')));
      if (decoded.role === 'ADMIN') {
        router.replace('/admin');
        return;
      }
    } catch {
      router.replace('/login/patient');
    }
  }, [router]);

  // Get user profile from tRPC
  const { data: profile } = trpc.patient.getProfile.useQuery();

  const userName = profile ? `${profile.firstName} ${profile.lastName}` : 'Patient';
  const userEmail = profile?.email ?? '';
  const questionnaireCompleted = profile?.questionnaireCompleted ?? false;

  const handleLogout = () => {
    document.cookie = 'next-auth.session-token=; path=/; max-age=0';
    router.push('/login/patient');
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Questionnaire guard: most pages require a completed questionnaire
  useEffect(() => {
    const openPaths = ['/questionnaire', '/profile'];
    const isOpen = openPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

    if (!isOpen && profile && !questionnaireCompleted) {
      router.replace('/questionnaire');
    }
  }, [pathname, profile, questionnaireCompleted, router]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Fixed position */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-lg flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b flex-shrink-0">
          <Logo size="md" href="/dashboard" />
          <button
            type="button"
            className="lg:hidden p-2 -m-2 text-gray-500 hover:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-500"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
          >
            <XIcon />
          </button>
        </div>

        {/* Questionnaire Status Banner */}
        {!questionnaireCompleted && (
          <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex-shrink-0">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Complete your questionnaire</p>
                <p className="text-xs text-amber-600 mt-0.5">Get personalized therapist matches</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Primary navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isQuestionnaire = item.href === '/questionnaire';
            const showBadge = isQuestionnaire && !questionnaireCompleted;
            const requiresQuestionnaire = ['/matches', '/sessions'].includes(item.href);
            const isLocked = requiresQuestionnaire && !questionnaireCompleted;

            return (
              <Link
                key={item.name}
                href={isLocked ? '/questionnaire' : item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-calm-500 focus:ring-offset-2',
                  isActive
                    ? 'bg-calm-50 text-calm-700 border border-calm-200'
                    : isLocked
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={isLocked ? 'Complete the questionnaire first' : undefined}
              >
                <item.icon />
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full" aria-label="Action needed" />
                )}
                {isLocked && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info & logout - Fixed at bottom */}
        <div className="p-4 border-t flex-shrink-0 bg-white">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-calm-100 to-trust-100 flex items-center justify-center flex-shrink-0">
              <span className="text-calm-700 font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-3 w-full px-4 py-3 mt-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-calm-500"
            onClick={handleLogout}
          >
            <LogOutIcon />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content wrapper - Offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        {/* Top bar - Sticky */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b lg:px-8 flex-shrink-0">
          <button
            type="button"
            className="p-2 -m-2 text-gray-500 hover:text-gray-700 lg:hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            <MenuIcon />
          </button>

          {/* Page title placeholder for mobile */}
          <div className="flex-1 lg:hidden">
            <h1 className="text-lg font-semibold text-gray-900 ml-3">
              {navigation.find(n => n.href === pathname)?.name || 'MatchMind'}
            </h1>
          </div>

          <div className="flex-1 hidden lg:block" />

          {/* Notifications */}
          <NotificationBell />
        </header>

        {/* Page content - Fills remaining space */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t bg-white px-4 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} MatchMind. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-900 focus:outline-none focus:underline">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-900 focus:outline-none focus:underline">Terms of Service</Link>
              <Link href="/accessibility" className="hover:text-gray-900 focus:outline-none focus:underline">Accessibility</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
