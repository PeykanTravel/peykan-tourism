# راهنمای استفاده از کامپوننت‌های بهینه‌سازی شده

## 🎯 کامپوننت‌های جدید

### 1. **Modal** - کامپوننت عمومی مودال

```tsx
import { Modal } from '@/components/ui';

// استفاده ساده
<Modal isOpen={isOpen} onClose={onClose}>
  <p>محتوای مودال</p>
</Modal>

// با عنوان و تنظیمات
<Modal 
  isOpen={isOpen} 
  onClose={onClose}
  title="عنوان مودال"
  size="lg"
  showCloseButton={true}
  closeOnOverlayClick={true}
>
  <p>محتوای مودال</p>
</Modal>
```

**ویژگی‌ها:**
- پشتیبانی از اندازه‌های مختلف (sm, md, lg, xl)
- بستن با Escape key
- بستن با کلیک روی overlay
- پشتیبانی از Dark Mode

### 2. **ProductCard** - کارت محصول یکپارچه

```tsx
import { ProductCard } from '@/components/ui';

// برای تور
<ProductCard
  id="tour-1"
  title="تور استانبول"
  description="تور کامل استانبول با راهنما"
  image="/images/istanbul.jpg"
  price={150}
  currency="USD"
  duration="3 روز"
  location="استانبول"
  rating={4.5}
  reviewCount={120}
  maxParticipants={20}
  category="tour"
  slug="istanbul-tour"
  variant="grid"
/>

// برای رویداد
<ProductCard
  id="event-1"
  title="کنسرت کلاسیک"
  description="کنسرت موسیقی کلاسیک"
  image="/images/concert.jpg"
  price={50}
  currency="USD"
  date="2024-02-15"
  category="event"
  slug="classic-concert"
  variant="list"
/>
```

**ویژگی‌ها:**
- پشتیبانی از تور، رویداد و ترانسفر
- دو حالت نمایش (grid/list)
- نمایش امتیاز و نظرات
- پشتیبانی از Dark Mode
- Responsive design

### 3. **MediaManager** - مدیریت تصاویر یکپارچه

```tsx
import { MediaManager } from '@/components/ui';

const [mediaItems, setMediaItems] = useState([]);

<MediaManager
  items={mediaItems}
  onUpload={(files) => {
    // پردازش فایل‌های آپلود شده
    console.log('Files uploaded:', files);
  }}
  onRemove={(item) => {
    // حذف آیتم
    setMediaItems(prev => prev.filter(i => i.id !== item.id));
  }}
  onItemClick={(item, index) => {
    // کلیک روی آیتم
    console.log('Clicked item:', item);
  }}
  multiple={true}
  maxFiles={10}
  maxSize={5} // 5MB
  columns={4}
  showUpload={true}
  showGallery={true}
  showLightbox={true}
/>
```

**ویژگی‌ها:**
- آپلود فایل با Drag & Drop
- نمایش گالری با Lightbox
- پشتیبانی از تصاویر و ویدیو
- اعتبارسنجی فایل‌ها
- Responsive grid

### 4. **ThemeProvider** - مدیریت تم

```tsx
import { ThemeProvider, useTheme } from '@/components/ui';

// در layout اصلی
<ThemeProvider>
  <App />
</ThemeProvider>

// استفاده در کامپوننت
function MyComponent() {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? 'روشن' : 'تاریک'}
    </button>
  );
}
```

**ویژگی‌ها:**
- پشتیبانی از تم روشن، تاریک و سیستم
- ذخیره‌سازی در localStorage
- تغییر خودکار بر اساس تنظیمات سیستم

## 🔄 مهاجرت از کامپوننت‌های قدیمی

### حذف کامپوننت‌های قدیمی:
- ❌ `OTPModal` → ✅ `Modal`
- ❌ `ChangePasswordModal` → ✅ `Modal`
- ❌ `TourCard` → ✅ `ProductCard`
- ❌ `EventCard` → ✅ `ProductCard`
- ❌ `TransferCard` → ✅ `ProductCard`
- ❌ `MediaGallery` + `MediaUpload` → ✅ `MediaManager`
- ❌ `Toast` → ✅ `react-hot-toast`

### مثال مهاجرت:

```tsx
// قبل
<OTPModal isOpen={isOpen} onClose={onClose} onVerify={handleVerify} />

// بعد
<Modal isOpen={isOpen} onClose={onClose} title="تایید کد">
  <OTPVerificationForm onVerify={handleVerify} />
</Modal>
```

## 🎨 استفاده از Design System

### رنگ‌ها:
```tsx
// استفاده از رنگ‌های تعریف شده
className="bg-primary-500 text-white"
className="border-secondary-200"
className="text-error-600"
```

### Typography:
```tsx
// استفاده از کلاس‌های تایپوگرافی
className="heading-1" // text-4xl lg:text-5xl font-bold
className="body-text" // text-lg text-gray-600
className="caption-text" // text-sm text-gray-500
```

### Spacing:
```tsx
// استفاده از spacing های تعریف شده
className="section-padding" // py-20
className="section-container" // max-w-7xl mx-auto px-4
```

## 📱 Responsive Design

### Breakpoints:
```tsx
// Mobile-first approach
className="text-sm md:text-base lg:text-lg"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### RTL Support:
```tsx
// پشتیبانی از RTL
className="rtl:text-right ltr:text-left"
className="rtl:mr-4 ltr:ml-4"
```

## 🚀 Performance Tips

### 1. **React.memo برای کامپوننت‌های سنگین:**
```tsx
const ProductCard = React.memo(({ product }) => {
  return <div>{product.title}</div>;
});
```

### 2. **useMemo برای محاسبات سنگین:**
```tsx
const filteredProducts = useMemo(() => {
  return products.filter(p => p.category === selectedCategory);
}, [products, selectedCategory]);
```

### 3. **useCallback برای توابع:**
```tsx
const handleAddToCart = useCallback((product) => {
  addToCart(product);
}, [addToCart]);
```

## 🔧 تنظیمات پیشنهادی

### 1. **Import Aliases:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  }
}
```

### 2. **ESLint Rules:**
```json
// .eslintrc.json
{
  "rules": {
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }]
  }
}
```

## 📚 منابع بیشتر

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Frontend Architecture Analysis](./FRONTEND_ARCHITECTURE_ANALYSIS.md)
- [Component API Reference](./lib/design-system/README.md) 