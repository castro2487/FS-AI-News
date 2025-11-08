import React, { useState } from 'react';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { FilterPanel } from '../organisms/FilterPanel';
import { EventList } from '../organisms/EventList';
import { EventForm } from '../organisms/EventForm';
import { Event, PublicEvent, EventFilters, EventStatus, CreateEventDTO } from '@/types/event.types';

export interface EventDashboardProps {
  events: (Event | PublicEvent)[];
  loading: boolean;
  isAdmin: boolean;
  filters: EventFilters;
  pagination: {
    page: number;
    totalPages: number;
  };
  onToggleView: () => void;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onCreateEvent: (data: CreateEventDTO) => Promise<void>;
  onUpdateStatus: (id: string, status: EventStatus) => Promise<void>;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({
  events,
  loading,
  isAdmin,
  filters,
  pagination,
  onToggleView,
  onFiltersChange,
  onClearFilters,
  onPageChange,
  onCreateEvent,
  onUpdateStatus,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Event Service</h1>
              <p className="text-sm text-gray-600 mt-1">
                {isAdmin ? 'Admin Dashboard' : 'Public Events'}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="secondary" size="md" onClick={onToggleView}>
                {isAdmin ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {isAdmin ? 'Public View' : 'Admin View'}
              </Button>

              {isAdmin && (
                <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterPanel
          filters={filters}
          isAdmin={isAdmin}
          onFiltersChange={onFiltersChange}
          onClear={onClearFilters}
        />

        <EventList
          events={events}
          loading={loading}
          isAdmin={isAdmin}
          pagination={pagination}
          onPageChange={onPageChange}
          onUpdateStatus={onUpdateStatus}
        />
      </main>

      {showCreateModal && (
        <EventForm
          onSubmit={onCreateEvent}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};