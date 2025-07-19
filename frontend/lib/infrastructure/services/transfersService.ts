/**
 * Transfers Service
 * 
 * Service for managing transfers data and operations
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Transfer {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string;
  from_location: string;
  to_location: string;
  duration: string;
  price: number;
  vehicle_type: string;
  max_passengers: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface TransferRoute {
  id: string;
  transfer_id: string;
  from_location: string;
  to_location: string;
  distance: number;
  duration: string;
  base_price: number;
}

export interface TransferVehicle {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price_multiplier: number;
  features: string[];
}

export interface TransferOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'addon' | 'upgrade';
}

export class TransfersService {
  private static instance: TransfersService;
  private api = axios.create({
    baseURL: `${API_BASE_URL}/transfers/routes`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {
    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  public static getInstance(): TransfersService {
    if (!TransfersService.instance) {
      TransfersService.instance = new TransfersService();
    }
    return TransfersService.instance;
  }

  async getTransfers(params?: {
    limit?: number;
    from_location?: string;
    to_location?: string;
    search?: string;
    page?: number;
  }): Promise<{ results: Transfer[]; count: number; next?: string; previous?: string }> {
    try {
      const response = await this.api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
      throw error;
    }
  }

  async getTransferBySlug(slug: string): Promise<Transfer> {
    try {
      const response = await this.api.get(`/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transfer:', error);
      throw error;
    }
  }

  async getTransferRoutes(transferId: string): Promise<TransferRoute[]> {
    try {
      const response = await this.api.get(`/${transferId}/routes/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transfer routes:', error);
      throw error;
    }
  }

  async getTransferVehicles(): Promise<TransferVehicle[]> {
    try {
      const response = await this.api.get('/vehicles/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transfer vehicles:', error);
      throw error;
    }
  }

  async getTransferOptions(transferId: string): Promise<TransferOption[]> {
    try {
      const response = await this.api.get(`/${transferId}/options/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transfer options:', error);
      throw error;
    }
  }

  async checkAvailability(routeId: string, vehicleId: string, date: string, passengers: number): Promise<boolean> {
    try {
      const response = await this.api.post(`/routes/${routeId}/check-availability/`, {
        vehicle_id: vehicleId,
        date,
        passengers,
      });
      return response.data.available;
    } catch (error) {
      console.error('Failed to check availability:', error);
      throw error;
    }
  }

  async reserveTransfer(routeId: string, vehicleId: string, date: string, passengers: number, customerInfo: any, optionIds?: string[]): Promise<any> {
    try {
      const response = await this.api.post(`/routes/${routeId}/reserve/`, {
        vehicle_id: vehicleId,
        date,
        passengers,
        customer_info: customerInfo,
        option_ids: optionIds || [],
      });
      return response.data;
    } catch (error) {
      console.error('Failed to reserve transfer:', error);
      throw error;
    }
  }

  async calculatePrice(routeId: string, vehicleId: string, passengers: number, optionIds?: string[]): Promise<number> {
    try {
      const response = await this.api.post(`/routes/${routeId}/calculate-price/`, {
        vehicle_id: vehicleId,
        passengers,
        option_ids: optionIds || [],
      });
      return response.data.total_price;
    } catch (error) {
      console.error('Failed to calculate price:', error);
      throw error;
    }
  }
}

export const transfersService = TransfersService.getInstance(); 