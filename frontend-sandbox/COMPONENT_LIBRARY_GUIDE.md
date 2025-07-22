# راهنمای کتابخانه کامپوننت‌ها - Peykan Tourism

## 🎯 **معرفی**

این راهنما تمام کامپوننت‌های موجود در پروژه Peykan Tourism را توضیح می‌دهد. همه کامپوننت‌ها با TypeScript، Tailwind CSS و Framer Motion پیاده‌سازی شده‌اند.

---

## 🏗️ **ساختار کامپوننت‌ها**

```
components/
├── ui/                    # کامپوننت‌های پایه
│   ├── Button.tsx        # دکمه با variants مختلف
│   ├── Card.tsx          # کارت با animations
│   ├── Input.tsx         # ورودی با validation
│   ├── Tabs.tsx          # تب‌ها
│   ├── AdvancedCard.tsx  # کارت پیشرفته
│   ├── AdvancedForm.tsx  # فرم پیشرفته
│   └── OptimizedComponents.tsx # کامپوننت‌های بهینه‌سازی شده
├── booking/              # کامپوننت‌های رزرو
│   ├── UnifiedBookingForm.tsx
│   ├── UnifiedBookingPage.tsx
│   ├── UnifiedBookingSidebar.tsx
│   ├── ProductSpecificComponents.tsx
│   └── ModernProductSpecificComponents.tsx
├── products/             # کامپوننت‌های محصولات
│   └── UnifiedProductPage.tsx
└── home/                 # کامپوننت‌های صفحه اصلی
    ├── HeroSection.tsx
    ├── AboutSection.tsx
    └── CTASection.tsx
```

---

## 🎨 **کامپوننت‌های پایه UI**

### **1. Button Component**

#### **`components/ui/Button.tsx`**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  children,
  onClick,
  className 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        },
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-11 px-8': size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
```

**استفاده:**
```typescript
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" loading={true}>
  Loading...
</Button>
```

### **2. Card Component**

#### **`components/ui/Card.tsx`**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  hover = false 
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        {
          'shadow-md': variant === 'elevated',
          'border-2': variant === 'outlined',
          'transition-all duration-200 hover:shadow-lg hover:scale-105': hover,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
```

**استفاده:**
```typescript
<Card variant="elevated" hover={true}>
  <div className="p-6">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <p className="text-gray-600">Card content goes here</p>
  </div>
</Card>
```

### **3. Input Component**

#### **`components/ui/Input.tsx`**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className,
  label,
  required = false
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

**استفاده:**
```typescript
<Input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  error={emailError}
  required={true}
/>
```

### **4. Tabs Component**

#### **`components/ui/Tabs.tsx`**
```typescript
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ 
  value, 
  onValueChange, 
  children, 
  className 
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState('');
  const currentValue = value || internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ 
  value, 
  children, 
  className 
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium',
        'ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        context.value === value
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background hover:text-foreground',
        className
      )}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ 
  value, 
  children, 
  className 
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}>
      {children}
    </div>
  );
}
```

**استفاده:**
```typescript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <div>Overview content</div>
  </TabsContent>
  <TabsContent value="itinerary">
    <div>Itinerary content</div>
  </TabsContent>
  <TabsContent value="reviews">
    <div>Reviews content</div>
  </TabsContent>
</Tabs>
```

---

## 🚀 **کامپوننت‌های پیشرفته**

### **1. AdvancedCard Component**

