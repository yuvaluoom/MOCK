/**
 * Calendar Export Utilities
 *
 * Generates ICS (iCalendar) files and calendar URLs for:
 * - Google Calendar
 * - Apple Calendar
 * - Outlook
 * - Any standard calendar app
 *
 * Follows RFC 5545 (iCalendar) specification
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  isOnline?: boolean;
  meetingUrl?: string;
  organizerName?: string;
  organizerEmail?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  reminder?: number; // minutes before event
  uid?: string; // unique identifier
}

/**
 * Generate ICS file content (RFC 5545 compliant)
 */
export function generateICS(event: CalendarEvent): string {
  const uid = event.uid || `${Date.now()}@matchmind.co.il`;
  const now = formatDateToICS(new Date());
  const start = formatDateToICS(event.startDate);
  const end = formatDateToICS(event.endDate);

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MatchMind//Session Calendar//HE
CALSCALE:GREGORIAN
METHOD:REQUEST
X-WR-CALNAME:MatchMind Sessions
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${escapeICSText(event.title)}`;

  if (event.description) {
    ics += `\nDESCRIPTION:${escapeICSText(event.description)}`;
  }

  if (event.location) {
    ics += `\nLOCATION:${escapeICSText(event.location)}`;
  }

  if (event.isOnline && event.meetingUrl) {
    ics += `\nURL:${event.meetingUrl}`;
    ics += `\nX-MICROSOFT-CDO-BUSYSTATUS:BUSY`;
  }

  if (event.organizerEmail) {
    ics += `\nORGANIZER;CN="${event.organizerName || 'MatchMind'}":mailto:${event.organizerEmail}`;
  }

  if (event.attendeeEmail) {
    ics += `\nATTENDEE;CN="${event.attendeeName || 'Attendee'}";RSVP=TRUE:mailto:${event.attendeeEmail}`;
  }

  // Add reminder (alarm)
  if (event.reminder) {
    ics += `
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:${escapeICSText(event.title)} - תזכורת
TRIGGER:-PT${event.reminder}M
END:VALARM`;
  }

  ics += `
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return ics;
}

/**
 * Download ICS file
 */
export function downloadICS(event: CalendarEvent, filename?: string): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `session-${formatDateForFilename(event.startDate)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateToGoogle(event.startDate)}/${formatDateToGoogle(event.endDate)}`,
  });

  if (event.description) {
    params.set('details', event.description);
  }

  if (event.location) {
    params.set('location', event.location);
  } else if (event.isOnline && event.meetingUrl) {
    params.set('location', event.meetingUrl);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate Apple Calendar URL (webcal protocol)
 * Note: This requires hosting the ICS file
 */
export function getAppleCalendarUrl(icsUrl: string): string {
  return icsUrl.replace('https://', 'webcal://').replace('http://', 'webcal://');
}

/**
 * Generate Outlook Web URL
 */
export function getOutlookUrl(event: CalendarEvent): string {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
    subject: event.title,
  });

  if (event.description) {
    params.set('body', event.description);
  }

  if (event.location) {
    params.set('location', event.location);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate Yahoo Calendar URL
 */
export function getYahooCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.yahoo.com/';
  const duration = Math.floor((event.endDate.getTime() - event.startDate.getTime()) / 60000);
  const hours = Math.floor(duration / 60).toString().padStart(2, '0');
  const minutes = (duration % 60).toString().padStart(2, '0');

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatDateToYahoo(event.startDate),
    dur: `${hours}${minutes}`,
  });

  if (event.description) {
    params.set('desc', event.description);
  }

  if (event.location) {
    params.set('in_loc', event.location);
  }

  return `${baseUrl}?${params.toString()}`;
}

// Helper functions

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function formatDateToGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, 15) + 'Z';
}

function formatDateToYahoo(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, 15);
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0];
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Create session event from session data
 */
export function createSessionEvent(session: {
  therapistName: string;
  patientName?: string;
  scheduledAt: Date;
  duration: number; // minutes
  isOnline: boolean;
  location?: string;
  meetingUrl?: string;
  notes?: string;
}): CalendarEvent {
  const endDate = new Date(session.scheduledAt);
  endDate.setMinutes(endDate.getMinutes() + session.duration);

  let description = `Therapy session with ${session.therapistName}`;
  if (session.notes) {
    description += `\n\n${session.notes}`;
  }

  return {
    title: `Session With ${session.therapistName}`,
    description,
    startDate: session.scheduledAt,
    endDate,
    isOnline: session.isOnline,
    location: session.isOnline ? 'Online Session' : session.location,
    meetingUrl: session.meetingUrl,
    reminder: 60, // 1 hour before
  };
}
