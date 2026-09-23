# MAINSTAYS Atelier

## Full-Stack Multi-Vendor E-Commerce Platform

MAINSTAYS Atelier is a production-oriented, full-stack e-commerce platform for curated products and independent vendors. The system provides customer shopping workflows, vendor operations, administrative management, secure authentication, order processing, payments, inventory visibility, reviews, wishlists, caching, and API documentation in a single monorepo.

The project demonstrates practical full-stack engineering across frontend architecture, REST API development, data modeling, role-based access control, third-party integrations, automated testing, containerization, and continuous integration.

## Project Highlights

- Multi-role platform supporting customers, vendors, and administrators.
- Responsive storefront with product discovery, filtering, product detail pages, cart, wishlist, checkout, order history, reviews, and account settings.
- Vendor dashboard for product management, inventory visibility, order handling, analytics, and payout workflows.
- Admin console for users, products, vendors, orders, coupons, and platform analytics.
- JWT-based authentication with protected routes and role-aware authorization.
- MongoDB persistence with Mongoose and Redis caching for faster catalog and search access.
- Payment integrations for SSLCommerz and Stripe-ready checkout workflows.
- Google OAuth and transactional email support for authentication and customer notifications.
- Swagger/OpenAPI documentation available from the backend.
- Security middleware including Helmet, CORS handling, request sanitization, rate limiting, validation, and centralized error handling.
- Automated backend tests and TypeScript build checks through GitHub Actions.

## Technology Stack

### Frontend

- React 19, TypeScript, and Vite
- React Router and Zustand for client state management
- Axios for API communication
- Tailwind CSS and Framer Motion
- Lucide React for interface icons

### Backend

- Node.js, Express 5, and TypeScript
- Mongoose with MongoDB
- Redis
- JWT authentication
- Joi and Zod validation
- Swagger UI and OpenAPI documentation
- Winston logging
- Nodemailer and Resend-compatible email configuration

### Engineering and Infrastructure

- Jest, ts-jest, Supertest, and MongoDB Memory Server
- Docker and Docker Compose
- GitHub Actions CI
- ESLint, Oxlint, Prettier, and TypeScript checks

## Architecture

The repository uses a monorepo structure with a separately deployable React frontend and Express backend. The frontend communicates with the backend through a centralized Axios client. The backend separates routing, controllers, services, persistence models, validation, middleware, and infrastructure concerns.

```text
e-commerch/
├── frontend/                         # React + Vite customer, vendor, and admin UI
│   ├── public/                       # Static public assets
│   └── src/
│       ├── api/                      # Axios API client and request configuration
│       ├── assets/                   # Frontend assets
│       ├── components/               # Shared UI and product components
│       ├── layouts/                  # Customer, vendor, and admin application shells
│       ├── pages/                    # Customer, vendor, and admin screens
│       ├── store/                    # Zustand stores for auth, products, cart, etc.
│       ├── App.tsx                   # Application routing and composition
│       ├── App.css                   # Application-level styles
│       └── index.css                 # Global styles and design tokens
│
├── backend/                          # Express + TypeScript REST API
│   ├── scripts/                      # Database seed and admin creation scripts
│   └── src/
│       ├── common/                   # Logging and centralized error handling
│       ├── controllers/              # HTTP request and response handlers
│       ├── db/                       # MongoDB and Redis connection modules
│       ├── docs/                     # Swagger/OpenAPI configuration
│       ├── middlewares/              # Auth, validation, rate limiting, and logging
│       ├── models/                   # Mongoose models and database schemas
│       ├── routes/                   # REST route definitions
│       ├── services/                 # Business logic and integrations
│       ├── types/                    # Express and application type extensions
│       ├── validations/              # Joi/Zod request validation schemas
│       └── server.ts                 # API bootstrap and route registration
│   └── tests/                        # Backend integration and security tests
│
├── .github/workflows/ci.yml          # Automated test and build pipeline
├── docker-compose.yml                # Local full-stack orchestration
├── Dockerfile.backend                # Backend container image
├── Dockerfile.frontend               # Frontend container image
├── 02_ARCHITECTURE.md                # Detailed architecture and data model notes
├── 03_DESIGN_SYSTEM.md               # UI design system and accessibility guidance
└── API_DIRECTORY_AND_INTEGRATION_GUIDE.md
									  # Endpoint and integration reference
```

## Core Domain Model

The backend models the main commerce workflows using MongoDB collections for:

