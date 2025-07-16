# Apple-Inspired Design System for Peykan Tourism

## Overview

This document outlines the Apple-inspired design system implemented for the Peykan Tourism frontend. The design follows Apple's principles of clarity, deference, and depth while maintaining a modern, cohesive aesthetic.

## Design Principles

### 1. Clarity
- Clean, minimal interfaces
- Clear typography hierarchy
- Intuitive navigation
- Consistent spacing and alignment

### 2. Deference
- Content-first approach
- Subtle animations and transitions
- Non-intrusive UI elements
- Focus on user experience

### 3. Depth
- Layered visual hierarchy
- Subtle shadows and blur effects
- Smooth transitions
- Interactive feedback

## Color Palette

### Primary Colors
```css
/* Blue gradient - Primary brand color */
--primary-50: #f0f9ff
--primary-500: #0ea5e9
--primary-600: #0284c7
--primary-900: #0c4a6e
```

### Neutral Colors (Apple's signature grays)
```css
/* Neutral grays for text and backgrounds */
--neutral-50: #fafafa
--neutral-100: #f5f5f5
--neutral-500: #737373
--neutral-900: #171717
```

### Accent Colors
```css
/* Apple-style accent colors */
--accent-blue: #007AFF
--accent-green: #34C759
--accent-orange: #FF9500
--accent-red: #FF3B30
--accent-purple: #AF52DE
--accent-pink: #FF2D92
```

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px)
- **6xl**: 3.75rem (60px)
- **7xl**: 4.5rem (72px)

### Font Weights
- **thin**: 100
- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

## Spacing System

Based on Apple's 8pt grid system:
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **4**: 1rem (16px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)
- **20**: 5rem (80px)
- **24**: 6rem (96px)

## Border Radius

- **sm**: 0.125rem (2px)
- **base**: 0.25rem (4px)
- **md**: 0.375rem (6px)
- **lg**: 0.5rem (8px)
- **xl**: 0.75rem (12px)
- **2xl**: 1rem (16px)
- **3xl**: 1.5rem (24px)
- **full**: 9999px

## Shadows

### Apple-Style Shadows
```css
.shadow-apple-small {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.shadow-apple-medium {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.shadow-apple-large {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.shadow-apple-xlarge {
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.12);
}
```

## Gradients

### Apple-Style Gradients
```css
.bg-gradient-apple-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient-apple-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.bg-gradient-apple-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
```

## Animations

### Apple-Style Animations
```css
.animate-apple-bounce {
  animation: apple-bounce 2s infinite;
}

.animate-apple-pulse {
  animation: apple-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-apple-fade-in {
  animation: apple-fade-in 0.6s ease-out;
}

.animate-apple-slide-up {
  animation: apple-slide-up 0.6s ease-out;
}
```

## Components

### 1. ModernNavbar
- Fixed positioning with backdrop blur
- Smooth scroll-based background changes
- Responsive mobile menu
- Apple-style search functionality

### 2. AppleHeroSection
- Full-screen hero with video/image backgrounds
- Carousel with smooth transitions
- Integrated search form
- Apple-style typography and spacing

### 3. AppleFeaturesSection
- Grid-based feature cards
- Hover animations and effects
- Statistics display
- Call-to-action sections

## Usage Examples

### Button Styles
```jsx
// Primary button
<button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-apple-medium hover:shadow-apple-large">
  Primary Action
</button>

// Secondary button
<button className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium px-6 py-3 rounded-lg transition-all duration-300 border border-gray-200">
  Secondary Action
</button>
```

### Card Styles
```jsx
// Base card
<div className="bg-white rounded-2xl shadow-apple-medium border border-gray-100 overflow-hidden">
  Card content
</div>

// Elevated card
<div className="bg-white rounded-2xl shadow-apple-large border border-gray-100 overflow-hidden">
  Elevated content
</div>

// Glass card
<div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-apple-medium">
  Glass content
</div>
```

### Input Styles
```jsx
<input 
  type="text"
  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white"
  placeholder="Enter text..."
/>
```

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach
- All components are designed mobile-first
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized for mobile performance

## Accessibility

### Focus States
```css
*:focus {
  outline: none;
  ring: 2px;
  ring-color: #0ea5e9;
  ring-offset: 2px;
  ring-offset-color: white;
}
```

### Color Contrast
- All text meets WCAG AA standards
- High contrast ratios for readability
- Color-blind friendly palette

## Performance

### Optimizations
- CSS-in-JS for dynamic styles
- Optimized animations using transform and opacity
- Lazy loading for images and videos
- Minimal bundle size

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Implementation Notes

1. **CSS Custom Properties**: Use CSS variables for consistent theming
2. **Component Composition**: Build complex components from simple, reusable parts
3. **State Management**: Use React hooks for component state
4. **Internationalization**: Support for RTL languages (Persian)
5. **Dark Mode**: Ready for future dark mode implementation

## File Structure

```
frontend/
├── lib/
│   └── design-system/
│       └── apple-inspired-theme.ts
├── components/
│   ├── layout/
│   │   └── ModernNavbar.tsx
│   └── home/
│       ├── AppleHeroSection.tsx
│       └── AppleFeaturesSection.tsx
├── app/
│   └── globals.css
└── i18n/
    ├── fa.json
    └── en.json
```

## Future Enhancements

1. **Dark Mode**: Implement dark theme support
2. **Animation Library**: Add more Apple-style animations
3. **Component Library**: Expand with more reusable components
4. **Design Tokens**: Create a comprehensive design token system
5. **Storybook**: Add component documentation and testing

## Contributing

When contributing to the design system:

1. Follow Apple's design principles
2. Maintain consistency with existing components
3. Test on multiple devices and browsers
4. Ensure accessibility compliance
5. Update documentation for new components

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Pro Font](https://developer.apple.com/fonts/)
- [Apple Design Resources](https://developer.apple.com/design/resources/) 