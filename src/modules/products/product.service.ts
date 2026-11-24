import { ProductRepository, ProductWithDetails } from './product.repository';
import { ProductQueryInput, ProductSearchQueryInput } from './product.validator';
import { NotFoundError } from '../../common/errors/app-error';

export interface ProductClientModel {
  id: string;
  name: string;
  brand: string;
  sellingPrice: number;
  originalPrice: number;
  imageUrl: string;
  shopId: string;
  shopName: string;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  availableSizes: string[];
  availableColors: string[];
  deliveryEta?: string;
  isExpressDelivery: boolean;
  isWishlisted: boolean;
  isInStock: boolean;
  categoryId?: string;
  description?: string;
}

export class ProductService {
  constructor(private readonly productRepo: ProductRepository = new ProductRepository()) {}

  private mapToClientModel(p: ProductWithDetails, isWishlisted = false): ProductClientModel {
    const sizes = Array.from(new Set(p.variants.map((v) => v.size))).filter(Boolean);
    const colors = Array.from(new Set(p.variants.map((v) => v.color))).filter(Boolean);
    const totalStock = p.variants.reduce((acc, curr) => acc + curr.stockQuantity, 0);

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
      availableSizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      availableColors: colors.length > 0 ? colors : ['Black', 'Navy', 'White'],
      deliveryEta: p.deliveryEta || '25 mins',
      isExpressDelivery: p.isExpressDelivery,
      isWishlisted,
      isInStock: totalStock > 0 || p.variants.length === 0,
      categoryId: p.categoryId,
      description: p.description || undefined,
    };
  }

  private fallbackProducts(): ProductClientModel[] {
    return [
      {
        id: 'p1',
        name: 'Slim Fit Cotton Casual Shirt',
        brand: 'Roadster',
        sellingPrice: 899,
        originalPrice: 1599,
        discountPercent: 44,
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
        shopId: 's1',
        shopName: 'Style Studio',
        rating: 4.8,
        reviewCount: 320,
        availableSizes: ['S', 'M', 'L', 'XL'],
        availableColors: ['Navy Blue', 'Olive Green', 'White'],
        deliveryEta: '20 mins',
        isExpressDelivery: true,
        isWishlisted: false,
        isInStock: true,
        categoryId: 'cat_men_shirts',
      },
      {
        id: 'p2',
        name: 'Floral Print A-Line Festive Kurti',
        brand: 'Biba',
        sellingPrice: 1299,
        originalPrice: 2499,
        discountPercent: 48,
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
        shopId: 's1',
        shopName: 'Style Studio',
        rating: 4.9,
        reviewCount: 410,
        availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
        availableColors: ['Pink', 'Maroon', 'Teal'],
        deliveryEta: '25 mins',
        isExpressDelivery: true,
        isWishlisted: true,
        isInStock: true,
        categoryId: 'cat_women_kurtas',
      },
      {
        id: 'p3',
        name: 'Vintage Distressed Denim Jacket',
        brand: 'Levis',
        sellingPrice: 2499,
        originalPrice: 4299,
        discountPercent: 42,
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0',
        shopId: 's2',
        shopName: 'Fashion Hub',
        rating: 4.7,
        reviewCount: 190,
        availableSizes: ['M', 'L', 'XL'],
        availableColors: ['Washed Blue', 'Dark Indigo'],
        deliveryEta: '30 mins',
        isExpressDelivery: true,
        isWishlisted: false,
        isInStock: true,
        categoryId: 'cat_men_jackets',
      },
      {
        id: 'p4',
        name: 'Premium Leather Low-Top Sneakers',
        brand: 'Puma',
        sellingPrice: 1899,
        originalPrice: 3499,
        discountPercent: 45,
        imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
        shopId: 's2',
        shopName: 'Fashion Hub',
        rating: 4.6,
        reviewCount: 154,
        availableSizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
        availableColors: ['Triple White', 'Black Gold'],
        deliveryEta: '25 mins',
        isExpressDelivery: true,
        isWishlisted: false,
        isInStock: true,
        categoryId: 'cat_footwear',
      },
    ];
  }

  async getProducts(query: Partial<ProductQueryInput> = {}): Promise<ProductClientModel[]> {
    try {
      const where: Record<string, unknown> = {};
      if (query.categoryId) where.categoryId = query.categoryId;
      if (query.storeId) where.storeId = query.storeId;
      if (query.brand) where.brand = query.brand;

      const skip = ((query.page || 1) - 1) * (query.limit || 20);
      const dbProducts = await this.productRepo.findMany(where, skip, query.limit || 20);

      if (dbProducts.length === 0) {
        return this.fallbackProducts();
      }

      return dbProducts.map((p) => this.mapToClientModel(p));
    } catch {
      return this.fallbackProducts();
    }
  }

  async getProductById(id: string): Promise<ProductClientModel> {
    try {
      const p = await this.productRepo.findById(id);
      if (!p) {
        const fallback = this.fallbackProducts().find((item) => item.id === id);
        if (!fallback) throw new NotFoundError('Product not found');
        return fallback;
      }
      return this.mapToClientModel(p);
    } catch {
      const fallback = this.fallbackProducts().find((item) => item.id === id);
      if (!fallback) throw new NotFoundError('Product not found');
      return fallback;
    }
  }

  async getSimilarProducts(id: string): Promise<ProductClientModel[]> {
    try {
      const current = await this.getProductById(id);
      if (current.categoryId) {
        const list = await this.productRepo.findSimilar(current.categoryId, id);
        if (list.length > 0) {
          return list.map((p) => this.mapToClientModel(p));
        }
      }
      return this.fallbackProducts().filter((p) => p.id !== id);
    } catch {
      return this.fallbackProducts().filter((p) => p.id !== id);
    }
  }

  async searchProducts(query: ProductSearchQueryInput): Promise<ProductClientModel[]> {
    const all = await this.getProducts({ page: 1, limit: 50 });
    const keyword = query.q.trim().toLowerCase();

    if (!keyword) {
      return all;
    }

    return all.filter((p) => {
      const matchesName = p.name.toLowerCase().includes(keyword);
      const matchesBrand = p.brand.toLowerCase().includes(keyword);
      const matchesShop = p.shopName.toLowerCase().includes(keyword);
      return matchesName || matchesBrand || matchesShop;
    });
  }

  async getSuggestions(prefix: string): Promise<string[]> {
    const clean = prefix.trim().toLowerCase();
    const defaults = [
      'Denim Jackets',
      'Cotton Shirts',
      'Anarkali Kurti',
      'Puma Sneakers',
      'Formal Trousers',
      'Printed T-Shirts',
    ];

    if (!clean) return defaults.slice(0, 5);

    const matches = defaults.filter((d) => d.toLowerCase().includes(clean));
    return matches.length > 0 ? matches : defaults.slice(0, 4);
  }
}
