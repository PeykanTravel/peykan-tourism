'use client'

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useProducts } from '@/lib/application/hooks/useProducts';
import { useCart } from '@/lib/contexts/AppContext';
import { Quantity } from '@/lib/domain/value-objects/Quantity';

export default function EventsSection() {
  const t = useTranslations('home');
  const { products: events, getEvents, isLoading, error } = useProducts();
  const { addItem } = useCart();

  // Fetch events on component mount
  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        await getEvents({ limit: 3 });
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, [getEvents]);

  const handleAddToCart = (event: any) => {
    // Note: This is a temporary implementation - needs proper CartItem creation
    console.log('Add to cart:', event);
  };

  if (error) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              خطا در بارگذاری ایونت‌ها
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              لطفاً دوباره تلاش کنید
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-4">
            SPECIAL EVENTS
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            SPECIAL EVENTS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            رزرو بلیط برای ایونت‌های خاص متناسب با نیاز شما
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <p>Loading...</p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
                <button
                  onClick={() => handleAddToCart(event)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No Events State */}
        {!isLoading && events.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ایونت خاصی یافت نشد
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              در حال حاضر ایونت ویژه‌ای برای نمایش وجود ندارد
            </p>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              مشاهده همه ایونت‌ها
            </Link>
          </div>
        )}

        {/* CTA Button */}
        {!isLoading && events.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/events"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              مشاهده همه ایونت‌ها
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 