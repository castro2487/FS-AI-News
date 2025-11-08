import { describe, it, expect } from '@jest/globals';
import { createEventSchema, validateStatusTransition } from '@/lib/validators/eventValidators';
import { EventStatus } from '@/types/event.types';

describe('Event Validators', () => {
  describe('createEventSchema', () => {
    it('should validate correct event data', () => {
      const validData = {
        title: 'Test Event',
        startAt: new Date(Date.now() + 86400000).toISOString(),
        endAt: new Date(Date.now() + 172800000).toISOString(),
        location: 'Test Location',
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        startAt: new Date(Date.now() + 86400000).toISOString(),
        endAt: new Date(Date.now() + 172800000).toISOString(),
        location: 'Test Location',
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject title longer than 200 characters', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        startAt: new Date(Date.now() + 86400000).toISOString(),
        endAt: new Date(Date.now() + 172800000).toISOString(),
        location: 'Test Location',
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject past start date', () => {
      const invalidData = {
        title: 'Test Event',
        startAt: new Date(Date.now() - 86400000).toISOString(),
        endAt: new Date(Date.now() + 86400000).toISOString(),
        location: 'Test Location',
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject start date after end date', () => {
      const invalidData = {
        title: 'Test Event',
        startAt: new Date(Date.now() + 172800000).toISOString(),
        endAt: new Date(Date.now() + 86400000).toISOString(),
        location: 'Test Location',
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow DRAFT to PUBLISHED transition', () => {
      const result = validateStatusTransition(EventStatus.DRAFT, EventStatus.PUBLISHED);
      expect(result.valid).toBe(true);
    });

    it('should allow DRAFT to CANCELLED transition', () => {
      const result = validateStatusTransition(EventStatus.DRAFT, EventStatus.CANCELLED);
      expect(result.valid).toBe(true);
    });

    it('should allow PUBLISHED to CANCELLED transition', () => {
      const result = validateStatusTransition(EventStatus.PUBLISHED, EventStatus.CANCELLED);
      expect(result.valid).toBe(true);
    });

    it('should not allow PUBLISHED to DRAFT transition', () => {
      const result = validateStatusTransition(EventStatus.PUBLISHED, EventStatus.DRAFT);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should not allow CANCELLED to any transition', () => {
      const resultToDraft = validateStatusTransition(EventStatus.CANCELLED, EventStatus.DRAFT);
      const resultToPublished = validateStatusTransition(EventStatus.CANCELLED, EventStatus.PUBLISHED);
      
      expect(resultToDraft.valid).toBe(false);
      expect(resultToPublished.valid).toBe(false);
    });
  });
});