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
        name: 'Style Studio',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
        distance: '0.8 km',
        estimatedDeliveryTime: '20-25 min',
        rating: 4.8,
        productCount: 142,
        isOpen: true,
        categories: ['Men', 'Women', 'Festive', 'Denim'],
      },
      {
        id: 's2',
        name: 'Fashion Hub',
        imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
        distance: '1.4 km',
        estimatedDeliveryTime: '25-30 min',
        rating: 4.6,
        productCount: 98,
        isOpen: true,
        categories: ['Ethnic', 'Casual', 'Accessories'],
      },
      {
        id: 's3',
        name: 'Zara Trends Boutique',
        imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
        distance: '2.1 km',
        estimatedDeliveryTime: '28-35 min',
        rating: 4.9,
        productCount: 210,
        isOpen: true,
        categories: ['Premium', 'Western', 'Footwear'],
      },
    ];
  }

  async getNearbyStores(query: NearbyStoresQueryInput): Promise<NearbyShopModel[]> {
    try {
      const stores = await this.storeRepo.findAllActive();

      if (stores.length === 0) {
        return this.fallbackStores();
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
        };
      });
    } catch {
      return this.fallbackStores();
    }
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
