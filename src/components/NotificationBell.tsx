'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/cn';

// Icons
const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

// Notification type icons mapping
function getNotificationIcon(type: string) {
  switch (type) {
    case 'MATCH_NEW':
    case 'MATCH_UPDATED':
      return <UsersIcon className="w-5 h-5 text-calm-600" />;
    case 'MESSAGE_NEW':
      return <MessageIcon className="w-5 h-5 text-blue-600" />;
    case 'SESSION_APPROVED':
    case 'SESSION_CANCELLED':
    case 'SESSION_REMINDER':
      return <CalendarIcon className="w-5 h-5 text-green-600" />;
    case 'THERAPIST_RESPONSE':
      return <CheckIcon className="w-5 h-5 text-purple-600" />;
    default:
      return <InfoIcon className="w-5 h-5 text-gray-600" />;
  }
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(date).toLocaleDateString('en-US');
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch notifications
  const { data, refetch } = trpc.notification.getAll.useQuery(
    { limit: 10 },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNotificationClick = (notificationId: string) => {
    markAsReadMutation.mutate({ notificationId });
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-500 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` - ${unreadCount} new` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BellIcon className="w-6 h-6" />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border overflow-hidden z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-calm-600 hover:text-calm-700 focus:outline-none focus:underline"
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-calm-500"
                aria-label="Close notifications"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100" role="list">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <Link
                      href={notification.link || '#'}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={cn(
                        'flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50',
                        !notification.isRead && 'bg-calm-50/50'
                      )}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'text-sm text-gray-900',
                            !notification.isRead && 'font-medium'
                          )}>
                            {notification.titleHe}
                          </p>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-calm-500 rounded-full mt-1.5" aria-label="New" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                          {notification.messageHe}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50">
              <Link
                href="/notifications"
                className="block text-center text-sm text-calm-600 hover:text-calm-700 font-medium focus:outline-none focus:underline"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
