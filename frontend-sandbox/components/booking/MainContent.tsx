'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Calendar, 
  Users, 
  Package, 
  CreditCard, 
  FileText,
  MapPin,
  Car,
  Clock
} from 'lucide-react';

interface MainContentProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  productType: 'tour' | 'event' | 'transfer';
  className?: string;
}

export default function MainContent({
  currentStep,
  totalSteps,
  children,
  productType,
  className = ''
}: MainContentProps) {
  const [activeTab, setActiveTab] = useState('booking');

  return (
    <div className={`flex-1 ${className}`}>
      <Card className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            رزرو {productType === 'tour' ? 'تور' : productType === 'event' ? 'رویداد' : 'ترانسفر'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            لطفاً اطلاعات مورد نیاز را تکمیل کنید
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="booking" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>فرم رزرو</span>
            </TabsTrigger>
            
            {productType === 'tour' && (
              <TabsTrigger value="itinerary" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>برنامه سفر</span>
              </TabsTrigger>
            )}
            
            {productType === 'event' && (
              <TabsTrigger value="venue" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>محل برگزاری</span>
              </TabsTrigger>
            )}
            
            {productType === 'transfer' && (
              <TabsTrigger value="route" className="flex items-center space-x-2">
                <Car className="w-4 h-4" />
                <span>مسیر و خودرو</span>
              </TabsTrigger>
            )}
            
            <TabsTrigger value="details" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>جزئیات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="mt-6">
            <div className="min-h-[400px]">
              {children}
            </div>
          </TabsContent>

          {productType === 'tour' && (
            <TabsContent value="itinerary" className="mt-6">
              <div className="min-h-[400px]">
                <TourItineraryTab />
              </div>
            </TabsContent>
          )}

          {productType === 'event' && (
            <TabsContent value="venue" className="mt-6">
              <div className="min-h-[400px]">
                <EventVenueTab />
              </div>
            </TabsContent>
          )}

          {productType === 'transfer' && (
            <TabsContent value="route" className="mt-6">
              <div className="min-h-[400px]">
                <TransferRouteTab />
              </div>
            </TabsContent>
          )}

          <TabsContent value="details" className="mt-6">
            <div className="min-h-[400px]">
              {productType === 'tour' && <TourDetailsTab />}
              {productType === 'event' && <EventDetailsTab />}
              {productType === 'transfer' && <TransferDetailsTab />}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

// Placeholder tab components - these will be replaced with actual content
function TourItineraryTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">برنامه سفر</h3>
      <p className="text-gray-600 dark:text-gray-400">
        جزئیات برنامه سفر در اینجا نمایش داده می‌شود.
      </p>
    </div>
  );
}

function TourDetailsTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">جزئیات تور</h3>
      <p className="text-gray-600 dark:text-gray-400">
        اطلاعات کامل تور در اینجا نمایش داده می‌شود.
      </p>
    </div>
  );
}

function EventVenueTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">محل برگزاری</h3>
      <p className="text-gray-600 dark:text-gray-400">
        اطلاعات محل برگزاری رویداد در اینجا نمایش داده می‌شود.
      </p>
    </div>
  );
}

function EventDetailsTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">جزئیات رویداد</h3>
      <p className="text-gray-600 dark:text-gray-400">
        اطلاعات کامل رویداد در اینجا نمایش داده می‌شود.
      </p>
    </div>
  );
}

function TransferRouteTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">مسیر و خودرو</h3>
      <p className="text-gray-600 dark:text-gray-400">
        اطلاعات مسیر و خودرو در اینجا نمایش داده می‌شود.
      </p>
    </div>
  );
}

function TransferDetailsTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">جزئیات ترانسفر</h3>
      <p className="text-gray-600 dark:text-gray-400">
        اطلاعات کامل ترانسفر در اینجا نمایش داده می‌شود.
      </p>
    </div>
  );
} 