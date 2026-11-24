# ModarApp / StyleExpress – Monolithic Backend API Documentation
## API Version: `v1` | Base URL: `http://localhost:3000/v1`

---

## 1. Authentication & Session Module (`/auth`)

### 1.1 Request Mobile OTP
* **Endpoint:** `POST /v1/auth/otp/request`
* **Headers:** `Content-Type: application/json`
* **Body:**
  ```json
  {
    "mobileNumber": "+919876543210"
  }
  ```
* **Response (`200 OK`):**
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

### 1.2 Verify OTP & Login
* **Endpoint:** `POST /v1/auth/otp/verify`
* **Body:**
  ```json
  {
    "mobileNumber": "+919876543210",
    "otp": "123456"
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 86400,
      "user": {
        "id": "e2e_customer_1",
        "phoneNumber": "+919876543210",
        "fullName": "Aarav Mehta",
        "email": "aarav.mehta@example.com",
        "avatarUrl": "https://cdn.modarfashion.com/avatars/u1.png",
        "role": "CUSTOMER"
      }
    }
  }
  ```

### 1.3 Refresh Access Token
* **Endpoint:** `POST /v1/auth/token/refresh`
* **Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```

---

## 2. User Profile & Addresses (`/user`)

### 2.1 Get Profile
* **Endpoint:** `GET /v1/user/profile`
* **Headers:** `Authorization: Bearer <accessToken>`

### 2.2 Update Profile
* **Endpoint:** `PUT /v1/user/profile/update`
* **Body:**
  ```json
  {
    "fullName": "Aarav Mehta",
    "email": "aarav.mehta@example.com"
  }
  ```

### 2.3 User Addresses
* `GET /v1/user/addresses` (List all saved addresses)
* `POST /v1/user/addresses` (Add new address)
  ```json
  {
    "tag": "HOME",
    "houseNo": "Flat 402, Block B",
    "area": "Green Park Extension",
    "landmark": "Near Metro Station Gate 2",
    "city": "New Delhi",
    "pincode": "110016",
    "contactPhone": "+919876543210",
    "isDefault": true
  }
  ```
* `PUT /v1/user/addresses/:id` (Update address)
* `DELETE /v1/user/addresses/:id` (Delete address)

---

## 3. Location & 30-Min Serviceability (`/location`)

### 3.1 Check Serviceability
* **Endpoint:** `POST /v1/location/serviceability`
* **Body:**
  ```json
  {
    "latitude": 28.5584,
    "longitude": 77.2023
  }
  ```
* **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "isServiceable": true,
      "estimatedDeliveryTime": "25-30 min",
      "nearbyStoreCount": 2,
      "formattedAddress": "Green Park Market, New Delhi"
    }
  }
  ```

### 3.2 Reverse Geocoding
* **Endpoint:** `POST /v1/location/reverse-geocode`
* **Body:** `{ "latitude": 28.5584, "longitude": 77.2023 }`

---

## 4. Home Feed, Stores & Products Catalog

* `GET /v1/home/feed?lat=28.5584&lng=77.2023`
* `GET /v1/home/banners`
* `GET /v1/categories/quick`
* `GET /v1/categories`
* `GET /v1/stores/nearby?lat=28.5584&lng=77.2023`
* `GET /v1/products?trending=true`
* `GET /v1/products/:id` (Returns available sizes & colors matrix)
* `GET /v1/products/:id/similar`
* `GET /v1/products/search?q=denim`
* `GET /v1/products/suggestions?q=den`

---

## 5. Wishlist Module (`/wishlist`)

* `GET /v1/wishlist` (Authenticated)
* `POST /v1/wishlist/add` `{ "productId": "p1" }`
* `DELETE /v1/wishlist/remove/:id`

---

## 6. Cart & Single-Store Invariant (`/cart`)

### 6.1 Add Item to Cart
* **Endpoint:** `POST /v1/cart/item`
* **Body:**
  ```json
  {
    "productId": "p1",
    "size": "M",
    "color": "Navy Blue",
    "quantity": 1,
    "replaceIfConflict": false
  }
  ```
* **Single-Shop Invariant (409 Conflict):**
  If user already has items from another shop and `replaceIfConflict: false`, returns:
  ```json
  {
    "success": false,
    "error": {
      "code": "SHOP_CONFLICT",
      "message": "Your cart contains items from 'Style Studio'. Discard cart and start order from 'Fashion Hub'?"
    }
  }
  ```
  Pass `replaceIfConflict: true` to confirm discarding old cart.

### 6.2 Apply Promo Coupon
* **Endpoint:** `POST /v1/cart/coupon`
* **Body:** `{ "code": "FESTIVE60" }`
* **Supported Codes:**
  - `FESTIVE60`: 20% OFF up to ₹300
  - `MODAR50`: 15% OFF up to ₹150
  - `FREESHIP`: Waives delivery fee
  - `EXPRESS30`: ₹100 flat OFF above ₹500

---

## 7. Checkout & Multi-Rail Payment Gateway

### 7.1 Validate Checkout
* **Endpoint:** `POST /v1/checkout/validate`
* **Body:** `{ "addressId": "addr_1", "couponCode": "FESTIVE60" }`

### 7.2 Supported Payment Methods
* **Directory:** `GET /v1/payments/netbanking/banks` (Lists top 10 Indian retail banks)
* **Initiate Payment:** `POST /v1/payments/initiate`
  - **UPI:** Returns Google Pay (`tez://`), PhonePe (`phonepe://`), Paytm (`paytmmp://`) deep links & Bharat-QR.
  - **Card:** Returns 3D Secure session URL (`VISA`, `MASTERCARD`, `RUPAY`, `AMEX`).
  - **Net Banking:** Returns encrypted bank portal redirect URL.
  - **COD:** Returns Cash on Delivery instructions & sets `collectionStatus: "PENDING_DELIVERY"`.
* **Webhook:** `POST /v1/payments/webhook` (HMAC SHA-256 signature verified).

---

## 8. Orders & Real-Time Tracking

### 8.1 Place Order
* **Endpoint:** `POST /v1/orders/create`
* **Body:**
  ```json
  {
    "addressId": "addr_1",
    "paymentMethod": "UPI"
  }
  ```

### 8.2 Order Lifecycle Stepper (1 to 8)
* `GET /v1/orders` (User orders list)
* `GET /v1/orders/:id` (Order details)
* `GET /v1/tracking/:orderId` (Milestone progress, assigned rider info, ETA)
* `POST /v1/orders/:id/advance-status` (Advances through 8 stages)
* `POST /v1/orders/:id/cancel` (Cancel before preparation)
* `POST /v1/orders/return/create` (Doorstep 24-hour return request)

### 8.3 Real-Time WebSocket (Socket.io)
* **Connection URL:** `ws://localhost:3000`
* **Join Room:**
  ```javascript
  socket.emit('join_order_tracking', { orderId: 'MODAR-89241' });
  ```
* **Event Listeners:**
  - `order:status_update`: `{ orderId, status, stepIndex }`
  - `partner:location_update`: `{ orderId, latitude, longitude, bearing }`
