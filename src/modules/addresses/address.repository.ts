import { prisma } from '../../config/database';
import { Address } from '@prisma/client';
import { CreateAddressInput, UpdateAddressInput } from './address.validator';

export class AddressRepository {
  async findByUserId(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findById(addressId: string, userId: string): Promise<Address | null> {
    return prisma.address.findFirst({
      where: { id: addressId, userId },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.address.count({ where: { userId } });
  }

  async clearDefaultFlag(userId: string): Promise<void> {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  async create(userId: string, data: CreateAddressInput): Promise<Address> {
    if (data.isDefault) {
      await this.clearDefaultFlag(userId);
    }

    return prisma.address.create({
      data: {
        userId,
        tag: data.tag,
        houseNo: data.houseNo,
        area: data.area,
        landmark: data.landmark || null,
        city: data.city,
        pincode: data.pincode,
        contactPhone: data.contactPhone,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.isDefault,
      },
    });
  }

  async update(addressId: string, userId: string, data: UpdateAddressInput): Promise<Address> {
    if (data.isDefault) {
      await this.clearDefaultFlag(userId);
    }

    return prisma.address.update({
      where: { id: addressId },
      data: {
        ...(data.tag !== undefined ? { tag: data.tag } : {}),
        ...(data.houseNo !== undefined ? { houseNo: data.houseNo } : {}),
        ...(data.area !== undefined ? { area: data.area } : {}),
        ...(data.landmark !== undefined ? { landmark: data.landmark } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.pincode !== undefined ? { pincode: data.pincode } : {}),
        ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone } : {}),
        ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
        ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
        ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
      },
    });
  }

  async delete(addressId: string): Promise<void> {
    await prisma.address.delete({
      where: { id: addressId },
    });
  }

  async setDefault(addressId: string, userId: string): Promise<Address> {
    await this.clearDefaultFlag(userId);
    return prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
