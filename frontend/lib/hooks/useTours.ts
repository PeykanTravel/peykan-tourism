/**
 * Tours Hook
 * 
 * Custom hook for managing tours data
 */

import { useState, useEffect } from 'react';
import { toursService } from '@/lib/services/toursService';

interface Tour {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string;
  location: string;
  duration: string;
  price: number;
  max_participants: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface UseToursOptions {
  limit?: number;
  category?: string;
  search?: string;
}

export function useTours(options: UseToursOptions = {}) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTours();
  }, [options.limit, options.category, options.search]);

  const fetchTours = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await toursService.getTours({
        limit: options.limit,
        category: options.category,
        search: options.search,
      });
      
      setTours(data.results || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // For demo purposes, set mock data
      setTours([
        {
          id: '1',
          title: 'Persepolis Historical Tour',
          description: 'Explore the ancient ruins of Persepolis, the ceremonial capital of the Achaemenid Empire.',
          slug: 'persepolis-historical-tour',
          image: '/images/tours/persepolis.jpg',
          location: 'Shiraz, Iran',
          duration: '8 hours',
          price: 120,
          max_participants: 15,
          category: 'historical',
          difficulty: 'easy',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Isfahan Cultural Tour',
          description: 'Discover the beautiful mosques, palaces, and gardens of Isfahan.',
          slug: 'isfahan-cultural-tour',
          image: '/images/tours/isfahan.jpg',
          location: 'Isfahan, Iran',
          duration: '6 hours',
          price: 90,
          max_participants: 12,
          category: 'cultural',
          difficulty: 'easy',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          title: 'Shiraz Gardens Tour',
          description: 'Visit the famous gardens and historical sites of Shiraz.',
          slug: 'shiraz-gardens-tour',
          image: '/images/tours/shiraz-gardens.jpg',
          location: 'Shiraz, Iran',
          duration: '5 hours',
          price: 75,
          max_participants: 10,
          category: 'cultural',
          difficulty: 'easy',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '4',
          title: 'Tehran City Tour',
          description: 'Explore the modern capital city with its museums and landmarks.',
          slug: 'tehran-city-tour',
          image: '/images/tours/tehran-city.jpg',
          location: 'Tehran, Iran',
          duration: '4 hours',
          price: 60,
          max_participants: 20,
          category: 'city',
          difficulty: 'easy',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTourBySlug = async (slug: string): Promise<Tour | null> => {
    try {
      return await toursService.getTourBySlug(slug);
    } catch (err) {
      console.error('Failed to fetch tour:', err);
      return null;
    }
  };

  return {
    tours,
    isLoading,
    error,
    refetch: fetchTours,
    getTourBySlug,
  };
} 