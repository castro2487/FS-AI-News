import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Event, PublicEvent, EventStatus } from '@/types/event.types';
import { EventCard } from './EventCard';
import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';

export interface EventListProps {
  events: (Event | PublicEvent)[];
  loading: boolean;
  isAdmin: boolean;
  pagination: {
    page: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onUpdateStatus?: (id: string, status: EventStatus) => Promise<void>;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  isAdmin,
  pagination,
  onPageChange,
  onUpdateStatus,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <Spinner size="lg" className="mx-auto" />
        <p className="mt-4 text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
        <p className="text-gray-600">
          {isAdmin ? 'Create your first event to get started.' : 'Check back later for upcoming events.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isAdmin={isAdmin}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
};