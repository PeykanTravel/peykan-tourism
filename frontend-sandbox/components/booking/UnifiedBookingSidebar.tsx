'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { PriceDisplay } from '../ui/Price';
import { 
  BookingState, 
  ProductType, 
  isTourBooking, 
  isEventBooking, 
  isTransferBooking,
  PricingBreakdown
} from '../../lib/types/unified-booking';

interface UnifiedBookingSidebarProps {
  productType: ProductType;
  productId: string;
  productData: any;
  onBookingSubmit: (state: BookingState) => Promise<void>;
  className?: string;
}

export default function UnifiedBookingSidebar({
  productType,
  productId,
  productData,
  onBookingSubmit,
  className = ''
}: UnifiedBookingSidebarProps) {
  const [bookingState, setBookingState] = useState<BookingState>(() => {
    const baseState: BookingState = {
      currentStep: 0,
      steps: [],
      formData: {
        productType,
        productId,
        selectedDate: '',
        specialRequests: '',
        totalPrice: 0
      },
      summary: {
        productInfo: {
          id: productId,
          title: productData?.title || '',
          image: productData?.image || '',
          type: productType,
          basePrice: productData?.price || 0,
          currency: productData?.currency || 'IRR'
        },
        selectedOptions: [],
        pricing: {
          basePrice: 0,
          optionsTotal: 0,
          total: 0,
          currency: 'IRR'
        },
        totalPrice: 0,
        currency: 'IRR'
      },
      errors: {},
      isLoading: false
    };

    // Add product-specific form data
    switch (productType) {
      case 'tour':
        baseState.formData = {
          ...baseState.formData,
          selectedVariant: '',
          participants: { adult: 1, child: 0, infant: 0 },
          selectedOptions: {}
        };
        break;
      case 'event':
        baseState.formData = {
          ...baseState.formData,
          selectedTicketType: '',
          quantity: 1,
          selectedSeats: [],
          selectedOptions: {}
        };
        break;
      case 'transfer':
        baseState.formData = {
          ...baseState.formData,
          selectedRoute: '',
          selectedVehicle: '',
          passengers: { adult: 1, child: 0, infant: 0 },
          selectedOptions: {}
        };
        break;
    }

    return baseState;
  });

  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);

  const calculatePricing = (): PricingBreakdown | null => {
    if (!productData || !bookingState.formData.selectedDate) return null;

    let total = 0;
    let basePrice = 0;
    let ticketsPrice = 0;
    let optionsPrice = 0;
    const currency = productData.currency || 'USD';

    if (productType === 'tour') {
      const variant = productData.variants?.find((v: any) => v.id === bookingState.formData.selectedVariant);
      if (variant) {
        const participants = bookingState.formData.participants as any;
        Object.entries(participants).forEach(([type, count]) => {
          const pricing = variant.pricing?.find((p: any) => p.age_group === type);
          if (pricing && !pricing.is_free) {
            const price = parseFloat(variant.base_price) * pricing.factor;
            basePrice += price * (count as number);
          }
        });
      }
    } else if (productType === 'event') {
      const ticketType = productData.ticketTypes?.find((t: any) => t.id === bookingState.formData.selectedTicketType);
      if (ticketType) {
        ticketsPrice = ticketType.price * (bookingState.formData.quantity as number);
      }
    } else if (productType === 'transfer') {
      const route = productData.routes?.find((r: any) => r.id === bookingState.formData.selectedRoute);
      const vehicle = productData.vehicles?.find((v: any) => v.id === bookingState.formData.selectedVehicle);
      if (route) {
        basePrice = route.basePrice;
        if (vehicle && vehicle.price > 0) {
          basePrice += vehicle.price;
        }
      }
    }

    const selectedOptions = bookingState.formData.selectedOptions as any;
    Object.entries(selectedOptions).forEach(([optionId, quantity]) => {
      const option = productData.options?.find((o: any) => o.id === optionId);
      if (option && (quantity as number) > 0) {
        optionsPrice += option.price * (quantity as number);
      }
    });

    total = basePrice + ticketsPrice + optionsPrice;

    return {
      basePrice,
      optionsTotal: optionsPrice,
      discount: 0,
      tax: 0,
      total,
      currency
    };
  };

  const validateBooking = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!bookingState.formData.selectedDate) {
      errors.push('لطفاً تاریخ را انتخاب کنید');
    }

    if (productType === 'tour') {
      if (!bookingState.formData.selectedVariant) {
        errors.push('لطفاً پکیج را انتخاب کنید');
      }
      const participants = bookingState.formData.participants as any;
      if (participants.adult === 0 && participants.child === 0) {
        errors.push('حداقل یک بزرگسال یا کودک باید انتخاب شود');
      }
    } else if (productType === 'event') {
      if (!bookingState.formData.selectedTicketType) {
        errors.push('لطفاً نوع بلیط را انتخاب کنید');
      }
      if ((bookingState.formData.quantity as number) < 1) {
        errors.push('حداقل یک بلیط باید انتخاب شود');
      }
    } else if (productType === 'transfer') {
      if (!bookingState.formData.selectedRoute) {
        errors.push('لطفاً مسیر را انتخاب کنید');
      }
      if (!bookingState.formData.selectedVehicle) {
        errors.push('لطفاً نوع وسیله نقلیه را انتخاب کنید');
      }
      const passengers = bookingState.formData.passengers as any;
      if (passengers.adult === 0 && passengers.child === 0) {
        errors.push('حداقل یک بزرگسال یا کودک باید انتخاب شود');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleBooking = async () => {
    if (!validateBooking().isValid) return;

    setIsBooking(true);
    setBookingMessage(null);

    try {
      await onBookingSubmit(bookingState);
      setBookingMessage('با موفقیت به سبد خرید اضافه شد!');
    } catch (error) {
      console.error('Booking error:', error);
      setBookingMessage('خطا در افزودن به سبد خرید');
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    const newPricing = calculatePricing();
    setPricing(newPricing);
    if (newPricing) {
      setBookingState(prev => ({ ...prev, formData: { ...prev.formData, totalPrice: newPricing.total } }));
    }
  }, [bookingState, productData]);

  const validation = validateBooking();

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 sticky top-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        رزرو {productType === 'tour' ? 'این تور' : productType === 'event' ? 'این رویداد' : 'این ترانسفر'}
      </h2>

      {validation.errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div className="text-sm text-red-800">
              <strong>⚠️ لطفاً موارد زیر را تکمیل کنید:</strong>
              <ul className="mt-1 list-disc list-inside">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">انتخاب تاریخ</h3>
        {productData.schedules && productData.schedules.length > 0 ? (
          <div className="space-y-2">
            {productData.schedules
              .filter((schedule: any) => schedule.is_available && !schedule.is_full)
              .map((schedule: any) => (
                <button
                  key={schedule.id}
                  onClick={() => setBookingState(prev => ({ ...prev, formData: { ...prev.formData, selectedDate: schedule.id } }))}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    bookingState.formData.selectedDate === schedule.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {new Date(schedule.start_date).toLocaleDateString('fa-IR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {schedule.start_time} - {schedule.end_time}
                  </div>
                  <div className="text-xs text-gray-500">
                    ظرفیت موجود: {schedule.available_capacity} نفر
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">تاریخ در دسترس نیست</p>
        )}
      </div>

      {bookingState.formData.selectedDate && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">درخواست‌های ویژه</h3>
            <textarea
              value={bookingState.formData.specialRequests}
              onChange={(e) => setBookingState(prev => ({ ...prev, formData: { ...prev.formData, specialRequests: e.target.value } }))}
              placeholder="درخواست‌های خاص خود را اینجا بنویسید..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
          </div>

          {pricing && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">خلاصه قیمت</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>قیمت پایه</span>
                  <span><PriceDisplay amount={pricing.basePrice} currency={pricing.currency} /></span>
                </div>
                {pricing.optionsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>آپشن‌های اضافی</span>
                    <span><PriceDisplay amount={pricing.optionsTotal} currency={pricing.currency} /></span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>مجموع</span>
                  <span><PriceDisplay amount={pricing.total} currency={pricing.currency} /></span>
                </div>
              </div>
            </div>
          )}

          {bookingMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              bookingMessage.includes('موفقیت') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {bookingMessage.includes('موفقیت') ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span className="text-sm">{bookingMessage}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={!validation.isValid || isBooking}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              validation.isValid && !isBooking
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isBooking ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                در حال پردازش...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                افزودن به سبد خرید
              </div>
            )}
          </button>
        </>
      )}
    </div>
  );
} 