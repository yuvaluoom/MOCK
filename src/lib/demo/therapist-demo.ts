/**
 * Demo data for the therapist workspace.
 * All dates are computed relative to "now" so the demo never looks stale.
 */

export function daysFromNow(days: number, hour = 10, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function isoDay(days: number): string {
  const d = daysFromNow(days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatShortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeDay(date: Date | string): string {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  if (diff < -1 && diff > -7) return `${-diff} days ago`;
  return formatShortDate(d);
}

export type PatientStatus = 'active' | 'new' | 'inactive';

export interface DemoPatient {
  id: string;
  /** id understood by trpc.therapist.getPatientProfile (only the primary demo patient has one) */
  profileId?: string;
  name: string;
  age: number;
  city: string;
  healthFund: string;
  status: PatientStatus;
  concerns: string[];
  totalSessions: number;
  lastSession: Date | null;
  nextSession: Date | null;
  matchScore: number;
  progress: 'improving' | 'stable' | 'needs-attention';
}

export const demoPatients: DemoPatient[] = [
  {
    id: 'p1',
    profileId: 'patient-1',
    name: 'Israel Israeli',
    age: 34,
    city: 'Tel Aviv',
    healthFund: 'Maccabi',
    status: 'active',
    concerns: ['Anxiety', 'Work stress'],
    totalSessions: 5,
    lastSession: daysFromNow(-4, 10),
    nextSession: daysFromNow(2, 10),
    matchScore: 96,
    progress: 'improving',
  },
  {
    id: 'p2',
    name: 'Sarah Cohen',
    age: 29,
    city: 'Ramat Gan',
    healthFund: 'Private',
    status: 'active',
    concerns: ['Relationships', 'Self-esteem'],
    totalSessions: 3,
    lastSession: daysFromNow(-6, 14),
    nextSession: daysFromNow(2, 14),
    matchScore: 91,
    progress: 'stable',
  },
  {
    id: 'p3',
    name: 'David Levi',
    age: 41,
    city: 'Herzliya',
    healthFund: 'Clalit',
    status: 'active',
    concerns: ['Depression', 'Sleep'],
    totalSessions: 8,
    lastSession: daysFromNow(-2, 11),
    nextSession: daysFromNow(5, 11),
    matchScore: 88,
    progress: 'needs-attention',
  },
  {
    id: 'p4',
    name: 'Noa Peretz',
    age: 24,
    city: 'Tel Aviv',
    healthFund: 'Meuhedet',
    status: 'new',
    concerns: ['Post-army transition'],
    totalSessions: 0,
    lastSession: null,
    nextSession: daysFromNow(3, 16),
    matchScore: 93,
    progress: 'stable',
  },
  {
    id: 'p5',
    name: 'Miriam Abraham',
    age: 52,
    city: 'Givatayim',
    healthFund: 'Leumit',
    status: 'inactive',
    concerns: ['Grief'],
    totalSessions: 12,
    lastSession: daysFromNow(-38, 9),
    nextSession: null,
    matchScore: 85,
    progress: 'improving',
  },
];

export interface DemoMessage {
  id: string;
  sender: 'patient' | 'therapist';
  content: string;
  at: Date;
}

export interface DemoThread {
  id: string;
  patientId: string;
  patientName: string;
  unread: number;
  messages: DemoMessage[];
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000);

export function createDemoThreads(): DemoThread[] {
  return [
    {
      id: 't1',
      patientId: 'p1',
      patientName: 'Israel Israeli',
      unread: 2,
      messages: [
        { id: 'm1', sender: 'patient', content: 'Hi Dr. Shapira, I wanted to ask about our next session.', at: minutesAgo(180) },
        { id: 'm2', sender: 'therapist', content: "Of course, happy to help. What did you want to ask?", at: minutesAgo(170) },
        { id: 'm3', sender: 'patient', content: 'Could we move it an hour later? I have a work meeting.', at: minutesAgo(45) },
        { id: 'm4', sender: 'patient', content: 'And thank you for the last session — the breathing exercise really helped.', at: minutesAgo(40) },
      ],
    },
    {
      id: 't2',
      patientId: 'p2',
      patientName: 'Sarah Cohen',
      unread: 0,
      messages: [
        { id: 'm5', sender: 'patient', content: 'Can we reschedule Thursday’s session?', at: minutesAgo(60 * 26) },
        { id: 'm6', sender: 'therapist', content: 'Sure — I have openings on Tuesday at 14:00 or Wednesday at 16:00.', at: minutesAgo(60 * 25) },
      ],
    },
    {
      id: 't3',
      patientId: 'p3',
      patientName: 'David Levi',
      unread: 0,
      messages: [
        { id: 'm7', sender: 'therapist', content: 'Sharing the sleep-hygiene worksheet we discussed. Let me know how the week goes.', at: minutesAgo(60 * 74) },
        { id: 'm8', sender: 'patient', content: 'I saw your recommendations, will try them this week.', at: minutesAgo(60 * 72) },
      ],
    },
  ];
}

export function formatMessageTime(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return formatShortDate(date);
}
