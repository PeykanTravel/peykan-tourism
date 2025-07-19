# 🏗️ **Clean Architecture Implementation - Frontend**

## 📋 **Overview**

This document outlines the implementation of Clean Architecture (DDD) for the Peykan Tourism frontend application. The architecture follows the principles of Domain-Driven Design with clear separation of concerns across multiple layers.

## 🏛️ **Architecture Layers**

### **1. Domain Layer** (`/lib/domain/`)
The innermost layer containing business logic and entities.

```
/lib/domain/
├── entities/
│   └── Common.ts          # Common types and interfaces
├── repositories/
│   └── EventsRepository.ts # Repository interfaces
└── index.ts               # Domain layer exports
```

**Responsibilities:**
- Define business entities and value objects
- Define repository interfaces
- Define domain services interfaces
- Business rules and validation logic

**Key Components:**
- `ApiResponse<T>` - Standard API response structure
- `PaginatedResponse<T>` - Pagination wrapper
- `ApiError` - Error handling structure
- `EventsRepository` - Events domain repository interface

### **2. Infrastructure Layer** (`/lib/infrastructure/`)
Handles external concerns like API calls, storage, and external services.

```
/lib/infrastructure/
├── api/
│   ├── client.ts          # Unified API client
│   ├── events.ts          # Events API implementation
│   ├── products.ts        # Products API implementation
│   └── index.ts           # API exports
├── repositories/
│   └── EventsRepositoryImpl.ts # Events repository implementation
└── index.ts               # Infrastructure layer exports
```

**Responsibilities:**
- Implement repository interfaces
- Handle API communication
- Manage external service integrations
- Data persistence and storage

**Key Components:**
- `ApiClient` - Unified HTTP client with interceptors
- `EventsApi` - Events API implementation
- `EventsRepositoryImpl` - Events repository implementation

### **3. Application Layer** (`/lib/application/`)
Contains application logic, use cases, and orchestration.

```
/lib/application/
├── services/
│   └── EventsService.ts   # Events application service
├── stores/
│   └── eventsStore.ts     # Events state management
├── hooks/
│   └── useEventsService.ts # Events custom hooks
└── index.ts               # Application layer exports
```

**Responsibilities:**
- Implement use cases
- Manage application state
- Provide custom hooks
- Orchestrate domain and infrastructure layers

**Key Components:**
- `EventsService` - Events application service
- `useEventsStore` - Zustand store for events state
- `useEventsService` - Custom hook for events operations

### **4. Presentation Layer** (`/app/` & `/components/`)
Handles UI components and user interactions.

```
/app/[locale]/events/
├── page.tsx               # Events page (refactored)
└── [slug]/page.tsx        # Event detail page

/components/
├── events/
│   └── EventCard.tsx      # Event card component
└── ui/
    └── SkeletonLoader.tsx # Loading components
```

**Responsibilities:**
- Render UI components
- Handle user interactions
- Manage component state
- Integrate with application layer

## 🔄 **Data Flow**

### **Traditional Flow (Before Refactoring):**
```
Page Component → Direct API Calls → Backend
```

### **Clean Architecture Flow (After Refactoring):**
```
Page Component → Application Layer → Domain Layer → Infrastructure Layer → Backend
```

**Example Flow for Events:**
1. **Page Component** (`/app/[locale]/events/page.tsx`)
   - Uses `useEventsStore` hook
   - Manages local UI state
   - Handles user interactions

2. **Application Layer** (`useEventsStore`)
   - Orchestrates business logic
   - Manages global state
   - Handles loading states

3. **Domain Layer** (`EventsRepository`)
   - Defines business contracts
   - Ensures type safety
   - Maintains business rules

4. **Infrastructure Layer** (`EventsRepositoryImpl`)
   - Implements API calls
   - Handles data transformation
   - Manages error handling

## 🛠️ **Key Improvements**

### **1. Unified API Client**
- **Before:** Multiple API clients with different configurations
- **After:** Single `ApiClient` with unified configuration
- **Benefits:** Consistent error handling, token management, and interceptors

