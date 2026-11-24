# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# ModarApp / StyleExpress – Hyperlocal Fashion Delivery Platform
## Monolithic Backend Architecture (User Application)

**Document Version:** 1.0  
**Status:** Approved for Implementation  
**Project:** ModarApp (StyleExpress) Monolithic Backend  
**Product Scope:** Customer / User Application  
**Target Frontend:** Flutter Mobile Application (`modarappid_app`)  
**Backend Framework:** Node.js (v20+ LTS) + Express.js + TypeScript  
**Database:** PostgreSQL 16 with PostGIS extension  
**ORM / Query Engine:** Prisma ORM & raw parameterized pg-pool for spatial queries  
**Cache & Message Queue:** Redis + BullMQ (asynchronous tasks)  
**Real-Time Layer:** Socket.io (WebSockets) for Live Order Tracking  
**Payment Gateway Integration:** Multi-Rail Payment Gateway (UPI, Cards, Net Banking, COD)  
**Security:** JWT (Access + Refresh Tokens), Helmet, CORS, Rate Limiting, Zod Validation  

---

## 1. EXECUTIVE SUMMARY & OBJECTIVES

### 1.1 Project Overview
**ModarApp (StyleExpress)** is an on-demand hyperlocal fashion delivery platform designed to deliver clothing, footwear, and accessories from nearby local retail stores directly to customers' doorsteps in approximately **30 minutes**. 

The frontend customer application is developed in **Flutter** (`c:\Symbosys\modarappid\modarappid_app`) featuring a Zomato/Blinkit-inspired ultra-fast discovery and ordering UX. This document specifies the comprehensive backend engineering requirements for building a robust, high-performance, maintainable **Monolithic Backend** in `moda-backend` using **Node.js, Express, TypeScript, and PostgreSQL**.

### 1.2 Core Objectives
1. **Unified Monolithic Architecture:** Consolidate all user-facing services (Authentication, Catalog, Stores, Geo-location, Cart, Pricing, Payments, Orders, and Tracking) into a single, cohesive, layered monolithic codebase with modular domains.
2. **100% Frontend Feature Parity:** Provide complete API contracts for all Flutter screens, Riverpod state models, and endpoints defined in `ApiConstants.dart`.
3. **Hyperlocal PostGIS Discovery:** Implement sub-10ms store discovery and serviceability checks based on user GPS coordinates and spatial indexing.
4. **Single-Store Order Rule Enforcement:** Enforce the core business invariant that an order can contain items from only one store at a time, handling store conflict resolution seamlessly.
5. **Comprehensive Multi-Rail Payment Service:** Seamlessly support:
   - **UPI:** Intent flow (GPay, PhonePe, Paytm), VPA Collect, and Dynamic QR.
   - **Debit / Credit Cards:** Visa, MasterCard, RuPay, Amex via secure 3D-Secure 2.0 payment gateway.
   - **Net Banking:** 50+ Indian commercial & public sector banks.
   - **Cash on Delivery (COD):** Dynamic risk validation, order verification, and collection tracking.
6. **Real-Time Order Lifecycle & Live Tracking:** Real-time updates via Socket.io and REST endpoints reflecting the 8-stage order milestone timeline.
7. **Production Grade Quality:** Built with TypeScript strict mode, Zod input validation, automated database migrations, connection pooling, structured logging (Winston), and transaction safety.

---

## 2. FRONTEND APP ANALYSIS & CONTRACT MAPPING

Based on in-depth analysis of `modarappid_app`, the backend directly serves the following mobile features:

### 2.1 Feature Breakdown & Screen Flow
| Screen / Module | Key Flutter Files | Key Features & Requirements |
|---|---|---|
| **Splash & Onboarding** | `splash_screen.dart`, `onboarding_screen.dart` | App version check, initial token validation, introductory carousel slides. |
| **Authentication** | `login_screen.dart`, `otp_verification_screen.dart` | Phone number input with country codes, 6-digit OTP delivery (SMS gateway), 30s resend timer, JWT generation. |
| **Location & Geo** | `location_permission_screen.dart`, `addresses_screen.dart` | GPS coordinate submission, PostGIS radius check (5-8 km), reverse geocoding to Human Address (Area, City, Pincode). |
| **Home Feed** | `home_screen.dart`, `home_promo_banner.dart`, `category_chip_widget.dart` | Promotional banners, quick categories, nearby shops with distance & ETA, trending fashion products. |
| **Categories & Search** | `categories_screen.dart`, `search_screen.dart` | Nested category hierarchy, full-text fuzzy product search, brand filters, autocomplete suggestions. |
| **Product Details** | `product_details_screen.dart` | Multi-image gallery, variant selectors (Size: S, M, L, XL; Color: Black, Blue, etc.), store details, real-time stock availability, similar products. |
| **Wishlist** | `wishlist_screen.dart`, `wishlistProvider` | Add/remove items, sync across devices, out-of-stock indicators. |
| **Cart & Single-Store Enforcement** | `cart_screen.dart`, `cartProvider` | Quantity controls, single-store validation (triggers `shopConflict` if item from another shop is added), price computation. |
| **Coupons & Discounts** | `checkout_screen.dart` (Coupon Sheet) | Validation of promo codes (`FESTIVE60`, `MODAR50`, `FREESHIP`, `EXPRESS30`), minimum order threshold check. |
| **Checkout & Payments** | `checkout_screen.dart`, `order_confirmation_screen.dart` | Delivery address selection, bill summary calculation, payment method selection (**UPI, Card, Net Banking, COD**). |
| **Orders & Tracking** | `orders_screen.dart`, `order_details_screen.dart`, `order_tracking_screen.dart` | Active and past orders, 8-step status stepper, delivery partner details (name, phone, vehicle, rating), live GPS simulation/socket stream, cancel & return flows. |
| **Profile & Support** | `profile_screen.dart`, `edit_profile_screen.dart`, `support_screen.dart` | User profile editing, FAQs, live support contact info. |

