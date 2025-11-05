/**
 * Event Model
 * Defines the Event entity with all fields and validation rules
 */

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED'
}

export interface Event {
  id: string;
  title: string;
  startAt: string; // ISO 8601 datetime
  endAt: string; // ISO 8601 datetime
  location: string;
  status: EventStatus;
  internalNotes?: string;
  createdBy?: string; // email
  updatedAt: string; // ISO 8601 datetime
}

export interface PublicEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location: string;
  status: EventStatus.PUBLISHED | EventStatus.CANCELLED;
  isUpcoming: boolean;
}

export interface CreateEventInput {
  title: string;
  startAt: string;
  endAt: string;
  location: string;
  status?: EventStatus;
  internalNotes?: string;
  createdBy?: string;
}

export interface UpdateEventInput {
  status?: EventStatus;
  internalNotes?: string;
}

/**
 * Validation utility functions
 */
export class EventValidator {
  static validateTitle(title: string): string[] {
    const errors: string[] = [];
    if (!title || title.trim().length === 0) {
      errors.push('Title cannot be empty');
    }
    if (title.length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }
    return errors;
  }

  static validateDates(startAt: string, endAt: string): string[] {
    const errors: string[] = [];
    const start = new Date(startAt);
    const end = new Date(endAt);
    const now = new Date();

    if (isNaN(start.getTime())) {
      errors.push('startAt must be a valid ISO 8601 datetime');
    }
    if (isNaN(end.getTime())) {
      errors.push('endAt must be a valid ISO 8601 datetime');
    }

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (start >= end) {
        errors.push('startAt must be before endAt');
      }
      if (start < now) {
        errors.push('Events cannot start in the past');
      }
    }

    return errors;
  }

  static validateStatus(status: string): string[] {
    const errors: string[] = [];
    if (!Object.values(EventStatus).includes(status as EventStatus)) {
      errors.push(`Status must be one of: ${Object.values(EventStatus).join(', ')}`);
    }
    return errors;
  }

  static validateStatusTransition(currentStatus: EventStatus, newStatus: EventStatus): string[] {
    const errors: string[] = [];
    
    // DRAFT can transition to PUBLISHED or CANCELLED
    if (currentStatus === EventStatus.DRAFT) {
      if (newStatus !== EventStatus.PUBLISHED && newStatus !== EventStatus.CANCELLED) {
        errors.push('DRAFT events can only transition to PUBLISHED or CANCELLED');
      }
    }
    
    // PUBLISHED can only transition to CANCELLED
    if (currentStatus === EventStatus.PUBLISHED) {
      if (newStatus !== EventStatus.CANCELLED) {
        errors.push('PUBLISHED events can only transition to CANCELLED');
      }
    }
    
    // CANCELLED cannot transition to anything
    if (currentStatus === EventStatus.CANCELLED) {
      errors.push('CANCELLED events cannot be modified');
    }

    return errors;
  }

  static validateCreateEvent(input: CreateEventInput): string[] {
    const errors: string[] = [];
    
    errors.push(...this.validateTitle(input.title));
    errors.push(...this.validateDates(input.startAt, input.endAt));
    
    if (!input.location || input.location.trim().length === 0) {
      errors.push('Location cannot be empty');
    }
    
    if (input.status) {
      errors.push(...this.validateStatus(input.status));
    }

    if (input.createdBy && !this.isValidEmail(input.createdBy)) {
      errors.push('createdBy must be a valid email address');
    }

    return errors;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Utility to check if event is upcoming
 */
export function isUpcoming(startAt: string): boolean {
  return new Date(startAt) > new Date();
}

/**
 * Convert Event to PublicEvent
 */
export function toPublicEvent(event: Event): PublicEvent | null {
  // Only PUBLISHED or CANCELLED events are public
  if (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.CANCELLED) {
    return null;
  }

  return {
    id: event.id,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt,
    location: event.location,
    status: event.status,
    isUpcoming: isUpcoming(event.startAt)
  };
}
