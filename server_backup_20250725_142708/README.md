# Peykan Tourism Ecommerce Platform

A modern, multilingual, multi-currency booking platform built with Django 5 and Next.js 14, following Domain-Driven Design (DDD) principles and Clean Architecture.

## 🎯 MVP Product Flow

The platform implements a complete **Select → Add to Cart → Checkout** flow with the following features:

### 1. Product Selection (`/tours/[slug]`)
- **Slug-based routing** for SEO-friendly URLs
- **Multi-currency pricing** with real-time conversion
- **Variant selection** (different tour packages)
- **Date picker** for availability
- **Options/add-ons** selection
- **Quantity selector**
- **Real-time price calculation**
- **Add to Cart** and **Book Now** buttons

### 2. Shopping Cart (`/cart`)
- **Live cart summary** with multi-currency display
- **Quantity updates** with +/- controls
- **Item removal** and **cart clearing**
- **Product details** including variants, dates, and options
- **Order summary** with total calculation
- **Proceed to Checkout** button

### 3. Checkout Process (`/checkout`)
- **Customer information** form (pre-filled for logged-in users)
- **Billing address** collection
- **Special requests** field
- **Payment method** selection (Credit Card, Bank Transfer, PayPal)
- **Terms and conditions** acceptance
- **Order summary** with real-time currency conversion
- **Order creation** and redirect to payment/confirmation

### 4. Order Confirmation (`/orders/[orderNumber]`)
- **Order details** with status tracking
- **Payment information** and status
- **Customer details** and billing address
- **Order items** with all selections
- **Order summary** with breakdown

## 🏗️ Architecture

### Backend (Django 5 + DRF)
```
backend/
├── core/           # Core domain models (User, Currency, etc.)
├── shared/         # Shared services (CurrencyConverter, etc.)
├── users/          # User management with roles (Guest, Customer, Agent)
├── tours/          # Tour products with variants and options
├── events/         # Event products
├── transfers/      # Transfer products
├── cart/           # Shopping cart with temporary reservations
├── orders/         # Order management
├── payments/       # Payment processing
└── agents/         # Agent-specific functionality
```

### Frontend (Next.js 14 + TypeScript)
```
frontend/
├── app/
│   ├── components/     # Reusable UI components
│   ├── lib/
│   │   ├── api/        # API utilities with type safety
│   │   ├── hooks/      # SWR hooks for data fetching
│   │   └── types/      # TypeScript type definitions
│   ├── i18n/           # Internationalization (EN, FA, TR)
│   ├── tours/[slug]/   # Product detail pages
│   ├── cart/           # Shopping cart
│   ├── checkout/       # Checkout process
│   └── orders/         # Order management
```

## 🚀 Key Features

### ✅ Domain-Driven Design (DDD)
- **Bounded Contexts**: Each app represents a domain boundary
- **Aggregate Roots**: Tour, Order, Cart as main entities
- **Value Objects**: UUID primary keys, slugs, currency codes
- **Domain Services**: Currency conversion, availability checking

### ✅ Multi-Currency Support
- **Real-time conversion** using CurrencyConverterService
- **Currency context** in frontend for user preference
- **Price display** in user's preferred currency
- **Order storage** in original currency with conversion tracking

### ✅ Internationalization (i18n)
- **Three languages**: English, Persian (Farsi), Turkish
- **Slug-based routing** with language prefixes
- **Translated content** for all UI elements
- **RTL support** for Persian language

### ✅ UUID & Slug Implementation
- **UUID primary keys** for all models
- **Slug-based URLs** for SEO and user-friendly navigation
- **Auto-generated slugs** from titles
- **Unique constraints** on slugs within categories

### ✅ Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Role-based access**: Guest, Customer, Agent
- **OTP verification** for secure login
- **Profile management** with extended user data

### ✅ Cart & Order System
- **Temporary reservations** for inventory management
- **Multi-product support**: Tours, Events, Transfers
- **Variant and option selection**
- **Date-based availability**
- **Order status tracking**

## 🛠️ Technology Stack

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Database
- **Redis** - Caching and sessions
- **Celery** - Background tasks
- **Django Modeltranslation** - Multi-language fields
- **Django CORS Headers** - Cross-origin requests

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **SWR** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **next-intl** - Internationalization
- **Lucide React** - Icons

## 📦 Installation & Setup

### Backend Setup
```bash
cd backend
python3 -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install --upgrade pip && pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` files based on `env.example` in the backend directory.

## 🔄 Complete User Flow

1. **Browse Products**: User visits `/tours` to see available tours
2. **Product Detail**: User clicks on a tour to view details at `/tours/[slug]`
3. **Select Options**: User chooses date, variant, options, and quantity
4. **Add to Cart**: User adds product to cart with "Add to Cart" button
5. **Review Cart**: User visits `/cart` to review items and make changes
6. **Checkout**: User proceeds to `/checkout` to complete purchase
7. **Order Confirmation**: User receives order confirmation at `/orders/[orderNumber]`

## 🎨 UI/UX Features

- **Responsive design** for all screen sizes
- **Modern, clean interface** with TailwindCSS
- **Loading states** and error handling
- **Form validation** with real-time feedback
- **Currency switching** without page reload
- **Language switching** with proper RTL support
- **Accessibility** features for screen readers

## 🔒 Security Features

- **JWT authentication** with secure token storage
- **CSRF protection** on all forms
- **Input validation** and sanitization
- **Rate limiting** on API endpoints
- **Secure payment** processing
- **Data encryption** for sensitive information

## 📈 Performance Optimizations

- **SWR caching** for API responses
- **Image optimization** with Next.js
- **Code splitting** and lazy loading
- **Database indexing** on frequently queried fields
- **Redis caching** for expensive operations
- **CDN-ready** static assets

## 🧪 Testing Strategy

- **Unit tests** for domain logic
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Type safety** with TypeScript
- **Linting** and code formatting

## 🚀 Deployment

### Docker Support
```bash
docker-compose up -d
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] SSL certificates installed
- [ ] CDN configured
- [ ] Monitoring and logging setup

## 📝 API Documentation

The API follows RESTful principles with comprehensive endpoints for:
- **Authentication**: Login, register, password reset
- **Products**: Tours, events, transfers with filtering
- **Cart**: Add, update, remove items
- **Orders**: Create, view, update orders
- **Payments**: Process payments and refunds
- **Users**: Profile management and preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following DDD principles
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Peykan Tourism** - Building the future of travel booking with modern technology and user-centric design. 