#### **`components/ui/AdvancedCard.tsx`**
```typescript
import { motion } from 'framer-motion';

interface AdvancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'tour' | 'event' | 'transfer';
  hover?: boolean;
  animate?: boolean;
}

export function AdvancedCard({ 
  children, 
  className, 
  variant = 'tour',
  hover = true,
  animate = true 
}: AdvancedCardProps) {
  const variants = {
    tour: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
    event: 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200',
    transfer: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200',
  };

  const CardComponent = animate ? motion.div : 'div';

  return (
    <CardComponent
      className={cn(
        'relative overflow-hidden rounded-xl border-2 p-6 shadow-lg',
        'transition-all duration-300 ease-in-out',
        variants[variant],
        hover && 'hover:shadow-xl hover:scale-105',
        className
      )}
      whileHover={hover && animate ? { y: -5 } : undefined}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
    >
      {children}
    </CardComponent>
  );
}

// Specialized card components
export function TourCard({ children, ...props }: AdvancedCardProps) {
  return <AdvancedCard variant="tour" {...props}>{children}</AdvancedCard>;
}

export function EventCard({ children, ...props }: AdvancedCardProps) {
  return <AdvancedCard variant="event" {...props}>{children}</AdvancedCard>;
}

export function TransferCard({ children, ...props }: AdvancedCardProps) {
  return <AdvancedCard variant="transfer" {...props}>{children}</AdvancedCard>;
}
```

**استفاده:**
```typescript
<TourCard hover={true} animate={true}>
  <h3 className="text-xl font-bold text-blue-900">Amazing Tour</h3>
  <p className="text-blue-700">Experience the best of nature</p>
</TourCard>

<EventCard>
  <h3 className="text-xl font-bold text-purple-900">Music Festival</h3>
  <p className="text-purple-700">Join us for an unforgettable night</p>
</EventCard>
```

### **2. AdvancedForm Component**

#### **`components/ui/AdvancedForm.tsx`**
```typescript
import { motion } from 'framer-motion';

interface AdvancedInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox';
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}

export function AdvancedInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  options = [],
  required = false,
  className
}: AdvancedInputProps) {
  const inputVariants = {
    focus: { scale: 1.02 },
    blur: { scale: 1 },
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            required={required}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={value}
            onChange={(e) => onChange?.(e.target.checked)}
            required={required}
          />
        );

      default:
        return (
          <input
            type={type}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            required={required}
          />
        );
    }
  };

  return (
    <motion.div
      className={cn('space-y-2', className)}
      variants={inputVariants}
      whileFocus="focus"
      whileBlur="blur"
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <motion.p
          className="text-sm text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

// Specialized form components
export function AdvancedSelect(props: Omit<AdvancedInputProps, 'type'>) {
  return <AdvancedInput type="select" {...props} />;
}

export function AdvancedCheckbox(props: Omit<AdvancedInputProps, 'type'>) {
  return <AdvancedInput type="checkbox" {...props} />;
}

export function AdvancedNumberInput(props: Omit<AdvancedInputProps, 'type'>) {
  return <AdvancedInput type="number" {...props} />;
}
```

**استفاده:**
```typescript
<AdvancedInput
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  error={emailError}
  required={true}
/>

<AdvancedSelect
  label="Country"
  value={country}
  onChange={setCountry}
  options={[
    { value: 'ir', label: 'Iran' },
    { value: 'us', label: 'United States' },
  ]}
  required={true}
/>

<AdvancedCheckbox
  label="I agree to terms and conditions"
  value={agreed}
  onChange={setAgreed}
  required={true}
/>
```

---

## 📋 **کامپوننت‌های رزرو**

### **1. UnifiedBookingForm**

