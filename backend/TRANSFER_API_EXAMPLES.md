# Transfer Booking API Examples

This document provides complete API examples for the transfer booking flow in the Peykan Tourism Platform.

## 🚀 Complete Transfer Booking Flow

### 1. Get Available Routes

**Endpoint:** `GET /api/transfers/routes/`

**Response:**
```json
{
  "count": 25,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Airport to City Center",
      "description": "Convenient transfer from Istanbul Airport to city center",
      "origin": "Istanbul Airport (IST)",
      "destination": "Taksim Square",
      "peak_hour_surcharge": 25.00,
      "midnight_surcharge": 50.00,
      "round_trip_discount_enabled": true,
      "round_trip_discount_percentage": 15.00,
      "is_active": true,
      "pricing": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "vehicle_type": "sedan",
          "vehicle_type_display": "Sedan",
          "base_price": 45.00,
          "max_passengers": 4,
          "max_luggage": 3,
          "is_active": true
        },
        {
          "id": "660e8400-e29b-41d4-a716-446655440002",
          "vehicle_type": "van",
          "vehicle_type_display": "Van",
          "base_price": 65.00,
          "max_passengers": 8,
          "max_luggage": 6,
          "is_active": true
        }
      ],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Get Popular Routes

**Endpoint:** `GET /api/transfers/routes/popular/`

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Airport to City Center",
    "origin": "Istanbul Airport (IST)",
    "destination": "Taksim Square",
    "popular_vehicle_type": "sedan",
    "base_price": 45.00,
    "card_image": "",
    "route_image": ""
  }
]
```

### 3. Get Route Details

**Endpoint:** `GET /api/transfers/routes/{id}/`

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Airport to City Center",
  "description": "Convenient transfer from Istanbul Airport to city center",
  "origin": "Istanbul Airport (IST)",
  "destination": "Taksim Square",
  "peak_hour_surcharge": 25.00,
  "midnight_surcharge": 50.00,
  "round_trip_discount_enabled": true,
  "round_trip_discount_percentage": 15.00,
  "is_active": true,
  "pricing": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "vehicle_type": "sedan",
      "vehicle_type_display": "Sedan",
      "base_price": 45.00,
      "max_passengers": 4,
      "max_luggage": 3,
      "is_active": true
    }
  ],
  "options": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "name": "Child Seat",
      "description": "Safety child seat for children under 4 years",
      "option_type": "equipment",
      "option_type_display": "Equipment",
      "price_type": "fixed",
      "price_type_display": "Fixed Price",
      "price": 10.00,
      "price_percentage": 0.00,
      "max_quantity": 2,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 4. Calculate Transfer Price

**Endpoint:** `POST /api/transfers/routes/{id}/calculate_price/`

**Request:**
```json
{
  "vehicle_type": "sedan",
  "booking_time": "08:30:00",
  "return_time": "18:00:00",
  "selected_options": [
    {
      "option_id": "770e8400-e29b-41d4-a716-446655440003",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "price_breakdown": {
    "base_price": 45.00,
    "outbound_price": 56.25,
    "outbound_surcharge": 11.25,
    "return_price": 45.00,
    "return_surcharge": 0.00,
    "options_total": 10.00,
    "round_trip_discount": 15.19,
    "final_price": 96.06
  },
  "trip_info": {
    "vehicle_type": "sedan",
    "is_round_trip": true,
    "booking_time": "08:30",
    "return_time": "18:00"
  },
  "route_info": {
    "origin": "Istanbul Airport (IST)",
    "destination": "Taksim Square",
    "name": "Airport to City Center"
  },
  "time_info": {
    "booking_hour": 8,
    "time_category": "peak",
    "surcharge_percentage": 25.0
  }
}
```

### 5. Add Transfer to Cart

**Endpoint:** `POST /api/cart/add/`

