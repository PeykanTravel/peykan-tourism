'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { PriceDisplay, PriceBreakdown } from '../ui/PriceDisplay';
import { BookingSummary } from '@/lib/types/unified-booking';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle,
  Package,
  CreditCard
} from 'lucide-react';

interface BookingSidebarProps {
  summary: BookingSummary;
  currentStep: number;
  totalSteps: number;
  onProceed?: () => void;
  isProceeding?: boolean;
  className?: string;
}

export default function BookingSidebar({
  summary,
  currentStep,
  totalSteps,
  onProceed,
  isProceeding = false,
  className = ''
}: BookingSidebarProps) {
  const isLastStep = currentStep === totalSteps - 1;
  const canProceed = currentStep < totalSteps - 1;
  const isComplete = currentStep === totalSteps - 1;

  return (
    <div className={`lg:sticky lg:top-6 ${className}`}>
      <Card className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            خلاصه رزرو
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <span>مرحله {currentStep + 1} از {totalSteps}</span>
            <div className="mx-2 w-16 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-start space-x-3">
            {summary.productInfo.image && (
              <img 
                src={summary.productInfo.image} 
                alt={summary.productInfo.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {summary.productInfo.title}
              </h4>
              <p className="text-sm text-gray-500 capitalize">
                {summary.productInfo.type}
              </p>
              <div className="mt-2">
                <PriceDisplay 
                  amount={summary.productInfo.basePrice}
                  currency={summary.productInfo.currency}
                  size="lg"
                  variant="highlight"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Details */}
        <div className="space-y-4 mb-6">
          {/* Schedule */}
          {summary.schedule && (
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">تاریخ:</span>
              <span className="mr-2 font-medium">{summary.schedule.date}</span>
              <Clock className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">ساعت:</span>
              <span className="mr-2 font-medium">{summary.schedule.time}</span>
            </div>
          )}

          {/* Participants */}
          {summary.participants && (
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300">شرکت‌کنندگان:</span>
              <span className="mr-2 font-medium">
                {summary.participants.adult} بزرگسال
                {summary.participants.child > 0 && `، ${summary.participants.child} کودک`}
                {summary.participants.infant > 0 && `، ${summary.participants.infant} نوزاد`}
              </span>
            </div>
          )}

          {/* Seats */}
          {summary.seats && summary.seats.length > 0 && (
            <div className="flex items-start text-sm">
              <CheckCircle className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <span className="text-gray-600 dark:text-gray-300">صندلی‌های انتخاب شده:</span>
                <div className="mt-1 space-y-1">
                  {summary.seats.map((seat, index) => (
                    <div key={index} className="text-xs text-gray-500">
                      {seat.section} - ردیف {seat.rowNumber} - صندلی {seat.seatNumber}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Options */}
          {summary.selectedOptions.length > 0 && (
            <div className="flex items-start text-sm">
              <Package className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <span className="text-gray-600 dark:text-gray-300">آپشن‌های انتخاب شده:</span>
                <div className="mt-1 space-y-1">
                  {summary.selectedOptions.map((option) => (
                    <div key={option.id} className="text-xs text-gray-500">
                      {option.name} ({option.quantity}x)
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            جزئیات قیمت
          </h4>
          <PriceBreakdown
            items={[
              {
                label: 'قیمت پایه',
                amount: summary.pricing.basePrice,
                currency: summary.currency
              },
              {
                label: 'آپشن‌ها',
                amount: summary.pricing.optionsTotal,
                currency: summary.currency
              },
              ...(summary.pricing.discount ? [{
                label: 'تخفیف',
                amount: -summary.pricing.discount,
                currency: summary.currency
              }] : []),
              ...(summary.pricing.tax ? [{
                label: 'مالیات',
                amount: summary.pricing.tax,
                currency: summary.currency
              }] : [])
            ]}
            total={summary.totalPrice}
            currency={summary.currency}
          />
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          {isLastStep ? (
            <button
              onClick={onProceed}
              disabled={isProceeding}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProceeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  در حال پردازش...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  تکمیل رزرو
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onProceed}
              disabled={!canProceed || isProceeding}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProceeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  در حال پردازش...
                </>
              ) : (
                'مرحله بعد'
              )}
            </button>
          )}
          
          {isComplete && (
            <p className="text-xs text-gray-500 text-center">
              با کلیک روی دکمه بالا، رزرو شما تکمیل و به سبد خرید اضافه می‌شود.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
} 