import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../../../src/db/prisma';
import { FileService } from '../../../src/services/FileService';
import { EventService } from '../../../src/services/EventService';

describe('FileService', () => {
  let fileService: FileService;
  let eventService: EventService;
  let testEventId: string;

  beforeEach(async () => {
    fileService = new FileService(prisma);
    eventService = new EventService(prisma);

    // Create test event
    const event = await eventService.create({
      title: 'Test Event',
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 172800000).toISOString(),
      location: 'Test Location',
    });
    testEventId = event.id;
  });

  afterEach(async () => {
    await prisma.eventImage.deleteMany();
    await prisma.event.deleteMany();
  });

  describe('saveEventImage', () => {
    it('should save image metadata to database', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: 'uploads/temp',
        filename: 'test-123.jpg',
        path: 'uploads/temp/test-123.jpg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      // Create temp file
      await fs.mkdir('uploads/temp', { recursive: true });
      await fs.writeFile(mockFile.path, 'test');

      const image = await fileService.saveEventImage(mockFile, testEventId);

      expect(image).toBeDefined();
      expect(image.eventId).toBe(testEventId);
      expect(image.mimeType).toBe('image/jpeg');
      expect(image.size).toBe(1024);

      // Cleanup
      await fileService.deleteEventImage(image.id);
    });

    it('should throw error for non-existent event', async () => {
      const mockFile = {
        path: 'uploads/temp/test.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      await fs.mkdir('uploads/temp', { recursive: true });
      await fs.writeFile(mockFile.path, 'test');

      await expect(
        fileService.saveEventImage(mockFile, 'non-existent-id')
      ).rejects.toThrow('Event not found');
    });
  });

  describe('getEventImages', () => {
    it('should return all images for event', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: 'uploads/temp',
        filename: 'test-123.jpg',
        path: 'uploads/temp/test-123.jpg',
        buffer: Buffer.from(''),
      } as Express.Multer.File;

      await fs.mkdir('uploads/temp', { recursive: true });
      await fs.writeFile(mockFile.path, 'test');

      const image = await fileService.saveEventImage(mockFile, testEventId);
      const images = await fileService.getEventImages(testEventId);

      expect(images).toHaveLength(1);
      expect(images[0].id).toBe(image.id);

      // Cleanup
      await fileService.deleteEventImage(image.id);
    });
  });
});