### 2.2 Business Rules & Invariants
1. **Single-Store Per Order Rule:** A user's cart and subsequent order can strictly belong to only **one shop** at any given moment. Attempting to add an item from Shop B when the cart has items from Shop A triggers a `409 Shop Conflict` response, prompting the user to either replace the cart or cancel.
2. **Dynamic Price Breakdown Formula:**
   $$\text{Subtotal} = \sum (\text{item.sellingPrice} \times \text{item.quantity})$$
   $$\text{Delivery Fee} = \begin{cases} 0 & \text{if coupon } = \text{'FREESHIP' or } \text{Subtotal} \ge 999 \\ 40 & \text{otherwise} \end{cases}$$
   $$\text{Platform Fee} = \begin{cases} 0 & \text{if cart is empty} \\ 15 & \text{otherwise} \end{cases}$$
   $$\text{Tax (GST)} = \text{round}(\text{Subtotal} \times 0.05)$$
   $$\text{Total Amount} = \max(0, \text{Subtotal} - \text{Discount} + \text{Delivery Fee} + \text{Platform Fee} + \text{Tax})$$
3. **Order Status Timeline:**
   The backend must strictly advance orders through the exact 8 milestone states recognized by `OrderStatus` in Flutter:
   - `ORDER_PLACED` (`orderPlaced`, Step 1)
   - `ORDER_ACCEPTED` (`orderAccepted`, Step 2 - Shop accepted)
   - `PREPARING_ORDER` (`preparingOrder`, Step 3 - Packing items)
   - `READY_FOR_PICKUP` (`readyForPickup`, Step 4 - Waiting for rider)
   - `PARTNER_ASSIGNED` (`partnerAssigned`, Step 5 - Rider allocated)
   - `PICKED_UP` (`pickedUp`, Step 6 - Rider collected package)
   - `OUT_FOR_DELIVERY` (`outForDelivery`, Step 7 - On the way to customer)
   - `DELIVERED` (`delivered`, Step 8 - Completed)
   - `CANCELLED` (`cancelled`, Step -1 - Aborted with reason)

---

## 3. MONOLITHIC SYSTEM ARCHITECTURE

### 3.1 Architectural Philosophy: Modular Monolith
Rather than introducing distributed microservice overhead (network hops, complex sagas, multiple deployments), the system is built as a **Modular Monolith**. All modules reside in a single codebase with clean boundaries, domain-driven isolation, and shared infrastructure.

```
                             ┌─────────────────────────────────┐
                             │       Flutter Customer App      │
                             │        (modarappid_app)         │
                             └───────────────┬─────────────────┘
                                             │ HTTPS / WSS
                                             ▼
                             ┌─────────────────────────────────┐
                             │   Nginx Reverse Proxy / SSL     │
                             └───────────────┬─────────────────┘
                                             │
               ┌─────────────────────────────┴─────────────────────────────┐
               │              EXPRESS.JS MONOLITHIC APPLICATION            │
               │                                                           │
               │  ┌─────────────────────────────────────────────────────┐  │
               │  │ Global Middlewares: Helmet, CORS, RateLimiter, JWT  │  │
               │  └──────────────────────────┬──────────────────────────┘  │
               │                             │                             │
               │  ┌──────────────────────────┴──────────────────────────┐  │
               │  │                     API ROUTER                      │  │
               │  └──────┬──────────┬──────────┬──────────┬──────────┬──┘  │
               │         │          │          │          │          │     │
               │     ┌───▼──┐   ┌───▼──┐   ┌───▼──┐   ┌───▼──┐   ┌───▼──┐  │
               │     │ Auth │   │Stores│   │Products  │ Cart │   │Order │  │
               │     │Module│   │Module│   │& Catalog │Module│   │Module│  │
               │     └───┬──┘   └───┬──┘   └───┬──┘   └───┬──┘   └───┬──┘  │
               │         │          │          │          │          │     │
               │  ┌──────┴──────────┴──────────┴──────────┴──────────┴──┐  │
               │  │               PAYMENT METHOD SERVICE                │  │
               │  │   [UPI]     [Cards]     [Net Banking]     [COD]     │  │
               │  └──────────────────────────┬──────────────────────────┘  │
               │                             │                             │
               │  ┌──────────────────────────┴──────────────────────────┐  │
               │  │           Socket.io Live Tracking Gateway           │  │
               │  └──────────────────────────┬──────────────────────────┘  │
               │                             │                             │
               │  ┌──────────────────────────┴──────────────────────────┐  │
               │  │        Prisma ORM & PostgreSQL Connection Pool      │  │
               │  └──────────────────────────┬──────────────────────────┘  │
               └─────────────────────────────┼─────────────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
       ┌──────────────────────────────┐              ┌──────────────────────────────┐
       │   PostgreSQL 16 + PostGIS    │              │       Redis 7 (In-Memory)    │
       │   - Relational Tables        │              │   - OTP & Session Cache      │
       │   - Spatial Store Discovery  │              │   - Rate Limit Counters      │
       │   - ACID Transactions        │              │   - BullMQ Async Dispatch    │
       └──────────────────────────────┘              └──────────────────────────────┘
```

