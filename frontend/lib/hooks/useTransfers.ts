/**
 * Transfers Hook
 * 
 * Custom hook for managing transfers data
 */

import { useState, useEffect } from 'react';
import { transfersService } from '@/lib/services/transfersService';

interface Transfer {
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

interface UseTransfersOptions {
  limit?: number;
  from_location?: string;
  to_location?: string;
  search?: string;
}

export function useTransfers(options: UseTransfersOptions = {}) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransfers();
  }, [options.limit, options.from_location, options.to_location, options.search]);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await transfersService.getTransfers({
        limit: options.limit,
        from_location: options.from_location,
        to_location: options.to_location,
        search: options.search,
      });
      
      setTransfers(data.results || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // For demo purposes, set mock data
      setTransfers([
        {
          id: '1',
          title: 'Tehran Airport to City Center',
          description: 'Comfortable transfer from Tehran International Airport to the city center.',
          slug: 'tehran-airport-to-city',
          image: '/images/categories/transfers.jpg',
          from_location: 'Tehran International Airport',
          to_location: 'Tehran City Center',
          duration: '45 minutes',
          price: 35,
          vehicle_type: 'Sedan',
          max_passengers: 4,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Isfahan Airport to Hotel',
          description: 'Direct transfer from Isfahan Airport to your hotel.',
          slug: 'isfahan-airport-to-hotel',
          image: '/images/categories/transfers.jpg',
          from_location: 'Isfahan Airport',
          to_location: 'Isfahan Hotels',
          duration: '30 minutes',
          price: 25,
          vehicle_type: 'Van',
          max_passengers: 8,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          title: 'Shiraz Airport Transfer',
          description: 'Reliable airport transfer service in Shiraz.',
          slug: 'shiraz-airport-transfer',
          image: '/images/categories/transfers.jpg',
          from_location: 'Shiraz Airport',
          to_location: 'Shiraz City',
          duration: '40 minutes',
          price: 30,
          vehicle_type: 'SUV',
          max_passengers: 6,
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransferBySlug = async (slug: string): Promise<Transfer | null> => {
    try {
      return await transfersService.getTransferBySlug(slug);
    } catch (err) {
      console.error('Failed to fetch transfer:', err);
      return null;
    }
  };

  return {
    transfers,
    isLoading,
    error,
    refetch: fetchTransfers,
    getTransferBySlug,
  };
} 