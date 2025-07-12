'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface Destination {
  id: string
  name: string
  packages: number
  image: string
  category: string
}

const destinations: Destination[] = [
  { id: '1', name: 'فنلاند', packages: 20, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', category: 'nature' },
  { id: '2', name: 'کره جنوبی', packages: 15, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', category: 'city' },
  { id: '3', name: 'ایسلند', packages: 25, image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80', category: 'nature' },
  { id: '4', name: 'ایتالیا', packages: 30, image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=400&q=80', category: 'art' },
  { id: '5', name: 'ژاپن', packages: 18, image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80', category: 'city' },
  { id: '6', name: 'نروژ', packages: 12, image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', category: 'nature' },
  { id: '7', name: 'فرانسه', packages: 35, image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80', category: 'art' },
  { id: '8', name: 'سوئیس', packages: 22, image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80', category: 'seasonal' },
  // New destinations
  { id: '9', name: 'یونان', packages: 28, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', category: 'art' },
  { id: '10', name: 'اسپانیا', packages: 19, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80', category: 'city' },
  { id: '11', name: 'مکزیک', packages: 16, image: 'https://images.unsplash.com/photo-1465156799763-2c087c332922?auto=format&fit=crop&w=400&q=80', category: 'nature' },
  { id: '12', name: 'مراکش', packages: 21, image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80', category: 'seasonal' },
]

const categories = [
  { id: 'art', name: 'هنر و فرهنگ', nameEn: 'Art' },
  { id: 'bestseller', name: 'پرفروش‌ترین', nameEn: 'Best Seller' },
  { id: 'nature', name: 'طبیعت', nameEn: 'Nature' },
  { id: 'city', name: 'شهری', nameEn: 'City' },
  { id: 'seasonal', name: 'فصلی', nameEn: 'Seasonal' },
]

export default function PackageTripsSection() {
  const t = useTranslations('home')
  const [activeCategory, setActiveCategory] = useState('art')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerSlide, setItemsPerSlide] = useState(4)

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setItemsPerSlide(1)
      } else if (window.innerWidth < 768) {
        setItemsPerSlide(2)
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(3)
      } else {
        setItemsPerSlide(4)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredDestinations = destinations.filter(dest => {
    if (activeCategory === 'bestseller') {
      return dest.packages >= 25
    }
    return dest.category === activeCategory
  })

  const totalSlides = Math.ceil(filteredDestinations.length / itemsPerSlide)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide
    return filteredDestinations.slice(startIndex, startIndex + itemsPerSlide)
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="gallery-carousel overflow-visible relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-4">
            package
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            TRIPS
          </h1>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id)
                setCurrentSlide(0) // Reset to first slide when changing category
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600'
              }`}
            >
              {category.nameEn}
            </button>
          ))}
        </div>

        {/* Carousel Container */}
        <div className="relative flex flex-col items-center justify-center w-full">
          {/* Cards Row - grid with overflow-visible and translate-x for sliding */}
          <div className="overflow-visible w-full pb-8">
            <div
              className={`grid gap-12 transition-transform duration-500 grid-cols-1 ${itemsPerSlide === 2 ? 'sm:grid-cols-2' : ''} ${itemsPerSlide === 3 ? 'md:grid-cols-3' : ''} ${itemsPerSlide === 4 ? 'lg:grid-cols-4' : ''}`}
              style={{
                width: '100%',
                gridAutoFlow: 'column',
              }}
            >
              {getCurrentSlideItems().map((destination, index) => (
                <div
                  key={destination.id}
                  className={`flex flex-col items-center ${index % 2 === 1 ? 'translate-y-8' : 'translate-y-0'} w-full`}
                  style={{ minWidth: itemsPerSlide === 1 ? '100%' : undefined, maxWidth: itemsPerSlide === 1 ? '100%' : undefined }}
                >
                  <div
                    className="w-full sm:w-72 h-80 sm:h-96 bg-white overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 hover:border-blue-500 transition-all duration-300 flex flex-col justify-end rounded-3xl"
                  >
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{destination.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span>{destination.packages} Packages</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Slider Buttons - centered below cards */}
          <div className="flex sm:hidden justify-center gap-4 mt-2 w-full">
            <button
              onClick={prevSlide}
              className="w-12 h-12 bg-white border-2 border-blue-500 hover:bg-blue-100 text-blue-600 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-blue-400"
              style={{ outline: 'none' }}
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 bg-white border-2 border-blue-500 hover:bg-blue-100 text-blue-600 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-blue-400"
              style={{ outline: 'none' }}
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 gap-2 rtl:gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Slider Buttons */}
        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg items-center justify-center text-3xl border-4 border-white transition-all duration-300"
          style={{ outline: 'none' }}
          aria-label="Previous"
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg items-center justify-center text-3xl border-4 border-white transition-all duration-300"
          style={{ outline: 'none' }}
          aria-label="Next"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  )
} 