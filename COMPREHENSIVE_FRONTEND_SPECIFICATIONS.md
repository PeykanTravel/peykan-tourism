# 🎯 **استخراج کامل مشخصات عملکردی و ساختاری پروژه برای طراحی و توسعه Frontend**

## 📋 **خلاصه اجرایی**

پروژه **Peykan Tourism** یک پلتفرم جامع رزرو توریستی است که از معماری **Domain-Driven Design (DDD)** و **Clean Architecture** پیروی می‌کند. این سیستم از **3 نوع محصول** (تور، ایونت، ترانسفر)، **4 نقش کاربری** (مهمان، مشتری، ایجنت، ادمین)، **3 زبان** (فارسی، انگلیسی، ترکی) و **4 ارز** (USD, EUR, TRY, IRR) پشتیبانی می‌کند.

---

## 1. 📌 **Use Cases کامل به تفکیک نقش‌ها و ویژگی‌ها**

### 🎫 **کاربر مهمان (Guest User)**

#### **مشاهده محصولات و جستجو**
- **Actor**: کاربر مهمان
- **Steps**: 
  1. ورود به سایت بدون ثبت‌نام
  2. مشاهده لیست تورها، ایونت‌ها و ترانسفرها
  3. استفاده از فیلترها (قیمت، تاریخ، مکان، نوع)
  4. جستجو در محصولات
  5. مشاهده جزئیات محصول
- **شرط‌ها**: بدون نیاز به احراز هویت
- **API‌ها**: 
  - `GET /api/v1/tours/` - لیست تورها
  - `GET /api/v1/events/` - لیست ایونت‌ها  
  - `GET /api/v1/transfers/` - لیست ترانسفرها
  - `GET /api/v1/search/` - جستجوی عمومی

#### **مشاهده قیمت‌ها و ارز پیش‌فرض**
- **Actor**: کاربر مهمان
- **Steps**:
  1. انتخاب ارز از منوی ارز
  2. مشاهده قیمت‌ها در ارز انتخابی
  3. تبدیل خودکار قیمت‌ها
- **شرط‌ها**: ارز پیش‌فرض USD
- **API‌ها**:
  - `GET /api/v1/currencies/` - لیست ارزها
  - `GET /api/v1/currencies/rates/` - نرخ تبدیل

#### **اضافه به سبد خرید (Session-based)**
- **Actor**: کاربر مهمان
- **Steps**:
  1. انتخاب محصول و گزینه‌ها
  2. کلیک روی "افزودن به سبد"
  3. ذخیره در session storage
  4. نمایش تعداد آیتم‌ها در navbar
- **شرط‌ها**: سبد در session ذخیره می‌شود
- **API‌ها**:
  - `POST /api/v1/cart/add/` - افزودن به سبد
  - `GET /api/v1/cart/` - مشاهده سبد

#### **مشاهده اسلایدرها و پیشنهادها**
- **Actor**: کاربر مهمان
- **Steps**:
  1. مشاهده اسلایدر محصولات ویژه
  2. مشاهده پیشنهادات بر اساس محبوبیت
  3. مشاهده محصولات جدید
- **API‌ها**:
  - `GET /api/v1/tours/featured/` - تورهای ویژه
  - `GET /api/v1/events/featured/` - ایونت‌های ویژه

### 👤 **کاربر لاگین‌شده (Customer User)**

#### **احراز هویت و ثبت‌نام**
- **Actor**: کاربر جدید
- **Steps**:
  1. پر کردن فرم ثبت‌نام
  2. دریافت OTP در ایمیل/پیامک
  3. تأیید OTP
  4. فعال‌سازی حساب
  5. ورود به سیستم
- **شرط‌ها**: تأیید ایمیل/تلفن الزامی
- **API‌ها**:
  - `POST /api/v1/auth/register/` - ثبت‌نام
  - `POST /api/v1/auth/verify-email/` - تأیید ایمیل
  - `POST /api/v1/auth/login/` - ورود

