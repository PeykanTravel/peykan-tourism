# 🏗️ **برنامه جامع تکمیل معماری SOLID و DDD**

## 📋 **هدف کلی**
تبدیل سیستم فعلی به یک معماری کامل DDD با رعایت اصول SOLID در هر دو بخش بک‌اند و فرانت‌اند

## 🎯 **وضعیت فعلی**
- ✅ Clean Architecture (80% کامل)
- ✅ SOLID Principles (70% کامل)
- ❌ DDD (30% کامل)
- ❌ Domain Events (0% کامل)
- ❌ Aggregate Roots (0% کامل)
- ❌ Bounded Contexts (0% کامل)

---

## 🔧 **فاز ۱: تکمیل بک‌اند (Django)**

### **مرحله ۱.۱: تعریف Bounded Contexts**

```python
# backend/core/bounded_contexts.py
from enum import Enum
from typing import List, Dict

class BoundedContext(Enum):
    USER_MANAGEMENT = "user_management"
    PRODUCT_CATALOG = "product_catalog"
    BOOKING = "booking"
    INVENTORY = "inventory"
    PAYMENT = "payment"
    NOTIFICATION = "notification"

BOUNDED_CONTEXT_MAP = {
    BoundedContext.USER_MANAGEMENT: {
        'apps': ['users'],
        'domain': ['authentication', 'authorization', 'user_profile'],
        'aggregates': ['User', 'UserProfile', 'UserSession']
    },
    BoundedContext.PRODUCT_CATALOG: {
        'apps': ['tours', 'events', 'transfers'],
        'domain': ['product_management', 'pricing', 'availability'],
        'aggregates': ['Tour', 'Event', 'Transfer']
    },
    BoundedContext.BOOKING: {
        'apps': ['cart', 'orders'],
        'domain': ['booking_management', 'reservation', 'confirmation'],
        'aggregates': ['Cart', 'Order', 'Booking']
    },
    BoundedContext.INVENTORY: {
        'apps': ['events', 'tours'],
        'domain': ['capacity_management', 'seat_management', 'availability'],
        'aggregates': ['EventCapacity', 'TourCapacity', 'SeatInventory']
    }
}
```

### **مرحله ۱.۲: پیاده‌سازی Domain Events**

```python
# backend/core/domain_events.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict
import uuid

@dataclass
class DomainEvent(ABC):
    """Base domain event class"""
    event_id: uuid.UUID
    aggregate_id: uuid.UUID
    occurred_on: datetime
    event_type: str
    
    def __post_init__(self):
        if not self.event_id:
            self.event_id = uuid.uuid4()
        if not self.occurred_on:
            self.occurred_on = datetime.now()

@dataclass
class UserRegisteredEvent(DomainEvent):
    """Event raised when user is registered"""
    user_id: uuid.UUID
    email: str
    username: str

@dataclass
class SeatsReservedEvent(DomainEvent):
    """Event raised when seats are reserved"""
    event_id: uuid.UUID
    performance_id: uuid.UUID
    seat_ids: List[uuid.UUID]
    user_id: uuid.UUID

@dataclass
class OrderCreatedEvent(DomainEvent):
    """Event raised when order is created"""
    order_id: uuid.UUID
    user_id: uuid.UUID
    total_amount: Decimal
    currency: str

class DomainEventPublisher:
    """Domain event publisher"""
    
    def __init__(self):
        self._handlers: Dict[str, List[callable]] = {}
    
    def subscribe(self, event_type: str, handler: callable):
        """Subscribe to domain events"""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
    
    def publish(self, event: DomainEvent):
        """Publish domain event"""
        event_type = event.__class__.__name__
        if event_type in self._handlers:
            for handler in self._handlers[event_type]:
                handler(event)

# Global event publisher
domain_event_publisher = DomainEventPublisher()
```

### **مرحله ۱.۳: پیاده‌سازی Aggregate Roots**

