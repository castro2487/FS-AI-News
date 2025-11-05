# API Documentation

Complete API reference for the Event Service backend.

## Base URL

```
http://localhost:3001
```

## Authentication

Protected endpoints require Bearer token authentication.

```
Authorization: Bearer admin-token-123
```

Store token in request header:
```bash
curl -H "Authorization: Bearer admin-token-123" http://localhost:3001/events
```

## Error Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [
      {
        "field": "fieldName",
        "message": "Specific error message"
      }
    ]
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Missing or invalid auth token
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

## Endpoints

### Health Check

**GET /health**

Check API health status.

**No authentication required**

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T10:00:00.000Z"
}
```

### Create Event

**POST /events**

Create a new event.

**Requires authentication**

Request body:
```json
{
  "title": "Tech Conference 2025",
  "startAt": "2025-12-15T09:00:00Z",
  "endAt": "2025-12-15T17:00:00Z",
  "location": "Convention Center",
  "status": "DRAFT",
  "internalNotes": "VIP guests confirmed",
  "createdBy": "admin@example.com"
}
```

Required fields:
- `title` (string, max 200 chars)
- `startAt` (ISO 8601 datetime, must be in future)
- `endAt` (ISO 8601 datetime, must be after startAt)
- `location` (string)

Optional fields:
- `status` (enum: DRAFT|PUBLISHED|CANCELLED, default: DRAFT)
- `internalNotes` (string)
- `createdBy` (email string)

Response (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Tech Conference 2025",
  "startAt": "2025-12-15T09:00:00.000Z",
  "endAt": "2025-12-15T17:00:00.000Z",
  "location": "Convention Center",
  "status": "DRAFT",
  "internalNotes": "VIP guests confirmed",
  "createdBy": "admin@example.com",
  "updatedAt": "2025-12-01T10:00:00.000Z"
}
```

Example with curl:
```bash
curl -X POST http://localhost:3001/events \
  -H "Authorization: Bearer admin-token-123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2025",
    "startAt": "2025-12-15T09:00:00Z",
    "endAt": "2025-12-15T17:00:00Z",
    "location": "Convention Center"
  }'
```

### Update Event

**PATCH /events/:id**

Update event status or internal notes.

**Requires authentication**

Request body:
```json
{
  "status": "PUBLISHED",
  "internalNotes": "Updated notes"
}
```

Both fields are optional, but at least one must be provided.

Status transitions allowed:
- DRAFT → PUBLISHED
- DRAFT → CANCELLED
- PUBLISHED → CANCELLED

Response (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Tech Conference 2025",
  "startAt": "2025-12-15T09:00:00.000Z",
  "endAt": "2025-12-15T17:00:00.000Z",
  "location": "Convention Center",
  "status": "PUBLISHED",
  "internalNotes": "Updated notes",
  "createdBy": "admin@example.com",
  "updatedAt": "2025-12-01T11:00:00.000Z"
}
```

Example with curl:
```bash
curl -X PATCH http://localhost:3001/events/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer admin-token-123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PUBLISHED"
  }'
```

### Query Events (Admin)

**GET /events**

Query all events with filters and pagination.

**Requires authentication**

Query parameters:
- `dateFrom` (YYYY-MM-DD): Filter events starting from this date
- `dateTo` (YYYY-MM-DD): Filter events up to this date
- `locations` (comma-separated): Filter by location(s)
- `status` (comma-separated): Filter by status(es)
- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page

Response (200):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tech Conference 2025",
      "startAt": "2025-12-15T09:00:00.000Z",
      "endAt": "2025-12-15T17:00:00.000Z",
      "location": "Convention Center",
      "status": "PUBLISHED",
      "internalNotes": "VIP guests confirmed",
      "createdBy": "admin@example.com",
      "updatedAt": "2025-12-01T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

Example queries:
```bash
# All events
curl -H "Authorization: Bearer admin-token-123" \
  http://localhost:3001/events

# Filter by date range
curl -H "Authorization: Bearer admin-token-123" \
  "http://localhost:3001/events?dateFrom=2025-12-01&dateTo=2025-12-31"