#### **رزرو و پرداخت با اطلاعات کاربری**
- **Actor**: کاربر لاگین‌شده
- **Steps**:
  1. انتخاب محصولات از سبد
  2. تکمیل اطلاعات مسافر
  3. انتخاب روش پرداخت
  4. تأیید سفارش
  5. پرداخت
- **شرط‌ها**: اطلاعات کاربر از پروفایل پر می‌شود
- **API‌ها**:
  - `POST /api/v1/orders/` - ایجاد سفارش
  - `POST /api/v1/payments/process/` - پردازش پرداخت

#### **تاریخچه سفارش‌ها و مدیریت پروفایل**
- **Actor**: کاربر لاگین‌شده
- **Steps**:
  1. مشاهده تاریخچه سفارش‌ها
  2. ویرایش اطلاعات پروفایل
  3. تغییر زبان و ارز ترجیحی
  4. تغییر رمز عبور
- **API‌ها**:
  - `GET /api/v1/orders/` - لیست سفارش‌ها
  - `PUT /api/v1/users/profile/` - بروزرسانی پروفایل

#### **تخفیف‌های شخصی‌سازی‌شده**
- **Actor**: کاربر لاگین‌شده
- **Steps**:
  1. دریافت کد تخفیف
  2. اعمال کد در سبد خرید
  3. مشاهده تخفیف اعمال شده
- **API‌ها**:
  - `POST /api/v1/cart/apply-discount/` - اعمال تخفیف

#### **مدیریت سبد خرید**
- **Actor**: کاربر لاگین‌شده
- **Steps**:
  1. مشاهده آیتم‌های سبد
  2. تغییر تعداد/گزینه‌ها
  3. حذف آیتم‌ها
  4. خالی کردن سبد
- **API‌ها**:
  - `PUT /api/v1/cart/items/{id}/` - بروزرسانی آیتم
  - `DELETE /api/v1/cart/items/{id}/` - حذف آیتم
  - `DELETE /api/v1/cart/clear/` - خالی کردن سبد

### 🧑‍💼 **ایجنت فروش (Agent User)**

#### **ورود با نقش Agent**
- **Actor**: ایجنت
- **Steps**:
  1. ورود با کد ایجنت
  2. دسترسی به پنل مخصوص ایجنت
  3. مشاهده قیمت‌های اختصاصی
- **شرط‌ها**: نقش agent در سیستم
- **API‌ها**:
  - `POST /api/v1/auth/login/` - ورود ایجنت

#### **ساخت کاربر و سفارش آفلاین**
- **Actor**: ایجنت
- **Steps**:
  1. ایجاد کاربر جدید برای مشتری
  2. انتخاب محصولات
  3. ایجاد سفارش آفلاین
  4. ثبت اطلاعات پرداخت
- **API‌ها**:
  - `POST /api/v1/users/create-customer/` - ایجاد مشتری
  - `POST /api/v1/orders/offline/` - سفارش آفلاین

#### **دسترسی به قیمت‌های اختصاصی**
- **Actor**: ایجنت
- **Steps**:
  1. مشاهده قیمت‌های ویژه ایجنت
  2. محاسبه کمیسیون
  3. اعمال تخفیف‌های ویژه
- **API‌ها**:
  - `GET /api/v1/agent/pricing/` - قیمت‌های ایجنت

#### **ایجاد سفارش‌های ترکیبی**
- **Actor**: ایجنت
- **Steps**:
  1. انتخاب ترکیب تور + ترانسفر + ایونت
  2. محاسبه قیمت کل
  3. اعمال تخفیف ترکیبی
  4. ایجاد سفارش
- **API‌ها**:
  - `POST /api/v1/orders/combo/` - سفارش ترکیبی

### 🧑‍💻 **ادمین (Admin User)**

#### **بررسی، تأیید یا لغو سفارش**
- **Actor**: ادمین
- **Steps**:
  1. مشاهده لیست سفارش‌ها
  2. بررسی جزئیات سفارش
  3. تأیید یا لغو سفارش
  4. ارسال اعلان به مشتری