### 3.2 Codebase Directory Structure (`moda-backend`)
```
moda-backend/
├── src/
│   ├── app.ts                  # Express application setup & middleware assembly
│   ├── server.ts               # HTTP & Socket.io server bootstrap
│   ├── config/                 # Environment variables, database & redis configs
│   │   ├── env.config.ts
│   │   ├── database.ts
│   │   └── redis.ts
│   ├── common/                 # Reusable utilities, errors, and constants
│   │   ├── constants/
│   │   │   ├── api-status.ts
│   │   │   └── order-status.ts
│   │   ├── errors/
│   │   │   ├── app-error.ts
│   │   │   └── error-handler.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── rate-limiter.middleware.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       ├── response-formatter.ts
│   │       └── geo-distance.ts
│   ├── modules/                # Domain-Driven Modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validator.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.routes.ts
│   │   ├── addresses/
│   │   │   ├── address.controller.ts
│   │   │   ├── address.service.ts
│   │   │   └── address.routes.ts
│   │   ├── stores/
│   │   │   ├── store.controller.ts
│   │   │   ├── store.service.ts
│   │   │   └── store.routes.ts
│   │   ├── categories/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.routes.ts
│   │   ├── products/
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.routes.ts
│   │   ├── wishlist/
│   │   │   ├── wishlist.controller.ts
│   │   │   ├── wishlist.service.ts
│   │   │   └── wishlist.routes.ts
│   │   ├── cart/
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   └── cart.routes.ts
│   │   ├── coupons/
│   │   │   ├── coupon.controller.ts
│   │   │   ├── coupon.service.ts
│   │   │   └── coupon.routes.ts
│   │   ├── checkout/
│   │   │   ├── checkout.controller.ts
│   │   │   ├── checkout.service.ts
│   │   │   └── checkout.routes.ts
│   │   ├── payments/           # Comprehensive Payment Service
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── providers/
│   │   │   │   ├── upi.provider.ts
│   │   │   │   ├── card.provider.ts
│   │   │   │   ├── netbanking.provider.ts
│   │   │   │   └── cod.provider.ts
│   │   │   └── webhook.controller.ts
│   │   ├── orders/
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts
│   │   │   └── order.routes.ts
│   │   ├── tracking/           # Real-Time Location & Socket.io
│   │   │   ├── tracking.controller.ts
│   │   │   ├── tracking.service.ts
│   │   │   ├── tracking.gateway.ts
│   │   │   └── tracking.routes.ts
│   │   ├── notifications/
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.service.ts
│   │   │   └── notification.routes.ts
│   │   └── support/
│   │       ├── support.controller.ts
│   │       ├── support.service.ts
│   │       └── support.routes.ts
│   └── jobs/                   # BullMQ Queues (Order Expiry, Dispatch, Notification)
│       ├── order-timeout.worker.ts
│       └── push-notification.worker.ts
├── prisma/
│   ├── schema.prisma           # Complete PostgreSQL Schema Definition
│   ├── migrations/             # Timestamped SQL Migrations
│   └── seed.ts                 # Database Seed with Ranchi/Delhi Stores & Products
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 4. DATABASE SCHEMA DESIGN (POSTGRESQL & PRISMA)

The PostgreSQL database leverages relational integrity, foreign keys with cascade policies, check constraints, and PostGIS geometries (`Point, 4326`) for geographical radius queries.

### 4.1 Prisma Schema Specification

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum Role {
  CUSTOMER
  ADMIN
}

enum AddressTag {
  HOME
  WORK
  OTHER
}

enum PaymentMethodType {
  UPI
  CARD
  NET_BANKING
  COD
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  REFUNDED
}

enum OrderStatusEnum {
  ORDER_PLACED
  ORDER_ACCEPTED
  PREPARING_ORDER
  READY_FOR_PICKUP
  PARTNER_ASSIGNED
  PICKED_UP
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum NotificationType {
  ORDER
  OFFER
  SYSTEM
}

model User {
  id            String         @id @default(uuid())
  phoneNumber   String         @unique @db.VarChar(15)
  fullName      String?        @db.VarChar(100)
  email         String?        @unique @db.VarChar(150)
  avatarUrl     String?        @db.VarChar(500)
  role          Role           @default(CUSTOMER)
  isActive      Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  addresses     Address[]
  cart          Cart?
  wishlists     Wishlist[]
  orders        Order[]
  notifications Notification[]
  otpSessions   OtpSession[]

  @@index([phoneNumber])
}

model OtpSession {
  id          String   @id @default(uuid())
  phoneNumber String   @db.VarChar(15)
  otpHash     String   @db.VarChar(255)
  attempts    Int      @default(0)
  isVerified  Boolean  @default(false)
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([phoneNumber, isVerified])
}

model Address {
  id           String     @id @default(uuid())
  userId       String
  tag          AddressTag @default(HOME)
  houseNo      String     @db.VarChar(100)
  area         String     @db.VarChar(255)
  landmark     String?    @db.VarChar(255)
  city         String     @db.VarChar(100)
  pincode      String     @db.VarChar(10)
  contactPhone String     @db.VarChar(15)
  latitude     Float
  longitude    Float
  isDefault    Boolean    @default(false)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders       Order[]

  @@index([userId])
}

model Store {
  id               String   @id @default(uuid())
  name             String   @db.VarChar(150)
  slug             String   @unique @db.VarChar(150)
  phone            String   @db.VarChar(15)
  email            String?  @db.VarChar(150)
  bannerUrl        String   @db.VarChar(500)
  logoUrl          String?  @db.VarChar(500)
  addressText      String   @db.VarChar(500)
  city             String   @db.VarChar(100)
  pincode          String   @db.VarChar(10)
  latitude         Float
  longitude        Float
  rating           Float    @default(4.5)
  reviewCount      Int      @default(0)
  isOpen           Boolean  @default(true)
  isActive         Boolean  @default(true)
  estimatedDeliveryTime String @default("20-30 min")
  serviceRadiusKm  Float    @default(7.0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  products         Product[]
  orders           Order[]
  carts            Cart[]

  @@index([latitude, longitude])
  @@index([isActive, isOpen])
}

model Category {
  id           String     @id @default(uuid())
  name         String     @db.VarChar(100)
  slug         String     @unique @db.VarChar(100)
  icon         String     @db.VarChar(100)
  imageUrl     String?    @db.VarChar(500)
  parentId     String?
  sortOrder    Int        @default(0)
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  parent       Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children     Category[] @relation("CategoryHierarchy")
  products     Product[]

  @@index([parentId])
}

model Product {
  id                String           @id @default(uuid())
  storeId           String
  categoryId        String
  name              String           @db.VarChar(200)
  brand             String           @db.VarChar(100)
  description       String?          @db.Text
  sellingPrice      Decimal          @db.Decimal(10, 2)
  originalPrice     Decimal          @db.Decimal(10, 2)
  discountPercent   Int?
  imageUrl          String           @db.VarChar(500)
  galleryUrls       String[]         @default([])
  deliveryEta       String?          @default("25 mins")
  isExpressDelivery Boolean          @default(true)
  isActive          Boolean          @default(true)
  rating            Float            @default(4.5)
  reviewCount       Int              @default(0)
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  store             Store            @relation(fields: [storeId], references: [id], onDelete: Cascade)
  category          Category         @relation(fields: [categoryId], references: [id])
  variants          ProductVariant[]
  wishlists         Wishlist[]
  cartItems         CartItem[]
  orderItems        OrderItem[]

  @@index([storeId])
  @@index([categoryId])
  @@index([brand])
  @@index([isActive])
}

model ProductVariant {
  id            String      @id @default(uuid())
  productId     String
  size          String      @db.VarChar(20)  // S, M, L, XL, XXL
  color         String      @db.VarChar(50)  // Black, Blue, Pink
  stockQuantity Int         @default(0)
  sku           String?     @unique @db.VarChar(100)
  isActive      Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  product       Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems     CartItem[]
  orderItems    OrderItem[]

  @@unique([productId, size, color])
  @@index([productId])
}

model Wishlist {
  id        String   @id @default(uuid())
  userId    String
  productId String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@index([userId])
}

model Cart {
  id            String     @id @default(uuid())
  userId        String     @unique
  storeId       String?
  appliedCoupon String?    @db.VarChar(50)
  couponDiscount Decimal   @default(0.0) @db.Decimal(10, 2)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  store         Store?     @relation(fields: [storeId], references: [id], onDelete: SetNull)
  items         CartItem[]

  @@index([userId])
}

model CartItem {
  id         String         @id @default(uuid())
  cartId     String
  productId  String
  variantId  String
  quantity   Int            @default(1)
  unitPrice  Decimal        @db.Decimal(10, 2)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  cart       Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product    Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant    ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@unique([cartId, variantId])
}

model Coupon {
  id             String    @id @default(uuid())
  code           String    @unique @db.VarChar(50)
  description    String    @db.VarChar(255)
  discountType   String    @db.VarChar(20) // PERCENTAGE | FLAT
  discountValue  Decimal   @db.Decimal(10, 2)
  minOrderAmount Decimal   @default(0.0) @db.Decimal(10, 2)
  maxDiscount    Decimal?  @db.Decimal(10, 2)
  startsAt       DateTime  @default(now())
  expiresAt      DateTime
  usageLimit     Int?
  usedCount      Int       @default(0)
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())

  @@index([code, isActive])
}

model Order {
  id                       String          @id // e.g. MODAR-89241
  userId                   String
  storeId                  String
  addressId                String
  subtotal                 Decimal         @db.Decimal(10, 2)
  deliveryFee              Decimal         @db.Decimal(10, 2)
  platformFee              Decimal         @default(15.00) @db.Decimal(10, 2)
  tax                      Decimal         @db.Decimal(10, 2)
  discount                 Decimal         @default(0.00) @db.Decimal(10, 2)
  totalAmount              Decimal         @db.Decimal(10, 2)
  paymentMethod            PaymentMethodType
  isPaid                   Boolean         @default(false)
  orderStatus              OrderStatusEnum @default(ORDER_PLACED)
  estimatedDeliveryMinutes Int             @default(25)
  cancellationReason       String?         @db.VarChar(255)
  returnStatus             String?         @db.VarChar(255)
  placedAt                 DateTime        @default(now())
  updatedAt                DateTime        @updatedAt

  user                     User            @relation(fields: [userId], references: [id])
  store                    Store           @relation(fields: [storeId], references: [id])
  deliveryAddress          Address         @relation(fields: [addressId], references: [id])
  items                    OrderItem[]
  payments                 Payment[]
  assignment               OrderAssignment?

  @@index([userId])
  @@index([storeId])
  @@index([orderStatus])
}

model OrderItem {
  id          String         @id @default(uuid())
  orderId     String
  productId   String
  variantId   String
  productName String         @db.VarChar(200)
  brand       String         @db.VarChar(100)
  size        String         @db.VarChar(20)
  color       String         @db.VarChar(50)
  quantity    Int
  unitPrice   Decimal        @db.Decimal(10, 2)
  totalPrice  Decimal        @db.Decimal(10, 2)
  imageUrl    String         @db.VarChar(500)

  order       Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product        @relation(fields: [productId], references: [id])
  variant     ProductVariant @relation(fields: [variantId], references: [id])

  @@index([orderId])
}

model DeliveryPartner {
  id            String            @id @default(uuid())
  name          String            @db.VarChar(100)
  phone         String            @db.VarChar(15)
  rating        Float             @default(4.8)
  vehicleNumber String            @db.VarChar(30)
  avatar        String            @default("🛵") @db.VarChar(50)
  latitude      Float?
  longitude     Float?
  isOnline      Boolean           @default(true)
  isAvailable   Boolean           @default(true)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  assignments   OrderAssignment[]

  @@index([isOnline, isAvailable])
}

model OrderAssignment {
  id                String          @id @default(uuid())
  orderId           String          @unique
  deliveryPartnerId String
  status            String          @default("ASSIGNED")
  assignedAt        DateTime        @default(now())
  pickedUpAt        DateTime?
  deliveredAt       DateTime?

  order             Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  partner           DeliveryPartner @relation(fields: [deliveryPartnerId], references: [id])

  @@index([deliveryPartnerId])
}

model Payment {
  id                   String            @id @default(uuid())
  orderId              String
  paymentMethod        PaymentMethodType
  gatewayProvider      String            @default("RAZORPAY") // RAZORPAY | CASHFREE | INTERNAL_COD
  gatewayOrderId       String?           @db.VarChar(100)
  gatewayPaymentId     String?           @db.VarChar(100)
  amount               Decimal           @db.Decimal(10, 2)
  currency             String            @default("INR") @db.VarChar(10)
  status               PaymentStatus     @default(PENDING)
  upiVpa               String?           @db.VarChar(100)
  cardNetwork          String?           @db.VarChar(50)  // VISA, MASTERCARD, RUPAY
  cardLast4            String?           @db.VarChar(4)
  bankName             String?           @db.VarChar(100) // HDFC, SBI, ICICI
  codCollectionStatus  String?           @default("PENDING") // PENDING | COLLECTED | DEPOSITED
  rawGatewayResponse   Json?
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt

  order                Order             @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([gatewayOrderId])
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  title     String           @db.VarChar(150)
  message   String           @db.Text
  type      NotificationType @default(ORDER)
  orderId   String?          @db.VarChar(100)
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
}

model SupportFaq {
  id        String   @id @default(uuid())
  category  String   @db.VarChar(100)
  question  String   @db.VarChar(300)
  answer    String   @db.Text
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
}
```

