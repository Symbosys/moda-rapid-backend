import fs from 'fs';
import path from 'path';
import { RegisterVendorInput } from './vendor.validator';
import { logger } from '../../common/utils/logger';

export interface VendorAccount {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  businessName: string;
  businessType: string;
  passwordHash?: string;
  storeId?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface VendorOtpSession {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
}

export class VendorRepository {
  private static readonly memoryVendors = new Map<string, VendorAccount>();
  private static readonly otpSessions = new Map<string, VendorOtpSession>();
  private static readonly dataDir = path.resolve(process.cwd(), 'data');
  private static readonly dbFile = path.resolve(process.cwd(), 'data', 'vendor_profiles.json');

  constructor() {
    VendorRepository.loadFromFile();
  }

  private static loadFromFile() {
    try {
      if (!fs.existsSync(VendorRepository.dataDir)) {
        fs.mkdirSync(VendorRepository.dataDir, { recursive: true });
      }
      if (fs.existsSync(VendorRepository.dbFile)) {
        const raw = fs.readFileSync(VendorRepository.dbFile, 'utf-8');
        const list = JSON.parse(raw);
        if (typeof list === 'object' && list !== null) {
          for (const [key, val] of Object.entries(list)) {
            VendorRepository.memoryVendors.set(key, val as VendorAccount);
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  private static saveToFile() {
    try {
      if (!fs.existsSync(VendorRepository.dataDir)) {
        fs.mkdirSync(VendorRepository.dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      for (const [key, val] of VendorRepository.memoryVendors.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(VendorRepository.dbFile, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      logger.error('Failed to write vendor accounts to disk', e);
    }
  }

  async findByPhoneOrEmail(identifier: string): Promise<VendorAccount | null> {
    VendorRepository.loadFromFile();
    const idLower = identifier.toLowerCase().trim();
    for (const v of VendorRepository.memoryVendors.values()) {
      if (v.phone === identifier || (v.email && v.email.toLowerCase() === idLower)) {
        return v;
      }
    }
    return null;
  }

  async findById(vendorId: string): Promise<VendorAccount | null> {
    VendorRepository.loadFromFile();
    return VendorRepository.memoryVendors.get(vendorId) || null;
  }

  async create(data: RegisterVendorInput & { id: string }): Promise<VendorAccount> {
    VendorRepository.loadFromFile();
    const vendor: VendorAccount = {
      id: data.id,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      businessName: data.businessName,
      businessType: data.businessType,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    VendorRepository.memoryVendors.set(vendor.id, vendor);
    VendorRepository.memoryVendors.set(vendor.phone, vendor);
    if (vendor.email) {
      VendorRepository.memoryVendors.set(vendor.email.toLowerCase(), vendor);
    }
    VendorRepository.saveToFile();
    return vendor;
  }

  async attachStoreId(vendorId: string, storeId: string): Promise<void> {
    VendorRepository.loadFromFile();
    const vendor = VendorRepository.memoryVendors.get(vendorId);
    if (vendor) {
      vendor.storeId = storeId;
      VendorRepository.memoryVendors.set(vendorId, vendor);
      VendorRepository.saveToFile();
    }
  }

  async createOtpSession(phone: string, otpHash: string, expiresAt: Date): Promise<void> {
    VendorRepository.otpSessions.set(phone, {
      phone,
      otpHash,
      expiresAt,
      attempts: 0,
    });
  }

  async getOtpSession(phone: string): Promise<VendorOtpSession | null> {
    const session = VendorRepository.otpSessions.get(phone);
    if (!session) return null;
    if (new Date() > session.expiresAt) {
      VendorRepository.otpSessions.delete(phone);
      return null;
    }
    return session;
  }

  async incrementOtpAttempts(phone: string): Promise<void> {
    const session = VendorRepository.otpSessions.get(phone);
    if (session) {
      session.attempts += 1;
      VendorRepository.otpSessions.set(phone, session);
    }
  }

  async clearOtpSession(phone: string): Promise<void> {
    VendorRepository.otpSessions.delete(phone);
  }
}
