import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/db/prisma';

const app = createApp();
const authToken = 'admin-token-123';

describe('Event API Integration Tests', () => {
  beforeEach(async () => {
    await prisma.event.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /events', () => {
    it('should create a new event with valid data', async () => {
      const eventData = {
        title: 'Test Event',
        startAt: new Date(Date.now() + 86400000).toISOString(),
        endAt: new Date(Date.now() + 172800000).toISOString(),
        location: 'Test Location',
        status: 'DRAFT',
      };

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Event');
      expect(response.body.status).toBe('DRAFT');
    });

    it('should return 401 without authentication', async () => {
      const eventData = {
        title: 'Test Event',
        startAt: new Date(Date.now() + 86400000).toISOString(),
        endAt: new Date(Date.now() + 172800000).toISOString(),
        location: 'Test Location',
      };

      await request(app)
        .post('/events')
        .send(eventData)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const eventData = {
        title: '',
        startAt: new Date(Date.now() - 86400000).toISOString(),
        endAt: new Date(Date.now() + 172800000).toISOString(),
        location: 'Test Location',
      };

      const response = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toHaveLength(2);
    });
  });

  describe('GET /events', () => {
    it('should return paginated events', async () => {
      await prisma.event.createMany({
        data: [
          {
            title: 'Event 1',
            startAt: new Date('2025-12-01T10:00:00Z'),
            endAt: new Date('2025-12-01T12:00:00Z'),
            location: 'Location 1',
            status: 'PUBLISHED',
          },
          {
            title: 'Event 2',
            startAt: new Date('2025-12-15T10:00:00Z'),
            endAt: new Date('2025-12-15T12:00:00Z'),
            location: 'Location 2',
            status: 'DRAFT',
          },
        ],
      });

      const response = await request(app)
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.events).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('total', 2);
    });

    it('should filter by status', async () => {
      await prisma.event.createMany({
        data: [
          {
            title: 'Event 1',
            startAt: new Date('2025-12-01T10:00:00Z'),
            endAt: new Date('2025-12-01T12:00:00Z'),
            location: 'Location 1',
            status: 'PUBLISHED',
          },
          {
            title: 'Event 2',
            startAt: new Date('2025-12-15T10:00:00Z'),
            endAt: new Date('2025-12-15T12:00:00Z'),
            location: 'Location 2',
            status: 'DRAFT',
          },
        ],
      });

      const response = await request(app)
        .get('/events?status=PUBLISHED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0].status).toBe('PUBLISHED');
    });
  });

  describe('PATCH /events/:id', () => {
    it('should update event status', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          startAt: new Date(Date.now() + 86400000),
          endAt: new Date(Date.now() + 172800000),
          location: 'Test Location',
          status: 'DRAFT',
        },
      });

      const response = await request(app)
        .patch(`/events/${event.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'PUBLISHED' })
        .expect(200);

      expect(response.body.status).toBe('PUBLISHED');
    });

    it('should not allow invalid status transitions', async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          startAt: new Date(Date.now() + 86400000),
          endAt: new Date(Date.now() + 172800000),
          location: 'Test Location',
          status: 'PUBLISHED',
        },
      });

      await request(app)
        .patch(`/events/${event.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'DRAFT' })
        .expect(400);
    });
  });

  describe('GET /public/events', () => {
    it('should only return published and cancelled events', async () => {
      await prisma.event.createMany({
        data: [
          {
            title: 'Published Event',
            startAt: new Date(Date.now() + 86400000),
            endAt: new Date(Date.now() + 172800000),
            location: 'Location 1',
            status: 'PUBLISHED',
          },
          {
            title: 'Draft Event',
            startAt: new Date(Date.now() + 86400000),
            endAt: new Date(Date.now() + 172800000),
            location: 'Location 2',
            status: 'DRAFT',
          },
        ],
      });

      const response = await request(app)
        .get('/public/events')
        .expect(200);

      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0].title).toBe('Published Event');
    });

    it('should not include private fields', async () => {
      await prisma.event.create({
        data: {
          title: 'Published Event',
          startAt: new Date(Date.now() + 86400000),
          endAt: new Date(Date.now() + 172800000),
          location: 'Location 1',
          status: 'PUBLISHED',
          internalNotes: 'Secret notes',
          createdBy: 'admin@test.com',
        },
      });

      const response = await request(app)
        .get('/public/events')
        .expect(200);

      expect(response.body.events[0]).toHaveProperty('isUpcoming');
      expect(response.body.events[0]).not.toHaveProperty('internalNotes');
      expect(response.body.events[0]).not.toHaveProperty('createdBy');
    });
  });
});