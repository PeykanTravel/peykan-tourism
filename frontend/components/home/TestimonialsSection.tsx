import React from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  {
    name: 'علی رضایی',
    role: 'کاربر تور برزیل',
    comment: 'تجربه فوق‌العاده‌ای داشتم! همه چیز عالی و منظم بود. قطعاً دوباره از خدمات شما استفاده خواهم کرد.',
    rating: 5,
    avatar: '/avatars/user1.png',
  },
  {
    name: 'سمانه محمدی',
    role: 'خریدار بلیط ایونت',
    comment: 'پشتیبانی سریع و قیمت مناسب. حتماً دوباره استفاده می‌کنم. تیم پشتیبانی فوق‌العاده حرفه‌ای بودند.',
    rating: 5,
    avatar: '/avatars/user2.png',
  },
  {
    name: 'مهدی کریمی',
    role: 'مشتری ترانسفر',
    comment: 'راننده بسیار حرفه‌ای و خوش‌برخورد بود. ممنون از خدمات خوبتون. کیفیت خدمات بالاتر از انتظارم بود.',
    rating: 5,
    avatar: '/avatars/user3.png',
  },
];

export default function TestimonialsSection() {
  return (
    <section>
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
          نظرات مشتریان ما
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          تجربیات واقعی مشتریان از خدمات ما
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {testimonials.map((t, index) => (
          <div 
            key={t.name} 
            className="group bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
          >
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 text-blue-100 dark:text-blue-900">
              <FaQuoteLeft className="w-8 h-8" />
            </div>
            
            {/* Avatar */}
            <div className="relative mb-6">
              <img 
                src={t.avatar} 
                alt={t.name} 
                className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg object-cover group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                <FaStar className="w-3 h-3" />
              </div>
            </div>
            
            {/* Content */}
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{t.name}</h3>
            <span className="text-sm text-blue-600 dark:text-blue-400 mb-4 font-medium">{t.role}</span>
            
            {/* Comment */}
            <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed mb-6 italic">
              &quot;{t.comment}&quot;
            </p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 text-yellow-400">
              {[...Array(Math.floor(t.rating))].map((_, i) => (
                <FaStar key={i} className="w-4 h-4" />
              ))}
              {t.rating % 1 !== 0 && <FaStar className="w-4 h-4 opacity-50" />}
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          </div>
        ))}
      </div>
    </section>
  );
} 