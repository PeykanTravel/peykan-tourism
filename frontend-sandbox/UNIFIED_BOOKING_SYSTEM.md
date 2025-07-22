# سیستم یکپارچه رزرو - Unified Booking System

## 📋 فهرست مطالب

1. [معرفی سیستم](#معرفی-سیستم)
2. [معماری سیستم](#معماری-سیستم)
3. [انواع محصولات](#انواع-محصولات)
4. [کامپوننت‌های مشترک](#کامپوننت‌های-مشترک)
5. [پیاده‌سازی](#پیاده‌سازی)
6. [تست‌ها](#تست‌ها)
7. [مزایا](#مزایا)
8. [نحوه استفاده](#نحوه-استفاده)

## 🎯 معرفی سیستم

سیستم یکپارچه رزرو یک راه‌حل جامع برای مدیریت رزرو انواع محصولات (تور، رویداد، ترانسفر) است که با استفاده از کامپوننت‌های مشترک و انعطاف‌پذیر، تجربه کاربری یکپارچه‌ای ارائه می‌دهد.

### ویژگی‌های کلیدی:
- ✅ **UI/UX یکپارچه** در تمام محصولات
- ✅ **کد مشترک** تا 80% بین محصولات
- ✅ **محاسبه قیمت پیشرفته** با breakdown کامل
- ✅ **Validation کامل** برای هر نوع محصول
- ✅ **انعطاف‌پذیری بالا** برای اضافه کردن محصولات جدید

## 🏗️ معماری سیستم

```
UnifiedBookingSystem/
├── Types/
│   └── unified-booking.ts          # تعاریف TypeScript
├── Components/
│   └── booking/
│       └── UnifiedBookingSidebar.tsx  # کامپوننت اصلی
├── Services/
│   ├── tourService.ts              # سرویس تور
│   ├── eventService.ts             # سرویس رویداد
│   └── transferService.ts          # سرویس ترانسفر
└── Pages/
    ├── test-enhanced-tour-booking/     # تست تور
    ├── test-event-booking/             # تست رویداد
    └── test-transfer-booking/          # تست ترانسفر
```

## 📦 انواع محصولات

### 1. تور (Tour)
**مراحل رزرو:**
1. انتخاب تاریخ
2. انتخاب پکیج
3. انتخاب شرکت‌کنندگان (بزرگسال، کودک، نوزاد)
4. انتخاب آپشن‌های اضافی
5. درخواست‌های ویژه

**ویژگی‌های خاص:**
- مدیریت شرکت‌کنندگان با گروه‌های سنی مختلف
- محاسبه قیمت بر اساس تعداد و نوع شرکت‌کنندگان
- پکیج‌های مختلف با خدمات متفاوت

### 2. رویداد (Event)
**مراحل رزرو:**
1. انتخاب تاریخ
2. انتخاب نوع بلیط
3. انتخاب تعداد بلیط
4. انتخاب صندلی (اختیاری)
5. درخواست‌های ویژه

**ویژگی‌های خاص:**
- انواع مختلف بلیط (عادی، VIP، پریمیوم)
- محدودیت تعداد بلیط در هر سفارش
- سیستم انتخاب صندلی

### 3. ترانسفر (Transfer)
**مراحل رزرو:**
1. انتخاب تاریخ
2. انتخاب مسیر
3. انتخاب نوع وسیله نقلیه
4. انتخاب تعداد مسافران
5. درخواست‌های ویژه

**ویژگی‌های خاص:**
- مسیرهای مختلف با قیمت‌های متفاوت
- انواع وسایل نقلیه (سدان، SUV، ون)
- محاسبه قیمت بر اساس مسیر و نوع وسیله

## 🔧 کامپوننت‌های مشترک

### UnifiedBookingSidebar
کامپوننت اصلی که تمام منطق رزرو را مدیریت می‌کند:

```typescript
interface UnifiedBookingSidebarProps {
  productType: ProductType;        // نوع محصول
  productId: string;              // شناسه محصول
  productData: any;               // داده‌های محصول
  onBookingSubmit: (state: BookingState) => Promise<void>;
  className?: string;
}
```

**ویژگی‌ها:**
- نمایش مراحل بر اساس نوع محصول
- Validation خودکار
- محاسبه قیمت real-time
- مدیریت state یکپارچه

### Type Definitions
```typescript
// Base booking state
interface BaseBookingState {
  productType: ProductType;
  productId: string;
  selectedDate: string;
  specialRequests: string;
  totalPrice: number;
}

// Product-specific states
interface TourBookingState extends BaseBookingState {
  selectedVariant: string;
  participants: { adult: number; child: number; infant: number; };
  selectedOptions: Record<string, number>;
}

interface EventBookingState extends BaseBookingState {
  selectedTicketType: string;
  quantity: number;
  selectedSeats?: string[];
  selectedOptions: Record<string, number>;
}

interface TransferBookingState extends BaseBookingState {
  selectedRoute: string;
  selectedVehicle: string;
  passengers: { adult: number; child: number; infant: number; };
  selectedOptions: Record<string, number>;
}
```

## 💻 پیاده‌سازی

### 1. نصب و راه‌اندازی
```bash
# نصب dependencies
npm install

# اجرای پروژه
npm run dev
```

### 2. استفاده از کامپوننت
```tsx
import UnifiedBookingSidebar from '../components/booking/UnifiedBookingSidebar';

// در صفحه محصول
<UnifiedBookingSidebar
  productType="tour"
  productId={tourData.id}
  productData={tourData}
  onBookingSubmit={handleBookingSubmit}
/>
```

### 3. تعریف handler
```tsx
const handleBookingSubmit = async (bookingState: BookingState) => {
  try {
    // ارسال به backend
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingState)
    });
    
    // اضافه کردن به سبد خرید
    addToCart(bookingState);
    
    // ریدایرکت
    router.push('/cart');
  } catch (error) {
    console.error('Booking error:', error);
  }
};
```

## 🧪 تست‌ها

### صفحات تست موجود:
1. **`/fa/test-unified-booking`** - صفحه اصلی تست
2. **`/fa/test-enhanced-tour-booking`** - تست رزرو تور
3. **`/fa/test-event-booking`** - تست رزرو رویداد
4. **`/fa/test-transfer-booking`** - تست رزرو ترانسفر

### نحوه تست:
1. به آدرس `http://localhost:3000/fa/test-unified-booking` بروید
2. یکی از محصولات را انتخاب کنید
3. مراحل رزرو را تکمیل کنید
4. نتیجه را در console مشاهده کنید

## ✅ مزایا

### 1. کد مشترک (80%)
- کامپوننت‌های UI مشترک
- منطق validation یکپارچه
- سیستم محاسبه قیمت مشترک
- مدیریت state یکسان

### 2. UI/UX یکپارچه
- طراحی یکسان در تمام محصولات
- تجربه کاربری مشابه
- کاهش زمان یادگیری

### 3. توسعه سریع
- اضافه کردن محصولات جدید در کمترین زمان
- تغییرات مرکزی
- تست‌های یکپارچه

### 4. نگهداری آسان
- کد کمتر و تمیزتر
- باگ‌های کمتر
- آپدیت‌های سریع‌تر

## 📖 نحوه استفاده

### 1. اضافه کردن محصول جدید
```typescript
// 1. تعریف type جدید
interface NewProductBookingState extends BaseBookingState {
  // فیلدهای خاص محصول جدید
}

// 2. اضافه کردن به union type
type BookingState = TourBookingState | EventBookingState | TransferBookingState | NewProductBookingState;

// 3. تعریف مراحل
export const NEW_PRODUCT_BOOKING_STEPS: BookingStep[] = [
  // مراحل خاص محصول جدید
];

// 4. اضافه کردن به UnifiedBookingSidebar
```

### 2. سفارشی‌سازی UI
```tsx
// تغییر ظاهر بر اساس نوع محصول
{productType === 'tour' && (
  <TourSpecificComponent />
)}

{productType === 'event' && (
  <EventSpecificComponent />
)}
```

### 3. اضافه کردن validation
```typescript
// در unified-booking.ts
const NEW_PRODUCT_VALIDATION = (state: NewProductBookingState) => {
  // منطق validation خاص
  return isValid;
};
```

## 🔄 جریان کاری

### 1. انتخاب محصول
کاربر محصول مورد نظر را انتخاب می‌کند

### 2. تکمیل مراحل
سیستم مراحل مربوط به محصول را نمایش می‌دهد

### 3. Validation
هر مرحله validation می‌شود

### 4. محاسبه قیمت
قیمت به صورت real-time محاسبه می‌شود

### 5. ارسال
داده‌ها به backend ارسال می‌شود

### 6. نتیجه
کاربر به سبد خرید هدایت می‌شود

## 🚀 آینده سیستم

### ویژگی‌های پیشنهادی:
- [ ] سیستم صندلی برای رویدادها
- [ ] نقشه برای انتخاب مسیر ترانسفر
- [ ] سیستم تخفیف
- [ ] مدیریت موجودیت real-time
- [ ] سیستم پرداخت یکپارچه
- [ ] مدیریت لغو و تغییر رزرو

### بهینه‌سازی‌ها:
- [ ] Lazy loading برای کامپوننت‌ها
- [ ] Caching برای داده‌ها
- [ ] Progressive Web App
- [ ] Offline support

## 📞 پشتیبانی

برای سوالات و مشکلات:
- بررسی مستندات
- تست صفحات نمونه
- بررسی کدهای موجود
- ایجاد issue در repository

---

**توسعه‌دهنده:** Peykan Tourism Team  
**تاریخ:** 2024  
**نسخه:** 1.0.0 