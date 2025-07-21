'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCart } from '../../../../lib/hooks/useCart';
import { useAuth } from '../../../../lib/contexts/AuthContext';
import { PriceDisplay } from '../../../../components/ui/Price';
import { tokenService } from '../../../../lib/services/tokenService';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  CheckCircle, 
  XCircle,
  Info,
  AlertCircle,
  ShoppingCart,
  Heart,
  Share2,
  Camera,
  Utensils,
  Bus,
  User,
  Baby,
  Smile,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { OptimizedImage } from '../../../../components/ui/OptimizedImage';

interface TourVariant {
  id: string;
  name: string;
  description: string;
  base_price: number;
  capacity: number;
  is_active: boolean;
  includes_transfer: boolean;
  includes_guide: boolean;
  includes_meal: boolean;
  includes_photographer: boolean;
  extended_hours: number;
  private_transfer: boolean;
  expert_guide: boolean;
  special_meal: boolean;
  pricing: Array<{
    id: string;
    age_group: 'infant' | 'child' | 'adult';
    age_group_display: string;
    factor: number;
    is_free: boolean;
    requires_services: boolean;
  }>;
}

interface TourSchedule {
  id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_capacity: number;
  current_capacity: number;
  available_capacity: number;
  is_full: boolean;
  day_of_week: number;
  variant_capacities: Record<string, number>;
  cutoff_datetime: string;
}

interface TourItinerary {
  id: string;
  title: string;
  description: string;
  order: number;
  duration_minutes: number;
  location: string;
  image?: string;
}

interface TourOption {
  id: string;
  name: string;
  description: string;
  price: number;
  price_percentage: number;
  currency: string;
  option_type: 'service' | 'equipment' | 'food' | 'transport';
  is_available: boolean;
  max_quantity?: number;
}

interface TourReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified: boolean;
  is_helpful: number;
  created_at: string;
  user_name: string;
}

interface Tour {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  highlights: string;
  rules: string;
  required_items: string;
  image: string;
  gallery: string[];
  price: number;
  currency: string;
  duration_hours: number;
  max_participants: number;
  booking_cutoff_hours: number;
  cancellation_hours: number;
  refund_percentage: number;
  includes_transfer: boolean;
  includes_guide: boolean;
  includes_meal: boolean;
  includes_photographer: boolean;
  tour_type: 'day' | 'night';
  transport_type: 'boat' | 'land' | 'air';
  pickup_time: string;
  start_time: string;
  end_time: string;
  min_participants: number;
  category: {
    id: string;
    name: string;
    description: string;
  };
  variants: TourVariant[];
  schedules: TourSchedule[];
  itinerary: TourItinerary[];
  options: TourOption[];
  reviews: TourReview[];
  average_rating: number;
  review_count: number;
  is_available_today: boolean;
  is_active: boolean;
  pricing_summary: Record<string, {
    base_price: number;
    age_groups: Record<string, {
      factor: number;
      final_price: number;
      is_free: boolean;
    }>;
    options: Array<{
      name: string;
      price: number;
      price_percentage: number;
    }>;
  }>;
}

