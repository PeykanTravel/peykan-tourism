# راهنمای RTL (Right-to-Left) در پروژه پیکان توریسم

## تغییرات اعمال شده

### 1. تنظیم زبان پیش‌فرض به فارسی
- **فایل**: `frontend/i18n/config.ts`
- **تغییر**: `defaultLocale = 'fa'`
- **نتیجه**: سایت با زبان فارسی شروع می‌شود

### 2. بهبود Middleware
- **فایل**: `frontend/middleware.ts`
- **اضافه شده**: `localeDetection: true`
- **نتیجه**: کاربران به زبان پیش‌فرض هدایت می‌شوند

### 3. صفحه Redirect اصلی
- **فایل**: `frontend/app/page.tsx`
- **عملکرد**: کاربران را به `/fa` هدایت می‌کند

### 4. بهبود Layout
- **فایل**: `frontend/app/[locale]/layout.tsx`
- **اضافه شده**: کلاس‌های RTL و metadata فارسی

### 5. کامپوننت RTLProvider
- **فایل**: `frontend/components/RTLProvider.tsx`
- **عملکرد**: مدیریت RTL در کل اپلیکیشن

## نحوه استفاده

### 1. استفاده از کامپوننت‌های RTL

```tsx
import { RTLContainer, RTLFlex, RTLText, useRTL } from '@/components/RTLProvider';

export default function MyComponent() {
  const { isRTL } = useRTL();
  
  return (
    <RTLContainer>
      <RTLFlex className="gap-4">
        <div>آیتم ۱</div>
        <div>آیتم ۲</div>
      </RTLFlex>
      <RTLText>متن تراز شده</RTLText>
    </RTLContainer>
  );
}
```

### 2. استفاده از Hook های RTL

```tsx
import { useRTLStyles } from '@/lib/utils/translation';

export default function MyComponent() {
  const { isRTL, className } = useRTLStyles();
  
  return (
    <div className={className.text}>
      متن با تراز خودکار
    </div>
  );
}
```

### 3. استفاده از کلاس‌های Tailwind RTL

```tsx
// کلاس‌های موجود
rtl:text-right    // تراز راست در RTL
rtl:flex-row-reverse  // جهت معکوس در RTL
rtl:mr-4          // حاشیه راست در RTL
rtl:pr-4          // پدینگ راست در RTL
```

### 4. مدیریت فونت‌ها

```tsx
// در Tailwind config
fontFamily: {
  persian: ['Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
  english: ['Inter', 'Arial', 'sans-serif'],
}

// استفاده
<div className="font-persian">متن فارسی</div>
<div className="font-english">English text</div>
```

## بهترین شیوه‌ها

### 1. استفاده از کامپوننت‌های RTL
- برای layout های ساده از `RTLContainer` استفاده کنید
- برای flexbox از `RTLFlex` استفاده کنید
- برای متن از `RTLText` استفاده کنید

### 2. استفاده از Hook ها
- برای محاسبات پیچیده از `useRTLStyles` استفاده کنید
- برای دسترسی به context از `useRTL` استفاده کنید

### 3. استفاده از کلاس‌های Tailwind
- برای styling های ساده از کلاس‌های `rtl:` استفاده کنید
- از کلاس‌های `start` و `end` به جای `left` و `right` استفاده کنید

### 4. مدیریت محتوا
- از `isRTL` برای نمایش محتوای متفاوت استفاده کنید
- placeholder ها و label ها را بر اساس زبان تنظیم کنید

## مثال‌های کاربردی

### فرم با RTL
```tsx
<RTLContainer>
  <div className="space-y-4">
    <div className="flex gap-4">
      <label className="w-24">نام:</label>
      <input 
        type="text" 
        className="flex-1 border rounded px-3 py-2"
        placeholder={isRTL ? "نام خود را وارد کنید" : "Enter your name"}
      />
    </div>
  </div>
</RTLContainer>
```

### کارت با RTL
```tsx
<RTLContainer className="bg-white rounded-lg shadow p-6">
  <RTLFlex className="items-center gap-4 mb-4">
    <img src="/avatar.jpg" className="w-12 h-12 rounded-full" />
    <div>
      <h3 className="font-bold">نام کاربر</h3>
      <p className="text-gray-600">توضیحات</p>
    </div>
  </RTLFlex>
  <RTLText className="text-gray-700">
    محتوای کارت
  </RTLText>
</RTLContainer>
```

### منو با RTL
```tsx
<RTLContainer>
  <nav className="flex gap-4">
    <a href="/" className="hover:text-blue-600">خانه</a>
    <a href="/tours" className="hover:text-blue-600">تورها</a>
    <a href="/events" className="hover:text-blue-600">رویدادها</a>
  </nav>
</RTLContainer>
```

## نکات مهم

1. **همیشه از کامپوننت‌های RTL استفاده کنید** به جای hardcode کردن کلاس‌ها
2. **محتوای داینامیک** را بر اساس `isRTL` تنظیم کنید
3. **فونت‌ها** را بر اساس زبان انتخاب کنید
4. **آیکون‌ها** و **تصاویر** را در صورت نیاز معکوس کنید
5. **اعداد** را در فارسی به فارسی و در انگلیسی به انگلیسی نمایش دهید

## تست RTL

برای تست RTL:
1. به آدرس `/fa` بروید
2. مطمئن شوید که متن‌ها راست‌تراز هستند
3. مطمئن شوید که flexbox ها معکوس هستند
4. مطمئن شوید که فونت فارسی نمایش داده می‌شود
5. به آدرس `/en` بروید و مطمئن شوید که همه چیز درست کار می‌کند 