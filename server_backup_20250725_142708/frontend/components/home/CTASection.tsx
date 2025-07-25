'use client'

import { useTranslations } from 'next-intl'

export default function CTASection() {
  const t = useTranslations('home')

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/cta-pattern.svg')] opacity-10"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            آماده کاوش جهان هستید؟
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
            اجازه دهید با تورها و مقاصد ویژه‌مان، خاطرات فراموش‌نشدنی برایتان بسازیم.
          </p>

          {/* CTA Button */}
          <div className="pt-8">
            <button className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-blue-600 bg-white rounded-full hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105">
              <span className="relative z-10">همین حالا رزرو کنید</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Additional Info */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2 rtl:gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <span>پشتیبانی 24 ساعته</span>
            </div>
            <div className="flex items-center gap-2 rtl:gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <span>بهترین قیمت تضمینی</span>
            </div>
            <div className="flex items-center gap-2 rtl:gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <span>لغو رایگان</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 