import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { requireAuth } from '../middleware/jwtAuth'; // UPDATED: Use hybrid auth
import { validateBody, validateQuery } from '../middleware/validation';
import { createEventSchema, updateEventSchema, eventFiltersSchema } from '../validators/eventValidators';

export function createEventRoutes(eventController: EventController): Router {
  const router = Router();

  // Existing routes
  router.post(
    '/',
    requireAuth,
    validateBody(createEventSchema),
    eventController.createEvent
  );

  router.get(
    '/',
    requireAuth,
    validateQuery(eventFiltersSchema),
    eventController.getEvents
  );

  router.patch(
    '/:id',
    requireAuth,
    validateBody(updateEventSchema),
    eventController.updateEvent
  );

  // NEW: Search endpoint
  router.get(
    '/search',
    requireAuth,
    eventController.searchEvents
  );

  return router;
}