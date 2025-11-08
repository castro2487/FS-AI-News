import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { EventImageDTO, EventImage, UploadedFile } from '../types/upload.types';

export class FileService {
  private uploadDir: string;

  constructor(private prisma: PrismaClient) {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'events');
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveEventImage(file: Express.Multer.File, eventId: string): Promise<EventImage> {
    // Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      // Clean up uploaded file
      await this.deleteFile(file.path);
      throw new Error('Event not found');
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const newPath = path.join(this.uploadDir, filename);

    // Move file to permanent location
    await fs.rename(file.path, newPath);

    // Save to database
    const image = await this.prisma.eventImage.create({
      data: {
        eventId,
        filename,
        url: `/uploads/events/${filename}`,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return this.mapToEventImage(image);
  }

  async getEventImages(eventId: string): Promise<EventImage[]> {
    const images = await this.prisma.eventImage.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });

    return images.map(this.mapToEventImage);
  }

  async deleteEventImage(imageId: string): Promise<void> {
    const image = await this.prisma.eventImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Delete file from disk
    const filePath = path.join(this.uploadDir, image.filename);
    await this.deleteFile(filePath);

    // Delete from database
    await this.prisma.eventImage.delete({
      where: { id: imageId },
    });
  }

  async deleteEventImages(eventId: string): Promise<void> {
    const images = await this.prisma.eventImage.findMany({
      where: { eventId },
    });

    // Delete all files
    await Promise.all(
      images.map(async (image) => {
        const filePath = path.join(this.uploadDir, image.filename);
        await this.deleteFile(filePath);
      })
    );

    // Delete from database
    await this.prisma.eventImage.deleteMany({
      where: { eventId },
    });
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }

  private mapToEventImage(image: any): EventImage {
    return {
      id: image.id,
      eventId: image.eventId,
      filename: image.filename,
      url: image.url,
      mimeType: image.mimeType,
      size: image.size,
      createdAt: image.createdAt.toISOString(),
    };
  }
}