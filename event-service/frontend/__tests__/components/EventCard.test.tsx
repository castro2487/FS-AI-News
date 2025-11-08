import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/components/organisms/EventCard';
import { EventStatus } from '@/types/event.types';

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Test Event',
    startAt: '2025-12-15T10:00:00Z',
    endAt: '2025-12-15T12:00:00Z',
    location: 'Test Location',
    status: EventStatus.PUBLISHED,
    isUpcoming: true,
  };

  it('should render event details', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText(/Test Location/)).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
  });

  it('should show admin actions when isAdmin is true', () => {
    const mockUpdate = vi.fn();
    render(
      <EventCard
        event={{ ...mockEvent, status: EventStatus.DRAFT }}
        isAdmin={true}
        onUpdateStatus={mockUpdate}
      />
    );
    
    expect(screen.getByText('Publish')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onUpdateStatus when status button is clicked', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <EventCard
        event={{ ...mockEvent, status: EventStatus.DRAFT }}
        isAdmin={true}
        onUpdateStatus={mockUpdate}
      />
    );
    
    fireEvent.click(screen.getByText('Publish'));
    expect(mockUpdate).toHaveBeenCalledWith('1', EventStatus.PUBLISHED);
  });

  it('should not show internal notes in public view', () => {
    const eventWithNotes = {
      ...mockEvent,
      internalNotes: 'Secret notes',
    };
    
    render(<EventCard event={eventWithNotes} isAdmin={false} />);
    expect(screen.queryByText(/Secret notes/)).not.toBeInTheDocument();
  });

  it('should show internal notes in admin view', () => {
    const eventWithNotes = {
      ...mockEvent,
      internalNotes: 'Secret notes',
    };
    
    render(<EventCard event={eventWithNotes} isAdmin={true} />);
    expect(screen.getByText(/Secret notes/)).toBeInTheDocument();
  });
});