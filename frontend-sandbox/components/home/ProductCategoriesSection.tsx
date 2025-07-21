import React from 'react';
import { FaUmbrellaBeach, FaTicketAlt, FaShuttleVan } from 'react-icons/fa';
import Link from 'next/link';

const categories = [
  {
    title: 'تورهای تفریحی',
    icon: <FaUmbrellaBeach className="text-4xl text-blue-500" />,
    href: '/tours',
    desc: 'رزرو انواع تورهای داخلی و خارجی با بهترین قیمت',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    title: 'ایونت و رویداد',
    icon: <FaTicketAlt className="text-4xl text-green-500" />,
    href: '/events',
    desc: 'خرید بلیط ایونت‌های خاص و کنسرت‌ها',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    title: 'ترانسفر اختصاصی',
    icon: <FaShuttleVan className="text-4xl text-yellow-500" />,
    href: '/transfers',
    desc: 'رزرو ترانسفر فرودگاهی و شهری با راننده حرفه‌ای',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
];

export default function ProductCategoriesSection() {
  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {categories.map((cat, index) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="group relative overflow-hidden"
          >
            <div className={`${cat.bgColor} rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-gray-100 dark:border-gray-700`}>
              {/* Icon Container */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {cat.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
                {cat.desc}
              </p>
              
              {/* Arrow */}
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                <span className="ml-2">مشاهده بیشتر</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
          </Link>
        ))}
      </div>
    </section>
  );
} 