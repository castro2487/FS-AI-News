/**
 * API Client for Event Service
 */

import {
  Event,
  PublicEvent,
  CreateEventInput,
  UpdateEventInput,
  PaginatedResult,
  ErrorResponse,
  EventStatus
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class APIClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new APIError(
        errorData.error.code,
        errorData.error.message,
        errorData.error.details
      );
    }

    return response.json();
  }

  // Event Management (Protected)
  async createEvent(input: CreateEventInput): Promise<Event> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateEvent(id: string, input: UpdateEventInput): Promise<Event> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async getEvents(params?: {
    dateFrom?: string;
    dateTo?: string;
    locations?: string[];
    status?: EventStatus[];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<Event>> {
    const query = new URLSearchParams();
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);
    if (params?.locations) query.append('locations', params.locations.join(','));
    if (params?.status) query.append('status', params.status.join(','));
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    return this.request<PaginatedResult<Event>>(
      `/events${queryString ? `?${queryString}` : ''}`
    );
  }

  // Public Events (No Auth)
  async getPublicEvents(params?: {
    dateFrom?: string;
    dateTo?: string;
    locations?: string[];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<PublicEvent>> {
    const query = new URLSearchParams();
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);
    if (params?.locations) query.append('locations', params.locations.join(','));
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const response = await fetch(
      `${API_URL}/public/events${queryString ? `?${queryString}` : ''}`
    );

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new APIError(errorData.error.code, errorData.error.message);
    }

    return response.json();
  }

  // Event Summary with SSE
  async streamEventSummary(
    eventId: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<() => void> {
    const response = await fetch(`${API_URL}/public/events/${eventId}/summary`);

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      onError(new APIError(errorData.error.code, errorData.error.message));
      return () => {};
    }

    const cacheStatus = response.headers.get('X-Summary-Cache');
    console.log(`Summary cache: ${cacheStatus}`);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      onError(new Error('Failed to get response reader'));
      return () => {};
    }

    let cancelled = false;

    const read = async () => {
      try {
        while (!cancelled) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete();
            break;
          }

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6).trim();
              if (data) {
                onChunk(data);
              }
            } else if (line.startsWith('event: done')) {
              onComplete();
              cancelled = true;
              break;
            } else if (line.startsWith('event: error')) {
              onError(new Error('Server error generating summary'));
              cancelled = true;
              break;
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          onError(error as Error);
        }
      } finally {
        reader.releaseLock();
      }
    };

    read();

    return () => {
      cancelled = true;
      reader.cancel();
    };
  }
}

export const apiClient = new APIClient();