---

## 5. PAYMENT METHOD SERVICE SPECIFICATION

The application checkout screen requires 4 interactive payment methods:
1. **Pay via UPI** (Google Pay, PhonePe, Paytm, BHIM)
2. **Debit / Credit Card** (Visa, Mastercard, RuPay, Amex)
3. **Net Banking** (Major Indian retail & corporate banks)
4. **Cash on Delivery (COD)** (Pay upon delivery)

```
                              ┌────────────────────────────────────────┐
                              │       Checkout Payment Selection       │
                              │       (UPI, Card, NetBanking, COD)     │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │ POST /v1/checkout/validate             │
                              │ - Validates Stock & Price Calculation  │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │ POST /v1/orders/create                 │
                              │ - Creates Order (Status: ORDER_PLACED) │
                              │ - Atomic Stock Reservation             │
                              └───────────────────┬────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 │                                                                 │
                 ▼ (Online: UPI, Card, NetBanking)                                 ▼ (COD)
  ┌──────────────────────────────────────────────┐              ┌──────────────────────────────────────────────┐
  │ POST /v1/payments/create-intent              │              │ POST /v1/payments/confirm-cod                │
  │ - Generates Razorpay/Cashfree Order Session  │              │ - Risk Check: Order <= ₹5,000                │
  │ - Returns SDK token, UPI intent links / QR   │              │ - Fraud score check                          │
  └──────────────────────┬───────────────────────┘              │ - Marks Payment: PENDING (isPaid = false)    │
                         │                                      └──────────────────────┬───────────────────────┘
                         ▼                                                             │
  ┌──────────────────────────────────────────────┐                                     │
  │ Flutter Payment Sheet Execution              │                                     │
  │ - Native UPI App launch or 3DS Webview       │                                     │
  └──────────────────────┬───────────────────────┘                                     │
                         │                                                             │
                         ▼                                                             │
  ┌──────────────────────────────────────────────┐                                     │
  │ Webhook: POST /v1/payments/webhook           │                                     │
  │ - Validates HMAC SHA256 Signature            │                                     │
  │ - Updates Payment: SUCCESS                   │                                     │
  │ - Updates Order: isPaid = true               │                                     │
  └──────────────────────┬───────────────────────┘                                     │
                         │                                                             │
                         └──────────────────────┬──────────────────────────────────────┘
                                                │
                                                ▼
                              ┌────────────────────────────────────────┐
                              │ Socket.io & FCM Notification:          │
                              │ - Order Confirmed                      │
                              │ - Store alerted for packing            │
                              └────────────────────────────────────────┘
```

