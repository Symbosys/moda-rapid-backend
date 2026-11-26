# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## ModarApp / StyleExpress — Vendor & Merchant Module

---

### 1. Executive Summary & Objective
ModarApp / StyleExpress is a 30-minute hyperlocal fashion delivery platform. The **Vendor Module** empowers fashion boutiques, brand retailers, and garment merchants to onboard their physical outlets, verify KYC & tax documentation, manage product catalogs with multi-dimensional variants (Name, Type/Category, Image gallery, Size, Color, Stock, SKU), and fulfill hyperlocal orders in real time.

---

### 2. Vendor Onboarding & Store Registration KYC Documents

To operate on the platform in compliance with Indian commerce laws and ensure rapid 30-minute dispatch, every vendor must submit the following verified documents:

| Category | Document Name | Purpose | Mandatory |
|---|---|---|---|
| **Business & Tax** | GSTIN Certificate | Tax compliance & B2B/B2C invoice generation | **Yes** |
| | Business PAN Card | Income Tax verification (Firm or Proprietor) | **Yes** |
| | Trade License / Gumasta | Municipal authority commercial store permit | **Yes** |
| | Udyam Aadhaar (MSME) | Small & Medium enterprise verification | Optional |
| **Owner Identity** | Aadhaar Card (Front/Back) | UIDAI Identity & address proof | **Yes** |
| | Owner PAN Card | Personal KYC of authorized signatory | **Yes** |
| | Live Selfie / Photo | Fraud prevention & facial verification | **Yes** |
| **Banking** | Cancelled Cheque / Bank Statement | Daily/Weekly sales settlement payouts (IFSC & A/C) | **Yes** |
| **Store Physical** | Store Front Photo with Signboard | Visual location tag for delivery riders | **Yes** |
| | Store Interior Rack Photo | Operational stock verification | **Yes** |
| | Electricity Bill / Rent Agreement | Store physical address verification | **Yes** |
| | Exact GPS Coordinates (Lat/Long) | 5-7 km hyperlocal 30-min delivery polygon | **Yes** |
| **Brand Proof** | Brand Authorization Letter / Invoices | Selling licensed brands (Zara, H&M, Nike, etc.) | Conditional |
| | Trademark Registration | Private label/in-house boutique brand proof | Conditional |

---

### 3. Multi-Module Architecture Overview

The Vendor subsystem is designed with modularity, following industrial DDD (Domain-Driven Design) and layered architecture:

```
src/modules/vendor/
├── vendor.controller.ts       // Top-level vendor account & profile orchestrator
├── vendor.service.ts          // Vendor authentication, profile & summary stats
├── vendor.repository.ts       // DB access for vendor profile & aggregations
├── vendor.validator.ts        // Zod validation schemas
├── vendor.routes.ts           // Route aggregator mounting sub-modules
└── modules/
    ├── store/                 // Store Lifecycle & Settings Sub-module
    │   ├── store.controller.ts
    │   ├── store.service.ts
    │   ├── store.repository.ts
    │   ├── store.validator.ts
    │   └── store.routes.ts
    ├── products/              // Product Catalog, Images, Sizes & Colors
    │   ├── product.controller.ts
    │   ├── product.service.ts
    │   ├── product.repository.ts
    │   ├── product.validator.ts
    │   └── product.routes.ts
    ├── orders/                // Vendor Order Dispatch & Preparation
    │   ├── order.controller.ts
    │   ├── order.service.ts
    │   ├── order.repository.ts
    │   ├── order.validator.ts
    │   └── order.routes.ts
    └── kyc/                   // Document Upload & Verification
        ├── kyc.controller.ts
        ├── kyc.service.ts
        ├── kyc.repository.ts
        ├── kyc.validator.ts
        └── kyc.routes.ts
```

---

### 4. API Endpoints Specification

#### A. Vendor Core & Auth (`/v1/vendor`)
- `POST /v1/vendor/register` — Vendor signup with name, email, phone, business type.
- `POST /v1/vendor/login` — Vendor login via password or OTP.
- `GET /v1/vendor/profile` — Vendor profile & associated store summary.
- `GET /v1/vendor/dashboard` — Overview statistics (Total sales, pending orders, low stock items).

#### B. Store Management (`/v1/vendor/store`)
- `POST /v1/vendor/store` — Create store (Name, slug, phone, email, bannerUrl, logoUrl, address, GPS lat/lng, delivery radius).
- `GET /v1/vendor/store` — Get vendor's store details.
- `PUT /v1/vendor/store` — Update store details, timings, and banner.
- `PATCH /v1/vendor/store/toggle-status` — Toggle live store availability (`isOpen: true/false`).

#### C. Product & Variants Catalog (`/v1/vendor/products`)
- `POST /v1/vendor/products` — Create product:
  - `name`: Product title (e.g. "Slim Fit Cotton Casual Shirt")
  - `categoryId`: Category (e.g. Men, Women, Ethnic)
  - `brand`: Brand name
  - `description`: Detailed specifications
  - `sellingPrice` & `originalPrice`: Pricing & discount calculations
  - `imageUrl`: Main thumbnail image URL
  - `galleryUrls`: Multi-angle photos array
  - `isExpressDelivery`: 30-min express flag
  - `deliveryEta`: Estimated time (e.g. "25 mins")
  - `variants`: Array of sizes, colors, and initial inventory:
    - `size`: S, M, L, XL, XXL, 30, 32, 34, etc.
    - `color`: Navy Blue, Crimson, Black, White, etc.
    - `stockQuantity`: Available count
    - `sku`: Barcode/SKU identifier
- `GET /v1/vendor/products` — List vendor products with search, category & stock filters.
- `GET /v1/vendor/products/:id` — Get single product with all variants.
- `PUT /v1/vendor/products/:id` — Update product details.
- `POST /v1/vendor/products/:id/variants` — Add a new size/color variant.
- `PATCH /v1/vendor/products/:id/variants/:variantId/stock` — Quick stock level update.
- `DELETE /v1/vendor/products/:id` — Deactivate/delete product.

#### D. Document / KYC Verification (`/v1/vendor/kyc`)
- `POST /v1/vendor/kyc/upload` — Upload and submit GSTIN, PAN, Aadhaar, Cancelled Cheque, and Store Photos.
- `GET /v1/vendor/kyc/status` — Check KYC approval state (`PENDING`, `VERIFIED`, `REJECTED`).

#### E. Orders & Fulfillment (`/v1/vendor/orders`)
- `GET /v1/vendor/orders` — List real-time incoming orders with filter (`PLACED`, `PREPARING`, `READY_FOR_PICKUP`).
- `GET /v1/vendor/orders/:id` — Order details with item variants, size & color.
- `PATCH /v1/vendor/orders/:id/status` — Update order status:
  - `CONFIRMED`: Store accepted order.
  - `PREPARING`: Items packed from racks.
  - `READY_FOR_PICKUP`: Rider notified to collect package.
