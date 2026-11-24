import { StoreService } from '../stores/store.service';
import { CategoryService } from '../categories/category.service';
import { ProductService } from '../products/product.service';

export interface PromoBannerModel {
  id: string;
  title: string;
  subtitle: string;
  gradientColors: number[];
  imageUrl?: string;
  actionLabel?: string;
  tag?: string;
}

export class HomeService {
  constructor(
    private readonly storeService: StoreService = new StoreService(),
    private readonly categoryService: CategoryService = new CategoryService(),
    private readonly productService: ProductService = new ProductService()
  ) {}

  getBanners(): PromoBannerModel[] {
    return [
      {
        id: 'banner_festive_60',
        title: 'Festive Flash Delivery ⚡',
        subtitle: 'Get up to 60% OFF on Top Designer Wear in 30 Mins',
        gradientColors: [0xFF60001E, 0xFF97002F],
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
        actionLabel: 'EXPLORE NOW',
        tag: 'LIMITED TIME',
      },
      {
        id: 'banner_ethnic_glow',
        title: 'Wedding & Ethnic Edit 🥻',
        subtitle: 'Curated Silk Sarees & Sherwanis from Local Boutiques',
        gradientColors: [0xFF1A1C29, 0xFF3A3F58],
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
        actionLabel: 'VIEW COLLECTION',
        tag: 'NEW ARRIVALS',
      },
      {
        id: 'banner_denim_days',
        title: 'Casual & Denim Hub 👖',
        subtitle: 'Buy 1 Get 1 on Levis & Zara Originals Today',
        gradientColors: [0xFF0D324D, 0xFF7F5A83],
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
        actionLabel: 'SHOP DENIM',
        tag: 'TRENDING',
      },
    ];
  }

  async getHomeFeed(lat = 28.5584, lng = 77.2023) {
    const banners = this.getBanners();
    const quickCategories = await this.categoryService.getQuickCategories();
    const trendingProducts = await this.productService.getProducts({ trending: true, page: 1, limit: 10 });
    const nearbyShops = await this.storeService.getNearbyStores({ lat, lng, radius: 8 });

    return {
      deliverySla: '30-Minute Delivery',
      currentLocationName: 'Green Park, New Delhi',
      banners,
      quickCategories,
      trendingProducts,
      nearbyShops,
    };
  }
}
