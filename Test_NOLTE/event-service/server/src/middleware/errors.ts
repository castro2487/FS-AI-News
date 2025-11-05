/**
 * Error Response Utility
 * Standard error format for API responses
 */

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: ErrorDetail[]
): ErrorResponse {
  const response: ErrorResponse = {
    error: {
      code,
      message
    }
  };

  if (details && details.length > 0) {
    response.error.details = details;
  }

  return response;
}

export function validationError(errors: string[]): ErrorResponse {
  return createErrorResponse(
    'VALIDATION_ERROR',
    'Validation failed',
    errors.map(msg => ({ message: msg }))
  );
}

export function notFoundError(message: string = 'Resource not found'): ErrorResponse {
  return createErrorResponse('NOT_FOUND', message);
}

export function internalError(message: string = 'Internal server error'): ErrorResponse {
  return createErrorResponse('INTERNAL_ERROR', message);
}
