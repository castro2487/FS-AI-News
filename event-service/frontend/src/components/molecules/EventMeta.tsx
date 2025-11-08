import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/date';

export interface EventMetaProps {
  startAt: string;
  endAt: string;
  location: string;
}

export const EventMeta: React.FC<EventMetaProps> = ({ startAt, endAt, location }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center text-gray-600 text-sm">
        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="break-words">
          {formatDateTime(startAt)} - {formatDateTime(endAt)}
        </span>
      </div>
      <div className="flex items-center text-gray-600 text-sm">
        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="break-words">{location}</span>
      </div>
    </div>
  );
};