import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { OptimizedImage } from '../ui/OptimizedImage';

interface Destination {
  id: string;
  title: string;
  persianTitle: string;
  image: string;
  rating: number;
  packages: number;
  desc: string;
  size: 'small' | 'large';
  href: string;
}

// Fallback destinations if backend is unavailable
const fallbackDestinations: Destination[] = [
  {
    id: '1',
    title: 'Italy',
    persianTitle: 'ایتالیا',
    image: '/destinations/italy.jpg',
    rating: 4.9,
    packages: 20,
    desc: 'کشوری زیبا در جنوب اروپا با تاریخ غنی و فرهنگ بی‌نظیر',
    size: 'small',
    href: '/tours'
  },
  {
    id: '2',
    title: 'Italy',
    persianTitle: 'ایتالیا',
    image: '/destinations/italy-large.jpg',
    rating: 4.9,
    packages: 20,
    desc: 'سوئیس، رسماً کنفدراسیون سوئیس، کشوری محاط به خشکی است که در قسمت شمالی اروپا قرار دارد.',
    size: 'large',
    href: '/tours'
  },
  {
    id: '3',
    title: 'Greece',
    persianTitle: 'یونان',
    image: '/destinations/greece.jpg',
    rating: 4.8,
    packages: 20,
    desc: 'جزایر زیبا و تاریخ کهن یونان باستان',
    size: 'small',
    href: '/tours'
  }
];

export default function PopularDestinationsSection() {
  const [destinations, setDestinations] = useState<Destination[]>(fallbackDestinations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/v1/destinations/popular/');
        if (response.ok) {
          const data = await response.json();
          const formattedDestinations = data.results.map((dest: any) => ({
            id: dest.id,
            title: dest.name_en || dest.name,
            persianTitle: dest.name_fa || dest.name,
            image: dest.image || `/destinations/${dest.slug}.jpg`,
            rating: dest.average_rating || 4.5,
            packages: dest.tour_count || 0,
            desc: dest.description || 'مقصد محبوب برای سفر',
            size: dest.is_featured ? 'large' : 'small',
            href: `/tours?destination=${dest.slug}`
          }));
          setDestinations(formattedDestinations);
        }
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
        // Keep fallback destinations
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">مقاصد محبوب</h2>
            <p className="text-lg text-gray-600">مقاصد برتر برای سفرهای شما</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">مقاصد محبوب</h2>
          <p className="text-lg text-gray-600">مقاصد برتر برای سفرهای شما</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                destination.size === 'large' ? 'md:col-span-2' : ''
              }`}
            >
              <div className="relative h-64 md:h-80">
                                 <OptimizedImage
                   src={destination.image}
                   alt={destination.title}
                   width={400}
                   height={320}
                   className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                 />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{destination.persianTitle}</h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm">{destination.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-90 mb-3">{destination.desc}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-blue-400" />
                      <span className="text-sm">{destination.packages} پکیج</span>
                    </div>
                    
                    <a
                      href={destination.href}
                      className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors"
                    >
                      مشاهده تورها
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 