/**
 * Event Routes (Protected)
 * Handles authenticated event management endpoints
 */

import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { validationError, notFoundError, internalError } from '../middleware/errors';
import { eventStore } from '../services/EventStore';
import { EventValidator, CreateEventInput, UpdateEventInput, EventStatus } from '../models/Event';
import { notificationService } from '../services/NotificationService';
import { summaryCache } from '../services/SummaryCache';

const router = Router();

/**
 * POST /events
 * Create a new event
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const input: CreateEventInput = {
      title: req.body.title,
      startAt: req.body.startAt,
      endAt: req.body.endAt,
      location: req.body.location,
      status: req.body.status,
      internalNotes: req.body.internalNotes,
      createdBy: req.body.createdBy
    };

    // Validate input
    const errors = EventValidator.validateCreateEvent(input);
    if (errors.length > 0) {
      res.status(400).json(validationError(errors));
      return;
    }

    // Create event (ensure status is always defined)
    const event = eventStore.create({
      title: input.title,
      startAt: input.startAt,
      endAt: input.endAt,
      location: input.location,
      status: input.status || EventStatus.DRAFT,
      internalNotes: input.internalNotes,
      createdBy: input.createdBy
    });

    // Trigger async notification (non-blocking)
    notificationService.sendNotification(`New event created: ${event.title}`).catch(err => {
      console.error('Failed to send notification:', err);
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json(internalError());
  }
});

/**
 * PATCH /events/:id
 * Update event (status and internalNotes only)
 */
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateEventInput = {
      status: req.body.status,
      internalNotes: req.body.internalNotes
    };

    // Find existing event
    const existingEvent = eventStore.findById(id);
    if (!existingEvent) {
      res.status(404).json(notFoundError(`Event with id ${id} not found`));
      return;
    }

    // Validate status transition if status is being updated
    const errors: string[] = [];
    if (updates.status) {
      const statusErrors = EventValidator.validateStatus(updates.status);
      errors.push(...statusErrors);

      if (statusErrors.length === 0) {
        const transitionErrors = EventValidator.validateStatusTransition(
          existingEvent.status,
          updates.status
        );
        errors.push(...transitionErrors);
      }
    }

    if (errors.length > 0) {
      res.status(400).json(validationError(errors));
      return;
    }

    // Update event
    const updatedEvent = eventStore.update(id, updates);
    if (!updatedEvent) {
      res.status(404).json(notFoundError(`Event with id ${id} not found`));
      return;
    }

    // Log status changes
    if (updates.status && updates.status !== existingEvent.status) {
      if (updates.status === EventStatus.PUBLISHED) {
        notificationService.logEvent(`Event published: ${updatedEvent.title}`);
      } else if (updates.status === EventStatus.CANCELLED) {
        notificationService.logEvent(`Event cancelled: ${updatedEvent.title}`);
      }

      // Invalidate summary cache if public fields affected
      // Note: Only title, location, startAt, endAt affect cache, but status change
      // may affect visibility, so we invalidate
      const publicEvent = {
        id: updatedEvent.id,
        title: updatedEvent.title,
        startAt: updatedEvent.startAt,
        endAt: updatedEvent.endAt,
        location: updatedEvent.location,
        status: updatedEvent.status as EventStatus.PUBLISHED | EventStatus.CANCELLED,
        isUpcoming: new Date(updatedEvent.startAt) > new Date()
      };
      summaryCache.invalidate(publicEvent);
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json(internalError());
  }
});

/**
 * GET /events
 * Query events with filters and pagination
 */
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const locationsParam = req.query.locations as string | undefined;
    const statusParam = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Parse comma-separated values
    const locations = locationsParam 
      ? locationsParam.split(',').map(s => s.trim())
      : undefined;
    
    const status = statusParam
      ? statusParam.split(',').map(s => s.trim() as EventStatus)
      : undefined;

    // Query events
    const result = eventStore.query({
      dateFrom,
      dateTo,
      locations,
      status,
      page,
      limit
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error querying events:', error);
    res.status(500).json(internalError());
  }
});

export default router;
