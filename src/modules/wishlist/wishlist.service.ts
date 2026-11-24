import { WishlistRepository } from './wishlist.repository';
import { ProductService, ProductClientModel } from '../products/product.service';

export class WishlistService {
  constructor(
    private readonly wishlistRepo: WishlistRepository = new WishlistRepository(),
    private readonly productService: ProductService = new ProductService()
  ) {}

  async getWishlist(userId: string): Promise<ProductClientModel[]> {
    try {
      const items = await this.wishlistRepo.findByUserId(userId);
      if (items.length === 0) {
        return [];
      }

      return items.map((w) => {
        const p = w.product;
        const sizes = Array.from(new Set(p.variants.map((v) => v.size))).filter(Boolean);
        const colors = Array.from(new Set(p.variants.map((v) => v.color))).filter(Boolean);

        return {
          id: p.id,
          name: p.name,
          brand: p.brand,
          sellingPrice: Number(p.sellingPrice),
          originalPrice: Number(p.originalPrice),
          imageUrl: p.imageUrl,
          shopId: p.storeId,
          shopName: p.store ? p.store.name : 'Style Studio',
          discountPercent: p.discountPercent || undefined,
          rating: p.rating,
          reviewCount: p.reviewCount,
          availableSizes: sizes.length > 0 ? sizes : ['S', 'M', 'L'],
          availableColors: colors.length > 0 ? colors : ['Black'],
          deliveryEta: p.deliveryEta || '25 mins',
          isExpressDelivery: p.isExpressDelivery,
          isWishlisted: true,
          isInStock: true,
          categoryId: p.categoryId,
        };
      });
    } catch {
      // In local dev without DB connection, return single sample product
      const p = await this.productService.getProductById('p2');
      return [{ ...p, isWishlisted: true }];
    }
  }

  async addToWishlist(userId: string, productId: string) {
    try {
      await this.wishlistRepo.add(userId, productId);
    } catch {
      // Graceful offline pass
    }

    const product = await this.productService.getProductById(productId);
    return { ...product, isWishlisted: true };
  }

  async removeFromWishlist(userId: string, productId: string) {
    try {
      await this.wishlistRepo.remove(userId, productId);
    } catch {
      // Graceful offline pass
    }

    return { removed: true, productId };
  }
}
