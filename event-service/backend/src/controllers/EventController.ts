import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/EventService';
import { ConsoleNotificationService } from '../services/NotificationService';
import { EventStatus } from '../types/event.types';

export class EventController {
  constructor(
    private eventService: EventService,
    private notificationService: ConsoleNotificationService
  ) {}

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const event = await this.eventService.create(req.body);
      await this.notificationService.notifyEventCreated(event);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  };

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, ...filters } = req.query as any;
      const result = await this.eventService.findAll(
        filters,
        parseInt(page) || 1,
        Math.min(parseInt(limit) || 20, 100)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentEvent = await this.eventService.findById(id);

      if (!currentEvent) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Event not found' },
        });
      }

      const updatedEvent = await this.eventService.update(id, req.body);

      // Send notifications
      if (req.body.status) {
        if (currentEvent.status === EventStatus.DRAFT && req.body.status === EventStatus.PUBLISHED) {
          await this.notificationService.notifyEventPublished(updatedEvent);
        }
        if (req.body.status === EventStatus.CANCELLED) {
          await this.notificationService.notifyEventCancelled(updatedEvent);
        }
      }

      res.json(updatedEvent);
    } catch (error) {
      next(error);
    }
  };
  searchEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, page, limit, ...filters } = req.query as any;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          error: {
            code: 'MISSING_QUERY',
            message: 'Search query parameter "q" is required',
          },
        });
      }

      const result = await this.eventService.searchEvents(
        q,
        filters,
        parseInt(page) || 1,
        Math.min(parseInt(limit) || 20, 100)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}