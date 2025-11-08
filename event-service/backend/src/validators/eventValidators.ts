import { z } from 'zod';
import { EventStatus } from '../types/event.types';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be max 200 characters'),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().min(1, 'Location is required'),
  status: z.nativeEnum(EventStatus).optional().default(EventStatus.DRAFT),
  internalNotes: z.string().optional(),
  createdBy: z.string().email().optional(),
}).refine(
  (data) => new Date(data.startAt) < new Date(data.endAt),
  { message: 'Start date must be before end date', path: ['startAt'] }
).refine(
  (data) => new Date(data.startAt) > new Date(),
  { message: 'Must be in the future', path: ['startAt'] }
);

export const updateEventSchema = z.object({
  status: z.nativeEnum(EventStatus).optional(),
  internalNotes: z.string().optional(),
});

export const eventFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  locations: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export function validateStatusTransition(
  currentStatus: EventStatus,
  newStatus: EventStatus
): { valid: boolean; error?: string } {
  const invalidTransitions: Record<EventStatus, EventStatus[]> = {
    [EventStatus.DRAFT]: [],
    [EventStatus.PUBLISHED]: [EventStatus.DRAFT],
    [EventStatus.CANCELLED]: [EventStatus.DRAFT, EventStatus.PUBLISHED],
  };

  if (invalidTransitions[currentStatus]?.includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { valid: true };
}