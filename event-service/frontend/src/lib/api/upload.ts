import { EventImage } from '@/types/event.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class UploadAPI {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  async uploadEventImage(eventId: string, file: File): Promise<EventImage> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('eventId', eventId);

    const response = await fetch(`${API_URL}/upload/events/${eventId}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async getEventImages(eventId: string): Promise<EventImage[]> {
    const response = await fetch(`${API_URL}/upload/events/${eventId}/images`);

    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }

    const result = await response.json();
    return result.images;
  }

  async deleteEventImage(imageId: string): Promise<void> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/upload/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  }
}

export const uploadAPI = new UploadAPI();