- Users and role-specific vendor profiles
- Products, variants, categories, and inventory
- Carts and wishlists
- Orders and vendor sub-orders
- Reviews and verified purchase feedback
- Coupons and promotional rules
- Payouts and vendor earnings
- Inventory logs and stock adjustments

## Application Areas

### Customer Experience

- Browse and search the catalog with category, price, and availability filters.
- View product details, variants, ratings, reviews, and related products.
- Manage cart items and wishlist products.
- Complete checkout with shipping details, coupons, and payment selection.
- Review order history, order status, account profile, and saved settings.

### Vendor Experience

- Apply for or manage a vendor account.
- Create, edit, and manage products.
- Monitor inventory and vendor-specific orders.
- View sales metrics and payout information.

### Admin Experience

- Monitor platform sales, revenue, user counts, and product activity.
- Manage users, vendors, products, orders, coupons, and account roles.
- Review vendor access and maintain platform-level operational control.

## API and Documentation

The REST API is served by the backend on port `5000` by default.

- API base URL: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`
- API overview: `http://localhost:5000/`
- Swagger UI: `http://localhost:5000/api-docs`

Primary API areas include:

```text
/api/auth
/api/products
/api/cart
/api/orders
/api/wishlist
/api/reviews
/api/dashboard
/api/admin
/api/payouts
```

For endpoint-level request and response details, see [API_DIRECTORY_AND_INTEGRATION_GUIDE.md](API_DIRECTORY_AND_INTEGRATION_GUIDE.md).

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB, local or hosted through MongoDB Atlas
- Redis, local or hosted through Upstash or another Redis provider

### Install Dependencies

From the repository root:

```bash
npm run install:all
```

### Configure Environment Variables

Copy the environment templates and provide the required values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

At minimum, configure `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, and `VITE_API_URL`. Payment, OAuth, email, and media provider credentials are optional until those integrations are used.

Never commit real secrets to the repository.

### Run in Development

Start the frontend and backend together:

```bash
npm run dev
```

Or run each application independently:

```bash
npm run dev:backend
npm run dev:frontend
```

Default development URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Run with Docker

Docker Compose starts the frontend, backend, MongoDB, and Redis services:

```bash
docker compose up --build
```

The containerized frontend is exposed at `http://localhost:3000` and the API at `http://localhost:5000`.

## Testing and Quality Checks

Run backend tests:

```bash
cd backend
npm test
```

Build the backend:

```bash
cd backend
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

The GitHub Actions workflow runs backend tests, backend TypeScript compilation, and frontend production builds for pushes and pull requests targeting `main` and `develop`.

## Security Practices

- JWT authentication and protected route middleware.
- Role-based authorization for customer, vendor, and admin capabilities.
- Helmet security headers and CORS configuration.
- Express rate limiting on API traffic and authentication-sensitive operations.
- MongoDB query sanitization and request validation.
- Centralized error handling and structured Winston logging.
- Environment-based secret management with no credentials stored in source control.

## Resume-Ready Project Description

### Short Version

**MAINSTAYS Atelier | Full-Stack Multi-Vendor E-Commerce Platform**
Built a production-oriented e-commerce platform using React, TypeScript, Express, MongoDB, and Redis, featuring role-based customer, vendor, and admin workflows, JWT authentication, payment integrations, inventory management, REST APIs, Swagger documentation, automated testing, Docker, and GitHub Actions CI.

### Resume Bullet Points

- Developed a responsive multi-vendor e-commerce platform with React, TypeScript, Vite, Zustand, and Tailwind CSS, supporting catalog discovery, cart, wishlist, checkout, reviews, orders, and account management.
- Designed and implemented a modular Express and TypeScript REST API backed by MongoDB and Redis, covering authentication, products, inventory, orders, payouts, dashboards, coupons, and vendor operations.
- Implemented JWT authentication, role-based authorization, request validation, rate limiting, Helmet security headers, MongoDB sanitization, structured logging, and centralized error handling.
- Integrated payment, OAuth, email, and caching workflows while documenting the API with Swagger/OpenAPI.
- Added Jest and Supertest integration coverage, MongoDB Memory Server test support, Docker Compose services, and GitHub Actions checks for repeatable builds and quality control.

## Documentation

- [Architecture and data model](02_ARCHITECTURE.md)
- [Design system](03_DESIGN_SYSTEM.md)
- [API and integrations guide](API_DIRECTORY_AND_INTEGRATION_GUIDE.md)
- [Backend environment template](backend/.env.example)
- [Frontend environment template](frontend/.env.example)

## Author

**Rahat Hasan Akanda**

Copyright 2016, Rahat Hasan Akanda