```python
# backend/events/domain/aggregates.py
from typing import List, Optional
from decimal import Decimal
from core.domain_events import DomainEvent, SeatsReservedEvent, domain_event_publisher

class EventAggregate:
    """Event aggregate root"""
    
    def __init__(self, event: Event):
        self.event = event
        self._domain_events: List[DomainEvent] = []
        self._version = 0
    
    def reserve_seats(
        self, 
        performance_id: uuid.UUID, 
        seat_ids: List[uuid.UUID], 
        user_id: uuid.UUID
    ) -> bool:
        """Reserve seats for event"""
        # Business logic validation
        if not self._can_reserve_seats(performance_id, seat_ids):
            return False
        
        # Update aggregate state
        self._reserve_seats_internal(performance_id, seat_ids)
        
        # Raise domain event
        event = SeatsReservedEvent(
            aggregate_id=self.event.id,
            event_id=uuid.uuid4(),
            occurred_on=datetime.now(),
            event_type="SeatsReserved",
            event_id=self.event.id,
            performance_id=performance_id,
            seat_ids=seat_ids,
            user_id=user_id
        )
        
        self._domain_events.append(event)
        self._version += 1
        
        return True
    
    def _can_reserve_seats(self, performance_id: uuid.UUID, seat_ids: List[uuid.UUID]) -> bool:
        """Check if seats can be reserved"""
        # Business logic validation
        performance = self.event.performances.filter(id=performance_id).first()
        if not performance:
            return False
        
        # Check seat availability
        seats = Seat.objects.filter(
            performance=performance,
            id__in=seat_ids,
            status='available'
        )
        
        return len(seats) == len(seat_ids)
    
    def _reserve_seats_internal(self, performance_id: uuid.UUID, seat_ids: List[uuid.UUID]):
        """Internal method to reserve seats"""
        Seat.objects.filter(id__in=seat_ids).update(status='reserved')
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Get pending domain events"""
        events = self._domain_events.copy()
        self._domain_events.clear()
        return events
    
    def get_version(self) -> int:
        """Get aggregate version"""
        return self._version

class CartAggregate:
    """Cart aggregate root"""
    
    def __init__(self, cart: Cart):
        self.cart = cart
        self._domain_events: List[DomainEvent] = []
        self._version = 0
    
    def add_item(
        self, 
        product_type: str, 
        product_id: uuid.UUID, 
        quantity: int, 
        price: Decimal
    ) -> bool:
        """Add item to cart"""
        # Business logic validation
        if not self._can_add_item(product_type, product_id, quantity):
            return False
        
        # Create cart item
        cart_item = CartItem.objects.create(
            cart=self.cart,
            product_type=product_type,
            product_id=product_id,
            quantity=quantity,
            unit_price=price,
            total_price=price * quantity
        )
        
        # Raise domain event
        event = CartItemAddedEvent(
            aggregate_id=self.cart.id,
            event_id=uuid.uuid4(),
            occurred_on=datetime.now(),
            event_type="CartItemAdded",
            cart_id=self.cart.id,
            item_id=cart_item.id,
            product_type=product_type,
            product_id=product_id,
            quantity=quantity,
            price=price
        )
        
        self._domain_events.append(event)
        self._version += 1
        
        return True
    
    def _can_add_item(self, product_type: str, product_id: uuid.UUID, quantity: int) -> bool:
        """Check if item can be added to cart"""
        # Business logic validation
        if quantity <= 0:
            return False
        
        # Check product availability
        if product_type == 'event':
            event = Event.objects.filter(id=product_id, is_active=True).first()
            return event is not None and event.is_available_today
        
        return True
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Get pending domain events"""
        events = self._domain_events.copy()
        self._domain_events.clear()
        return events
```

### **مرحله ۱.۴: تکمیل Repository Pattern**

```python
# backend/core/repositories.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List
from django.db import models
from core.domain_events import DomainEvent

T = TypeVar('T')

class Repository(ABC, Generic[T]):
    """Generic repository interface"""
    
    @abstractmethod
    def save(self, aggregate: T) -> T:
        """Save aggregate and publish domain events"""
        pass
    
    @abstractmethod
    def get_by_id(self, aggregate_id: uuid.UUID) -> Optional[T]:
        """Get aggregate by ID"""
        pass
    
    @abstractmethod
    def delete(self, aggregate_id: uuid.UUID) -> bool:
        """Delete aggregate"""
        pass

class EventRepository(Repository[EventAggregate]):
    """Event repository implementation"""
    
    def save(self, aggregate: EventAggregate) -> EventAggregate:
        """Save event aggregate and publish domain events"""
        # Save the event
        aggregate.event.save()
        
        # Publish domain events
        for event in aggregate.get_domain_events():
            domain_event_publisher.publish(event)
        
        return aggregate
    
    def get_by_id(self, aggregate_id: uuid.UUID) -> Optional[EventAggregate]:
        """Get event aggregate by ID"""
        try:
            event = Event.objects.select_related(
                'category', 'venue'
            ).prefetch_related(
                'performances__sections__seats'
            ).get(id=aggregate_id)
            
            return EventAggregate(event)
        except Event.DoesNotExist:
            return None
    
    def delete(self, aggregate_id: uuid.UUID) -> bool:
        """Delete event aggregate"""
        try:
            event = Event.objects.get(id=aggregate_id)
            event.delete()
            return True
        except Event.DoesNotExist:
            return False
```

