/**
 * Frontend Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventCard from '../components/EventCard';
import { EventStatus } from '../lib/types';

describe('EventCard Component', () => {
  const mockEvent = {
    id: '123',
    title: 'Test Event',
    startAt: '2025-12-15T10:00:00Z',
    endAt: '2025-12-15T12:00:00Z',
    location: 'Test Location',
    status: EventStatus.PUBLISHED,
    isUpcoming: true
  };

  test('renders event information', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
  });

  test('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    const eventWithPrivateFields = { ...mockEvent, internalNotes: 'notes' };
    
    render(<EventCard event={eventWithPrivateFields} onEdit={onEdit} showPrivateFields />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(eventWithPrivateFields);
  });

  test('displays upcoming status correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  test('displays cancelled status with correct styling', () => {
    const cancelledEvent = { ...mockEvent, status: EventStatus.CANCELLED };
    
    render(<EventCard event={cancelledEvent} />);
    
    const statusBadge = screen.getByText('CANCELLED');
    expect(statusBadge).toHaveClass('bg-red-200', 'text-red-800');
  });

  test('shows AI Summary button for public events', () => {
    const onViewSummary = jest.fn();
    
    render(<EventCard event={mockEvent} onViewSummary={onViewSummary} />);
    
    const summaryButton = screen.getByText('AI Summary');
    expect(summaryButton).toBeInTheDocument();
    
    fireEvent.click(summaryButton);
    expect(onViewSummary).toHaveBeenCalledWith(mockEvent);
  });

  test('displays private fields when showPrivateFields is true', () => {
    const eventWithPrivateFields = {
      ...mockEvent,
      internalNotes: 'Internal notes here',
      createdBy: 'test@example.com'
    };
    
    render(<EventCard event={eventWithPrivateFields} showPrivateFields={true} />);
    
    expect(screen.getByText(/Internal notes here/)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });
});

describe('API Client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('includes auth token in requests', async () => {
    const { apiClient } = require('../lib/api');
    
    apiClient.setToken('test-token');
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], pagination: {} })
    });

    await apiClient.getEvents();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
  });

  test('throws APIError on failed request', async () => {
    const { apiClient, APIError } = require('../lib/api');
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [{ message: 'Title is required' }]
        }
      })
    });

    await expect(apiClient.getEvents()).rejects.toThrow(APIError);
  });
});
