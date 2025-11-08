import React from 'react';
import { Badge } from '../atoms/Badge';
import { EventStatus } from '@/types/event.types';

export interface StatusBadgeProps {
  status: EventStatus;
  isUpcoming?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isUpcoming }) => {
  const statusMap: Record<EventStatus, 'draft' | 'published' | 'cancelled'> = {
    [EventStatus.DRAFT]: 'draft',
    [EventStatus.PUBLISHED]: 'published',
    [EventStatus.CANCELLED]: 'cancelled',
  };

  return (
    <div className="flex gap-2">
      <Badge variant={statusMap[status]}>{status}</Badge>
      {isUpcoming && <Badge variant="upcoming">Upcoming</Badge>}
    </div>
  );
};