### **2. Centralized State Management**
- **Before:** Local state in components with scattered logic
- **After:** Zustand stores with centralized state management
- **Benefits:** Predictable state updates, better performance, easier debugging

### **3. Type Safety**
- **Before:** Weak typing with `any` types
- **After:** Strong TypeScript interfaces throughout all layers
- **Benefits:** Better IDE support, fewer runtime errors, easier refactoring

### **4. Separation of Concerns**
- **Before:** Business logic mixed with UI components
- **After:** Clear separation between presentation and business logic
- **Benefits:** Easier testing, better maintainability, reusable components

### **5. Error Handling**
- **Before:** Inconsistent error handling across components
- **After:** Centralized error handling with proper error types
- **Benefits:** Better user experience, easier debugging, consistent error messages

## 📊 **Implementation Status**

### ✅ **Completed**
- [x] Unified API client with interceptors
- [x] Events domain layer (entities, repositories)
- [x] Events infrastructure layer (API, repository implementation)
- [x] Events application layer (service, store, hooks)
- [x] Refactored events page with clean architecture
- [x] Type safety improvements
- [x] Centralized state management

### 🔄 **In Progress**
- [ ] Products domain and infrastructure layers
- [ ] Transfers domain and infrastructure layers
- [ ] Auth domain and infrastructure layers
- [ ] Cart domain and infrastructure layers

### 📋 **Planned**
- [ ] Unit tests for all layers
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Documentation for all components

## 🚀 **Usage Examples**

### **Using Events Store in Components**
```typescript
import { useEventsStore } from '@/lib/application/stores/eventsStore';

export default function EventsPage() {
  const {
    events,
    filters,
    loadEvents,
    setEventFilters,
    clearEventFilters
  } = useEventsStore();

  // Component logic using the store
}
```

### **Using Events Service Directly**
```typescript
import { useEventsService } from '@/lib/application/hooks/useEventsService';

export default function EventDetail() {
  const {
    getEventBySlug,
    isLoading,
    error
  } = useEventsService();

  // Service usage
}
```

### **Custom API Client Usage**
```typescript
import { apiClient } from '@/lib/infrastructure/api/client';

// Direct API usage if needed
const response = await apiClient.get('/events/');
```

## 🔧 **Configuration**

### **Environment Variables**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### **API Client Configuration**
```typescript
// Default configuration in ApiClient
{
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
}
```

## 🧪 **Testing Strategy**

### **Unit Tests**
- Domain layer: Business logic and validation
- Infrastructure layer: API calls and data transformation
- Application layer: Use cases and state management

### **Integration Tests**
- API integration tests
- Store integration tests
- Component integration tests

### **E2E Tests**
- User journey tests
- Critical path testing

## 📈 **Performance Considerations**

### **Optimizations Implemented**
- Zustand stores with selective subscriptions
- Memoized selectors for expensive computations
- Lazy loading of components
- Optimized re-renders with React.memo

### **Future Optimizations**
- Virtual scrolling for large lists
- Image optimization and lazy loading
- Code splitting by routes
- Service worker for caching

## 🔒 **Security**

### **Implemented Security Measures**
- Token-based authentication
- Automatic token refresh
- Secure storage of sensitive data
- Input validation and sanitization

### **Best Practices**
- HTTPS enforcement
- CORS configuration
- XSS prevention
- CSRF protection

## 📚 **Documentation**

### **Code Documentation**
- JSDoc comments for all public APIs
- TypeScript interfaces for type safety
- README files for each layer
- Architecture decision records (ADRs)

### **User Documentation**
- Component usage examples
- API documentation
- Troubleshooting guides
- Performance guidelines

## 🤝 **Contributing**

### **Development Guidelines**
1. Follow the established architecture patterns
2. Write tests for new features
3. Update documentation
4. Use TypeScript for type safety
5. Follow the naming conventions

### **Code Review Checklist**
- [ ] Architecture compliance
- [ ] Type safety
- [ ] Error handling
- [ ] Performance considerations
- [ ] Test coverage
- [ ] Documentation updates

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** In Progress 