**Request:**
```json
{
  "product_type": "transfer",
  "product_id": "550e8400-e29b-41d4-a716-446655440000",
  "booking_date": "2024-02-15",
  "booking_time": "08:30:00",
  "quantity": 1,
  "booking_data": {
    "vehicle_type": "sedan",
    "trip_type": "round_trip",
    "outbound_time": "08:30:00",
    "return_time": "18:00:00",
    "outbound_date": "2024-02-15",
    "return_date": "2024-02-15",
    "passenger_count": 2,
    "luggage_count": 3,
    "pickup_address": "Terminal 1, Istanbul Airport",
    "pickup_instructions": "Wait at arrival gate",
    "dropoff_address": "Taksim Square, Istanbul",
    "dropoff_instructions": "Drop off at main entrance",
    "contact_name": "John Doe",
    "contact_phone": "+90 555 123 4567"
  },
  "selected_options": [
    {
      "option_id": "770e8400-e29b-41d4-a716-446655440003",
      "quantity": 1,
      "price": 10.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transfer added to cart successfully",
  "cart_item": {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "product_type": "transfer",
    "product_id": "550e8400-e29b-41d4-a716-446655440000",
    "booking_date": "2024-02-15",
    "booking_time": "08:30:00",
    "quantity": 1,
    "unit_price": 45.00,
    "total_price": 96.06,
    "currency": "USD",
    "selected_options": [
      {
        "option_id": "770e8400-e29b-41d4-a716-446655440003",
        "quantity": 1,
        "price": 10.00
      }
    ],
    "options_total": 10.00,
    "booking_data": {
      "vehicle_type": "sedan",
      "trip_type": "round_trip",
      "outbound_time": "08:30:00",
      "return_time": "18:00:00",
      "outbound_date": "2024-02-15",
      "return_date": "2024-02-15",
      "passenger_count": 2,
      "luggage_count": 3,
      "pickup_address": "Terminal 1, Istanbul Airport",
      "pickup_instructions": "Wait at arrival gate",
      "dropoff_address": "Taksim Square, Istanbul",
      "dropoff_instructions": "Drop off at main entrance",
      "contact_name": "John Doe",
      "contact_phone": "+90 555 123 4567"
    }
  }
}
```

### 6. Get Cart Summary

**Endpoint:** `GET /api/cart/`

**Response:**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440005",
  "session_id": "abc123def456",
  "user": 1,
  "currency": "USD",
  "is_active": true,
  "expires_at": "2024-02-16T10:30:00Z",
  "total_items": 1,
  "subtotal": 96.06,
  "total": 96.06,
  "items": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "product_type": "transfer",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "booking_date": "2024-02-15",
      "booking_time": "08:30:00",
      "variant_id": null,
      "variant_name": "Sedan",
      "quantity": 1,
      "unit_price": 45.00,
      "total_price": 96.06,
      "currency": "USD",
      "selected_options": [
        {
          "option_id": "770e8400-e29b-41d4-a716-446655440003",
          "quantity": 1,
          "price": 10.00
        }
      ],
      "options_total": 10.00,
      "booking_data": {
        "vehicle_type": "sedan",
        "trip_type": "round_trip",
        "outbound_time": "08:30:00",
        "return_time": "18:00:00",
        "outbound_date": "2024-02-15",
        "return_date": "2024-02-15",
        "passenger_count": 2,
        "luggage_count": 3,
        "pickup_address": "Terminal 1, Istanbul Airport",
        "pickup_instructions": "Wait at arrival gate",
        "dropoff_address": "Taksim Square, Istanbul",
        "dropoff_instructions": "Drop off at main entrance",
        "contact_name": "John Doe",
        "contact_phone": "+90 555 123 4567"
      },
      "is_reserved": false,
      "reservation_expires_at": null,
      "created_at": "2024-02-15T10:30:00Z"
    }
  ],
  "created_at": "2024-02-15T10:30:00Z"
}
```

### 7. Create Order from Cart

**Endpoint:** `POST /api/orders/create/`

**Request:**
```json
{
  "payment_method": "credit_card",
  "billing_address": "123 Main St, Istanbul, Turkey",
  "customer_notes": "Please call upon arrival"
}
```

**Response:**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440006",
  "order_number": "ORD2024001",
  "status": "pending",
  "payment_status": "pending",
  "payment_method": "credit_card",
  "subtotal": 96.06,
  "tax_amount": 0.00,
  "discount_amount": 0.00,
  "total_amount": 96.06,
  "currency": "USD",
  "customer_name": "John Doe",
  "customer_email": "john.doe@example.com",
  "customer_phone": "+90 555 123 4567",
  "billing_address": "123 Main St, Istanbul, Turkey",
  "customer_notes": "Please call upon arrival",
  "created_at": "2024-02-15T10:30:00Z",
  "items": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440007",
      "product_type": "transfer",
      "product_id": "550e8400-e29b-41d4-a716-446655440000",
      "product_title": "Airport to City Center",
      "product_slug": "airport-to-city-center",
      "booking_date": "2024-02-15",
      "booking_time": "08:30:00",
      "variant_id": null,
      "variant_name": "Sedan",
      "quantity": 1,
      "unit_price": 45.00,
      "total_price": 96.06,
      "currency": "USD",
      "selected_options": [
        {
          "option_id": "770e8400-e29b-41d4-a716-446655440003",
          "quantity": 1,
          "price": 10.00
        }
      ],
      "options_total": 10.00,
      "booking_data": {
        "vehicle_type": "sedan",
        "trip_type": "round_trip",
        "outbound_time": "08:30:00",
        "return_time": "18:00:00",
        "outbound_date": "2024-02-15",
        "return_date": "2024-02-15",
        "passenger_count": 2,
        "luggage_count": 3,
        "pickup_address": "Terminal 1, Istanbul Airport",
        "pickup_instructions": "Wait at arrival gate",
        "dropoff_address": "Taksim Square, Istanbul",
        "dropoff_instructions": "Drop off at main entrance",
        "contact_name": "John Doe",
        "contact_phone": "+90 555 123 4567"
      },
      "status": "pending",
      "created_at": "2024-02-15T10:30:00Z"
    }
  ]
}
```

