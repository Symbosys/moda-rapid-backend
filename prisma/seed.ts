import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/modarapp_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🌱 Starting ModarApp Database Seed...');

  // 1. Seed Stores
  console.log('🏪 Seeding Stores...');
  const store1 = await prisma.store.upsert({
    where: { slug: 'style-studio' },
    update: {},
    create: {
      id: 's1',
      name: 'Style Studio',
      slug: 'style-studio',
      phone: '+919876543210',
      email: 'info@stylestudio.com',
      bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      addressText: 'Shop 12, Main Market, Green Park',
      city: 'New Delhi',
      pincode: '110016',
      latitude: 28.5584,
      longitude: 77.2023,
      rating: 4.8,
      reviewCount: 320,
      isOpen: true,
      isActive: true,
      estimatedDeliveryTime: '20-25 min',
      serviceRadiusKm: 8.0,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { slug: 'fashion-hub' },
    update: {},
    create: {
      id: 's2',
      name: 'Fashion Hub',
      slug: 'fashion-hub',
      phone: '+919876543211',
      email: 'info@fashionhub.com',
      bannerUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
      addressText: 'Shop 14, Main Road, Hindpiri',
      city: 'Ranchi',
      pincode: '834001',
      latitude: 23.3600,
      longitude: 85.3300,
      rating: 4.6,
      reviewCount: 190,
      isOpen: true,
      isActive: true,
      estimatedDeliveryTime: '25-30 min',
      serviceRadiusKm: 8.0,
      isBrandStore: false,
    },
  });

  const store3 = await prisma.store.upsert({
    where: { slug: 'nike-flagship' },
    update: {},
    create: {
      id: 'brand_nike',
      name: 'Nike Flagship Outlet',
      slug: 'nike-flagship',
      phone: '+919876543212',
      email: 'outlet@nike.com',
      bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      addressText: 'Select Citywalk Mall, Saket',
      city: 'New Delhi',
      pincode: '110017',
      latitude: 28.5284,
      longitude: 77.2185,
      rating: 4.9,
      reviewCount: 420,
      isOpen: true,
      isActive: true,
      estimatedDeliveryTime: '25-30 min',
      serviceRadiusKm: 10.0,
      isBrandStore: true,
      brandName: 'Nike',
    },
  });

  // 2. Seed Categories
  console.log('📁 Seeding Categories...');
  const catMen = await prisma.category.upsert({
    where: { slug: 'men-fashion' },
    update: {},
    create: {
      id: 'cat_men',
      name: 'Men',
      slug: 'men-fashion',
      icon: '👔',
      imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e',
      sortOrder: 1,
    },
  });

  const catWomen = await prisma.category.upsert({
    where: { slug: 'women-fashion' },
    update: {},
    create: {
      id: 'cat_women',
      name: 'Women',
      slug: 'women-fashion',
      icon: '👗',
      imageUrl: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3',
      sortOrder: 2,
    },
  });

  const catFootwear = await prisma.category.upsert({
    where: { slug: 'footwear' },
    update: {},
    create: {
      id: 'cat_footwear',
      name: 'Footwear',
      slug: 'footwear',
      icon: '👟',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      sortOrder: 3,
    },
  });

  // 3. Seed Products & Variants
  console.log('👕 Seeding Products & Variants...');
  const p1 = await prisma.product.upsert({
    where: { id: 'p1' },
    update: {},
    create: {
      id: 'p1',
      storeId: store1.id,
      categoryId: catMen.id,
      name: 'Slim Fit Cotton Casual Shirt',
      brand: 'Roadster',
      sellingPrice: 899.00,
      originalPrice: 1599.00,
      discountPercent: 44,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
      deliveryEta: '20 mins',
      isExpressDelivery: true,
      rating: 4.8,
      reviewCount: 320,
    },
  });

  await prisma.productVariant.upsert({
    where: { productId_size_color: { productId: p1.id, size: 'M', color: 'Navy Blue' } },
    update: {},
    create: {
      productId: p1.id,
      size: 'M',
      color: 'Navy Blue',
      stockQuantity: 25,
      sku: 'ROADSTER-SHIRT-NAVY-M',
    },
  });

  await prisma.productVariant.upsert({
    where: { productId_size_color: { productId: p1.id, size: 'L', color: 'Navy Blue' } },
    update: {},
    create: {
      productId: p1.id,
      size: 'L',
      color: 'Navy Blue',
      stockQuantity: 18,
      sku: 'ROADSTER-SHIRT-NAVY-L',
    },
  });

  const p2 = await prisma.product.upsert({
    where: { id: 'p2' },
    update: {},
    create: {
      id: 'p2',
      storeId: store1.id,
      categoryId: catWomen.id,
      name: 'Floral Print A-Line Festive Kurti',
      brand: 'Biba',
      sellingPrice: 1299.00,
      originalPrice: 2499.00,
      discountPercent: 48,
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
      deliveryEta: '25 mins',
      isExpressDelivery: true,
      rating: 4.9,
      reviewCount: 410,
    },
  });

  await prisma.productVariant.upsert({
    where: { productId_size_color: { productId: p2.id, size: 'M', color: 'Pink' } },
    update: {},
    create: {
      productId: p2.id,
      size: 'M',
      color: 'Pink',
      stockQuantity: 15,
      sku: 'BIBA-KURTI-PINK-M',
    },
  });

  // 4. Seed Delivery Partners
  console.log('🛵 Seeding Delivery Partners...');
  await prisma.deliveryPartner.upsert({
    where: { id: 'dp_1' },
    update: {},
    create: {
      id: 'dp_1',
      name: 'Rahul Sharma',
      phone: '+919811122334',
      rating: 4.9,
      vehicleNumber: 'DL 03 AB 4591',
      avatar: '🛵',
      latitude: 28.5610,
      longitude: 77.2045,
      isOnline: true,
      isAvailable: true,
    },
  });

  // 5. Seed Coupons
  console.log('🏷️ Seeding Coupons...');
  const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await prisma.coupon.upsert({
    where: { code: 'FESTIVE60' },
    update: {},
    create: {
      code: 'FESTIVE60',
      description: '20% OFF up to ₹300 on festive clothing',
      discountType: 'PERCENTAGE',
      discountValue: 20.00,
      maxDiscount: 300.00,
      expiresAt: expiryDate,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'MODAR50' },
    update: {},
    create: {
      code: 'MODAR50',
      description: '15% OFF up to ₹150 on your fashion haul',
      discountType: 'PERCENTAGE',
      discountValue: 15.00,
      maxDiscount: 150.00,
      expiresAt: expiryDate,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FREESHIP' },
    update: {},
    create: {
      code: 'FREESHIP',
      description: 'Free Delivery on any order value',
      discountType: 'FLAT',
      discountValue: 40.00,
      expiresAt: expiryDate,
    },
  });

  // 6. Seed Support FAQs
  console.log('❓ Seeding Support FAQs...');
  await prisma.supportFaq.deleteMany({});
  await prisma.supportFaq.createMany({
    data: [
      {
        category: 'Delivery',
        question: 'How does 30-minute delivery work?',
        answer: 'We partner with nearby local stores within 5-8 km. Orders are packed instantly and dispatched with hyper-local delivery partners.',
        sortOrder: 1,
      },
      {
        category: 'Returns',
        question: 'Can I return an item if it does not fit?',
        answer: 'Yes! We offer a 24-hour instant doorstep return and exchange policy.',
        sortOrder: 2,
      },
    ],
  });

  console.log('✅ ModarApp Database Seed Completed Successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
