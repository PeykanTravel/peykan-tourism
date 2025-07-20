# راهنمای کامل راه‌اندازی پروژه Peykan Tourism

## 📋 خلاصه پروژه

پروژه Peykan Tourism یک پلتفرم جامع گردشگری است که شامل:

- **بک‌اند**: Django با معماری DDD
- **فرانت‌اند**: Next.js با TypeScript
- **دیتابیس**: PostgreSQL
- **کش**: Redis
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

## 🚀 راه‌اندازی سریع

### پیش‌نیازها

```bash
# نصب Docker و Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# نصب Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# نصب Python (v3.8+)
sudo apt-get install python3 python3-pip python3-venv
```

### راه‌اندازی کامل

```bash
# کلون کردن پروژه
git clone <repository-url>
cd peykan-tourism

# اجرای اسکریپت deployment کامل
chmod +x deploy-complete.sh
./deploy-complete.sh deploy
```

## 🔧 راه‌اندازی دستی

### مرحله 1: راه‌اندازی بک‌اند

```bash
cd backend

# ایجاد محیط مجازی
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# یا
venv\Scripts\activate  # Windows

# نصب dependencies
pip install -r requirements.txt

# تنظیم متغیرهای محیطی
cp .env.example .env
# ویرایش فایل .env

# اجرای migrations
python manage.py migrate

# ایجاد superuser
python manage.py createsuperuser

# اجرای سرور
python manage.py runserver
```

### مرحله 2: راه‌اندازی فرانت‌اند

```bash
cd frontend

# نصب dependencies
npm install

# تنظیم متغیرهای محیطی
cp .env.example .env.local
# ویرایش فایل .env.local

# رفع خطاهای TypeScript
node scripts/fix-typescript-errors.js

# اجرای سرور توسعه
npm run dev
```

### مرحله 3: راه‌اندازی دیتابیس

```bash
# با Docker
docker-compose up -d postgres redis

# یا نصب مستقیم PostgreSQL و Redis
```

## 🐳 راه‌اندازی با Docker

### Development

```bash
# راه‌اندازی تمام سرویس‌ها
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف سرویس‌ها
docker-compose down
```

### Production

```bash
# راه‌اندازی production
docker-compose -f docker-compose.production.yml up -d

# با Nginx
docker-compose --profile production up -d
```

## 📁 ساختار پروژه

```
peykan-tourism/
├── backend/                 # Django Backend
│   ├── peykan/             # Main Django project
│   ├── users/              # User management
│   ├── tours/              # Tour management
│   ├── events/             # Event management
│   ├── transfers/          # Transfer management
│   ├── cart/               # Shopping cart
│   ├── orders/             # Order management
│   ├── payments/           # Payment processing
│   └── reservations/       # Reservation system
├── frontend/               # Next.js Frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── lib/                # Clean Architecture
│   │   ├── domain/         # Domain layer
│   │   ├── application/    # Application layer
│   │   └── infrastructure/ # Infrastructure layer
│   └── public/             # Static assets
├── nginx/                  # Nginx configuration
├── docker-compose.yml      # Docker services
└── deploy-complete.sh      # Deployment script
```

## 🏗️ معماری

### Backend (Django + DDD)

```
backend/
├── domain/                 # Domain layer
│   ├── entities/           # Domain entities
│   ├── value_objects/      # Value objects
│   └── repositories/       # Repository interfaces
├── application/            # Application layer
│   ├── services/           # Application services
│   └── use_cases/          # Use cases
├── infrastructure/         # Infrastructure layer
│   ├── repositories/       # Repository implementations
│   └── external/           # External services
└── presentation/           # Presentation layer
    ├── api/                # REST API
    └── admin/              # Django admin
```

### Frontend (Next.js + Clean Architecture)

```
frontend/lib/
├── domain/                 # Domain layer
│   ├── entities/           # Domain entities
│   ├── value-objects/      # Value objects
│   └── repositories/       # Repository interfaces
├── application/            # Application layer
│   ├── services/           # Application services
│   ├── hooks/              # React hooks
│   └── stores/             # State management
└── infrastructure/         # Infrastructure layer
    ├── api/                # API client
    ├── repositories/       # Repository implementations
    └── storage/            # Storage implementations
```

## 🔍 تست‌ها

### Backend Tests

```bash
cd backend
source venv/bin/activate

# اجرای تمام تست‌ها
python manage.py test

# تست با coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests

```bash
cd frontend

# تست‌های واحد
npm run test

# تست‌های E2E
npm run test:e2e

# تست performance
npm run test:performance
```

## 🚀 Deployment

### Development

```bash
# راه‌اندازی کامل development
./deploy-complete.sh setup
./deploy-complete.sh build
./deploy-complete.sh deploy
```

### Production

```bash
# تنظیم متغیرهای production
export NODE_ENV=production
export DJANGO_SETTINGS_MODULE=peykan.settings_production

# deployment کامل
./deploy-complete.sh deploy
```

## 📊 Monitoring

### Health Checks

```bash
# بررسی وضعیت سرویس‌ها
./deploy-complete.sh status

# مشاهده لاگ‌ها
./deploy-complete.sh logs
```

### API Documentation

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Health Check**: http://localhost:8000/api/v1/health/

## 🔧 Troubleshooting

### مشکلات رایج

#### 1. خطاهای TypeScript
```bash
cd frontend
node scripts/fix-typescript-errors.js
npm run type-check
```

#### 2. خطاهای Django
```bash
cd backend
python manage.py check
python manage.py migrate
```

#### 3. مشکلات Docker
```bash
# پاک کردن containers
docker-compose down -v

# rebuild images
docker-compose build --no-cache

# راه‌اندازی مجدد
docker-compose up -d
```

#### 4. مشکلات دیتابیس
```bash
# reset database
docker-compose down -v
docker-compose up -d postgres
cd backend
python manage.py migrate
python manage.py createsuperuser
```

## 📞 پشتیبانی

### منابع مفید

- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### تماس

برای پشتیبانی و سوالات:
- Email: support@peykantravelistanbul.com
- Documentation: `/docs` directory
- Issues: GitHub Issues

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Django backend با معماری DDD
- ✅ Next.js frontend با Clean Architecture
- ✅ Docker containerization
- ✅ PostgreSQL database
- ✅ Redis caching
- ✅ Nginx reverse proxy
- ✅ Multi-language support (FA/EN/TR)
- ✅ Complete deployment automation

### Roadmap
- [ ] Performance optimization
- [ ] Advanced caching strategies
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Advanced analytics
- [ ] Mobile app 