import { prisma } from '../../config/database';
import { User, OtpSession } from '@prisma/client';

export class AuthRepository {
  async findUserByPhone(phoneNumber: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  async createUser(phoneNumber: string): Promise<User> {
    return prisma.user.create({
      data: {
        phoneNumber,
      },
    });
  }

  async createOtpSession(phoneNumber: string, otpHash: string, expiresAt: DateTimeLike): Promise<OtpSession> {
    return prisma.otpSession.create({
      data: {
        phoneNumber,
        otpHash,
        expiresAt: new Date(expiresAt),
      },
    });
  }

  async findValidOtpSession(phoneNumber: string): Promise<OtpSession | null> {
    return prisma.otpSession.findFirst({
      where: {
        phoneNumber,
        isVerified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async incrementOtpAttempts(sessionId: string): Promise<void> {
    await prisma.otpSession.update({
      where: { id: sessionId },
      data: { attempts: { increment: 1 } },
    });
  }

  async markOtpVerified(sessionId: string, userId: string): Promise<void> {
    await prisma.otpSession.update({
      where: { id: sessionId },
      data: {
        isVerified: true,
        userId,
      },
    });
  }
}

type DateTimeLike = Date | string | number;