### **مرحله ۱.۵: تکمیل Use Cases**

```python
# backend/events/application/use_cases.py
from typing import List, Optional
from decimal import Decimal
from core.repositories import EventRepository
from core.domain_events import domain_event_publisher
from ..domain.aggregates import EventAggregate

class ReserveSeatsUseCase:
    """Use case for reserving event seats"""
    
    def __init__(self, event_repository: EventRepository):
        self.event_repository = event_repository
    
    def execute(
        self, 
        event_id: uuid.UUID, 
        performance_id: uuid.UUID, 
        seat_ids: List[uuid.UUID], 
        user_id: uuid.UUID
    ) -> bool:
        """Execute seat reservation"""
        # Get event aggregate
        event_aggregate = self.event_repository.get_by_id(event_id)
        if not event_aggregate:
            return False
        
        # Reserve seats
        success = event_aggregate.reserve_seats(performance_id, seat_ids, user_id)
        if success:
            # Save aggregate
            self.event_repository.save(event_aggregate)
        
        return success

class CalculateEventPricingUseCase:
    """Use case for calculating event pricing"""
    
    def __init__(self, event_repository: EventRepository):
        self.event_repository = event_repository
    
    def execute(
        self, 
        event_id: uuid.UUID, 
        performance_id: uuid.UUID, 
        seat_ids: List[uuid.UUID],
        selected_options: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Execute pricing calculation"""
        # Get event aggregate
        event_aggregate = self.event_repository.get_by_id(event_id)
        if not event_aggregate:
            return {}
        
        # Calculate pricing
        pricing = event_aggregate.calculate_pricing(
            performance_id, seat_ids, selected_options
        )
        
        return pricing
```

---

## 🎨 **فاز ۲: تکمیل فرانت‌اند (Next.js)**

### **مرحله ۲.۱: تعریف Domain Entities**

```typescript
// frontend/lib/domain/entities/Event.ts
export interface Event {
  id: string;
  title: string;
  description: string;
  slug: string;
  image: string;
  price: number;
  currency: string;
  category: EventCategory;
  venue: Venue;
  performances: EventPerformance[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventPerformance {
  id: string;
  eventId: string;
  date: Date;
  time: string;
  maxCapacity: number;
  currentCapacity: number;
  sections: EventSection[];
  isAvailable: boolean;
}

export interface EventSection {
  id: string;
  performanceId: string;
  name: string;
  totalCapacity: number;
  availableCapacity: number;
  basePrice: number;
  currency: string;
  isPremium: boolean;
  isWheelchairAccessible: boolean;
}

export interface Seat {
  id: string;
  sectionId: string;
  seatNumber: string;
  rowNumber: string;
  status: SeatStatus;
  price: number;
  isWheelchairAccessible: boolean;
  isPremium: boolean;
}

export enum SeatStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  BLOCKED = 'blocked'
}
```

### **مرحله ۲.۲: پیاده‌سازی Value Objects**

```typescript
// frontend/lib/domain/value-objects/Email.ts
export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    this.value = email;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// frontend/lib/domain/value-objects/Price.ts
export class Price {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'USD') {
    if (amount < 0) {
      throw new Error('Price cannot be negative');
    }
    this.amount = amount;
    this.currency = currency;
  }

  add(other: Price): Price {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add prices with different currencies');
    }
    return new Price(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Price {
    return new Price(this.amount * factor, this.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
```

### **مرحله ۲.۳: پیاده‌سازی Repository Interfaces**

