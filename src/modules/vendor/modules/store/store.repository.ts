import { prisma } from '../../../../config/database';
import { Store } from '@prisma/client';
import { CreateVendorStoreInput, UpdateVendorStoreInput } from './store.validator';

export class VendorStoreRepository {
  async findById(id: string): Promise<Store | null> {
    return prisma.store.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Store | null> {
    return prisma.store.findUnique({
      where: { slug },
    });
  }

  async findByPhone(phone: string): Promise<Store | null> {
    return prisma.store.findFirst({
      where: { phone },
    });
  }

  async create(data: CreateVendorStoreInput & { slug: string }): Promise<Store> {
    return prisma.store.create({
      data: {
        name: data.name,
        slug: data.slug,
        phone: data.phone,
        email: data.email || null,
        bannerUrl: data.bannerUrl,
        logoUrl: data.logoUrl || null,
        addressText: data.addressText,
        city: data.city,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        estimatedDeliveryTime: data.estimatedDeliveryTime || '20-30 min',
        serviceRadiusKm: data.serviceRadiusKm || 7.0,
        isBrandStore: data.isBrandStore || false,
        brandName: data.brandName || null,
        isOpen: true,
        isActive: true,
      },
    });
  }

  async update(id: string, data: UpdateVendorStoreInput): Promise<Store> {
    return prisma.store.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.bannerUrl ? { bannerUrl: data.bannerUrl } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
        ...(data.addressText ? { addressText: data.addressText } : {}),
        ...(data.city ? { city: data.city } : {}),
        ...(data.pincode ? { pincode: data.pincode } : {}),
        ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
        ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
        ...(data.estimatedDeliveryTime ? { estimatedDeliveryTime: data.estimatedDeliveryTime } : {}),
        ...(data.serviceRadiusKm !== undefined ? { serviceRadiusKm: data.serviceRadiusKm } : {}),
        ...(data.isBrandStore !== undefined ? { isBrandStore: data.isBrandStore } : {}),
        ...(data.brandName !== undefined ? { brandName: data.brandName } : {}),
      },
    });
  }

  async toggleStatus(id: string, isOpen: boolean): Promise<Store> {
    return prisma.store.update({
      where: { id },
      data: { isOpen },
    });
  }
}
