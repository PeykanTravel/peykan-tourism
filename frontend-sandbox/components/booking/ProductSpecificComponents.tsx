'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Calendar, Users, Car, Ticket } from 'lucide-react';

// ===== تور - ظاهر مخصوص =====
export function TourSpecificUI({ data, onSelect }: any) {
  return (
    <div className="space-y-6">
      {/* انتخاب پکیج با کارت‌های زیبا */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.variants?.map((variant: any) => (
          <Card 
            key={variant.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
              data.selectedVariant === variant.id 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:ring-2 hover:ring-blue-300'
            }`}
            onClick={() => onSelect('variant', variant.id)}
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {variant.name}
              </h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {variant.base_price.toLocaleString()} تومان
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {variant.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {/* تقویم زیبا برای انتخاب تاریخ */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          انتخاب تاریخ سفر
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.schedules?.map((schedule: any) => (
            <div
              key={schedule.id}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                data.selectedSchedule === schedule.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              onClick={() => onSelect('schedule', schedule.id)}
            >
              <div className="text-center">
                <div className="font-bold">{schedule.date}</div>
                <div className="text-sm opacity-80">{schedule.time}</div>
                <div className="text-xs mt-1">
                  {schedule.available_capacity} نفر موجود
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== رویداد - ظاهر مخصوص =====
export function EventSpecificUI({ data, onSelect }: any) {
  return (
    <div className="space-y-6">
      {/* نقشه صندلی */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Ticket className="w-5 h-5 mr-2" />
          انتخاب صندلی
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          {/* نقشه ساده صندلی */}
          <div className="grid grid-cols-10 gap-1 mb-4">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded cursor-pointer transition-all ${
                  data.selectedSeats?.includes(i)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-purple-300'
                }`}
                onClick={() => onSelect('seat', i)}
              >
                <div className="text-xs flex items-center justify-center h-full">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            روی صندلی‌ها کلیک کنید تا انتخاب شوند
          </div>
        </div>
      </div>

      {/* انتخاب نوع بلیط */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.ticket_types?.map((ticket: any) => (
          <Card 
            key={ticket.id}
            className={`p-4 cursor-pointer transition-all ${
              data.selectedTicketType === ticket.id
                ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'hover:ring-2 hover:ring-purple-300'
            }`}
            onClick={() => onSelect('ticketType', ticket.id)}
          >
            <div className="text-center">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                {ticket.name}
              </h4>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {ticket.price.toLocaleString()} تومان
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {ticket.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== ترانسفر - ظاهر مخصوص =====
export function TransferSpecificUI({ data, onSelect }: any) {
  return (
    <div className="space-y-6">
      {/* نقشه مسیر */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          انتخاب مسیر
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.routes?.map((route: any) => (
            <div
              key={route.id}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                data.selectedRoute === route.id
                  ? 'bg-green-500 text-white'
                  : 'bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
              onClick={() => onSelect('route', route.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{route.origin}</div>
                  <div className="text-sm opacity-80">↓</div>
                  <div className="font-bold">{route.destination}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{route.base_price.toLocaleString()}</div>
                  <div className="text-sm opacity-80">{route.duration}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* انتخاب نوع خودرو */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.vehicle_types?.map((vehicle: any) => (
          <Card 
            key={vehicle.id}
            className={`p-4 cursor-pointer transition-all ${
              data.selectedVehicle === vehicle.id
                ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'hover:ring-2 hover:ring-green-300'
            }`}
            onClick={() => onSelect('vehicle', vehicle.id)}
          >
            <div className="text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                {vehicle.name}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {vehicle.capacity} نفر
              </div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {vehicle.price_multiplier}x
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* انتخاب رفت و برگشت */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          نوع سفر
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg cursor-pointer transition-all text-center ${
              data.tripType === 'oneway'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
            onClick={() => onSelect('tripType', 'oneway')}
          >
            <div className="font-bold">فقط رفت</div>
            <div className="text-sm opacity-80">یک طرفه</div>
          </div>
          <div
            className={`p-4 rounded-lg cursor-pointer transition-all text-center ${
              data.tripType === 'roundtrip'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
            onClick={() => onSelect('tripType', 'roundtrip')}
          >
            <div className="font-bold">رفت و برگشت</div>
            <div className="text-sm opacity-80">دو طرفه</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== کامپوننت اصلی برای انتخاب محصول =====
export function ProductSpecificSelector({ productType, data, onSelect }: any) {
  switch (productType) {
    case 'tour':
      return <TourSpecificUI data={data} onSelect={onSelect} />;
    case 'event':
      return <EventSpecificUI data={data} onSelect={onSelect} />;
    case 'transfer':
      return <TransferSpecificUI data={data} onSelect={onSelect} />;
    default:
      return <div>محصول نامعتبر</div>;
  }
} 