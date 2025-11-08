import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/FileService';
import { validateImageFile } from '../validators/uploadValidators';

export class UploadController {
  constructor(private fileService: FileService) {}

  uploadEventImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
          },
        });
      }

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE',
            message: validation.error,
          },
        });
      }

      const image = await this.fileService.saveEventImage(file, eventId);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        return res.status(404).json({
          error: { code: 'EVENT_NOT_FOUND', message: error.message },
        });
      }
      next(error);
    }
  };

  getEventImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const images = await this.fileService.getEventImages(eventId);
      res.json({ images });
    } catch (error) {
      next(error);
    }
  };

  deleteEventImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageId } = req.params;
      await this.fileService.deleteEventImage(imageId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Image not found') {
        return res.status(404).json({
          error: { code: 'IMAGE_NOT_FOUND', message: error.message },
        });
      }
      next(error);
    }
  };
}