import fs from 'fs';
import path from 'path';
import { SubmitVendorKycInput, UpdateKycStatusInput } from './kyc.validator';
import { logger } from '../../../../common/utils/logger';

export interface VendorKycRecord extends SubmitVendorKycInput {
  id: string;
  vendorId: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export class VendorKycRepository {
  private static readonly memoryKyc = new Map<string, VendorKycRecord>();
  private static readonly dataDir = path.resolve(process.cwd(), 'data');
  private static readonly dbFile = path.resolve(process.cwd(), 'data', 'vendor_kyc.json');

  constructor() {
    VendorKycRepository.loadFromFile();
  }

  private static loadFromFile() {
    try {
      if (!fs.existsSync(VendorKycRepository.dataDir)) {
        fs.mkdirSync(VendorKycRepository.dataDir, { recursive: true });
      }
      if (fs.existsSync(VendorKycRepository.dbFile)) {
        const raw = fs.readFileSync(VendorKycRepository.dbFile, 'utf-8');
        const list = JSON.parse(raw);
        if (typeof list === 'object' && list !== null) {
          for (const [key, val] of Object.entries(list)) {
            VendorKycRepository.memoryKyc.set(key, val as VendorKycRecord);
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  private static saveToFile() {
    try {
      if (!fs.existsSync(VendorKycRepository.dataDir)) {
        fs.mkdirSync(VendorKycRepository.dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      for (const [key, val] of VendorKycRepository.memoryKyc.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(VendorKycRepository.dbFile, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      logger.error('Failed to write vendor KYC to persistent disk storage', e);
    }
  }

  async findByStoreId(storeId: string): Promise<VendorKycRecord | null> {
    VendorKycRepository.loadFromFile();
    for (const record of VendorKycRepository.memoryKyc.values()) {
      if (record.storeId === storeId) return record;
    }
    return null;
  }

  async findByVendorId(vendorId: string): Promise<VendorKycRecord | null> {
    VendorKycRepository.loadFromFile();
    return VendorKycRepository.memoryKyc.get(vendorId) || null;
  }

  async saveKyc(vendorId: string, input: SubmitVendorKycInput): Promise<VendorKycRecord> {
    VendorKycRepository.loadFromFile();
    const existing = await this.findByStoreId(input.storeId);
    const record: VendorKycRecord = {
      id: existing ? existing.id : `kyc_${Date.now()}`,
      vendorId,
      ...input,
      status: 'VERIFIED', // Instant sandbox/dev verified status
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    VendorKycRepository.memoryKyc.set(vendorId, record);
    VendorKycRepository.memoryKyc.set(input.storeId, record);
    VendorKycRepository.saveToFile();
    return record;
  }

  async updateStatus(storeId: string, input: UpdateKycStatusInput): Promise<VendorKycRecord | null> {
    VendorKycRepository.loadFromFile();
    const existing = await this.findByStoreId(storeId);
    if (!existing) return null;

    existing.status = input.status;
    existing.rejectionReason = input.rejectionReason;
    existing.updatedAt = new Date().toISOString();

    VendorKycRepository.memoryKyc.set(existing.vendorId, existing);
    VendorKycRepository.memoryKyc.set(storeId, existing);
    VendorKycRepository.saveToFile();
    return existing;
  }
}