# Filter by multiple locations
curl -H "Authorization: Bearer admin-token-123" \
  "http://localhost:3001/events?locations=Convention Center,Stadium"

# Filter by status
curl -H "Authorization: Bearer admin-token-123" \
  "http://localhost:3001/events?status=PUBLISHED,CANCELLED"

# Pagination
curl -H "Authorization: Bearer admin-token-123" \
  "http://localhost:3001/events?page=2&limit=10"
```

### Query Public Events

**GET /public/events**

Query published and cancelled events (public access).

**No authentication required**

Query parameters:
- `dateFrom` (YYYY-MM-DD): Filter events starting from this date
- `dateTo` (YYYY-MM-DD): Filter events up to this date
- `locations` (comma-separated): Filter by location(s)
- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page

Response (200):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Tech Conference 2025",
      "startAt": "2025-12-15T09:00:00.000Z",
      "endAt": "2025-12-15T17:00:00.000Z",
      "location": "Convention Center",
      "status": "PUBLISHED",
      "isUpcoming": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

Note: Only PUBLISHED and CANCELLED events are returned. Private fields (internalNotes, createdBy, updatedAt) are excluded.

Example:
```bash
curl http://localhost:3001/public/events?locations=Convention Center
```

### Event Summary (Server-Sent Events)

**GET /public/events/:id/summary**

Stream AI-generated event summary via Server-Sent Events.

**No authentication required**

Response headers:
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache, no-transform`
- `X-Summary-Cache: HIT|MISS` (indicates cache status)

Response format (SSE):
```
data: Tech Conference 2025 is scheduled to take place at 
data: Convention Center on Monday, December 15, 2025 starting at 
data: 09:00 AM. The event is expected to last 
data: approximately 8 hours. This is an upcoming event. 
data: Attendees can expect a well-organized event with 
data: comprehensive planning and execution.
event: done
data: 
```

The summary is streamed in chunks. Listen for the `done` event to know when streaming is complete.

Example with curl:
```bash
curl -N http://localhost:3001/public/events/550e8400-e29b-41d4-a716-446655440000/summary
```

Example with JavaScript:
```javascript
const eventSource = new EventSource(
  'http://localhost:3001/public/events/550e8400-e29b-41d4-a716-446655440000/summary'
);

let summary = '';

eventSource.addEventListener('message', (e) => {
  summary += e.data;
  console.log('Chunk:', e.data);
});

eventSource.addEventListener('done', () => {
  console.log('Complete summary:', summary);
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  console.error('Error:', e);
  eventSource.close();
});
```

## Validation Rules

### Title
- Required
- Non-empty after trimming
- Maximum 200 characters

### Dates
- Must be valid ISO 8601 format
- startAt must be in the future
- startAt must be before endAt

### Location
- Required
- Non-empty after trimming

### Status
- Must be one of: DRAFT, PUBLISHED, CANCELLED
- Transitions follow workflow rules

### Email (createdBy)
- Must be valid email format if provided

## Side Effects

### Event Creation
- Triggers async notification: "New event created: {title}"
- Logged to console (mock for AWS SNS/SES)

### Status Changes
- DRAFT → PUBLISHED: Logs "Event published: {title}"
- Any → CANCELLED: Logs "Event cancelled: {title}"

### Cache Invalidation
- Summary cache is invalidated when event fields affecting summary change
- Cache key based on: title, location, startAt, endAt

## Rate Limiting

Currently no rate limiting. In production, implement rate limiting on:
- POST/PATCH endpoints: 100 requests/hour per IP
- GET endpoints: 1000 requests/hour per IP

## Testing with Postman

Import this collection to Postman:

```json
{
  "info": {
    "name": "Event Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "admin-token-123",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Create Event",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/events",
        "body": {
          "mode": "raw",
          "raw": "{\"title\":\"Test Event\",\"startAt\":\"2025-12-15T10:00:00Z\",\"endAt\":\"2025-12-15T12:00:00Z\",\"location\":\"Test Location\"}"
        }
      }
    },
    {
      "name": "Get All Events",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/events"
      }
    }
  ]
}
```
