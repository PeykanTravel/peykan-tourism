'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Heart, 
  Share2,
  ChevronRight,
  Info,
  Shield,
  CreditCard,
  Ticket,
  CheckCircle,
  Plus,
  Minus,
  Settings,
  Eye,
  EyeOff,
  Music,
  Video,
  Camera,
  Wifi,
  Car,
  Coffee
} from 'lucide-react';
import { useEventsService } from '@/lib/application/hooks/useEventsService';
import { useCart } from '@/lib/hooks/useCart';
import { Event, EventPricingBreakdown, EventPerformance, EventSection, TicketType } from '@/lib/types/api';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from '@/lib/currency-context';
import PerformanceSelector from '@/components/events/PerformanceSelector';
import SeatMap from '@/components/events/SeatMap';
import PricingBreakdown from '@/components/events/PricingBreakdown';

interface Seat {
  id: string;
  seat_number: string;
  row_number: string;
  section: string;
  price: number;
  currency: string;
  is_wheelchair_accessible: boolean;
  is_premium: boolean;
  status: 'available' | 'selected' | 'reserved' | 'sold' | 'blocked';
  ticket_type?: string | { id: string; name: string };
}

interface BookingStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = params.locale as string;
  const { refreshCart } = useCart();
  const t = useTranslations('eventDetail');
  const router = useRouter();
  const { formatPrice, convertCurrency, currency: userCurrency } = useCurrency();
  
  // Use the new events service
  const { 
    getEventBySlug, 
    calculateEventPricing, 
    addEventToCart,
    isLoading: eventsLoading,
    error: eventsError 
  } = useEventsService();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Booking state
  const [selectedPerformance, setSelectedPerformance] = useState<EventPerformance | null>(null);
  const [selectedSection, setSelectedSection] = useState<EventSection | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [pricingBreakdown, setPricingBreakdown] = useState<EventPricingBreakdown | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [showPricingDetails, setShowPricingDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking steps
  const [bookingSteps, setBookingSteps] = useState<BookingStep[]>([
    {
      id: 1,
      title: t('selectPerformance'),
      description: t('chooseDateTime'),
      isComplete: false,
      isActive: true
    },
    {
      id: 2,
      title: t('selectSeats'),
      description: t('chooseSectionAndSeats'),
      isComplete: false,
      isActive: false
    },
    {
      id: 3,
      title: t('addOptions'),
      description: t('selectAdditionalOptions'),
      isComplete: false,
      isActive: false
    },
    {
      id: 4,
      title: t('review'),
      description: t('reviewAndConfirm'),
      isComplete: false,
      isActive: false
    }
  ]);
  
  // Fetch event data using the new service
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const eventData = await getEventBySlug(slug);
        setEvent(eventData);
        setError(null);
      } catch (err) {
        setError(t('failedToLoadEvent'));
        console.error('Failed to load event:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug, t, getEventBySlug]);

  // Update booking steps based on selections
  useEffect(() => {
    setBookingSteps(prev => prev.map(step => ({
      ...step,
      isComplete: step.id === 1 ? !!selectedPerformance : 
                  step.id === 2 ? !!selectedSection && selectedSeats.length > 0 :
                  step.id === 3 ? true : // Options are optional
                  step.id === 4 ? !!pricingBreakdown : false,
      isActive: step.id === 1 ? true :
                step.id === 2 ? !!selectedPerformance :
                step.id === 3 ? !!selectedSection && selectedSeats.length > 0 :
                step.id === 4 ? !!selectedSection && selectedSeats.length > 0 : false
    })));
  }, [selectedPerformance, selectedSection, selectedSeats, pricingBreakdown]);

  // Format functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle performance selection
  const handlePerformanceSelect = (performance: EventPerformance) => {
    setSelectedPerformance(performance);
    setSelectedSection(null);
    setSelectedSeats([]);
    setSelectedTicketType(null);
    setCurrentStep(2);
  };

  // Handle section selection
  const handleSectionSelect = (section: EventSection) => {
    setSelectedSection(section);
    setSelectedSeats([]);
    setSelectedTicketType(null);
  };

  // Handle seat selection
  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'available') {
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleSeatDeselect = (seat: Seat) => {
    setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
  };

  // Handle ticket type selection
  const handleTicketTypeSelect = (ticketType: TicketType) => {
    setSelectedTicketType(ticketType);
  };

  // Handle option selection
  const handleOptionSelect = (option: any, quantity: number) => {
    setSelectedOptions(prev => {
      const existing = prev.find(o => o.id === option.id);
      if (existing) {
        return prev.map(o => o.id === option.id ? { ...o, quantity } : o);
      } else {
        return [...prev, { ...option, quantity }];
      }
    });
  };

  // Calculate pricing when selections change
  useEffect(() => {
    const fetchPricing = async () => {
      if (!event || !selectedPerformance || !selectedSection || !selectedTicketType || selectedSeats.length === 0) {
        setPricingBreakdown(null);
        return;
      }

      try {
        const pricing = await calculateEventPricing({
          event_id: event.id,
          performance_id: selectedPerformance.id,
          section_name: selectedSection.name,
          ticket_type_id: selectedTicketType.id,
          quantity: selectedSeats.length,
          selected_options: selectedOptions,
          discount_code: discountCode,
          user_currency: userCurrency
        });
        
        setPricingBreakdown(pricing);
      } catch (error) {
        console.error('Failed to calculate pricing:', error);
      }
    };

    fetchPricing();
  }, [selectedPerformance, selectedSection, selectedSeats, selectedOptions, discountCode, event?.id, selectedTicketType?.id, calculateEventPricing]);

  // Handle booking
  const handleBooking = async () => {
    if (!event || !selectedPerformance || !selectedSection || selectedSeats.length === 0) {
      return;
    }

    try {
      setIsBooking(true);
      
      // Add event to cart using the new service
      await addEventToCart({
        event_id: event.id,
        performance_id: selectedPerformance.id,
        section_name: selectedSection.name,
        ticket_type_id: selectedTicketType?.id || '',
        quantity: selectedSeats.length,
        selected_seats: selectedSeats.map(seat => seat.id),
        selected_options: selectedOptions.map(opt => ({
          option_id: opt.id,
          quantity: opt.quantity
        }))
      });

      // Refresh cart
      await refreshCart();
      
      // Navigate to cart
      router.push(`/${locale}/cart`);
      
    } catch (error) {
      console.error('Failed to add event to cart:', error);
      setError(t('failedToAddToCart'));
    } finally {
      setIsBooking(false);
    }
  };

  // Handle discount code
  const handleDiscountApply = () => {
    // Pricing will be recalculated automatically via useEffect
    setShowPricingDetails(true);
  };

  // Loading state
  if (isLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || eventsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{t('error')}</div>
          <p className="text-gray-600">{error || eventsError}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">{t('eventNotFound')}</div>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('back')}
            </button>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.performances?.[0]?.date || '')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatTime(event.start_time)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue?.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(event.price, event.currency)}
                  </div>
                  <div className="text-sm text-gray-500">{t('startingFrom')}</div>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('eventDetails')}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><strong>{t('category')}:</strong> {event.category?.name}</div>
                    <div><strong>{t('style')}:</strong> {event.style}</div>
                    <div><strong>{t('duration')}:</strong> {event.duration_hours} {t('hours')}</div>
                    {event.age_restriction && (
                      <div><strong>{t('ageRestriction')}:</strong> {event.age_restriction}+</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('venueInfo')}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><strong>{t('venue')}:</strong> {event.venue?.name}</div>
                    <div><strong>{t('address')}:</strong> {event.venue?.address}</div>
                    <div><strong>{t('capacity')}:</strong> {event.venue?.total_capacity} {t('seats')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Steps */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('bookingSteps')}</h2>
              <div className="space-y-4">
                {bookingSteps.map((step) => (
                  <div key={step.id} className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    step.isActive ? 'border-blue-200 bg-blue-50' : 
                    step.isComplete ? 'border-green-200 bg-green-50' : 
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.isComplete ? 'bg-green-500 text-white' :
                      step.isActive ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {step.isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Selection */}
            {currentStep >= 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('selectPerformance')}</h2>
                <PerformanceSelector
                  performances={event.performances || []}
                  selectedPerformance={selectedPerformance}
                  onSelect={handlePerformanceSelect}
                />
              </div>
            )}

            {/* Seat Selection */}
            {currentStep >= 2 && selectedPerformance && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('selectSeats')}</h2>
                <SeatMap
                  performance={selectedPerformance}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelect}
                  onSeatDeselect={handleSeatDeselect}
                  onSectionSelect={handleSectionSelect}
                  selectedSection={selectedSection}
                />
              </div>
            )}

            {/* Options Selection */}
            {currentStep >= 3 && selectedSeats.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('addOptions')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.options?.map((option) => (
                    <div key={option.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{option.name}</h3>
                        <span className="text-blue-600 font-semibold">
                          {formatPrice(option.price, option.currency)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const currentQty = selectedOptions.find(o => o.id === option.id)?.quantity || 0;
                              if (currentQty > 0) {
                                handleOptionSelect(option, currentQty - 1);
                              }
                            }}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {selectedOptions.find(o => o.id === option.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentQty = selectedOptions.find(o => o.id === option.id)?.quantity || 0;
                              handleOptionSelect(option, currentQty + 1);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review and Booking */}
            {currentStep >= 4 && pricingBreakdown && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('reviewAndBook')}</h2>
                
                <PricingBreakdown pricing={pricingBreakdown} />
                
                <div className="mt-6">
                  <button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? t('processing') : t('addToCart')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Pricing Summary */}
            {pricingBreakdown && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-4">
                <h3 className="text-lg font-semibold mb-4">{t('pricingSummary')}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t('tickets')}</span>
                    <span>{selectedSeats.length} × {formatPrice(pricingBreakdown.base_price, pricingBreakdown.currency)}</span>
                  </div>
                  
                  {pricingBreakdown.options_total > 0 && (
                    <div className="flex justify-between">
                      <span>{t('options')}</span>
                      <span>{formatPrice(pricingBreakdown.options_total, pricingBreakdown.currency)}</span>
                    </div>
                  )}
                  
                  {pricingBreakdown.fees_total > 0 && (
                    <div className="flex justify-between">
                      <span>{t('fees')}</span>
                      <span>{formatPrice(pricingBreakdown.fees_total, pricingBreakdown.currency)}</span>
                    </div>
                  )}
                  
                  {pricingBreakdown.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('discount')}</span>
                      <span>-{formatPrice(pricingBreakdown.discount_amount, pricingBreakdown.currency)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t('total')}</span>
                      <span>{formatPrice(pricingBreakdown.total, pricingBreakdown.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{t('eventInfo')}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('artists')}</h4>
                  <div className="space-y-2">
                    {event.artists?.map((artist) => (
                      <div key={artist.id} className="flex items-center space-x-3">
                        {artist.image && (
                          <img 
                            src={artist.image} 
                            alt={artist.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{artist.name}</div>
                          {artist.bio && (
                            <div className="text-sm text-gray-600">{artist.bio}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{t('venueFacilities')}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {event.venue?.facilities?.map((facility, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {event.reviews && event.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">{t('reviews')}</h3>
                
                <div className="space-y-4">
                  {event.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{review.rating}/5</span>
                        </div>
                        <span className="text-sm text-gray-500">{review.user_name}</span>
                      </div>
                      
                      <h4 className="font-medium mb-1">{review.title}</h4>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 