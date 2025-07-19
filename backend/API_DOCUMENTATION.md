# 🎯 **API Documentation - Peykan Tourism Reservation System**

## 📋 **Overview**

The Peykan Tourism Reservation System provides a comprehensive API for managing reservations across different product types (Events, Tours, Transfers) following Domain-Driven Design (DDD) principles.

## 🏗️ **Architecture**

- **Framework**: Django 5 + Django REST Framework
- **Database**: PostgreSQL
- **Architecture**: Domain-Driven Design (DDD)
- **Authentication**: JWT Token-based
- **Caching**: Redis (optional)
- **Background Tasks**: Celery

## 🔐 **Authentication**

All API endpoints require authentication except where noted.

```bash
# Get JWT Token
POST /api/v1/auth/login/
{
    "username": "your_username",
    "password": "your_password"
}

# Use Token in Headers
Authorization: Bearer <your_jwt_token>
```

## 📊 **Reservation Endpoints**

### **1. List Reservations**
```http
GET /api/v1/reservations/reservations/
```

**Query Parameters:**
- `status`: Filter by status (draft, confirmed, cancelled, completed, expired)
- `product_type`: Filter by product type (event, tour, transfer)
- `date_from`: Filter by booking date from
- `date_to`: Filter by booking date to

**Response:**
```json
{
    "count": 10,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": "uuid",
            "reservation_number": "RES202412251234567890ABCDEF",
            "status": "confirmed",
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "total_amount": "110.00",
            "currency": "USD",
            "created_at": "2024-12-25T12:34:56Z",
            "items": [...]
        }
    ]
}
```

### **2. Get Reservation Detail**
```http
GET /api/v1/reservations/reservations/{id}/
```

**Response:**
```json
{
    "id": "uuid",
    "reservation_number": "RES202412251234567890ABCDEF",
    "status": "confirmed",
    "payment_status": "paid",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "subtotal": "100.00",
    "tax_amount": "10.00",
    "total_amount": "110.00",
    "currency": "USD",
    "discount_amount": "0.00",
    "discount_code": "",
    "special_requirements": "",
    "expires_at": null,
    "created_at": "2024-12-25T12:34:56Z",
    "updated_at": "2024-12-25T12:34:56Z",
    "items": [
        {
            "id": "uuid",
            "product_type": "event",
            "product_id": "event-uuid",
            "product_title": "Rock Concert",
            "booking_date": "2024-12-25",
            "booking_time": "19:00:00",
            "quantity": 2,
            "unit_price": "50.00",
            "total_price": "100.00",
            "currency": "USD"
        }
    ],
    "history": [
        {
            "from_status": "",
            "to_status": "draft",
            "changed_by_name": "John Doe",
            "reason": "",
            "created_at": "2024-12-25T12:34:56Z"
        }
    ]
}
```

### **3. Create Reservation**
```http
POST /api/v1/reservations/create-reservation/
```

**Request Body:**
```json
{
    "items": [
        {
            "product_type": "event",
            "product_id": "event-uuid",
            "product_title": "Rock Concert",
            "product_slug": "rock-concert",
            "booking_date": "2024-12-25",
            "booking_time": "19:00:00",
            "quantity": 2,
            "unit_price": "50.00",
            "total_price": "100.00",
            "currency": "USD",
            "selected_options": [],
            "options_total": "0.00",
            "booking_data": {
                "event_id": "event-uuid",
                "performance_id": "performance-uuid",
                "seat_ids": ["seat-1", "seat-2"]
            }
        }
    ],
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "special_requirements": "Wheelchair accessible"
}
```

### **4. Confirm Reservation**
```http
POST /api/v1/reservations/reservations/{id}/confirm/
```

### **5. Cancel Reservation**
```http
POST /api/v1/reservations/reservations/{id}/cancel/
```

**Request Body:**
```json
{
    "reason": "Customer request"
}
```

### **6. Update Reservation Status**
```http
POST /api/v1/reservations/reservations/{id}/update_status/
```

**Request Body:**
```json
{
    "status": "confirmed",
    "reason": "Payment received"
}
```

## 💰 **Pricing Endpoints**

### **Calculate Pricing**
```http
POST /api/v1/reservations/calculate-pricing/
```

**Event Pricing Request:**
```json
{
    "product_type": "event",
    "event_id": "event-uuid",
    "performance_id": "performance-uuid",
    "selected_seats": [
        {
            "id": "seat-uuid",
            "seat_number": "A1",
            "row_number": "1",
            "section": "Main Floor"
        }
    ],
    "selected_options": [
        {
            "id": "option-uuid",
            "name": "Premium Parking",
            "price": "10.00",
            "quantity": 1
        }
    ],
    "discount_code": "EARLYBIRD10"
}
```