### 5.1 UPI Payment Implementation
- **Supported Channels:**
  - **UPI Intent:** Automatically launches installed UPI apps on Android/iOS (Google Pay: `tez://upi/pay`, PhonePe: `phonepe://pay`, Paytm: `paytmmp://pay`).
  - **UPI Collect:** Customer submits VPA (e.g. `9876543210@ybl`); backend triggers payment request push notification to their UPI app with a 5-minute timeout.
  - **Dynamic UPI QR:** Generates standard Bharat-QR base64 image containing `upi://pay?pa=...&pn=ModarApp&tr=...&am=...&cu=INR`.
- **Backend Flow:**
  - `POST /v1/payments/upi/initiate`: Creates gateway transaction with payment method `upi`.
  - Polling endpoint `GET /v1/payments/:paymentId/status` or real-time WebSocket event `payment:status`.

### 5.2 Debit / Credit Card Implementation
- **Supported Networks:** Visa, MasterCard, RuPay, Maestro, Diners, American Express.
- **Security & Compliance:** 100% PCI-DSS compliant. Raw 16-digit card numbers and CVV codes **never touch our application database**. 
- **Tokenization & Processing:** The Flutter client tokenizes card details through the payment gateway SDK (Razorpay Standard Checkout / Cashfree Elements).
- **Authentication:** Mandatory RBI Two-Factor Authentication via 3D Secure 2.0 OTP page.
- **Database Capture:** Only masked card information (`cardNetwork`: "VISA", `cardLast4`: "4242") is stored for user receipts and order history.

