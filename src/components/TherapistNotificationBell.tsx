'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/cn';

// Notification type configurations
const notificationTypeConfig: Record<string, { icon: JSX.Element; color: string }> = {
  NEW_PATIENT_REQUEST: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" x2="19" y1="8" y2="14" />
        <line x1="22" x2="16" y1="11" y2="11" />
      </svg>
    ),
    color: 'text-green-600 bg-green-100',
  },
  ADMIN_MESSAGE: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      </svg>
    ),
    color: 'text-amber-600 bg-amber-100',
  },
  PROFILE_APPROVED: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    color: 'text-green-600 bg-green-100',
  },
  PROFILE_REJECTED: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" x2="9" y1="9" y2="15" />
        <line x1="9" x2="15" y1="9" y2="15" />
      </svg>
    ),
    color: 'text-red-600 bg-red-100',
  },
  DOCUMENT_REQUEST: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" x2="12" y1="18" y2="12" />
        <line x1="9" x2="15" y1="15" y2="15" />
      </svg>
    ),
    color: 'text-blue-600 bg-blue-100',
  },
  MESSAGE_NEW: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
    color: 'text-blue-600 bg-blue-100',
  },
  SESSION_REMINDER: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
    color: 'text-purple-600 bg-purple-100',
  },
  SESSION_CANCELLED: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <line x1="10" x2="14" y1="11" y2="15" />
        <line x1="14" x2="10" y1="11" y2="15" />
      </svg>
    ),
    color: 'text-red-600 bg-red-100',
  },
};

// Icons
const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

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

interface TherapistNotification {
  id: string;
  type: string;
  title: string;
  titleHe: string;
  message: string;
  messageHe: string;
  link: string | null;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  metadata?: {
    patientName?: string;
    patientId?: string;
    sessionId?: string;
    documentType?: string;
    adminNote?: string;
  };
}

export function TherapistNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch therapist notifications
  const { data, refetch } = trpc.therapist.getNotifications.useQuery(
    { limit: 15 },
    {
      refetchInterval: 15000, // More frequent polling for therapists (15 seconds)
      staleTime: 10000,
    }
  );

  const markAsReadMutation = trpc.therapist.markNotificationAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllAsReadMutation = trpc.therapist.markAllNotificationsAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const notifications: TherapistNotification[] = data?.notifications ?? [];
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

  const getNotificationConfig = (type: string) => {
    return notificationTypeConfig[type] || {
      icon: <BellIcon className="w-5 h-5" />,
      color: 'text-gray-600 bg-gray-100',
    };
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
        {/* Unread badge with animation */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse shadow-lg"
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
          className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border overflow-hidden z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-calm-50 to-trust-50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-calm-600 hover:text-calm-700 focus:outline-none focus:underline font-medium"
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
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No new notifications</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you when there are updates</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100" role="list">
                {notifications.map((notification) => {
                  const config = getNotificationConfig(notification.type);
                  const isUrgent = notification.priority === 'urgent' || notification.priority === 'high';

                  return (
                    <li key={notification.id}>
                      <Link
                        href={notification.link || '#'}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={cn(
                          'flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50',
                          !notification.isRead && 'bg-calm-50/50',
                          isUrgent && !notification.isRead && 'border-r-4 border-red-500'
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          'flex-shrink-0 p-2 rounded-lg',
                          config.color
                        )}>
                          {config.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={cn(
                                'text-sm text-gray-900',
                                !notification.isRead && 'font-semibold'
                              )}>
                                {notification.titleHe}
                              </p>
                              {isUrgent && (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded mt-1">
                                  Urgent
                                </span>
                              )}
                            </div>
                            {!notification.isRead && (
                              <span className="flex-shrink-0 w-2 h-2 bg-calm-500 rounded-full mt-1.5" aria-label="New" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.messageHe}
                          </p>
                          {/* Metadata */}
                          {notification.metadata?.patientName && (
                            <p className="text-xs text-calm-600 mt-1 font-medium">
                              Patient: {notification.metadata.patientName}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1.5">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50">
              <Link
                href="/therapist/notifications"
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