#### **`components/booking/UnifiedBookingForm.tsx`**
```typescript
interface UnifiedBookingFormProps {
  productType: 'tour' | 'event' | 'transfer';
  productId: string;
  productData: any;
  onComplete?: (bookingData: any) => void;
  mode?: 'controlled' | 'uncontrolled';
  currentStep?: number;
  onStepChange?: (step: number) => void;
  formData?: any;
  onFormDataChange?: (data: any) => void;
}

export function UnifiedBookingForm({
  productType,
  productId,
  productData,
  onComplete,
  mode = 'uncontrolled',
  currentStep: externalStep,
  onStepChange,
  formData: externalFormData,
  onFormDataChange
}: UnifiedBookingFormProps) {
  const [internalStep, setInternalStep] = useState(0);
  const [internalFormData, setInternalFormData] = useState({});

  const currentStep = mode === 'controlled' ? externalStep! : internalStep;
  const formData = mode === 'controlled' ? externalFormData! : internalFormData;

  const handleStepChange = (step: number) => {
    if (mode === 'controlled') {
      onStepChange?.(step);
    } else {
      setInternalStep(step);
    }
  };

  const handleFormDataChange = (data: any) => {
    if (mode === 'controlled') {
      onFormDataChange?.(data);
    } else {
      setInternalFormData(data);
    }
  };

  const steps = getBookingSteps(productType);
  const currentStepConfig = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex-1 h-2 rounded-full transition-colors',
              index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      {/* Step Title */}
      <h2 className="text-2xl font-bold text-gray-900">
        {currentStepConfig.title}
      </h2>

      {/* Step Content */}
      <div className="space-y-4">
        {currentStepConfig.fields.map((field) => (
          <div key={field.name}>
            {renderField(field, formData, handleFormDataChange)}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleStepChange(currentStep - 1)}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => handleStepChange(currentStep + 1)}
          disabled={!validateStep(currentStepConfig, formData)}
        >
          {currentStep === steps.length - 1 ? 'Complete Booking' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
```

### **2. UnifiedBookingPage**

#### **`components/booking/UnifiedBookingPage.tsx`**
```typescript
interface UnifiedBookingPageProps {
  productType: 'tour' | 'event' | 'transfer';
  productId: string;
  productData: any;
}

export function UnifiedBookingPage({
  productType,
  productId,
  productData
}: UnifiedBookingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <UnifiedBookingForm
              productType={productType}
              productId={productId}
              productData={productData}
              mode="controlled"
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              formData={formData}
              onFormDataChange={setFormData}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UnifiedBookingSidebar
              productType={productType}
              productData={productData}
              formData={formData}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎭 **کامپوننت‌های محصولات**

### **1. ProductSpecificComponents**

#### **`components/booking/ProductSpecificComponents.tsx`**
```typescript
interface ProductSpecificUIProps {
  data: any;
  onSelect: (selection: any) => void;
}

