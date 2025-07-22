'use client';

import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function TestSimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          تست ساده سیستم
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              تست تور
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              تست سیستم رزرو تور
            </p>
            <Button 
              onClick={() => window.location.href = '/fa/test-unified-tour-booking'}
              className="w-full"
            >
              شروع تست تور
            </Button>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              تست رویداد
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              تست سیستم رزرو رویداد
            </p>
            <Button 
              onClick={() => window.location.href = '/fa/test-unified-event-booking'}
              className="w-full"
            >
              شروع تست رویداد
            </Button>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              تست ترانسفر
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              تست سیستم رزرو ترانسفر
            </p>
            <Button 
              onClick={() => window.location.href = '/fa/test-unified-transfer-booking'}
              className="w-full"
            >
              شروع تست ترانسفر
            </Button>
          </Card>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              وضعیت سیستم
            </h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">سرور در حال اجرا</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">کامپوننت‌های UI آماده</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">سیستم رزرو یکپارچه آماده</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              فاز 3: ویژگی‌های پیشرفته
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Real-time Integration، Offline Support، Analytics و Security
            </p>
            <Button 
              onClick={() => window.location.href = '/fa/test-phase3'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              تست فاز 3
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
} 