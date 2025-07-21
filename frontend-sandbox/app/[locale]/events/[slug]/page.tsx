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
  EyeOff
} from 'lucide-react';
import { getEventBySlug, calculateEventPricing } from '@/lib/api/events';
import { addEventSeatsToCart } from '../../../../lib/api/cart';
import { tokenService } from '@/lib/services/tokenService';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Event, EventPricingBreakdown, EventBookingRequest, EventPerformance, EventSection, TicketType } from '@/lib/types/api';
import PerformanceSelector from '@/components/events/PerformanceSelector';
import SeatMap from '@/components/events/SeatMap';
import PricingBreakdown from '@/components/events/PricingBreakdown';
import { useCart } from '@/lib/hooks/useCart';
import Image from 'next/image';

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
  // Add ticket_type as optional, can be string (id), object, or undefined
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
  const { slug } = useParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const t = useTranslations('eventDetail');
  const router = useRouter();
  
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
  
  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const response = await getEventBySlug(slug as string);
        setEvent(response);
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
  }, [slug, t]);

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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  // Handle performance selection
  const handlePerformanceSelect = (performance: EventPerformance) => {
    setSelectedPerformance(performance);
    setSelectedSection(null);
    setSelectedSeats([]);
    setCurrentStep(2);
  };

  // Handle section selection
  const handleSectionSelect = (section: EventSection) => {
    setSelectedSection(section);
    if (section.ticket_types && section.ticket_types.length > 0) {
      setSelectedTicketType(section.ticket_types[0].ticket_type);
    }
    setCurrentStep(2);
  };

  // Handle seat selection
  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeats(prev => [...prev, seat]);
  };

  const handleSeatDeselect = (seat: Seat) => {
    setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
  };

  // Handle option selection
  const handleOptionChange = (option: any, quantity: number) => {
    setSelectedOptions(prev => {
      const existing = prev.find(opt => opt.id === option.id);
      if (existing) {
        if (quantity === 0) {
          return prev.filter(opt => opt.id !== option.id);
        }
        return prev.map(opt => 
          opt.id === option.id ? { ...opt, quantity } : opt
        );
      }
      return quantity > 0 ? [...prev, { ...option, quantity }] : prev;
    });
  };

  // Get pricing when selections change
  useEffect(() => {
    const fetchPricing = async () => {
      if (!selectedPerformance || !selectedSection || !selectedTicketType || selectedSeats.length === 0) {
        setPricingBreakdown(null);
        return;
      }

      try {
        const response = await calculateEventPricing(event!.id, {
          performance_id: selectedPerformance.id,
          section_name: selectedSection.name,
          ticket_type_id: selectedTicketType.id,
          quantity: selectedSeats.length,
          selected_options: selectedOptions.map(opt => ({
            option_id: opt.id,
            quantity: opt.quantity
          })),
          discount_code: discountCode
        });
        setPricingBreakdown(response.pricing_breakdown);
      } catch (err) {
        console.error('Failed to fetch pricing:', err);
      }
    };

    fetchPricing();
  }, [event, selectedPerformance, selectedSection, selectedTicketType, selectedSeats, selectedOptions, discountCode]);

  // Handle booking
  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!selectedPerformance || !selectedSection || !selectedTicketType || selectedSeats.length === 0) {
      alert(t('selectRequiredFields'));
      return;
    }

    setIsBooking(true);
    
    try {
      const bookingRequest: EventBookingRequest = {
        event_id: event!.id,
        performance_id: selectedPerformance.id,
        section_name: selectedSection.name,
        ticket_type_id: selectedTicketType.id,
        quantity: selectedSeats.length,
        selected_seats: selectedSeats.map(seat => seat.id),
        selected_options: selectedOptions.map(opt => ({
          option_id: opt.id,
          quantity: opt.quantity
        })),
        discount_code: discountCode || undefined
      };

      const token = tokenService.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      await addEventSeatsToCart({
        event_id: event!.id,
        performance_id: selectedPerformance.id,
        ticket_type_id: selectedTicketType.id,
        seats: selectedSeats.map(seat => ({
          seat_id: seat.id,
          seat_number: seat.seat_number,
          row_number: seat.row_number,
          section: seat.section,
          price: seat.price
        })),
        selected_options: selectedOptions.map(opt => ({
          option_id: opt.id,
          quantity: opt.quantity
        })),
        special_requests: selectedOptions.length > 0 ? 
          `Options: ${selectedOptions.map(opt => `${opt.name} x${opt.quantity}`).join(', ')}` : 
          undefined
      }, token);

      await refreshCart();
      router.push('/cart');
    } catch (err) {
      console.error('Booking failed:', err);
      alert(t('bookingFailed'));
    } finally {
      setIsBooking(false);
    }
  };

  const handleDiscountApply = () => {
    // This will trigger the useEffect for pricing
    console.log('Applying discount:', discountCode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingEvent')}</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('eventNotFound')}</h1>
          <p className="text-gray-600 mb-6">{error || t('eventNotFoundDescription')}</p>
          <button
            onClick={() => router.push('/events')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t('backToEvents')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
                className={`p-2 rounded-lg ${
                  isFavorite 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:text-gray-900">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="relative">
            <Image
              src={event.image || 'https://picsum.photos/800/256?random=event'}
              alt={event.title}
              width={800}
              height={256}
              className="w-full h-64 object-cover rounded-t-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://picsum.photos/800/256?random=event-fallback';
              }}
            />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {event.category.name}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{event.performances?.[0] ? formatDate(event.performances[0].date) : t('noPerformances')}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>{event.start_time}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{event.venue.name}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2" />
                <span>{event.venue.total_capacity} {t('capacity')}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600">
                  {event.average_rating} ({event.review_count} {t('reviews')})
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                {event.style}
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>

        {/* Booking Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('bookingSteps')}</h2>
            <div className="flex items-center justify-between">
              {bookingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.isComplete 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : step.isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {step.isComplete ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${
                      step.isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                  {index < bookingSteps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-gray-400 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Selection */}
            <PerformanceSelector
              performances={event.performances || []}
              selectedPerformance={selectedPerformance}
              onPerformanceSelect={handlePerformanceSelect}
              formatDate={formatDate}
              formatTime={formatTime}
              formatPrice={formatPrice}
            />

            {/* Seat Map */}
            {selectedPerformance && (
              <SeatMap
                sections={selectedPerformance.sections || []}
                ticketTypes={event.ticket_types || []}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                onSeatDeselect={handleSeatDeselect}
                onSectionSelect={handleSectionSelect}
                selectedSection={selectedSection}
                selectedTicketType={selectedTicketType}
                formatPrice={formatPrice}
              />
            )}

            {/* Options Selection */}
            {selectedSection && event.options && event.options.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('additionalOptions')}
                  </h3>
                  <div className="space-y-4">
                    {event.options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{option.name}</h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {formatPrice(option.price, option.currency)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const currentQuantity = selectedOptions.find(opt => opt.id === option.id)?.quantity || 0;
                              handleOptionChange(option, Math.max(0, currentQuantity - 1));
                            }}
                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {selectedOptions.find(opt => opt.id === option.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentQuantity = selectedOptions.find(opt => opt.id === option.id)?.quantity || 0;
                              handleOptionChange(option, Math.min(option.max_quantity, currentQuantity + 1));
                            }}
                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Breakdown */}
            <PricingBreakdown
              breakdown={pricingBreakdown}
              discountCode={discountCode}
              onDiscountCodeChange={setDiscountCode}
              onApplyDiscount={handleDiscountApply}
              formatPrice={formatPrice}
              showDetails={showPricingDetails}
              onToggleDetails={() => setShowPricingDetails(!showPricingDetails)}
            />

            {/* Booking Summary */}
            {selectedSeats.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{t('bookingSummary')}</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{t('performance')}</span>
                    <span>{selectedPerformance ? formatDate(selectedPerformance.date) : '-'}</span>
                  </div>
                  {/* Group seats by section and ticket type */}
                  {Object.entries(selectedSeats.reduce((acc: Record<string, Seat[]>, seat) => {
                    // Safely resolve ticket type name for grouping
                    let ticketTypeName = '-';
                    if (seat.ticket_type) {
                      if (typeof seat.ticket_type === 'string' && event.ticket_types) {
                        // Try to resolve name from event.ticket_types by id
                        const found = event.ticket_types.find((tt: any) => tt.id === seat.ticket_type);
                        ticketTypeName = found?.name || seat.ticket_type;
                      } else if (typeof seat.ticket_type === 'object' && seat.ticket_type.name) {
                        ticketTypeName = seat.ticket_type.name;
                      } else {
                        ticketTypeName = seat.ticket_type as string;
                      }
                    } else if (selectedTicketType?.name) {
                      ticketTypeName = selectedTicketType.name;
                    }
                    const key = `${seat.section}__${ticketTypeName}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(seat);
                    return acc;
                  }, {} as Record<string, Seat[]>)).map(([key, seats]: [string, Seat[]]) => {
                    // Extract ticket type name for display
                    let ticketTypeName = '-';
                    const firstSeat = seats[0];
                    if (firstSeat.ticket_type) {
                      if (typeof firstSeat.ticket_type === 'string' && event.ticket_types) {
                        const found = event.ticket_types.find((tt: any) => tt.id === firstSeat.ticket_type);
                        ticketTypeName = found?.name || firstSeat.ticket_type;
                      } else if (typeof firstSeat.ticket_type === 'object' && firstSeat.ticket_type.name) {
                        ticketTypeName = firstSeat.ticket_type.name;
                      } else {
                        ticketTypeName = firstSeat.ticket_type as string;
                      }
                    } else if (selectedTicketType?.name) {
                      ticketTypeName = selectedTicketType.name;
                    }
                    return (
                      <div key={key} className="mt-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>{t('section')}</span>
                          <span>{seats[0].section}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t('ticketType') || 'Ticket Type'}</span>
                          <span>{ticketTypeName || '-'}</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span>{t('seats')}:</span>
                          <ul className="ml-2 mt-1">
                            {seats.map(seat => (
                              <li key={seat.id} className="flex justify-between">
                                <span>
                                  Row {seat.row_number}, Seat {seat.seat_number}
                                  {seat.is_premium ? ' (Premium)' : ''}
                                  {seat.is_wheelchair_accessible ? ' (Wheelchair)' : ''}
                                </span>
                                <span>{formatPrice(Number(seat.price), seat.currency)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                  {/* Options */}
                  {selectedOptions.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1">{t('options')}</div>
                      <ul className="ml-2">
                        {selectedOptions.map(opt => (
                          <li key={opt.id} className="flex justify-between">
                            <span>{opt.name} ({opt.quantity}x)</span>
                            <span>{formatPrice(Number(opt.price) * Number(opt.quantity), opt.currency || 'USD')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Total */}
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200">
                    <span>{t('total') || 'Total'}</span>
                    <span>{formatPrice(
                      selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0) +
                      selectedOptions.reduce((sum, opt) => sum + Number(opt.price) * Number(opt.quantity), 0),
                      'USD')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Button */}
            <button
              onClick={handleBooking}
              disabled={isBooking || !selectedPerformance || !selectedSection || selectedSeats.length === 0}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBooking ? t('booking') : t('addToCart')}
            </button>

            {/* Security Notice */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">{t('secureBooking')}</p>
                  <p>{t('secureBookingDescription')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 