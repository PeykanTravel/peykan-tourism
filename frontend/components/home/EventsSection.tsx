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
              
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="text-sm font-semibold mb-2 opacity-80">گذشته</div>
                <h3 className="text-2xl font-bold mb-2">ایونت‌های گذشته</h3>
                <p className="text-sm opacity-80">مجموعه‌ای از ایونت‌های برگزار شده قبلی</p>
              </div>
            </div>
          </div>

          {/* Main Column - Featured/Upcoming Events */}
          <div className="lg:w-2/4 order-1 lg:order-2">
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-700/90"></div>
              
              {/* Hero Image - takes up 60% of height */}
              <div className="flex-1 relative">
                <img 
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80" 
                  alt="Main Event"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className="absolute top-8 left-8 right-8">
                  <div className="flex items-center justify-between">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-white text-sm font-medium">پیشروی</span>
                    </div>
                    <div className="bg-red-500 text-white rounded-full px-4 py-2">
                      <span className="text-sm font-bold">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content below image - fills remaining space (40% of height) */}
              <div className="flex-1 flex flex-col justify-center p-8">
                <div className="max-w-2xl">
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                    تجربه<br />
                    ایونت‌های آینده
                  </h2>
                  <p className="text-xl mb-8 text-white/90 leading-relaxed">
                    در ایونت‌های هیجان‌انگیز آینده شرکت کنید و خاطرات فراموش‌نشدنی بسازید.
                    از کنسرت‌ها گرفته تا نمایش‌های تئاتر و رویدادهای ورزشی.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link href="/events" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                      مشاهده همه
                    </Link>
                    <Link href="/events/featured" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                      ایونت‌های ویژه
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Events */}
          <div className="lg:w-1/4 order-3 lg:order-3">
            <div className="h-[600px] flex flex-col gap-6">
              {/* Top Event */}
              <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80" 
                  alt="Upcoming Event 1"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="bg-green-500 text-white rounded-full px-3 py-1 text-xs font-semibold mb-3 inline-block">
                    آینده
                  </div>
                  <h3 className="text-xl font-bold mb-2">کنسرت موسیقی</h3>
                  <p className="text-sm opacity-80">۱۵ آذر ۱۴۰۳</p>
                </div>
              </div>

              {/* Bottom Event */}
              <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" 
                  alt="Upcoming Event 2"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="bg-orange-500 text-white rounded-full px-3 py-1 text-xs font-semibold mb-3 inline-block">
                    محبوب
                  </div>
                  <h3 className="text-xl font-bold mb-2">نمایش تئاتر</h3>
                  <p className="text-sm opacity-80">۲۰ آذر ۱۴۰۳</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Event Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-300">ایونت برگزار شده</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-300">شرکت‌کننده خوشحال</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">98%</div>
            <div className="text-gray-600 dark:text-gray-300">رضایت مشتریان</div>
          </div>
        </div>
      </div>
    </section>
  )
} 