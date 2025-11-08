'use client';

import { useState } from 'react';
import { EventDashboard } from '@/components/templates/EventDashboard';
import { useEvents } from '@/hooks/useEvents';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const {
    events,
    loading,
    filters,
    pagination,
    createEvent,
    updateEventStatus,
    updateFilters,
    clearFilters,
    changePage,
  } = useEvents(isAdmin);

  return (
    <EventDashboard
      events={events}
      loading={loading}
      isAdmin={isAdmin}
      filters={filters}
      pagination={pagination}
      onToggleView={() => setIsAdmin(!isAdmin)}
      onFiltersChange={updateFilters}
      onClearFilters={clearFilters}
      onPageChange={changePage}
      onCreateEvent={createEvent}
      onUpdateStatus={updateEventStatus}
    />
  );
}