export function TourSpecificUI({ data, onSelect }: ProductSpecificUIProps) {
  return (
    <div className="space-y-6">
      {/* Schedule Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.schedules?.map((schedule: any) => (
            <Card
              key={schedule.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect({ type: 'schedule', data: schedule })}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{schedule.date}</p>
                  <p className="text-sm text-gray-600">{schedule.duration} days</p>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  ${schedule.price}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Variant Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Variant</h3>
        <div className="space-y-3">
          {data.variants?.map((variant: any) => (
            <Card
              key={variant.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect({ type: 'variant', data: variant })}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-sm text-gray-600">{variant.description}</p>
                </div>
                <p className="text-lg font-bold text-green-600">
                  +${variant.price_modifier}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventSpecificUI({ data, onSelect }: ProductSpecificUIProps) {
  return (
    <div className="space-y-6">
      {/* Seat Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Seats</h3>
        <div className="grid grid-cols-8 gap-2">
          {data.seats?.map((seat: any) => (
            <button
              key={seat.id}
              className={cn(
                'p-2 text-xs rounded border transition-colors',
                seat.status === 'available'
                  ? 'bg-white hover:bg-blue-50 border-gray-300'
                  : seat.status === 'selected'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed'
              )}
              onClick={() => seat.status === 'available' && onSelect({ type: 'seat', data: seat })}
              disabled={seat.status !== 'available'}
            >
              {seat.row}{seat.number}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.dates?.map((date: any) => (
            <Card
              key={date.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect({ type: 'date', data: date })}
            >
              <div className="text-center">
                <p className="font-medium">{date.date}</p>
                <p className="text-sm text-gray-600">{date.time}</p>
                <p className="text-lg font-bold text-purple-600">
                  ${date.price}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TransferSpecificUI({ data, onSelect }: ProductSpecificUIProps) {
  return (
    <div className="space-y-6">
      {/* Route Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Route</h3>
        <div className="space-y-3">
          {data.routes?.map((route: any) => (
            <Card
              key={route.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect({ type: 'route', data: route })}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {route.departure_time} - {route.arrival_time}
                  </p>
                  <p className="text-sm text-gray-600">
                    {route.from_location} → {route.to_location}
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600">
                  ${route.price}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Vehicle Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Vehicle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.vehicles?.map((vehicle: any) => (
            <Card
              key={vehicle.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelect({ type: 'vehicle', data: vehicle })}
            >
              <div className="text-center">
                <p className="font-medium">{vehicle.name}</p>
                <p className="text-sm text-gray-600">{vehicle.capacity} passengers</p>
                <p className="text-lg font-bold text-green-600">
                  +${vehicle.price_modifier}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductSpecificSelector({ 
  productType, 
  data, 
  onSelect 
}: {
  productType: 'tour' | 'event' | 'transfer';
  data: any;
  onSelect: (selection: any) => void;
}) {
  switch (productType) {
    case 'tour':
      return <TourSpecificUI data={data} onSelect={onSelect} />;
    case 'event':
      return <EventSpecificUI data={data} onSelect={onSelect} />;
    case 'transfer':
      return <TransferSpecificUI data={data} onSelect={onSelect} />;
    default:
      return <div>Invalid product type</div>;
  }
}
```

---

## ⚡ **کامپوننت‌های بهینه‌سازی شده**

### **1. OptimizedComponents**

#### **`components/ui/OptimizedComponents.tsx`**
```typescript
import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';

// Virtual List Component
interface VirtualListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}

export const VirtualList = memo(({ items, height, itemHeight, renderItem }: VirtualListProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + Math.ceil(height / itemHeight) + 1, items.length);
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, scrollTop, height, itemHeight]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      style={{ height, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%',
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

// Loading Skeleton Component
interface LoadingSkeletonProps {
  type: 'card' | 'list' | 'text';
  count?: number;
  className?: string;
}

export const LoadingSkeleton = memo(({ type, count = 1, className }: LoadingSkeletonProps) => {
  const skeletons = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  const renderSkeleton = useCallback((index: number) => {
    switch (type) {
      case 'card':
        return (
          <div
            key={index}
            className={cn(
              'bg-white border-2 border-gray-300 rounded-lg p-4 space-y-3 shadow-md',
              'animate-pulse',
              className
            )}
          >
            <div className="h-48 bg-gray-200 rounded-lg" />
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        );

      case 'list':
        return (
          <div
            key={index}
            className={cn(
              'flex items-center space-x-4 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-md',
              'animate-pulse',
              className
            )}
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        );

      case 'text':
        return (
          <div
            key={index}
            className={cn('animate-pulse', className)}
          >
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        );

      default:
        return null;
    }
  }, [type, className]);

  return (
    <div className="space-y-4">
      {skeletons.map(renderSkeleton)}
    </div>
  );
});

// Performance Monitor Component
interface PerformanceMonitorProps {
  children: React.ReactNode;
  name: string;
}

export const PerformanceMonitor = memo(({ children, name }: PerformanceMonitorProps) => {
  const [renderCount, setRenderCount] = useState(0);
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    setRenderCount(prev => prev + 1);
    
    return () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };
  });

  return (
    <div>
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mb-2">
          {name}: Renders: {renderCount}, Time: {renderTime.toFixed(2)}ms
        </div>
      )}
      {children}
    </div>
  );
});
```

---

## 🎨 **استایل‌ها و انیمیشن‌ها**

### **1. CSS Animations**

#### **`app/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom animations */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

@keyframes enhanced-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 2s infinite;
}

.animate-enhanced-pulse {
  animation: enhanced-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* RTL Support */
[dir="rtl"] .space-x-2 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dark-mode-auto {
    @apply dark:bg-gray-900 dark:text-white;
  }
}
```

### **2. Framer Motion Animations**

```typescript
// Common animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Stagger animation for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

---

## 📱 **Responsive Design**

### **1. Breakpoint System**

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Responsive utility classes
const responsiveClasses = {
  container: 'w-full px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  text: 'text-sm sm:text-base lg:text-lg',
  spacing: 'space-y-4 sm:space-y-6 lg:space-y-8',
};
```

### **2. Mobile-First Approach**

```typescript
// Example of mobile-first component
export function ResponsiveCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      w-full p-4 
      sm:p-6 
      md:p-8 
      lg:p-10
      text-sm 
      sm:text-base 
      lg:text-lg
      rounded-lg 
      sm:rounded-xl 
      lg:rounded-2xl
    ">
      {children}
    </div>
  );
}
```

---

## 🧪 **Testing Components**

### **1. Component Testing**

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByText('Secondary Button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('shows loading state', () => {
    render(<Button loading={true}>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
```