### 5.3 Net Banking Implementation
- **Supported Banks:** HDFC Bank, State Bank of India (SBI), ICICI Bank, Axis Bank, Kotak Mahindra Bank, Punjab National Bank (PNB), Bank of Baroda, and 45+ other NBFCs.
- **Workflow:** 
  1. Frontend fetches active bank list: `GET /v1/payments/netbanking/banks`.
  2. Customer selects their bank; backend returns an encrypted redirect URL: `POST /v1/payments/netbanking/initiate`.
  3. Customer completes authentication on bank portal and is redirected back to app deep link: `modarapp://checkout/payment-callback?orderId=...`.

### 5.4 Cash on Delivery (COD) Implementation
- **Business Eligibility Rules:**
  - Order total must not exceed **₹5,000**.
  - Delivery pincode must be designated as COD-serviceable.
  - User fraud account check: User must have fewer than 2 previous rejected/unreceived COD deliveries.
- **Safety Verification:** Optional SMS OTP confirmation for first-time COD buyers.
- **Delivery Collection Workflow:**
  - Rider collects cash or offers on-spot dynamic UPI QR during delivery.
  - Delivery partner marks payment collected (`codCollectionStatus: "COLLECTED"`, `isPaid: true`) in delivery app, resolving order status to `DELIVERED`.

### 5.5 Webhook Processing & Idempotency
- **Endpoint:** `POST /v1/payments/webhook`
- **Security:** Gateway HMAC SHA-256 signature verification (`X-Razorpay-Signature` or `X-Webhook-Signature`). Unsigned payloads are immediately dropped with `401 Unauthorized`.
- **Idempotency Guard:** Every incoming webhook payload is checked against Redis using `SETNX payment:event:<event_id> 86400`. Repeated webhooks are acknowledged (`200 OK`) without double processing.
- **Atomic State Transition:** Updating `payments` table and `orders` table occurs inside a PostgreSQL serializable transaction `prisma.$transaction([...])`.

---

## 6. COMPLETE REST API SPECIFICATIONS

All endpoints conform to the exact paths used by `ApiConstants.dart` in `modarappid_app`:

### 6.1 Authentication Module
```
POST /v1/auth/otp/request
POST /v1/auth/otp/verify
POST /v1/auth/token/refresh
POST /v1/auth/logout
```
#### Request OTP
- **Method:** `POST /v1/auth/otp/request`
- **Request Body:**
  ```json
  {
    "mobileNumber": "+919876543210"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to +919876543210",
    "data": {
      "resendTimeoutSeconds": 30,
      "isNewUser": false
    }
  }
  ```

#### Verify OTP
- **Method:** `POST /v1/auth/otp/verify`
- **Request Body:**
  ```json
  {
    "mobileNumber": "+919876543210",
    "otp": "123456"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Verification successful",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 86400,
      "user": {
        "id": "usr_99214a1",
        "mobileNumber": "+919876543210",
        "fullName": "Aarav Mehta",
        "email": "aarav.mehta@example.com",
        "avatarUrl": "https://cdn.modarfashion.com/avatars/u1.png"
      }
    }
  }
  ```

---

### 6.2 Profile & Address Module
```
GET    /v1/user/profile
PUT    /v1/user/profile/update
GET    /v1/user/addresses
POST   /v1/user/addresses
PUT    /v1/user/addresses/:id
DELETE /v1/user/addresses/:id
POST   /v1/user/addresses/:id/set-default
```
#### Get User Addresses
- **Method:** `GET /v1/user/addresses`
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "addr_1",
        "tag": "Home",
        "houseNo": "Flat 402, Block B",
        "area": "Green Park Extension",
        "landmark": "Near Metro Station Gate 2",
        "city": "New Delhi",
        "pincode": "110016",
        "contactPhone": "+91 98765 43210",
        "isDefault": true,
        "latitude": 28.5584,
        "longitude": 77.2023
      }
    ]
  }
  ```

---

### 6.3 Location & Serviceability Module
```
POST /v1/location/serviceability
POST /v1/location/reverse-geocode
```
#### Check Serviceability
- **Method:** `POST /v1/location/serviceability`
- **Request Body:**
  ```json
  {
    "latitude": 28.5584,
    "longitude": 77.2023
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "isServiceable": true,
      "estimatedDeliveryTime": "25-30 min",
      "nearbyStoreCount": 8,
      "pincode": "110016",
      "formattedAddress": "Green Park Extension, New Delhi"
    }
  }
  ```

---

### 6.4 Home & Catalog Discovery Module
```
GET /v1/home/feed?lat=28.5584&lng=77.2023
GET /v1/home/banners
GET /v1/categories/quick
GET /v1/categories
GET /v1/stores/nearby?lat=28.5584&lng=77.2023&radius=8
GET /v1/products?trending=true&categoryId=cat_1&page=1&limit=20
GET /v1/products/:id
GET /v1/products/:id/similar
GET /v1/products/search?q=denim+jacket&brands=Zara,Levis&sort=priceLowToHigh
GET /v1/products/suggestions?q=den
```
#### Nearby Stores Query (PostGIS Spatial SQL)
```sql
SELECT 
  id, name, banner_url AS "imageUrl", rating, review_count AS "productCount", 
  is_open AS "isOpen", estimated_delivery_time AS "estimatedDeliveryTime",
  ROUND((ST_Distance(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint($1, $2)::geography
  ) / 1000.0)::numeric, 1) AS distance_km
