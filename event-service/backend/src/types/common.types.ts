import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}