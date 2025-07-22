# راهنمای توسعه Peykan Tourism Frontend

## 🎯 **معرفی پروژه**

پروژه Peykan Tourism یک پلتفرم یکپارچه رزرو تور، رویداد و ترانسفر است که با Next.js 14 و Django backend پیاده‌سازی شده است.

---

## 🏗️ **معماری پروژه**

### **Frontend Architecture:**
```
frontend-sandbox/
├── app/[locale]/           # صفحات و روتینگ (Next.js App Router)
├── components/             # کامپوننت‌های React
│   ├── ui/                # کامپوننت‌های پایه (Button, Card, Input)
│   ├── booking/           # کامپوننت‌های رزرو یکپارچه
│   ├── products/          # کامپوننت‌های محصولات
│   └── home/              # کامپوننت‌های صفحه اصلی
├── lib/                   # کتابخانه‌ها و سرویس‌ها
│   ├── services/          # سرویس‌های پیشرفته (WebSocket, Analytics)
│   ├── stores/            # Zustand stores
│   ├── api/               # API clients
│   ├── hooks/             # Custom hooks
│   ├── contexts/          # React contexts
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── i18n/                  # بین‌المللی‌سازی
├── public/                # فایل‌های استاتیک
└── types/                 # TypeScript types
```

### **Backend Architecture (Django):**
```
backend/
├── tours/                 # مدل‌ها و API تور
├── events/                # مدل‌ها و API رویداد
├── transfers/             # مدل‌ها و API ترانسفر
├── users/                 # احراز هویت و کاربران
├── shared/                # سرویس‌های مشترک (ارز، زبان)
├── orders/                # مدیریت سفارشات
└── core/                  # تنظیمات اصلی
```

---

## 🚀 **شروع توسعه**

### **پیش‌نیازها:**
```bash
# Node.js 18+ و npm
node --version
npm --version

# Python 3.8+ و pip
python --version
pip --version
```

### **نصب Dependencies:**
```bash
# Frontend
cd frontend-sandbox
npm install

# Backend
cd ../backend
pip install -r requirements.txt
```

### **اجرای پروژه:**
```bash
# Frontend (Terminal 1)
cd frontend-sandbox
npm run dev

# Backend (Terminal 2)
cd backend
python manage.py runserver
```

---

## 📁 **ساختار فایل‌ها و توضیحات**

### **1. Unified Booking System**

#### **`components/booking/UnifiedBookingForm.tsx`**
- **هدف**: فرم یکپارچه رزرو برای همه محصولات
- **ویژگی‌ها**:
  - Dynamic field rendering
  - Step-by-step validation
  - Product-specific configuration
  - Real-time pricing calculation

#### **`components/booking/UnifiedBookingPage.tsx`**
- **هدف**: صفحه اصلی رزرو با UI کامل
- **ویژگی‌ها**:
  - Progress bar
  - Sidebar with pricing
  - Main content area
  - Responsive design

#### **`components/booking/ProductSpecificComponents.tsx`**
- **هدف**: UI مخصوص هر محصول
- **ویژگی‌ها**:
  - Tour-specific UI (schedule, variants)
  - Event-specific UI (seats, dates)
  - Transfer-specific UI (routes, vehicles)

### **2. State Management**

#### **`lib/stores/advancedStores.ts`**
- **هدف**: مدیریت state پیشرفته با Zustand
- **Stores**:
  - `useTourStore`: مدیریت state تورها
  - `useEventStore`: مدیریت state رویدادها
  - `useTransferStore`: مدیریت state ترانسفرها
  - `useBookingStore`: مدیریت state رزرو
  - `useUserPreferencesStore`: تنظیمات کاربر

#### **`lib/contexts/`**
- **هدف**: React Context برای state global
- **Contexts**:
  - `AuthContext`: احراز هویت
  - `CartContext`: سبد خرید
  - `UnifiedCartContext`: سبد خرید یکپارچه

### **3. API Integration**

#### **`lib/api/enhancedApi.ts`**
- **هدف**: API client پیشرفته
- **ویژگی‌ها**:
  - Caching
  - Retry mechanism
  - Rate limiting
  - Error handling
  - WebSocket support

#### **`lib/api/client.ts`**
- **هدف**: تنظیمات پایه API
- **ویژگی‌ها**:
  - Axios configuration
  - Interceptors
  - Base URL setup

### **4. Advanced Services**

#### **`lib/services/websocket.ts`**
- **هدف**: ارتباط Real-time
- **ویژگی‌ها**:
  - Auto-reconnection
  - Message queuing
  - Event handling
  - Toast notifications

#### **`lib/services/simpleAnalytics.ts`**
- **هدف**: تحلیل رفتار کاربر
- **ویژگی‌ها**:
  - Event tracking
  - User behavior analysis
  - Session management
  - Performance metrics

#### **`public/sw.js`**
- **هدف**: Service Worker برای Offline support
- **ویژگی‌ها**:
  - Caching strategies
  - Offline page
  - Background sync
  - Push notifications