- **API‌ها**:
  - `PUT /api/v1/orders/{id}/status/` - تغییر وضعیت سفارش

#### **تنظیمات تخفیف، نرخ ارز، زبان و محتوا**
- **Actor**: ادمین
- **Steps**:
  1. مدیریت کدهای تخفیف
  2. تنظیم نرخ ارز
  3. مدیریت محتوای چندزبانه
  4. تنظیمات سیستم
- **API‌ها**:
  - `POST /api/v1/admin/discounts/` - مدیریت تخفیف‌ها
  - `PUT /api/v1/admin/currency-rates/` - تنظیم نرخ ارز

#### **گزارش‌گیری**
- **Actor**: ادمین
- **Steps**:
  1. مشاهده آمار فروش
  2. گزارش‌های مالی
  3. آمار کاربران
  4. گزارش‌های عملکرد
- **API‌ها**:
  - `GET /api/v1/analytics/` - گزارش‌های تحلیلی

---

## 2. 🔍 **ساختار محصولات و روابط آن‌ها**

### **🏛️ تور (Tour)**

#### **فیلدهای اصلی:**
```typescript
interface Tour {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: TourCategory;
  location: string;
  duration_hours: number;
  max_participants: number;
  base_price: number;
  currency: string;
  images: Image[];
  variants: TourVariant[];
  options: TourOption[];
  schedules: TourSchedule[];
}
```

#### **فیلدهای خاص تور:**
- `tour_type`: 'day' | 'night'
- `transport_type`: 'boat' | 'land' | 'air'
- `pickup_time`: Time
- `start_time`: Time
- `end_time`: Time
- `min_participants`: number

#### **منطق رزرو:**
- **ظرفیت**: بر اساس `TourSchedule` و `max_participants`
- **قیمت**: `base_price` + `variant_price` + `options_price`
- **شرکت‌کنندگان**: `adult_count`, `child_count`, `infant_count`
- **تاریخ**: بر اساس `TourSchedule` موجود

#### **روابط:**
- `TourCategory` (ForeignKey)
- `TourVariant` (OneToMany)
- `TourSchedule` (OneToMany)
- `TourOption` (OneToMany)
- `TourPricing` (OneToMany)

### **🎫 ایونت (Event)**

#### **فیلدهای اصلی:**
```typescript
interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: Venue;
  artist: Artist;
  base_price: number;
  currency: string;
  images: Image[];
  performances: EventPerformance[];
  sections: EventSection[];
  ticket_types: TicketType[];
}
```

#### **فیلدهای خاص ایونت:**
- `event_type`: 'concert' | 'theater' | 'festival'
- `age_restriction`: number
- `duration_minutes`: number
- `is_seated`: boolean

#### **منطق رزرو:**
- **ظرفیت**: بر اساس `EventSection` و `Seat` موجود
- **قیمت**: `section_price` + `ticket_type_modifier` + `options_price`
- **صندلی**: انتخاب صندلی خاص
- **تاریخ**: بر اساس `EventPerformance`

#### **روابط:**
- `EventCategory` (ForeignKey)
- `Venue` (ForeignKey)
- `Artist` (ForeignKey)
- `EventPerformance` (OneToMany)
- `EventSection` (OneToMany)
- `TicketType` (OneToMany)

### **🚗 ترانسفر (Transfer)**

#### **فیلدهای اصلی:**
```typescript
interface TransferRoute {
  id: string;
  slug: string;
  from_location: string;
  to_location: string;
  vehicle_types: VehicleType[];
  base_price: number;
  currency: string;
  options: TransferOption[];
  pricing: TransferRoutePricing[];
}
```

#### **فیلدهای خاص ترانسفر:**
- `trip_type`: 'one_way' | 'round_trip'
- `passenger_capacity`: number
- `luggage_capacity`: number
- `round_trip_discount_enabled`: boolean
- `round_trip_discount_percentage`: number

