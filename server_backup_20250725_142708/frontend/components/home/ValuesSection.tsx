'use client'

import { useTranslations } from 'next-intl'
import { FaSmile, FaMountain, FaFlag, FaClock } from 'react-icons/fa'

const values = [
  {
    id: 'customer-delight',
    icon: FaSmile,
    title: 'رضایت مشتری',
    titleEn: 'Customer Delight',
    description: 'ما بهترین خدمات و تجربه را برای مشتریانمان ارائه می‌دهیم.'
  },
  {
    id: 'authentic-adventure',
    icon: FaMountain,
    title: 'ماجراجویی اصیل',
    titleEn: 'Authentic Adventure',
    description: 'ما تجربه ماجراجویی واقعی را برای مشتریان عزیز ارائه می‌دهیم.'
  },
  {
    id: 'expert-guides',
    icon: FaFlag,
    title: 'راهنمایان متخصص',
    titleEn: 'Expert Guides',
    description: 'ما فقط راهنمایان متخصص تور را برای مشتریان عزیز ارائه می‌دهیم.'
  },
  {
    id: 'time-flexibility',
    icon: FaClock,
    title: 'انعطاف زمانی',
    titleEn: 'Time Flexibility',
    description: 'ما از انعطاف زمانی سفر برای مشتریان عزیز استقبال می‌کنیم.'
  }
]

export default function ValuesSection() {
  const t = useTranslations('home')

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-4">
            values
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            OUR VALUES
          </h1>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon
            return (
              <div
                key={value.id}
                className="group text-center p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:shadow-lg"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            این ارزش‌ها ما را در ارائه بهترین خدمات گردشگری یاری می‌کنند
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl">
            با ما همراه باشید
          </button>
        </div>
      </div>
    </section>
  )
} 