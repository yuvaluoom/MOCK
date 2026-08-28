/**
 * Email Templates
 *
 * Plain text and HTML templates for all email types.
 * In production, these would be React Email components.
 */

import type {
  EmailPayload,
  WelcomePatientPayload,
  WelcomeTherapistPayload,
  TherapistApprovedPayload,
  TherapistRejectedPayload,
  TherapistDocumentsRequestedPayload,
  TherapistSuspendedPayload,
  TherapistUnsuspendedPayload,
  SessionRequestedPayload,
  SessionApprovedPayload,
  SessionRejectedPayload,
  SessionCancelledPayload,
  SessionReminderPayload,
  NewMessagePayload,
  NewMatchesAvailablePayload,
  PasswordResetPayload,
} from './types';

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function baseHtml(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MatchMind</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo-text { font-size: 24px; font-weight: bold; color: #22c55e; }
    h1 { color: #1a1a1a; font-size: 20px; margin-bottom: 16px; }
    p { color: #4a4a4a; margin-bottom: 16px; }
    .btn { display: inline-block; background: #22c55e; color: white !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 16px 0; }
    .btn:hover { background: #16a34a; }
    .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin: 16px 0; }
    .info-label { font-weight: 600; color: #166534; }
    .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">MatchMind</span>
      </div>
      ${content}
      <div class="footer">
        <p>MatchMind - Find Your Ideal Therapist</p>
        <p>This email was sent by MatchMind. Please do not reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Template generators for each email type

function welcomePatient(payload: WelcomePatientPayload): EmailTemplate {
  const text = `
Welcome to MatchMind, ${payload.recipientName}!

We're excited to have you join our community. MatchMind uses science-based matching to help you find the right therapist.

Here's what to do next:
1. Complete your X-Factor questionnaire
2. Review your personalized therapist matches
3. Book a session with your preferred therapist

Get Started: https://matchmind.com/questionnaire

If you have any questions, we're here to help.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Welcome to MatchMind, ${payload.recipientName}!</h1>
    <p>We're excited to have you join our community. MatchMind uses science-based matching to help you find the right therapist.</p>

    <p><strong>Here's what to do next:</strong></p>
    <ol>
      <li>Complete your X-Factor questionnaire</li>
      <li>Review your personalized therapist matches</li>
      <li>Book a session with your preferred therapist</li>
    </ol>

    <p style="text-align: center;">
      <a href="https://matchmind.com/questionnaire" class="btn">Complete Your Questionnaire</a>
    </p>

    <p>If you have any questions, we're here to help.</p>
    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'Welcome to MatchMind - Find Your Ideal Therapist',
    text,
    html,
  };
}

function welcomeTherapist(payload: WelcomeTherapistPayload): EmailTemplate {
  const text = `
Welcome to MatchMind, ${payload.recipientName}!

Thank you for registering as a therapist on MatchMind. Your application is now under review.

What happens next:
1. Our team will review your credentials (1-3 business days)
2. You'll receive an email once your account is approved
3. Start receiving matched patients!

You can complete your profile while waiting for approval.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Welcome to MatchMind, ${payload.recipientName}!</h1>
    <p>Thank you for registering as a therapist on MatchMind. Your application is now under review.</p>

    <p><strong>What happens next:</strong></p>
    <ol>
      <li>Our team will review your credentials (1-3 business days)</li>
      <li>You'll receive an email once your account is approved</li>
      <li>Start receiving matched patients!</li>
    </ol>

    <p style="text-align: center;">
      <a href="https://matchmind.com/therapist/complete-profile" class="btn">Complete Your Profile</a>
    </p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'Welcome to MatchMind - Therapist Registration Received',
    text,
    html,
  };
}

function therapistApproved(payload: TherapistApprovedPayload): EmailTemplate {
  const text = `
Great news, ${payload.recipientName}!

Your MatchMind therapist account has been approved! You can now:

- Receive matched patient requests
- Manage your availability
- Accept or decline session requests

Log in to your dashboard to get started.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Great news, ${payload.recipientName}!</h1>
    <p>Your MatchMind therapist account has been approved! You can now:</p>

    <ul>
      <li>Receive matched patient requests</li>
      <li>Manage your availability</li>
      <li>Accept or decline session requests</li>
    </ul>

    <p style="text-align: center;">
      <a href="https://matchmind.com/therapist/dashboard" class="btn">Go to Dashboard</a>
    </p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'Your MatchMind Therapist Account is Approved!',
    text,
    html,
  };
}

function therapistRejected(payload: TherapistRejectedPayload): EmailTemplate {
  const reason = payload.reason || 'Please contact us for more information.';

  const text = `
Hello ${payload.recipientName},

We regret to inform you that your MatchMind therapist application was not approved at this time.

${reason}

If you believe this is an error or would like to provide additional documentation, please contact our support team.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Application Update</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>We regret to inform you that your MatchMind therapist application was not approved at this time.</p>

    <div class="info-box" style="background: #fef2f2; border-color: #fecaca;">
      <p style="color: #991b1b; margin: 0;">${reason}</p>
    </div>

    <p>If you believe this is an error or would like to provide additional documentation, please contact our support team.</p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'MatchMind Therapist Application Update',
    text,
    html,
  };
}

function therapistDocumentsRequested(payload: TherapistDocumentsRequestedPayload): EmailTemplate {
  const documentsList = payload.documents.map(d => `- ${d}`).join('\n');
  const documentsHtml = payload.documents.map(d => `<li>${d}</li>`).join('');

  const text = `
Hello ${payload.recipientName},

To complete your MatchMind therapist application, we need you to provide the following documents:

${documentsList}

Note from our team: ${payload.note}

Please log in to your dashboard to upload these documents.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Additional Documents Required</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>To complete your MatchMind therapist application, we need you to provide the following documents:</p>

    <div class="info-box" style="background: #fef3c7; border-color: #fde68a;">
      <ul style="margin: 0; padding-left: 20px;">${documentsHtml}</ul>
    </div>

    <p><strong>Note from our team:</strong> ${payload.note}</p>

    <p style="text-align: center;">
      <a href="https://matchmind.com/therapist/documentation" class="btn">Upload Documents</a>
    </p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'MatchMind - Additional Documents Required',
    text,
    html,
  };
}

function therapistSuspended(payload: TherapistSuspendedPayload): EmailTemplate {
  const text = `
Hello ${payload.recipientName},

Your MatchMind therapist account has been temporarily suspended.

Reason: ${payload.reason}

During this suspension:
- Your profile will not be visible to patients
- Existing scheduled sessions will not be affected
- You can still access your dashboard

If you have any questions or believe this was in error, please contact our support team.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Account Suspended</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>Your MatchMind therapist account has been temporarily suspended.</p>

    <div class="info-box" style="background: #fef2f2; border-color: #fecaca;">
      <p><strong>Reason:</strong> ${payload.reason}</p>
    </div>

    <p><strong>During this suspension:</strong></p>
    <ul>
      <li>Your profile will not be visible to patients</li>
      <li>Existing scheduled sessions will not be affected</li>
      <li>You can still access your dashboard</li>
    </ul>

    <p>If you have any questions or believe this was in error, please contact our support team.</p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'MatchMind - Account Suspended',
    text,
    html,
  };
}

function therapistUnsuspended(payload: TherapistUnsuspendedPayload): EmailTemplate {
  const text = `
Hello ${payload.recipientName},

Great news! Your MatchMind therapist account suspension has been lifted.

Your account is now fully active:
- Your profile is visible to patients again
- You can receive new match requests
- Your full functionality has been restored

Log in to your dashboard to continue helping patients.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Account Reinstated</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>Great news! Your MatchMind therapist account suspension has been lifted.</p>

    <div class="info-box">
      <p><strong>Your account is now fully active:</strong></p>
      <ul style="margin: 0;">
        <li>Your profile is visible to patients again</li>
        <li>You can receive new match requests</li>
        <li>Your full functionality has been restored</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="https://matchmind.com/therapist/dashboard" class="btn">Go to Dashboard</a>
    </p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'MatchMind - Account Reinstated',
    text,
    html,
  };
}

function sessionRequested(payload: SessionRequestedPayload): EmailTemplate {
  const dateStr = formatDate(payload.scheduledAt);
  const timeStr = formatTime(payload.scheduledAt);
  const format = payload.isOnline ? 'Online' : 'In-Person';

  const text = `
Hello ${payload.recipientName},

You have a new session request from ${payload.patientName}!

Session Details:
- Date: ${dateStr}
- Time: ${timeStr}
- Format: ${format}

Please log in to approve or decline this request.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>New Session Request</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>You have a new session request from <strong>${payload.patientName}</strong>!</p>

    <div class="info-box">
      <p><span class="info-label">Date:</span> ${dateStr}</p>
      <p><span class="info-label">Time:</span> ${timeStr}</p>
      <p><span class="info-label">Format:</span> ${format}</p>
    </div>

    <p style="text-align: center;">
      <a href="https://matchmind.com/therapist/sessions" class="btn">Review Request</a>
    </p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: `New Session Request from ${payload.patientName}`,
    text,
    html,
  };
}

function sessionApproved(payload: SessionApprovedPayload): EmailTemplate {
  const dateStr = formatDate(payload.scheduledAt);
  const timeStr = formatTime(payload.scheduledAt);
  const format = payload.isOnline ? 'Online' : 'In-Person';
  const locationInfo = payload.isOnline
    ? `Meeting Link: ${payload.meetingLink || 'Will be provided before the session'}`
    : `Location: ${payload.address || 'See therapist profile for address'}`;

  const text = `
Hello ${payload.recipientName},

Great news! Your session with ${payload.therapistName} has been approved.

Session Details:
- Date: ${dateStr}
- Time: ${timeStr}
- Format: ${format}
- ${locationInfo}

We look forward to your session!

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Session Approved!</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>Great news! Your session with <strong>${payload.therapistName}</strong> has been approved.</p>

    <div class="info-box">
      <p><span class="info-label">Date:</span> ${dateStr}</p>
      <p><span class="info-label">Time:</span> ${timeStr}</p>
      <p><span class="info-label">Format:</span> ${format}</p>
      <p><span class="info-label">${payload.isOnline ? 'Meeting Link' : 'Location'}:</span> ${payload.isOnline ? (payload.meetingLink || 'Will be provided before the session') : (payload.address || 'See therapist profile')}</p>
    </div>

    <p style="text-align: center;">
      <a href="https://matchmind.com/sessions" class="btn">View Session Details</a>
    </p>

    <p>We look forward to your session!</p>
    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: `Session Confirmed with ${payload.therapistName}`,
    text,
    html,
  };
}

function sessionRejected(payload: SessionRejectedPayload): EmailTemplate {
  const reason = payload.reason || 'The therapist was unable to accommodate this time slot.';

  const text = `
Hello ${payload.recipientName},

Unfortunately, your session request with ${payload.therapistName} could not be accommodated.

Reason: ${reason}

You can try booking a different time or explore other therapist matches.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Session Request Update</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>Unfortunately, your session request with <strong>${payload.therapistName}</strong> could not be accommodated.</p>

    <div class="info-box" style="background: #fef2f2; border-color: #fecaca;">
      <p style="color: #991b1b; margin: 0;"><strong>Reason:</strong> ${reason}</p>
    </div>

    <p>You can try booking a different time or explore other therapist matches.</p>

    <p style="text-align: center;">
      <a href="https://matchmind.com/matches" class="btn">View Other Therapists</a>
    </p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: `Session Request with ${payload.therapistName} - Update`,
    text,
    html,
  };
}

function sessionCancelled(payload: SessionCancelledPayload): EmailTemplate {
  const dateStr = formatDate(payload.scheduledAt);
  const timeStr = formatTime(payload.scheduledAt);
  const cancelledByText = payload.cancelledBy === 'patient' ? 'the patient' : 'the therapist';

  const text = `
Hello ${payload.recipientName},

Your session with ${payload.otherPartyName} scheduled for ${dateStr} at ${timeStr} has been cancelled by ${cancelledByText}.

If you have any questions, please contact us.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Session Cancelled</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>Your session with <strong>${payload.otherPartyName}</strong> has been cancelled by ${cancelledByText}.</p>

    <div class="info-box" style="background: #fef2f2; border-color: #fecaca;">
      <p><span class="info-label">Original Date:</span> ${dateStr}</p>
      <p><span class="info-label">Original Time:</span> ${timeStr}</p>
    </div>

    <p>If you have any questions, please contact us.</p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'Session Cancelled',
    text,
    html,
  };
}

function sessionReminder(payload: SessionReminderPayload): EmailTemplate {
  const dateStr = formatDate(payload.scheduledAt);
  const timeStr = formatTime(payload.scheduledAt);
  const format = payload.isOnline ? 'Online' : 'In-Person';
  const locationInfo = payload.isOnline
    ? `Meeting Link: ${payload.meetingLink || 'Will be provided'}`
    : `Location: ${payload.address || 'See therapist profile'}`;

  const text = `
Hello ${payload.recipientName},

Reminder: Your session with ${payload.therapistName} is coming up in ${payload.hoursUntil} hours.

Session Details:
- Date: ${dateStr}
- Time: ${timeStr}
- Format: ${format}
- ${locationInfo}

See you soon!

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Session Reminder</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>Reminder: Your session with <strong>${payload.therapistName}</strong> is coming up in <strong>${payload.hoursUntil} hours</strong>.</p>

    <div class="info-box">
      <p><span class="info-label">Date:</span> ${dateStr}</p>
      <p><span class="info-label">Time:</span> ${timeStr}</p>
      <p><span class="info-label">Format:</span> ${format}</p>
      <p><span class="info-label">${payload.isOnline ? 'Meeting Link' : 'Location'}:</span> ${payload.isOnline ? (payload.meetingLink || 'Will be provided') : (payload.address || 'See therapist profile')}</p>
    </div>

    <p>See you soon!</p>
    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: `Session Reminder: ${payload.hoursUntil} hours until your session`,
    text,
    html,
  };
}

