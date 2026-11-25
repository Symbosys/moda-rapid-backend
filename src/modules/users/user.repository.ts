import { prisma } from '../../config/database';
import { User } from '@prisma/client';
import { UpdateUserProfileInput } from './user.validator';

export class UserRepository {
  async findById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  async updateProfile(userId: string, data: UpdateUserProfileInput, phoneNumber?: string): Promise<User> {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });

    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
          ...(data.email !== undefined ? { email: data.email || null } : {}),
          ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
        },
      });
    }

    const phone = phoneNumber || '';
    return prisma.user.upsert({
      where: { phoneNumber: phone },
      update: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.email !== undefined ? { email: data.email || null } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
      },
      create: {
        phoneNumber: phone,
        fullName: data.fullName || '',
        email: data.email || null,
        avatarUrl: data.avatarUrl || null,
      },
    });
  }
}
