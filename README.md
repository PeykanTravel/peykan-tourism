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

### 🔧 Environment Configuration

#### Backend Environment Setup
1. **Copy environment file:**
   ```bash
   cd backend
   cp env.development .env
   ```

2. **Environment variables for development:**
   ```env
   # Django Settings
   DEBUG=True
   SECRET_KEY=dev-secret-key-change-in-production
   ALLOWED_HOSTS=localhost,127.0.0.1

   # Database - SQLite for development
   DATABASE_URL=sqlite:///db.sqlite3

   # Email Configuration - Console backend for development
   EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
   EMAIL_HOST=localhost
   EMAIL_PORT=1025
   EMAIL_USE_TLS=False
   DEFAULT_FROM_EMAIL=noreply@peykantravelistanbul.com

   # Kavenegar SMS - Mock for development
   KAVENEGAR_API_KEY=mock-api-key-for-development

   # JWT Settings
   JWT_SECRET_KEY=dev-jwt-secret-key
   JWT_ACCESS_TOKEN_LIFETIME=30
   JWT_REFRESH_TOKEN_LIFETIME=1440
   ```

#### Frontend Environment Setup
1. **Create environment file:**
   ```bash
   cd frontend
   echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > .env.local
   echo NEXT_PUBLIC_SITE_URL=http://localhost:3000 >> .env.local
   echo NODE_ENV=development >> .env.local
   ```

2. **Important:** The frontend must be configured to use localhost for development, not production URLs.

### 🚀 Quick Local Setup (Windows/Linux)

1. **Install PostgreSQL** and create a database named `peykan_tourism` (using pgAdmin or SQL command).
2. Copy `backend/env.development` to `backend/.env` (default values for local are ready).
3. Make sure the `.env` file is saved with UTF-8 encoding.
4. Activate virtual environment and install packages:
   ```sh
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   pip install -r requirements.txt
   # If you get psycopg2-binary error:
   pip install psycopg2-binary
   ```
5. Database migration:
   ```sh
   python manage.py migrate
   ```
6. Create test user:
   ```sh
   python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_user(username='testuser', email='testuser@example.com', password='Test@123456')"
   ```
7. Run server:
   ```sh
   python manage.py runserver
   ```

8. **Frontend setup:**
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

> **Important Notes:**
> - If you encounter encoding or psycopg2 errors, see the FAQ and DEVELOPMENT_GUIDE.md sections.
> - You only need PostgreSQL installed and database created. No other changes needed.
> - **Always use localhost URLs for development, not production URLs.**

### Docker Setup
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Development Configuration

### API Configuration
- **Development**: All API calls go to `http://localhost:8000/api/v1`
- **Production**: API calls go to `https://peykantravelistanbul.com/api/v1`
- **Environment switching**: Controlled by `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### CORS Settings
- **Development**: Allows `http://localhost:3000` and `http://127.0.0.1:3000`
- **Production**: Allows production domains
- **Configuration**: In `backend/peykan/settings.py`

### OTP Configuration
- **Email OTP**: Uses console backend in development (prints to terminal)
- **SMS OTP**: Uses mock service in development
- **Production**: Configure real email/SMS services

### Commented Settings
Some settings are temporarily commented for development ease:

1. **Security Middleware** (in `backend/peykan/settings.py`):
   ```python
   # 'django.middleware.security.SecurityMiddleware',  # Temporarily disabled
   # 'whitenoise.middleware.WhiteNoiseMiddleware',  # Temporarily disabled
   # 'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Temporarily disabled
   ```
   **Reason**: Disabled for easier development (no HTTPS redirects)

2. **ViewSets** (in `backend/users/urls.py`):
   ```python
   # API Router - Commented out until ViewSets are implemented
   ```
   **Reason**: ViewSets not yet implemented, using regular API Views

3. **Active Filter** (in `backend/tours/views.py`):
   ```python
   queryset = Tour.objects.all()  # Remove is_active filter temporarily
   ```
   **Reason**: Shows all tours for testing, including inactive ones

**Note**: These should be enabled in production for security and proper functionality.

## 📚 Documentation

### 🚀 Quick Start
- **[setup-dev.sh](setup-dev.sh)** - اسکریپت راه‌اندازی خودکار (Linux/Mac)
- **[setup-dev.ps1](setup-dev.ps1)** - اسکریپت راه‌اندازی خودکار (Windows)

### 📖 Development Guides
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - راهنمای کامل توسعه و استقرار
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - راهنمای مشارکت در پروژه
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - چک‌لیست استقرار تولید

### 📋 Additional Documentation
- **[CHANGELOG.md](CHANGELOG.md)** - تاریخچه تغییرات پروژه
- **[frontend/DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md)** - راهنمای Design System

## 🎨 Design System

این پروژه از یک Design System منسجم استفاده می‌کند که شامل:

- **کامپوننت‌های پایه**: Button, Card, Input, Loading
- **سیستم رنگ‌بندی**: Primary, Secondary, Semantic colors
- **تایپوگرافی**: Font families, sizes, weights
- **فاصله‌گذاری**: 4px grid system
- **ریسپانسیو**: Mobile-first approach

برای اطلاعات بیشتر، فایل `frontend/DESIGN_SYSTEM.md` را مطالعه کنید.
- **[CONTRIBUTORS.md](CONTRIBUTORS.md)** - لیست مشارکت‌کنندگان
- **[SECURITY.md](SECURITY.md)** - سیاست‌های امنیتی
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - قوانین رفتار
- **[SUPPORT.md](SUPPORT.md)** - راهنمای پشتیبانی

## 🚀 Deployment

### Production Deployment
```bash
# Deploy to production server
./deploy.sh

# Or manually:
git pull origin main
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

### Docker Commands
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service_name]

# Execute commands in containers
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run build

# Stop and remove containers
docker-compose down -v
```

## 🔄 Complete User Flow

1. **Browse Products**: User visits `/tours` to see available tours
2. **Product Detail**: User clicks on a tour to view details at `/tours/[slug]`
3. **Select Options**: User chooses date, variant, options, and quantity
4. **Add to Cart**: User adds product to cart with "Add to Cart" button
5. **Review Cart**: User visits `/cart` to review items and make changes
6. **Checkout**: User proceeds to `/checkout` to complete purchase
7. **Order Confirmation**: User receives order confirmation at `/orders/[orderNumber]` 