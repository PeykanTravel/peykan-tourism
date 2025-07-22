'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { runBasicFeaturesTest, runSpecificFeatureTest, type TestReport, type TestResult } from '../../../lib/utils/basicFeaturesTest';
import { useCurrency } from '../../../lib/stores/currencyStore';
import { useLanguage } from '../../../lib/stores/languageStore';
import { useCart } from '../../../lib/hooks/useCart';
import { useToast } from '../../../lib/contexts/ToastContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PriceDisplay } from '../../../components/ui/Price';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import UnifiedBookingForm from '../../../components/booking/UnifiedBookingForm';
import { getProductConfig } from '../../../lib/config/productConfigs';
import { Product } from '../../../lib/types/product';

export default function TestBasicFeaturesPage() {
  const t = useTranslations('common');
  const { currentCurrency, supportedCurrencies, setCurrency } = useCurrency();
  const { currentLanguage, supportedLanguages, setLanguage } = useLanguage();
  
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('all');
  const { showToast } = useToast();

  // --- Unified Booking System Test Section ---
  const [selectedProductType, setSelectedProductType] = useState<'tour' | 'event' | 'transfer'>('tour');
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Sample products for testing
  const sampleProducts: Record<string, Product> = {
    tour: {
      id: 'tour-1',
      type: 'tour',
      title: 'تور اصفهان',
      description: 'تور یک روزه اصفهان با بازدید از جاذبه‌های تاریخی',
      short_description: 'تور یک روزه اصفهان',
      price: 500000,
      currency: 'IRR',
      images: ['/images/isfahan.jpg'],
      location: 'اصفهان، ایران'
    },
    event: {
      id: 'event-1',
      type: 'event',
      title: 'کنسرت موسیقی سنتی',
      description: 'کنسرت موسیقی سنتی ایرانی در تالار وحدت',
      short_description: 'کنسرت موسیقی سنتی',
      price: 200000,
      currency: 'IRR',
      images: ['/images/concert.jpg'],
      location: 'تهران، ایران'
    },
    transfer: {
      id: 'transfer-1',
      type: 'transfer',
      title: 'ترانسفر فرودگاه',
      description: 'ترانسفر از فرودگاه امام خمینی به مرکز تهران',
      short_description: 'ترانسفر فرودگاه',
      price: 150000,
      currency: 'IRR',
      images: ['/images/airport.jpg'],
      location: 'تهران، ایران'
    }
  };

  const handleBookingComplete = (booking: any) => {
    setBookingResult(booking);
    showToast('رزرو با موفقیت انجام شد!', 'success');
  };

  // --- Cart Test Section ---
  const {
    items: cartItems,
    totalItems: cartTotalItems,
    totalPrice: cartTotalPrice,
    addItem,
    removeItem,
    clearCart,
  } = useCart();

  // آیتم تستی تور
  const testTourItem = {
    product_type: 'tour' as const,
    product_id: 'tour-1',
    product_title: 'Test Tour',
    variant_id: 'v1',
    variant_name: 'Standard',
    quantity: 2,
    unit_price: 100,
    options_total: 20,
    currency: 'USD',
    booking_date: '2024-07-01',
    booking_time: '10:00',
    selected_options: [
      { option_id: 'opt-1', quantity: 2 }
    ],
    booking_data: {
      participants: { adult: 2, child: 0, infant: 0 },
      special_requests: 'Window seat',
      schedule_id: 'sch-1',
    },
    title: 'Test Tour - 2024-07-01',
    image: '',
    duration: '1d',
    location: 'Test City',
  };

  // آیتم تستی ایونت
  const testEventItem = {
    product_type: 'event' as const,
    product_id: 'event-1',
    product_title: 'Test Event',
    variant_id: 'tt-1', // ticket_type_id
    variant_name: 'VIP',
    quantity: 3,
    unit_price: 150,
    options_total: 30,
    currency: 'USD',
    booking_date: '2024-07-10',
    booking_time: '20:00',
    selected_options: [
      { option_id: 'opt-2', quantity: 1 }
    ],
    booking_data: {
      special_requests: '',
      // فقط فیلدهای مجاز CartItem
    },
    title: 'Test Event - 2024-07-10',
    image: '',
    duration: '2h',
    location: 'Test Venue',
  };

  // آیتم تستی ترانسفر
  const testTransferItem = {
    product_type: 'transfer' as const,
    product_id: 'transfer-1',
    product_title: 'Test Transfer',
    variant_id: 'sedan', // vehicle_type
    variant_name: 'Sedan',
    quantity: 1,
    unit_price: 80,
    options_total: 10,
    currency: 'USD',
    booking_date: '2024-07-15',
    booking_time: '09:00',
    selected_options: [
      { option_id: 'opt-3', quantity: 1 }
    ],
    booking_data: {
      special_requests: '',
      // فقط فیلدهای مجاز CartItem
    },
    title: 'Test Transfer - 2024-07-15',
    image: '',
    duration: '30m',
    location: 'Test Route',
  };

  const handleRemoveTestItem = async () => {
    if (cartItems.length > 0) {
      await removeItem(cartItems[0].id);
    }
  };

  const runTest = async (testType: string = 'all') => {
    setIsRunning(true);
    setTestReport(null);
    
    try {
      let report: TestReport;
      
      if (testType === 'all') {
        report = await runBasicFeaturesTest();
      } else {
        const result = await runSpecificFeatureTest(testType);
        if (result) {
          report = {
            timestamp: new Date().toISOString(),
            totalTests: 1,
            passed: result.status === 'success' ? 1 : 0,
            failed: result.status === 'error' ? 1 : 0,
            warnings: result.status === 'warning' ? 1 : 0,
            results: [result],
            summary: result.status === 'success' ? 'Test passed' : 'Test failed'
          };
        } else {
          report = {
            timestamp: new Date().toISOString(),
            totalTests: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            results: [],
            summary: 'No test results'
          };
        }
      }
      
      setTestReport(report);
    } catch (error) {
      console.error('Test failed:', error);
      setTestReport({
        timestamp: new Date().toISOString(),
        totalTests: 0,
        passed: 0,
        failed: 1,
        warnings: 0,
        results: [{
          feature: 'Test Runner',
          status: 'error',
          message: 'Test runner failed',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }],
        summary: 'Test runner failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-2 md:px-4 lg:px-8 rtl:font-[Vazirmatn] ltr:font-[Inter]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4 rtl:text-right ltr:text-left">
            Basic Features Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 rtl:text-right ltr:text-left">
            Test currency, language, RTL, theme, and other basic functionality
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8 bg-white border border-gray-200 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white">
          <div className="p-4 md:p-6 lg:p-8">
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-4 rtl:text-right ltr:text-left">
              Test Controls
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Test Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 rtl:text-right ltr:text-left">
                  Select Test
                </label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tests</option>
                  <option value="currency">Currency Features</option>
                  <option value="currency-components">Currency Components</option>
                  <option value="event-system-currency">Event System Currency</option>
                  <option value="cart-checkout-currency">Cart/Checkout Currency</option>
                  <option value="language">Language Features</option>
                  <option value="ui">UI Components</option>
                  <option value="storage">Local Storage</option>
                  <option value="browser">Browser Features</option>
                  <option value="rtl">RTL Features</option>
                  <option value="theme">Theme Features</option>
                </select>
              </div>
              {/* Run Test Button */}
              <div className="flex items-end">
                <Button
                  onClick={() => runTest(selectedTest)}
                  disabled={isRunning}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 dark:bg-blue-400 dark:text-black dark:hover:bg-blue-500"
                >
                  {isRunning ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Running Test...
                    </>
                  ) : (
                    'Run Test'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Currency Settings */}
          <Card className="bg-white border border-gray-200 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white">
            <div className="p-4 md:p-6 lg:p-8">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 rtl:text-right ltr:text-left">
                Currency Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 rtl:text-right ltr:text-left">
                    Current Currency
                  </label>
                  <select
                    value={currentCurrency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {supportedCurrencies.map(currency => (
                      <option key={currency.currency_code} value={currency.currency_code}>
                        {currency.symbol} - {currency.currency_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Available: {supportedCurrencies.length} currencies
                </div>
              </div>
            </div>
          </Card>

          {/* Language Settings */}
          <Card className="bg-white border border-gray-200 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white">
            <div className="p-4 md:p-6 lg:p-8">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 rtl:text-right ltr:text-left">
                Language Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 rtl:text-right ltr:text-left">
                    Current Language
                  </label>
                  <select
                    value={currentLanguage}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {supportedLanguages.map(language => (
                      <option key={language} value={language}>
                        {language === 'fa' ? 'فارسی' : language === 'en' ? 'English' : language === 'tr' ? 'Türkçe' : language}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Available: {supportedLanguages.length} languages
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Currency Components Test */}
        <Card className="mb-8 bg-white border border-gray-200 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white">
          <div className="p-4 md:p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4 rtl:text-right ltr:text-left">
              Currency Components Test
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PriceDisplay Test */}
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h4 className="font-medium text-black dark:text-white mb-2 rtl:text-right ltr:text-left">PriceDisplay Component</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>100 USD:</span>
                    <span className="font-mono">
                      <PriceDisplay amount={100} currency="USD" />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>50 EUR:</span>
                    <span className="font-mono">
                      <PriceDisplay amount={50} currency="EUR" />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>75 TRY:</span>
                    <span className="font-mono">
                      <PriceDisplay amount={75} currency="TRY" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Currency Conversion Test */}
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h4 className="font-medium text-black dark:text-white mb-2 rtl:text-right ltr:text-left">Currency Conversion</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Original:</span>
                    <span className="font-mono">$100.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Converted:</span>
                    <span className="font-mono">
                      <PriceDisplay amount={100} currency="USD" />
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Current: {currentCurrency}
                  </div>
                </div>
              </div>

              {/* Currency Store Test */}
              <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <h4 className="font-medium text-black dark:text-white mb-2 rtl:text-right ltr:text-left">Currency Store</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span className="font-mono">{currentCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span className="font-mono">{supportedCurrencies.length}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Store Status: Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* --- Cart Test Section --- */}
        <Card className="mb-8 bg-white border border-gray-200 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white">
          <div className="p-4 md:p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4 rtl:text-right ltr:text-left">
              Cart (سبد خرید) Test
            </h3>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 dark:bg-blue-400 dark:text-black dark:hover:bg-blue-500" onClick={() => addItem(testTourItem)}>
                افزودن تور تستی
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 dark:bg-blue-400 dark:text-black dark:hover:bg-blue-500" onClick={() => addItem(testEventItem)}>
                افزودن ایونت تستی
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 dark:bg-blue-400 dark:text-black dark:hover:bg-blue-500" onClick={() => addItem(testTransferItem)}>
                افزودن ترانسفر تستی
              </Button>
              <Button className="bg-white border border-blue-600 text-blue-600 dark:bg-gray-900 dark:text-blue-400 dark:border-blue-400" onClick={clearCart} variant="outline">
                پاک‌سازی سبد خرید
              </Button>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              تعداد آیتم‌ها: <span className="font-bold text-black dark:text-white">{cartTotalItems}</span>
              {' | '}قیمت کل: <span className="font-bold text-black dark:text-white">{cartTotalPrice} {cartItems[0]?.currency || ''}</span>
            </div>
            {cartItems.length === 0 ? (
              <div className="border-l-4 border-blue-600 bg-white text-black p-4 flex items-center dark:bg-gray-900 dark:text-white dark:border-blue-400">
                <span className="text-blue-600 mr-2 dark:text-blue-400">ℹ️</span>
                <span>سبد خرید خالی است</span>
              </div>
            ) : (
              <ul className="list-disc pl-6">
                {cartItems.map((item, idx) => (
                  <li key={idx} className="mb-1">
                    <span><b>نوع محصول:</b> {item.product_type}</span><br />
                    <span><b>عنوان:</b> {item.product_title}</span><br />
                    <span><b>جزئیات:</b> {JSON.stringify(item.booking_data)}</span><br />
                    <button
                      className="bg-white border border-gray-400 text-black px-2 py-1 rounded w-fit mt-2 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      onClick={() => removeItem(item.id)}
                    >
                      حذف این آیتم
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Test Results */}
        {testReport && (
          <Card className="bg-white border border-gray-200 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white">
            <div className="p-4 md:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black dark:text-white rtl:text-right ltr:text-left">
                  Test Results
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(testReport.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-black dark:text-white rtl:text-right ltr:text-left">
                      {testReport.summary}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {testReport.totalTests} tests • {testReport.passed} passed • {testReport.failed} failed • {testReport.warnings} warnings
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((testReport.passed / testReport.totalTests) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4">
                {testReport.results.map((result, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getStatusIcon(result.status)}</span>
                          <h4 className={`font-medium ${getStatusColor(result.status)}`}>
                            {result.feature}
                          </h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {result.message}
                        </p>
                        {result.details && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      {result.duration && (
                        <div className="text-sm text-gray-500 ml-4">
                          {result.duration}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* --- Unified Booking System Test Section --- */}
        <Card className="mb-8 bg-white border border-gray-200 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-white">
          <div className="p-4 md:p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4 rtl:text-right ltr:text-left">
              سیستم رزرو یکپارچه - Unified Booking System
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                این سیستم یک فرم واحد برای همه محصولات (تور، ایونت، ترانسفر) ارائه می‌دهد که بر اساس نوع محصول، فیلدهای مختلفی نمایش می‌دهد.
              </p>
              
              {/* Product Type Selector */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  onClick={() => setSelectedProductType('tour')}
                  className={`${
                    selectedProductType === 'tour'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  } hover:bg-blue-600 hover:text-white`}
                >
                  تور (Tour)
                </Button>
                <Button
                  onClick={() => setSelectedProductType('event')}
                  className={`${
                    selectedProductType === 'event'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  } hover:bg-blue-600 hover:text-white`}
                >
                  ایونت (Event)
                </Button>
                <Button
                  onClick={() => setSelectedProductType('transfer')}
                  className={`${
                    selectedProductType === 'transfer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  } hover:bg-blue-600 hover:text-white`}
                >
                  ترانسفر (Transfer)
                </Button>
              </div>

              {/* Product Info */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-black dark:text-white mb-2">
                  محصول انتخاب شده: {sampleProducts[selectedProductType].title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sampleProducts[selectedProductType].description}
                </p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
                  قیمت پایه: {sampleProducts[selectedProductType].price.toLocaleString()} {sampleProducts[selectedProductType].currency}
                </p>
              </div>
            </div>

            {/* Unified Booking Form */}
            <div className="max-w-2xl">
              <UnifiedBookingForm
                product={sampleProducts[selectedProductType]}
                config={getProductConfig(selectedProductType)}
                onBookingComplete={handleBookingComplete}
              />
            </div>

            {/* Booking Result */}
            {bookingResult && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  نتیجه رزرو:
                </h4>
                <pre className="text-sm text-green-700 dark:text-green-300 overflow-auto">
                  {JSON.stringify(bookingResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Card>

        <hr className="my-8" />
        <h2 className="text-xl font-bold mb-4">تست Toast/Notification سراسری</h2>
        <div className="flex gap-4 mb-6">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => showToast('عملیات با موفقیت انجام شد!', 'success')}>Toast موفقیت</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => showToast('خطایی رخ داده است!', 'error')}>Toast خطا</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => showToast('این یک پیام اطلاع‌رسانی است.', 'info')}>Toast اطلاع‌رسانی</button>
        </div>
      </div>
    </div>
  );
} 