/**
 * Backend API E2E Tests
 * Comprehensive test suite for all API endpoints
 */

import request from 'supertest';
import app from '../index';
import { eventStore } from '../services/EventStore';
import { summaryCache } from '../services/SummaryCache';
import { EventStatus } from '../models/Event';

const VALID_TOKEN = 'admin-token-123';
const INVALID_TOKEN = 'wrong-token';

describe('Event Service API E2E Tests', () => {
  beforeEach(() => {
    // Clear store and cache before each test
    eventStore.clear();
    summaryCache.clear();
  });

  describe('Authentication', () => {
    test('should reject requests without token', async () => {
      const response = await request(app)
        .post('/events')
        .send({});
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('should reject requests with invalid token', async () => {
      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${INVALID_TOKEN}`)
        .send({});
      
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    test('should accept requests with valid token', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const laterDate = new Date(Date.now() + 172800000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Test Event',
          startAt: futureDate,
          endAt: laterDate,
          location: 'Test Location'
        });
      
      expect(response.status).toBe(201);
    });
  });

  describe('POST /events', () => {
    test('should create event with valid data', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const laterDate = new Date(Date.now() + 172800000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Test Event',
          startAt: futureDate,
          endAt: laterDate,
          location: 'Test Location',
          status: EventStatus.DRAFT,
          internalNotes: 'Some notes',
          createdBy: 'test@example.com'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'Test Event',
        location: 'Test Location',
        status: EventStatus.DRAFT,
        internalNotes: 'Some notes',
        createdBy: 'test@example.com'
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    test('should default status to DRAFT', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const laterDate = new Date(Date.now() + 172800000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Test Event',
          startAt: futureDate,
          endAt: laterDate,
          location: 'Test Location'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.status).toBe(EventStatus.DRAFT);
    });

    test('should reject empty title', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const laterDate = new Date(Date.now() + 172800000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: '',
          startAt: futureDate,
          endAt: laterDate,
          location: 'Test Location'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject title exceeding 200 chars', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const laterDate = new Date(Date.now() + 172800000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'a'.repeat(201),
          startAt: futureDate,
          endAt: laterDate,
          location: 'Test Location'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject event starting in the past', async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const laterDate = new Date(Date.now() + 86400000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Test Event',
          startAt: pastDate,
          endAt: laterDate,
          location: 'Test Location'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject startAt >= endAt', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Test Event',
          startAt: futureDate,
          endAt: futureDate,
          location: 'Test Location'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject invalid email in createdBy', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const laterDate = new Date(Date.now() + 172800000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Test Event',
          startAt: futureDate,
          endAt: laterDate,
          location: 'Test Location',
          createdBy: 'invalid-email'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /events/:id', () => {
    let eventId: string;

    beforeEach(async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const laterDate = new Date(Date.now() + 172800000).toISOString();

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Test Event',
          startAt: futureDate,
          endAt: laterDate,
          location: 'Test Location',
          status: EventStatus.DRAFT
        });
      
      eventId = response.body.id;
    });

    test('should update event status from DRAFT to PUBLISHED', async () => {
      const response = await request(app)
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          status: EventStatus.PUBLISHED
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(EventStatus.PUBLISHED);
    });

    test('should update event status from DRAFT to CANCELLED', async () => {
      const response = await request(app)
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          status: EventStatus.CANCELLED
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(EventStatus.CANCELLED);
    });

    test('should update internalNotes', async () => {
      const response = await request(app)
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          internalNotes: 'Updated notes'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.internalNotes).toBe('Updated notes');
    });

    test('should reject invalid status transition', async () => {
      // First publish the event
      await request(app)
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({ status: EventStatus.PUBLISHED });

      // Try to change back to DRAFT
      const response = await request(app)
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          status: EventStatus.DRAFT
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject updates to CANCELLED events', async () => {
      // First cancel the event
      await request(app)
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({ status: EventStatus.CANCELLED });

      // Try to update notes
      const response = await request(app)
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          internalNotes: 'New notes'
        });
      
      expect(response.status).toBe(400);
    });

    test('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .patch('/events/non-existent-id')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          status: EventStatus.PUBLISHED
        });
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /events', () => {
    beforeEach(async () => {
      // Create multiple events
      const events = [
        {
          title: 'Event 1',
          startAt: new Date('2025-12-01T10:00:00Z').toISOString(),
          endAt: new Date('2025-12-01T12:00:00Z').toISOString(),
          location: 'Location A',
          status: EventStatus.DRAFT
        },
        {
          title: 'Event 2',
          startAt: new Date('2025-12-02T10:00:00Z').toISOString(),
          endAt: new Date('2025-12-02T12:00:00Z').toISOString(),
          location: 'Location B',
          status: EventStatus.PUBLISHED
        },
        {
          title: 'Event 3',
          startAt: new Date('2025-12-03T10:00:00Z').toISOString(),
          endAt: new Date('2025-12-03T12:00:00Z').toISOString(),
          location: 'Location A',
          status: EventStatus.CANCELLED
        }
      ];

      for (const event of events) {
        await request(app)
          .post('/events')
          .set('Authorization', `Bearer ${VALID_TOKEN}`)
          .send(event);
      }
    });

    test('should return all events', async () => {
      const response = await request(app)
        .get('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
    });

    test('should filter by date range', async () => {
      const response = await request(app)
        .get('/events?dateFrom=2025-12-02&dateTo=2025-12-02')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Event 2');
    });

    test('should filter by location', async () => {
      const response = await request(app)
        .get('/events?locations=Location A')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/events?status=PUBLISHED')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(EventStatus.PUBLISHED);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/events?page=1&limit=2')
        .set('Authorization', `Bearer ${VALID_TOKEN}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /public/events', () => {
    beforeEach(async () => {
      // Create events with different statuses
      const events = [
        {
          title: 'Draft Event',
          startAt: new Date('2025-12-01T10:00:00Z').toISOString(),
          endAt: new Date('2025-12-01T12:00:00Z').toISOString(),
          location: 'Location A',
          status: EventStatus.DRAFT
        },
        {
          title: 'Published Event',
          startAt: new Date('2025-12-02T10:00:00Z').toISOString(),
          endAt: new Date('2025-12-02T12:00:00Z').toISOString(),
          location: 'Location B',
          status: EventStatus.PUBLISHED
        },
        {
          title: 'Cancelled Event',
          startAt: new Date('2025-12-03T10:00:00Z').toISOString(),
          endAt: new Date('2025-12-03T12:00:00Z').toISOString(),
          location: 'Location C',
          status: EventStatus.CANCELLED
        }
      ];

      for (const event of events) {
        await request(app)
          .post('/events')
          .set('Authorization', `Bearer ${VALID_TOKEN}`)
          .send(event);
      }
    });

    test('should only return PUBLISHED and CANCELLED events', async () => {
      const response = await request(app).get('/public/events');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((e: any) => 
        e.status === EventStatus.PUBLISHED || e.status === EventStatus.CANCELLED
      )).toBe(true);
    });

    test('should not require authentication', async () => {
      const response = await request(app).get('/public/events');
      expect(response.status).toBe(200);
    });

    test('should include isUpcoming field', async () => {
      const response = await request(app).get('/public/events');
      
      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty('isUpcoming');
    });

    test('should not include private fields', async () => {
      const response = await request(app).get('/public/events');
      
      expect(response.status).toBe(200);
      const event = response.body.data[0];
      expect(event).not.toHaveProperty('internalNotes');
      expect(event).not.toHaveProperty('createdBy');
      expect(event).not.toHaveProperty('updatedAt');
    });
  });

  describe('GET /public/events/:id/summary (SSE)', () => {
    let publishedEventId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Tech Conference',
          startAt: new Date('2025-12-15T09:00:00Z').toISOString(),
          endAt: new Date('2025-12-15T17:00:00Z').toISOString(),
          location: 'Convention Center',
          status: EventStatus.PUBLISHED
        });
      
      publishedEventId = response.body.id;
    });

    test('should stream summary with MISS cache header on first request', async () => {
      const response = await request(app)
        .get(`/public/events/${publishedEventId}/summary`);
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/event-stream');
      expect(response.headers['x-summary-cache']).toBe('MISS');
      expect(response.text).toContain('data:');
    });

    test('should return cached summary with HIT header on subsequent request', async () => {
      // First request
      await request(app).get(`/public/events/${publishedEventId}/summary`);
      
      // Second request should hit cache
      const response = await request(app)
        .get(`/public/events/${publishedEventId}/summary`);
      
      expect(response.status).toBe(200);
      expect(response.headers['x-summary-cache']).toBe('HIT');
    });

    test('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/public/events/non-existent-id/summary');
      
      expect(response.status).toBe(404);
    });

    test('should return 404 for DRAFT event', async () => {
      const draftResponse = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${VALID_TOKEN}`)
        .send({
          title: 'Draft Event',
          startAt: new Date('2025-12-20T09:00:00Z').toISOString(),
          endAt: new Date('2025-12-20T17:00:00Z').toISOString(),
          location: 'Venue',
          status: EventStatus.DRAFT
        });
      
      const response = await request(app)
        .get(`/public/events/${draftResponse.body.id}/summary`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
