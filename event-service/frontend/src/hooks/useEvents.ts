'use client';

import { useState, useEffect, useCallback } from 'react';
import { Event, PublicEvent, EventFilters, CreateEventDTO, EventStatus } from '@/types/event.types';
import { eventAPI } from '@/lib/api/events';

export function useEvents(isAdmin: boolean) {
  const [events, setEvents] = useState<(Event | PublicEvent)[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = isAdmin
        ? await eventAPI.getEvents(filters, pagination.page, pagination.limit)
        : await eventAPI.getPublicEvents(filters, pagination.page, pagination.limit);

      setEvents(result.events);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (data: CreateEventDTO) => {
    await eventAPI.createEvent(data);
    await fetchEvents();
  };

  const updateEventStatus = async (id: string, status: EventStatus) => {
    await eventAPI.updateEventStatus(id, status);
    await fetchEvents();
  };

  const updateFilters = (newFilters: EventFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const changePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return {
    events,
    loading,
    filters,
    pagination,
    createEvent,
    updateEventStatus,
    updateFilters,
    clearFilters,
    changePage,
  };
}