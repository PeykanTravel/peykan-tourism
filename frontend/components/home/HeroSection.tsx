'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { FaPlay, FaPlane, FaChevronLeft, FaChevronRight, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export default function HeroSection() {
  const t = useTranslations('home')
  const [searchForm, setSearchForm] = useState({
    destination: '',
    date: '',
    price: '$1,000 - $2,000'
  })

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

  // Auto-slide carousel
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides)
    }, 12000) // Change slide every 12 seconds

    return () => clearInterval(slideInterval)
  }, [])

  // Text animation for first slide
  useEffect(() => {
    if (currentSlide !== 0) return // Only animate on first slide

    let timeout: NodeJS.Timeout

    const runAnimation = () => {
      switch (animationPhase) {
        case 'initial':
          // Show initial text for 2 seconds
          timeout = setTimeout(() => {
            setAnimationPhase('waiting')
          }, 2000)
          break

        case 'waiting':
          // Wait 1 second before starting to delete
          timeout = setTimeout(() => {
            setAnimationPhase('deleting')
          }, 1000)
          break

        case 'deleting':
          // Delete bottom text first
          if (bottomText.length > 0) {
            timeout = setTimeout(() => {
              setBottomText(prev => prev.slice(0, -1))
            }, 100)
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
            setAnimationPhase('typing')
          }
          break

        case 'typing':
          // Type the new text in top position
          if (topText.length < newText.length) {
            timeout = setTimeout(() => {
              setTopText(prev => newText.slice(0, prev.length + 1))
            }, 150)
          } else {
            // Animation complete, restart after 5 seconds
            timeout = setTimeout(() => {
              setAnimationPhase('resetting')
            }, 5000)
          }
          break

        case 'resetting':
          // Reset to initial state
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSearchForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchForm)
  }

  const nextSlide = () => {
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
        // First slide - Animated text with enhanced design
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6 relative z-10">
              {/* Animated background elements */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-primary-500/20 rounded-full animate-float"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-secondary-500/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-500/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
              </div>
              
              {/* Top text line */}
              {topText && (
                <h3 className="text-2xl md:text-3xl font-light mb-2 tracking-wide min-h-[2rem] animate-slide-up">
                  {topText}
                </h3>
              )}
              
              {/* Middle text line */}
              {middleText && (
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight min-h-[4rem] animate-bounce-in">
                  {middleText}
                </h1>
              )}
              
              {/* Bottom text line */}
              {bottomText && (
                <h3 className="text-2xl md:text-3xl font-light mb-2 tracking-wide min-h-[2rem] animate-slide-up">
                  {bottomText}
                </h3>
              )}
              
              {/* PEYKAN with cursor */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <span 
                  className={`text-5xl md:text-7xl font-bold text-yellow-400 ${
                    showCursor ? 'opacity-100' : 'opacity-0'
                  } transition-opacity duration-100`}
                >
                  |
                </span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-glow">
                  PEYKAN
                </h1>
              </div>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-200 mt-6 max-w-2xl mx-auto animate-fade-in">
                Discover the world with our premium travel experiences
              </p>
            </div>
          </div>
        )

      case 1:
        // Second slide - Istanbul video with overlay
        return (
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            >
              <source src="/videos/istanbul.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight animate-bounce-in">
                  EXPLORE ISTANBUL
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up">
                  Where East meets West in perfect harmony
                </p>
                <Button 
                  variant="glass" 
                  size="lg"
                  leftIcon={<FaPlay />}
                  className="animate-float"
                >
                  Watch Video
                </Button>
              </div>
            </div>
          </div>
        )

      case 2:
        // Third slide - Adventure theme
        return (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-primary-900 via-secondary-900 to-accent-900"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight animate-bounce-in">
                  ADVENTURE AWAITS
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up">
                  Create memories that last a lifetime
                </p>
                <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
                  <Button variant="glass" size="lg" leftIcon={<FaPlane />}>
                    Start Journey
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      <div className="relative w-full h-full">
        {renderSlideContent()}
      </div>

      {/* Search Form - Enhanced Design */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-20">
        <Card variant="glass" padding="lg" className="backdrop-blur-xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="destination"
                value={searchForm.destination}
                onChange={handleInputChange}
                placeholder="Where to?"
                className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="date"
                value={searchForm.date}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div className="relative">
              <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="price"
                value={searchForm.price}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
              >
                <option value="$1,000 - $2,000">$1,000 - $2,000</option>
                <option value="$2,000 - $5,000">$2,000 - $5,000</option>
                <option value="$5,000+">$5,000+</option>
              </select>
            </div>
            
            <Button 
              type="submit" 
              variant="gradient" 
              size="lg"
              leftIcon={<FaSearch />}
              className="w-full"
            >
              Search
            </Button>
          </form>
        </Card>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-30"
      >
        <FaChevronLeft />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-30"
      >
        <FaChevronRight />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {Array.from({ length: totalSlides }, (_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  )
} 