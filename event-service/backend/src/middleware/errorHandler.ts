import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err.message === 'Event not found') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: err.message,
      },
    });
  }

  if (err.message.includes('Cannot transition')) {
    return res.status(400).json({
      error: {
        code: 'INVALID_TRANSITION',
        message: err.message,
      },
    });
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}