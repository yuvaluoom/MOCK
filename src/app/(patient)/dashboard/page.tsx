'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';

// Icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m12 5-7 7 7 7" />
    <path d="M19 12H5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-500">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusLabel(status: string): { text: string; className: string } {
  switch (status) {
    case 'APPROVED':
      return { text: 'Approved', className: 'bg-green-100 text-green-700' };
    case 'PENDING_THERAPIST_APPROVAL':
      return { text: 'Pending Approval', className: 'bg-amber-100 text-amber-700' };
    default:
      return { text: status, className: 'bg-gray-100 text-gray-700' };
  }
}

export default function PatientDashboard() {
  // Fetch profile to check questionnaire status
  const { data: profile, isLoading: profileLoading } = trpc.patient.getProfile.useQuery();

  // Fetch top matches
  const { data: matchesData, isLoading: matchesLoading } = trpc.patient.getMatches.useQuery({
    page: 1,
    limit: 3,
  });

  // Fetch upcoming sessions
  const { data: sessionsData, isLoading: sessionsLoading } = trpc.patient.getSessions.useQuery({
    page: 1,
    limit: 3,
    upcoming: true,
  });

  const questionnaireCompleted = profile?.questionnaireCompleted ?? false;
  const matches = matchesData?.matches ?? [];
  const sessions = sessionsData?.sessions ?? [];
  const firstName = profile?.firstName ?? 'Guest';

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Welcome section */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Hello, {firstName}!</h1>
        <p className="text-sm text-gray-600">
          Manage your sessions and find recommended therapists.
        </p>
      </div>

      {/* Quick actions / Status cards */}
      {!questionnaireCompleted && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-3">
            <ClipboardIcon />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">Complete the matching questionnaire</h3>
              <p className="text-xs text-gray-600">Get personalized therapist recommendations</p>
            </div>
            <Link href="/questionnaire">
              <Button variant="calm" size="sm">Start</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {questionnaireCompleted && matches.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 py-3">
            <CheckCircleIcon />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">We found {matches.length} matches!</h3>
              <p className="text-xs text-gray-600">Recommended therapists are waiting for you</p>
            </div>
            <Link href="/matches">
              <Button variant="calm" size="sm">View</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Upcoming Sessions</CardTitle>
              <CardDescription className="text-xs">Your next sessions</CardDescription>
            </div>
            <Link href="/sessions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                All
                <ArrowLeftIcon />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-calm-600"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon />
                <p className="text-gray-500 mt-2">No upcoming sessions</p>
                <Link href="/matches">
                  <Button variant="outline" size="sm" className="mt-4">
                    Find a Therapist
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => {
                  const status = getStatusLabel(session.status);
                  const scheduledDate = new Date(session.scheduledAt);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                    >
                      {/* Therapist avatar */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-calm-100 flex items-center justify-center">
                        <span className="text-calm-700 font-medium">
                          {session.therapist?.firstName?.charAt(0) ?? 'T'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {session.therapist?.firstName} {session.therapist?.lastName}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${status.className}`}>
                            {status.text}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <CalendarIcon />
                            {formatDate(scheduledDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon />
                            {formatTime(scheduledDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            {session.isOnline ? <VideoIcon /> : <MapPinIcon />}
                            {session.isOnline ? 'Online' : 'In-Person'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Matches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Recommended Therapists</CardTitle>
              <CardDescription className="text-xs">Your best matches</CardDescription>
            </div>
            <Link href="/matches">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                All
                <ArrowLeftIcon />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {matchesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-calm-600"></div>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Complete the questionnaire to get matches</p>
                <Link href="/questionnaire">
                  <Button variant="outline" size="sm" className="mt-4">
                    Start Questionnaire
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {matches.map((match) => (
                  <Link
                    key={match.id}
                    href={match.therapistId ? `/therapist/${match.therapistId}` : '/matches'}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:shadow-sm hover:border-calm-200 transition-all"
                  >
                    {/* Therapist avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-calm-100 flex items-center justify-center">
                      <span className="text-calm-700 font-medium">
                        {match.therapist?.firstName?.charAt(0) ?? 'T'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {match.therapist?.firstName} {match.therapist?.lastName}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {match.therapist?.specializations?.slice(0, 2).map((spec) => (
                          <span
                            key={spec}
                            className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Match score */}
                    <div className="flex-shrink-0 text-center">
                      <div className="w-11 h-11 rounded-full bg-calm-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-calm-700">
                          {match.overallScore}%
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick tips */}
      <Card className="bg-trust-50 border-trust-200">
        <CardContent className="py-3">
          <h3 className="font-medium text-gray-900 text-sm mb-1">Tip: Choosing a Therapist</h3>
          <p className="text-xs text-gray-600">
            Our matching is based on psychological science, but your personal feeling matters too. Read profiles and choose someone you feel a connection with.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