export default function TourDetailPage() {
  const t = useTranslations('TourDetail');
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const locale = params.locale as string;
  
  const { addItem, totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Booking state
  const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<TourVariant | null>(null);
  const [participants, setParticipants] = useState({
    adult: 1,
    child: 0,
    infant: 0
  });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [specialRequests, setSpecialRequests] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'reviews' | 'pricing'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Fetch tour data
  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8000/api/v1/tours/${slug}/`);
        if (response.ok) {
          const data = await response.json();
          setTour(data);
          
          // Set default variant if available
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        } else {
          setError('Tour not found');
        }
      } catch (error) {
        console.error('Error fetching tour:', error);
        setError('Failed to load tour');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchTour();
    }
  }, [slug]);

  // Calculate pricing using new structure
  const calculatePricing = () => {
    if (!tour || !selectedVariant || !selectedSchedule) return null;

    // Check if tour has valid pricing data
    if (!tour.pricing_summary || !tour.pricing_summary[selectedVariant.id]) {
      return {
        total: 0,
        breakdown: { adult: 0, child: 0, infant: 0, options: 0 },
        hasPricingError: true,
        pricingError: 'قیمت این تور به دلیل نقص اطلاعات قابل محاسبه نیست.'
      };
    }

    const variantPricing = tour.pricing_summary[selectedVariant.id];
    let total = 0;
    const breakdown = {
      adult: 0,
      child: 0,
      infant: 0,
      options: 0
    };

    // Calculate participant costs using new pricing structure
    Object.entries(participants).forEach(([type, count]) => {
      const ageGroupPricing = variantPricing.age_groups[type];
      if (ageGroupPricing) {
        // Ensure infant pricing is always 0
        let price = ageGroupPricing.final_price;
        if (type === 'infant' || ageGroupPricing.is_free) {
          price = 0;
        }
        const cost = price * count;
        breakdown[type as keyof typeof breakdown] = cost;
        total += cost;
      }
    });

    // Calculate options cost
    Object.entries(selectedOptions).forEach(([optionId, quantity]) => {
      const option = tour.options.find(o => o.id === optionId);
      if (option) {
        const cost = option.price * quantity;
        breakdown.options += cost;
        total += cost;
      }
    });

    return { total, breakdown, hasPricingError: false };
  };

  // Check if tour is bookable
  const isTourBookable = () => {
    if (!tour) return false;
    
    // Check if tour has active schedules
    const hasActiveSchedules = tour.schedules && tour.schedules.some(s => s.is_available);
    if (!hasActiveSchedules) return false;
    
    // Check if tour has active variants
    const hasActiveVariants = tour.variants && tour.variants.some(v => v.is_active);
    if (!hasActiveVariants) return false;
    
    // Check if tour has valid pricing
    const hasValidPricing = tour.pricing_summary && Object.keys(tour.pricing_summary).length > 0;
    if (!hasValidPricing) return false;
    
    return true;
  };

  // Get booking error message
  const getBookingErrorMessage = () => {
    if (!tour) return 'تور یافت نشد.';
    
    if (!tour.schedules || tour.schedules.length === 0) {
      return 'این تور در حال حاضر قابل رزرو نیست. دلیل: عدم وجود تاریخ‌های فعال';
    }
    
    if (!tour.variants || tour.variants.length === 0) {
      return 'این تور در حال حاضر قابل رزرو نیست. دلیل: عدم وجود پکیج‌های قابل انتخاب';
    }
    
    if (!tour.pricing_summary || Object.keys(tour.pricing_summary).length === 0) {
      return 'این تور در حال حاضر قابل رزرو نیست. دلیل: نقص اطلاعات قیمت‌گذاری';
    }
    
    return null;
  };

  const pricing = calculatePricing();
  const isBookable = isTourBookable();
  const bookingError = getBookingErrorMessage();

  // Handle booking
  const handleBooking = async () => {
    if (!tour || !selectedVariant || !selectedSchedule || !isBookable) return;

    setIsBooking(true);
    setBookingMessage(null);

    try {
      // Calculate pricing
      const pricing = calculatePricing();
      if (!pricing || pricing.hasPricingError) {
        setBookingMessage(pricing?.pricingError || 'خطا در محاسبه قیمت');
        return;
      }

      // Prepare data for backend API
      const cartData = {
        product_type: 'tour',
        product_id: tour.id,
        variant_id: selectedVariant.id,
        quantity: participants.adult + participants.child + participants.infant,
        selected_options: Object.entries(selectedOptions).map(([optionId, quantity]) => {
          const option = tour.options.find(o => o.id === optionId);
          return {
            option_id: optionId,
            quantity,
            price: option ? option.price : 0
          };
        }).filter(option => option.quantity > 0), // Only include options with quantity > 0
        booking_data: {
          schedule_id: selectedSchedule.id,
          participants: {
            adult: participants.adult,
            child: participants.child,
            infant: participants.infant
          },
          special_requests: specialRequests
        }
      };

      // Add to backend cart first
      const token = tokenService.getAccessToken();
      if (!token) {
        setBookingMessage('لطفاً ابتدا وارد حساب کاربری خود شوید');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/cart/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cartData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setBookingMessage(errorData.message || 'خطا در افزودن به سبد خرید');
        return;
      }

      const result = await response.json();
      
      // Create cart item with real backend ID
      const cartItem = {
        product_type: 'tour' as const,
        product_id: tour.id,
        product_title: `${tour.title} - ${selectedSchedule.start_date}`,
        variant_id: selectedVariant.id,
        variant_name: selectedVariant.name,
        quantity: 1,
        unit_price: pricing.total - pricing.breakdown.options,
        total_price: pricing.total,
        options_total: pricing.breakdown.options,
        currency: tour.currency,
        booking_date: selectedSchedule.start_date,
        booking_time: selectedSchedule.start_time,
        selected_options: Object.entries(selectedOptions).map(([optionId, quantity]) => ({
          option_id: optionId,
          quantity
        })),
        booking_data: {
          participants,
          special_requests: specialRequests,
          schedule_id: selectedSchedule.id
        },
        // Display fields
        title: `${tour.title} - ${selectedSchedule.start_date}`,
        image: tour.image,
        duration: `${tour.duration_hours} hours`,
        location: tour.category.name
      };

      // Add to local cart with real ID
      addItem(cartItem);

      setBookingMessage('تور با موفقیت به سبد خرید اضافه شد!');
      setTimeout(() => {
        router.push(`/${locale}/cart`);
      }, 1500);
      
    } catch (error) {
      console.error('Booking error:', error);
      setBookingMessage('خطا در افزودن به سبد خرید');
    } finally {
      setIsBooking(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('tourNotFound')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">{error || t('tourNotFoundMessage')}</p>
            <div className="space-x-4">
              <Link
                href={`/${locale}/tours`}
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('backToTours')}
              </Link>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{tour.title}</h1>
                          <div className="flex items-center justify-center space-x-4 text-lg">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                <span>{tour.average_rating?.toFixed(1) || 'N/A'} ({tour.review_count || 0} {t('reviews')})</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>{tour.duration_hours} {t('hours')}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{t('max')} {tour.max_participants} {t('people')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: t('overview'), icon: Info },
                    { id: 'itinerary', label: t('itinerary'), icon: MapPin },
                    { id: 'reviews', label: t('reviews'), icon: Star },
                    { id: 'pricing', label: t('pricing'), icon: ShoppingCart }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Tour Info */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('information')}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-600 dark:text-gray-300">{t('type')}: {tour.tour_type === 'day' ? t('dayTour') : t('nightTour')}</span>
                        </div>
                        <div className="flex items-center">
                          <Bus className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-600 dark:text-gray-300">{t('transport')}: {tour.transport_type === 'boat' ? t('boat') : tour.transport_type === 'air' ? t('air') : t('land')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-600 dark:text-gray-300">{t('duration')}: {tour.duration_hours} {t('hours')}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-600 dark:text-gray-300">{t('capacity')}: {tour.min_participants}-{tour.max_participants} {t('people')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('description')}</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{tour.description}</p>
                    </div>

                    {/* Highlights */}
                    {tour.highlights && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('highlights')}</h3>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <p className="text-blue-800 dark:text-blue-200">{tour.highlights}</p>
                        </div>
                      </div>
                    )}

                    {/* Included Services */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('includedServices')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tour.includes_transfer && (
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span>{t('transferService')}</span>
                          </div>
                        )}
                        {tour.includes_guide && (
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span>{t('professionalGuide')}</span>
                          </div>
                        )}
                        {tour.includes_meal && (
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span>{t('mealIncluded')}</span>
                          </div>
                        )}
                        {tour.includes_photographer && (
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span>{t('photographer')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rules and Required Items */}
                    {tour.rules && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('rulesAndRegulations')}</h3>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                          <p className="text-yellow-800 dark:text-yellow-200">{tour.rules}</p>
                        </div>
                      </div>
                    )}

                    {tour.required_items && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t('requiredItems')}</h3>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300">{tour.required_items}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Itinerary Tab */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('tourItinerary')}</h2>
                    {tour.itinerary && tour.itinerary.length > 0 ? (
                      tour.itinerary.map((item, index) => (
                        <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                  {index + 1}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{item.location}</span>
                                <span className="mx-2">•</span>
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{item.duration_minutes} {t('minutes')}</span>
                              </div>
                            </div>
                            {item.image && (
                              <OptimizedImage 
                                src={item.image} 
                                alt={item.title}
                                width={80}
                                height={80}
                                className="w-20 h-20 object-cover rounded-lg ml-4"
                              />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">{t('noItineraryAvailable')}</p>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reviewsAndRatings')}</h2>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 mr-1" />
                        <span className="font-semibold">{tour.average_rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">({tour.review_count || 0} {t('reviews')})</span>
                      </div>
                    </div>
                    
                    {tour.reviews && tour.reviews.length > 0 ? (
                      tour.reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{review.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{review.user_name}</p>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            {review.is_verified && (
                              <>
                                <span className="mx-2">•</span>
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                <span>{t('verified')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">{t('noReviewsAvailable')}</p>
                    )}
                  </div>
                )}

                {/* Pricing Tab */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pricing')} {t('information')}</h2>
                    
                    {/* Variants */}
                    {tour.variants && tour.variants.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('tourVariants')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tour.variants.map((variant) => (
                            <div 
                              key={variant.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedVariant?.id === variant.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600'
                              }`}
                              onClick={() => setSelectedVariant(variant)}
                            >
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{variant.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{variant.description}</p>
                              
                              {/* Services included */}
                              <div className="space-y-1 mb-3">
                                {variant.includes_transfer && (
                                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {t('transfer')}
                                  </div>
                                )}
                                {variant.includes_guide && (
                                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {t('guide')}
                                  </div>
                                )}
                                {variant.includes_meal && (
                                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {t('meal')}
                                  </div>
                                )}
                                {variant.includes_photographer && (
                                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {t('photographer')}
                                  </div>
                                )}
                              </div>

                              {/* Pricing */}
                              <div className="space-y-1">
                                {variant.pricing.map((price) => (
                                  <div key={price.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">{price.age_group_display}:</span>
                                    <span className="font-semibold">
                                      {price.is_free && !price.requires_services ? t('free') : `$${price.factor}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cancellation Policy */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('cancellationPolicy')}</h3>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                          <div>
                            <p className="text-red-800 dark:text-red-200 font-medium mb-1">{t('cancellationPolicyText')}</p>
                            <p className="text-red-700 text-sm">
                              {tour.cancellation_hours} {t('hoursBeforeTour')}: {tour.refund_percentage}% {t('refund')}
                            </p>
                            <p className="text-red-700 text-sm">
                              {t('lessThan')} {tour.cancellation_hours} {t('hours')}: {t('noRefund')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('bookThisTour')}</h2>

              {/* Booking Error Message */}
              {bookingError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <strong>⚠️ {t('bookingNotAvailable')}</strong>
                      <p className="mt-1">{bookingError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('selectDate')}</h3>
                {tour.schedules && tour.schedules.length > 0 ? (
                  <div className="space-y-2">
                    {tour.schedules
                      .filter(schedule => schedule.is_available && !schedule.is_full)
                      .map((schedule) => (
                        <button
                          key={schedule.id}
                          onClick={() => setSelectedSchedule(schedule)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedSchedule?.id === schedule.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(schedule.start_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t('availableSpots')}: {schedule.available_capacity} {t('spots')}
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noAvailableDates')}</p>
                )}
              </div>

              {/* Variant Selection */}
              {selectedSchedule && tour.variants && tour.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('selectPackage')}</h3>
                  <div className="space-y-2">
                    {tour.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{variant.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{variant.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Participant Selection */}
              {selectedVariant && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('participants')}</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'adult', label: t('adults'), icon: User },
                      { key: 'child', label: t('children'), icon: Smile },
                      { key: 'infant', label: t('infants'), icon: Baby }
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setParticipants(prev => ({
                              ...prev,
                              [key]: Math.max(0, prev[key as keyof typeof prev] - 1)
                            }))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 dark:bg-gray-900"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{participants[key as keyof typeof participants]}</span>
                          <button
                            onClick={() => setParticipants(prev => ({
                              ...prev,
                              [key]: prev[key as keyof typeof prev] + 1
                            }))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 dark:bg-gray-900"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Options Selection */}
              {tour.options && tour.options.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('additionalOptions')}</h3>
                  <div className="space-y-2">
                    {tour.options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{option.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            <PriceDisplay 
                              amount={option.price} 
                              currency={option.currency || tour.currency} 
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedOptions(prev => ({
                              ...prev,
                              [option.id]: Math.max(0, (prev[option.id] || 0) - 1)
                            }))}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 dark:bg-gray-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm">{selectedOptions[option.id] || 0}</span>
                          <button
                            onClick={() => setSelectedOptions(prev => ({
                              ...prev,
                              [option.id]: (prev[option.id] || 0) + 1
                            }))}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 dark:bg-gray-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('specialRequests')}</h3>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={t('specialRequestsPlaceholder')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              {/* Pricing Summary */}
              {pricing && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('priceSummary')}</h3>
                  
                  {/* Pricing Error */}
                  {pricing.hasPricingError && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-200">{pricing.pricingError}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {participants.adult > 0 && (
                      <div className="flex justify-between">
                        <span>{t('adults')} ({participants.adult})</span>
                        <span>
                          {pricing.hasPricingError ? 'N/A' : (
                            <PriceDisplay 
                              amount={pricing.breakdown.adult} 
                              currency={tour.currency} 
                            />
                          )}
                        </span>
                      </div>
                    )}
                    {participants.child > 0 && (
                      <div className="flex justify-between">
                        <span>{t('children')} ({participants.child})</span>
                        <span>
                          {pricing.hasPricingError ? 'N/A' : (
                            <PriceDisplay 
                              amount={pricing.breakdown.child} 
                              currency={tour.currency} 
                            />
                          )}
                        </span>
                      </div>
                    )}
                    {participants.infant > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center">
                          {t('infants')} ({participants.infant})
                          <span className="ml-2 text-xs bg-green-100 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                            {t('free')}
                          </span>
                        </span>
                        <span className="text-green-600 font-medium">
                          {t('free')}
                        </span>
                      </div>
                    )}
                    {pricing.breakdown.options > 0 && (
                      <div className="flex justify-between">
                        <span>{t('options')}</span>
                        <span>
                          <PriceDisplay 
                            amount={pricing.breakdown.options} 
                            currency={tour.currency} 
                          />
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>{t('total')}</span>
                      <span>
                        {pricing.hasPricingError ? 'N/A' : (
                          <PriceDisplay 
                            amount={pricing.total} 
                            currency={tour.currency} 
                          />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!isBookable || !selectedSchedule || !selectedVariant || isBooking || (participants.adult + participants.child + participants.infant) === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isBooking ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('booking')}
                  </span>
                ) : !isBookable ? (
                  t('notAvailable')
                ) : (
                  t('addToCart')
                )}
              </button>

              {/* Booking Message */}
              {bookingMessage && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  bookingMessage.includes('successfully')
                    ? 'bg-green-100 text-green-800 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:text-red-200'
                }`}>
                  {bookingMessage}
                </div>
              )}

              {/* Guest Info */}
              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>{t('guestUser')}:</strong> {t('guestUserMessage')} 
                    <Link href={`/${locale}/login`} className="text-blue-600 hover:underline ml-1">
                      {t('loginToSync')}
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 