/**
 * Type definitions for Event Service API
 */

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED'
}

export interface Event {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location: string;
  status: EventStatus;
  internalNotes?: string;
  createdBy?: string;
  updatedAt: string;
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

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
}
