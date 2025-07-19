# Clean Architecture Refactoring Plan

## Current Issues
1. **Type Conflicts**: Multiple export conflicts between domain and infrastructure layers
2. **Repository Mismatches**: Repository implementations don't match their interfaces
3. **Entity Inconsistencies**: Domain entities have missing or incorrect methods
4. **Storage Issues**: Storage implementations have naming conflicts
5. **Component Dependencies**: Components are importing from multiple conflicting sources

## Refactoring Strategy

### Phase 1: Core Infrastructure (Priority 1)
1. **Fix Storage Layer**
   - ✅ Fixed SessionStorage and LocalStorage naming conflicts
   - ✅ Updated TypeScript configuration

2. **Simplify Domain Layer**
   - Remove complex aggregates that aren't being used
   - Keep only essential entities: User, Product, Cart, Order
   - Simplify value objects to basic types

3. **Consolidate Application Layer**
   - Keep only working services and hooks
   - Remove duplicate implementations
   - Create clean interfaces

### Phase 2: Repository Layer (Priority 2)
1. **Fix Repository Interfaces**
   - Align interfaces with actual API responses
   - Remove complex methods that aren't implemented
   - Simplify search criteria

2. **Update Repository Implementations**
   - Fix type mismatches
   - Align with simplified interfaces
   - Remove unused methods

### Phase 3: Component Integration (Priority 3)
1. **Update Components**
   - Use simplified application layer
   - Remove direct API calls
   - Use proper hooks and services

2. **Fix Type Errors**
   - Update component props
   - Fix import statements
   - Remove unused dependencies

## Target Architecture

```
lib/
├── application/           # Application layer
│   ├── hooks/            # React hooks
│   ├── services/         # Application services
│   └── stores/           # State management
├── domain/               # Domain layer (simplified)
│   ├── entities/         # Core entities
│   ├── repositories/     # Repository interfaces
│   └── value-objects/    # Basic value objects
├── infrastructure/       # Infrastructure layer
│   ├── api/             # API client
│   ├── repositories/    # Repository implementations
│   └── storage/         # Storage implementations
└── utils/               # Utilities
```

## Implementation Steps

1. **Create simplified domain entities**
2. **Fix repository interfaces**
3. **Update application services**
4. **Fix component imports**
5. **Remove unused files**
6. **Test core functionality**

## Success Criteria
- ✅ TypeScript compilation without errors
- ✅ Core functionality working (auth, products, cart)
- ✅ Clean import structure
- ✅ No duplicate implementations
- ✅ Proper separation of concerns 