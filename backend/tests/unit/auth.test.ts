import { hashPassword, comparePassword } from '../../src/utils/password';
import { signToken, verifyToken } from '../../src/utils/jwt';
import { AuthService } from '../../src/services/authService';
import { seedDatabase } from '../../src/db/seed';

describe('Authentication & Token Unit Tests', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  describe('Password Utilities', () => {
    it('should hash and verify passwords correctly', async () => {
      const raw = 'SuperSecurePass123!';
      const hash = await hashPassword(raw);
      expect(hash).toBeDefined();
      expect(hash).not.toEqual(raw);

      const isValid = await comparePassword(raw, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Utilities', () => {
    it('should sign and verify valid JWT tokens', () => {
      const payload = {
        userId: 'usr-test-123',
        email: 'test@example.com',
        role: 'USER' as const,
      };

      const token = signToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const verified = verifyToken(token);
      expect(verified.userId).toBe(payload.userId);
      expect(verified.email).toBe(payload.email);
      expect(verified.role).toBe(payload.role);
    });
  });

  describe('AuthService', () => {
    it('should authenticate seeded admin user with correct credentials', async () => {
      const result = await AuthService.login({
        email: 'admin@jobboard.io',
        password: 'Admin123!',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('admin@jobboard.io');
      expect(result.user.role).toBe('ADMIN');
    });

    it('should reject login with wrong password', async () => {
      await expect(
        AuthService.login({
          email: 'admin@jobboard.io',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should register a new user successfully', async () => {
      const result = await AuthService.register({
        email: 'newuser@example.com',
        password: 'Password123!',
        full_name: 'New Test User',
        role: 'USER',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.full_name).toBe('New Test User');
    });

    it('should prevent duplicate registration with the same email', async () => {
      await expect(
        AuthService.register({
          email: 'admin@jobboard.io',
          password: 'Password123!',
          full_name: 'Duplicate Admin',
          role: 'ADMIN',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });
});
