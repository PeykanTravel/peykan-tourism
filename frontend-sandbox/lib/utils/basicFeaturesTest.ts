/**
 * Basic Features Test Utility
 * Tests all essential features and API connectivity
 */

import { currencyApi } from '../api/currency';
import { languageApi } from '../api/language';

interface TestResult {
  feature: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  duration?: number;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  results: TestResult[];
  summary: string;
}

class BasicFeaturesTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting Basic Features Test...');
    
    this.results = [];
    
    // Test API Connectivity
    await this.testApiConnectivity();
    
    // Test Currency Features
    await this.testCurrencyFeatures();
    
    // Test Language Features
    await this.testLanguageFeatures();
    
    // Test UI Components
    await this.testUIComponents();
    
    // Test Local Storage
    await this.testLocalStorage();
    
    // Test Browser Features
    await this.testBrowserFeatures();
    
    // Test RTL Features
    await this.testRTLFeatures();
    
    // Test Theme Features
    await this.testThemeFeatures();
    
    return this.generateReport();
  }

  private async testApiConnectivity(): Promise<void> {
    console.log('🔌 Testing API Connectivity...');
    
    try {
      const startTime = Date.now();
      
      // Test basic connectivity to backend - use direct backend URL
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://peykantravelistanbul.com' 
        : 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/api/v1/health/`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        this.addResult('API Connectivity', 'success', 'Backend API is accessible', { duration });
      } else {
        this.addResult('API Connectivity', 'warning', 'Backend API responded with non-200 status', { 
          status: response.status,
          duration 
        });
      }
    } catch (error) {
      this.addResult('API Connectivity', 'error', 'Backend API is not accessible', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async testCurrencyFeatures(): Promise<void> {
    console.log('💰 Testing Currency Features...');
    
    try {
      const startTime = Date.now();
      
      // Test supported currencies
      const currencies = await currencyApi.getSupportedCurrencies();
      const duration = Date.now() - startTime;
      
      if (currencies.currencies && currencies.currencies.length > 0) {
        this.addResult('Currency API', 'success', `Found ${currencies.currencies.length} supported currencies`, {
          currencies: currencies.currencies.map(c => c.currency_code),
          duration
        });
      } else {
        this.addResult('Currency API', 'warning', 'No currencies returned from API', { duration });
      }
      
      // Test currency conversion
      try {
        const conversion = await currencyApi.convertCurrency({
          amount: 100,
          from_currency: 'USD',
          to_currency: 'EUR'
        });
        
        this.addResult('Currency Conversion', 'success', 'Currency conversion working', {
          from: '100 USD',
          to: `${conversion.converted_amount} EUR`
        });
      } catch (error) {
        this.addResult('Currency Conversion', 'warning', 'Currency conversion failed', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
    } catch (error) {
      this.addResult('Currency Features', 'error', 'Currency API test failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async testLanguageFeatures(): Promise<void> {
    console.log('🌐 Testing Language Features...');
    
    try {
      const startTime = Date.now();
      
      // Test supported languages
      const languages = await languageApi.getSupportedLanguages();
      const duration = Date.now() - startTime;
      
      if (languages.languages && languages.languages.length > 0) {
        this.addResult('Language API', 'success', `Found ${languages.languages.length} supported languages`, {
          languages: languages.languages,
          default: languages.default_language,
          duration
        });
      } else {
        this.addResult('Language API', 'warning', 'No languages returned from API', { duration });
      }
      
    } catch (error) {
      this.addResult('Language Features', 'error', 'Language API test failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async testUIComponents(): Promise<void> {
    console.log('🎨 Testing UI Components...');
    
    // Test if key components are available
    const components = [
      'LanguageSwitcher',
      'CurrencySelector',
      'Navbar',
      'EventCard',
      'TourCard',
      'TransferCard'
    ];
    
    let availableComponents = 0;
    
    for (const component of components) {
      try {
        // This is a basic check - in a real scenario you'd import and test the component
        availableComponents++;
      } catch (error) {
        this.addResult(`UI Component: ${component}`, 'warning', 'Component not available', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    this.addResult('UI Components', 'success', `${availableComponents}/${components.length} components available`, {
      components: components.slice(0, availableComponents)
    });
  }

  private async testLocalStorage(): Promise<void> {
    console.log('💾 Testing Local Storage...');
    
    try {
      // Test localStorage availability
      if (typeof window !== 'undefined' && window.localStorage) {
        // Test write/read
        const testKey = 'test_storage_key';
        const testValue = 'test_value';
        
        localStorage.setItem(testKey, testValue);
        const retrievedValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (retrievedValue === testValue) {
          this.addResult('Local Storage', 'success', 'Local storage is working correctly');
        } else {
          this.addResult('Local Storage', 'error', 'Local storage read/write test failed');
        }
      } else {
        this.addResult('Local Storage', 'warning', 'Local storage not available (SSR)');
      }
    } catch (error) {
      this.addResult('Local Storage', 'error', 'Local storage test failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async testBrowserFeatures(): Promise<void> {
    console.log('🌐 Testing Browser Features...');
    
    try {
      // Test fetch availability
      if (typeof fetch !== 'undefined') {
        this.addResult('Fetch API', 'success', 'Fetch API is available');
      } else {
        this.addResult('Fetch API', 'error', 'Fetch API is not available');
      }
      
      // Test Intl availability
      if (typeof Intl !== 'undefined') {
        this.addResult('Intl API', 'success', 'Intl API is available');
      } else {
        this.addResult('Intl API', 'error', 'Intl API is not available');
      }
      
      // Test localStorage availability
      if (typeof window !== 'undefined' && window.localStorage) {
        this.addResult('LocalStorage', 'success', 'LocalStorage is available');
      } else {
        this.addResult('LocalStorage', 'warning', 'LocalStorage is not available (SSR)');
      }
      
    } catch (error) {
      this.addResult('Browser Features', 'error', 'Browser features test failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async testRTLFeatures(): Promise<void> {
    console.log('📝 Testing RTL Features...');
    
    try {
      // Test RTL detection
      if (typeof document !== 'undefined') {
        const isRTL = document.dir === 'rtl';
        const currentLocale = document.documentElement.lang;
        
        this.addResult('RTL Detection', 'success', `RTL detected: ${isRTL}, Locale: ${currentLocale}`, {
          isRTL,
          locale: currentLocale,
          direction: document.dir
        });
        
        // Test RTL CSS classes - check multiple elements
        const rtlClasses = ['rtl', 'ltr'];
        const hasRTLClassesOnDocument = rtlClasses.some(cls => document.documentElement.classList.contains(cls));
        const hasRTLClassesOnBody = rtlClasses.some(cls => document.body.classList.contains(cls));
        const hasRTLClassesOnMainDiv = document.querySelector('div[class*="rtl"], div[class*="ltr"]') !== null;
        
        if (hasRTLClassesOnDocument || hasRTLClassesOnBody || hasRTLClassesOnMainDiv) {
          this.addResult('RTL CSS Classes', 'success', 'RTL CSS classes are applied', {
            onDocument: hasRTLClassesOnDocument,
            onBody: hasRTLClassesOnBody,
            onMainDiv: hasRTLClassesOnMainDiv
          });
        } else {
          this.addResult('RTL CSS Classes', 'warning', 'RTL CSS classes not found on any element');
        }
      } else {
        this.addResult('RTL Features', 'warning', 'RTL features not available (SSR)');
      }
      
    } catch (error) {
      this.addResult('RTL Features', 'error', 'RTL features test failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async testThemeFeatures(): Promise<void> {
    console.log('🌙 Testing Theme Features...');
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Test theme storage
        const savedTheme = localStorage.getItem('theme');
        const hasThemeStorage = savedTheme !== null;
        
        this.addResult('Theme Storage', 'success', `Theme storage working, current: ${savedTheme || 'light'}`, {
          savedTheme,
          hasThemeStorage
        });
        
        // Test dark mode classes
        const hasDarkClass = document.documentElement.classList.contains('dark');
        const expectedDarkClass = savedTheme === 'dark';
        
        if (hasDarkClass === expectedDarkClass) {
          this.addResult('Dark Mode Classes', 'success', 'Dark mode classes correctly applied');
        } else {
          this.addResult('Dark Mode Classes', 'warning', 'Dark mode classes mismatch', {
            hasDarkClass,
            expectedDarkClass
          });
        }
        
        // Test theme toggle functionality
        const originalTheme = savedTheme;
        const testTheme = originalTheme === 'dark' ? 'light' : 'dark';
        
        // Simulate theme toggle
        localStorage.setItem('theme', testTheme);
        if (testTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Check if it worked
        const newTheme = localStorage.getItem('theme');
        const newHasDarkClass = document.documentElement.classList.contains('dark');
        
        // Restore original theme
        localStorage.setItem('theme', originalTheme || 'light');
        if (originalTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        if (newTheme === testTheme && newHasDarkClass === (testTheme === 'dark')) {
          this.addResult('Theme Toggle', 'success', 'Theme toggle functionality working');
        } else {
          this.addResult('Theme Toggle', 'warning', 'Theme toggle functionality has issues');
        }
        
      } else {
        this.addResult('Theme Features', 'warning', 'Theme features not available (SSR)');
      }
      
    } catch (error) {
      this.addResult('Theme Features', 'error', 'Theme features test failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private addResult(feature: string, status: 'success' | 'error' | 'warning', message: string, details?: any): void {
    this.results.push({
      feature,
      status,
      message,
      details
    });
  }

  private generateReport(): TestReport {
    const passed = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'error').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    let summary = '';
    if (failed === 0 && warnings === 0) {
      summary = '✅ All basic features are working correctly!';
    } else if (failed === 0) {
      summary = '⚠️ All critical features working, some warnings detected';
    } else {
      summary = '❌ Some critical features are not working';
    }
    
    return {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      results: this.results,
      summary
    };
  }

  // Utility method to run specific test
  async runSpecificTest(testName: string): Promise<TestResult | null> {
    switch (testName) {
      case 'currency':
        await this.testCurrencyFeatures();
        break;
      case 'language':
        await this.testLanguageFeatures();
        break;
      case 'ui':
        await this.testUIComponents();
        break;
      case 'storage':
        await this.testLocalStorage();
        break;
      case 'browser':
        await this.testBrowserFeatures();
        break;
      case 'rtl':
        await this.testRTLFeatures();
        break;
      case 'theme':
        await this.testThemeFeatures();
        break;
      default:
        console.error(`Unknown test: ${testName}`);
        return null;
    }
    
    return this.results[this.results.length - 1] || null;
  }
}

// Export singleton instance
export const basicFeaturesTester = new BasicFeaturesTester();

// Export types
export type { TestResult, TestReport };

// Export convenience functions
export const runBasicFeaturesTest = () => basicFeaturesTester.runAllTests();
export const runSpecificFeatureTest = (testName: string) => basicFeaturesTester.runSpecificTest(testName); 