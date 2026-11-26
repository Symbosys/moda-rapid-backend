import { prisma } from '../../../../config/database';
import { CreateVendorProductInput, UpdateVendorProductInput, CreateProductVariantInput } from './product.validator';

export class VendorProductRepository {
  async findByStoreId(storeId: string, search?: string, categoryId?: string) {
    return prisma.product.findMany({
      where: {
        storeId,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        category: true,
        store: true,
      },
    });
  }

  async create(data: CreateVendorProductInput) {
    const calculatedDiscount =
      data.discountPercent ??
      (data.originalPrice > data.sellingPrice
        ? Math.round(((data.originalPrice - data.sellingPrice) / data.originalPrice) * 100)
        : 0);

    return prisma.product.create({
      data: {
        storeId: data.storeId,
        categoryId: data.categoryId,
        name: data.name,
        brand: data.brand,
        description: data.description || null,
        sellingPrice: data.sellingPrice,
        originalPrice: data.originalPrice,
        discountPercent: calculatedDiscount,
        imageUrl: data.imageUrl,
        galleryUrls: data.galleryUrls || [],
        isExpressDelivery: data.isExpressDelivery ?? true,
        deliveryEta: data.deliveryEta || '25 mins',
        isActive: true,
        variants: {
          create: data.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stockQuantity: v.stockQuantity,
            sku: v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            isActive: true,
          })),
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });
  }

  async update(productId: string, data: UpdateVendorProductInput) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.categoryId ? { categoryId: data.categoryId } : {}),
        ...(data.brand ? { brand: data.brand } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.sellingPrice !== undefined ? { sellingPrice: data.sellingPrice } : {}),
        ...(data.originalPrice !== undefined ? { originalPrice: data.originalPrice } : {}),
        ...(data.discountPercent !== undefined ? { discountPercent: data.discountPercent } : {}),
        ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
        ...(data.galleryUrls ? { galleryUrls: data.galleryUrls } : {}),
        ...(data.isExpressDelivery !== undefined ? { isExpressDelivery: data.isExpressDelivery } : {}),
        ...(data.deliveryEta ? { deliveryEta: data.deliveryEta } : {}),
      },
      include: {
        variants: true,
        category: true,
      },
    });
  }

  async addVariant(productId: string, variant: CreateProductVariantInput) {
    return prisma.productVariant.create({
      data: {
        productId,
        size: variant.size,
        color: variant.color,
        stockQuantity: variant.stockQuantity,
        sku: variant.sku || `SKU-${productId.slice(0, 4)}-${variant.size}-${variant.color}`,
        isActive: true,
      },
    });
  }

  async updateVariantStock(variantId: string, stockQuantity: number) {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity },
    });
  }

  async delete(productId: string) {
    return prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  }
}
