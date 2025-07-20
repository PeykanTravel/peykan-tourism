'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function EventsSection() {
  const t = useTranslations('home')

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

        {/* Events Layout */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Column - Vertical Past Events (Grayscale) */}
          <div className="lg:w-1/4 order-2 lg:order-1">
            <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80" 
                alt="Past Events"
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              {/* Light sweep animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              
              <div className="absolute inset-0 flex items-end justify-center p-8">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold mb-2">01</div>
                  <h3 className="text-2xl font-bold mb-4">ایونت‌های گذشته</h3>
                  <p className="text-lg mb-6 opacity-90">
                    لحظات فراموش‌نشدنی از ایونت‌های برگزار شده را دوباره زنده کنید
                  </p>
                  <Link 
                    href="/events?filter=past"
                    className="inline-block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    مشاهده گالری
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Horizontal Upcoming Events with content below */}
          <div className="lg:w-3/4 order-1 lg:order-2">
            <div className="h-[600px] flex flex-col">
              {/* Image - takes up about 60% of height */}
              <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" 
                  alt="Upcoming Events"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Light sweep animation */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                
                {/* Number overlay */}
                <div className="absolute top-6 right-6">
                  <div className="text-6xl font-bold text-white/20">02</div>
                </div>
              </div>

              {/* Content below image - fills remaining space (40% of height) */}
              <div className="flex-1 flex flex-col justify-center p-8">
                <div className="max-w-2xl">
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
                    تجربه<br />
                    ایونت‌های آینده
                  </h2>
                  <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 leading-relaxed">
                    در ایونت‌های هیجان‌انگیز آینده شرکت کنید و خاطرات فراموش‌نشدنی بسازید.
                    از کنسرت‌ها گرفته تا نمایش‌های تئاتر و رویدادهای ورزشی.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6">
                    <Link 
                      href="/events"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      رزرو کنید
                    </Link>
                    
                    <Link 
                      href="/events"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-lg hover:underline transition-colors duration-300"
                    >
                      مشاهده ایونت‌های بیشتر
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 