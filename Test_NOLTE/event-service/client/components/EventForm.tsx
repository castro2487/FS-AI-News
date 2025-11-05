/**
 * Event Form Component
 * Beautiful form for creating and editing events with modern design
 */

'use client';

import { useState, FormEvent } from 'react';
import { CreateEventInput, Event, EventStatus } from '../lib/types';

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: CreateEventInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function EventForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventInput>({
    title: initialData?.title || '',
    startAt: initialData?.startAt ? initialData.startAt.substring(0, 16) : '',
    endAt: initialData?.endAt ? initialData.endAt.substring(0, 16) : '',
    location: initialData?.location || '',
    status: initialData?.status || EventStatus.DRAFT,
    internalNotes: initialData?.internalNotes || '',
    createdBy: initialData?.createdBy || ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);

    try {
      // Convert local datetime to ISO string
      const submitData = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString()
      };

      await onSubmit(submitData);
    } catch (error: any) {
      if (error.details) {
        setErrors(error.details.map((d: any) => d.message));
      } else {
        setErrors([error.message || 'Failed to save event']);
      }
    }
  };

  const getFieldIcon = (fieldName: string) => {
    switch (fieldName) {
      case 'title':
        return (
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case 'startAt':
      case 'endAt':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'location':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'status':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'internalNotes':
        return (
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'createdBy':
        return (
          <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <div className="glass-card-intense rounded-2xl p-6 border-l-4 border-red-500 bg-gradient-to-r from-red-50/80 to-pink-50/80">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-red-800 font-bold mb-2">Validation Errors</h4>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Title Field */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              {getFieldIcon('title')}
              Event Title *
            </div>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onFocus={() => setFocusedField('title')}
            onBlur={() => setFocusedField(null)}
            className={`input-field transition-all duration-300 ${
              focusedField === 'title' ? 'shadow-lg scale-105' : ''
            }`}
            required
            maxLength={200}
            placeholder="Enter a compelling event title..."
          />
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">Give your event a memorable name</span>
            <span className={`font-medium ${
              formData.title.length > 180 ? 'text-red-500' : 
              formData.title.length > 150 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {formData.title.length}/200
            </span>
          </div>
        </div>

        {/* Date and Time Fields */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              {getFieldIcon('startAt')}
              Start Date & Time *
            </div>
          </label>
          <input
            type="datetime-local"
            value={formData.startAt}
            onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            onFocus={() => setFocusedField('startAt')}
            onBlur={() => setFocusedField(null)}
            className={`input-field transition-all duration-300 ${
              focusedField === 'startAt' ? 'shadow-lg scale-105' : ''
            }`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              {getFieldIcon('endAt')}
              End Date & Time *
            </div>
          </label>
          <input
            type="datetime-local"
            value={formData.endAt}
            onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            onFocus={() => setFocusedField('endAt')}
            onBlur={() => setFocusedField(null)}
            className={`input-field transition-all duration-300 ${
              focusedField === 'endAt' ? 'shadow-lg scale-105' : ''
            }`}
            required
          />
        </div>

        {/* Location Field */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              {getFieldIcon('location')}
              Event Location *
            </div>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            onFocus={() => setFocusedField('location')}
            onBlur={() => setFocusedField(null)}
            className={`input-field transition-all duration-300 ${
              focusedField === 'location' ? 'shadow-lg scale-105' : ''
            }`}
            required
            placeholder="Full address, venue name, or online location..."
          />
        </div>

        {/* Status Field */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              {getFieldIcon('status')}
              Status
            </div>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
            onFocus={() => setFocusedField('status')}
            onBlur={() => setFocusedField(null)}
            className={`input-field transition-all duration-300 ${
              focusedField === 'status' ? 'shadow-lg scale-105' : ''
            } ${initialData ? 'opacity-75' : ''}`}
            disabled={!!initialData}
          >
            <option value={EventStatus.DRAFT}>Draft</option>
            <option value={EventStatus.PUBLISHED}>Published</option>
            <option value={EventStatus.CANCELLED}>Cancelled</option>
          </select>
          {initialData && (
            <div className="mt-2 p-3 bg-blue-50/80 rounded-xl border border-blue-200/50">
              <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Use the status update buttons to change status after creation
              </p>
            </div>
          )}
        </div>

        {/* Created By Field */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              {getFieldIcon('createdBy')}
              Organizer Email
            </div>
          </label>
          <input
            type="email"
            value={formData.createdBy}
            onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
            onFocus={() => setFocusedField('createdBy')}
            onBlur={() => setFocusedField(null)}
            className={`input-field transition-all duration-300 ${
              focusedField === 'createdBy' ? 'shadow-lg scale-105' : ''
            }`}
            placeholder="organizer@example.com"
          />
        </div>

        {/* Internal Notes Field */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              {getFieldIcon('internalNotes')}
              Internal Notes
            </div>
          </label>
          <textarea
            value={formData.internalNotes}
            onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
            onFocus={() => setFocusedField('internalNotes')}
            onBlur={() => setFocusedField(null)}
            className={`input-field min-h-[120px] resize-none transition-all duration-300 ${
              focusedField === 'internalNotes' ? 'shadow-lg scale-105' : ''
            }`}
            rows={4}
            placeholder="Add any internal notes, reminders, or additional details..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 btn-primary py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{initialData ? 'Update Event' : 'Create Event'}</span>
            </div>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 btn-secondary py-4 text-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </div>
        </button>
      </div>
    </form>
  );
}
