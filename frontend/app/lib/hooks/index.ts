import { useState, useEffect } from 'react';

// Simple hooks implementation without complex imports
export const useTours = (params?: any) => {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peykantravelistanbul.com/api/v1';
        const response = await fetch(`${API_URL}/tours/tours/`);
        if (response.ok) {
          const data = await response.json();
          setTours(data.results || []);
        } else {
          setError('Failed to fetch tours');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, [params]);

  return { tours, isLoading, error };
};

export const useTourDetail = (slug: string) => {
  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peykantravelistanbul.com/api/v1';
        const response = await fetch(`${API_URL}/tours/${slug}/`);
        if (response.ok) {
          const data = await response.json();
          setTour(data);
        } else {
          setError('Failed to fetch tour');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchTour();
    }
  }, [slug]);

  return { tour, isLoading, error };
};

export const useTourCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peykantravelistanbul.com/api/v1';
        const response = await fetch(`${API_URL}/tours/categories/`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

// Export useCart from the correct location
export { useCart } from '../../../lib/hooks/useCart'; 