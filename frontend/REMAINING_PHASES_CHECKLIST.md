# 📋 **چک‌لیست مراحل باقی‌مانده**

## 🎯 **مراحل اصلی باقی‌مانده**

### **مرحله 5: Presentation Layer** ⏳ (30% تکمیل)
```
- [x] UI components structure موجود
- [x] Feature components structure موجود
- [ ] Migration of existing components to new architecture
- [ ] Update pages to use new hooks and services
- [ ] Implement new UI components with clean architecture
- [ ] Feature components refactoring
```

### **مرحله 6: Testing & Optimization** ⏳ (20% تکمیل)
```
- [x] Unit tests setup (Jest configured)
- [ ] Integration tests for new architecture
- [ ] End-to-end tests for critical flows
- [ ] Performance optimization
- [ ] Bundle size optimization
- [ ] Caching implementation
```

## 🔧 **کارهای تکمیلی Technical**

### **Repository Implementations** ⏳
```
- [x] UserRepositoryImpl ✅
- [ ] ProductRepositoryImpl 
- [ ] CartRepositoryImpl
- [ ] OrderRepositoryImpl
- [ ] TransferRepositoryImpl
```

### **Service Layer** ⏳
```
- [x] AuthService ✅
- [ ] ProductService
- [ ] CartService
- [ ] OrderService
- [ ] TransferService
```

### **Custom Hooks** ⏳
```
- [x] useAuthService ✅
- [ ] useProductService
- [ ] useCartService
- [ ] useOrderService
- [ ] useTransferService
```

### **Use Cases** ⏳
```
- [x] LoginUseCase ✅
- [x] AddToCartUseCase ✅
- [x] GetProductsUseCase ✅
- [ ] RegisterUseCase
- [ ] LogoutUseCase
- [ ] UpdateProfileUseCase
- [ ] GetTourDetailsUseCase
- [ ] BookTransferUseCase
- [ ] ProcessPaymentUseCase
```

## 🌐 **سیستم ترجمه (I18n)**

### **وضعیت فعلی:**
```
English (en.json):  1,309 کلید  (مرجع)
Persian (fa.json):  1,334 کلید  (مسائل: 500+ مفقود)
Turkish (tr.json):  1,248 کلید  (مسائل: 300+ مفقود)
```

### **مسائل حل شده:**
- [x] خطاهای `MISSING_MESSAGE` اصلی
- [x] مسائل `CartProvider` 
- [x] namespace های اصلی (`orders`, `pricing`, `seatMap`, `profile`)
- [x] کلیدهای navigation اساسی
- [x] کلیدهای transfers اساسی

### **مسائل باقی‌مانده:**
- [ ] **500+ کلید در Persian** مفقود
- [ ] **300+ کلید در Turkish** مفقود
- [ ] کلیدهای اضافی در Persian و Turkish
- [ ] یکنواخت‌سازی ساختار

### **اولویت‌های ترجمه:**
1. **فوری** (1-2 هفته):
   - کلیدهای transfers کامل
   - کلیدهای tours کامل
   - کلیدهای events کامل
   - کلیدهای auth کامل

2. **متوسط** (2-3 هفته):
   - کلیدهای checkout کامل
   - کلیدهای profile کامل
   - کلیدهای orders کامل

3. **بلندمدت** (1-2 ماه):
   - حذف کلیدهای اضافی
   - یکنواخت‌سازی ساختار
   - ایجاد validation tools

## 📊 **TODO List فعلی**

### **آماده برای انجام:**
- [ ] **ProductRepositoryImpl** implementation
- [ ] **CartRepositoryImpl** implementation
- [ ] **ProductService** with use cases
- [ ] **CartService** with use cases
- [ ] **Migration guide** for existing components

### **نیاز به تصمیم‌گیری:**
- [ ] **Performance optimization** strategy
- [ ] **Integration testing** approach
- [ ] **Translation completion** timeline
- [ ] **Legacy code migration** plan

### **منتظر رفع مسائل:**
- [ ] **Test environment** i18n mocking (partial issue)
- [ ] **Bundle optimization** strategy
- [ ] **Error boundary** implementation

## 🎯 **نحوه کار سیستم ترجمه**

### **Architecture:**
```
next-intl (i18n library)
├── i18n/config.ts          # تنظیمات اصلی
├── i18n/en.json            # ترجمه انگلیسی (مرجع)
├── i18n/fa.json            # ترجمه فارسی
├── i18n/tr.json            # ترجمه ترکی
└── scripts/check-translations.js  # ابزار تحلیل
```

### **Usage Pattern:**
```typescript
// در کامپوننت‌ها
import { useTranslations } from 'next-intl';

const t = useTranslations('common');
const title = t('welcome'); // از فایل JSON

// Namespace structure
{
  "common": {
    "welcome": "خوش آمدید",
    "login": "ورود"
  },
  "tours": {
    "title": "تورها",
    "book": "رزرو"
  }
}
```

### **Key Features:**
- **Namespace-based** organization
- **Locale routing** (example.com/fa/, example.com/en/)
- **RTL support** برای فارسی
- **Dynamic imports** برای بهینه‌سازی
- **Type safety** (قابل بهبود)

## 🚀 **توصیه‌های مرحله‌ای**

### **مرحله 1: تکمیل فوری (1-2 هفته)**
1. **ProductRepositoryImpl** و **CartRepositoryImpl**
2. **Services** اصلی
3. **کلیدهای ترجمه پرکاربرد**

### **مرحله 2: Migration (2-3 هفته)**
1. **Existing components** به architecture جدید
2. **Pages** update کردن
3. **Testing** implementation

### **مرحله 3: Optimization (1-2 ماه)**
1. **Performance** tuning
2. **Translation completion**
3. **Error handling** improvement

## 💡 **آیا ترجمه‌ها نیاز به تکمیل دارند؟**

**بله، قطعاً!** دلایل:

1. **حجم مسائل:** 500+ کلید در فارسی و 300+ کلید در ترکی مفقود
2. **توسعه مداوم:** با تغییر ساختار، کلیدهای جدید اضافه می‌شود
3. **تجربه کاربری:** کاربران نباید پیام‌های MISSING_MESSAGE ببینند
4. **Professional appearance:** برای محصول نهایی ضروری است

### **استراتژی پیشنهادی:**
- **Phased approach:** مرحله‌ای تکمیل کردن
- **Priority-based:** ابتدا بخش‌های پرکاربرد
- **Automated tools:** استفاده از scripts موجود
- **Team collaboration:** تقسیم کار بین اعضای تیم

---

**وضعیت کلی:** 🟡 **در حال پیشرفت**
**تکمیل Architecture:** 85%
**تکمیل Translations:** 40%
**آماده Production:** 70% 