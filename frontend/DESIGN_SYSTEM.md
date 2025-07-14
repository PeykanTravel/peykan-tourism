# Design System - Peykan Tourism

## 📋 خلاصه

این Design System برای پروژه Peykan Tourism طراحی شده است و شامل کامپوننت‌های پایه، tokens، و راهنمای استفاده می‌باشد.

## 🎨 Color System

### Primary Colors
```typescript
primary: {
  50: '#eff6ff',   // Lightest
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  // Main brand color
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',  // Darkest
}
```

### Secondary Colors
```typescript
secondary: {
  50: '#f0fdf4',   // Success colors
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',  // Main success color
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
}
```

### Semantic Colors
- **Success**: Green shades for positive actions
- **Warning**: Yellow/Orange shades for warnings
- **Error**: Red shades for errors and destructive actions

## 📝 Typography

### Font Families
```typescript
fontFamily: {
  sans: ['Inter', 'Vazirmatn', 'ui-sans-serif', 'system-ui'],
  serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
}
```

### Font Sizes
```typescript
fontSize: {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
}
```

### Text Styles
- **Headings**: h1-h6 with consistent sizing and spacing
- **Body**: Regular text with optimal line height
- **Caption**: Small text for secondary information
- **Button**: Optimized for button components

## 📏 Spacing System

### Base Spacing (4px Grid)
```typescript
spacing: {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
}
```

### Component-Specific Spacing
- **Button**: Different padding sizes for different button variants
- **Card**: Consistent padding for card components
- **Form**: Optimized spacing for form elements
- **Navigation**: Spacing for navigation components

## 📱 Breakpoints

### Mobile-First Approach
```typescript
breakpoints: {
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px', // 2X large devices (large desktops)
}
```

### Custom Breakpoints
- **xs**: 475px for very small devices
- **3xl**: 1600px for ultra-wide screens
- **4xl**: 1920px for large displays

## 🧩 Components

### Button
```typescript
import { Button } from '@/lib/design-system';

// Usage
<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

**Variants:**
- `primary`: Blue background, white text
- `secondary`: Gray background, dark text
- `outline`: Transparent with border
- `ghost`: Transparent, no border
- `danger`: Red background for destructive actions
- `success`: Green background for positive actions

**Sizes:**
- `sm`: Small (32px height)
- `md`: Medium (40px height) - Default
- `lg`: Large (48px height)
- `xl`: Extra large (56px height)

### Card
```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/lib/design-system';

// Usage
<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Variants:**
- `default`: Standard card with shadow
- `elevated`: Higher shadow for emphasis
- `outlined`: No shadow, prominent border
- `ghost`: No shadow or border

**Padding:**
- `none`: No padding
- `sm`: Small padding (12px)
- `md`: Medium padding (16px) - Default
- `lg`: Large padding (24px)
- `xl`: Extra large padding (32px)

### Input
```typescript
import { Input } from '@/lib/design-system';

// Usage
<Input
  label="Email"
  placeholder="Enter your email"
  leftIcon={<Mail className="w-4 h-4" />}
  error="Please enter a valid email"
/>
```

**Features:**
- Built-in label support
- Left and right icons
- Error and success states
- Helper text
- Full accessibility support

### Loading
```typescript
import { Loading, Skeleton } from '@/lib/design-system';

// Usage
<Loading variant="spinner" size="md" text="Loading..." />
<Skeleton variant="rectangular" width="200px" height="100px" />
```

**Loading Variants:**
- `spinner`: Circular loading animation
- `dots`: Animated dots
- `bars`: Animated bars

**Skeleton Variants:**
- `text`: Text placeholder
- `circular`: Circular placeholder
- `rectangular`: Rectangular placeholder

## 🎯 Usage Guidelines

### 1. Consistency
- همیشه از کامپوننت‌های Design System استفاده کنید
- از رنگ‌ها و فونت‌های تعریف شده استفاده کنید
- فاصله‌گذاری منسجم را رعایت کنید

### 2. Accessibility
- تمام کامپوننت‌ها ARIA labels دارند
- کنتراست رنگ مناسب رعایت شده
- Keyboard navigation پشتیبانی می‌شود

### 3. Responsive Design
- Mobile-first approach
- از breakpoints تعریف شده استفاده کنید
- محتوا در تمام دستگاه‌ها قابل دسترس باشد

### 4. Performance
- کامپوننت‌ها بهینه‌سازی شده‌اند
- Lazy loading برای تصاویر
- Bundle size بهینه

## 🔧 Development

### Installation
```bash
# Dependencies are already installed
npm install class-variance-authority clsx tailwind-merge
```

### Import
```typescript
// Import all components
import { Button, Card, Input, Loading } from '@/lib/design-system';

// Import specific components
import { Button } from '@/lib/design-system/components/Button/Button';
```

### Customization
```typescript
// Extend variants
const customButtonVariants = cva(
  buttonVariants,
  {
    variants: {
      // Add custom variants
    }
  }
);
```

## 📚 Examples

### Form Example
```typescript
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@/lib/design-system';

function ContactForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Name"
          placeholder="Enter your name"
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          required
        />
        <Input
          label="Message"
          placeholder="Enter your message"
          multiline
          rows={4}
        />
        <Button variant="primary" fullWidth>
          Send Message
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Loading State Example
```typescript
import { Loading, SkeletonLoader } from '@/lib/design-system';

function ToursList({ loading, tours }) {
  if (loading) {
    return <SkeletonLoader variant="card" count={6} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours.map(tour => (
        <TourCard key={tour.id} tour={tour} />
      ))}
    </div>
  );
}
```

## 🚀 Best Practices

1. **Reusability**: کامپوننت‌ها را قابل استفاده مجدد طراحی کنید
2. **Composition**: از composition pattern استفاده کنید
3. **Props**: Props را با TypeScript تعریف کنید
4. **Testing**: تمام کامپوننت‌ها را تست کنید
5. **Documentation**: مستندات کامل بنویسید

## 🔄 Updates

### Version 1.0.0
- ✅ Basic components (Button, Card, Input, Loading)
- ✅ Color and typography tokens
- ✅ Spacing system
- ✅ Responsive breakpoints
- ✅ Accessibility features

### Future Updates
- [ ] More components (Modal, Dropdown, etc.)
- [ ] Animation system
- [ ] Theme customization
- [ ] Component playground
- [ ] Storybook integration 