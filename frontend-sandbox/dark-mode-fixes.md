# Dark Mode Fixes - Comprehensive List

## Pages to Fix

### 1. Tour Detail Page (`/tours/[slug]/page.tsx`)
**Issues Found:**
- Background: `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
- Navigation tabs: `bg-white` → `bg-white dark:bg-gray-800`
- Border: `border-gray-200` → `border-gray-200 dark:border-gray-700`
- Text colors: `text-gray-900` → `text-gray-900 dark:text-white`
- Text colors: `text-gray-600` → `text-gray-600 dark:text-gray-300`
- Text colors: `text-gray-700` → `text-gray-700 dark:text-gray-300`
- Highlights box: `bg-blue-50` → `bg-blue-50 dark:bg-blue-900/20`
- Highlights text: `text-blue-800` → `text-blue-800 dark:text-blue-200`
- Rules box: `bg-yellow-50` → `bg-yellow-50 dark:bg-yellow-900/20`
- Rules text: `text-yellow-800` → `text-yellow-800 dark:text-yellow-200`
- Required items box: `bg-gray-50` → `bg-gray-50 dark:bg-gray-800`
- Itinerary border: `border-gray-200` → `border-gray-200 dark:border-gray-700`

### 2. Event Detail Page (`/events/[slug]/page.tsx`)
**Similar issues as tour detail page**

### 3. Transfer Booking Pages (`/transfers/booking/*`)
**Issues to check:**
- Form elements (already fixed)
- Background colors
- Text colors
- Card backgrounds
- Border colors

### 4. Cart Page (`/cart/page.tsx`)
**Issues to check:**
- Cart item backgrounds
- Price displays
- Button colors
- Empty cart state

### 5. Checkout Page (`/checkout/page.tsx`)
**Issues to check:**
- Form styling
- Order summary
- Payment methods
- Confirmation steps

### 6. Authentication Pages
- Login (`/login/page.tsx`)
- Register (`/register/page.tsx`)
- Forgot Password (`/forgot-password/page.tsx`)
- Reset Password (`/reset-password/page.tsx`)
- OTP Modal
- Email Verification (`/verify-email/page.tsx`)

### 7. Profile Page (`/profile/page.tsx`)
**Issues to check:**
- Profile information cards
- Settings sections
- Order history
- Personal details

## Common Patterns to Fix

### Background Colors
```css
/* Before */
bg-gray-50
bg-white

/* After */
bg-gray-50 dark:bg-gray-900
bg-white dark:bg-gray-800
```

### Text Colors
```css
/* Before */
text-gray-900
text-gray-600
text-gray-700
text-gray-500

/* After */
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-300
text-gray-700 dark:text-gray-300
text-gray-500 dark:text-gray-400
```

### Border Colors
```css
/* Before */
border-gray-200
border-gray-300

/* After */
border-gray-200 dark:border-gray-700
border-gray-300 dark:border-gray-600
```

### Card Backgrounds
```css
/* Before */
bg-white
bg-gray-50

/* After */
bg-white dark:bg-gray-800
bg-gray-50 dark:bg-gray-800
```

### Alert/Info Boxes
```css
/* Before */
bg-blue-50
bg-yellow-50
bg-green-50
bg-red-50

/* After */
bg-blue-50 dark:bg-blue-900/20
bg-yellow-50 dark:bg-yellow-900/20
bg-green-50 dark:bg-green-900/20
bg-red-50 dark:bg-red-900/20
```

## Priority Order
1. Tour Detail Page (high traffic)
2. Event Detail Page (high traffic)
3. Cart & Checkout (critical for conversion)
4. Authentication Pages (user experience)
5. Transfer Booking (complex forms)
6. Profile Page (user settings)

## Testing Checklist
- [ ] Light mode still works
- [ ] Dark mode toggle works
- [ ] Text is readable in both modes
- [ ] Forms are functional in both modes
- [ ] Images and icons are visible
- [ ] Buttons and links are clickable
- [ ] No contrast issues
- [ ] No broken layouts 