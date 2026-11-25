import fs from 'fs';
import path from 'path';
import { UserRepository } from './user.repository';
import { NotFoundError } from '../../common/errors/app-error';
import { UpdateUserProfileInput } from './user.validator';
import { logger } from '../../common/utils/logger';

export class UserService {
  public static readonly memoryProfiles = new Map<string, any>();
  private static readonly dataDir = path.resolve(process.cwd(), 'data');
  private static readonly dbFile = path.resolve(process.cwd(), 'data', 'user_profiles.json');

  constructor(private readonly userRepo: UserRepository = new UserRepository()) {
    UserService.loadFromFile();
  }

  private static loadFromFile() {
    try {
      if (!fs.existsSync(UserService.dataDir)) {
        fs.mkdirSync(UserService.dataDir, { recursive: true });
      }
      if (fs.existsSync(UserService.dbFile)) {
        const raw = fs.readFileSync(UserService.dbFile, 'utf-8');
        const list = JSON.parse(raw);
        if (typeof list === 'object' && list !== null) {
          for (const [key, val] of Object.entries(list)) {
            UserService.memoryProfiles.set(key, val);
          }
        }
      }
    } catch {
      // Ignore initial file read error
    }
  }

  private static saveToFile() {
    try {
      if (!fs.existsSync(UserService.dataDir)) {
        fs.mkdirSync(UserService.dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      for (const [key, val] of UserService.memoryProfiles.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(UserService.dbFile, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      logger.error('Failed to write user profiles to persistent disk storage', e);
    }
  }

  static getStaticProfile(key: string) {
    UserService.loadFromFile();
    return UserService.memoryProfiles.get(key) || UserService.memoryProfiles.get('default');
  }

  async getProfile(userId: string, phoneNumber?: string) {
    UserService.loadFromFile();
    let user: any = null;
    try {
      user = await this.userRepo.findById(userId);
      if (!user && phoneNumber) {
        user = await this.userRepo.findByPhone(phoneNumber);
      }
    } catch (e) {
      logger.warn(`PostgreSQL getProfile fallback for user ${userId}: ${(e as any)?.message || e}`);
      user = null;
    }

    const cached = UserService.memoryProfiles.get(userId) ||
      (phoneNumber ? UserService.memoryProfiles.get(phoneNumber) : null) ||
      UserService.memoryProfiles.get('default');

    if (!user) {
      user = cached || {
        id: userId,
        phoneNumber: phoneNumber || '',
        fullName: '',
        email: '',
        avatarUrl: '',
        role: 'CUSTOMER',
        isActive: true,
        createdAt: new Date(),
      };
    } else if (cached?.avatarUrl && !user.avatarUrl) {
      user.avatarUrl = cached.avatarUrl;
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName || '',
      email: user.email || '',
      avatarUrl: user.avatarUrl || '',
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput, phoneNumber?: string) {
    UserService.loadFromFile();
    let updated: any = null;
    try {
      updated = await this.userRepo.updateProfile(userId, input, phoneNumber);
      logger.info(`Profile updated in PostgreSQL database for user ${userId}`);
    } catch (e) {
      logger.warn(`Prisma DB updateProfile fallback for ${userId}: ${(e as any)?.message || e}`);
      const existing = UserService.memoryProfiles.get(userId) ||
        (phoneNumber ? UserService.memoryProfiles.get(phoneNumber) : null) ||
        UserService.memoryProfiles.get('default') || {};

      updated = {
        id: userId,
        phoneNumber: phoneNumber || existing.phoneNumber || '',
        fullName: input.fullName !== undefined ? input.fullName : (existing.fullName || ''),
        email: input.email !== undefined ? input.email : (existing.email || ''),
        avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : (existing.avatarUrl || ''),
        role: existing.role || 'CUSTOMER',
        updatedAt: new Date(),
      };
    }

    if (updated) {
      UserService.memoryProfiles.set(userId, updated);
      UserService.memoryProfiles.set('default', updated);
      if (updated.phoneNumber) {
        UserService.memoryProfiles.set(updated.phoneNumber, updated);
      }
      UserService.saveToFile();
    }

    return {
      id: updated.id,
      phoneNumber: updated.phoneNumber,
      fullName: updated.fullName || '',
      email: updated.email || '',
      avatarUrl: updated.avatarUrl || '',
      role: updated.role,
      updatedAt: updated.updatedAt,
    };
  }
}