function newMessage(payload: NewMessagePayload): EmailTemplate {
  const preview = payload.messagePreview.length > 100
    ? payload.messagePreview.substring(0, 100) + '...'
    : payload.messagePreview;

  const text = `
Hello ${payload.recipientName},

You have a new message from ${payload.senderName}:

"${preview}"

Log in to view and reply.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>New Message</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>You have a new message from <strong>${payload.senderName}</strong>:</p>

    <div class="info-box">
      <p style="font-style: italic; margin: 0;">"${preview}"</p>
    </div>

    <p style="text-align: center;">
      <a href="https://matchmind.com/messages" class="btn">View Message</a>
    </p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: `New message from ${payload.senderName}`,
    text,
    html,
  };
}

function newMatchesAvailable(payload: NewMatchesAvailablePayload): EmailTemplate {
  const text = `
Hello ${payload.recipientName},

Great news! We've found ${payload.matchCount} new therapist matches for you.

Your top match has a ${payload.topMatchScore}% compatibility score!

Log in to view your matches and book a session.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>New Matches Available!</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>Great news! We've found <strong>${payload.matchCount} new therapist matches</strong> for you.</p>

    <div class="info-box">
      <p style="font-size: 18px; text-align: center; margin: 0;">
        Your top match: <strong style="color: #22c55e; font-size: 24px;">${payload.topMatchScore}%</strong> compatibility
      </p>
    </div>

    <p style="text-align: center;">
      <a href="https://matchmind.com/matches" class="btn">View Your Matches</a>
    </p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: `${payload.matchCount} New Therapist Matches Found!`,
    text,
    html,
  };
}

