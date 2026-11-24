import { StoreRepository } from './store.repository';
import { NearbyStoresQueryInput } from './store.validator';
import { NotFoundError } from '../../common/errors/app-error';

export interface NearbyShopModel {
  id: string;
  name: string;
  imageUrl: string;
  distance: string; // e.g. "0.5 km"
  estimatedDeliveryTime: string; // e.g. "20-30 min"
  rating: number;
  productCount: number;
  isOpen: boolean;
  categories: string[];
  isBrandStore: boolean;
  brandName?: string;
  tag?: string;
  offerText?: string;
}

export class StoreService {
  constructor(private readonly storeRepo: StoreRepository = new StoreRepository()) {}

  // Haversine distance in km
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  private fallbackStores(): NearbyShopModel[] {
    return [
      {
        id: 's1',
        name: 'StyleHub',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
        distance: '1.2 km',
        estimatedDeliveryTime: '20-30 min',
        rating: 4.5,
        productCount: 1420,
        isOpen: true,
        categories: ['Men', 'Women', 'Festive', 'Denim'],
        isBrandStore: false,
        tag: 'EXCLUSIVE BOUTIQUE',
        offerText: 'Up to 50% OFF',
      },
      {
        id: 's2',
        name: 'UrbanWear',
        imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
        distance: '1.8 km',
        estimatedDeliveryTime: '25-30 min',
        rating: 4.4,
        productCount: 856,
        isOpen: true,
        categories: ['Ethnic', 'Casual', 'Accessories'],
        isBrandStore: false,
        offerText: 'Up to 40% OFF',
      },
      {
        id: 's3',
        name: 'The Cloth Co.',
        imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
        distance: '2.4 km',
        estimatedDeliveryTime: '28-35 min',
        rating: 4.7,
        productCount: 620,
        isOpen: true,
        categories: ['Western', 'Premium', 'Streetwear'],
        isBrandStore: false,
        offerText: 'Flat 30% OFF',
      },
      {
        id: 'brand_nike',
        name: 'Nike Flagship Outlet',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        distance: '1.5 km',
        estimatedDeliveryTime: '25-30 min',
        rating: 4.9,
        productCount: 420,
        isOpen: true,
        categories: ['Sportswear', 'Sneakers', 'Running'],
        isBrandStore: true,
        brandName: 'Nike',
        tag: 'VERIFIED OUTLET • 30 MIN',
        offerText: 'UP TO 40% OFF',
      },
      {
        id: 'brand_adidas',
        name: 'adidas Originals Store',
        imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f',
        distance: '1.9 km',
        estimatedDeliveryTime: '20-25 min',
        rating: 4.8,
        productCount: 380,
        isOpen: true,
        categories: ['Originals', 'Footwear', 'Tracksuits'],
        isBrandStore: true,
        brandName: 'adidas',
        tag: 'ORIGINALS • 25 MIN',
        offerText: 'FLAT 35% OFF',
      },
      {
        id: 'brand_zara',
        name: 'Zara Studio',
        imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
        distance: '2.2 km',
        estimatedDeliveryTime: '25-30 min',
        rating: 4.9,
        productCount: 510,
        isOpen: true,
        categories: ['Western', 'Dresses', 'Suits'],
        isBrandStore: true,
        brandName: 'Zara',
        tag: 'STUDIO COLLECTION • 25 MIN',
        offerText: 'UP TO 30% OFF',
      },
      {
        id: 'brand_levis',
        name: "Levi's 501 Original Store",
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0',
        distance: '2.0 km',
        estimatedDeliveryTime: '20-25 min',
        rating: 4.8,
        productCount: 290,
        isOpen: true,
        categories: ['Denim', 'Jackets', 'Jeans'],
        isBrandStore: true,
        brandName: "Levi's",
        tag: 'ORIGINAL DENIM • 25 MIN',
        offerText: 'UP TO 45% OFF',
      },
    ];
  }

  async getNearbyStores(query: NearbyStoresQueryInput): Promise<NearbyShopModel[]> {
    try {
      const isBrandFilter =
        query.type === 'brand' ? true : query.type === 'boutique' ? false : undefined;

      const stores = await this.storeRepo.findAllActive({
        isBrandStore: isBrandFilter,
        brandName: query.brandName,
      });

      if (stores.length === 0) {
        let fallbacks = this.fallbackStores();
        if (query.type === 'brand') {
          fallbacks = fallbacks.filter((s) => s.isBrandStore);
        } else if (query.type === 'boutique') {
          fallbacks = fallbacks.filter((s) => !s.isBrandStore);
        }
        if (query.brandName) {
          fallbacks = fallbacks.filter(
            (s) => s.brandName?.toLowerCase() === query.brandName?.toLowerCase()
          );
        }
        return fallbacks;
      }

      return stores.map((s) => {
        const distKm = this.calculateDistance(query.lat, query.lng, s.latitude, s.longitude);
        return {
          id: s.id,
          name: s.name,
          imageUrl: s.bannerUrl,
          distance: `${distKm} km`,
          estimatedDeliveryTime: s.estimatedDeliveryTime,
          rating: s.rating,
          productCount: s.reviewCount,
          isOpen: s.isOpen,
          categories: ['Men', 'Women', 'Casual', 'Ethnic'],
          isBrandStore: s.isBrandStore,
          brandName: s.brandName || undefined,
          tag: s.isBrandStore ? 'VERIFIED OUTLET • 30 MIN' : 'LOCAL BOUTIQUE',
        };
      });
    } catch {
      let fallbacks = this.fallbackStores();
      if (query.type === 'brand') {
        fallbacks = fallbacks.filter((s) => s.isBrandStore);
      } else if (query.type === 'boutique') {
        fallbacks = fallbacks.filter((s) => !s.isBrandStore);
      }
      return fallbacks;
    }
  }

  async getBrandStores(lat = 28.5584, lng = 77.2023): Promise<NearbyShopModel[]> {
    return this.getNearbyStores({
      lat,
      lng,
      radius: 12.0,
      type: 'brand',
    });
  }

  async getStoreById(storeId: string) {
    try {
      const store = await this.storeRepo.findById(storeId);
      if (!store) {
        const fallback = this.fallbackStores().find((s) => s.id === storeId);
        if (!fallback) throw new NotFoundError('Store not found');
        return fallback;
      }
      return store;
    } catch {
      const fallback = this.fallbackStores().find((s) => s.id === storeId);
      if (!fallback) throw new NotFoundError('Store not found');
      return fallback;
    }
  }
}
