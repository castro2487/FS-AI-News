import { Router } from 'express';
import { PublicEventController } from '../controllers/PublicEventController';
import { validateQuery } from '../middleware/validation';
import { eventFiltersSchema } from '../validators/eventValidators';

export function createPublicRoutes(publicController: PublicEventController): Router {
  const router = Router();

  router.get(
    '/events',
    validateQuery(eventFiltersSchema),
    publicController.getPublicEvents
  );

  router.get(
    '/events/:id/summary',
    publicController.getEventSummary
  );

  return router;
}