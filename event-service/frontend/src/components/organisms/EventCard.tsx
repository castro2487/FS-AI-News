import React, { useState } from 'react';
import { Event, PublicEvent, EventStatus } from '@/types/event.types';
import { Button } from '../atoms/Button';
import { StatusBadge } from '../molecules/StatusBadge';
import { EventMeta } from '../molecules/EventMeta';

export interface EventCardProps {
  event: Event | PublicEvent;
  isAdmin?: boolean;
  onUpdateStatus?: (id: string, status: EventStatus) => Promise<void>;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isAdmin = false, onUpdateStatus }) => {
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');

  const isPublicEvent = (e: Event | PublicEvent): e is PublicEvent => {
    return 'isUpcoming' in e;
  };

  const handleStatusUpdate = async (status: EventStatus) => {
    if (!onUpdateStatus) return;
    setLoading(true);
    try {
      await onUpdateStatus(event.id, status);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }

    setShowSummary(true);
    setSummary('Loading...');

    try {
      const response = await fetch(`/api/public/events/${event.id}/summary`);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                text += data.chunk;
                setSummary(text);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load summary:', error);
      setSummary('Failed to load summary');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
        <h3 className="text-xl font-semibold text-gray-900 flex-1">{event.title}</h3>
        <StatusBadge
          status={event.status}
          isUpcoming={isPublicEvent(event) ? event.isUpcoming : undefined}
        />
      </div>

      <EventMeta startAt={event.startAt} endAt={event.endAt} location={event.location} />

      {isAdmin && 'internalNotes' in event && event.internalNotes && (
        <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong>Internal Notes:</strong> {event.internalNotes}
          </p>
        </div>
      )}

      {!isAdmin && (event.status === EventStatus.PUBLISHED || event.status === EventStatus.CANCELLED) && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSummary}
            className="mt-4"
          >
            {showSummary ? 'Hide Summary' : 'Show AI Summary'}
          </Button>

          {showSummary && (
            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-gray-700">{summary}</p>
            </div>
          )}
        </>
      )}

      {isAdmin && onUpdateStatus && (
        <div className="mt-4 flex gap-2 flex-wrap">
          {event.status === EventStatus.DRAFT && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusUpdate(EventStatus.PUBLISHED)}
                disabled={loading}
              >
                Publish
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleStatusUpdate(EventStatus.CANCELLED)}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          )}
          {event.status === EventStatus.PUBLISHED && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleStatusUpdate(EventStatus.CANCELLED)}
              disabled={loading}
            >
              Cancel Event
            </Button>
          )}
        </div>
      )}
    </div>
  );
};