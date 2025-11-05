/**
 * Public Event Routes
 * Handles unauthenticated public event endpoints
 */

import { Router, Request, Response } from 'express';
import { notFoundError, internalError } from '../middleware/errors';
import { eventStore } from '../services/EventStore';
import { summaryCache } from '../services/SummaryCache';
import { aiSummaryGenerator } from '../services/AISummaryGenerator';
import { toPublicEvent } from '../models/Event';

const router = Router();

/**
 * GET /public/events
 * Query public events (PUBLISHED or CANCELLED only)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const locationsParam = req.query.locations as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Parse comma-separated values
    const locations = locationsParam 
      ? locationsParam.split(',').map(s => s.trim())
      : undefined;

    // Query public events
    const result = eventStore.queryPublic({
      dateFrom,
      dateTo,
      locations,
      page,
      limit
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error querying public events:', error);
    res.status(500).json(internalError());
  }
});

/**
 * GET /public/events/:id/summary
 * Stream AI-generated summary via Server-Sent Events
 */
router.get('/:id/summary', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find event
    const event = eventStore.findById(id);
    if (!event) {
      res.status(404).json(notFoundError(`Event with id ${id} not found`));
      return;
    }

    // Convert to public event
    const publicEvent = toPublicEvent(event);
    if (!publicEvent) {
      res.status(404).json(notFoundError('Event is not publicly available'));
      return;
    }

    // Check cache
    const cachedSummary = summaryCache.get(publicEvent);
    const cacheHit = cachedSummary !== null;

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Summary-Cache', cacheHit ? 'HIT' : 'MISS');

    // If cache hit, send immediately
    if (cacheHit) {
      res.write(`data: ${cachedSummary}\n\n`);
      res.write('event: done\ndata: \n\n');
      res.end();
      return;
    }

    // Generate and stream summary
    let fullSummary = '';
    
    try {
      const generator = aiSummaryGenerator.generateStreamingSummary(publicEvent);
      
      for await (const chunk of generator) {
        fullSummary += chunk + ' ';
        res.write(`data: ${chunk} \n\n`);
      }

      // Cache the generated summary
      summaryCache.set(publicEvent, fullSummary.trim());

      // Send done event
      res.write('event: done\ndata: \n\n');
      res.end();
    } catch (error) {
      console.error('Error generating summary:', error);
      res.write(`event: error\ndata: Failed to generate summary\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Error in summary endpoint:', error);
    if (!res.headersSent) {
      res.status(500).json(internalError());
    }
  }
});

export default router;