## 🔧 Business Rules & Validations

### Transfer-Specific Rules:

1. **Unique Booking**: Only one transfer can be booked per cart (quantity is always 1)
2. **Time Validations**: 
   - Booking time must be in the future
   - Return time must be after outbound time for round trips
3. **Capacity Validations**:
   - Passenger count cannot exceed vehicle max_passengers
   - Luggage count cannot exceed vehicle max_luggage
4. **Pricing Rules**:
   - Peak hours (7-9 AM, 5-7 PM): +25% surcharge
   - Midnight hours (10 PM - 6 AM): +50% surcharge
   - Round trip discount: 15% off total base price
5. **Options**: Each option has max_quantity limit

### Error Responses:

**400 Bad Request:**
```json
{
  "error": "validation_error",
  "message": "Passenger count exceeds maximum capacity for this vehicle type.",
  "details": {
    "field": "passenger_count",
    "max_allowed": 4,
    "provided": 6
  }
}
```

**404 Not Found:**
```json
{
  "error": "not_found",
  "message": "Transfer route not found"
}
```

**409 Conflict:**
```json
{
  "error": "conflict",
  "message": "A transfer is already in your cart. Please remove it first."
}
```

## 🧪 Testing Scenarios

### 1. Basic One-Way Transfer
- Route: Airport to City
- Vehicle: Sedan
- Time: 14:00 (normal hours)
- Expected: Base price only

### 2. Round Trip with Peak Hour
- Route: Airport to City
- Vehicle: Van
- Outbound: 08:00 (peak)
- Return: 18:00 (peak)
- Expected: Base price + surcharges - round trip discount

### 3. Transfer with Options
- Route: Airport to City
- Vehicle: Sedan
- Options: Child seat (1x), Meet & Greet (1x)
- Expected: Base price + options total

### 4. Midnight Transfer
- Route: Airport to City
- Vehicle: SUV
- Time: 23:30 (midnight)
- Expected: Base price + 50% surcharge

### 5. Capacity Validation
- Route: Airport to City
- Vehicle: Sedan (max 4 passengers)
- Passengers: 6
- Expected: 400 validation error

## 📱 Frontend Integration

### JavaScript Example:

```javascript
// Calculate transfer price
const calculatePrice = async (routeId, bookingData) => {
  const response = await fetch(`/api/transfers/routes/${routeId}/calculate_price/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(bookingData)
  });
  
  return response.json();
};

