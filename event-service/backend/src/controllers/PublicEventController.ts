import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/EventService';
import { CacheService } from '../services/CacheService';

export class PublicEventController {
  constructor(
    private eventService: EventService,
    private cacheService: CacheService
  ) {}

  getPublicEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, ...filters } = req.query as any;
      const result = await this.eventService.findPublic(
        filters,
        parseInt(page) || 1,
        Math.min(parseInt(limit) || 20, 100)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // NEW: Public search method
  searchPublicEvents = async (req: Request, res: Response, next: NextFunction) => {
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

      // Use searchEvents but filter to only published/cancelled
      const result = await this.eventService.searchEvents(
        q,
        {
          ...filters,
          status: 'PUBLISHED,CANCELLED', // Only public events
        },
        parseInt(page) || 1,
        Math.min(parseInt(limit) || 20, 100)
      );

      // Map to public event format
      const publicResult = {
        events: result.events.map(event => ({
          id: event.id,
          title: event.title,
          startAt: event.startAt,
          endAt: event.endAt,
          location: event.location,
          status: event.status,
          isUpcoming: new Date(event.startAt) > new Date(),
        })),
        pagination: result.pagination,
      };

      res.json(publicResult);
    } catch (error) {
      next(error);
    }
  };

  getEventSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const event = await this.eventService.findById(id);

      if (!event || (event.status !== 'PUBLISHED' && event.status !== 'CANCELLED')) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Event not found' },
        });
      }

      // Generate cache key
      const cacheKey = this.cacheService.generateKey({
        id: event.id,
        title: event.title,
        location: event.location,
        startAt: event.startAt,
        endAt: event.endAt,
      });

      let summary = this.cacheService.get(cacheKey);
      const cacheStatus = summary ? 'HIT' : 'MISS';

      if (!summary) {
        summary = this.generateSummary(event);
        this.cacheService.set(cacheKey, summary);
      }

      // Set up SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Summary-Cache', cacheStatus);

      // Stream in chunks
      const words = summary.split(' ');
      let index = 0;

      const interval = setInterval(() => {
        if (index >= words.length) {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
          clearInterval(interval);
          return;
        }

        const chunk = words.slice(index, index + 3).join(' ') + ' ';
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        index += 3;
      }, 50);

      req.on('close', () => {
        clearInterval(interval);
      });
    } catch (error) {
      next(error);
    }
  };

  private generateSummary(event: any): string {
    const status = event.status === 'CANCELLED' ? 'cancelled' : 'exciting';
    const action = event.status === 'CANCELLED'
      ? 'Unfortunately, this event has been cancelled.'
      : 'Reserve your spot today and be part of something special!';

    return `Join us for "${event.title}" at ${event.location}! This ${status} event runs from ${
      new Date(event.startAt).toLocaleDateString()
    } to ${new Date(event.endAt).toLocaleDateString()}. ${action} Don't miss out on this incredible opportunity to connect, learn, and grow with fellow enthusiasts.`;
  }
}