export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
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

export interface CreateEventDTO {
  title: string;
  startAt: string;
  endAt: string;
  location: string;
  status?: EventStatus;
  internalNotes?: string;
  createdBy?: string;
}

export interface UpdateEventDTO {
  status?: EventStatus;
  internalNotes?: string;
}

export interface EventFilters {
  dateFrom?: string;
  dateTo?: string;
  locations?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  events: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}