### **2. Integration Testing**

```typescript
// __tests__/integration/BookingForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedBookingForm } from '../../components/booking/UnifiedBookingForm';

describe('UnifiedBookingForm Integration', () => {
  const mockProductData = {
    id: 'tour-1',
    title: 'Amazing Tour',
    price: 100,
    schedules: [
      { id: 's1', date: '2024-01-15', price: 100 },
      { id: 's2', date: '2024-01-20', price: 120 },
    ],
  };

  it('renders form with product data', () => {
    render(
      <UnifiedBookingForm
        productType="tour"
        productId="tour-1"
        productData={mockProductData}
      />
    );

    expect(screen.getByText('Amazing Tour')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const mockOnComplete = jest.fn();
    render(
      <UnifiedBookingForm
        productType="tour"
        productId="tour-1"
        productData={mockProductData}
        onComplete={mockOnComplete}
      />
    );

    // Fill form
    fireEvent.click(screen.getByText('2024-01-15'));
    fireEvent.change(screen.getByLabelText('Participants'), {
      target: { value: '2' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Complete Booking'));

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith({
        schedule: { id: 's1', date: '2024-01-15', price: 100 },
        participants: 2,
      });
    });
  });
});
```

---

## 📚 **Best Practices**

### **1. Component Design Principles**

- **Single Responsibility**: هر کامپوننت یک وظیفه مشخص دارد
- **Composition over Inheritance**: استفاده از ترکیب به جای وراثت
- **Props Interface**: تعریف interface برای props
- **Default Props**: تعریف مقادیر پیش‌فرض
- **Error Boundaries**: مدیریت خطاها

### **2. Performance Optimization**

- **React.memo**: برای جلوگیری از re-render غیرضروری
- **useMemo**: برای محاسبات سنگین
- **useCallback**: برای توابع که به عنوان props ارسال می‌شوند
- **Lazy Loading**: بارگذاری تدریجی کامپوننت‌ها
- **Code Splitting**: تقسیم کد به chunks کوچکتر

### **3. Accessibility**

- **Semantic HTML**: استفاده از تگ‌های معنادار
- **ARIA Labels**: برچسب‌های دسترسی
- **Keyboard Navigation**: پشتیبانی از کلیدهای جهت‌دار
- **Screen Reader**: سازگاری با نرم‌افزارهای خوانش
- **Color Contrast**: تضاد رنگی مناسب

### **4. Internationalization**

- **Translation Keys**: کلیدهای ترجمه استاندارد
- **RTL Support**: پشتیبانی از راست به چپ
- **Number Formatting**: فرمت‌بندی اعداد
- **Date Formatting**: فرمت‌بندی تاریخ
- **Currency Display**: نمایش ارز

---

**این راهنما به‌روزرسانی می‌شود. برای سوالات بیشتر با تیم توسعه تماس بگیرید!** 📞 