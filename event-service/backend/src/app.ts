import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { prisma } from './db/prisma';

// Services
import { EventService } from './services/EventService';
import { EmailNotificationService, ConsoleNotificationService } from './services/NotificationService';
import { CacheService } from './services/CacheService';
import { AuthService } from './services/AuthService';
import { FileService } from './services/FileService';

// Controllers
import { EventController } from './controllers/EventController';
import { PublicEventController } from './controllers/PublicEventController';
import { AuthController } from './controllers/AuthController';
import { UploadController } from './controllers/UploadController';

// Routes
import { createEventRoutes } from './routes/eventRoutes';
import { createPublicRoutes } from './routes/publicRoutes';
import { createAuthRoutes } from './routes/authRoutes';
import { createUploadRoutes } from './routes/uploadRoutes';

// Middleware
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // Ensure upload directories exist
  const uploadDirs = [
    path.join(process.cwd(), 'uploads', 'temp'),
    path.join(process.cwd(), 'uploads', 'events'),
  ];
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Serve static files (uploaded images)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Initialize services
  const eventService = new EventService(prisma);
  const notificationService = process.env.SMTP_HOST 
    ? new EmailNotificationService()
    : new ConsoleNotificationService();
  const cacheService = new CacheService();
  const authService = new AuthService(prisma);
  const fileService = new FileService(prisma);

  // Initialize controllers
  const eventController = new EventController(eventService, notificationService);
  const publicController = new PublicEventController(eventService, cacheService);
  const authController = new AuthController(authService);
  const uploadController = new UploadController(fileService);

  // Routes
  app.use('/auth', createAuthRoutes(authController));
  app.use('/events', createEventRoutes(eventController));
  app.use('/public', createPublicRoutes(publicController));
  app.use('/upload', createUploadRoutes(uploadController));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        email: process.env.SMTP_HOST ? 'configured' : 'console',
      },
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}