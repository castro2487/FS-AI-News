/**
 * In-Memory Event Store
 * Thread-safe storage for events with query capabilities
 */

import { Event, EventStatus, PublicEvent, toPublicEvent } from '../models/Event';
import { v4 as uuidv4 } from 'uuid';

export interface EventQuery {
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  locations?: string[];
  status?: EventStatus[];
  page?: number;
  limit?: number;
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

class EventStore {
  private events: Map<string, Event> = new Map();

  /**
   * Create a new event
   */
  create(eventData: Omit<Event, 'id' | 'updatedAt'>): Event {
    const id = uuidv4();
    const event: Event = {
      ...eventData,
      id,
      updatedAt: new Date().toISOString()
    };
    this.events.set(id, event);
    return event;
  }

  /**
   * Find event by ID
   */
  findById(id: string): Event | null {
    return this.events.get(id) || null;
  }

  /**
   * Update event
   */
  update(id: string, updates: Partial<Event>): Event | null {
    const event = this.events.get(id);
    if (!event) {
      return null;
    }

    const updatedEvent: Event = {
      ...event,
      ...updates,
      id: event.id, // Ensure ID is not changed
      updatedAt: new Date().toISOString()
    };

    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  /**
   * Query events with filters and pagination
   */
  query(query: EventQuery): PaginatedResult<Event> {
    let filtered = Array.from(this.events.values());

    // Filter by date range
    if (query.dateFrom || query.dateTo) {
      filtered = filtered.filter(event => {
        const eventDate = event.startAt.split('T')[0]; // Extract YYYY-MM-DD
        
        if (query.dateFrom && eventDate < query.dateFrom) {
          return false;
        }
        if (query.dateTo && eventDate > query.dateTo) {
          return false;
        }
        return true;
      });
    }

    // Filter by locations
    if (query.locations && query.locations.length > 0) {
      filtered = filtered.filter(event => 
        query.locations!.includes(event.location)
      );
    }

    // Filter by status
    if (query.status && query.status.length > 0) {
      filtered = filtered.filter(event => 
        query.status!.includes(event.status)
      );
    }

    // Sort by startAt (ascending)
    filtered.sort((a, b) => 
      new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );

    // Pagination
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const data = filtered.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Query public events
   */
  queryPublic(query: Omit<EventQuery, 'status'>): PaginatedResult<PublicEvent> {
    // Only return PUBLISHED or CANCELLED events
    const publicQuery: EventQuery = {
      ...query,
      status: [EventStatus.PUBLISHED, EventStatus.CANCELLED]
    };

    const result = this.query(publicQuery);
    
    const publicEvents = result.data
      .map(event => toPublicEvent(event))
      .filter((event): event is PublicEvent => event !== null);

    return {
      data: publicEvents,
      pagination: result.pagination
    };
  }

  /**
   * Get all events (for testing)
   */
  getAll(): Event[] {
    return Array.from(this.events.values());
  }

  /**
   * Clear all events (for testing)
   */
  clear(): void {
    this.events.clear();
  }
}

// Singleton instance
export const eventStore = new EventStore();
