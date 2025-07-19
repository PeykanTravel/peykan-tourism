'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { useProductService } from '@/lib/application/hooks/useProductService'
import { useCartStore } from '@/lib/application/stores/cartStore'
import { TourCard } from '@/components/feature/products'
import { Loading } from '@/components/ui'
import Link from 'next/link'

const DEFAULT_IMAGE = '/images/default-tour.jpg'

type TabType = 'featured' | 'popular' | 'all' | 'nature' | 'historical' | 'cultural'

interface Tab {
  id: TabType
  label: string
  filter?: any
}

export default function PackageTripsSection() {
  const t = useTranslations('home')
  const [tours, setTours] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('featured')

  // Detect RTL
  const isRTL = typeof document !== 'undefined' ? document.dir === 'rtl' : false

  const { getTours, getFeaturedTours } = useProductService()
  const { addToCart } = useCartStore()

  // Define tabs
  const tabs: Tab[] = [
    { id: 'featured', label: t('featured') },
    { id: 'popular', label: t('popular') },
    { id: 'all', label: t('allTours') },
    { id: 'nature', label: t('nature'), filter: { category: 'nature' } },
    { id: 'historical', label: t('historical'), filter: { category: 'historical' } },
    { id: 'cultural', label: t('cultural'), filter: { category: 'cultural' } },
  ]

  useEffect(() => {
    const fetchTours = async () => {
      setIsLoading(true)
      try {
        let response
        if (activeTab === 'featured') {
          response = await getFeaturedTours()
        } else {
          // For other tabs, use getTours with filters
          const filters = tabs.find(tab => tab.id === activeTab)?.filter
          response = await getTours(filters, 1, 6)
        }

        // Handle both PaginatedResponse and direct array
        if (response) {
          if (Array.isArray(response)) {
            // Direct array format (from featured endpoint)
            setTours(response)
          } else if ('results' in response && response.results) {
            // PaginatedResponse format
            setTours(response.results)
          } else {
            setTours([])
          }
        } else {
          setTours([])
        }
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت تورها')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [activeTab, getTours, getFeaturedTours])

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
  }

  const handleAddToCart = (tour: any) => {
    addToCart({
      product_id: tour.id,
      product_type: 'tour',
      quantity: 1,
      options: {}
    })
  }

  if (error) return <div className="py-8 text-center text-red-500">{error}</div>

  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        {t('featuredTours')}
      </h2>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className={`flex space-x-1 bg-gray-100 dark:bg-zinc-800 rounded-xl p-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-700 text-apple-primary dark:text-apple-primary-dark shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-8 text-center">
          <Loading text={t('loading')} />
        </div>
      )}

      {/* Tours Grid */}
      {!isLoading && tours.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 ${isRTL ? 'rtl' : ''}`}>
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tours.length === 0 && (
        <div className="py-8 text-center text-gray-400 dark:text-gray-500">
          {t('noTours')}
        </div>
      )}

      {/* View All Button */}
      {!isLoading && tours.length > 0 && (
        <div className="text-center mt-8">
          <Link
            href="/tours"
            className="inline-block px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {t('viewAllTours')}
          </Link>
        </div>
      )}
    </section>
  )
} 