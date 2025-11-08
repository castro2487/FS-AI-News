import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { createEventSchema, updateEventSchema, eventFiltersSchema } from '../validators/eventValidators';

export function createEventRoutes(eventController: EventController): Router {
  const router = Router();

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

  return router;
}