```typescript
// frontend/lib/domain/repositories/EventRepository.ts
import { Event, EventPerformance, EventSection, Seat } from '../entities/Event';

export interface EventRepository {
  getById(id: string): Promise<Event | null>;
  getBySlug(slug: string): Promise<Event | null>;
  getAll(filters?: EventFilters): Promise<Event[]>;
  getPerformances(eventId: string): Promise<EventPerformance[]>;
  getSections(performanceId: string): Promise<EventSection[]>;
  getAvailableSeats(sectionId: string): Promise<Seat[]>;
  reserveSeats(seatIds: string[], userId: string): Promise<boolean>;
  releaseSeats(seatIds: string[]): Promise<boolean>;
}

export interface EventFilters {
  category?: string;
  venue?: string;
  dateFrom?: Date;
  dateTo?: Date;
  priceMin?: number;
  priceMax?: number;
  isAvailable?: boolean;
}

// frontend/lib/domain/repositories/CartRepository.ts
import { Cart, CartItem } from '../entities/Cart';

export interface CartRepository {
  getCart(userId: string): Promise<Cart | null>;
  addItem(cartId: string, item: CartItem): Promise<Cart>;
  updateItem(cartId: string, itemId: string, quantity: number): Promise<Cart>;
  removeItem(cartId: string, itemId: string): Promise<Cart>;
  clearCart(cartId: string): Promise<Cart>;
  getCartTotal(cartId: string): Promise<Price>;
}
```

### **مرحله ۲.۴: پیاده‌سازی Use Cases**

```typescript
// frontend/lib/domain/use-cases/events/ReserveSeatsUseCase.ts
import { EventRepository } from '../../repositories/EventRepository';
import { CartRepository } from '../../repositories/CartRepository';
import { Seat } from '../../entities/Event';
import { Price } from '../../value-objects/Price';

export class ReserveSeatsUseCase {
  constructor(
    private eventRepository: EventRepository,
    private cartRepository: CartRepository
  ) {}

  async execute(
    eventId: string,
    performanceId: string,
    seatIds: string[],
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate seats availability
      const seats = await this.validateSeatsAvailability(seatIds);
      if (!seats) {
        return { success: false, error: 'Seats not available' };
      }

      // Calculate total price
      const totalPrice = this.calculateTotalPrice(seats);

      // Reserve seats
      const reservationSuccess = await this.eventRepository.reserveSeats(
        seatIds,
        userId
      );

      if (!reservationSuccess) {
        return { success: false, error: 'Failed to reserve seats' };
      }

      // Add to cart
      const cart = await this.cartRepository.getCart(userId);
      if (cart) {
        await this.cartRepository.addItem(cart.id, {
          id: crypto.randomUUID(),
          productType: 'event',
          productId: eventId,
          performanceId,
          seatIds,
          quantity: seatIds.length,
          unitPrice: totalPrice.getAmount(),
          totalPrice: totalPrice.getAmount(),
          currency: totalPrice.getCurrency()
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async validateSeatsAvailability(seatIds: string[]): Promise<Seat[] | null> {
    // Implementation
    return null;
  }

  private calculateTotalPrice(seats: Seat[]): Price {
    const total = seats.reduce((sum, seat) => sum + seat.price, 0);
    return new Price(total, 'USD');
  }
}

// frontend/lib/domain/use-cases/events/CalculatePricingUseCase.ts
export class CalculatePricingUseCase {
  constructor(private eventRepository: EventRepository) {}

  async execute(
    eventId: string,
    performanceId: string,
    seatIds: string[],
    selectedOptions: string[] = []
  ): Promise<PricingBreakdown> {
    // Get event details
    const event = await this.eventRepository.getById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Calculate base price
    const seats = await this.eventRepository.getAvailableSeats(seatIds);
    const basePrice = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Calculate options price
    const optionsPrice = this.calculateOptionsPrice(selectedOptions);

    // Calculate taxes and fees
    const taxes = this.calculateTaxes(basePrice + optionsPrice);
    const fees = this.calculateFees(basePrice + optionsPrice);

    const total = basePrice + optionsPrice + taxes + fees;

    return {
      basePrice,
      optionsPrice,
      taxes,
      fees,
      total,
      currency: 'USD',
      breakdown: {
        seats: seats.map(seat => ({
          id: seat.id,
          price: seat.price,
          description: `${seat.sectionName} - Row ${seat.rowNumber} Seat ${seat.seatNumber}`
        })),
        options: selectedOptions.map(optionId => ({
          id: optionId,
          price: 0, // Get from options service
          description: 'Option description'
        }))
      }
    };
  }

  private calculateOptionsPrice(optionIds: string[]): number {
    // Implementation
    return 0;
  }

  private calculateTaxes(amount: number): number {
    // Implementation
    return amount * 0.1; // 10% tax
  }

  private calculateFees(amount: number): number {
    // Implementation
    return amount * 0.05; // 5% service fee
  }
}
```

