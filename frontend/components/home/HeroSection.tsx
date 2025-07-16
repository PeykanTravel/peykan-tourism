'use client'

import { useTranslations } from 'next-intl'
<<<<<<< Updated upstream
import { useState, useEffect } from 'react'
import { FaPlay, FaPlane, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function HeroSection() {
  const t = useTranslations('home')
  const [searchForm, setSearchForm] = useState({
    destination: '',
    date: '',
    price: '$1,000 - $2,000'
  })

=======
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { MdEvent, MdDirectionsCar, MdTour } from 'react-icons/md'
import Image from 'next/image'

export default function HeroSection() {
  const t = useTranslations('home')
  
>>>>>>> Stashed changes
  // Carousel states
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 3

  // Animation states for first slide
  const [topText, setTopText] = useState('CREATE UNFORGETTABLE')
  const [middleText, setMiddleText] = useState('MEMORIES')
  const [bottomText, setBottomText] = useState('WITH OUR')
  const [showCursor, setShowCursor] = useState(true)
  const [animationPhase, setAnimationPhase] = useState('initial')

  const initialTopText = 'CREATE UNFORGETTABLE'
  const initialMiddleText = 'MEMORIES'
  const initialBottomText = 'WITH OUR'
  const newText = 'EASY ACCESS AND FREE TO SHOP'

<<<<<<< Updated upstream
  // Auto-slide carousel
=======
  // Refs for cleanup
  const slideIntervalRef = useRef<NodeJS.Timeout>()
  const animationTimeoutRef = useRef<NodeJS.Timeout>()
  const cursorIntervalRef = useRef<NodeJS.Timeout>()

  // Hero background images
  const heroImages = [
    {
      src: '/images/hero-main.jpg',
      alt: 'Istanbul skyline - Hero main',
      title: 'استانبول'
    },
    {
      src: '/images/istanbul-fallback.jpg', 
      alt: 'Istanbul tours - Fallback image',
      title: 'تورهای استانبول'
    },
    {
      src: '/images/event-center-image.jpg',
      alt: 'Istanbul events - Event center',
      title: 'رویدادهای استانبول'
    }
  ]

  // Auto-slide carousel with cleanup
>>>>>>> Stashed changes
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides)
    }, 12000)

    return () => clearInterval(slideInterval)
  }, [])

  // Text animation for first slide
  useEffect(() => {
    if (currentSlide !== 0) return

    let timeout: NodeJS.Timeout

    const runAnimation = () => {
      switch (animationPhase) {
        case 'initial':
<<<<<<< Updated upstream
          // Show initial text for 2 seconds
          timeout = setTimeout(() => {
=======
          animationTimeoutRef.current = setTimeout(() => {
>>>>>>> Stashed changes
            setAnimationPhase('waiting')
          }, 2000)
          break

        case 'waiting':
<<<<<<< Updated upstream
          // Wait 1 second before starting to delete
          timeout = setTimeout(() => {
=======
          animationTimeoutRef.current = setTimeout(() => {
>>>>>>> Stashed changes
            setAnimationPhase('deleting')
          }, 1000)
          break

        case 'deleting':
          if (bottomText.length > 0) {
            timeout = setTimeout(() => {
              setBottomText(prev => prev.slice(0, -1))
            }, 100)
<<<<<<< Updated upstream
          }
          // Then delete middle text
          else if (middleText.length > 0) {
            timeout = setTimeout(() => {
              setMiddleText(prev => prev.slice(0, -1))
            }, 100)
          }
          // Finally delete top text
          else if (topText.length > 0) {
            timeout = setTimeout(() => {
              setTopText(prev => prev.slice(0, -1))
            }, 100)
          }
          // All text deleted, start typing new text
          else {
=======
          } else if (middleText.length > 0) {
            animationTimeoutRef.current = setTimeout(() => {
              setMiddleText(prev => prev.slice(0, -1))
            }, 100)
          } else if (topText.length > 0) {
            animationTimeoutRef.current = setTimeout(() => {
              setTopText(prev => prev.slice(0, -1))
            }, 100)
          } else {
>>>>>>> Stashed changes
            setAnimationPhase('typing')
          }
          break

        case 'typing':
          if (topText.length < newText.length) {
            timeout = setTimeout(() => {
              setTopText(prev => newText.slice(0, prev.length + 1))
            }, 150)
          } else {
<<<<<<< Updated upstream
            // Animation complete, restart after 5 seconds
            timeout = setTimeout(() => {
=======
            animationTimeoutRef.current = setTimeout(() => {
>>>>>>> Stashed changes
              setAnimationPhase('resetting')
            }, 5000)
          }
          break

        case 'resetting':
          setTopText(initialTopText)
          setMiddleText(initialMiddleText)
          setBottomText(initialBottomText)
          setAnimationPhase('initial')
          break
      }
    }

    runAnimation()

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [topText, middleText, bottomText, animationPhase, currentSlide])

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

<<<<<<< Updated upstream
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSearchForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchForm)
  }

  const nextSlide = () => {
=======
  const nextSlide = useCallback(() => {
>>>>>>> Stashed changes
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6">
              {topText && (
                <h3 className="text-2xl md:text-3xl font-light mb-2 tracking-wide min-h-[2rem]">
                  {topText}
                </h3>
              )}
              
              {middleText && (
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight min-h-[4rem]">
                  {middleText}
                </h1>
              )}
              
              {bottomText && (
                <h3 className="text-2xl md:text-3xl font-light mb-2 tracking-wide min-h-[2rem]">
                  {bottomText}
                </h3>
              )}
              
<<<<<<< Updated upstream
              {/* PEYKAN with cursor */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span 
                  className={`text-5xl md:text-7xl font-bold text-yellow-400 ${
                    showCursor ? 'opacity-100' : 'opacity-0'
                  } transition-opacity duration-100`}
                >
                  |
                </span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                  PEYKAN
                </h1>
              </div>
=======
              <p className="text-lg md:text-xl text-gray-200 mt-6 max-w-2xl mx-auto">
                {t('heroSubtitle')}
              </p>
>>>>>>> Stashed changes
            </div>
          </div>
        )

      case 1:
<<<<<<< Updated upstream
        // Second slide - Istanbul video
        return (
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/images/istanbul-heli.mp4" type="video/mp4" />
              {/* Fallback image if video doesn't load */}
              <img 
                src="/images/istanbul-fallback.jpg" 
                alt="Istanbul"
                className="w-full h-full object-cover"
              />
            </video>
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                  ISTANBUL
                </h1>
                <h3 className="text-2xl md:text-3xl font-light tracking-wide">
                  DISCOVER THE MAGIC
                </h3>
                <p className="text-lg md:text-xl mt-4 max-w-2xl mx-auto">
                  تجربه‌ای فراموش‌نشدنی از شهر دو قاره
                </p>
=======
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                {t('slide2.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-6">
                {t('slide2.subtitle')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
                <span className="bg-white/20 px-4 py-2 rounded-full">{t('slide2.tags.daily')}</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{t('slide2.tags.nightly')}</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{t('slide2.tags.cruise')}</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{t('slide2.tags.private')}</span>
>>>>>>> Stashed changes
              </div>
            </div>
          </div>
        )

      case 2:
<<<<<<< Updated upstream
        // Third slide - Concert hall
        return (
          <>
            <img 
              src="/images/concert-hall.jpg" 
              alt="Concert Hall"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                  EVENTS
                </h1>
                <h3 className="text-2xl md:text-3xl font-light tracking-wide">
                  LIVE THE MOMENT
                </h3>
                <p className="text-lg md:text-xl mt-4 max-w-2xl mx-auto">
                  بهترین ایونت‌ها و کنسرت‌های دنیا
                </p>
=======
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                {t('slide3.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-6">
                {t('slide3.subtitle')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
                <span className="bg-white/20 px-4 py-2 rounded-full">{t('slide3.tags.concerts')}</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{t('slide3.tags.shows')}</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{t('slide3.tags.festivals')}</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{t('slide3.tags.special')}</span>
>>>>>>> Stashed changes
              </div>
            </div>
          </>
        )

      default:
        return null
    }
<<<<<<< Updated upstream
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-[90vh]">
          {/* Left Column - Main Hero Carousel */}
          <div className="xl:col-span-9 relative">
            {/* Main Hero Carousel */}
            <div className="relative h-[600px] lg:h-[750px] rounded-2xl overflow-hidden shadow-2xl">
              {/* Slide Background */}
              {currentSlide === 0 && (
                <img 
                  src="/images/hero-main.jpg" 
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Slide Content */}
              {renderSlideContent()}
=======
  }, [currentSlide, topText, middleText, bottomText, showCursor, t])

  return (
    <section className="relative h-screen overflow-hidden" role="banner" aria-label="Hero Section">
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <Image
            key={index}
            src={image.src}
            alt={image.alt}
            fill
            className={`object-cover transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
            priority={index === 0}
            sizes="100vw"
            quality={85}
          />
        ))}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
>>>>>>> Stashed changes

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <FaChevronRight className="w-5 h-5" />
              </button>

<<<<<<< Updated upstream
              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 rtl:space-x-reverse">
                {[...Array(totalSlides)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Side Blocks */}
          <div className="xl:col-span-3 space-y-6">
            {/* Transfer Block - Black Van */}
            <div className="relative h-[240px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer transform transition-all duration-300 hover:scale-105">
              <img 
                src="/images/black-van-top.jpg" 
                alt="Transfer Services"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Light sweep animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-sm font-light mb-1">خدمات</div>
                  <h5 className="text-lg font-bold mb-3">ترانسفر</h5>
                  <div className="text-xs opacity-90">
                    راحت و ایمن سفر کنید
                  </div>
                </div>
              </div>
            </div>

            {/* Event Block */}
            <div className="relative h-[240px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer transform transition-all duration-300 hover:scale-105">
              <img 
                src="/images/event-image.jpg" 
                alt="Events"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Light sweep animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-sm font-light mb-1">تجربه</div>
                  <h5 className="text-lg font-bold mb-3">ایونت ها</h5>
                  <div className="text-xs opacity-90">
                    لحظات فراموش نشدنی
                  </div>
                </div>
              </div>
            </div>

            {/* Tour Block */}
            <div className="relative h-[240px] rounded-2xl overflow-hidden shadow-xl group cursor-pointer transform transition-all duration-300 hover:scale-105">
              <img 
                src="/images/tour-image.jpg" 
                alt="Tours"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Light sweep animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-sm font-light mb-1">کشف</div>
                  <h5 className="text-lg font-bold mb-3">تورها</h5>
                  <div className="text-xs opacity-90">
                    دنیا را کشف کنید
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
=======
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <FaChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
>>>>>>> Stashed changes
      </div>
    </section>
  )
} 