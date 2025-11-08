import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '../../../src/db/prisma';
import { AuthService } from '../../../src/services/AuthService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(prisma);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      const user = await authService.register(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('USER');
      expect(user).not.toHaveProperty('password');
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      await authService.register(userData);

      await expect(authService.register(userData)).rejects.toThrow('already exists');
    });

    it('should hash password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      await authService.register(userData);

      const dbUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(dbUser?.password).not.toBe('Password123');
      expect(dbUser?.password).toHaveLength(60); // bcrypt hash length
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid token', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      const payload = authService.verifyAccessToken(result.accessToken);

      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('role');
      expect(payload.email).toBe('test@example.com');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyAccessToken('invalid-token');
      }).toThrow('Invalid or expired token');
    });
  });
});