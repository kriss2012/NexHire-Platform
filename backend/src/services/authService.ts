import { UserRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';
import { RegisterInput, LoginInput } from '../validators/authValidator';
import { SafeUser } from '../types';

export class AuthService {
  public static async register(input: RegisterInput): Promise<{ user: SafeUser; token: string }> {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newUser = await UserRepository.create({
      id: userId,
      email: input.email.toLowerCase(),
      password_hash: passwordHash,
      full_name: input.full_name,
      role: input.role || 'USER',
      created_at: now,
      updated_at: now,
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return { user: newUser, token };
  }

  public static async login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
    const user = await UserRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await comparePassword(input.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
  }

  public static async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return user;
  }
}
