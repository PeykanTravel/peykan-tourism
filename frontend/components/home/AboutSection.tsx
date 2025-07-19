'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'

export default function AboutSection() {
  const t = useTranslations('home')
  const [counters, setCounters] = useState({
    experience: 0,
    countries: 0
  })

  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps
      
      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        
        setCounters({
          experience: Math.floor(20 * progress),
          countries: Math.floor(100 * progress)
        })
        
        if (currentStep >= steps) {
          clearInterval(interval)
          setCounters({ experience: 20, countries: 100 })
        }
      }, stepDuration)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters()
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 }
    )

    const element = document.getElementById('about-section')
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about-section" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Column */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/images/about-image.jpg" 
                alt="About Us"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Content Column */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                  about
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  MEMORABLE <br />
                  <span className="text-blue-600 dark:text-blue-400">TRAVELS</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  آژانس مسافرتی پیکان، آژانس مسافرتی کاملی برای تمام سفرهای به یادماندنی شماست. 
                  با راهنمایان متخصص ما، ما هم حرفه‌ای و هم شخصی هستیم. سفرهای ما شامل تجربیات 
                  فراموش‌نشدنی است و به روشی پایدار برای محافظت از محیط زیست ارائه می‌شود.
                </p>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center lg:text-right">
                  <div className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {counters.experience}+
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    سال تجربه
                  </div>
                </div>
                
                <div className="text-center lg:text-left">
                  <div className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {counters.countries}+
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    کشور مقصد
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 rtl:gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    راهنمایان متخصص و باتجربه
                  </span>
                </div>
                <div className="flex items-center gap-3 rtl:gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    تجربیات فراموش‌نشدنی و منحصر به فرد
                  </span>
                </div>
                <div className="flex items-center gap-3 rtl:gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    سفرهای پایدار و محیط زیست دوست
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-lg hover:shadow-xl hover:scale-105"
                >
                  درباره ما بیشتر بدانید
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 