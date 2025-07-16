# Frontend Component Architecture

## Overview

This document describes the component architecture for the Peykan Tourism frontend application, including recent refactoring improvements to create a more maintainable and scalable codebase.

## Key Principles

### 1. **Composition over Inheritance**
- Components are built using composition patterns
- Reusable base components with customizable slots
- Specialized components extend base functionality

### 2. **Single Responsibility**
- Each component has a single, well-defined purpose
- Complex components are broken down into smaller, focused components
- Business logic is separated from presentation logic

### 3. **Consistent Design System**
- Unified styling through base components
- Consistent spacing, colors, and typography
- Reusable design tokens and themes

## Component Structure

### Base Components (`components/ui/`)

#### `BaseCartItem.tsx`
**Purpose**: Reusable cart item component with common functionality

**Features**:
- Standard cart item layout and styling
- Common actions (remove, quantity change)
- Customizable sections via props
- Consistent error handling and loading states

**Usage**:
```typescript
<BaseCartItem
  item={item}
  isUpdating={isUpdating}
  onQuantityChange={onQuantityChange}
  onRemove={onRemove}
  formatPrice={formatPrice}
  formatDate={formatDate}
  customIcon={<Car className="h-5 w-5" />}
  customDetails={customDetails}
  customFooter={customFooter}
  className="border-l-4 border-green-500"
/>
```

**Customization Points**:
- `customIcon`: Header icon
- `customHeader`: Complete custom header
- `customDetails`: Product-specific details
- `customFooter`: Additional actions/info
- `className`: Additional styling
- `showQuantityControls`: Toggle quantity controls

#### `Modal.tsx`
**Purpose**: Reusable modal component with consistent behavior

**Features**:
- Keyboard navigation (ESC to close)
- Overlay click to close
- Multiple sizes (sm, md, lg, xl)
- Accessibility features
- Animation support

#### `ErrorBoundary.tsx`
**Purpose**: Error handling and recovery

**Features**:
- Catches JavaScript errors
- Displays user-friendly error messages
- Retry functionality
- Development vs. production modes
- Error logging integration

#### `Toast System`
**Purpose**: User notifications and feedback

**Components**:
- `ToastContext.tsx`: Global toast management
- `ToastProvider`: Context provider
- `useToast`: Hook for showing notifications

**Types**:
- Success notifications
- Error messages
- Warning alerts
- Info messages

### Specialized Components

#### Cart Components (`components/cart/`)

##### `TourCartItem.tsx`
**Purpose**: Display tour items in cart with tour-specific features

**Specific Features**:
- Participant breakdown (adults, children, infants)
- Tour duration and location
- Selected tour options
- Participant-based pricing

##### `EventCartItem.tsx`
**Purpose**: Display event items in cart

**Specific Features**:
- Event venue and rating
- Ticket information
- Event capacity
- Event-specific styling (purple theme)

##### `TransferCartItem.tsx`
**Purpose**: Display transfer items in cart

**Specific Features**:
- Route information (origin → destination)
- Vehicle details and features
- Distance and duration
- Transfer-specific styling (green theme)

#### Home Components (`components/home/`)

##### `HeroSection.tsx`
**Features**:
- Multi-slide carousel
- Search form with service type selection
- Responsive design
- Animation effects

##### `CTASection.tsx`
**Features**:
- Call-to-action with gradient background
- Internationalization support
- Hover effects

##### `StatsSection.tsx`
**Features**:
- Animated counters
- Statistics display
- Intersection observer for animations

## Design Patterns

### 1. **Compound Components**
```typescript
// Modal usage
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>
```

### 2. **Render Props**
```typescript
// Error boundary with custom fallback
<ErrorBoundary fallback={<CustomError />}>
  <MyComponent />
</ErrorBoundary>
```

### 3. **Higher-Order Components**
```typescript
// Wrap components with error boundaries
const SafeComponent = withErrorBoundary(MyComponent);
```

### 4. **Custom Hooks**
```typescript
// Reusable business logic
const { handleError, handleSuccess } = useErrorHandler();
const { showToast } = useToast();
```

## State Management

### Context Providers

#### `AuthContext`
- User authentication state
- Login/logout functionality
- User profile management

#### `CartContext`
- Cart items management
- Add/remove/update operations
- Cart persistence

#### `ToastContext`
- Global notifications
- Toast queue management
- Auto-dismiss functionality

#### `ThemeContext`
- Dark/light mode
- Theme persistence
- System preference detection

### State Flow

```
User Action → Component → Custom Hook → Context → API → State Update → UI Update
```

## Error Handling

### Global Error Handler
```typescript
// Centralized error processing
const { handleError } = useErrorHandler();

try {
  await apiCall();
} catch (error) {
  handleError(error, 'OPERATION_CONTEXT');
}
```

### Error Classification
- Network errors
- Authentication errors
- Validation errors
- Server errors
- Unknown errors

### User Feedback
- Toast notifications for errors
- Loading states during operations
- Success confirmations
- Retry mechanisms

## Performance Optimizations

### 1. **Code Splitting**
```typescript
// Lazy loading for routes
const TourPage = lazy(() => import('./pages/TourPage'));
```

### 2. **Memoization**
```typescript
// Expensive calculations
const memoizedValue = useMemo(() => expensiveFunction(deps), [deps]);
```

### 3. **Debouncing**
```typescript
// Search input debouncing
const debouncedSearch = useDebounce(searchTerm, 300);
```

## Testing Strategy

### Unit Tests
- Component rendering
- Hook functionality
- Utility functions
- Error scenarios

### Integration Tests
- Component interactions
- Context state changes
- API integrations
- User workflows

### E2E Tests
- Critical user paths
- Cross-browser compatibility
- Mobile responsiveness
- Performance benchmarks

## Future Improvements

### 1. **Component Library**
- Extract common components
- Create Storybook documentation
- Version and publish components

### 2. **Advanced State Management**
- Consider Redux Toolkit for complex state
- Implement state persistence
- Add state time-travel debugging

### 3. **Performance Monitoring**
- Bundle size monitoring
- Runtime performance metrics
- User experience analytics

### 4. **Accessibility**
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Migration Guide

### From Old to New Architecture

#### Cart Components
```typescript
// Old approach
<TourCartItem 
  item={item}
  // ... many props
/>

// New approach
<BaseCartItem
  item={item}
  customDetails={tourSpecificDetails}
  customIcon={<MapPin />}
/>
```

#### Error Handling
```typescript
// Old approach
try {
  // operation
} catch (error) {
  console.error(error);
  alert('Error occurred');
}

// New approach
try {
  // operation
} catch (error) {
  handleError(error, 'CONTEXT');
}
```

## Best Practices

### 1. **Component Design**
- Keep components small and focused
- Use TypeScript for type safety
- Implement proper error boundaries
- Follow naming conventions

### 2. **State Management**
- Use local state when possible
- Lift state up when needed
- Avoid prop drilling
- Use context for global state

### 3. **Performance**
- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Implement proper key props
- Optimize bundle size

### 4. **Accessibility**
- Use semantic HTML
- Implement proper ARIA attributes
- Support keyboard navigation
- Ensure proper color contrast

## Conclusion

The new component architecture provides a solid foundation for building maintainable and scalable React applications. By following these patterns and principles, developers can create consistent, reusable, and testable components that enhance the user experience while reducing development time and maintenance costs. 