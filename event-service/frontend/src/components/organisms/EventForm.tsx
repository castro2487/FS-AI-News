import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';
import { ImageUpload } from './ImageUpload';
import { CreateEventDTO, EventStatus, EventImage } from '@/types/event.types';

export interface EventFormProps {
  onSubmit: (data: CreateEventDTO) => Promise<void>;
  onClose: () => void;
  eventId?: string; // For editing existing events with images
  images?: EventImage[];
  onImagesChange?: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ 
  onSubmit, 
  onClose,
  eventId,
  images = [],
  onImagesChange,
}) => {
  const [formData, setFormData] = useState<CreateEventDTO>({
    title: '',
    startAt: '',
    endAt: '',
    location: '',
    status: EventStatus.DRAFT,
    internalNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    setErrors({});
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      if (error.error?.details) {
        const newErrors: Record<string, string> = {};
        error.error.details.forEach((detail: any) => {
          newErrors[detail.field] = detail.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
              <ul className="list-disc list-inside text-sm text-red-700">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <FormField
              label="Title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Start Date & Time"
                type="datetime-local"
                value={formData.startAt.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value + ':00Z' })}
                error={errors.startAt}
                required
              />
              <FormField
                label="End Date & Time"
                type="datetime-local"
                value={formData.endAt.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value + ':00Z' })}
                error={errors.endAt}
                required
              />
            </div>

            <FormField
              label="Location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              error={errors.location}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={EventStatus.DRAFT}>Draft</option>
                <option value={EventStatus.PUBLISHED}>Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea
                value={formData.internalNotes}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Image Upload Section - Only show if editing existing event */}
            {eventId && onImagesChange && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Event Images</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                  >
                    {showImageUpload ? 'Hide' : 'Show'} Images
                  </Button>
                </div>
                
                {showImageUpload && (
                  <ImageUpload
                    eventId={eventId}
                    images={images}
                    onImagesChange={onImagesChange}
                  />
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};