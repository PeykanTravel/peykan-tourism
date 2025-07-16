'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
<<<<<<< Updated upstream
import { useCart, TourCartItem } from '../../../../lib/hooks/useCart';
import { useAuth } from '../../../../lib/contexts/AuthContext';
import { tokenService } from '../../../../lib/services/tokenService';
=======
import { useCart } from '../../../../lib/contexts/UnifiedCartContext';
import { useAuth } from '../../../../lib/contexts/AuthContext';
import { API_CONFIG } from '../../../../lib/config/api';
import { apiClient } from '../../../../lib/api/client';
>>>>>>> Stashed changes
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
  Minus,
  ArrowLeft,
  Globe,
  DollarSign,
  Timer,
  Award,
  Shield,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
  city: string;
  country: string;
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
  const [showGallery, setShowGallery] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'reviews' | 'pricing'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Fetch tour data
  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
<<<<<<< Updated upstream
        const response = await fetch(`http://localhost:8000/api/v1/tours/${slug}/`);
        if (response.ok) {
          const data = await response.json();
          setTour(data);
=======
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.TOURS.DETAIL(slug));
        const data = response.data;
        setTour(data);
>>>>>>> Stashed changes
          
        // Set default variant if available
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
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
    
    if (!tour.is_active) return 'این تور فعال نیست.';
    
    if (!tour.schedules || tour.schedules.length === 0) {
      return 'برای این تور برنامه‌ای تعریف نشده است.';
    }
    
    const hasActiveSchedules = tour.schedules.some(s => s.is_available);
    if (!hasActiveSchedules) {
      return 'در حال حاضر تاریخ موجود برای این تور وجود ندارد.';
    }
    
    if (!tour.variants || tour.variants.length === 0) {
      return 'برای این تور نوع یا بسته‌ای تعریف نشده است.';
    }
    
    const hasActiveVariants = tour.variants.some(v => v.is_active);
    if (!hasActiveVariants) {
      return 'تمام انواع این تور غیرفعال هستند.';
    }
    
    if (!tour.pricing_summary || Object.keys(tour.pricing_summary).length === 0) {
      return 'قیمت‌گذاری این تور کامل نیست.';
    }
    
    return null;
  };

  // Handle booking
  const handleBooking = async () => {
    if (!tour || !selectedSchedule || !selectedVariant) return;

    const totalParticipants = participants.adult + participants.child + participants.infant;
    if (totalParticipants === 0) {
      setBookingMessage('لطفاً حداقل یک نفر انتخاب کنید.');
      return;
    }

    const pricing = calculatePricing();
    if (!pricing || pricing.hasPricingError) {
      setBookingMessage('خطا در محاسبه قیمت.');
      return;
    }

    try {
      setIsBooking(true);
      setBookingMessage(null);

             // Create cart item
       const cartItem = {
         id: `${tour.id}-${selectedVariant.id}-${selectedSchedule.id}`,
         product_type: 'tour' as const,
         product_id: tour.id,
         variant_id: selectedVariant.id,
         schedule_id: selectedSchedule.id,
         title: tour.title,
         variant_name: selectedVariant.name,
         schedule_date: selectedSchedule.start_date,
         schedule_time: `${selectedSchedule.start_time} - ${selectedSchedule.end_time}`,
         booking_date: selectedSchedule.start_date,
         booking_time: selectedSchedule.start_time,
         participants,
         selected_options: Object.entries(selectedOptions).map(([optionId, quantity]) => {
           const option = tour.options.find(o => o.id === optionId);
           return {
             option_id: optionId,
             quantity,
             price: option ? option.price : 0
           };
         }).filter(option => option.quantity > 0),
         special_requests: specialRequests,
         quantity: participants.adult + participants.child + participants.infant,
         unit_price: selectedVariant.base_price,
         total_price: pricing.total,
         options_total: pricing.breakdown.options,
         currency: tour.currency,
         image: tour.image,
         duration: `${tour.duration_hours} hours`,
         location: `${tour.city}, ${tour.country}`,
         booking_data: {
           schedule_id: selectedSchedule.id,
           participants,
           special_requests: specialRequests
         }
       };

      await addItem(cartItem);
      setBookingMessage('تور با موفقیت به سبد خرید اضافه شد!');
      
      // Reset form
      setParticipants({ adult: 1, child: 0, infant: 0 });
      setSelectedOptions({});
      setSpecialRequests('');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setBookingMessage('خطا در افزودن به سبد خرید.');
    } finally {
      setIsBooking(false);
    }
  };

  const pricing = calculatePricing();
  const isBookable = isTourBookable();
  const bookingError = getBookingErrorMessage();

