import fs from 'fs';
import path from 'path';
import { AddressRepository } from './address.repository';
import { CreateAddressInput, UpdateAddressInput } from './address.validator';
import { NotFoundError } from '../../common/errors/app-error';
import { Address } from '@prisma/client';
import { logger } from '../../common/utils/logger';

export class AddressService {
  private static readonly memoryAddresses = new Map<string, any[]>();
  private static readonly dataDir = path.resolve(process.cwd(), 'data');
  private static readonly dbFile = path.resolve(process.cwd(), 'data', 'user_addresses.json');

  constructor(private readonly addressRepo: AddressRepository = new AddressRepository()) {
    AddressService.loadFromFile();
  }

  private static loadFromFile() {
    try {
      if (!fs.existsSync(AddressService.dataDir)) {
        fs.mkdirSync(AddressService.dataDir, { recursive: true });
      }
      if (fs.existsSync(AddressService.dbFile)) {
        const raw = fs.readFileSync(AddressService.dbFile, 'utf-8');
        const list = JSON.parse(raw);
        if (typeof list === 'object' && list !== null) {
          for (const [key, val] of Object.entries(list)) {
            if (Array.isArray(val)) {
              AddressService.memoryAddresses.set(key, val);
            }
          }
        }
      }
    } catch {
      // Ignore initial file read error
    }
  }

  private static saveToFile() {
    try {
      if (!fs.existsSync(AddressService.dataDir)) {
        fs.mkdirSync(AddressService.dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      for (const [key, val] of AddressService.memoryAddresses.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(AddressService.dbFile, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      logger.error('Failed to write user addresses to persistent disk storage', e);
    }
  }

  private mapToClientModel(a: Address) {
    const formattedTag =
      a.tag === 'HOME' ? 'Home' : a.tag === 'WORK' ? 'Work' : 'Other';

    return {
      id: a.id,
      tag: formattedTag,
      houseNo: a.houseNo,
      area: a.area,
      landmark: a.landmark || '',
      city: a.city,
      pincode: a.pincode,
      contactPhone: a.contactPhone,
      latitude: a.latitude,
      longitude: a.longitude,
      isDefault: a.isDefault,
    };
  }

  async getAddresses(userId: string) {
    AddressService.loadFromFile();
    try {
      const list = await this.addressRepo.findByUserId(userId);
      if (list.length > 0) {
        return list.map(this.mapToClientModel);
      }
    } catch (e) {
      logger.warn(`PostgreSQL getAddresses fallback for user ${userId}: ${(e as any)?.message || e}`);
    }

    const cached = AddressService.memoryAddresses.get(userId) || [];
    return cached;
  }

  async createAddress(userId: string, input: CreateAddressInput) {
    AddressService.loadFromFile();
    let createdModel: any = null;
    try {
      const count = await this.addressRepo.countByUserId(userId);
      const shouldBeDefault = count === 0 ? true : (input.isDefault ?? false);

      const created = await this.addressRepo.create(userId, {
        ...input,
        isDefault: shouldBeDefault,
      });

      createdModel = this.mapToClientModel(created);
      logger.info(`Address dynamically saved to PostgreSQL database for user ${userId}`);
    } catch (e) {
      logger.warn(`Prisma createAddress fallback for ${userId}: ${(e as any)?.message || e}`);
      createdModel = {
        id: `addr_${Date.now()}`,
        tag: input.tag === 'HOME' ? 'Home' : input.tag === 'WORK' ? 'Work' : 'Other',
        houseNo: input.houseNo,
        area: input.area,
        landmark: input.landmark || '',
        city: input.city,
        pincode: input.pincode,
        contactPhone: input.contactPhone,
        latitude: input.latitude ?? 28.5584,
        longitude: input.longitude ?? 77.2023,
        isDefault: input.isDefault ?? true,
      };
    }

    if (createdModel) {
      const existing = AddressService.memoryAddresses.get(userId) || [];
      const updatedList = createdModel.isDefault
        ? existing.map((a: any) => ({ ...a, isDefault: false }))
        : existing;
      AddressService.memoryAddresses.set(userId, [...updatedList, createdModel]);
      AddressService.saveToFile();
    }

    return createdModel;
  }

  async updateAddress(addressId: string, userId: string, input: UpdateAddressInput) {
    AddressService.loadFromFile();
    try {
      const existing = await this.addressRepo.findById(addressId, userId);
      if (existing) {
        const updated = await this.addressRepo.update(addressId, userId, input);
        const mapped = this.mapToClientModel(updated);
        const list = AddressService.memoryAddresses.get(userId) || [];
        const index = list.findIndex((a: any) => a.id === addressId);
        if (index >= 0) {
          list[index] = mapped;
          AddressService.memoryAddresses.set(userId, list);
          AddressService.saveToFile();
        }
        return mapped;
      }
    } catch {
      // offline fallback
    }

    const list = AddressService.memoryAddresses.get(userId) || [];
    const index = list.findIndex((a: any) => a.id === addressId);
    if (index >= 0) {
      list[index] = { ...list[index], ...input };
      AddressService.memoryAddresses.set(userId, list);
      AddressService.saveToFile();
      return list[index];
    }

    return {
      id: addressId,
      ...input,
    };
  }

  async deleteAddress(addressId: string, userId: string) {
    AddressService.loadFromFile();
    try {
      await this.addressRepo.delete(addressId);
    } catch {
      // offline fallback
    }

    const list = AddressService.memoryAddresses.get(userId) || [];
    AddressService.memoryAddresses.set(
      userId,
      list.filter((a: any) => a.id !== addressId),
    );
    AddressService.saveToFile();

    return { deleted: true, addressId };
  }

  async setDefaultAddress(addressId: string, userId: string) {
    AddressService.loadFromFile();
    try {
      const updated = await this.addressRepo.setDefault(addressId, userId);
      const mapped = this.mapToClientModel(updated);
      const list = AddressService.memoryAddresses.get(userId) || [];
      const updatedList = list.map((a: any) => ({ ...a, isDefault: a.id === addressId }));
      AddressService.memoryAddresses.set(userId, updatedList);
      AddressService.saveToFile();
      return mapped;
    } catch {
      // offline fallback
    }

    const list = AddressService.memoryAddresses.get(userId) || [];
    const updatedList = list.map((a: any) => ({ ...a, isDefault: a.id === addressId }));
    AddressService.memoryAddresses.set(userId, updatedList);
    AddressService.saveToFile();
    const item = updatedList.find((a: any) => a.id === addressId);
    return item || { id: addressId, isDefault: true };
  }
}
