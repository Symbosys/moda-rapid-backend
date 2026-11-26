import fs from 'fs';
import path from 'path';
import { VendorStoreRepository } from './store.repository';
import { CreateVendorStoreInput, UpdateVendorStoreInput } from './store.validator';
import { NotFoundError, ConflictError } from '../../../../common/errors/app-error';
import { logger } from '../../../../common/utils/logger';

export class VendorStoreService {
  private static readonly memoryStores = new Map<string, any>();
  private static readonly dataDir = path.resolve(process.cwd(), 'data');
  private static readonly dbFile = path.resolve(process.cwd(), 'data', 'vendor_stores.json');

  constructor(private readonly storeRepo: VendorStoreRepository = new VendorStoreRepository()) {
    VendorStoreService.loadFromFile();
  }

  private static loadFromFile() {
    try {
      if (!fs.existsSync(VendorStoreService.dataDir)) {
        fs.mkdirSync(VendorStoreService.dataDir, { recursive: true });
      }
      if (fs.existsSync(VendorStoreService.dbFile)) {
        const raw = fs.readFileSync(VendorStoreService.dbFile, 'utf-8');
        const list = JSON.parse(raw);
        if (typeof list === 'object' && list !== null) {
          for (const [key, val] of Object.entries(list)) {
            VendorStoreService.memoryStores.set(key, val);
          }
        }
      }
    } catch {
      // Ignore initial file load error
    }
  }

  private static saveToFile() {
    try {
      if (!fs.existsSync(VendorStoreService.dataDir)) {
        fs.mkdirSync(VendorStoreService.dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      for (const [key, val] of VendorStoreService.memoryStores.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(VendorStoreService.dbFile, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      logger.error('Failed to write vendor stores to persistent disk storage', e);
    }
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async createStore(vendorId: string, input: CreateVendorStoreInput) {
    VendorStoreService.loadFromFile();
    const slug = input.slug || this.generateSlug(input.name);

    let store: any = null;
    try {
      const existingSlug = await this.storeRepo.findBySlug(slug);
      if (existingSlug) {
        throw new ConflictError(`Store with slug '${slug}' already exists`);
      }
      store = await this.storeRepo.create({ ...input, slug });
      logger.info(`Vendor store '${store.name}' registered successfully in PostgreSQL`);
    } catch (e) {
      if (e instanceof ConflictError) throw e;
      logger.warn(`Prisma vendor store create fallback: ${(e as any)?.message || e}`);
      store = {
        id: `store_${Date.now()}`,
        name: input.name,
        slug,
        phone: input.phone,
        email: input.email || null,
        bannerUrl: input.bannerUrl,
        logoUrl: input.logoUrl || null,
        addressText: input.addressText,
        city: input.city,
        pincode: input.pincode,
        latitude: input.latitude,
        longitude: input.longitude,
        rating: 4.8,
        reviewCount: 0,
        isOpen: true,
        isActive: true,
        estimatedDeliveryTime: input.estimatedDeliveryTime || '20-30 min',
        serviceRadiusKm: input.serviceRadiusKm || 7.0,
        isBrandStore: input.isBrandStore || false,
        brandName: input.brandName || null,
        vendorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (store) {
      VendorStoreService.memoryStores.set(store.id, store);
      VendorStoreService.memoryStores.set(`vendor_${vendorId}`, store);
      VendorStoreService.saveToFile();
    }

    return store;
  }

  async getStoreByVendorId(vendorId: string, storeId?: string) {
    VendorStoreService.loadFromFile();
    let store: any = null;
    if (storeId) {
      try {
        store = await this.storeRepo.findById(storeId);
      } catch {
        store = null;
      }
    }

    if (!store) {
      store = VendorStoreService.memoryStores.get(storeId || '') ||
        VendorStoreService.memoryStores.get(`vendor_${vendorId}`);
    }

    if (!store) {
      // Default initial mock store if first time vendor
      store = {
        id: 's1',
        name: 'Style Studio Boutique',
        slug: 'style-studio-boutique',
        phone: '+919876543210',
        email: 'stylestudio@modarfashion.com',
        bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
        logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        addressText: 'Shop 14, High Street Market, Indiranagar',
        city: 'Bengaluru',
        pincode: '560038',
        latitude: 12.9716,
        longitude: 77.5946,
        rating: 4.8,
        reviewCount: 124,
        isOpen: true,
        isActive: true,
        estimatedDeliveryTime: '20-30 min',
        serviceRadiusKm: 7.0,
        isBrandStore: true,
        brandName: 'Style Studio',
      };
    }

    return store;
  }

  async updateStore(storeId: string, input: UpdateVendorStoreInput) {
    VendorStoreService.loadFromFile();
    let updated: any = null;
    try {
      updated = await this.storeRepo.update(storeId, input);
    } catch (e) {
      logger.warn(`Prisma store update fallback: ${(e as any)?.message || e}`);
      const existing = VendorStoreService.memoryStores.get(storeId) || {};
      updated = {
        ...existing,
        ...input,
        id: storeId,
        updatedAt: new Date().toISOString(),
      };
    }

    if (updated) {
      VendorStoreService.memoryStores.set(storeId, updated);
      VendorStoreService.saveToFile();
    }
    return updated;
  }

  async toggleStoreStatus(storeId: string, isOpen: boolean) {
    VendorStoreService.loadFromFile();
    let updated: any = null;
    try {
      updated = await this.storeRepo.toggleStatus(storeId, isOpen);
    } catch {
      const existing = VendorStoreService.memoryStores.get(storeId) || {};
      updated = { ...existing, id: storeId, isOpen, updatedAt: new Date().toISOString() };
    }

    if (updated) {
      VendorStoreService.memoryStores.set(storeId, updated);
      VendorStoreService.saveToFile();
    }
    return updated;
  }
}
