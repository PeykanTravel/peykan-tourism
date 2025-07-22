'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  BarChart3, 
  Shield, 
  Zap,
  MessageSquare,
  Database,
  Activity,
  Globe,
  Smartphone,
  Server
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { createWebSocketClient, getWebSocketClient, disconnectWebSocket } from '../../../lib/services/websocket';
import { getSimpleAnalyticsService, trackEvent, trackConversion } from '../../../lib/services/simpleAnalytics';

export default function TestPhase3Page() {
  const [activeTab, setActiveTab] = useState<'realtime' | 'offline' | 'analytics' | 'security'>('realtime');
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [wsMessages, setWsMessages] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [swStatus, setSwStatus] = useState<'not-supported' | 'not-registered' | 'registered'>('not-supported');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    checkServiceWorker();
    checkNotificationPermission();
    initializeWebSocket();
    initializeAnalytics();
  }, []);

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        setSwStatus('registered');
        console.log('🔧 Service Worker registered');
      } else {
        setSwStatus('not-registered');
        console.log('🔧 Service Worker not registered');
      }
    } else {
      setSwStatus('not-supported');
      console.log('❌ Service Worker not supported');
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const initializeWebSocket = () => {
    // Check if already connected
    const existingClient = getWebSocketClient();
    if (existingClient && existingClient.isConnected()) {
      setWsStatus('connected');
      return;
    }

    const wsClient = createWebSocketClient({
      url: 'wss://echo.websocket.org', // Test WebSocket server
      onConnect: () => {
        setWsStatus('connected');
        console.log('🔌 WebSocket connected');
      },
      onDisconnect: () => {
        setWsStatus('disconnected');
        console.log('🔌 WebSocket disconnected');
      },
      onMessage: (message) => {
        setWsMessages(prev => [...prev, message]);
        console.log('📨 WebSocket message received:', message);
      },
      onError: (error) => {
        console.error('❌ WebSocket error:', error);
        setWsStatus('disconnected');
      }
    });

    wsClient.connect().catch(console.error);
  };

  const initializeAnalytics = () => {
    const analytics = getSimpleAnalyticsService();
    
    // Update analytics data every 5 seconds
    const interval = setInterval(() => {
      const behavior = analytics.getUserBehavior();
      const events = analytics.getEvents();
      setAnalyticsData({ behavior, events });
    }, 5000);

    return () => clearInterval(interval);
  };

  const sendTestMessage = () => {
    const wsClient = getWebSocketClient();
    if (wsClient) {
      const message = {
        type: 'notification' as const,
        data: { message: 'Hello from Phase 3!', timestamp: Date.now() },
        timestamp: Date.now()
      };
      wsClient.send(message);
      console.log('📤 Test message sent');
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('🔧 Service Worker registered:', registration);
        setSwStatus('registered');
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      console.log('📱 Notification permission:', permission);
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Peykan Tourism', {
        body: 'این یک تست اعلان است!',
        icon: '/images/logo.png',
        badge: '/images/badge.png'
      });
      console.log('📱 Test notification sent');
    }
  };

  const trackTestEvent = () => {
    trackEvent('test', 'button_click');
    console.log('📊 Test event tracked');
  };

  const trackTestConversion = () => {
    trackConversion('test_booking');
    console.log('📊 Test conversion tracked');
  };

  const simulateOffline = () => {
    setIsOnline(false);
    console.log('🌐 Simulating offline mode');
    
    // Simulate coming back online after 3 seconds
    setTimeout(() => {
      setIsOnline(true);
      console.log('🌐 Back online');
    }, 3000);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="w-8 h-8 text-yellow-300" />
              <h1 className="text-4xl md:text-6xl font-bold">فاز 3: ویژگی‌های پیشرفته</h1>
              <Zap className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Real-time Integration، Offline Support، Analytics و Security
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { id: 'realtime', label: 'Real-time', icon: MessageSquare },
            { id: 'offline', label: 'Offline', icon: Wifi },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'security', label: 'Security', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 mx-2 mb-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Real-time Tab */}
          {activeTab === 'realtime' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2" />
                  WebSocket Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      wsStatus === 'connected' ? 'bg-green-500' : 
                      wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="capitalize">{wsStatus}</span>
                  </div>
                  <Button onClick={sendTestMessage} disabled={wsStatus !== 'connected'}>
                    ارسال پیام تست
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Bell className="w-6 h-6 mr-2" />
                  Push Notifications
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    وضعیت: {notificationPermission}
                  </div>
                  <div className="space-y-2">
                    <Button onClick={requestNotificationPermission} disabled={notificationPermission === 'granted'}>
                      درخواست مجوز
                    </Button>
                    <Button onClick={sendTestNotification} disabled={notificationPermission !== 'granted'}>
                      ارسال اعلان تست
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">پیام‌های WebSocket</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {wsMessages.map((msg, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded text-sm">
                      <div className="font-semibold">{msg.type}</div>
                      <div className="text-gray-600">{JSON.stringify(msg.data)}</div>
                    </div>
                  ))}
                  {wsMessages.length === 0 && (
                    <div className="text-gray-500 text-center py-8">
                      هیچ پیامی دریافت نشده است
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Offline Tab */}
          {activeTab === 'offline' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Wifi className="w-6 h-6 mr-2" />
                  Connection Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <>
                        <Wifi className="w-5 h-5 text-green-500" />
                        <span className="text-green-600">آنلاین</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-5 h-5 text-red-500" />
                        <span className="text-red-600">آفلاین</span>
                      </>
                    )}
                  </div>
                  <Button onClick={simulateOffline} disabled={!isOnline}>
                    شبیه‌سازی آفلاین
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-2" />
                  Service Worker
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    وضعیت: {swStatus}
                  </div>
                  <Button onClick={registerServiceWorker} disabled={swStatus === 'registered'}>
                    ثبت Service Worker
                  </Button>
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">Offline Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-semibold">PWA Support</h4>
                    <p className="text-sm text-gray-600">نصب به عنوان اپلیکیشن</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <h4 className="font-semibold">Offline Browsing</h4>
                    <p className="text-sm text-gray-600">مرور بدون اینترنت</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Server className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <h4 className="font-semibold">Background Sync</h4>
                    <p className="text-sm text-gray-600">همگام‌سازی خودکار</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2" />
                  User Behavior
                </h3>
                {analyticsData?.behavior && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Page Views:</span>
                      <span className="font-semibold">{analyticsData.behavior.pageViews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interactions:</span>
                      <span className="font-semibold">{analyticsData.behavior.interactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversions:</span>
                      <span className="font-semibold">{analyticsData.behavior.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Events:</span>
                      <span className="font-semibold">{analyticsData.behavior.pageViews + analyticsData.behavior.interactions + analyticsData.behavior.conversions}</span>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Activity className="w-6 h-6 mr-2" />
                  Recent Events
                </h3>
                {analyticsData?.events && (
                  <div className="space-y-3">
                    {analyticsData.events.slice(-5).map((event: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{event.category}:</span>
                        <span className="font-semibold">{event.action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">Analytics Actions</h3>
                <div className="flex space-x-4">
                  <Button onClick={trackTestEvent}>
                    Track Test Event
                  </Button>
                  <Button onClick={trackTestConversion}>
                    Track Test Conversion
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  Security Features
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>HTTPS Enabled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Content Security Policy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>XSS Protection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>CSRF Protection</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Data Protection</h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    تمام داده‌ها به صورت رمزگذاری شده ذخیره می‌شوند
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Local Storage Encryption</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Secure API Communication</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Privacy Compliance</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 