# راهنمای پیاده‌سازی سیستم رزرو یکپارچه Peykan Tourism

---

## 📋 فهرست مطالب

1. [معماری کلی سیستم](#معماری-کلی-سیستم)
2. [مراحل پیاده‌سازی](#مراحل-پیاده‌سازی)
3. [ساختار فایل‌ها](#ساختار-فایل‌ها)
4. [کامپوننت‌های اصلی](#کامپوننت‌های-اصلی)
5. [پیاده‌سازی UI مخصوص هر محصول](#پیاده‌سازی-ui-مخصوص-هر-محصول)
6. [مدیریت State](#مدیریت-state)
7. [نقشه گسترش و توسعه](#نقشه-گسترش-و-توسعه)
8. [بهترین شیوه‌ها](#بهترین-شیوه‌ها)
9. [عیب‌یابی و تست](#عیب‌یابی-و-تست)

---

## 🏗️ معماری کلی سیستم

### فلسفه طراحی
سیستم رزرو یکپارچه بر اساس اصل **"یکپارچگی با انعطاف‌پذیری"** طراحی شده است:

- **یکپارچگی**: همه محصولات از یک فرم پایه استفاده می‌کنند
- **انعطاف‌پذیری**: هر محصول می‌تواند UI/UX مخصوص خودش را داشته باشد
- **قابلیت نگهداری**: کد تمیز و قابل توسعه
- **تجربه کاربری**: هر محصول UX بهینه خودش

### لایه‌های معماری

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│  (Pages, Components, UI Specific)   │
├─────────────────────────────────────┤
│         Business Logic Layer        │
│    (UnifiedBookingForm, Wrappers)   │
├─────────────────────────────────────┤
│         State Management Layer      │
│    (Context, Stores, Hooks)         │
├─────────────────────────────────────┤
│           Data Layer                │
│      (API, Types, Configs)          │
└─────────────────────────────────────┘
```

---

## 🚀 مراحل پیاده‌سازی

### مرحله 1: ایجاد کامپوننت پایه یکپارچه

#### 1.1 UnifiedBookingForm
```typescript
// frontend-sandbox/components/booking/UnifiedBookingForm.tsx
interface UnifiedBookingFormProps {
  productType: 'tour' | 'event' | 'transfer';
  config: BookingConfig;
  initialData?: any;
  onComplete?: (data: any) => void;
  mode?: 'controlled' | 'uncontrolled';
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onFormDataChange?: (data: any) => void;
}
```

**ویژگی‌های کلیدی:**
- پشتیبانی از حالت controlled/uncontrolled
- مدیریت مراحل پویا
- validation پویا
- render field پویا

#### 1.2 Product Configuration System
```typescript
// frontend-sandbox/lib/configs/productConfigs.ts
interface BookingConfig {
  steps: BookingStep[];
  fields: FieldConfig[];
  validation: ValidationRules;
  pricing: PricingLogic;
  ui: UIConfig;
}
```

### مرحله 2: ایجاد Wrapper های محصول

#### 2.1 TourBookingWrapper
```typescript
// frontend-sandbox/components/booking/TourBookingWrapper.tsx
export function TourBookingWrapper({ tourData, onComplete }) {
  const config = getTourConfig(tourData);
  
  return (
    <div className="tour-booking-container">
      <TourSpecificUI data={tourData} />
      <UnifiedBookingForm 
        productType="tour"
        config={config}
        onComplete={onComplete}
      />
    </div>
  );
}
```

#### 2.2 EventBookingWrapper
```typescript
// frontend-sandbox/components/booking/EventBookingWrapper.tsx
export function EventBookingWrapper({ eventData, onComplete }) {
  const config = getEventConfig(eventData);
  
  return (
    <div className="event-booking-container">
      <EventSpecificUI data={eventData} />
      <UnifiedBookingForm 
        productType="event"
        config={config}
        onComplete={onComplete}
      />
    </div>
  );
}
```

#### 2.3 TransferBookingWrapper
```typescript
// frontend-sandbox/components/booking/TransferBookingWrapper.tsx
export function TransferBookingWrapper({ transferData, onComplete }) {
  const config = getTransferConfig(transferData);
  
  return (
    <div className="transfer-booking-container">
      <TransferSpecificUI data={transferData} />
      <UnifiedBookingForm 
        productType="transfer"
        config={config}
        onComplete={onComplete}
      />
    </div>
  );
}
```

### مرحله 3: پیاده‌سازی UI مخصوص هر محصول

#### 3.1 ProductSpecificComponents
```typescript
// frontend-sandbox/components/booking/ProductSpecificComponents.tsx
export function TourSpecificUI({ data, onSelect }) {
  // UI مخصوص تور با کارت‌های پکیج و تقویم
}

export function EventSpecificUI({ data, onSelect }) {
  // UI مخصوص رویداد با نقشه صندلی و کارت‌های بلیط
}

export function TransferSpecificUI({ data, onSelect }) {
  // UI مخصوص ترانسفر با نقشه مسیر و انتخاب خودرو
}
```

### مرحله 4: ایجاد صفحات تست

#### 4.1 صفحه تست ساده
```typescript
// frontend-sandbox/app/[locale]/test-simple/page.tsx
export default function TestSimplePage() {
  return (
    <div>
      <TourBookingWrapper tourData={sampleTourData} />
      <EventBookingWrapper eventData={sampleEventData} />
      <TransferBookingWrapper transferData={sampleTransferData} />
    </div>
  );
}
```

#### 4.2 صفحه تست UI مخصوص
```typescript
// frontend-sandbox/app/[locale]/test-product-specific/page.tsx
export default function TestProductSpecificPage() {
  const [selectedProduct, setSelectedProduct] = useState('tour');
  
  return (
    <ProductSpecificSelector 
      productType={selectedProduct}
      data={getProductData()}
      onSelect={handleSelect}
    />
  );
}
```

---

## 📁 ساختار فایل‌ها

```
frontend-sandbox/
├── components/
│   ├── booking/
│   │   ├── UnifiedBookingForm.tsx          # فرم پایه یکپارچه
│   │   ├── UnifiedBookingPage.tsx          # صفحه کامل رزرو
│   │   ├── ProductSpecificComponents.tsx   # UI مخصوص هر محصول
│   │   ├── TourBookingWrapper.tsx          # Wrapper تور
│   │   ├── EventBookingWrapper.tsx         # Wrapper رویداد
│   │   └── TransferBookingWrapper.tsx      # Wrapper ترانسفر
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Tabs.tsx
│       └── PriceDisplay.tsx
├── lib/
│   ├── configs/
│   │   ├── productConfigs.ts               # تنظیمات محصولات
│   │   ├── tourConfig.ts                   # تنظیمات تور
│   │   ├── eventConfig.ts                  # تنظیمات رویداد
│   │   └── transferConfig.ts               # تنظیمات ترانسفر
│   ├── hooks/
│   │   ├── useBookingForm.ts               # Hook مدیریت فرم
│   │   └── useProductData.ts               # Hook داده‌های محصول
│   ├── types/
│   │   ├── booking.ts                      # تایپ‌های رزرو
│   │   └── products.ts                     # تایپ‌های محصولات
│   └── utils/
│       ├── validation.ts                   # توابع validation
│       └── pricing.ts                      # محاسبات قیمت
└── app/
    └── [locale]/
        ├── test-simple/
        │   └── page.tsx                    # تست ساده
        ├── test-product-specific/
        │   └── page.tsx                    # تست UI مخصوص
        ├── test-unified-tour-booking/
        │   └── page.tsx                    # تست کامل تور
        ├── test-unified-event-booking/
        │   └── page.tsx                    # تست کامل رویداد
        └── test-unified-transfer-booking/
            └── page.tsx                    # تست کامل ترانسفر
```

---

## 🧩 کامپوننت‌های اصلی

### 1. UnifiedBookingForm
**مسئولیت**: فرم پایه یکپارچه برای همه محصولات

**ویژگی‌ها:**
- مدیریت مراحل پویا
- validation پویا
- render field پویا
- پشتیبانی از حالت controlled/uncontrolled

**نحوه استفاده:**
```typescript
<UnifiedBookingForm
  productType="tour"
  config={tourConfig}
  initialData={initialData}
  onComplete={handleComplete}
  mode="controlled"
  currentStep={currentStep}
  onStepChange={setCurrentStep}
  onFormDataChange={setFormData}
/>
```

### 2. ProductSpecificComponents
**مسئولیت**: UI مخصوص هر محصول

**کامپوننت‌ها:**
- `TourSpecificUI`: کارت‌های پکیج + تقویم
- `EventSpecificUI`: نقشه صندلی + کارت‌های بلیط
- `TransferSpecificUI`: نقشه مسیر + کارت‌های خودرو

### 3. Wrapper Components
**مسئولیت**: ترکیب UI مخصوص با فرم یکپارچه

**کامپوننت‌ها:**
- `TourBookingWrapper`
- `EventBookingWrapper`
- `TransferBookingWrapper`

---

## 🎨 پیاده‌سازی UI مخصوص هر محصول

### اصول طراحی

1. **رنگ‌بندی مخصوص**: هر محصول رنگ اصلی خودش
2. **آیکون‌های مناسب**: آیکون‌های مرتبط با هر محصول
3. **Layout متفاوت**: چیدمان مناسب برای هر محصول
4. **انیمیشن‌های مناسب**: انیمیشن‌های مرتبط با محتوا

### نمونه پیاده‌سازی

#### تور (رنگ آبی)
```typescript
export function TourSpecificUI({ data, onSelect }) {
  return (
    <div className="space-y-6">
      {/* کارت‌های پکیج */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.variants?.map(variant => (
          <Card 
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              data.selectedVariant === variant.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:ring-2 hover:ring-blue-300'
            }`}
            onClick={() => onSelect('variant', variant.id)}
          >
            {/* محتوای کارت */}
          </Card>
        ))}
      </div>
      
      {/* تقویم تاریخ */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        {/* محتوای تقویم */}
      </div>
    </div>
  );
}
```

#### رویداد (رنگ بنفش)
```typescript
export function EventSpecificUI({ data, onSelect }) {
  return (
    <div className="space-y-6">
      {/* نقشه صندلی */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              className={`w-8 h-8 rounded cursor-pointer transition-all ${
                data.selectedSeats?.includes(i)
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 hover:bg-purple-300'
              }`}
              onClick={() => onSelect('seat', i)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* کارت‌های بلیط */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* محتوای کارت‌ها */}
      </div>
    </div>
  );
}
```

#### ترانسفر (رنگ سبز)
```typescript
export function TransferSpecificUI({ data, onSelect }) {
  return (
    <div className="space-y-6">
      {/* نقشه مسیر */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.routes?.map(route => (
            <div
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                data.selectedRoute === route.id
                  ? 'bg-green-500 text-white'
                  : 'bg-white hover:bg-green-50'
              }`}
              onClick={() => onSelect('route', route.id)}
            >
              {/* محتوای مسیر */}
            </div>
          ))}
        </div>
      </div>
      
      {/* انتخاب رفت و برگشت */}
      <div className="bg-white rounded-lg p-6 border-2 border-green-200">
        <div className="grid grid-cols-2 gap-4">
          {/* گزینه‌های رفت و برگشت */}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 مدیریت State

### 1. State محلی (Local State)
```typescript
const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState({});
const [selectedProduct, setSelectedProduct] = useState('tour');
```

### 2. State سراسری (Global State)
```typescript
// Context برای مدیریت رزرو
const BookingContext = createContext();

// Zustand Store برای داده‌های محصول
const useProductStore = create((set) => ({
  tourData: null,
  eventData: null,
  transferData: null,
  setTourData: (data) => set({ tourData: data }),
  setEventData: (data) => set({ eventData: data }),
  setTransferData: (data) => set({ transferData: data }),
}));
```

### 3. Custom Hooks
```typescript
// Hook مدیریت فرم رزرو
export function useBookingForm(productType, config) {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  
  const nextStep = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
  };
}
```

---

## 🗺️ نقشه گسترش و توسعه

### فاز 1: تکمیل محصولات موجود (فعلی)
- [x] پیاده‌سازی UnifiedBookingForm
- [x] ایجاد Wrapper های محصول
- [x] پیاده‌سازی UI مخصوص هر محصول
- [x] ایجاد صفحات تست
- [ ] تست کامل و رفع باگ‌ها
- [ ] بهینه‌سازی عملکرد

### فاز 2: اضافه کردن محصولات جدید
- [ ] محصول "هتل" (Hotel)
- [ ] محصول "بسته سفر" (Travel Package)
- [ ] محصول "خدمات ویژه" (Special Services)

#### نمونه پیاده‌سازی محصول جدید (هتل)
```typescript
// 1. ایجاد تنظیمات
// lib/configs/hotelConfig.ts
export const hotelConfig: BookingConfig = {
  steps: [
    { id: 'dates', title: 'تاریخ اقامت' },
    { id: 'room_type', title: 'نوع اتاق' },
    { id: 'guests', title: 'تعداد مهمان' },
    { id: 'amenities', title: 'امکانات' },
    { id: 'contact', title: 'اطلاعات تماس' }
  ],
  fields: [
    // تعریف فیلدها
  ],
  validation: {
    // قوانین validation
  },
  pricing: {
    // منطق محاسبه قیمت
  }
};

// 2. ایجاد UI مخصوص
// components/booking/ProductSpecificComponents.tsx
export function HotelSpecificUI({ data, onSelect }) {
  return (
    <div className="space-y-6">
      {/* تقویم انتخاب تاریخ اقامت */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
        {/* محتوای تقویم */}
      </div>
      
      {/* کارت‌های نوع اتاق */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* محتوای کارت‌ها */}
      </div>
    </div>
  );
}

// 3. ایجاد Wrapper
// components/booking/HotelBookingWrapper.tsx
export function HotelBookingWrapper({ hotelData, onComplete }) {
  const config = getHotelConfig(hotelData);
  
  return (
    <div className="hotel-booking-container">
      <HotelSpecificUI data={hotelData} />
      <UnifiedBookingForm 
        productType="hotel"
        config={config}
        onComplete={onComplete}
      />
    </div>
  );
}
```

### فاز 3: بهبودهای پیشرفته
- [ ] سیستم تخفیف و کد تخفیف
- [ ] سیستم امتیازدهی و نظرات
- [ ] سیستم اطلاع‌رسانی (SMS/Email)
- [ ] سیستم پرداخت یکپارچه
- [ ] سیستم مدیریت موجودی

### فاز 4: بهینه‌سازی و مقیاس‌پذیری
- [ ] Lazy Loading کامپوننت‌ها
- [ ] Caching داده‌ها
- [ ] بهینه‌سازی Bundle Size
- [ ] تست‌های عملکرد
- [ ] SEO Optimization

---

## ✅ بهترین شیوه‌ها

### 1. کدنویسی
- استفاده از TypeScript برای type safety
- استفاده از ESLint و Prettier
- نوشتن کامنت‌های مناسب
- رعایت naming conventions

### 2. معماری
- جداسازی مسئولیت‌ها
- استفاده از Dependency Injection
- رعایت SOLID Principles
- استفاده از Design Patterns مناسب

### 3. عملکرد
- استفاده از React.memo برای بهینه‌سازی
- استفاده از useMemo و useCallback
- Lazy Loading کامپوننت‌ها
- بهینه‌سازی re-renders

### 4. تجربه کاربری
- Loading States مناسب
- Error Handling جامع
- Responsive Design
- Accessibility (a11y)

---

## 🐛 عیب‌یابی و تست

### 1. تست‌های واحد
```typescript
// __tests__/UnifiedBookingForm.test.tsx
describe('UnifiedBookingForm', () => {
  it('should render correctly', () => {
    // تست رندر
  });
  
  it('should handle step navigation', () => {
    // تست ناوبری مراحل
  });
  
  it('should validate form data', () => {
    // تست validation
  });
});
```

### 2. تست‌های یکپارچگی
```typescript
// __tests__/integration/BookingFlow.test.tsx
describe('Booking Flow Integration', () => {
  it('should complete tour booking flow', () => {
    // تست کامل جریان رزرو تور
  });
  
  it('should complete event booking flow', () => {
    // تست کامل جریان رزرو رویداد
  });
  
  it('should complete transfer booking flow', () => {
    // تست کامل جریان رزرو ترانسفر
  });
});
```

### 3. عیب‌یابی رایج

#### مشکل: کامپوننت رندر نمی‌شود
**راه‌حل:**
- بررسی import ها
- بررسی props
- بررسی console errors

#### مشکل: State به‌روزرسانی نمی‌شود
**راه‌حل:**
- بررسی dependency array در useEffect
- بررسی setter function
- بررسی re-render triggers

#### مشکل: Validation کار نمی‌کند
**راه‌حل:**
- بررسی validation rules
- بررسی field names
- بررسی error handling

### 4. ابزارهای عیب‌یابی
- React Developer Tools
- Redux DevTools (اگر از Redux استفاده می‌کنید)
- Network Tab در Browser
- Console Logs

---

## 📚 منابع و مراجع

### مستندات
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### کتابخانه‌های استفاده شده
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- Lucide React (آیکون‌ها)
- Zustand (State Management)

### الگوهای طراحی
- Component Composition
- Higher-Order Components (HOC)
- Render Props
- Custom Hooks
- Context API

---

## 🎯 نتیجه‌گیری

سیستم رزرو یکپارچه Peykan Tourism یک راه‌حل مقیاس‌پذیر و انعطاف‌پذیر برای مدیریت رزرو انواع محصولات است. این سیستم با ترکیب یکپارچگی و انعطاف‌پذیری، امکان توسعه آسان محصولات جدید را فراهم می‌کند.

**نکات کلیدی:**
1. **یکپارچگی**: همه محصولات از یک فرم پایه استفاده می‌کنند
2. **انعطاف‌پذیری**: هر محصول UI/UX مخصوص خودش را دارد
3. **قابلیت نگهداری**: کد تمیز و قابل توسعه
4. **مقیاس‌پذیری**: امکان اضافه کردن محصولات جدید به راحتی

**برای شروع توسعه:**
1. مطالعه این مستند
2. بررسی کدهای نمونه
3. اجرای صفحات تست
4. شروع با محصول ساده
5. تدریجاً اضافه کردن پیچیدگی

---

**آخرین به‌روزرسانی**: دسامبر 2024  
**نسخه**: 1.0.0  
**نویسنده**: تیم توسعه Peykan Tourism 