<<<<<<< Updated upstream
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
      const cartItem: TourCartItem = {
        id: result.cart_item.id, // Use real UUID from backend
        type: 'tour',
        title: `${tour.title} - ${selectedSchedule.start_date}`,
        price: pricing.total,
        currency: tour.currency,
        image: tour.image,
        duration: `${tour.duration_hours} hours`,
        location: tour.category.name,
        
        // Tour-specific fields
        tour_id: tour.id,
        schedule_id: selectedSchedule.id,
        variant_id: selectedVariant.id,
        participants,
        selected_options: Object.entries(selectedOptions).map(([optionId, quantity]) => ({
          option_id: optionId,
          quantity
        })),
        special_requests: specialRequests,
        
        // Calculated fields
        total_participants: participants.adult + participants.child + participants.infant,
        unit_price: pricing.total - pricing.breakdown.options,
        options_total: pricing.breakdown.options,
        subtotal: pricing.total
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

=======
>>>>>>> Stashed changes
  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('error')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Tour not found'}
          </p>
          <Link 
            href={`/${locale}/tours`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToTours')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/${locale}/tours`}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('backToTours')}
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tour.category?.name} • {tour.city}, {tour.country}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tour Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              {/* Tour Image */}
              <div className="relative h-64 md:h-80">
                {tour.image ? (
                  <Image 
                    src={tour.image} 
                    alt={tour.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                
                {/* Gallery Button */}
                {tour.gallery && tour.gallery.length > 0 && (
                  <button
                    onClick={() => setShowGallery(true)}
                    className="absolute bottom-4 right-4 bg-black/50 text-white px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    <Camera className="w-4 h-4 mr-2 inline" />
                    {tour.gallery.length} {t('photos')}
                  </button>
                )}
              </div>

              {/* Tour Info */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {tour.title}
                </h1>
                
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    {tour.duration_hours} {t('hours')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    {tour.max_participants} {t('people')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    {tour.city}, {tour.country}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    {tour.average_rating || 'N/A'} ({tour.review_count || 0})
                  </div>
                </div>

                {/* Description */}
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {tour.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {[
                    { id: 'overview', label: t('overview') },
                    { id: 'itinerary', label: t('itinerary') },
                    { id: 'reviews', label: t('reviews') },
                    { id: 'pricing', label: t('pricing') }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Highlights */}
                    {tour.highlights && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          {t('highlights')}
                        </h3>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-gray-700 dark:text-gray-300">{tour.highlights}</p>
                        </div>
                      </div>
                    )}

                    {/* Included Services */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {t('includedServices')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tour.includes_transfer && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5 mr-3" />
                            <span>{t('transferService')}</span>
                          </div>
                        )}
                        {tour.includes_guide && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5 mr-3" />
                            <span>{t('professionalGuide')}</span>
                          </div>
                        )}
                        {tour.includes_meal && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5 mr-3" />
                            <span>{t('mealIncluded')}</span>
                          </div>
                        )}
                        {tour.includes_photographer && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5 mr-3" />
                            <span>Professional Photography</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rules */}
                    {tour.rules && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          {t('rules')}
                        </h3>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-gray-700 dark:text-gray-300">{tour.rules}</p>
                        </div>
                      </div>
                    )}

                    {/* Required Items */}
                    {tour.required_items && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          {t('requiredItems')}
                        </h3>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-gray-700 dark:text-gray-300">{tour.required_items}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    {tour.itinerary && tour.itinerary.length > 0 ? (
                      tour.itinerary.map((item, index) => (
                        <div key={item.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.duration_minutes} {t('minutes')}
                              <MapPin className="w-3 h-3 ml-4 mr-1" />
                              {item.location}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Info className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t('noItineraryAvailable')}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {tour.reviews && tour.reviews.length > 0 ? (
                      tour.reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {review.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {review.user_name}
                                </p>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            {review.is_verified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {t('verified')}
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {review.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {review.comment}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Star className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t('noReviewsAvailable')}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-4">
                    {tour.variants && tour.variants.length > 0 ? (
                      tour.variants.map((variant) => (
                        <div key={variant.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {variant.name}
                            </h4>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              ${variant.base_price}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {variant.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {variant.pricing.map((price) => (
                              <div key={price.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {price.age_group_display}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {price.is_free ? t('free') : `$${(variant.base_price * price.factor).toFixed(2)}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No pricing information available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('bookThisTour')}
              </h2>

              {/* Booking Error Message */}
              {bookingError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <strong>{t('bookingNotAvailable')}</strong>
                      <p className="mt-1">{bookingError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('selectDate')}
                </h3>
                {tour.schedules && tour.schedules.length > 0 ? (
                  <div className="space-y-2">
                    {tour.schedules
                      .filter(schedule => schedule.is_available && !schedule.is_full)
                      .map((schedule) => (
                        <button
                          key={schedule.id}
                          onClick={() => setSelectedSchedule(schedule)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedSchedule?.id === schedule.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(schedule.start_date).toLocaleDateString(locale, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('availableSpots')}: {schedule.available_capacity} {t('spots')}
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noAvailableDates')}</p>
                  </div>
                )}
              </div>

              {/* Variant Selection */}
              {selectedSchedule && tour.variants && tour.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('selectPackage')}
                  </h3>
                  <div className="space-y-2">
                    {tour.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedVariant?.id === variant.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {variant.name}
                          </div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${variant.base_price}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {variant.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Participant Selection */}
              {selectedVariant && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('participants')}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'adult', label: t('adults'), icon: User, desc: '(11+)' },
                      { key: 'child', label: t('children'), icon: Smile, desc: '(2-10)' },
                      { key: 'infant', label: t('infants'), icon: Baby, desc: '(0-2)' }
                    ].map(({ key, label, icon: Icon, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {label}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {desc}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setParticipants(prev => ({
                              ...prev,
                              [key]: Math.max(0, prev[key as keyof typeof prev] - 1)
                            }))}
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            disabled={participants[key as keyof typeof participants] === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                            {participants[key as keyof typeof participants]}
                          </span>
                          <button
                            onClick={() => setParticipants(prev => ({
                              ...prev,
                              [key]: prev[key as keyof typeof prev] + 1
                            }))}
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('additionalOptions')}
                  </h3>
                  <div className="space-y-3">
                    {tour.options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {option.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {option.description}
                          </div>
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            ${option.price}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedOptions(prev => ({
                              ...prev,
                              [option.id]: Math.max(0, (prev[option.id] || 0) - 1)
                            }))}
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            disabled={!selectedOptions[option.id]}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                            {selectedOptions[option.id] || 0}
                          </span>
                          <button
                            onClick={() => setSelectedOptions(prev => ({
                              ...prev,
                              [option.id]: (prev[option.id] || 0) + 1
                            }))}
                            className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('specialRequests')}
                </h3>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={t('specialRequestsPlaceholder')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Pricing Summary */}
              {pricing && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('priceSummary')}
                  </h3>
                  
                  {/* Pricing Error */}
                  {pricing.hasPricingError && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-200">
                          {pricing.pricingError}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="space-y-2 text-sm">
                      {participants.adult > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t('adults')} ({participants.adult})
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {pricing.hasPricingError ? 'N/A' : `$${pricing.breakdown.adult.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                      {participants.child > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t('children')} ({participants.child})
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {pricing.hasPricingError ? 'N/A' : `$${pricing.breakdown.child.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                      {participants.infant > 0 && (
                        <div className="flex justify-between">
                          <span className="flex items-center text-gray-600 dark:text-gray-400">
                            {t('infants')} ({participants.infant})
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                              {t('free')}
                            </span>
                          </span>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {t('free')}
                          </span>
                        </div>
                      )}
                      {pricing.breakdown.options > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('options')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${pricing.breakdown.options.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {t('total')}
                          </span>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {pricing.hasPricingError ? 'N/A' : `$${pricing.total.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!isBookable || !selectedSchedule || !selectedVariant || isBooking || (participants.adult + participants.child + participants.infant) === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg"
              >
                {isBooking ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('booking')}
                  </span>
                ) : !isBookable ? (
                  t('notAvailable')
                ) : (
                  <span className="flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {t('addToCart')}
                  </span>
                )}
              </button>

              {/* Booking Message */}
              {bookingMessage && (
                <div className={`mt-4 p-3 rounded-xl text-sm ${
                  bookingMessage.includes('موفقیت')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                }`}>
                {bookingMessage}
              </div>
              )}

              {/* Guest Info */}
              {!isAuthenticated && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>{t('guestUser')}:</strong> {t('guestUserMessage')} 
                    <Link href={`/${locale}/login`} className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
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