// Add to cart
const addToCart = async (transferData) => {
  const response = await fetch('/api/cart/add/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(transferData)
  });
  
  return response.json();
};
```

## 🔐 Authentication

All endpoints require JWT authentication except:
- `GET /api/transfers/routes/` (public)
- `GET /api/transfers/routes/popular/` (public)
- `GET /api/transfers/routes/{id}/` (public)
- `POST /api/transfers/routes/{id}/calculate_price/` (public)

Include in headers:
```
Authorization: Bearer <access_token>
``` 

















# 🎨 **معماری فرانت‌اند ایده‌آل Peykan Tourism**

## 📋 **خلاصه اجرایی**

### **هدف: فرانت‌اند کامل با تمام قابلیت‌های بک‌اند**
- 🌐 **3 زبان** (فارسی، انگلیسی، ترکی)
- 💰 **4 ارز** (USD, EUR, TRY, IRR)
- 🛒 **سبد خرید** پیشرفته
- 💳 **پرداخت** چند ارزی
- 📱 **Responsive** و PWA

---

## 🏗️ **۱. ساختار کلی فرانت‌اند**

### **📁 ساختار فایل‌ها:**
```
frontend/
├── app/
│   ├── [locale]/           # مسیریابی چندزبانه
│   │   ├── tours/          # صفحات تور
│   │   ├── events/         # صفحات ایونت
│   │   ├── transfers/      # صفحات ترانسفر
│   │   ├── cart/           # سبد خرید
│   │   ├── checkout/       # پرداخت
│   │   ├── profile/        # پروفایل کاربر
│   │   └── admin/          # پنل ادمین
│   ├── api/                # API Routes
│   └── globals.css
├── components/
│   ├── ui/                 # کامپوننت‌های پایه
│   ├── features/           # کامپوننت‌های خاص
│   ├── layout/             # لایوت و ناوبری
│   └── forms/              # فرم‌ها
├── lib/
│   ├── api/                # سرویس‌های API
│   ├── hooks/              # Custom Hooks
│   ├── stores/             # State Management
│   └── utils/              # ابزارها
└── public/
    ├── images/
    └── locales/            # فایل‌های ترجمه
```

---

## 🎯 **۲. صفحات اصلی**

### **🏠 صفحه اصلی (Homepage):**
```typescript
// app/[locale]/page.tsx
export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Search Section */}
      <SearchSection />
      
      {/* Featured Tours */}
      <FeaturedTours />
      
      {/* Popular Events */}
      <PopularEvents />
      
      {/* Transfer Services */}
      <TransferServices />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* About Section */}
      <AboutSection />
    </div>
  )
}
```

### **🗺️ صفحه تورها:**
```typescript
// app/[locale]/tours/page.tsx
export default function ToursPage() {
  return (
    <div className="container mx-auto">
      {/* Filters */}
      <TourFilters />
      
      {/* Tour Grid */}
      <TourGrid />
      
      {/* Pagination */}
      <Pagination />
    </div>
  )
}
```

### **🎭 صفحه ایونت‌ها:**
```typescript
// app/[locale]/events/page.tsx
export default function EventsPage() {
  return (
    <div className="container mx-auto">
      {/* Event Calendar */}
      <EventCalendar />
      
      {/* Event List */}
      <EventList />
      
      {/* Venue Map */}
      <VenueMap />
    </div>
  )
}
```

---

## 🛒 **۳. سیستم سبد خرید**

### **🛒 کامپوننت سبد خرید:**
```typescript
// components/cart/CartProvider.tsx
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [currency, setCurrency] = useState('USD')
  
  const addToCart = async (product: CartItem) => {
    // تبدیل ارز خودکار
    const convertedProduct = await convertCurrency(product, currency)
    // اضافه کردن به سبد خرید
  }
  
  const removeFromCart = async (itemId: string) => {
    // حذف از سبد خرید
  }
  
  const updateQuantity = async (itemId: string, quantity: number) => {
    // بروزرسانی تعداد
  }
  
  return (
    <CartContext.Provider value={{
      cart,
      currency,
      addToCart,
      removeFromCart,
      updateQuantity,
      setCurrency
    }}>
      {children}
    </CartContext.Provider>
  )
}
```

### **🛒 کامپوننت آیتم سبد خرید:**
```typescript
// components/cart/CartItem.tsx
export function CartItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart, currency } = useCart()
  
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.title} />
      <div className="item-details">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="price">
          {formatPrice(item.unit_price, currency)}
        </div>
        <QuantitySelector 
          value={item.quantity}
          onChange={(qty) => updateQuantity(item.id, qty)}
        />
        <button onClick={() => removeFromCart(item.id)}>
          حذف
        </button>
      </div>
    </div>
  )
}
```

---

## 💳 **۴. سیستم پرداخت**

### **💳 صفحه پرداخت:**
```typescript
// app/[locale]/checkout/page.tsx
export default function CheckoutPage() {
  const { cart, currency } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('card')
  
  const handlePayment = async (paymentData: PaymentData) => {
    try {
      // تبدیل ارز به ارز درگاه پرداخت
      const gatewayCurrency = 'USD' // یا ارز درگاه
      const convertedAmount = await convertCurrency(
        cart.total, 
        currency, 
        gatewayCurrency
      )
      
      // ارسال به درگاه پرداخت
      const payment = await processPayment({
        ...paymentData,
        amount: convertedAmount,
        currency: gatewayCurrency
      })
      
      // بروزرسانی سفارش
      await updateOrder(payment.orderId, {
        status: 'paid',
        paymentId: payment.id
      })
      
    } catch (error) {
      // مدیریت خطا
    }
  }
  
  return (
    <div className="checkout-page">
      {/* اطلاعات سفارش */}
      <OrderSummary cart={cart} currency={currency} />
      
      {/* فرم اطلاعات شخصی */}
      <CustomerInfoForm />
      
      {/* انتخاب روش پرداخت */}
      <PaymentMethodSelector 
        value={paymentMethod}
        onChange={setPaymentMethod}
      />
      
      {/* فرم پرداخت */}
      <PaymentForm 
        method={paymentMethod}
        onSubmit={handlePayment}
      />
    </div>
  )
}
```

---

## 🌐 **۵. سیستم چندزبانه**

### **🌐 Provider چندزبانه:**
```typescript
// lib/providers/LanguageProvider.tsx
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('fa')
  const [direction, setDirection] = useState('rtl')
  
  const changeLanguage = (newLang: string) => {
    setLanguage(newLang)
    setDirection(newLang === 'fa' ? 'rtl' : 'ltr')
    // تغییر مسیر
    router.push(`/${newLang}${pathname}`)
  }
  
  return (
    <LanguageContext.Provider value={{
      language,
      direction,
      changeLanguage
    }}>
      <div dir={direction} lang={language}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}
