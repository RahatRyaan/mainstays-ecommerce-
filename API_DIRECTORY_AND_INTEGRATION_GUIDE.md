# 🔌 COMPLETE API DIRECTORY & INTEGRATION REFERENCE

> **Project**: MAINSTAYS Atelier — Full-Stack E-Commerce Platform  
> **Backend Base URL**: `http://localhost:5000/api` (Dev) | `https://api.yourdomain.com/api` (Production)  
> **Frontend Client**: Configured with Axios at `frontend/src/api/client.ts`  

---

## 📑 TABLE OF CONTENTS
1. [Third-Party Cloud APIs & Where to Add Keys](#1-third-party-cloud-apis--where-to-add-keys)
2. [Complete Backend REST API Directory (Endpoints, Routes & Files)](#2-complete-backend-rest-api-directory)
3. [Frontend API Integration Map (Which Page Calls Which API)](#3-frontend-api-integration-map)
4. [How to Add a New API End-to-End (Developer Tutorial)](#4-how-to-add-a-new-api-end-to-end)

---

## 1. THIRD-PARTY CLOUD APIs & WHERE TO ADD KEYS

| # | Third-Party API | Purpose | Where to Configure Key | Environment Key Names |
|---|---|---|---|---|
| **1** | **MongoDB Atlas** | Main Database API | `backend/.env` | `MONGO_URI` |
| **2** | **Upstash / Redis** | Fast In-Memory Cache & Rate Limiting | `backend/.env` | `REDIS_URL` |
| **3** | **Stripe Payments** | Checkout, Credit Cards & Webhook Processing | `backend/.env`<br>`frontend/.env` | `PAYMENT_SECRET_KEY`<br>`PAYMENT_WEBHOOK_SECRET`<br>`VITE_STRIPE_PUBLISHABLE_KEY` |
| **4** | **SMTP Email API** (SendGrid / Mailgun / AWS SES / Resend) | Verification Emails, Password Reset & Receipts | `backend/.env` | `SMTP_HOST`<br>`SMTP_PORT`<br>`SMTP_USER`<br>`SMTP_PASS`<br>`SMTP_FROM` |
| **5** | **Cloudinary / AWS S3** | Product & Artisan Image CDN Uploads | `backend/.env` | `CLOUDINARY_CLOUD_NAME`<br>`CLOUDINARY_API_KEY`<br>`CLOUDINARY_API_SECRET` |
| **6** | **Swagger UI** | Live Interactive API Documentation | Auto-enabled at `/api-docs` | Configured in `backend/src/docs/swagger.ts` |

---

## 2. COMPLETE BACKEND REST API DIRECTORY

All backend routes are mounted in `backend/src/server.ts`.

---

### A. Authentication & User Profile (`/api/auth`)
* **Route File**: `backend/src/routes/auth.routes.ts`
* **Controller File**: `backend/src/controllers/auth.controller.ts`
* **Service File**: `backend/src/services/auth.service.ts`

| Method | Endpoint | Access / Role | Description | Request Body Payload |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer or vendor | `{ name, email, password, role?: 'customer'\|'vendor', storeName?, businessType? }` |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT | `{ email, password }` |
| `POST` | `/api/auth/forgot-password` | Public | Generate reset token & send email | `{ email }` |
| `POST` | `/api/auth/reset-password` | Public | Reset password using token | `{ token, newPassword }` |
| `PUT` | `/api/auth/profile` | Authenticated | Update contact, address & delivery info | `{ name, phone, address, deliveryAddress, city, state, zipCode, country, storeName, bio }` |
| `PUT` | `/api/auth/change-password` | Authenticated | Change current password | `{ currentPassword, newPassword }` |
| `PUT` | `/api/auth/upgrade-to-vendor` | Authenticated | Upgrade account to vendor studio | `{ storeName, businessType, taxId, phone }` |

---

### B. Product Catalog & Search (`/api/products`)
* **Route File**: `backend/src/routes/product.routes.ts`
* **Controller File**: `backend/src/controllers/product.controller.ts`

| Method | Endpoint | Access / Role | Description | Query / Body Payload |
|---|---|---|---|---|
| `GET` | `/api/products` | Public | List products with search & filters | Query: `?page=1&limit=20&search=linen&category=Home&minPrice=10&maxPrice=100&sort=price_asc` |
| `GET` | `/api/products/:id` | Public | Get single product detail by ID | Parameter: `id` |
| `POST` | `/api/products` | Vendor / Admin | Create new artisan product | Body: `{ title, description, price, category, inventory, images: string[], tags: string[] }` |
| `PUT` | `/api/products/:id` | Vendor / Admin | Update existing product | Body: Partial product object |
| `DELETE` | `/api/products/:id` | Vendor / Admin | Remove product from catalog | Parameter: `id` |

---

### C. Product Reviews & Ratings (`/api/products/:id/reviews`)
* **Route File**: `backend/src/routes/review.routes.ts` (mounted via `product.routes.ts`)
* **Controller File**: `backend/src/controllers/review.controller.ts`

| Method | Endpoint | Access / Role | Description | Body Payload |
|---|---|---|---|---|
| `GET` | `/api/products/:id/reviews` | Public | Get all reviews for a product | Parameter: `id` |
| `POST` | `/api/products/:id/reviews` | Authenticated | Submit verified customer review | `{ rating: number (1-5), comment: string }` |

---

### D. Shopping Cart & Sync (`/api/cart`)
* **Route File**: `backend/src/routes/cart.routes.ts`
* **Controller File**: `backend/src/controllers/cart.controller.ts`

| Method | Endpoint | Access / Role | Description | Body Payload |
|---|---|---|---|---|
| `GET` | `/api/cart` | Authenticated | Fetch current user's cart | None |
| `POST` | `/api/cart/add` | Authenticated | Add item or increase quantity | `{ productId: string, quantity: number }` |
| `PUT` | `/api/cart/update` | Authenticated | Update item quantity directly | `{ productId: string, quantity: number }` |
| `DELETE`| `/api/cart/remove/:productId` | Authenticated | Remove item from cart | Parameter: `productId` |
| `DELETE`| `/api/cart/clear` | Authenticated | Empty the entire cart | None |

---

### E. Orders & Checkout (`/api/orders`)
* **Route File**: `backend/src/routes/order.routes.ts`
* **Controller File**: `backend/src/controllers/order.controller.ts`

| Method | Endpoint | Access / Role | Description | Body Payload |
|---|---|---|---|---|
| `POST` | `/api/orders` | Authenticated | Place new order / create checkout | `{ items: [{ productId, quantity, price }], shippingAddress: { street, city, state, zipCode, country }, paymentMethod: 'card'\|'stripe' }` |
| `GET` | `/api/orders/my-orders` | Authenticated | Get logged-in user order history | None |
| `GET` | `/api/orders/:id` | Authenticated | Get specific order invoice details | Parameter: `id` |
| `POST` | `/api/orders/webhook` | Public (Stripe) | Stripe webhook for payment capture | Raw Stripe Event payload with signature verification |

---

### F. Vendor Studio & Payouts (`/api/payouts`)
* **Route File**: `backend/src/routes/payout.routes.ts`
* **Controller File**: `backend/src/controllers/payout.controller.ts`

| Method | Endpoint | Access / Role | Description | Body Payload |
|---|---|---|---|---|
| `GET` | `/api/payouts/vendor` | Vendor | Get vendor studio earnings & balance | None |
| `POST` | `/api/payouts/vendor/request`| Vendor | Request funds withdrawal | `{ amount: number, payoutMethod?: string, notes?: string }` |
| `GET` | `/api/payouts/vendor/products`| Vendor | Get vendor's own uploaded products | Query: `?page=1&limit=20` |
| `PATCH`| `/api/payouts/vendor/products/:id`| Vendor | Quick-edit inventory or price | `{ price?: number, inventory?: number, status?: string }` |
| `DELETE`| `/api/payouts/vendor/products/:id`| Vendor | Remove vendor product | Parameter: `id` |

---

### G. Admin Console Management (`/api/admin`)
* **Route File**: `backend/src/routes/admin.routes.ts`
* **Controller File**: `backend/src/controllers/admin.controller.ts`

| Method | Endpoint | Access / Role | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin | List all registered users with role filter (`?role=vendor\|customer`) |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Promote/Demote user role (`{ role: 'admin'\|'vendor'\|'customer' }`) |
| `DELETE`| `/api/admin/users/:id` | Admin | Suspend / delete user account |
| `GET` | `/api/admin/products` | Admin | List all platform products across all vendors |
| `PATCH` | `/api/admin/products/:id/status` | Admin | Moderate / approve / hide product (`{ status: 'active'\|'hidden' }`) |
| `DELETE`| `/api/admin/products/:id` | Admin | Moderation force-delete product |
| `GET` | `/api/admin/orders` | Admin | View all platform customer orders |
| `PATCH` | `/api/admin/orders/:id/status` | Admin | Update order status (`{ status: 'processing'\|'shipped'\|'delivered' }`) |
| `GET` | `/api/admin/vendors` | Admin | List all artisan studios and verification statuses |
| `GET` | `/api/admin/coupons` | Admin | List all active promotional discount codes |
| `POST` | `/api/admin/coupons` | Admin | Create new coupon (`{ code, discountPercent, expiresAt }`) |
| `PATCH` | `/api/admin/coupons/:id/status` | Admin | Toggle coupon active state |
| `DELETE`| `/api/admin/coupons/:id` | Admin | Delete coupon code |

---

### H. Analytics & Dashboards (`/api/dashboard`)
* **Route File**: `backend/src/routes/dashboard.routes.ts`
* **Controller File**: `backend/src/controllers/dashboard.controller.ts`

| Method | Endpoint | Access / Role | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin | Platform metrics (total sales, revenue, user counts, monthly charts) |
| `GET` | `/api/dashboard/vendor` | Vendor | Vendor metrics (total shop revenue, orders count, popular items) |

---

## 3. FRONTEND API INTEGRATION MAP

All frontend HTTP requests route through the configured Axios instance:
👉 **File**: `frontend/src/api/client.ts`

```typescript
// frontend/src/api/client.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically injects Bearer Token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
```

### File-by-File Frontend Consumer Mapping

| Frontend Page / Component | Exact File Path | Endpoints Called via `apiClient` |
|---|---|---|
| **Home Page** | `frontend/src/pages/customer/Home.tsx` | `GET /products?limit=40` |
| **Product Catalog** | `frontend/src/pages/customer/ProductListing.tsx` | `GET /products` (with category, search, price range) |
| **Product Details & Reviews** | `frontend/src/pages/customer/ProductDetail.tsx` | `GET /products/:id`<br>`GET /products/:id/reviews`<br>`POST /products/:id/reviews` |
| **Customer Login** | `frontend/src/pages/customer/Login.tsx` | `POST /auth/login`<br>`POST /auth/forgot-password`<br>`POST /auth/reset-password` |
| **Customer Registration** | `frontend/src/pages/customer/Register.tsx` | `POST /auth/register` |
| **Account & Address Settings**| `frontend/src/pages/customer/AccountSettings.tsx` | `PUT /auth/profile`<br>`PUT /auth/change-password` |
| **Checkout & Order Placing** | `frontend/src/pages/customer/Checkout.tsx` | `POST /orders` |
| **Customer Order History** | `frontend/src/pages/customer/OrderHistory.tsx` | `GET /orders/my-orders` |
| **Vendor Dashboard** | `frontend/src/pages/vendor/VendorDashboard.tsx` | `GET /dashboard/vendor`<br>`GET /payouts/vendor` |
| **Vendor Products Management**| `frontend/src/pages/vendor/VendorProducts.tsx` | `GET /payouts/vendor/products`<br>`PATCH /payouts/vendor/products/:id`<br>`DELETE /payouts/vendor/products/:id` |
| **Vendor Product Creation** | `frontend/src/pages/vendor/ProductForm.tsx` | `POST /products` |
| **Vendor Payout Requests** | `frontend/src/pages/vendor/VendorPayouts.tsx` | `GET /payouts/vendor`<br>`POST /payouts/vendor/request` |
| **Vendor Onboarding** | `frontend/src/pages/vendor/VendorOnboarding.tsx` | `PUT /auth/upgrade-to-vendor` |
| **Admin Overview Dashboard** | `frontend/src/pages/admin/AdminDashboard.tsx` | `GET /dashboard/admin`<br>`GET /admin/users`<br>`GET /admin/products`<br>`GET /admin/orders`<br>`GET /admin/vendors` |
| **Admin User Management** | `frontend/src/pages/admin/UserManagement.tsx` | `GET /admin/users`<br>`PATCH /admin/users/:id/role`<br>`DELETE /admin/users/:id` |
| **Admin Product Moderation** | `frontend/src/pages/admin/ProductManagement.tsx`| `GET /admin/products`<br>`PATCH /admin/products/:id/status`<br>`DELETE /admin/products/:id` |
| **Admin Order Tracking** | `frontend/src/pages/admin/OrderManagement.tsx` | `GET /admin/orders`<br>`PATCH /admin/orders/:id/status` |
| **Admin Vendor Approvals** | `frontend/src/pages/admin/VendorManagement.tsx` | `GET /admin/vendors` |
| **Admin Coupon Engine** | `frontend/src/pages/admin/CouponManagement.tsx` | `GET /admin/coupons`<br>`POST /admin/coupons`<br>`PATCH /admin/coupons/:id/status`<br>`DELETE /admin/coupons/:id` |

---

## 4. HOW TO ADD A NEW API END-TO-END

Follow this 4-step workflow whenever you want to add a brand new feature or endpoint:

### Step 1: Create Database Model (`backend/src/models/Wishlist.ts`)
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
}

const WishlistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
```

### Step 2: Create Controller Handler (`backend/src/controllers/wishlist.controller.ts`)
```typescript
import { Request, Response } from 'express';
import { Wishlist } from '../models/Wishlist';

export const getWishlist = async (req: any, res: Response) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json({ success: true, data: wishlist?.products || [] });
};

export const addToWishlist = async (req: any, res: Response) => {
  const { productId } = req.body;
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: productId } },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: wishlist });
};
```

### Step 3: Create Route & Register in `server.ts`
1. Create `backend/src/routes/wishlist.routes.ts`:
```typescript
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getWishlist, addToWishlist } from '../controllers/wishlist.controller';

const router = Router();
router.get('/', authenticate, getWishlist);
router.post('/add', authenticate, addToWishlist);

export default router;
```
2. In `backend/src/server.ts`, mount the route:
```typescript
import wishlistRoutes from './routes/wishlist.routes';
app.use('/api/wishlist', wishlistRoutes);
```

### Step 4: Call from Frontend UI
In any frontend component or hook:
```typescript
import apiClient from '../../api/client';

// Fetch wishlist
const fetchWishlist = async () => {
  const response = await apiClient.get('/wishlist');
  return response.data.data;
};

// Add product to wishlist
const handleAddToWishlist = async (productId: string) => {
  await apiClient.post('/wishlist/add', { productId });
};
```
