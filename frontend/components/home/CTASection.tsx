'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui'

export default function CTASection() {
  const t = useTranslations('home')

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/cta-pattern.svg')] opacity-10"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {t('cta.title')}
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
            {t('cta.subtitle')}
          </p>

          {/* CTA Button */}
          <div className="pt-8">
            <Button
              variant="secondary"
              size="xl"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              {t('cta.button')}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2 rtl:gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span>{t('cta.features.support')}</span>
            </div>
            <div className="flex items-center gap-2 rtl:gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span>{t('cta.features.pricing')}</span>
            </div>
            <div className="flex items-center gap-2 rtl:gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span>{t('cta.features.cancellation')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 