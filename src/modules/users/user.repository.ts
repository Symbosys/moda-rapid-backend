import { prisma } from '../../config/database';
import { User } from '@prisma/client';
import { UpdateUserProfileInput } from './user.validator';

export class UserRepository {
  async findById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateProfile(userId: string, data: UpdateUserProfileInput): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.email !== undefined ? { email: data.email || null } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
      },
    });
  }
}
