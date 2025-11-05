/**
 * Event Card Component
 * Displays event information in a stunning modern card format
 * Features glassmorphism, smooth animations, and premium styling
 */

import { Event, PublicEvent, EventStatus } from '../lib/types';

interface EventCardProps {
  event: Event | PublicEvent;
  onEdit?: (event: Event) => void;
  onViewSummary?: (event: PublicEvent) => void;
  showPrivateFields?: boolean;
}

export default function EventCard({ 
  event, 
  onEdit, 
  onViewSummary,
  showPrivateFields = false 
}: EventCardProps) {
  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: EventStatus) => {
    const baseClasses = "status-badge flex items-center gap-2";
    
    switch (status) {
      case EventStatus.DRAFT:
        return (
          <span className={`${baseClasses} status-draft`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Draft
          </span>
        );
      case EventStatus.PUBLISHED:
        return (
          <span className={`${baseClasses} status-published`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Published
          </span>
        );
      case EventStatus.CANCELLED:
        return (
          <span className={`${baseClasses} status-cancelled`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Cancelled
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} status-draft`}>
            {status}
          </span>
        );
    }
  };

  const isPublicEvent = (e: Event | PublicEvent): e is PublicEvent => {
    return 'isUpcoming' in e;
  };

  const isUpcoming = isPublicEvent(event) ? event.isUpcoming : true;

  return (
    <div className="interactive-card group relative overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-white/40 hover:border-indigo-200">
      {/* Card background with subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating orbs decoration */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-sm group-hover:blur-none transition-all duration-500"></div>
      <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-sm group-hover:blur-none transition-all duration-500"></div>
      
      <div className="relative z-10">
        {/* Header with title and status */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-800 leading-tight pr-4 group-hover:text-gray-900 transition-colors duration-300">
            {event.title}
          </h3>
          {getStatusBadge(event.status)}
        </div>

        {/* Event details with improved visual hierarchy */}
        <div className="space-y-4 mb-6">
          {/* Date and time */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100/50 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-blue-900 mb-1">{formatDate(startDate)}</p>
              <p className="text-sm text-blue-700 font-medium">
                {formatTime(startDate)} - {formatTime(endDate)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  isUpcoming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className={`text-xs font-semibold ${
                  isUpcoming ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {isUpcoming ? 'Upcoming Event' : 'Past Event'}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-2xl border border-emerald-100/50 group-hover:from-emerald-50 group-hover:to-teal-50 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900 mb-1">Location</p>
              <p className="text-sm text-emerald-700 font-medium leading-relaxed">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Private fields for admin view */}
        {showPrivateFields && 'internalNotes' in event && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50/90 to-orange-50/90 rounded-2xl border border-amber-200/50 group-hover:from-amber-50 group-hover:to-orange-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-amber-900">Internal Information</span>
            </div>
            <p className="text-sm text-amber-800 mb-3 leading-relaxed">
              <span className="font-semibold">Notes:</span> {event.internalNotes || 'No internal notes provided'}
            </p>
            {event.createdBy && (
              <p className="text-sm text-amber-700 font-medium">
                <span className="font-semibold">Created by:</span> {event.createdBy}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          {onEdit && (
            <button
              onClick={() => onEdit(event as Event)}
              className="flex-1 btn-primary group/btn rounded-xl font-semibold py-3 flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
            >
              <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Event
            </button>
          )}
          {onViewSummary && isPublicEvent(event) && (
            <button
              onClick={() => onViewSummary(event)}
              className="flex-1 relative overflow-hidden px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-xl font-bold hover:from-purple-700 hover:via-pink-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 group/summary"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 opacity-0 group-hover/summary:opacity-20 transition-opacity duration-300"></div>
              <svg className="w-5 h-5 group-hover/summary:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Summary
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover/summary:translate-x-0 transition-transform duration-500 skew-x-12"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
