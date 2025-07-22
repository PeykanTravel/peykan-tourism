import { toast } from 'react-hot-toast';

export interface WebSocketMessage {
  type: 'booking_update' | 'price_change' | 'availability_update' | 'notification';
  data: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...config
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.config.onConnect?.();
          
          // Send queued messages
          while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) this.send(message);
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', message);
            this.config.onMessage?.(message);
            this.handleMessage(message);
          } catch (error) {
            // Ignore non-JSON messages from echo server
            if (event.data && typeof event.data === 'string' && event.data.startsWith('Request')) {
              console.log('📨 Echo server response (ignored):', event.data.substring(0, 50) + '...');
            } else {
              console.error('❌ Failed to parse WebSocket message:', error);
            }
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.config.onDisconnect?.();
          
          if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.config.onError?.(error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    console.log(`🔄 Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(console.error);
    }, this.config.reconnectInterval);
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('📤 WebSocket message sent:', message);
    } else {
      // Queue message for later
      this.messageQueue.push(message);
      console.log('📦 Message queued for later sending:', message);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'booking_update':
        this.handleBookingUpdate(message.data);
        break;
      case 'price_change':
        this.handlePriceChange(message.data);
        break;
      case 'availability_update':
        this.handleAvailabilityUpdate(message.data);
        break;
      case 'notification':
        this.handleNotification(message.data);
        break;
      default:
        console.warn('⚠️ Unknown WebSocket message type:', message.type);
    }
  }

  private handleBookingUpdate(data: any): void {
    toast.success(`🔄 وضعیت رزرو به‌روزرسانی شد: ${data.status}`);
    // Update booking state in stores
  }

  private handlePriceChange(data: any): void {
    toast(`💰 تغییر قیمت: ${data.product} - ${data.newPrice} تومان`, {
      icon: '💰',
      duration: 4000,
    });
    // Update pricing in stores
  }

  private handleAvailabilityUpdate(data: any): void {
    toast(`⚠️ تغییر در دسترسی: ${data.product} - ${data.available ? 'موجود' : 'ناموجود'}`, {
      icon: '⚠️',
      duration: 4000,
    });
    // Update availability in stores
  }

  private handleNotification(data: any): void {
    toast(data.type === 'error' ? '❌' : '✅', {
      duration: 4000,
      style: {
        background: data.type === 'error' ? '#ef4444' : '#10b981',
        color: '#fff',
      },
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(): string {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export const createWebSocketClient = (config: WebSocketConfig): WebSocketClient => {
  if (!wsClient) {
    wsClient = new WebSocketClient(config);
  }
  return wsClient;
};

export const getWebSocketClient = (): WebSocketClient | null => wsClient;

export const disconnectWebSocket = (): void => {
  wsClient?.disconnect();
  wsClient = null;
}; 