### **5. UI Components**

#### **`components/ui/`**
- **هدف**: کامپوننت‌های پایه قابل استفاده مجدد
- **Components**:
  - `Button.tsx`: دکمه با variants مختلف
  - `Card.tsx`: کارت با animations
  - `Input.tsx`: ورودی با validation
  - `Tabs.tsx`: تب‌ها
  - `AdvancedCard.tsx`: کارت پیشرفته
  - `AdvancedForm.tsx`: فرم پیشرفته

#### **`components/ui/OptimizedComponents.tsx`**
- **هدف**: کامپوننت‌های بهینه‌سازی شده
- **Components**:
  - `VirtualList`: لیست مجازی
  - `LoadingSkeleton`: اسکلت بارگذاری
  - `PerformanceMonitor`: نظارت بر عملکرد

---

## 🔧 **الگوهای توسعه**

### **1. Component Pattern**
```typescript
// مثال: کامپوننت با TypeScript و Props
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Component({ variant = 'primary', size = 'md', children }: ComponentProps) {
  return (
    <div className={cn(
      'base-classes',
      variant === 'primary' && 'primary-classes',
      size === 'lg' && 'large-classes'
    )}>
      {children}
    </div>
  );
}
```

### **2. Hook Pattern**
```typescript
// مثال: Custom hook برای data fetching
export function useProductData(productId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductData(productId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [productId]);

  return { data, loading, error };
}
```

### **3. Store Pattern**
```typescript
// مثال: Zustand store
interface ProductStore {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const products = await api.getProducts();
      set({ products, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
  addProduct: (product) => {
    set((state) => ({ products: [...state.products, product] }));
  },
}));
```

### **4. Service Pattern**
```typescript
// مثال: Service class
class ProductService {
  private static instance: ProductService;
  
  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async getProducts(): Promise<Product[]> {
    // Implementation
  }
}
```

---

## 🎨 **Design System**

### **Colors:**
```typescript
// lib/design-system/theme.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#fdf4ff',
    500: '#a855f7',
    900: '#581c87',
  },
  // ...
};
```

### **Spacing:**
```typescript
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  // ...
};
```

### **Typography:**
```typescript
export const typography = {
  h1: 'text-4xl font-bold',
  h2: 'text-3xl font-semibold',
  h3: 'text-2xl font-medium',
  body: 'text-base',
  // ...
};
```

---

## 🌐 **Internationalization (i18n)**

### **ساختار فایل‌ها:**
```
i18n/
├── config.ts          # تنظیمات i18n
├── en.json           # ترجمه‌های انگلیسی
├── fa.json           # ترجمه‌های فارسی
└── types.ts          # TypeScript types
```

### **استفاده:**
```typescript
import { useTranslation } from 'next-i18next';

export function Component() {
  const { t } = useTranslation();
  
  return <h1>{t('common.title')}</h1>;
}
```

---

## 🔍 **Testing**

### **Unit Tests:**
```bash
npm run test
```

### **Component Tests:**
```bash
npm run test:components
```

### **E2E Tests:**
```bash
npm run test:e2e
```

---

## 📦 **Deployment**

### **Build:**
```bash
npm run build
```

### **Production:**
```bash
npm run start
```

### **Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

---

## 🐛 **Debugging**

### **Console Logs:**
```typescript
// استفاده از console.log با emoji برای تشخیص آسان
console.log('🔌 WebSocket connected');
console.log('📊 Analytics event tracked');
console.log('❌ Error occurred');
```

### **React DevTools:**
- نصب React DevTools extension
- بررسی state و props
- Profiling performance

### **Network Tab:**
- بررسی API calls
- WebSocket connections
- Cache behavior

---

## 📚 **منابع مفید**

### **Documentation:**
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### **Tools:**
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev)
- [React Hot Toast](https://react-hot-toast.com)

---

## 🤝 **Contribution Guidelines**

### **Code Style:**
- استفاده از TypeScript
- ESLint و Prettier
- Conventional Commits
- Component naming: PascalCase
- File naming: kebab-case

### **Git Workflow:**
```bash
# ایجاد branch جدید
git checkout -b feature/new-feature

# Commit با conventional format
git commit -m "feat: add new booking component"

# Push و ایجاد PR
git push origin feature/new-feature
```

### **Pull Request:**
- توضیح تغییرات
- Screenshots (در صورت نیاز)
- تست‌ها
- Documentation updates

---

## 📞 **پشتیبانی**

### **تیم توسعه:**
- **Lead Developer**: [نام]
- **Frontend Developer**: [نام]
- **Backend Developer**: [نام]

### **کانال‌های ارتباطی:**
- **Slack**: #peykan-tourism-dev
- **Email**: dev@peykan-tourism.com
- **GitHub Issues**: برای bug reports

---

**این راهنما به‌روزرسانی می‌شود. لطفاً تغییرات را مستند کنید!** 📝 