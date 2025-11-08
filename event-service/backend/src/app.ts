import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { prisma } from './db/prisma';
import { EventService } from './services/EventService';
import { ConsoleNotificationService } from './services/NotificationService';
import { CacheService } from './services/CacheService';
import { EventController } from './controllers/EventController';
import { PublicEventController } from './controllers/PublicEventController';
import { createEventRoutes } from './routes/eventRoutes';
import { createPublicRoutes } from './routes/publicRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(morgan('dev'));

  // Services
  const eventService = new EventService(prisma);
  const notificationService = new ConsoleNotificationService();
  const cacheService = new CacheService();

  // Controllers
  const eventController = new EventController(eventService, notificationService);
  const publicController = new PublicEventController(eventService, cacheService);

  // Routes
  app.use('/events', createEventRoutes(eventController));
  app.use('/public', createPublicRoutes(publicController));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}