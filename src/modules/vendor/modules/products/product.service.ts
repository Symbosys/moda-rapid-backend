import fs from 'fs';
import path from 'path';
import { VendorProductRepository } from './product.repository';
import { CreateVendorProductInput, UpdateVendorProductInput, CreateProductVariantInput } from './product.validator';
import { NotFoundError } from '../../../../common/errors/app-error';
import { logger } from '../../../../common/utils/logger';

export class VendorProductService {
  private static readonly memoryProducts = new Map<string, any[]>();
  private static readonly dataDir = path.resolve(process.cwd(), 'data');
  private static readonly dbFile = path.resolve(process.cwd(), 'data', 'vendor_products.json');

  constructor(private readonly productRepo: VendorProductRepository = new VendorProductRepository()) {
    VendorProductService.loadFromFile();
  }

  private static loadFromFile() {
    try {
      if (!fs.existsSync(VendorProductService.dataDir)) {
        fs.mkdirSync(VendorProductService.dataDir, { recursive: true });
      }
      if (fs.existsSync(VendorProductService.dbFile)) {
        const raw = fs.readFileSync(VendorProductService.dbFile, 'utf-8');
        const list = JSON.parse(raw);
        if (typeof list === 'object' && list !== null) {
          for (const [key, val] of Object.entries(list)) {
            if (Array.isArray(val)) {
              VendorProductService.memoryProducts.set(key, val);
            }
          }
        }
      }
    } catch {
      // Ignore initial file load error
    }
  }

  private static saveToFile() {
    try {
      if (!fs.existsSync(VendorProductService.dataDir)) {
        fs.mkdirSync(VendorProductService.dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      for (const [key, val] of VendorProductService.memoryProducts.entries()) {
        obj[key] = val;
      }
      fs.writeFileSync(VendorProductService.dbFile, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      logger.error('Failed to write vendor products to persistent disk storage', e);
    }
  }

  async getProducts(storeId: string, search?: string, categoryId?: string) {
    VendorProductService.loadFromFile();
    try {
      const list = await this.productRepo.findByStoreId(storeId, search, categoryId);
      if (list && list.length > 0) {
        return list;
      }
    } catch (e) {
      logger.warn(`PostgreSQL get vendor products fallback for store ${storeId}: ${(e as any)?.message || e}`);
    }

    const cached = VendorProductService.memoryProducts.get(storeId) || [];
    if (search) {
      const q = search.toLowerCase();
      return cached.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return cached;
  }

  async getProductById(productId: string) {
    VendorProductService.loadFromFile();
    try {
      const product = await this.productRepo.findById(productId);
      if (product) return product;
    } catch {
      // fallback
    }

    for (const list of VendorProductService.memoryProducts.values()) {
      const found = list.find((p: any) => p.id === productId);
      if (found) return found;
    }

    throw new NotFoundError(`Product with id '${productId}' not found`);
  }

  async createProduct(input: CreateVendorProductInput) {
    VendorProductService.loadFromFile();
    let created: any = null;

    try {
      created = await this.productRepo.create(input);
      logger.info(`Vendor product '${created.name}' created in PostgreSQL`);
    } catch (e) {
      logger.warn(`Prisma create vendor product fallback: ${(e as any)?.message || e}`);
      const pid = `prod_${Date.now()}`;
      created = {
        id: pid,
        storeId: input.storeId,
        categoryId: input.categoryId,
        name: input.name,
        brand: input.brand,
        description: input.description || '',
        sellingPrice: input.sellingPrice,
        originalPrice: input.originalPrice,
        discountPercent: input.discountPercent ??
          (input.originalPrice > input.sellingPrice
            ? Math.round(((input.originalPrice - input.sellingPrice) / input.originalPrice) * 100)
            : 0),
        imageUrl: input.imageUrl,
        galleryUrls: input.galleryUrls || [],
        isExpressDelivery: input.isExpressDelivery ?? true,
        deliveryEta: input.deliveryEta || '25 mins',
        isActive: true,
        variants: input.variants.map((v, idx) => ({
          id: `var_${pid}_${idx}`,
          productId: pid,
          size: v.size,
          color: v.color,
          stockQuantity: v.stockQuantity,
          sku: v.sku || `SKU-${pid}-${v.size}-${v.color}`,
          isActive: true,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (created) {
      const existing = VendorProductService.memoryProducts.get(input.storeId) || [];
      VendorProductService.memoryProducts.set(input.storeId, [created, ...existing]);
      VendorProductService.saveToFile();
    }

    return created;
  }

  async updateProduct(productId: string, input: UpdateVendorProductInput) {
    VendorProductService.loadFromFile();
    let updated: any = null;
    try {
      updated = await this.productRepo.update(productId, input);
    } catch {
      for (const [storeId, list] of VendorProductService.memoryProducts.entries()) {
        const idx = list.findIndex((p: any) => p.id === productId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...input, updatedAt: new Date().toISOString() };
          VendorProductService.memoryProducts.set(storeId, list);
          VendorProductService.saveToFile();
          return list[idx];
        }
      }
    }
    return updated;
  }

  async addVariant(productId: string, input: CreateProductVariantInput) {
    let created: any = null;
    try {
      created = await this.productRepo.addVariant(productId, input);
    } catch {
      created = {
        id: `var_${Date.now()}`,
        productId,
        ...input,
        isActive: true,
      };
    }

    for (const [storeId, list] of VendorProductService.memoryProducts.entries()) {
      const product = list.find((p: any) => p.id === productId);
      if (product) {
        product.variants = [...(product.variants || []), created];
        VendorProductService.memoryProducts.set(storeId, list);
        VendorProductService.saveToFile();
        break;
      }
    }

    return created;
  }

  async updateVariantStock(productId: string, variantId: string, stockQuantity: number) {
    try {
      await this.productRepo.updateVariantStock(variantId, stockQuantity);
    } catch {
      // fallback
    }

    for (const [storeId, list] of VendorProductService.memoryProducts.entries()) {
      const product = list.find((p: any) => p.id === productId);
      if (product && product.variants) {
        const variant = product.variants.find((v: any) => v.id === variantId);
        if (variant) {
          variant.stockQuantity = stockQuantity;
          VendorProductService.memoryProducts.set(storeId, list);
          VendorProductService.saveToFile();
          return variant;
        }
      }
    }

    return { id: variantId, productId, stockQuantity };
  }

  async deleteProduct(productId: string) {
    try {
      await this.productRepo.delete(productId);
    } catch {
      // fallback
    }

    for (const [storeId, list] of VendorProductService.memoryProducts.entries()) {
      const idx = list.findIndex((p: any) => p.id === productId);
      if (idx >= 0) {
        list[idx].isActive = false;
        VendorProductService.memoryProducts.set(storeId, list);
        VendorProductService.saveToFile();
        break;
      }
    }

    return { success: true, productId, message: 'Product deactivated successfully' };
  }
}