FROM "Store"
WHERE is_active = true
  AND ST_DWithin(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint($1, $2)::geography,
    service_radius_km * 1000
  )
ORDER BY distance_km ASC;
```

---

### 6.5 Wishlist Module
```
GET    /v1/wishlist
POST   /v1/wishlist/add
DELETE /v1/wishlist/remove/:id
```
- **Response (`200 OK`):** Returns array of `Product` models matching `app_models.dart`.

---

### 6.6 Cart & Coupon Module
```
GET  /v1/cart
POST /v1/cart/item        # Add / increment item
PUT  /v1/cart/item        # Update specific item quantity
DELETE /v1/cart/item/:id  # Remove item
DELETE /v1/cart/clear     # Clear cart
GET  /v1/coupons
POST /v1/coupons/apply
```
#### Shop Conflict Response Example
If customer attempts to add an item from store `s2` when cart contains items from `s1`:
- **HTTP Code:** `409 Conflict`
- **Response Body:**
  ```json
  {
    "success": false,
    "error": "SHOP_CONFLICT",
    "message": "Your cart contains items from 'Style Studio'. Do you want to discard your cart and add this item from 'Fashion Hub'?",
    "data": {
      "currentShopId": "s1",
      "currentShopName": "Style Studio",
      "attemptedShopId": "s2",
      "attemptedShopName": "Fashion Hub"
    }
  }
  ```

---

### 6.7 Checkout, Orders & Payment Module
```
POST /v1/checkout/validate
POST /v1/orders/create
GET  /v1/orders
GET  /v1/orders/:id
POST /v1/orders/:id/cancel
POST /v1/orders/return/create
POST /v1/payments/initiate
POST /v1/payments/verify
POST /v1/payments/webhook
```
#### Checkout Validate Request & Response
- **Request Body:**
  ```json
  {
    "addressId": "addr_1",
    "couponCode": "FESTIVE60"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "isDeliverable": true,
      "shopId": "s1",
      "shopName": "Style Studio",
      "subtotal": 1299.00,
      "deliveryFee": 0.00,
      "platformFee": 15.00,
      "tax": 65.00,
      "discount": 260.00,
      "totalAmount": 1119.00,
      "appliedCoupon": "FESTIVE60",
      "estimatedDeliveryMinutes": 25,
      "availablePaymentMethods": ["UPI", "CARD", "NET_BANKING", "COD"]
    }
  }
  ```

#### Create Order Request
- **Request Body:**
  ```json
  {
    "addressId": "addr_1",
    "paymentMethod": "UPI",
    "couponCode": "FESTIVE60"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Order created successfully",
    "data": {
      "order": {
        "id": "MODAR-89241",
        "shopId": "s1",
        "shopName": "Style Studio",
        "subtotal": 1299.00,
        "deliveryFee": 0.00,
        "platformFee": 15.00,
        "tax": 65.00,
        "discount": 260.00,
        "totalAmount": 1119.00,
        "paymentMethod": "UPI",
        "isPaid": false,
        "orderStatus": "ORDER_PLACED",
        "placedAt": "2026-11-23T16:50:00.000Z",
        "estimatedDeliveryMinutes": 25
      },
      "paymentIntent": {
        "gatewayOrderId": "order_Rz918237912",
        "amount": 1119.00,
        "currency": "INR",
        "upiIntentLinks": {
          "gpay": "tez://upi/pay?pa=modarapp@icici&pn=ModarApp&am=1119.00&tr=MODAR-89241",
          "phonepe": "phonepe://pay?pa=modarapp@icici&pn=ModarApp&am=1119.00&tr=MODAR-89241",
          "paytm": "paytmmp://pay?pa=modarapp@icici&pn=ModarApp&am=1119.00&tr=MODAR-89241"
        }
      }
    }
  }
  ```

---

### 6.8 Live Tracking & Real-Time Socket.io Events
```
GET /v1/tracking/:orderId
```
#### Tracking Response Format (100% matched with `OrderTrackingScreen`):
```json
{
  "success": true,
  "data": {
    "orderId": "MODAR-89241",
    "orderStatus": "OUT_FOR_DELIVERY",
    "currentStepIndex": 7,
    "placedAt": "2026-11-23T16:30:00.000Z",
    "estimatedDeliveryMinutes": 12,
    "deliveryPartner": {
      "name": "Rahul Sharma",
      "phone": "+91 98111 22334",
      "rating": 4.9,
      "vehicleNumber": "DL 03 AB 4591",
      "avatar": "🛵",
      "currentLocation": {
        "latitude": 28.5610,
        "longitude": 77.2045
      }
    },
    "deliveryAddress": {
      "houseNo": "Flat 402, Block B",
      "area": "Green Park Extension",
      "city": "New Delhi",
      "pincode": "110016"
    },
    "store": {
      "name": "Style Studio",
      "address": "Shop 12, Main Market, Green Park",
      "latitude": 28.5590,
      "longitude": 77.2010
    }
  }
}
```

#### Socket.io Gateway Events
- **Client Connects:** `socket.connect('https://api.modarfashion.com', { auth: { token } })`
- **Join Order Room:** `socket.emit('order:track', { orderId: 'MODAR-89241' })`
- **Server Pushes Milestone Update:**
  ```json
  // Event: order:status_change
  {
    "orderId": "MODAR-89241",
    "status": "PICKED_UP",
    "stepIndex": 6,
    "message": "Your order has been picked up by Rahul Sharma"
  }
  ```
- **Server Pushes Live Rider Location:**
  ```json
  // Event: partner:location_update
  {
    "orderId": "MODAR-89241",
    "latitude": 28.5601,
    "longitude": 77.2038,
    "bearing": 142.5,
    "estimatedRemainingMinutes": 8
  }
  ```

---

## 7. SECURITY, ERROR HANDLING & PERFORMANCE STANDARDS

### 7.1 Security Architecture
1. **JWT Dual-Token Rotation:** Short-lived access tokens (15 minutes) and long-lived refresh tokens (30 days) stored with cryptographic hash in database.
2. **Rate Limiting:** Protect against OTP brute-forcing and denial-of-service:
   - `/auth/otp/request`: Max 3 requests per phone number per 10 minutes.
   - `/auth/otp/verify`: Max 5 failed verification attempts per session before invalidation.
   - General API: 120 requests per minute per IP.
3. **Helmet & CORS:** Strict security headers preventing clickjacking, MIME sniffing, and restricting access to mobile user agents and approved app origins.
4. **Input Sanitization & Validation:** 100% of request bodies, query params, and route params validated using **Zod schemas**.

### 7.2 Standard Error Response Shape
Every error in the monolithic backend follows an invariant JSON format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid mobile number supplied",
    "details": [
      {
        "field": "mobileNumber",
        "message": "Phone number must be in E.164 format (+91XXXXXXXXXX)"
      }
    ],
    "timestamp": "2026-11-23T16:55:00.000Z"
  }
}
```

