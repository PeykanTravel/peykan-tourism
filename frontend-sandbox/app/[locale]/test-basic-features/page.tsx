'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { runBasicFeaturesTest, runSpecificFeatureTest, type TestReport, type TestResult } from '../../../lib/utils/basicFeaturesTest';
import { useCurrency } from '../../../lib/stores/currencyStore';
import { useLanguage } from '../../../lib/stores/languageStore';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PriceDisplay } from '../../../components/ui/Price';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function TestBasicFeaturesPage() {
  const t = useTranslations('common');
  const { currentCurrency, supportedCurrencies, setCurrency } = useCurrency();
  const { currentLanguage, supportedLanguages, setLanguage } = useLanguage();
  
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('all');

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Basic Features Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test currency, language, RTL, theme, and other basic functionality
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Controls
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Test Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Test
                </label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full"
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
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Currency Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Currency
                  </label>
                  <select
                    value={currentCurrency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {supportedCurrencies.map(currency => (
                      <option key={currency.currency_code} value={currency.currency_code}>
                        {currency.symbol} - {currency.currency_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Available: {supportedCurrencies.length} currencies
                </div>
              </div>
            </div>
          </Card>

          {/* Language Settings */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Language Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Language
                  </label>
                  <select
                    value={currentLanguage}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {supportedLanguages.map(language => (
                      <option key={language} value={language}>
                        {language === 'fa' ? 'فارسی' : language === 'en' ? 'English' : language === 'tr' ? 'Türkçe' : language}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Available: {supportedLanguages.length} languages
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Currency Components Test */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Currency Components Test
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PriceDisplay Test */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">PriceDisplay Component</h4>
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
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Currency Conversion</h4>
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
                  <div className="text-xs text-gray-500">
                    Current: {currentCurrency}
                  </div>
                </div>
              </div>

              {/* Currency Store Test */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Currency Store</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current:</span>
                    <span className="font-mono">{currentCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span className="font-mono">{supportedCurrencies.length}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Store Status: Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Test Results */}
        {testReport && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Test Results
                </h2>
                <div className="text-sm text-gray-500">
                  {new Date(testReport.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {testReport.summary}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testReport.totalTests} tests • {testReport.passed} passed • {testReport.failed} failed • {testReport.warnings} warnings
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((testReport.passed / testReport.totalTests) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Success Rate</div>
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
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
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
      </div>
    </div>
  );
} 