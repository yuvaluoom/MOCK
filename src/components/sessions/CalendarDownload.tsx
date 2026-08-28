'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CalendarDownloadProps {
  sessionId: string;
  scheduledAt: Date | string;
  duration: number;
  therapistName: string;
  isOnline: boolean;
  meetingUrl?: string;
  location?: string;
  patientName?: string;
  patientEmail?: string;
  therapistEmail?: string;
}

/**
 * Calendar download component with multi-provider support
 * Generates calendar events for Google, Outlook, Yahoo, Apple, and ICS
 */
export function CalendarDownload({
  sessionId,
  scheduledAt,
  duration,
  therapistName,
  isOnline,
  meetingUrl,
  location,
  patientName,
  patientEmail,
  therapistEmail,
}: CalendarDownloadProps) {
  const [isOpen, setIsOpen] = useState(false);

  const startDate = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt;
  const endDate = new Date(startDate.getTime() + duration * 60000);

  // Format dates for various calendar formats
  const formatDateISO = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
  const formatDateForUrl = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';

  const title = encodeURIComponent(`Therapy Session with ${therapistName}`);
  const titleHe = encodeURIComponent(`Therapy session with ${therapistName}`);

  let description = `Therapy session with ${therapistName}\n`;
  description += `Duration: ${duration} minutes\n`;
  description += isOnline ? 'Online session' : 'In-person session';
  if (meetingUrl) {
    description += `\n\nJoin meeting: ${meetingUrl}`;
  }
  description += '\n\n---\nScheduled via MatchMind';

  const descEncoded = encodeURIComponent(description);
  const locationText = isOnline ? (meetingUrl || 'Online') : (location || 'See details');
  const locationEncoded = encodeURIComponent(locationText);

  // Calendar URLs
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateForUrl(startDate)}/${formatDateForUrl(endDate)}&details=${descEncoded}&location=${locationEncoded}`;

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${descEncoded}&location=${locationEncoded}`;

  const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${title}&st=${formatDateForUrl(startDate)}&et=${formatDateForUrl(endDate)}&desc=${descEncoded}&in_loc=${locationEncoded}`;

  // Generate ICS content
  const generateICS = () => {
    const uid = `session-${sessionId}@matchmind.co.il`;
    const dtstamp = formatDateISO(new Date());
    const dtstart = formatDateISO(startDate);
    const dtend = formatDateISO(endDate);

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MatchMind//Session Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:Therapy Session with ${therapistName}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${locationText}`,
    ];

    // Add organizer if email available
    if (therapistEmail) {
      ics.push(`ORGANIZER;CN=${therapistName}:mailto:${therapistEmail}`);
    }

    // Add attendee if email available
    if (patientEmail && patientName) {
      ics.push(`ATTENDEE;CN=${patientName}:mailto:${patientEmail}`);
    }

    // Add meeting URL
    if (meetingUrl) {
      ics.push(`URL:${meetingUrl}`);
    }

    // Add reminder (1 hour before)
    ics.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Session reminder',
      'END:VALARM'
    );

    ics.push('END:VEVENT', 'END:VCALENDAR');

    return ics.join('\r\n');
  };

  const downloadICS = () => {
    const icsContent = generateICS();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `matchmind-session-${sessionId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const openCalendar = (url: string) => {
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Add to Calendar
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border z-20 py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
              Choose Calendar Provider
            </div>

            <button
              onClick={() => openCalendar(googleUrl)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Calendar
            </button>

            <button
              onClick={() => openCalendar(outlookUrl)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576-.16.152-.354.228-.585.228h-8.547v-6.18l1.106.852c.168.14.372.21.612.21.24 0 .445-.07.612-.21L24 7.387zM14.63 5.106h8.547c.231 0 .425.076.585.228.158.152.238.346.238.576v.33l-6.882 5.304-2.488-1.918V5.106zM8.12 6.27c.197 0 .39.04.58.123.19.08.352.197.487.348l.06.07c.073.084.138.17.195.257a1.486 1.486 0 01.178.376c.03.1.046.198.052.295.006.097.009.19.009.28v1.11c0 .286-.045.52-.137.7a.923.923 0 01-.42.43c-.187.093-.423.14-.707.14H6.29v-4.13h1.832zm-.242.89h-.72v2.35h.73c.156 0 .27-.037.342-.11.072-.076.108-.21.108-.404V7.67c0-.193-.036-.328-.108-.403-.072-.077-.19-.107-.352-.107zM2.133 6.27v4.13H.867V6.27h1.266zm5.134 4.63l-1.99-2.75v2.75h-1.01V6.27h.87l2.02 2.8V6.27h1.01v4.63h-.9zM0 13.87l8.12 5.3V7.387L0 12.687v1.183z"/>
              </svg>
              Outlook
            </button>

            <button
              onClick={() => openCalendar(yahooUrl)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#6001D2" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.75 14.91l-2.29-3.56 2.5-3.88h-2.14l-1.48 2.48-1.45-2.48H9.66l2.48 3.88-2.55 4.06h2.14l1.71-2.9 1.67 2.9h2.14l-.5-.5z"/>
              </svg>
              Yahoo Calendar
            </button>

            <div className="border-t my-1" />

            <button
              onClick={downloadICS}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .ics (Apple/Other)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