```

### **🌐 کامپوننت تغییر زبان:**
```typescript
// components/ui/LanguageSwitcher.tsx
export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()
  
  const languages = [
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
  ]
  
  return (
    <div className="language-switcher">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={language === lang.code ? 'active' : ''}
        >
          <span>{lang.flag}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  )
}
```

---

## 💰 **۶. سیستم چند ارزی**

### **💰 کامپوننت تغییر ارز:**
```typescript
// components/ui/CurrencySwitcher.tsx
export function CurrencySwitcher() {
  const { currency, setCurrency } = useCart()
  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'IRR', symbol: 'ریال', name: 'Iranian Rial' }
  ]
  
  const handleCurrencyChange = async (newCurrency: string) => {
    // تبدیل قیمت‌ها
    await convertCartCurrency(newCurrency)
    setCurrency(newCurrency)
  }
  
  return (
    <div className="currency-switcher">
      {currencies.map(curr => (
        <button
          key={curr.code}
          onClick={() => handleCurrencyChange(curr.code)}
          className={currency === curr.code ? 'active' : ''}
        >
          <span>{curr.symbol}</span>
          <span>{curr.code}</span>
        </button>
      ))}
    </div>
  )
}
```

### **💰 Hook تبدیل ارز:**
```typescript
// lib/hooks/useCurrency.ts
export function useCurrency() {
  const convertCurrency = async (
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ) => {
    try {
      const response = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, fromCurrency, toCurrency })
      })
      
      const data = await response.json()
      return data.convertedAmount
    } catch (error) {
      // استفاده از نرخ‌های ثابت در صورت خطا
      return fallbackConvert(amount, fromCurrency, toCurrency)
    }
  }
  
  const formatPrice = (amount: number, currency: string) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      TRY: '₺',
      IRR: 'ریال'
    }
    
    const symbol = symbols[currency as keyof typeof symbols]
    
    if (currency === 'IRR') {
      return `${symbol}${amount.toLocaleString('fa-IR')}`
    }
    
    return `${symbol}${amount.toFixed(2)}`
  }
  
  return { convertCurrency, formatPrice }
}
```

---

## 🎨 **۷. کامپوننت‌های UI**

### **🎨 کامپوننت‌های پایه:**
```typescript
// components/ui/Button.tsx
export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={cn(
        'button',
        `button--${variant}`,
        `button--${size}`
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// components/ui/Card.tsx
export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  )
}

