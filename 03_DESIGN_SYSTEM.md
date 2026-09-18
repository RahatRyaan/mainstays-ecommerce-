# Design System — E-Commerce / Inventory System

Goal: this should look and feel like a real, funded e-commerce product (think a clean modern storefront), not a generic admin template or an unstyled component library default. Every screen must follow these tokens — no ad-hoc colors/fonts introduced mid-build.

## 1. Brand personality

Clean, trustworthy, fast. Confident whitespace, clear hierarchy, subtle motion — not flashy or gradient-heavy. Should read as premium-but-approachable, similar in spirit to modern storefronts (Shopify-store quality, not a Bootstrap template).

## 2. Color tokens

```
--color-bg:            #FAFAFA   (light)  /  #0E0F12 (dark)
--color-surface:       #FFFFFF   (light)  /  #17181C (dark)
--color-border:        #E5E7EB   (light)  /  #2A2C33 (dark)
--color-text-primary:  #111827   (light)  /  #F3F4F6 (dark)
--color-text-muted:    #6B7280   (light)  /  #9CA3AF (dark)
--color-brand:         #16A34A   (primary — green, "in stock/buy" energy)
--color-brand-hover:   #15803D
--color-accent:        #2563EB   (links, secondary actions)
--color-warning:       #D97706   (low stock, pending)
--color-danger:        #DC2626   (errors, out of stock, cancelled)
--color-success:       #16A34A   (delivered, paid)
```

Support both light and dark mode from the start — define as CSS variables / Tailwind theme extension, not hardcoded hex in components.

## 3. Typography

- **Headings**: "Sora" or "Plus Jakarta Sans" (geometric, modern) — weight 600/700.
- **Body/UI**: "Inter" — weight 400/500.
- Scale: `text-xs (12) / sm (14) / base (16) / lg (18) / xl (20) / 2xl (24) / 3xl (30) / 4xl (36)`.
- Line height: 1.5 for body, 1.2 for headings.

## 4. Spacing & layout

- Base spacing unit: 4px, scale in multiples of 4 (Tailwind default scale is fine).
- Max content width: 1280px, generous side padding (24–32px) on mobile.
- Cards: 12–16px border radius, subtle shadow (`shadow-sm`/`shadow-md`), 1px border in light mode.
- Grid: 12-column responsive grid for catalog pages; product grid 2 cols mobile / 3 tablet / 4–5 desktop.

## 5. Component approach

Use **Tailwind + shadcn/ui** conventions for base primitives (buttons, inputs, dialogs, dropdowns, toasts) and build product-specific components (ProductCard, VariantSelector, StockBadge, OrderStatusStepper, RatingStars) on top. Do not use default unstyled `<select>`/`<input>` — everything should carry the design tokens above.

Key custom components to design carefully:
- **ProductCard** — image, name, price, rating stars, stock badge, quick-add.
- **VariantSelector** — size/color swatches, disables out-of-stock combos.
- **StockBadge** — green "In stock" / amber "Low stock (n left)" / red "Out of stock".
- **OrderStatusStepper** — visual pending → processing → shipped → delivered progress.
- **AdminAnalyticsCard** — KPI number + small trend chart (sales, revenue, top products).
- **CartDrawer** — slide-in persistent cart, not a full page redirect.

## 6. Motion

Subtle only: 150–200ms ease-out transitions on hover/focus, fade+slide for drawers/modals, skeleton loaders (not spinners) for content that's fetching. No large decorative animations.

## 7. Accessibility

WCAG AA contrast minimum, all interactive elements keyboard-navigable, form fields have visible labels (not placeholder-only), focus rings visible, alt text on all product images.

## 8. Page inventory (build to this list — matches sprint plan phases)

**Customer-facing**
- Home / landing (featured products, categories)
- Product listing (search, filters, sort, pagination)
- Product detail (variants, reviews, related products)
- Cart (drawer + full page)
- Checkout (address, shipping, coupon, payment)
- Order history / order detail with status stepper
- Account settings
- Auth: login, register, forgot/reset password

**Vendor** (multi-vendor is enabled for this project)
- Vendor onboarding / application form (admin approval step)
- Vendor dashboard (own products, stock levels, own orders, own revenue)
- Product create/edit form
- Vendor payout/earnings summary view

**Admin**
- Admin dashboard (sales analytics, revenue chart, top products)
- User management
- All-products management
- All-orders management
- Coupon management

## 9. Responsive & states checklist per page

Every page needs: mobile layout, loading state (skeletons), empty state, error state, and — for lists — a realistic "many items" state (don't only design for 3 sample products).