#### **منطق رزرو:**
- **ظرفیت**: بر اساس `vehicle_type` و `passenger_capacity`
- **قیمت**: `base_price` + `time_surcharge` + `options_price` - `round_trip_discount`
- **مسافرین**: تعداد مسافر و چمدان
- **زمان**: بر اساس زمان انتخاب شده

#### **روابط:**
- `TransferRoutePricing` (OneToMany)
- `TransferOption` (OneToMany)
- `VehicleType` (ManyToMany)

---

## 3. 🛒 **سبد خرید**

### **نوع محصولات قابل اضافه شدن:**
```typescript
type ProductType = 'tour' | 'event' | 'transfer';

interface CartItem {
  id: string;
  product_type: ProductType;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  
  // Product-specific data
  variant_id?: string;
  participants?: Record<string, number>; // For tours
  selected_seats?: SeatInfo[]; // For events
  trip_type?: string; // For transfers
}
```

### **ساختار سبد در پایگاه داده:**
```sql
-- Cart table
CREATE TABLE cart_cart (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users_user(id),
    session_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- CartItem table
CREATE TABLE cart_cartitem (
    id UUID PRIMARY KEY,
    cart_id UUID REFERENCES cart_cart(id),
    product_type VARCHAR(20),
    product_id UUID,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    currency VARCHAR(3),
    booking_data JSONB
);
```

### **محاسبه قیمت نهایی:**
```typescript
interface CartCalculation {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  breakdown: {
    items: CartItemBreakdown[];
    taxes: TaxBreakdown[];
    discounts: DiscountBreakdown[];
  };
}
```

### **مکانیزم ذخیره‌سازی:**
- **Session Storage**: برای کاربران مهمان
- **Database**: برای کاربران لاگین‌شده
- **Local Storage**: برای تنظیمات کاربر
- **Cookie**: برای session management

### **API‌های مربوط به سبد:**
- `GET /api/v1/cart/` - مشاهده سبد
- `POST /api/v1/cart/add/` - افزودن به سبد
- `PUT /api/v1/cart/items/{id}/` - بروزرسانی آیتم
- `DELETE /api/v1/cart/items/{id}/` - حذف آیتم
- `DELETE /api/v1/cart/clear/` - خالی کردن سبد
- `POST /api/v1/cart/apply-discount/` - اعمال تخفیف

---

## 4. 💸 **قیمت‌گذاری، ارز، تخفیف**

### **ساختار مدل قیمت:**
```typescript
interface PricingModel {
  base_price: number;
  variant_price?: number;
  options_price: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  
  // Dynamic pricing
  time_based_surcharge?: number;
  capacity_based_discount?: number;
  role_based_discount?: number;
}
```

### **مکانیزم انتخاب و تبدیل ارز:**
```typescript
interface CurrencyService {
  supportedCurrencies: CurrencyCode[];
  defaultCurrency: CurrencyCode;
  exchangeRates: Record<CurrencyCode, number>;
  
  convert(amount: number, from: CurrencyCode, to: CurrencyCode): number;
  format(amount: number, currency: CurrencyCode): string;
}
```

### **تخفیف‌ها:**
```typescript
interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  min_amount?: number;
  max_discount?: number;
  valid_from: Date;
  valid_until: Date;
  max_uses?: number;
  current_uses: number;
  applicable_products: ProductType[];
  applicable_roles: UserRole[];
}
```

### **ارسال قیمت نهایی به فرانت:**
```typescript
interface PriceResponse {
  base_price: number;
  final_price: number;
  currency: string;
  converted_price?: number;
  converted_currency?: string;
  breakdown: PriceBreakdown;
  applied_discounts: Discount[];
  taxes: Tax[];
}
```

---

## 5. 🌐 **چند زبانی و چند ارزی**

