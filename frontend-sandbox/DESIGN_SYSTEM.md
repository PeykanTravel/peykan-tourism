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

## 🎨 Minimal Color Guideline (Apple/Nike Inspired)

### Allowed Colors
- **Blue**: Only for primary actions, links, and highlights (e.g. #3b82f6, #2563eb)
- **Gray**: For backgrounds, borders, secondary text (e.g. #f5f5f5, #a3a3a3, #404040)
- **White**: Main backgrounds, cards, surfaces (#fff)
- **Black**: Main text, strong emphasis (#171717, #000)

### Not Allowed
- No green, red, yellow, orange, purple, pink, etc. (except for icons or very subtle accent in rare cases)
- No colored backgrounds for badges/alerts (use border or icon only)
- No gradient backgrounds except for hero/CTA with very low opacity

### Usage Examples
- **Button (Primary):** Blue background, white text
- **Button (Secondary):** White background, blue border/text
- **Card:** White background, gray border, black text
- **Alert:** White/gray background, blue border or icon, black text
- **Badge:** Gray outline, black text

### Apple/Nike Inspiration
- Minimal, clean, high contrast
- Color only for action, not for decoration
- Emphasis with size, weight, whitespace, not color

---

## 🟦 Sample Color Tokens
```js
primary: {
  500: '#3b82f6', // blue
  600: '#2563eb',
},
neutral: {
  100: '#f5f5f5',
  400: '#a3a3a3',
  700: '#404040',
  900: '#171717',
},
white: '#fff',
black: '#000',
```

---

## ✅ How to Use
- Only use allowed colors in all components/pages
- For any new UI, check this guideline before adding color
- If you need to show status (success, error, ...), use icon or border, not background color

---

## Example: Minimal Button
```jsx
<Button className="bg-blue-600 text-white hover:bg-blue-700" />
<Button className="bg-white border border-blue-600 text-blue-600" />
```

## Example: Minimal Card
```jsx
<Card className="bg-white border border-gray-200 text-black" />
```

## Example: Minimal Alert
```jsx
<div className="border-l-4 border-blue-600 bg-white text-black p-4 flex items-center">
  <InfoIcon className="text-blue-600 mr-2" />
  <span>Alert message here</span>
</div>
```

---

## 🌙 Dark Mode Guideline

### Principles
- Always provide a dark background (`bg-gray-900` or `bg-black`) and high-contrast text (`text-white` or `text-gray-100`) in dark mode.
- Use `dark:` classes in Tailwind or equivalent CSS for all backgrounds, borders, and text.
- Never use low-contrast color pairs (e.g. blue on blue, gray on gray).
- For primary actions: `bg-blue-600 text-white dark:bg-blue-400 dark:text-black`
- For cards: `bg-white text-black dark:bg-gray-900 dark:text-white`
- For borders: `border-gray-200 dark:border-gray-700`
- For alerts: `bg-white text-black border-blue-600 dark:bg-gray-900 dark:text-white dark:border-blue-400`

### Example
```jsx
<Button className="bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 dark:bg-blue-400 dark:text-black dark:hover:bg-blue-500" />
<Card className="bg-white border border-gray-200 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
<div className="border-l-4 border-blue-600 bg-white text-black p-4 flex items-center dark:bg-gray-900 dark:text-white dark:border-blue-400">
  <InfoIcon className="text-blue-600 mr-2 dark:text-blue-400" />
  <span>Alert message here</span>
</div>
```

---

## 🌐 RTL (Right-to-Left) Support

### Principles
- Always use logical properties (`start`, `end`, `inline`, `block`) instead of `left`/`right` for margin, padding, border, etc.
- Use Tailwind’s `rtl:` and `ltr:` utilities or custom CSS for direction-specific styles.
- Font: Use a Persian/Arabic font (e.g. Vazirmatn) for RTL, and Inter for LTR.
- All icons, arrows, and navigation should flip direction in RTL (use `rtl:rotate-180` or RTL icon variant).

### Icon/Arrow Example
```jsx
<ArrowRight className="w-5 h-5 rtl:rotate-180" />
```
If you use a custom icon set, provide both LTR and RTL versions or use CSS transforms.

### Example
```jsx
<div className="text-right rtl:text-left ltr:text-right font-[Vazirmatn] rtl:font-[Vazirmatn] ltr:font-[Inter]">
  متن نمونه RTL
</div>
<Button className="px-4 py-2 border border-blue-600 text-blue-600 rtl:rounded-r-none ltr:rounded-l-none" />
```

---

## 📱 Responsive Design Guideline

### Principles
- Always use Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`, `xl:`) for all layout, spacing, and typography.
- Use `max-w-*`, `px-*`, `py-*`, `gap-*` for consistent spacing.
- Never hardcode pixel values for width/height; always use relative units or responsive classes.
- Test all components on mobile, tablet, and desktop.

### Example
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card className="p-4 md:p-6 lg:p-8" />
</div>
<h1 className="text-2xl md:text-3xl lg:text-4xl" />
<Button className="w-full md:w-auto" />
```

---

## ✅ Summary
- Always support dark mode, RTL, and responsive layouts in every component and page.
- Test for contrast, direction, and layout on all devices and languages.
- Use only the allowed color palette and follow the minimal, modern design principles. 