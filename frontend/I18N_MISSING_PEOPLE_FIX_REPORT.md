# 🌐 **I18n Missing People & Transport Types Fix Report**

## 📋 **مسئله گزارش شده**

### **خطای MISSING_MESSAGE**
```
Error: MISSING_MESSAGE: Could not resolve `TourDetail.people` in messages for locale `fa`.
    IntlError webpack-internal:///(app-pages-browser)/./node_modules/use-intl/dist/esm/development/initializeConfig
    TourDetailPage webpack-internal:///(app-pages-browser)/./app/[locale]/tours/[slug]/page.tsx:659
```

### **علت مسئله**
- کلید `people` در بخش `TourDetail` فایل ترجمه فارسی موجود نبود
- همچنین کلیدهای transport types نیز در فایل فارسی نبود
- `useTranslations('TourDetail')` تنظیم شده بود، پس باید `TourDetail.people` موجود باشد

## 🔍 **تجزیه و تحلیل**

### **کلیدهای موجود در فایل انگلیسی:**
```json
"information": "Information",
"type": "Type",
"transport": "Transport",
"capacity": "Capacity",
"dayTour": "Day Tour",
"nightTour": "Night Tour",
"boat": "Boat",
"land": "Land",
"air": "Air",
"people": "people",
"max": "Max",
"min": "Min"
```

### **کلیدهای مفقود در فایل فارسی:**
تمام کلیدهای فوق در فایل فارسی موجود نبودند.

## 🛠️ **راه‌حل پیاده‌سازی شده**

### **اضافه کردن کلیدهای مفقود به فایل فارسی**
**فایل:** `frontend/i18n/fa.json`

```json
"TourDetail": {
  // ... سایر کلیدها
  "participants": "شرکت‌کنندگان",
  "information": "اطلاعات",
  "type": "نوع",
  "transport": "حمل و نقل",
  "capacity": "ظرفیت",
  "dayTour": "تور روزانه",
  "nightTour": "تور شبانه",
  "boat": "قایق",
  "land": "زمینی",
  "air": "هوایی",
  "people": "نفر",
  "max": "حداکثر",
  "min": "حداقل"
}
```

### **کلیدهای اضافه شده:**
1. **`information`** - "اطلاعات"
2. **`type`** - "نوع"
3. **`transport`** - "حمل و نقل"
4. **`capacity`** - "ظرفیت"
5. **`dayTour`** - "تور روزانه"
6. **`nightTour`** - "تور شبانه"
7. **`boat`** - "قایق"
8. **`land`** - "زمینی"
9. **`air`** - "هوایی"
10. **`people`** - "نفر"
11. **`max`** - "حداکثر"
12. **`min`** - "حداقل"

## ✅ **نتیجه**

### **مسائل برطرف شده:**
1. ✅ خطای `MISSING_MESSAGE: Could not resolve 'TourDetail.people'` حل شد
2. ✅ تمام کلیدهای transport types اضافه شدند
3. ✅ صفحه TourDetail اکنون بدون خطا لود می‌شود
4. ✅ تمام متون مربوط به نوع حمل و نقل و ظرفیت نمایش داده می‌شوند

### **تست شده:**
- [x] فایل فارسی: `TourDetail.people` -> "نفر"
- [x] فایل فارسی: `TourDetail.boat` -> "قایق"
- [x] فایل فارسی: `TourDetail.land` -> "زمینی"
- [x] فایل فارسی: `TourDetail.air` -> "هوایی"
- [x] فایل فارسی: `TourDetail.dayTour` -> "تور روزانه"
- [x] فایل فارسی: `TourDetail.nightTour` -> "تور شبانه"

### **مکان‌های استفاده:**
- نمایش اطلاعات تور (نوع، حمل و نقل، ظرفیت)
- نمایش حداکثر و حداقل شرکت‌کنندگان
- نمایش نوع تور (روزانه/شبانه)
- نمایش نوع حمل و نقل (قایق/زمینی/هوایی)

## 🔄 **پیشنهادات**

1. **بررسی کامل فایل‌های ترجمه**: مقایسه کامل انگلیسی و فارسی
2. **Validation Tool**: ابزار بررسی کلیدهای مفقود
3. **CI/CD Integration**: بررسی خودکار completeness در build
4. **Type Safety**: TypeScript interfaces برای کلیدهای ترجمه

## 📊 **آمار تغییرات**
- **کلیدهای اضافه شده**: 12 کلید
- **فایل‌های تغییر یافته**: 1 فایل (`fa.json`)
- **خطاهای برطرف شده**: 1 خطای `MISSING_MESSAGE`

---

**تاریخ:** {{current_date}}
**وضعیت:** ✅ تکمیل شده
**تأثیر:** رفع خطاهای ترجمه و نمایش صحیح اطلاعات تور 