### **زبان‌ها و ارزهای پشتیبانی‌شده:**
```typescript
const SUPPORTED_LANGUAGES = {
  fa: { name: 'Persian', nativeName: 'فارسی', direction: 'rtl' },
  en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr' }
};

const SUPPORTED_CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { name: 'Euro', symbol: '€', locale: 'de-DE' },
  TRY: { name: 'Turkish Lira', symbol: '₺', locale: 'tr-TR' },
  IRR: { name: 'Iranian Rial', symbol: 'ریال', locale: 'fa-IR' }
};
```

### **محل ذخیره‌سازی انتخاب زبان/ارز:**
- **LocalStorage**: `preferred_language`, `preferred_currency`
- **Session**: برای session-based preferences
- **Database**: برای کاربران لاگین‌شده
- **Header**: `Accept-Language` header

### **API‌های چندزبانه/چندارزی:**
```typescript
// Language APIs
GET /api/v1/languages/ - لیست زبان‌ها
PUT /api/v1/users/preferences/language - تغییر زبان

// Currency APIs  
GET /api/v1/currencies/ - لیست ارزها
GET /api/v1/currencies/rates/ - نرخ تبدیل
PUT /api/v1/users/preferences/currency - تغییر ارز
```

### **مکانیزم ترجمه فیلدهای dynamic:**
```typescript
// Backend (Django Parler)
class Tour(BaseTranslatableModel):
    translations = TranslatedFields(
        title=models.CharField(max_length=255),
        description=models.TextField(),
        highlights=models.TextField()
    )

// Frontend (next-intl)
const t = useTranslations('tours');
const title = t('title', { tour: tourData });
```

---

## 6. 🔐 **احراز هویت، نقش‌ها و سطح دسترسی**

### **روش احراز هویت:**
```typescript
interface AuthSystem {
  method: 'JWT';
  accessTokenExpiry: '30m';
  refreshTokenExpiry: '24h';
  refreshStrategy: 'automatic';
  
  endpoints: {
    login: 'POST /api/v1/auth/login/';
    register: 'POST /api/v1/auth/register/';
    refresh: 'POST /api/v1/auth/refresh/';
    logout: 'POST /api/v1/auth/logout/';
    verify: 'POST /api/v1/auth/verify-email/';
  };
}
```

### **نقش‌ها و دسترسی‌ها:**
```typescript
enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer', 
  AGENT = 'agent',
  ADMIN = 'admin'
}

interface RolePermissions {
  guest: ['view_products', 'view_tours', 'view_events', 'add_to_cart'];
  customer: ['*guest', 'create_orders', 'view_orders', 'manage_profile'];
  agent: ['*customer', 'manage_customers', 'view_reports', 'agent_pricing'];
  admin: ['*']; // All permissions
}
```

### **API-level Access Control:**
```typescript
// Public endpoints (no auth required)
const PUBLIC_ENDPOINTS = [
  'GET /api/v1/tours/',
  'GET /api/v1/events/',
  'GET /api/v1/transfers/',
  'GET /api/v1/search/',
  'POST /api/v1/auth/register/',
  'POST /api/v1/auth/login/'
];

// Authenticated endpoints
const AUTHENTICATED_ENDPOINTS = [
  'GET /api/v1/cart/',
  'POST /api/v1/orders/',
  'GET /api/v1/users/profile/'
];

// Role-specific endpoints
const AGENT_ENDPOINTS = [
  'GET /api/v1/agent/pricing/',
  'POST /api/v1/users/create-customer/'
];

const ADMIN_ENDPOINTS = [
  'GET /api/v1/analytics/',
  'POST /api/v1/admin/discounts/'
];
```

### **ارسال نقش در response‌ها:**
```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
  };
  tokens: {
    access: string;
    refresh: string;
  };
}
```

---

## 7. 🧱 **مدل‌های اصلی و ارتباطات**

### **ساختار خلاصه‌شده مدل‌ها:**

#### **User Model:**
```typescript
interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}
```

