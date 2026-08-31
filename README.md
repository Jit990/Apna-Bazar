# 🏪 Apna Bazar — Production E-Commerce Application

**Han Rishta, Han Ehsaas, Humare Saath...**

A full-stack, production-ready local e-commerce application for **Apna Bazar** — an Emetetion Jewelry & Gift Shop located in Bajkul, West Bengal, India (Pin-721655).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- A Supabase account (free tier works)
- A Razorpay account (test credentials for development)

### 1. Clone & Install
```bash
cd apna-bazar
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Fill in your Supabase and Razorpay credentials
```

### 3. Set Up Database
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Open **SQL Editor**
4. Run `database/schema.sql` (full schema + RLS policies)
5. Run `database/seed.sql` (development seed data + RPC functions)

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Customer App  
Open [http://localhost:3000/admin](http://localhost:3000/admin) — Admin Panel

---

## 🏗️ Technology Stack

| Layer        | Technology |
|-------------|-----------|
| Frontend     | Next.js 15 (App Router), TypeScript, React 19 |
| Styling      | Tailwind CSS, Custom Design System |
| Backend      | Next.js Server Components + API Routes |
| Database     | PostgreSQL (Supabase) |
| Auth         | Supabase Auth (Email + OTP ready) |
| Storage      | Supabase Storage |
| Payments     | Razorpay (INR, COD + Online) |
| Validation   | Zod |
| Icons        | Lucide React |
| Toasts       | Sonner |
| Fonts        | Google Fonts (Inter + Baloo 2) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (customer)/          # Customer-facing pages
│   │   ├── layout.tsx       # Customer layout (header + nav)
│   │   ├── page.tsx         # Home page
│   │   ├── categories/      # Category listing
│   │   ├── products/        # Product listing + detail
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout flow
│   │   ├── account/         # Customer account
│   │   └── search/          # Search results
│   ├── admin/               # Admin panel (protected)
│   │   ├── layout.tsx       # Admin layout (sidebar)
│   │   ├── page.tsx         # Dashboard
│   │   ├── products/        # Product management
│   │   ├── categories/      # Category management
│   │   ├── orders/          # Order management
│   │   ├── customers/       # Customer management
│   │   ├── inventory/       # Inventory management
│   │   ├── coupons/         # Coupon management
│   │   ├── banners/         # Banner management
│   │   ├── delivery/        # Delivery settings
│   │   ├── payments/        # Payment management
│   │   ├── reports/         # Sales reports
│   │   └── settings/        # Store settings
│   └── api/                 # API Routes
│       ├── categories/      # GET categories
│       ├── products/        # GET products (search, filter, paginate)
│       ├── cart/            # Cart CRUD
│       ├── checkout/        # Create order
│       ├── payments/
│       │   ├── verify/      # Verify Razorpay payment
│       │   └── webhook/     # Razorpay webhooks
│       └── auth/
│           └── send-otp/    # OTP dispatch
├── components/
│   ├── layout/              # Header, MobileNav, Footer
│   ├── product/             # ProductCard, CategoryCard
│   ├── admin/               # AdminSidebar
│   └── ui/                  # Shared UI components
├── lib/
│   ├── supabase/            # Supabase client/server/middleware
│   ├── utils.ts             # Utility functions
│   └── validations.ts       # Zod schemas
├── services/
│   ├── pricing.service.ts   # Price calculation (server-side)
│   ├── payment.service.ts   # Razorpay integration
│   ├── otp.service.ts       # OTP send/verify
│   └── notification.service.ts # In-app notifications
├── types/
│   └── index.ts             # All TypeScript types
└── middleware.ts             # Auth middleware + admin protection
```

---

## 🛒 Customer Features

| Feature | Status |
|---------|--------|
| Home page with categories & banners | ✅ |
| Category browsing | ✅ |
| Product listing with filters & sort | ✅ |
| Product detail page | ✅ |
| Search with suggestions | ✅ |
| Shopping cart | ✅ |
| Wishlist | ✅ |
| Saved addresses | ✅ |
| Checkout flow | ✅ |
| Razorpay online payment | ✅ |
| Cash on Delivery | ✅ |
| Coupon/promo codes | ✅ |
| Order tracking | ✅ |
| Order history | ✅ |
| Reorder | ✅ |
| In-app notifications | ✅ |
| Mobile OTP login | ✅ (console mode in dev) |
| PWA installability | ✅ |

---

## 🔑 Admin Features

| Feature | Status |
|---------|--------|
| Secure admin login | ✅ |
| Dashboard with live stats | ✅ |
| Product CRUD | ✅ |
| Category CRUD + subcategories | ✅ |
| Inventory management | ✅ |
| Order management + status updates | ✅ |
| Customer list | ✅ |
| Coupon CRUD | ✅ |
| Banner/promo management | ✅ |
| Delivery zone management | ✅ |
| Payment tracking | ✅ |
| Refund initiation | ✅ |
| Sales reports + CSV export | ✅ |
| Store settings (all configurable) | ✅ |
| Audit logs | ✅ |

---

## 🔒 Security

- Server-side authentication on all protected routes
- Row Level Security (RLS) on all Supabase tables
- Admin role verification on every admin page load
- Razorpay payment signature verification (timing-safe)
- Webhook signature verification
- Server-side price recalculation (never trusts frontend totals)
- Server-side stock validation
- Server-side coupon validation
- No secrets in frontend code
- Environment variables for all credentials

---

## 💳 Payment Integration

- **Razorpay**: Online payment with INR support
- **COD**: Cash on Delivery (configurable per zone)
- Payment webhooks for server-side confirmation
- Automatic refund initiation via API
- Payment signature verification (cryptographic, timing-safe)

**Test credentials**: Use `rzp_test_*` keys from Razorpay dashboard

---

## 📞 Required External Services

| Service | Purpose | Required For |
|---------|---------|-------------|
| Supabase | Database + Auth + Storage | Core |
| Razorpay | Payment processing | Payments |
| MSG91 or Twilio | SMS OTP | Production auth |
| Resend | Email notifications | Optional |

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

### Database
Run the following SQL files in Supabase SQL Editor (in order):
1. `database/schema.sql`
2. `database/seed.sql` (development only)

### Razorpay Webhook
Configure webhook URL in Razorpay Dashboard:
```
https://your-domain.com/api/payments/webhook
```
Events to subscribe: `payment.captured`, `payment.failed`, `refund.processed`

---

## 📖 Documentation

| Document | Path |
|---------|------|
| Architecture | `docs/ARCHITECTURE.md` |
| Database Schema | `docs/DATABASE.md` |
| Deployment Guide | `docs/DEPLOYMENT.md` |
| Payment Setup | `docs/PAYMENTS.md` |
| Admin Guide | `docs/ADMIN_GUIDE.md` |
| Environment Variables | `docs/ENVIRONMENT.md` |

---

## 👩‍💻 Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript check
```

---

## 🎨 Brand

- **Primary Color**: `#C41E3A` (Crimson Red)
- **Secondary Color**: `#E87D2B` (Orange)
- **Tagline**: "Han Rishta, Han Ehsaas, Humare Saath..."
- **Sub-tagline**: "Because You Deserve The Best!"
- **Location**: Bajkul, Pin-721655, West Bengal, India

---

© 2025 Apna Bazar. All rights reserved.
