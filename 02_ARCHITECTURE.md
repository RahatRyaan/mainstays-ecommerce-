# Software Architecture — E-Commerce / Inventory System

## 1. Tech Stack (fixed — do not substitute without asking)

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Redux Toolkit + TailwindCSS |
| Backend | Node.js + Express.js, modular services (auth, product, order, inventory, payment) |
| Database | MongoDB (primary), Redis (cache/session) |
| Testing | Jest + Supertest |
| Containers | Docker + docker-compose |
| CI/CD | GitHub Actions |
| API Docs | Swagger / OpenAPI |
| Security | Helmet, express-rate-limit, Joi/Zod validation, CSRF protection |
| Logging | Winston (+ optional Sentry) |

## 2. Monorepo layout

```
/repo
  /frontend
    /src
      /app          # store, providers, router
      /features      # redux slices + components, one folder per domain (auth, catalog, cart, orders, admin)
      /components    # shared/presentational UI (buttons, cards, modals, layout)
      /lib           # api client, hooks, utils
      /styles
  /backend
    /src
      /modules
        /auth
        /product
        /order
        /inventory
        /payment
        /review
        /coupon
      /common        # middleware, error handler, logger, config, validators
      /db            # mongoose models/schemas, redis client
      server.ts
    /tests
      /unit
      /integration
  /docker
    docker-compose.yml
    Dockerfile.frontend
    Dockerfile.backend
  /.github/workflows
    ci.yml
  README.md
  .env.example
```

Each module under `/backend/src/modules/<name>` should be self-contained: `routes.ts`, `controller.ts`, `service.ts` (business logic — this is what gets unit tested), `validation.ts` (Joi/Zod schemas), `model.ts` if it owns a collection.

## 3. Database schema (MongoDB, expanded from brief)

**User**
```
_id, name, email (unique), passwordHash, role: enum[customer, vendor, admin],
refreshToken, isVerified, createdAt, updatedAt,
vendorProfile: {                          # present only when role = vendor
  storeName, storeSlug, description, logoUrl,
  status: enum[pending, approved, suspended],
  payoutMethod, payoutDetails, commissionRate
}
```

**Product**
```
_id, vendorId (ref User), name, slug, description, category, tags[],
variants: [{ sku, size, color, price, stock, imageUrl }],
basePrice, images[], ratingAvg, ratingCount, isActive, createdAt, updatedAt
```

**Order**
```
_id, userId (ref User), items: [{ productId, vendorId, variantSku, qty, priceAtPurchase }],
totalAmount, status: enum[pending, processing, shipped, delivered, cancelled],
shippingAddress, paymentStatus: enum[unpaid, paid, refunded],
paymentProvider, paymentRef, couponCode, createdAt, updatedAt
```
> Note: since a single cart/checkout can contain items from multiple vendors, `status` should be tracked per-vendor sub-order in practice (e.g. a `subOrders: [{ vendorId, items[], status }]` breakdown, or a separate `SubOrder` collection referencing the parent `Order`). Decide the exact shape in Phase 4 and record it in the Progress Tracker — but each vendor must be able to manage/ship only their own portion of an order independently.

**Payout** (new — multi-vendor)
```
_id, vendorId, orderId, subOrderAmount, commissionAmount, netPayout,
status: enum[pending, paid], paidAt
```

**InventoryLog**
```
_id, productId, variantSku, changeAmount, reason: enum[order, restock, adjustment, return],
refOrderId (optional), timestamp
```

**Coupon**
```
_id, code (unique), discountType: enum[percent, fixed], discountValue,
minOrderAmount, expiryDate, usageLimit, timesUsed, isActive
```

**Review**
```
_id, productId, userId, orderId (proof of purchase), rating (1-5), comment, createdAt
```

Indexes: unique index on `User.email`, `Coupon.code`; text index on `Product.name/description` for search; compound index on `Order.userId + createdAt` for order history queries.

## 4. API surface (high level — flesh out per phase)

```
/api/auth        POST /register, /login, /refresh, /logout
/api/products     GET / (search+filter+sort+paginate), GET /:id, POST /, PUT /:id, DELETE /:id (vendor/admin)
/api/inventory    GET /:productId/log, POST /:productId/adjust (vendor/admin)
/api/cart         GET /, POST /items, PATCH /items/:id, DELETE /items/:id
/api/coupons      POST /apply, CRUD (admin)
/api/orders       POST / (checkout), GET /, GET /:id, PATCH /:id/status (vendor/admin, scoped to own sub-order)
/api/payments     POST /webhook (provider callback, idempotent), POST /create-intent
/api/reviews      POST /, GET /product/:id
/api/vendors      POST /apply, GET /me, PATCH /me, GET /:id (public storefront)
/api/vendors/me   GET /orders, GET /products, GET /payouts, GET /analytics
/api/admin        GET /analytics/sales, /analytics/top-products, /analytics/revenue
/api/admin/vendors  GET / (list + status), PATCH /:id/approve, PATCH /:id/suspend
/health           GET  (used for zero-downtime deploy / container health checks)
/api-docs         Swagger UI
```

All mutating routes: JWT auth middleware + role-based authorization middleware + Joi/Zod body validation + rate limiting on auth-sensitive routes.

## 5. Payment webhook idempotency (call out from the brief — important)

Store `paymentRef`/event ID from the provider on first receipt; on webhook retry, check for existing processed event ID before creating a duplicate order/state change. This is one of the "stand-out" requirements from the brief — do not skip it.

## 6. Environment variables (`.env.example` should include)

```
NODE_ENV=
PORT=
MONGO_URI=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=
PAYMENT_PROVIDER=            # stripe | sslcommerz
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
SENTRY_DSN=                  # optional
CORS_ORIGIN=
```

## 7. Docker Compose services

`app-backend`, `app-frontend`, `mongo`, `redis` — one command (`docker-compose up`) should bring the full stack up locally, backend waiting on Mongo/Redis health before accepting traffic.

## 8. CI pipeline stages (GitHub Actions)

`install → lint → test (unit + integration) → build → (on merge to main) deploy`. Badge in README should reflect real, passing status — not decorative.
