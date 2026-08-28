'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDownload } from '@/components/sessions/CalendarDownload';

type TabType = 'upcoming' | 'pending' | 'past';

// Generate dynamic dates for demo
const getUpcomingDate = (daysFromNow: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
};

interface SessionData {
  id: string;
  patientName: string;
  patientEmail: string;
  date: Date;
  type: 'online' | 'in-person';
  status: 'confirmed' | 'pending' | 'completed';
  meetingUrl?: string;
  paymentType: 'HMO' | 'PRIVATE';
  healthFund?: string;
  price?: number;
}

export default function TherapistSessionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  // Dynamic session data for investor demo
  const sessions: Record<TabType, SessionData[]> = {
    upcoming: [
      { id: 'session-1', patientName: 'Israel Israeli', patientEmail: 'patient@example.com', date: getUpcomingDate(2, 10), type: 'online', status: 'confirmed', meetingUrl: 'https://meet.google.com/abc-defg-hij', paymentType: 'HMO', healthFund: 'MACCABI' },
      { id: 'session-2', patientName: 'Sarah Cohen', patientEmail: 'sarah@example.com', date: getUpcomingDate(2, 14), type: 'in-person', status: 'confirmed', paymentType: 'PRIVATE', price: 450 },
      { id: 'session-3', patientName: 'David Levi', patientEmail: 'david@example.com', date: getUpcomingDate(5, 11), type: 'online', status: 'confirmed', meetingUrl: 'https://zoom.us/j/123456789', paymentType: 'HMO', healthFund: 'CLALIT' },
    ],
    pending: [
      { id: 'session-4', patientName: 'Miriam Abraham', patientEmail: 'miriam@example.com', date: getUpcomingDate(7, 9), type: 'online', status: 'pending', paymentType: 'PRIVATE', price: 450 },
      { id: 'session-5', patientName: 'Yosef David', patientEmail: 'yosef@example.com', date: getUpcomingDate(10, 16), type: 'in-person', status: 'pending', paymentType: 'HMO', healthFund: 'MEUHEDET' },
    ],
    past: [
      { id: 'session-6', patientName: 'Israel Israeli', patientEmail: 'patient@example.com', date: getUpcomingDate(-7, 10), type: 'online', status: 'completed', paymentType: 'HMO', healthFund: 'MACCABI' },
      { id: 'session-7', patientName: 'Sarah Cohen', patientEmail: 'sarah@example.com', date: getUpcomingDate(-14, 11), type: 'in-person', status: 'completed', paymentType: 'PRIVATE', price: 450 },
    ],
  };

  const tabs = [
    { id: 'upcoming' as TabType, label: 'Upcoming', count: sessions.upcoming.length },
    { id: 'pending' as TabType, label: 'Pending Approval', count: sessions.pending.length },
    { id: 'past' as TabType, label: 'History', count: sessions.past.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
        <p className="text-gray-600 mt-1">View and manage your sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-calm-600 text-calm-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-calm-100 text-calm-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {sessions[activeTab].map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-calm-100 flex items-center justify-center">
                    <span className="text-calm-700 font-medium text-lg">
                      {session.patientName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{session.patientName}</p>
                      {session.paymentType === 'HMO' ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {session.healthFund}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Private ₪{session.price}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {session.date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • {session.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      <span className="mx-2">•</span>
                      {session.type === 'online' ? 'Online' : 'In-Person'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.status === 'pending' && (
                    <>
                      <Button size="sm" variant="calm">Approve</Button>
                      <Button size="sm" variant="outline">Decline</Button>
                    </>
                  )}
                  {session.status === 'confirmed' && (
                    <>
                      <CalendarDownload
                        sessionId={session.id}
                        scheduledAt={session.date}
                        duration={50}
                        therapistName="Rachel Cohen"
                        isOnline={session.type === 'online'}
                        meetingUrl={session.meetingUrl}
                        patientName={session.patientName}
                        patientEmail={session.patientEmail}
                        therapistEmail="therapist@matchmind.co.il"
                      />
                      {session.type === 'online' && session.meetingUrl && (
                        <Button size="sm" variant="calm" onClick={() => window.open(session.meetingUrl, '_blank')}>
                          Join Session
                        </Button>
                      )}
                    </>
                  )}
                  {session.status === 'completed' && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))}

            {sessions[activeTab].length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sessions to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
