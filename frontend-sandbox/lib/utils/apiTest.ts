/**
 * API Testing Utility for Peykan Tourism Platform
 * Tests all API endpoints and reports their status
 */

import { apiClient } from '../api/client';

export interface APITestResult {
  endpoint: string;
  status: 'success' | 'error' | 'timeout';
  responseTime: number;
  error?: string;
  data?: any;
}

export interface APITestSummary {
  total: number;
  successful: number;
  failed: number;
  averageResponseTime: number;
  results: APITestResult[];
}

class APITester {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  async testEndpoint(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<APITestResult> {
    const startTime = Date.now();
    
    try {
      const response = await apiClient.request({
        method,
        url: endpoint,
        data,
        timeout: 10000 // 10 second timeout
      });

      const responseTime = Date.now() - startTime;

      return {
        endpoint,
        status: 'success',
        responseTime,
        data: response.data
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        status: error.code === 'ECONNABORTED' ? 'timeout' : 'error',
        responseTime,
        error: error.message || 'Unknown error'
      };
    }
  }

  async testAllEndpoints(): Promise<APITestSummary> {
    const endpoints = [
      // Tours
      { endpoint: '/tours/tours/', method: 'GET' as const },
      { endpoint: '/tours/categories/', method: 'GET' as const },
      
      // Events
      { endpoint: '/events/events/', method: 'GET' as const },
      { endpoint: '/events/categories/', method: 'GET' as const },
      
      // Transfers
      { endpoint: '/transfers/routes/', method: 'GET' as const },
      { endpoint: '/transfers/options/', method: 'GET' as const },
      
      // Auth (public endpoints)
      { endpoint: '/auth/profile/', method: 'GET' as const },
      
      // Shared
      { endpoint: '/shared/currency/supported/', method: 'GET' as const },
      { endpoint: '/shared/currency/rates/', method: 'GET' as const },
      { endpoint: '/shared/language/supported/', method: 'GET' as const },
      
      // Cart (will fail without auth, but we test the endpoint)
      { endpoint: '/cart/', method: 'GET' as const },
    ];

    const results: APITestResult[] = [];
    
    for (const { endpoint, method } of endpoints) {
      const result = await this.testEndpoint(endpoint, method);
      results.push(result);
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status !== 'success').length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    return {
      total: results.length,
      successful,
      failed,
      averageResponseTime,
      results
    };
  }

  async testCriticalUserFlow(): Promise<{
    tours: APITestResult;
    events: APITestResult;
    transfers: APITestResult;
    auth: APITestResult;
  }> {
    const [tours, events, transfers, auth] = await Promise.all([
      this.testEndpoint('/tours/tours/'),
      this.testEndpoint('/events/events/'),
      this.testEndpoint('/transfers/routes/'),
      this.testEndpoint('/auth/profile/')
    ]);

    return { tours, events, transfers, auth };
  }

  generateReport(summary: APITestSummary): string {
    const { total, successful, failed, averageResponseTime, results } = summary;
    
    let report = `\n🔍 API Test Report\n`;
    report += `================================\n`;
    report += `Total Endpoints: ${total}\n`;
    report += `✅ Successful: ${successful}\n`;
    report += `❌ Failed: ${failed}\n`;
    report += `⏱️  Avg Response Time: ${averageResponseTime.toFixed(2)}ms\n`;
    report += `📊 Success Rate: ${((successful / total) * 100).toFixed(1)}%\n\n`;

    report += `Detailed Results:\n`;
    report += `-----------------\n`;
    
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : result.status === 'timeout' ? '⏰' : '❌';
      report += `${status} ${result.endpoint} (${result.responseTime}ms)\n`;
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }
    });

    return report;
  }
}

export const apiTester = new APITester();

// Convenience functions
export const testAllAPIs = () => apiTester.testAllEndpoints();
export const testCriticalFlow = () => apiTester.testCriticalUserFlow();
export const generateTestReport = (summary: APITestSummary) => apiTester.generateReport(summary);

// Browser-friendly test function
export async function runAPITests(): Promise<void> {
  if (typeof window === 'undefined') {
    console.log('API tests can only run in browser environment');
    return;
  }

  console.log('🧪 Starting API tests...');
  
  try {
    const summary = await testAllAPIs();
    const report = generateTestReport(summary);
    
    console.log(report);
    
    // Store results in localStorage for debugging
    localStorage.setItem('api-test-results', JSON.stringify({
      timestamp: new Date().toISOString(),
      summary
    }));
    
    // Show results in UI if needed
    if (summary.failed > 0) {
      console.warn(`⚠️  ${summary.failed} API endpoints failed. Check the report above.`);
    } else {
      console.log('🎉 All API endpoints are working correctly!');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
} 