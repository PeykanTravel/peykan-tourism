'use client';

import React from 'react';
import { useRTL, RTLContainer, RTLFlex, RTLText } from '../RTLProvider';
import { useRTLStyles } from '../../lib/utils/translation';

export default function RTLExample() {
  const { isRTL, textAlign, flexDirection, className } = useRTLStyles();
  const rtlContext = useRTL();

  return (
    <RTLContainer className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">نمونه RTL</h2>
      
      {/* Example 1: Using RTL utility components */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">استفاده از کامپوننت‌های RTL</h3>
        <RTLFlex className="gap-4">
          <div className="bg-blue-100 p-4 rounded">آیتم ۱</div>
          <div className="bg-green-100 p-4 rounded">آیتم ۲</div>
          <div className="bg-red-100 p-4 rounded">آیتم ۳</div>
        </RTLFlex>
      </div>

      {/* Example 2: Using RTL utility functions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">استفاده از توابع RTL</h3>
        <div 
          className="bg-yellow-100 p-4 rounded"
          style={{ 
            textAlign: textAlign('left'),
            direction: rtlContext.textDirection 
          }}
        >
          این متن با استفاده از توابع RTL تراز شده است
        </div>
      </div>

      {/* Example 3: Using Tailwind RTL classes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">استفاده از کلاس‌های Tailwind RTL</h3>
        <div className={`bg-purple-100 p-4 rounded ${className.text}`}>
          این متن با کلاس‌های Tailwind RTL تراز شده است
        </div>
      </div>

      {/* Example 4: Dynamic content based on RTL */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">محتوای داینامیک بر اساس RTL</h3>
        <div className="bg-gray-100 p-4 rounded">
          <p>زبان فعلی: {rtlContext.locale}</p>
          <p>جهت متن: {rtlContext.textDirection}</p>
          <p>فونت: {rtlContext.fontFamily}</p>
          <p>RTL فعال: {isRTL ? 'بله' : 'خیر'}</p>
        </div>
      </div>

      {/* Example 5: Form layout with RTL */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">فرم با RTL</h3>
        <RTLContainer className="space-y-4">
          <div className="flex gap-4">
            <label className="w-24">نام:</label>
            <input 
              type="text" 
              className="flex-1 border rounded px-3 py-2"
              placeholder={isRTL ? "نام خود را وارد کنید" : "Enter your name"}
            />
          </div>
          <div className="flex gap-4">
            <label className="w-24">ایمیل:</label>
            <input 
              type="email" 
              className="flex-1 border rounded px-3 py-2"
              placeholder={isRTL ? "ایمیل خود را وارد کنید" : "Enter your email"}
            />
          </div>
        </RTLContainer>
      </div>
    </RTLContainer>
  );
} 