### 7.3 Database Concurrency & Stock Locks
To prevent race conditions during high-demand flash sales:
```typescript
// Atomically deduct stock with database check constraint: stock_quantity >= quantity
await prisma.$executeRaw`
  UPDATE "ProductVariant"
  SET stock_quantity = stock_quantity - ${quantity}
  WHERE id = ${variantId} AND stock_quantity >= ${quantity}
`;
```
If 0 rows are affected, transaction aborts with `400 Insufficient Inventory`.

---

## 8. DEPLOYMENT & ENVIRONMENT CONFIGURATION

### 8.1 Environment Variables Specification (`.env.example`)
```ini
# Server
PORT=3000
NODE_ENV=production
API_PREFIX=/v1
APP_URL=https://api.modarfashion.com

# PostgreSQL & PostGIS
DATABASE_URL=postgresql://modar_user:secure_password@localhost:5432/modar_db?schema=public

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets
JWT_ACCESS_SECRET=your_super_secret_access_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# SMS & OTP Gateway (Fast2SMS / Twilio)
SMS_GATEWAY_PROVIDER=FAST2SMS
SMS_API_KEY=your_sms_gateway_api_key

# Payment Gateway (Razorpay / Cashfree)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Push Notifications (Firebase Cloud Messaging)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 8.2 Dockerfile & Orchestration
The backend includes a multi-stage `Dockerfile` ensuring minimal production container footprint (<150MB) and non-root execution:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## 9. STEP-BY-STEP IMPLEMENTATION ROADMAP

1. **Sprint 1: Base Monolith Foundation & Database**
   - Configure TypeScript, Express, Prisma, PostgreSQL + PostGIS, and Redis connection pool.
   - Run Prisma initial migrations and seed script with sample stores and fashion catalog data.
2. **Sprint 2: Auth, User Profile & Geolocation**
   - Implement Phone OTP authentication, JWT token generation, address management.
   - Implement PostGIS spatial calculation for `/location/serviceability` and `/stores/nearby`.
3. **Sprint 3: Catalog, Search & Wishlist**
   - Implement categories, product details with size/color variants, fuzzy search, and wishlist.
4. **Sprint 4: Cart, Coupons & Single-Shop Engine**
   - Build cart management with single-store conflict enforcement (`shopConflict`).
   - Implement coupon calculation and price breakdown formula.
5. **Sprint 5: Payment Service (UPI, Cards, Net Banking, COD)**
   - Implement payment gateway integration, UPI deep-links/intent, card checkout, netbanking redirect, and COD validation.
   - Implement secure webhook signature verification and idempotent order state transition.
6. **Sprint 6: Order Lifecycle, Live Tracking & Socket.io**
   - Implement order placement, 8-stage order lifecycle, cancellation, and return requests.
   - Setup Socket.io real-time server pushing delivery partner movement and milestone updates.
7. **Sprint 7: End-to-End Integration Testing with Flutter Client**
   - Connect Flutter app (`ApiConstants.dart`) to monolithic backend local/staging environment.
   - Perform full flow testing: Login -> Discovery -> Add to Cart -> Checkout -> Pay via UPI/Card/NetBanking/COD -> Live Order Tracking.
