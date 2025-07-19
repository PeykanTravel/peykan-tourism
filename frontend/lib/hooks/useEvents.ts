/**
 * Events Hook
 * 
 * Custom hook for managing events data
 */

import { useState, useEffect } from 'react';
import { eventsService } from '@/lib/services/eventsService';

interface Event {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  available_seats: number;
  category: string;
  status: 'active' | 'cancelled' | 'sold_out';
  created_at: string;
  updated_at: string;
}

interface UseEventsOptions {
  limit?: number;
  category?: string;
  search?: string;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [options.limit, options.category, options.search]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await eventsService.getEvents({
        limit: options.limit,
        category: options.category,
        search: options.search,
      });
      
      setEvents(data.results || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // For demo purposes, set mock data
      setEvents([
        {
          id: '1',
          title: 'İran Klasik Konseri 2024',
          description: 'A beautiful classical music concert featuring traditional Iranian instruments.',
          slug: 'iran-klasik-konseri-2024',
          image: '/images/events/classical-concert.jpg',
          date: '2024-03-15',
          time: '19:00',
          location: 'Tehran Opera House',
          price: 75,
          capacity: 500,
          available_seats: 350,
          category: 'concerts',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Hamlet - Shakespeare Tiyatrosu',
          description: 'A modern interpretation of Shakespeare\'s classic tragedy.',
          slug: 'hamlet-shakespeare-tiyatrosu',
          image: '/images/events/hamlet-theater.jpg',
          date: '2024-03-20',
          time: '20:00',
          location: 'Tehran Theater Hall',
          price: 45,
          capacity: 300,
          available_seats: 200,
          category: 'theater',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          title: 'Bahar Kültür Festivali 2024',
          description: 'Spring cultural festival celebrating Iranian arts and culture.',
          slug: 'bahar-kultur-festivali-2024',
          image: '/images/events/spring-festival.jpg',
          date: '2024-04-01',
          time: '18:00',
          location: 'Tehran Cultural Center',
          price: 30,
          capacity: 1000,
          available_seats: 800,
          category: 'festivals',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventBySlug = async (slug: string): Promise<Event | null> => {
    try {
      return await eventsService.getEventBySlug(slug);
    } catch (err) {
      console.error('Failed to fetch event:', err);
      return null;
    }
  };

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
    getEventBySlug,
  };
} 