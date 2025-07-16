'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { FaUsers, FaStar, FaGlobe, FaShieldAlt } from 'react-icons/fa'

export default function StatsSection() {
  const t = useTranslations('home')
  const [counts, setCounts] = useState({
    customers: 0,
    rating: 0,
    countries: 0,
    quality: 0
  })

  const stats = [
    {
      key: 'customers',
      icon: FaUsers,
      value: 15000,
      label: 'مشتری راضی',
      suffix: '+',
      color: 'text-blue-600'
    },
    {
      key: 'rating',
      icon: FaStar,
      value: 4.8,
      label: 'امتیاز مشتریان',
      suffix: '/5',
      color: 'text-blue-500'
    },
    {
      key: 'countries',
      icon: FaGlobe,
      value: 25,
      label: 'کشورهای مختلف',
      suffix: '+',
      color: 'text-blue-700'
    },
    {
      key: 'quality',
      icon: FaShieldAlt,
      value: 100,
      label: 'درصد تضمین کیفیت',
      suffix: '%',
      color: 'text-blue-800'
    }
  ]

  // Animate counters on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters()
          }
        })
      },
      { threshold: 0.5 }
    )

    const element = document.getElementById('stats-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const animateCounters = () => {
    stats.forEach((stat) => {
      const duration = 2000
      const steps = 60
      const increment = stat.value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= stat.value) {
          current = stat.value
          clearInterval(timer)
        }

        setCounts(prev => ({
          ...prev,
          [stat.key]: Math.floor(current * 10) / 10
        }))
      }, duration / steps)
    })
  }

  return (
    <section 
      id="stats-section"
      className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
      aria-label="آمار و دستاوردها"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            چرا Peykan Tourism را انتخاب کنید؟
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            با بیش از ۱۵,۰۰۰ مشتری راضی و تجربه‌ای ۱۰ ساله در صنعت گردشگری، 
            ما متعهد به ارائه بهترین خدمات سفر در استانبول هستیم
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            const currentValue = counts[stat.key as keyof typeof counts]
            
            return (
              <div 
                key={stat.label}
                className="text-center group"
              >
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  {/* Animated ring effect */}
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-transparent group-hover:border-blue-300 transition-all duration-300 animate-pulse"></div>
                </div>
                
                <div className="mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {currentValue}
                  </span>
                  <span className="text-xl text-gray-600 dark:text-gray-400">
                    {stat.suffix}
                  </span>
                </div>
                
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <FaShieldAlt className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                تضمین کیفیت
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                تمام خدمات ما با تضمین کیفیت و بازگشت وجه ارائه می‌شود
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FaUsers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                پشتیبانی 24/7
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                تیم پشتیبانی ما در تمام ساعات شبانه‌روز آماده خدمت‌رسانی است
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <FaStar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                قیمت مناسب
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                بهترین قیمت‌ها با کیفیت بالا و بدون هزینه‌های پنهان
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 