import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateBody } from '../middleware/validation';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/authValidators';
import { requireJWTAuth } from '../middleware/jwtAuth';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Public routes
  router.post(
    '/register',
    validateBody(registerSchema),
    authController.register
  );

  router.post(
    '/login',
    validateBody(loginSchema),
    authController.login
  );

  router.post(
    '/refresh',
    validateBody(refreshTokenSchema),
    authController.refreshToken
  );

  // Protected routes
  router.get(
    '/profile',
    requireJWTAuth,
    authController.getProfile
  );

  return router;
}