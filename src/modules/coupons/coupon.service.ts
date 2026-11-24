import { CouponRepository } from './coupon.repository';
import { BadRequestError } from '../../common/errors/app-error';

export interface CouponClientModel {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
}

export class CouponService {
  constructor(private readonly couponRepo: CouponRepository = new CouponRepository()) {}

  private fallbackCoupons(): CouponClientModel[] {
    return [
      {
        code: 'FESTIVE60',
        description: '20% OFF up to ₹300 on festive clothing',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 0,
        maxDiscount: 300,
      },
      {
        code: 'MODAR50',
        description: '15% OFF up to ₹150 on your fashion haul',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 0,
        maxDiscount: 150,
      },
      {
        code: 'FREESHIP',
        description: 'Free Delivery on any order value',
        discountType: 'FLAT',
        discountValue: 40,
        minOrderAmount: 0,
      },
      {
        code: 'EXPRESS30',
        description: 'Flat ₹100 OFF on orders above ₹500',
        discountType: 'FLAT',
        discountValue: 100,
        minOrderAmount: 500,
      },
    ];
  }

  async getAvailableCoupons(): Promise<CouponClientModel[]> {
    try {
      const dbCoupons = await this.couponRepo.findAllActive();
      if (!dbCoupons || dbCoupons.length === 0) {
        return this.fallbackCoupons();
      }

      return dbCoupons.map((c) => ({
        code: c.code,
        description: c.description,
        discountType: c.discountType as 'PERCENTAGE' | 'FLAT',
        discountValue: Number(c.discountValue),
        minOrderAmount: Number(c.minOrderAmount),
        maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : undefined,
      }));
    } catch {
      return this.fallbackCoupons();
    }
  }

  calculateDiscount(code: string, subtotal: number): { code: string; discountAmount: number } {
    const upperCode = code.trim().toUpperCase();

    if (upperCode === 'FESTIVE60') {
      const discount = Math.min(subtotal * 0.20, 300.0);
      return { code: upperCode, discountAmount: Math.round(discount) };
    }

    if (upperCode === 'MODAR50') {
      const discount = Math.min(subtotal * 0.15, 150.0);
      return { code: upperCode, discountAmount: Math.round(discount) };
    }

    if (upperCode === 'FREESHIP') {
      return { code: upperCode, discountAmount: 40.0 };
    }

    if (upperCode === 'EXPRESS30') {
      if (subtotal < 500) {
        throw new BadRequestError('Coupon EXPRESS30 requires a minimum order of ₹500');
      }
      return { code: upperCode, discountAmount: 100.0 };
    }

    throw new BadRequestError(`Invalid or expired coupon code "${code}"`);
  }
}
