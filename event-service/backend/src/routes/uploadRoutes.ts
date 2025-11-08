import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { uploadSingleImage, handleUploadError } from '../middleware/upload';
import { requireAuth } from '../middleware/jwtAuth';

export function createUploadRoutes(uploadController: UploadController): Router {
  const router = Router();

  // Upload image for event (requires authentication)
  router.post(
    '/events/:eventId/images',
    requireAuth,
    uploadSingleImage,
    handleUploadError,
    uploadController.uploadEventImage
  );

  // Get all images for an event (public)
  router.get(
    '/events/:eventId/images',
    uploadController.getEventImages
  );

  // Delete image (requires authentication)
  router.delete(
    '/images/:imageId',
    requireAuth,
    uploadController.deleteEventImage
  );

  return router;
}