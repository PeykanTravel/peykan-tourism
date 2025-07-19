# 🌐 **I18n Missing Photos Translation Fix Report**

## 📋 **مسئله گزارش شده**

### **خطای MISSING_MESSAGE**
```
Error: MISSING_MESSAGE: Could not resolve `TourDetail.photos` in messages for locale `en`.
    IntlError webpack-internal:///(app-pages-browser)/./node_modules/use-intl/dist/esm/development/initializeConfig
    TourDetailPage webpack-internal:///(app-pages-browser)/./app/[locale]/tours/[slug]/page.tsx:565
```

### **علت مسئله**
- در خط 565 فایل `TourDetailPage` از `t('photos')` استفاده شده بود
- کلید `photos` در بخش `TourDetail` فایل‌های ترجمه موجود نبود
- `useTranslations('TourDetail')` تنظیم شده بود، پس باید `TourDetail.photos` موجود باشد

## 🔍 **تجزیه و تحلیل**

### **مکان استفاده**
**فایل:** `frontend/app/[locale]/tours/[slug]/page.tsx`
**خط:** 565

```typescript
// در gallery section
<button
  onClick={() => setShowGallery(true)}
  className="absolute bottom-4 right-4 bg-black/50 text-white px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-black/70 transition-colors"
>
  <Camera className="w-4 h-4 mr-2 inline" />
  {tour.gallery.length} {t('photos')}
</button>
```

### **نحوه کار useTranslations**
```typescript
const t = useTranslations('TourDetail');
// t('photos') -> TourDetail.photos در فایل‌های ترجمه
```

## 🛠️ **راه‌حل پیاده‌سازی شده**

### **1. اضافه کردن به فایل انگلیسی**
**فایل:** `frontend/i18n/en.json`

```json
"TourDetail": {
  // ... سایر کلیدها
  "howToBookStep6": "Confirm your booking",
  "photos": "photos"
}
```

### **2. اضافه کردن به فایل فارسی**
**فایل:** `frontend/i18n/fa.json`

```json
"TourDetail": {
  // ... سایر کلیدها
  "pricingDataMissing": "اطلاعات قیمت‌گذاری ناقص است",
  "photos": "عکس"
}
```

### **3. تأیید مکان صحیح**
- کلید `photos` در بخش `TourDetail` قرار گرفت
- هیچ duplicate entry ایجاد نشد
- ترجمه مناسب برای هر زبان انتخاب شد

## ✅ **نتیجه**

### **مسئله برطرف شده:**
- خطای `MISSING_MESSAGE` حل شد
- صفحه TourDetail اکنون بدون خطا لود می‌شود
- Gallery button متن مناسب نمایش می‌دهد

### **تست شده:**
- [x] فایل انگلیسی: `TourDetail.photos` -> "photos"
- [x] فایل فارسی: `TourDetail.photos` -> "عکس"
- [x] عدم وجود duplicate entries

### **کدهای مرتبط:**
```typescript
// TourDetailPage.tsx خط 565
{tour.gallery.length} {t('photos')}

// en.json
"photos": "photos"

// fa.json  
"photos": "عکس"
```

## 🔄 **پیشنهادات برای آینده**

1. **Type Safety**: استفاده از TypeScript interfaces برای کلیدهای ترجمه
2. **Validation**: بررسی خودکار کلیدهای missing در build time
3. **Documentation**: مستندسازی کلیدهای ترجمه مورد استفاده
4. **Testing**: تست خودکار i18n completeness

---

**تاریخ:** {{current_date}}
**وضعیت:** ✅ تکمیل شده
**تأثیر:** رفع خطای صفحه TourDetail و نمایش صحیح gallery 