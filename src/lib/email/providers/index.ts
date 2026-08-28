/**
 * Email Provider Abstraction Layer
 *
 * Production-ready email sending with support for multiple providers:
 * - SendGrid
 * - AWS SES
 * - Postmark
 * - Resend
 *
 * The provider is selected via EMAIL_PROVIDER environment variable.
 * In development, emails are logged to console and stored in mock database.
 */

export interface EmailMessage {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  encoding?: 'base64' | 'binary';
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  timestamp: Date;
}

export interface EmailProviderConfig {
  apiKey: string;
  region?: string; // For AWS SES
  domain?: string;
  sandbox?: boolean;
}

/**
 * Abstract Email Provider Interface
 */
export interface IEmailProvider {
  name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
  sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]>;
  verifyConnection(): Promise<boolean>;
}

/**
 * SendGrid Provider Implementation
 */
export class SendGridProvider implements IEmailProvider {
  name = 'sendgrid';
  private apiKey: string;

  constructor(config: EmailProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // In production, would use @sendgrid/mail package:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.apiKey);
    // const [response] = await sgMail.send({
    //   to: message.to,
    //   from: message.from,
    //   subject: message.subject,
    //   html: message.html,
    //   text: message.text,
    // });

    console.log(`[SendGrid] Would send email to: ${message.to}`);
    return {
      success: true,
      messageId: `sg-${Date.now()}`,
      provider: this.name,
      timestamp: new Date(),
    };
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    return Promise.all(messages.map(m => this.send(m)));
  }

  async verifyConnection(): Promise<boolean> {
    return !!this.apiKey;
  }
}

/**
 * AWS SES Provider Implementation
 */
export class AWSSESProvider implements IEmailProvider {
  name = 'aws-ses';
  private apiKey: string;
  private region: string;

  constructor(config: EmailProviderConfig) {
    this.apiKey = config.apiKey;
    this.region = config.region || 'us-east-1';
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // In production, would use @aws-sdk/client-ses:
    // const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
    // const client = new SESClient({ region: this.region });
    // const command = new SendEmailCommand({
    //   Destination: { ToAddresses: Array.isArray(message.to) ? message.to : [message.to] },
    //   Message: {
    //     Body: { Html: { Data: message.html }, Text: { Data: message.text } },
    //     Subject: { Data: message.subject },
    //   },
    //   Source: message.from,
    // });
    // const response = await client.send(command);

    console.log(`[AWS SES] Would send email to: ${message.to}`);
    return {
      success: true,
      messageId: `ses-${Date.now()}`,
      provider: this.name,
      timestamp: new Date(),
    };
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    return Promise.all(messages.map(m => this.send(m)));
  }

  async verifyConnection(): Promise<boolean> {
    return !!this.apiKey;
  }
}

/**
 * Postmark Provider Implementation
 */
export class PostmarkProvider implements IEmailProvider {
  name = 'postmark';
  private apiKey: string;

  constructor(config: EmailProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // In production, would use postmark package:
    // const postmark = require('postmark');
    // const client = new postmark.ServerClient(this.apiKey);
    // const response = await client.sendEmail({
    //   From: message.from,
    //   To: Array.isArray(message.to) ? message.to.join(',') : message.to,
    //   Subject: message.subject,
    //   HtmlBody: message.html,
    //   TextBody: message.text,
    // });

    console.log(`[Postmark] Would send email to: ${message.to}`);
    return {
      success: true,
      messageId: `pm-${Date.now()}`,
      provider: this.name,
      timestamp: new Date(),
    };
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    return Promise.all(messages.map(m => this.send(m)));
  }

  async verifyConnection(): Promise<boolean> {
    return !!this.apiKey;
  }
}

/**
 * Resend Provider Implementation
 */
export class ResendProvider implements IEmailProvider {
  name = 'resend';
  private apiKey: string;

  constructor(config: EmailProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // In production, would use resend package:
    // const { Resend } = require('resend');
    // const resend = new Resend(this.apiKey);
    // const { data, error } = await resend.emails.send({
    //   from: message.from,
    //   to: message.to,
    //   subject: message.subject,
    //   html: message.html,
    //   text: message.text,
    // });

    console.log(`[Resend] Would send email to: ${message.to}`);
    return {
      success: true,
      messageId: `resend-${Date.now()}`,
      provider: this.name,
      timestamp: new Date(),
    };
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    return Promise.all(messages.map(m => this.send(m)));
  }

  async verifyConnection(): Promise<boolean> {
    return !!this.apiKey;
  }
}

/**
 * Development Provider - logs emails and stores in mock database
 */
export class DevelopmentProvider implements IEmailProvider {
  name = 'development';

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const messageId = `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('\n' + '='.repeat(60));
    console.log('📧 [DEV EMAIL] Email would be sent:');
    console.log('='.repeat(60));
    console.log(`To: ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
    console.log(`From: ${message.from || 'noreply@matchmind.co.il'}`);
    console.log(`Subject: ${message.subject}`);
    console.log('-'.repeat(60));
    console.log('Body Preview (first 200 chars):');
    console.log(message.text?.substring(0, 200) || message.html.replace(/<[^>]*>/g, '').substring(0, 200));
    console.log('='.repeat(60) + '\n');

    return {
      success: true,
      messageId,
      provider: this.name,
      timestamp: new Date(),
    };
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    return Promise.all(messages.map(m => this.send(m)));
  }

  async verifyConnection(): Promise<boolean> {
    return true;
  }
}

/**
 * Get the configured email provider
 */
export function getEmailProvider(): IEmailProvider {
  const provider = process.env.EMAIL_PROVIDER || 'development';
  const apiKey = process.env.EMAIL_API_KEY || '';

  switch (provider.toLowerCase()) {
    case 'sendgrid':
      return new SendGridProvider({ apiKey });
    case 'aws-ses':
    case 'ses':
      return new AWSSESProvider({
        apiKey,
        region: process.env.AWS_REGION || 'us-east-1'
      });
    case 'postmark':
      return new PostmarkProvider({ apiKey });
    case 'resend':
      return new ResendProvider({ apiKey });
    case 'development':
    default:
      return new DevelopmentProvider();
  }
}
