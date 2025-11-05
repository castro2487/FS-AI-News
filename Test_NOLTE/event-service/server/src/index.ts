/**
 * Event Service Backend API
 * Main application entry point
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import eventRoutes from './routes/events';
import publicRoutes from './routes/public';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no authentication)
app.use('/public/events', publicRoutes);

// Protected routes (require authentication)
app.use('/events', authMiddleware, eventRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`
    }
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Event Service API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
