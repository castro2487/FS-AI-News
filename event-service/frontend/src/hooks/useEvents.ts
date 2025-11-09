'use client';

import { useState, useEffect, useCallback } from 'react';
import { Event, PublicEvent, EventFilters, CreateEventDTO, EventStatus } from '@/types/event.types';
import { eventAPI } from '@/lib/api/events';

export function useEvents(isAdmin: boolean) {
  const [events, setEvents] = useState<(Event | PublicEvent)[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      const result = isAdmin
        ? await eventAPI.getEvents(params, pagination.page, pagination.limit)
        : await eventAPI.getPublicEvents(params, pagination.page, pagination.limit);

      setEvents(result.events);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters, pagination.page, pagination.limit]);

  const searchEvents = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('');
      await fetchEvents();
      return;
    }

    setSearchQuery(query);
    setLoading(true);

    try {
      const params = {
        ...filters,
        page: 1, // Reset to first page on search
        limit: pagination.limit,
      };

      // Use appropriate search endpoint based on admin status
      const result = isAdmin
        ? await eventAPI.searchEvents(query, params, 1, pagination.limit)
        : await eventAPI.searchPublicEvents(query, params, 1, pagination.limit);

      setEvents(result.events);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error searching events:', error);
      // Fallback to regular fetch
      await fetchEvents();
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters, pagination.limit, fetchEvents]);

  useEffect(() => {
    if (!searchQuery) {
      fetchEvents();
    }
  }, [fetchEvents, searchQuery]);

  const createEvent = async (data: CreateEventDTO) => {
    await eventAPI.createEvent(data);
    setSearchQuery(''); // Clear search on create
    await fetchEvents();
  };

  const updateEventStatus = async (id: string, status: EventStatus) => {
    await eventAPI.updateEventStatus(id, status);
    await fetchEvents();
  };

  const updateFilters = (newFilters: EventFilters) => {
    setFilters(newFilters);
    setSearchQuery(''); // Clear search when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
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
    searchQuery,
    createEvent,
    updateEventStatus,
    updateFilters,
    clearFilters,
    changePage,
    searchEvents,
  };
}