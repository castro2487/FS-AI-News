import { Event, PublicEvent, CreateEventDTO, EventStatus, EventFilters, PaginatedResponse } from '@/types/event.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-token-123';

class EventAPI {
  private getHeaders(requireAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      headers.Authorization = `Bearer ${ADMIN_TOKEN}`;
    }

    return headers;
  }

  async createEvent(data: CreateEventDTO): Promise<Event> {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async updateEventStatus(id: string, status: EventStatus): Promise<Event> {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async getEvents(filters: EventFilters, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.locations && { locations: filters.locations }),
      ...(filters.status && { status: filters.status }),
    });

    const response = await fetch(`${API_URL}/events?${params}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    return response.json();
  }

  async getPublicEvents(filters: EventFilters, page: number = 1, limit: number = 20): Promise<PaginatedResponse<PublicEvent>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.locations && { locations: filters.locations }),
    });

    const response = await fetch(`${API_URL}/public/events?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch public events');
    }

    return response.json();
  }

  async streamEventSummary(id: string, onChunk: (chunk: string) => void): Promise<void> {
    const response = await fetch(`${API_URL}/public/events/${id}/summary`);

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.chunk) {
            onChunk(data.chunk);
          }
        }
      }
    }
  }
  async searchEvents(
    query: string,
    filters: EventFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Event>> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
      ...(filters.locations && { locations: filters.locations }),
      ...(filters.status && { status: filters.status }),
    });

    const response = await fetch(`${API_URL}/events/search?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search events');
    }

    return response.json();
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken') || process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  }

}

export const eventAPI = new EventAPI();