# راهنمای توسعه و استقرار پروژه Peykan Tourism

## 📋 فهرست مطالب
- [تنظیمات محیط توسعه](#تنظیمات-محیط-توسعه)
- [راه‌اندازی محیط توسعه](#راه‌اندازی-محیط-توسعه)
- [گردش کار توسعه محلی](#گردش-کار-توسعه-محلی)
- [استفاده از Docker](#استفاده-از-docker)
- [استقرار در تولید](#استقرار-در-تولید)
- [بهترین شیوه‌های امنیتی](#بهترین-شیوه‌های-امنیتی)
- [عیب‌یابی و رفع مشکل](#عیب‌یابی-و-رفع-مشکل)
- [نظارت و مانیتورینگ](#نظارت-و-مانیتورینگ)
- [به‌روزرسانی پروژه](#به‌روزرسانی-پروژه)

## 🔧 تنظیمات محیط توسعه

### ⚠️ نکات مهم برای توسعه

#### 1. تنظیمات API در فرانت‌اند
**مشکل رایج**: درخواست‌ها به سرور production به جای localhost می‌روند.

**راه‌حل**:
```bash
# در پوشه frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > .env.local
echo NEXT_PUBLIC_SITE_URL=http://localhost:3000 >> .env.local
echo NODE_ENV=development >> .env.local
```

**فایل‌های مهم**:
- `frontend/lib/api/client.ts` - تنظیمات axios
- `frontend/next.config.js` - تنظیمات rewrites
- `frontend/.env.local` - متغیرهای محیطی

#### 2. تنظیمات بک‌اند
```bash
# در پوشه backend
cp env.development .env
```

**تنظیمات مهم در `.env`**:
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

#### 3. تنظیمات CORS
در `backend/peykan/settings.py`:
```python
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', 
    default='http://localhost:3000,http://127.0.0.1:3000,https://peykantravelistanbul.com,https://www.peykantravelistanbul.com', 
    cast=Csv())
```

#### 4. تنظیمات کامنت شده
برخی تنظیمات برای توسعه راحت‌تر غیرفعال شده‌اند:

**Security Middleware** (در `backend/peykan/settings.py`):
```python
# 'django.middleware.security.SecurityMiddleware',  # Temporarily disabled
# 'whitenoise.middleware.WhiteNoiseMiddleware',  # Temporarily disabled
# 'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Temporarily disabled
```
**دلیل**: برای توسعه راحت‌تر (بدون HTTPS redirects)

**ViewSets** (در `backend/users/urls.py`):
```python
# API Router - Commented out until ViewSets are implemented
```
**دلیل**: ViewSets هنوز پیاده‌سازی نشده‌اند

**Active Filter** (در `backend/tours/views.py`):
```python
queryset = Tour.objects.all()  # Remove is_active filter temporarily
```
**دلیل**: نمایش همه تورها برای تست

**نکته**: این تنظیمات در production باید فعال شوند.

### 🔍 عیب‌یابی مشکلات رایج

#### مشکل: درخواست‌ها به production می‌روند
**علت**: تنظیمات API در فرانت‌اند
**راه‌حل**:
1. فایل `.env.local` در فرانت‌اند بسازید
2. سرور Next.js را ری‌استارت کنید
3. کش مرورگر را پاک کنید

#### مشکل: خطای CORS
**علت**: تنظیمات CORS در بک‌اند
**راه‌حل**: مطمئن شوید `localhost:3000` در `CORS_ALLOWED_ORIGINS` باشد

#### مشکل: OTP ارسال نمی‌شود
**علت**: تنظیمات ایمیل/SMS
**راه‌حل**: در development، OTP در کنسول نمایش داده می‌شود

### 🧪 تست محیط توسعه

#### ایجاد یوزر تستی
```bash
cd backend
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_user(username='testuser', email='testuser@example.com', password='Test@123456')"
```

#### تست API
```bash
# تست لاگین
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123456"}'
```

## 🚀 راه‌اندازی محیط توسعه

### پیش‌نیازها
- **Git** - برای کنترل نسخه
- **Docker & Docker Compose** - برای محیط توسعه یکپارچه
- **Node.js 18+** - برای توسعه فرانت‌اند
- **Python 3.11+** - برای توسعه بک‌اند
- **PostgreSQL** - پایگاه داده (اختیاری، Docker توصیه می‌شود)

### راه‌اندازی سریع با اسکریپت
```bash
# Windows PowerShell
.\setup-dev.ps1

# Linux/Mac
./setup-dev.sh
```

### راه‌اندازی دستی

#### 1. کلون کردن مخزن
```bash
git clone https://github.com/PeykanTravel/peykan-tourism.git
cd peykan-tourism
```

#### 2. راه‌اندازی بک‌اند
```bash
cd backend
python -m venv venv

# فعال‌سازی محیط مجازی
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
cp env.development .env
# ویرایش فایل .env با مقادیر مناسب
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
python manage.py runserver
```

#### 3. راه‌اندازی فرانت‌اند
```bash
cd frontend
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 > .env.local
echo NEXT_PUBLIC_SITE_URL=http://localhost:3000 >> .env.local
echo NODE_ENV=development >> .env.local
npm run dev
```

### راه‌اندازی سریع لوکال (ویندوز/لینوکس)

1. **PostgreSQL را نصب کنید** و یک دیتابیس با نام `peykan_tourism` بسازید (مثلاً با pgAdmin یا دستور SQL).
2. فایل `backend/env.development` را به `backend/.env` کپی کنید (مقادیر پیش‌فرض برای لوکال آماده است).
3. مطمئن شوید فایل `.env` با encoding UTF-8 ذخیره شده باشد.
4. محیط مجازی را فعال کنید و پکیج‌ها را نصب کنید:
   ```sh
   cd backend
   python -m venv venv
   venv\Scripts\activate  # ویندوز
   # یا
   source venv/bin/activate  # لینوکس/مک
   pip install -r requirements.txt
   # اگر خطای psycopg2-binary داشتید:
   pip install psycopg2-binary
   ```
5. مهاجرت دیتابیس:
   ```sh
   python manage.py migrate
   ```
6. ایجاد یوزر تستی:
   ```sh
   python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_user(username='testuser', email='testuser@example.com', password='Test@123456')"
   ```
7. اجرای سرور:
   ```sh
   python manage.py runserver
   ```

> **نکته مهم:**
> - اگر با خطای encoding یا psycopg2 مواجه شدید، راهنما را در بخش FAQ و پایین همین فایل ببینید.
> - فقط کافیست PostgreSQL نصب باشد و دیتابیس ساخته شود. نیازی به تغییر دیگر نیست.
> - **همیشه از localhost URLs برای توسعه استفاده کنید، نه production URLs.**

## 🔄 گردش کار توسعه محلی

### 1. ایجاد شاخه جدید
```bash
git checkout main
git pull origin main
git checkout -b feature/نام-ویژگی-جدید
# یا
git checkout -b fix/نام-مشکل
```

### 2. توسعه و تست
```bash
# اجرای تست‌ها
# بک‌اند
python manage.py test

# فرانت‌اند
npm run test
npm run lint
```

### 3. کامیت و پوش
```bash
git add .
git commit -m "feat: اضافه کردن ویژگی جدید"
git push origin feature/نام-ویژگی-جدید
```

### 4. ایجاد Pull Request
- به GitHub بروید
- Pull Request جدید ایجاد کنید
- توضیحات کامل بنویسید
- Reviewers اضافه کنید

## 🐳 استفاده از Docker

### مزایای Docker
- **محیط یکسان**: همه توسعه‌دهندگان محیط مشابه دارند
- **ایزولاسیون**: هر سرویس در کانتینر جداگانه
- **مدیریت آسان**: راه‌اندازی و توقف سریع
- **تولید مشابه**: محیط توسعه شبیه تولید

### دستورات مفید Docker
```bash
# راه‌اندازی تمام سرویس‌ها
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# مشاهده لاگ سرویس خاص
docker-compose logs -f backend

# اجرای دستور در کانتینر
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run build

# توقف سرویس‌ها
docker-compose down

# توقف و حذف volume ها
docker-compose down -v

# rebuild کردن image ها
docker-compose build --no-cache
```

### تنظیمات محیط توسعه
```bash
# فایل docker-compose.override.yml برای توسعه
version: '3.8'
services:
  backend:
    environment:
      - DEBUG=True
    volumes:
      - ./backend:/app
    command: python manage.py runserver 0.0.0.0:8000

  frontend:
    environment:
      - NODE_ENV=development
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev
```

## 🚀 استقرار در تولید

### پیش‌نیازهای سرور
- **Ubuntu 20.04+** یا **CentOS 8+**
- **Docker & Docker Compose**
- **Nginx** (اختیاری، برای SSL termination)
- **SSL Certificate** (Let's Encrypt)

### مراحل استقرار

#### 1. آماده‌سازی سرور
```bash
# نصب Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# نصب Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. کلون کردن پروژه
```bash
git clone https://github.com/PeykanTravel/peykan-tourism.git
cd peykan-tourism
```

#### 3. تنظیم متغیرهای محیطی
```bash
# کپی کردن فایل‌های محیطی
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env.local

# ویرایش فایل‌ها با مقادیر تولید
nano backend/.env
nano frontend/.env.local
```

#### 4. استقرار
```bash
# راه‌اندازی سرویس‌ها
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d

# اجرای migration ها
docker-compose exec backend python manage.py migrate

# جمع‌آوری فایل‌های استاتیک
docker-compose exec backend python manage.py collectstatic --noinput

# ایجاد superuser
docker-compose exec backend python manage.py createsuperuser
```

### به‌روزرسانی در تولید
```bash
# کشیدن تغییرات جدید
git pull origin main

# rebuild کردن image ها
docker-compose -f docker-compose.yml -f docker-compose.production.yml build

# راه‌اندازی مجدد سرویس‌ها
docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d

# اجرای migration ها
docker-compose exec backend python manage.py migrate
```

## 🔒 بهترین شیوه‌های امنیتی

### متغیرهای محیطی
- **هرگز** کلیدهای امنیتی را در کد قرار ندهید
- از فایل‌های `.env` استفاده کنید
- فایل‌های `.env` را در `.gitignore` قرار دهید

### پایگاه داده
- از رمزهای قوی استفاده کنید
- دسترسی‌های محدود تنظیم کنید
- backup منظم انجام دهید

### SSL/TLS
- همیشه از HTTPS استفاده کنید
- گواهینامه SSL معتبر نصب کنید
- HSTS header تنظیم کنید

### احراز هویت
- از JWT با زمان انقضای کوتاه استفاده کنید
- Refresh token ها را امن نگه دارید
- Rate limiting پیاده‌سازی کنید

## 🐛 عیب‌یابی و رفع مشکل

### مشکلات رایج

#### 1. مشکل اتصال به پایگاه داده
```bash
# بررسی وضعیت PostgreSQL
docker-compose ps postgres
docker-compose logs postgres

# تست اتصال
docker-compose exec backend python manage.py dbshell
```

#### 2. مشکل Redis
```bash
# بررسی وضعیت Redis
docker-compose ps redis
docker-compose logs redis

# تست اتصال
docker-compose exec redis redis-cli ping
```

#### 3. مشکل CORS
```bash
# بررسی تنظیمات CORS در backend/.env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### 4. مشکل فایل‌های استاتیک
```bash
# جمع‌آوری مجدد فایل‌های استاتیک
docker-compose exec backend python manage.py collectstatic --noinput --clear
```

### لاگ‌ها و مانیتورینگ
```bash
# مشاهده لاگ‌های تمام سرویس‌ها
docker-compose logs -f

# مشاهده لاگ سرویس خاص
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# بررسی استفاده از منابع
docker stats
```

## 📊 نظارت و مانیتورینگ

### نظارت بر سرویس‌ها
```bash
# بررسی وضعیت سرویس‌ها
docker-compose ps

# بررسی سلامت سرویس‌ها
docker-compose exec backend python manage.py check
```

### نظارت بر پایگاه داده
```bash
# بررسی اندازه پایگاه داده
docker-compose exec postgres psql -U peykan_user -d peykan -c "SELECT pg_size_pretty(pg_database_size('peykan'));"

# بررسی اتصالات فعال
docker-compose exec postgres psql -U peykan_user -d peykan -c "SELECT count(*) FROM pg_stat_activity;"
```

### نظارت بر عملکرد
- از **Django Debug Toolbar** در توسعه استفاده کنید
- از **Django Silk** برای profiling استفاده کنید
- از **Prometheus + Grafana** برای مانیتورینگ تولید استفاده کنید

## 🔄 به‌روزرسانی پروژه

### به‌روزرسانی Dependencies
```bash
# بک‌اند
cd backend
pip install --upgrade -r requirements.txt
pip freeze > requirements.txt

# فرانت‌اند
cd frontend
npm update
npm audit fix
```

### به‌روزرسانی Docker Images
```bash
# به‌روزرسانی image های پایه
docker-compose pull
docker-compose build --no-cache
```

### به‌روزرسانی کد
```bash
# کشیدن تغییرات جدید
git pull origin main

# بررسی تغییرات
git log --oneline -10

# تست تغییرات
docker-compose exec backend python manage.py test
npm run test
```

## 📚 منابع مفید

### مستندات رسمی
- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### ابزارهای مفید
- **Postman** - تست API
- **pgAdmin** - مدیریت پایگاه داده
- **Redis Commander** - مدیریت Redis
- **Docker Desktop** - مدیریت کانتینرها

### بهترین شیوه‌ها
- **12 Factor App** - اصول توسعه اپلیکیشن
- **Git Flow** - گردش کار Git
- **Semantic Versioning** - نسخه‌گذاری معنایی
- **Conventional Commits** - استاندارد کامیت‌ها

---

## 🤝 پشتیبانی

اگر سوال یا مشکلی دارید:
1. ابتدا این راهنما را مطالعه کنید
2. در Issues گیت‌هاب جستجو کنید
3. Issue جدید ایجاد کنید
4. با تیم توسعه تماس بگیرید

**تیم توسعه Peykan Tourism**
- ایمیل: dev@peykantravelistanbul.com
- تلگرام: @PeykanDev
- گیت‌هاب: [PeykanTravel/peykan-tourism](https://github.com/PeykanTravel/peykan-tourism) 