function passwordReset(payload: PasswordResetPayload): EmailTemplate {
  const text = `
Hello ${payload.recipientName},

We received a request to reset your password. Click the link below to create a new password:

${payload.resetLink}

This link expires in ${payload.expiresIn}.

If you didn't request this, please ignore this email.

Best regards,
The MatchMind Team
  `.trim();

  const html = baseHtml(`
    <h1>Reset Your Password</h1>
    <p>Hello ${payload.recipientName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>

    <p style="text-align: center;">
      <a href="${payload.resetLink}" class="btn">Reset Password</a>
    </p>

    <p style="font-size: 12px; color: #888;">This link expires in ${payload.expiresIn}.</p>

    <p>If you didn't request this, please ignore this email.</p>

    <p>Best regards,<br>The MatchMind Team</p>
  `);

  return {
    subject: 'Reset Your MatchMind Password',
    text,
    html,
  };
}

/**
 * Get the template for a given email payload
 */
export function getEmailTemplate(payload: EmailPayload): EmailTemplate {
  switch (payload.type) {
    case 'WELCOME_PATIENT':
      return welcomePatient(payload);
    case 'WELCOME_THERAPIST':
      return welcomeTherapist(payload);
    case 'THERAPIST_APPROVED':
      return therapistApproved(payload);
    case 'THERAPIST_REJECTED':
      return therapistRejected(payload);
    case 'THERAPIST_DOCUMENTS_REQUESTED':
      return therapistDocumentsRequested(payload);
    case 'THERAPIST_SUSPENDED':
      return therapistSuspended(payload);
    case 'THERAPIST_UNSUSPENDED':
      return therapistUnsuspended(payload);
    case 'SESSION_REQUESTED':
      return sessionRequested(payload);
    case 'SESSION_APPROVED':
      return sessionApproved(payload);
    case 'SESSION_REJECTED':
      return sessionRejected(payload);
    case 'SESSION_CANCELLED':
      return sessionCancelled(payload);
    case 'SESSION_REMINDER':
      return sessionReminder(payload);
    case 'NEW_MESSAGE':
      return newMessage(payload);
    case 'NEW_MATCHES_AVAILABLE':
      return newMatchesAvailable(payload);
    case 'PASSWORD_RESET':
      return passwordReset(payload);
    default:
      throw new Error(`Unknown email type: ${(payload as EmailPayload).type}`);
  }
}
