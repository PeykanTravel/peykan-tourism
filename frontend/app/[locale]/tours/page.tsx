'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Tour {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  duration_hours: number;
  image_url?: string;
  location?: string;
  rating?: number;
  category?: string;
}

const categories = [
  { id: 'art', name: 'هنر و فرهنگ', nameEn: 'Art & Culture' },
  { id: 'nature', name: 'طبیعت', nameEn: 'Nature' },
  { id: 'city', name: 'شهری', nameEn: 'City' },
  { id: 'adventure', name: 'ماجراجویی', nameEn: 'Adventure' },
  { id: 'food', name: 'غذا و نوشیدنی', nameEn: 'Food & Drink' },
];

export default function ToursListPage() {
  const t = useTranslations('tours');
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peykantravelistanbul.com/api/v1';
        const response = await fetch(`${API_URL}/tours/tours/`);
        if (response.ok) {
          const data = await response.json();
          const enhancedTours = (Array.isArray(data) ? data : []).map((tour: Tour) => ({
            ...tour,
            title: tour.title || `Tour: ${tour.slug}`,
            description: tour.description || 'Experience the beauty and culture of this amazing destination with our carefully crafted tour package.',
            image_url: tour.image_url || `https://picsum.photos/400/300?random=${tour.id}`,
            location: tour.location || 'Tehran, Iran',
            rating: tour.rating || Math.floor(Math.random() * 2) + 4,
            category: tour.category || categories[Math.floor(Math.random() * categories.length)].id
          }));
          setTours(enhancedTours);
        } else {
          setError('Failed to load tours');
        }
      } catch (error) {
        setError('Failed to load tours');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tour.category === selectedCategory;
    const matchesPrice = parseFloat(tour.price) >= priceRange.min && parseFloat(tour.price) <= priceRange.max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center my-8">
        {error}
        <button onClick={() => window.location.reload()} className="ml-4 bg-blue-600 text-white px-4 py-2 rounded">تلاش مجدد</button>
      </div>
    );
  }

  if (!tours || tours.length === 0) return <div>هیچ توری یافت نشد.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">لیست تورها</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTours.map((tour) => (
          <div key={tour.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
            <img src={tour.image_url} alt={tour.title} className="w-full h-48 object-cover rounded mb-4" />
            <h2 className="text-lg font-semibold mb-2">{tour.title}</h2>
            <div className="text-gray-600 mb-2">{tour.location}</div>
            <div className="mb-2">{tour.price} {tour.currency}</div>
            <div className="mb-2">مدت زمان: {tour.duration_hours} ساعت</div>
            <Link href={`/fa/tours/${tour.slug}`} className="mt-auto bg-blue-600 text-white px-4 py-2 rounded text-center">
              مشاهده جزئیات
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 