### **مرحله ۲.۵: تکمیل Infrastructure Layer**

```typescript
// frontend/lib/infrastructure/repositories/EventRepositoryImpl.ts
import { EventRepository, EventFilters } from '../../domain/repositories/EventRepository';
import { Event, EventPerformance, EventSection, Seat } from '../../domain/entities/Event';
import { ApiClient } from '../api/ApiClient';

export class EventRepositoryImpl implements EventRepository {
  constructor(private apiClient: ApiClient) {}

  async getById(id: string): Promise<Event | null> {
    try {
      const response = await this.apiClient.get(`/api/v1/events/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  async getBySlug(slug: string): Promise<Event | null> {
    try {
      const response = await this.apiClient.get(`/api/v1/events/by-slug/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event by slug:', error);
      return null;
    }
  }

  async getAll(filters?: EventFilters): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await this.apiClient.get(`/api/v1/events/?${params}`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getPerformances(eventId: string): Promise<EventPerformance[]> {
    try {
      const response = await this.apiClient.get(`/api/v1/events/${eventId}/performances/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performances:', error);
      return [];
    }
  }

  async getSections(performanceId: string): Promise<EventSection[]> {
    try {
      const response = await this.apiClient.get(`/api/v1/performances/${performanceId}/sections/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      return [];
    }
  }

  async getAvailableSeats(sectionId: string): Promise<Seat[]> {
    try {
      const response = await this.apiClient.get(`/api/v1/sections/${sectionId}/seats/`);
      return response.data.filter((seat: Seat) => seat.status === 'available');
    } catch (error) {
      console.error('Error fetching available seats:', error);
      return [];
    }
  }

  async reserveSeats(seatIds: string[], userId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.post('/api/v1/seats/reserve/', {
        seat_ids: seatIds,
        user_id: userId
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error reserving seats:', error);
      return false;
    }
  }

  async releaseSeats(seatIds: string[]): Promise<boolean> {
    try {
      const response = await this.apiClient.post('/api/v1/seats/release/', {
        seat_ids: seatIds
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error releasing seats:', error);
      return false;
    }
  }
}
```

### **مرحله ۲.۶: تکمیل Application Layer**

```typescript
// frontend/lib/application/services/EventService.ts
import { EventRepository } from '../../domain/repositories/EventRepository';
import { ReserveSeatsUseCase } from '../../domain/use-cases/events/ReserveSeatsUseCase';
import { CalculatePricingUseCase } from '../../domain/use-cases/events/CalculatePricingUseCase';
import { Event, EventFilters } from '../../domain/entities/Event';

export class EventService {
  private reserveSeatsUseCase: ReserveSeatsUseCase;
  private calculatePricingUseCase: CalculatePricingUseCase;

  constructor(
    private eventRepository: EventRepository,
    private cartRepository: CartRepository
  ) {
    this.reserveSeatsUseCase = new ReserveSeatsUseCase(
      eventRepository,
      cartRepository
    );
    this.calculatePricingUseCase = new CalculatePricingUseCase(eventRepository);
  }

  async getEvent(id: string): Promise<Event | null> {
    return this.eventRepository.getById(id);
  }

  async getEventBySlug(slug: string): Promise<Event | null> {
    return this.eventRepository.getBySlug(slug);
  }

  async getEvents(filters?: EventFilters): Promise<Event[]> {
    return this.eventRepository.getAll(filters);
  }

  async reserveSeats(
    eventId: string,
    performanceId: string,
    seatIds: string[],
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.reserveSeatsUseCase.execute(
      eventId,
      performanceId,
      seatIds,
      userId
    );
  }

  async calculatePricing(
    eventId: string,
    performanceId: string,
    seatIds: string[],
    selectedOptions: string[] = []
  ): Promise<PricingBreakdown> {
    return this.calculatePricingUseCase.execute(
      eventId,
      performanceId,
      seatIds,
      selectedOptions
    );
  }
}
```

### **مرحله ۲.۷: تکمیل Presentation Layer**

```typescript
// frontend/lib/application/hooks/useEvents.ts
import { useState, useEffect, useCallback } from 'react';
import { EventService } from '../services/EventService';
import { Event, EventFilters } from '../../domain/entities/Event';

export const useEvents = (eventService: EventService) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (filters?: EventFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await eventService.getEvents(filters);
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  const reserveSeats = useCallback(async (
    eventId: string,
    performanceId: string,
    seatIds: string[],
    userId: string
  ) => {
    try {
      const result = await eventService.reserveSeats(
        eventId,
        performanceId,
        seatIds,
        userId
      );
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [eventService]);

  const calculatePricing = useCallback(async (
    eventId: string,
    performanceId: string,
    seatIds: string[],
    selectedOptions: string[] = []
  ) => {
    try {
      return await eventService.calculatePricing(
        eventId,
        performanceId,
        seatIds,
        selectedOptions
      );
    } catch (err) {
      throw new Error(`Failed to calculate pricing: ${err.message}`);
    }
  }, [eventService]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    reserveSeats,
    calculatePricing
  };
};

// frontend/lib/application/hooks/useEvent.ts
export const useEvent = (eventService: EventService, eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await eventService.getEvent(eventId);
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventService, eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent
  };
};
```

---

## 📅 **برنامه زمانی اجرا**

### **هفته ۱-۲: بک‌اند - Domain Layer**
- [ ] تعریف Bounded Contexts
- [ ] پیاده‌سازی Domain Events
- [ ] پیاده‌سازی Aggregate Roots
- [ ] تکمیل Value Objects

### **هفته ۳-۴: بک‌اند - Application Layer**
- [ ] تکمیل Repository Pattern
- [ ] پیاده‌سازی Use Cases
- [ ] تکمیل Domain Services
- [ ] تست‌های واحد

### **هفته ۵-۶: بک‌اند - Infrastructure Layer**
- [ ] پیاده‌سازی Repository Implementations
- [ ] تکمیل Event Handlers
- [ ] پیاده‌سازی External Services
- [ ] تست‌های یکپارچگی

### **هفته ۷-۸: فرانت‌اند - Domain Layer**
- [ ] تعریف Domain Entities
- [ ] پیاده‌سازی Value Objects
- [ ] تعریف Repository Interfaces
- [ ] پیاده‌سازی Use Cases

### **هفته ۹-۱۰: فرانت‌اند - Infrastructure Layer**
- [ ] پیاده‌سازی Repository Implementations
- [ ] تکمیل API Client
- [ ] پیاده‌سازی Storage Services
- [ ] تست‌های واحد

### **هفته ۱۱-۱۲: فرانت‌اند - Application Layer**
- [ ] پیاده‌سازی Application Services
- [ ] تکمیل Custom Hooks
- [ ] پیاده‌سازی State Management
- [ ] تست‌های یکپارچگی

### **هفته ۱۳-۱۴: Presentation Layer**
- [ ] بازطراحی Components
- [ ] پیاده‌سازی Feature Components
- [ ] تکمیل UI Components
- [ ] تست‌های E2E

### **هفته ۱۵-۱۶: تست و بهینه‌سازی**
- [ ] تست‌های عملکرد
- [ ] بهینه‌سازی کد
- [ ] مستندسازی
- [ ] Deployment

---

## 🎯 **نتایج مورد انتظار**

### **قبل از تکمیل:**
- ❌ Business logic در presentation layer
- ❌ عدم جداسازی مسئولیت‌ها
- ❌ عدم استفاده از Domain Events
- ❌ Weak type safety
- ❌ Scattered state management

### **بعد از تکمیل:**
- ✅ Clean Architecture کامل
- ✅ DDD پیاده‌سازی شده
- ✅ SOLID principles رعایت شده
- ✅ Domain Events برای loose coupling
- ✅ Strong type safety
- ✅ Centralized state management
- ✅ Comprehensive testing
- ✅ Maintainable و scalable code

---

**آیا می‌خواهید با این برنامه شروع کنیم؟ کدام فاز را اول شروع کنیم؟** 