import nodemailer, { Transporter } from 'nodemailer';
import { Event } from '../types/event.types';

export interface INotificationService {
  notifyEventCreated(event: Event, recipientEmail?: string): Promise<void>;
  notifyEventPublished(event: Event, recipientEmail?: string): Promise<void>;
  notifyEventCancelled(event: Event, recipientEmail?: string): Promise<void>;
}

export class ConsoleNotificationService implements INotificationService {
  async notifyEventCreated(event: Event, recipientEmail?: string): Promise<void> {
    console.log(`[NOTIFICATION] New event created: ${event.title}`);
    if (recipientEmail) {
      console.log(`[NOTIFICATION] Would send to: ${recipientEmail}`);
    }
  }

  async notifyEventPublished(event: Event, recipientEmail?: string): Promise<void> {
    console.log(`[NOTIFICATION] Event published: ${event.title}`);
    if (recipientEmail) {
      console.log(`[NOTIFICATION] Would send to: ${recipientEmail}`);
    }
  }

  async notifyEventCancelled(event: Event, recipientEmail?: string): Promise<void> {
    console.log(`[NOTIFICATION] Event cancelled: ${event.title}`);
    if (recipientEmail) {
      console.log(`[NOTIFICATION] Would send to: ${recipientEmail}`);
    }
  }
}

// NEW: Email Notification Service with fallback
export class EmailNotificationService implements INotificationService {
  private transporter: Transporter | null = null;
  private fallback: ConsoleNotificationService;

  constructor() {
    this.fallback = new ConsoleNotificationService();
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[EMAIL] SMTP not configured, using console fallback');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      console.log('[EMAIL] SMTP configured successfully');
    } catch (error) {
      console.error('[EMAIL] Failed to configure SMTP:', error);
    }
  }

  async notifyEventCreated(event: Event, recipientEmail?: string): Promise<void> {
    if (!this.transporter || !recipientEmail) {
      return this.fallback.notifyEventCreated(event, recipientEmail);
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@eventservice.com',
        to: recipientEmail,
        subject: `New Event Created: ${event.title}`,
        html: `
          <h2>New Event Created</h2>
          <p><strong>Title:</strong> ${event.title}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Start:</strong> ${new Date(event.startAt).toLocaleString()}</p>
          <p><strong>End:</strong> ${new Date(event.endAt).toLocaleString()}</p>
          <p><strong>Status:</strong> ${event.status}</p>
        `,
      });

      console.log(`[EMAIL] Event created notification sent to ${recipientEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send email, using fallback:', error);
      await this.fallback.notifyEventCreated(event, recipientEmail);
    }
  }

  async notifyEventPublished(event: Event, recipientEmail?: string): Promise<void> {
    if (!this.transporter || !recipientEmail) {
      return this.fallback.notifyEventPublished(event, recipientEmail);
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@eventservice.com',
        to: recipientEmail,
        subject: `Event Published: ${event.title}`,
        html: `
          <h2>Event Published! 🎉</h2>
          <p>Your event has been published and is now visible to the public.</p>
          <p><strong>Title:</strong> ${event.title}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Start:</strong> ${new Date(event.startAt).toLocaleString()}</p>
          <p><strong>End:</strong> ${new Date(event.endAt).toLocaleString()}</p>
        `,
      });

      console.log(`[EMAIL] Event published notification sent to ${recipientEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send email, using fallback:', error);
      await this.fallback.notifyEventPublished(event, recipientEmail);
    }
  }

  async notifyEventCancelled(event: Event, recipientEmail?: string): Promise<void> {
    if (!this.transporter || !recipientEmail) {
      return this.fallback.notifyEventCancelled(event, recipientEmail);
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@eventservice.com',
        to: recipientEmail,
        subject: `Event Cancelled: ${event.title}`,
        html: `
          <h2>Event Cancelled</h2>
          <p>We regret to inform you that the following event has been cancelled:</p>
          <p><strong>Title:</strong> ${event.title}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Originally scheduled:</strong> ${new Date(event.startAt).toLocaleString()}</p>
        `,
      });

      console.log(`[EMAIL] Event cancelled notification sent to ${recipientEmail}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send email, using fallback:', error);
      await this.fallback.notifyEventCancelled(event, recipientEmail);
    }
  }
}