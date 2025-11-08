import { Event } from '../types/event.types';

export interface INotificationService {
  notifyEventCreated(event: Event): Promise<void>;
  notifyEventPublished(event: Event): Promise<void>;
  notifyEventCancelled(event: Event): Promise<void>;
}

export class ConsoleNotificationService implements INotificationService {
  async notifyEventCreated(event: Event): Promise<void> {
    console.log(`[NOTIFICATION] New event created: ${event.title}`);
  }

  async notifyEventPublished(event: Event): Promise<void> {
    console.log(`[NOTIFICATION] Event published: ${event.title}`);
  }

  async notifyEventCancelled(event: Event): Promise<void> {
    console.log(`[NOTIFICATION] Event cancelled: ${event.title}`);
  }
}