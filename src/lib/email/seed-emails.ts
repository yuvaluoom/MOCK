/**
 * Email Seed Data
 *
 * Populates the email store with realistic demo records for investor demonstration.
 * Called once at server startup via the email infrastructure module.
 */

import { sendTemplatedEmail } from './email-infrastructure';

let seeded = false;

export async function seedDemoEmails(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const baseDate = new Date();

  // Helper to create a past date
  const daysAgo = (days: number, hours = 0) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hours);
    return d;
  };

  const demoEmails = [
    // Signup emails
    { type: 'WELCOME_PATIENT' as const, to: 'sarah.cohen@gmail.com', recipientName: 'Sarah Cohen' },
    { type: 'WELCOME_PATIENT' as const, to: 'david.levy@gmail.com', recipientName: 'David Levy' },
    { type: 'WELCOME_PATIENT' as const, to: 'miriam.katz@gmail.com', recipientName: 'Miriam Katz' },
    { type: 'WELCOME_THERAPIST' as const, to: 'dr.rachel.shapiro@clinic.co.il', recipientName: 'Dr. Rachel Shapiro' },
    { type: 'WELCOME_THERAPIST' as const, to: 'dr.avi.levi@therapy.co.il', recipientName: 'Dr. Avi Levi' },
    // Therapist approval flow
    { type: 'THERAPIST_APPROVED' as const, to: 'dr.rachel.shapiro@clinic.co.il', recipientName: 'Dr. Rachel Shapiro' },
    { type: 'THERAPIST_REJECTED' as const, to: 'dr.avi.levi@therapy.co.il', recipientName: 'Dr. Avi Levi', reason: 'Missing valid license certificate. Please reapply with updated credentials.' },
    { type: 'THERAPIST_DOCUMENTS_REQUESTED' as const, to: 'dr.noa.bar@therapy.co.il', recipientName: 'Dr. Noa Bar', documents: ['License Certificate', 'University Diploma'], note: 'Please provide certified copies of these documents.' },
    // Session flow
    {
      type: 'SESSION_REQUESTED' as const,
      to: 'dr.rachel.shapiro@clinic.co.il',
      recipientName: 'Dr. Rachel Shapiro',
      patientName: 'Sarah Cohen',
      therapistName: 'Dr. Rachel Shapiro',
      scheduledAt: daysAgo(3),
      isOnline: true,
    },
    {
      type: 'SESSION_APPROVED' as const,
      to: 'sarah.cohen@gmail.com',
      recipientName: 'Sarah Cohen',
      therapistName: 'Dr. Rachel Shapiro',
      scheduledAt: daysAgo(2),
      isOnline: true,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      type: 'SESSION_REQUESTED' as const,
      to: 'dr.rachel.shapiro@clinic.co.il',
      recipientName: 'Dr. Rachel Shapiro',
      patientName: 'David Levy',
      therapistName: 'Dr. Rachel Shapiro',
      scheduledAt: daysAgo(1),
      isOnline: false,
    },
    // Password reset
    {
      type: 'PASSWORD_RESET' as const,
      to: 'david.levy@gmail.com',
      recipientName: 'David Levy',
      resetLink: 'http://localhost:3000/reset-password?token=demo-token-xyz',
      expiresIn: '1 hour',
    },
    // Messages
    {
      type: 'NEW_MESSAGE' as const,
      to: 'sarah.cohen@gmail.com',
      recipientName: 'Sarah Cohen',
      senderName: 'Dr. Rachel Shapiro',
      messagePreview: 'Hi Sarah, looking forward to our session next week. Please remember to fill out...',
    },
    {
      type: 'NEW_MATCHES_AVAILABLE' as const,
      to: 'miriam.katz@gmail.com',
      recipientName: 'Miriam Katz',
      matchCount: 4,
      topMatchScore: 94,
    },
  ];

  // Fire emails sequentially (fire-and-forget in background)
  for (const email of demoEmails) {
    try {
      await sendTemplatedEmail(email as any);
    } catch {
      // Silent — seed emails are best-effort
    }
  }
}