#### **Product Models:**
```typescript
interface BaseProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: Image[];
  is_active: boolean;
}

interface Tour extends BaseProduct {
  category: TourCategory;
  variants: TourVariant[];
  schedules: TourSchedule[];
}

interface Event extends BaseProduct {
  venue: Venue;
  performances: EventPerformance[];
  sections: EventSection[];
}

interface Transfer extends BaseProduct {
  route: TransferRoute;
  vehicle_types: VehicleType[];
}
```

#### **Cart & Order Models:**
```typescript
interface Cart {
  id: string;
  user_id?: string;
  session_id: string;
  items: CartItem[];
  total_amount: number;
  currency: string;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
}
```

### **ارتباط بین مدل‌ها:**
```sql
-- User relationships
users_user (1) ←→ (N) orders_order
users_user (1) ←→ (1) cart_cart

-- Product relationships  
tours_tour (1) ←→ (N) tours_tourvariant
tours_tour (1) ←→ (N) tours_tourschedule
events_event (1) ←→ (N) events_eventperformance
transfers_transferroute (1) ←→ (N) transfers_transferroutepricing

-- Cart relationships
cart_cart (1) ←→ (N) cart_cartitem
orders_order (1) ←→ (N) orders_orderitem
```

---

## 8. 🔗 **API‌های عمومی**

### **Authentication APIs:**
```typescript
// Registration & Login
POST /api/v1/auth/register/ - ثبت‌نام
POST /api/v1/auth/login/ - ورود
POST /api/v1/auth/logout/ - خروج
POST /api/v1/auth/refresh/ - تمدید توکن
POST /api/v1/auth/verify-email/ - تأیید ایمیل
POST /api/v1/auth/forgot-password/ - فراموشی رمز
POST /api/v1/auth/reset-password/ - بازنشانی رمز
```

### **Product APIs:**
```typescript
// Tours
GET /api/v1/tours/ - لیست تورها
GET /api/v1/tours/{slug}/ - جزئیات تور
GET /api/v1/tours/{slug}/schedules/ - برنامه‌های تور
POST /api/v1/tours/{slug}/calculate-price/ - محاسبه قیمت

// Events
GET /api/v1/events/ - لیست ایونت‌ها
GET /api/v1/events/{slug}/ - جزئیات ایونت
GET /api/v1/events/{slug}/performances/ - اجراها
POST /api/v1/events/{slug}/calculate-price/ - محاسبه قیمت

// Transfers
GET /api/v1/transfers/ - لیست ترانسفرها
GET /api/v1/transfers/{slug}/ - جزئیات ترانسفر
POST /api/v1/transfers/{slug}/calculate-price/ - محاسبه قیمت
```

### **Cart & Order APIs:**
```typescript
// Cart
GET /api/v1/cart/ - مشاهده سبد
POST /api/v1/cart/add/ - افزودن به سبد
PUT /api/v1/cart/items/{id}/ - بروزرسانی آیتم
DELETE /api/v1/cart/items/{id}/ - حذف آیتم
DELETE /api/v1/cart/clear/ - خالی کردن سبد

// Orders
POST /api/v1/orders/ - ایجاد سفارش
GET /api/v1/orders/ - لیست سفارش‌ها
GET /api/v1/orders/{order_number}/ - جزئیات سفارش
POST /api/v1/orders/{order_number}/cancel/ - لغو سفارش
```

### **User & Profile APIs:**
```typescript
// Profile
GET /api/v1/users/profile/ - مشاهده پروفایل
PUT /api/v1/users/profile/ - بروزرسانی پروفایل
POST /api/v1/users/change-password/ - تغییر رمز
POST /api/v1/users/avatar/ - آپلود آواتار
```

### **Localization APIs:**
```typescript
// Languages & Currencies
GET /api/v1/languages/ - لیست زبان‌ها
GET /api/v1/currencies/ - لیست ارزها
GET /api/v1/currencies/rates/ - نرخ تبدیل
```

