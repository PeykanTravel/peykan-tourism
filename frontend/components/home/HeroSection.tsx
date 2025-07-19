'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { MdEvent, MdDirectionsCar, MdTour } from 'react-icons/md'
import Image from 'next/image'

export default function HeroSection() {
  const t = useTranslations('home')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<number>(0)
  const touchEndRef = useRef<number>(0)

  const heroSlides = useMemo(() => [
    {
      id: 1,
      title: "سفر رویایی خود را پیدا کنید",
      subtitle: "تور، ایونت، و انتقال",
      description: "بهترین تجربه سفر را با ما تجربه کنید",
      image: "/images/hero-main.jpg",
      primaryAction: "شروع سفر",
      secondaryAction: "بیشتر بدانید",
      icon: <MdTour className="text-4xl" />,
      gradient: "from-blue-600 to-purple-600"
    },
    {
      id: 2,
      title: "ایونت‌های خاص را از دست ندهید",
      subtitle: "تجربه‌های فراموش‌نشدنی",
      description: "در رویدادهای منحصر به فرد شرکت کنید",
      image: "/images/hero-main.jpg",
      primaryAction: "مشاهده ایونت‌ها",
      secondaryAction: "رزرو کنید",
      icon: <MdEvent className="text-4xl" />,
      gradient: "from-green-600 to-blue-600"
    },
    {
      id: 3,
      title: "انتقال راحت و امن",
      subtitle: "حمل و نقل بدون دغدغه",
      description: "سفر کنید با بهترین سرویس انتقال",
      image: "/images/black-van-top.jpg",
      primaryAction: "رزرو انتقال",
      secondaryAction: "قیمت‌ها",
      icon: <MdDirectionsCar className="text-4xl" />,
      gradient: "from-orange-600 to-red-600"
    }
  ], [])

  const nextSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [heroSlides.length, isTransitioning])

  const prevSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [heroSlides.length, isTransitioning])

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [currentSlide, isTransitioning])

  // Auto-play functionality
  useEffect(() => {
    if (isAutoplay) {
      intervalRef.current = setInterval(nextSlide, 5000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoplay, nextSlide])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return
    const distance = touchStartRef.current - touchEndRef.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsAutoplay(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  const currentSlideData = heroSlides[currentSlide]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src={currentSlideData.image}
            alt={currentSlideData.title}
            fill
            className={`object-cover transition-all duration-500 ${
              isTransitioning ? 'scale-110 blur-sm' : 'scale-100 blur-0'
            }`}
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.gradient} opacity-75`} />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm text-white">
              {currentSlideData.icon}
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-lg md:text-xl text-white/90 font-medium mb-4">
            {currentSlideData.subtitle}
          </div>

          {/* Title */}
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-500 ${
            isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
          }`}>
            {currentSlideData.title}
          </h1>

          {/* Description */}
          <p className={`text-xl md:text-2xl text-white/80 mb-12 leading-relaxed transition-all duration-500 delay-100 ${
            isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
          }`}>
            {currentSlideData.description}
          </p>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-500 delay-200 ${
            isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
          }`}>
            <button className="group relative bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="relative z-10">{currentSlideData.primaryAction}</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
            <button className="group border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105">
              {currentSlideData.secondaryAction}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4">
          {/* Slide Indicators */}
          <div className="flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
            aria-label={isAutoplay ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isAutoplay ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
        disabled={isTransitioning}
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-xl" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
        disabled={isTransitioning}
        aria-label="Next slide"
      >
        <FaChevronRight className="text-xl" />
      </button>

      {/* Touch area for mobile */}
      <div 
        className="absolute inset-0 z-5"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
} 