**Tour Pricing Request:**
```json
{
    "product_type": "tour",
    "tour_id": "tour-uuid",
    "variant_id": "variant-uuid",
    "participants": {
        "adult": 2,
        "child": 1
    },
    "selected_options": [],
    "discount_code": ""
}
```

**Transfer Pricing Request:**
```json
{
    "product_type": "transfer",
    "route_id": "route-uuid",
    "vehicle_type": "sedan",
    "trip_type": "one_way",
    "passenger_count": 3,
    "luggage_count": 2,
    "selected_options": [],
    "discount_code": ""
}
```

**Response:**
```json
{
    "base_price": 100.00,
    "variant_price": 0.00,
    "options_total": 10.00,
    "subtotal": 110.00,
    "tax_amount": 11.00,
    "total_amount": 121.00,
    "currency": "USD",
    "discount_amount": 10.00,
    "discount_code": "EARLYBIRD10",
    "breakdown": {
        "seats": [...],
        "options": [...],
        "event_name": "Rock Concert"
    }
}
```

## ✅ **Availability Endpoints**

### **Check Availability**
```http
POST /api/v1/reservations/check-availability/
```

**Event Availability Request:**
```json
{
    "product_type": "event",
    "event_id": "event-uuid",
    "performance_id": "performance-uuid",
    "seat_ids": ["seat-1", "seat-2"],
    "booking_date": "2024-12-25",
    "booking_time": "19:00:00"
}
```

**Tour Availability Request:**
```json
{
    "product_type": "tour",
    "tour_id": "tour-uuid",
    "variant_id": "variant-uuid",
    "booking_date": "2024-12-25",
    "booking_time": "09:00:00",
    "participants": {
        "adult": 2,
        "child": 1
    }
}
```

**Transfer Availability Request:**
```json
{
    "product_type": "transfer",
    "route_id": "route-uuid",
    "vehicle_type": "sedan",
    "trip_type": "one_way",
    "pickup_date": "2024-12-25",
    "pickup_time": "10:00:00",
    "passenger_count": 3,
    "luggage_count": 2
}
```

**Response:**
```json
{
    "available": true,
    "message": "Available",
    "details": {
        "available_seats": 50,
        "total_seats": 100
    }
}
```

### **Reserve Capacity**
```http
POST /api/v1/reservations/reserve-capacity/
```

**Request Body:** Same as availability check
**Response:**
```json
{
    "success": true,
    "message": "Capacity reserved successfully",
    "expires_at": "2024-12-25T12:34:56Z"
}
```

## 🏷️ **Status Codes**

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## 🔄 **Reservation Status Flow**

```
draft → confirmed → completed
  ↓
cancelled
  ↓
expired
```

## 📝 **Error Responses**

```json
{
    "error": "Error message",
    "details": {
        "field_name": ["Field specific error"]
    }
}
```

## 🚀 **Usage Examples**

### **Complete Event Booking Flow**

1. **Check Availability**
```bash
curl -X POST http://localhost:8000/api/v1/reservations/check-availability/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_type": "event",
    "event_id": "event-uuid",
    "performance_id": "performance-uuid",
    "seat_ids": ["seat-1"],
    "booking_date": "2024-12-25",
    "booking_time": "19:00:00"
  }'
```

2. **Calculate Pricing**
```bash
curl -X POST http://localhost:8000/api/v1/reservations/calculate-pricing/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_type": "event",
    "event_id": "event-uuid",
    "performance_id": "performance-uuid",
    "selected_seats": [{"id": "seat-1"}],
    "selected_options": [],
    "discount_code": ""
  }'
```

3. **Create Reservation**
```bash
curl -X POST http://localhost:8000/api/v1/reservations/create-reservation/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "product_type": "event",
      "product_id": "event-uuid",
      "product_title": "Rock Concert",
      "booking_date": "2024-12-25",
      "booking_time": "19:00:00",
      "quantity": 1,
      "unit_price": "50.00",
      "total_price": "50.00",
      "currency": "USD",
      "booking_data": {"event_id": "event-uuid"}
    }],
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890"
  }'
```

4. **Confirm Reservation**
```bash
curl -X POST http://localhost:8000/api/v1/reservations/reservations/{id}/confirm/ \
  -H "Authorization: Bearer <token>"
```

## 🔧 **Development Setup**

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create test data
python manage.py create_test_data

# Run server
python manage.py runserver

# Run tests
python manage.py test reservations.tests
```

## 📞 **Support**

For API support and questions, please contact the development team or refer to the internal documentation. 