### **Search & Filter APIs:**
```typescript
// Global Search
GET /api/v1/search/ - جستجوی عمومی
GET /api/v1/search/tours/ - جستجو در تورها
GET /api/v1/search/events/ - جستجو در ایونت‌ها
GET /api/v1/search/transfers/ - جستجو در ترانسفرها
```

### **Pagination, Filter, Search Support:**
```typescript
// Query Parameters
interface QueryParams {
  page?: number;           // Pagination
  page_size?: number;      // Items per page
  search?: string;         // Search query
  category?: string;       // Category filter
  price_min?: number;      // Price range
  price_max?: number;      // Price range
  date_from?: string;      // Date range
  date_to?: string;        // Date range
  location?: string;       // Location filter
  sort_by?: string;        // Sort field
  sort_order?: 'asc' | 'desc'; // Sort direction
}

// Response Format
interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  pages: number;
}
```

---

## 9. 📈 **متا اطلاعات**

### **دسته‌بندی‌های محصولات:**

#### **تور:**
```typescript
enum TourCategory {
  CITY_TOUR = 'city_tour',
  HISTORICAL = 'historical',
  CULTURAL = 'cultural',
  ADVENTURE = 'adventure',
  FOOD = 'food',
  SHOPPING = 'shopping'
}
```

#### **ایونت:**
```typescript
enum EventCategory {
  CONCERT = 'concert',
  THEATER = 'theater',
  FESTIVAL = 'festival',
  EXHIBITION = 'exhibition',
  SPORTS = 'sports',
  CONFERENCE = 'conference'
}
```

#### **ترانسفر:**
```typescript
enum TransferCategory {
  AIRPORT = 'airport',
  HOTEL = 'hotel',
  CITY = 'city',
  INTERCITY = 'intercity',
  CRUISE = 'cruise'
}
```

### **مقاصد (شهر، کشور):**
```typescript
interface Destination {
  id: string;
  name: string;
  type: 'city' | 'country' | 'region';
  parent_id?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timezone: string;
  languages: string[];
  currencies: string[];
}
```

### **هنرمندان و شرکت‌های حمل‌ونقل:**
```typescript
interface Artist {
  id: string;
  name: string;
  bio: string;
  image: string;
  genre: string[];
  social_media: Record<string, string>;
}

interface TransportCompany {
  id: string;
  name: string;
  logo: string;
  vehicle_types: VehicleType[];
  rating: number;
  contact_info: ContactInfo;
}
```

### **اطلاعات دینامیک مورد نیاز:**

#### **صفحات جستجو:**
- فیلترهای پیشرفته
- مرتب‌سازی نتایج
- پیشنهادات هوشمند
- تاریخچه جستجو

#### **لیست‌ها:**
- Pagination
- Infinite scroll
- Lazy loading
- Caching

#### **پیشنهادها:**
- محصولات مشابه
- محصولات محبوب
- محصولات جدید
- محصولات ویژه

---

## 🎯 **نتیجه‌گیری**

این مستندات مشخصات کامل سیستم Peykan Tourism را برای توسعه Frontend ارائه می‌دهد. سیستم از معماری مدرن و مقیاس‌پذیر برخوردار است و قابلیت‌های پیشرفته‌ای مانند چندزبانی، چندارزی، و مدیریت نقش‌های مختلف را پشتیبانی می‌کند.

### **نقاط قوت:**
- ✅ معماری DDD و Clean Architecture
- ✅ پشتیبانی کامل از چندزبانی و چندارزی
- ✅ سیستم نقش‌های پیشرفته
- ✅ API‌های RESTful کامل
- ✅ سیستم سبد خرید یکپارچه

### **توصیه‌های توسعه:**
1. **مرحله‌ای توسعه**: ابتدا core features، سپس advanced features
2. **Testing**: Unit tests برای تمام components
3. **Performance**: Lazy loading و caching
4. **Security**: Input validation و XSS protection
5. **Accessibility**: RTL support و keyboard navigation

این مشخصات پایه‌ای جامع برای توسعه Frontend با کیفیت بالا و تجربه کاربری عالی فراهم می‌کند. 