// components/ui/Input.tsx
export function Input({ 
  label, 
  error, 
  currency, 
  ...props 
}: InputProps) {
  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <div className="input-wrapper">
        {currency && <span className="currency-symbol">{currency}</span>}
        <input {...props} />
      </div>
      {error && <span className="error">{error}</span>}
    </div>
  )
}
```

---

## 📱 **۸. Responsive Design**

### **📱 Breakpoints:**
```css
/* globals.css */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile First */
.container {
  width: 100%;
  padding: 0 1rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

### **📱 کامپوننت‌های Responsive:**
```typescript
// components/layout/Navbar.tsx
export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo />
      </div>
      
      {/* Desktop Menu */}
      <div className="navbar-menu desktop">
        <NavLinks />
        <LanguageSwitcher />
        <CurrencySwitcher />
        <UserMenu />
      </div>
      
      {/* Mobile Menu */}
      <div className="navbar-menu mobile">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <MenuIcon />
        </button>
        
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <NavLinks />
            <LanguageSwitcher />
            <CurrencySwitcher />
            <UserMenu />
          </div>
        )}
      </div>
    </nav>
  )
}
```

---

## 🔧 **۹. State Management**

### **🔧 Zustand Store:**
```typescript
// lib/stores/useAppStore.ts
interface AppState {
  // User
  user: User | null
  isAuthenticated: boolean
  
  // Cart
  cart: Cart | null
  cartItems: CartItem[]
  
  // Preferences
  language: string
  currency: string
  theme: 'light' | 'dark'
  
  // Actions
  setUser: (user: User | null) => void
  setCart: (cart: Cart) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  setLanguage: (lang: string) => void
  setCurrency: (curr: string) => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  cart: null,
  cartItems: [],
  language: 'fa',
  currency: 'USD',
  theme: 'light',
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setCart: (cart) => set({ cart }),
  
  addToCart: (item) => {
    const { cartItems } = get()
    const existingItem = cartItems.find(i => i.id === item.id)
    
    if (existingItem) {
      set({
        cartItems: cartItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      })
    } else {
      set({ cartItems: [...cartItems, item] })
    }
  },
  
  removeFromCart: (itemId) => {
    const { cartItems } = get()
    set({ cartItems: cartItems.filter(i => i.id !== itemId) })
  },
  
  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),
  setTheme: (theme) => set({ theme })
}))
```

---

## 🚀 **۱۰. Performance Optimization**

### **🚀 Lazy Loading:**
```typescript
// app/[locale]/tours/page.tsx
import dynamic from 'next/dynamic'

const TourGrid = dynamic(() => import('@/components/tours/TourGrid'), {
  loading: () => <TourGridSkeleton />
})

const TourFilters = dynamic(() => import('@/components/tours/TourFilters'), {
  ssr: false
})
```

### **🚀 Image Optimization:**
```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image'

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false 
}: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  )
}
```

---

## 🧪 **۱۱. Testing Strategy**

### **🧪 Unit Tests:**
```typescript
// __tests__/components/CartItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CartItem } from '@/components/cart/CartItem'

describe('CartItem', () => {
  const mockItem = {
    id: '1',
    title: 'تور کاخ گلستان',
    price: 150,
    currency: 'USD',
    quantity: 2
  }
  
  it('renders item details correctly', () => {
    render(<CartItem item={mockItem} />)
    
    expect(screen.getByText('تور کاخ گلستان')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })
  
  it('calls updateQuantity when quantity changes', () => {
    const mockUpdateQuantity = jest.fn()
    render(<CartItem item={mockItem} onUpdateQuantity={mockUpdateQuantity} />)
    
    const quantityInput = screen.getByDisplayValue('2')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    
    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3)
  })
})
```

### **🧪 Integration Tests:**
```typescript
// __tests__/integration/cart-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CartProvider } from '@/components/cart/CartProvider'
import { TourCard } from '@/components/tours/TourCard'

describe('Cart Flow', () => {
  it('adds tour to cart and updates total', async () => {
    render(
      <CartProvider>
        <TourCard tour={mockTour} />
      </CartProvider>
    )
    
    const addToCartButton = screen.getByText('افزودن به سبد خرید')
    fireEvent.click(addToCartButton)
    
    await waitFor(() => {
      expect(screen.getByText('1 آیتم در سبد خرید')).toBeInTheDocument()
      expect(screen.getByText('$150.00')).toBeInTheDocument()
    })
  })
})
```

---

## 📊 **۱۲. Analytics & Monitoring**

### **📊 Google Analytics:**
```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, parameters: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
}

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url
    })
  }
}

// Track cart events
export const trackAddToCart = (product: any) => {
  trackEvent('add_to_cart', {
    currency: product.currency,
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.title,
      price: product.price,
      quantity: 1
    }]
  })
}
```

---

## 🎯 **۱۳. چک‌لیست نهایی**

### **✅ صفحات اصلی:**
- [ ] صفحه اصلی با Hero و Search
- [ ] صفحه تورها با فیلتر و جستجو
- [ ] صفحه جزئیات تور
- [ ] صفحه ایونت‌ها با تقویم
- [ ] صفحه ترانسفرها
- [ ] صفحه سبد خرید
- [ ] صفحه پرداخت
- [ ] صفحه پروفایل کاربر

### **✅ قابلیت‌های چندزبانه:**
- [ ] تغییر زبان (فارسی، انگلیسی، ترکی)
- [ ] RTL/LTR support
- [ ] ترجمه تمام متن‌ها
- [ ] مسیریابی چندزبانه

### **✅ قابلیت‌های چند ارزی:**
- [ ] تغییر ارز (USD, EUR, TRY, IRR)
- [ ] تبدیل خودکار قیمت‌ها
- [ ] فرمت‌بندی صحیح قیمت
- [ ] ذخیره ترجیحات کاربر

### **✅ سبد خرید و پرداخت:**
- [ ] افزودن/حذف از سبد خرید
- [ ] بروزرسانی تعداد
- [ ] محاسبه قیمت کل
- [ ] تبدیل ارز در پرداخت
- [ ] اتصال به درگاه پرداخت

### **✅ UI/UX:**
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility
- [ ] Dark/Light theme

### **✅ Performance:**
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Code splitting
- [ ] Caching strategies

---

## 🚀 **۱۴. مراحل پیاده‌سازی**

### **مرحله ۱: Foundation (2 هفته)**
1. ✅ Setup Next.js 14 با App Router
2. ✅ Configure TypeScript و ESLint
3. ✅ Setup Tailwind CSS
4. ✅ Create base components (Button, Input, Card)
5. ✅ Setup i18n با next-intl

### **مرحله ۲: Core Features (3 هفته)**
1. ✅ Implement authentication
2. ✅ Create tour listing و detail pages
3. ✅ Implement cart functionality
4. ✅ Setup multi-currency system
5. ✅ Create checkout flow

### **مرحله ۳: Advanced Features (2 هفته)**
1. ✅ Add event management
2. ✅ Implement transfer booking
3. ✅ Create user profile
4. ✅ Add search و filtering
5. ✅ Implement payment integration

### **مرحله ۴: Polish (1 هفته)**
1. ✅ Add animations و transitions
2. ✅ Optimize performance
3. ✅ Add error boundaries
4. ✅ Write tests
5. ✅ Deploy و monitoring

---

## 🎉 **نتیجه‌گیری**

### **فرانت‌اند ایده‌آل باید شامل:**
- **3 زبان** کامل با RTL support
- **4 ارز** با تبدیل خودکار
- **سبد خرید** پیشرفته
- **پرداخت** چند ارزی
- **UI/UX** مدرن و responsive
- **Performance** بهینه
- **Testing** کامل

### **اولویت‌ها:**
1. **Foundation** - زیرساخت پایه
2. **Core Features** - قابلیت‌های اصلی
3. **Multi-language** - چندزبانه
4. **Multi-currency** - چند ارزی
5. **Advanced Features** - قابلیت‌های پیشرفته

**آیا می‌خواهید شروع ب