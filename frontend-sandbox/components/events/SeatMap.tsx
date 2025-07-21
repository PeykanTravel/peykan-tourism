'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { 
  MapPin, 
  Users, 
  User, 
  Star, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { EventSection, TicketType, SectionTicketType } from '@/lib/types/api';

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

interface SeatMapProps {
  sections: EventSection[];
  ticketTypes: TicketType[];
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  onSeatDeselect: (seat: Seat) => void;
  onSectionSelect: (section: EventSection) => void;
  selectedSection: EventSection | null;
  selectedTicketType: TicketType | null;
  maxSelectableSeats?: number;
  formatPrice: (price: number, currency: string) => string;
}

export default function SeatMap({
  sections,
  ticketTypes,
  selectedSeats,
  onSeatSelect,
  onSeatDeselect,
  onSectionSelect,
  selectedSection,
  selectedTicketType,
  maxSelectableSeats = 8,
  formatPrice
}: SeatMapProps) {
  const t = useTranslations('seatMap');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLegend, setShowLegend] = useState(true);
  const [viewMode, setViewMode] = useState<'sections' | 'seats'>('sections');
  const [hoveredSection, setHoveredSection] = useState<EventSection | null>(null);

  // Mock seat data generation for demonstration
  const generateMockSeats = useCallback((section: EventSection): Seat[] => {
    const seats: Seat[] = [];
    const rowCount = Math.ceil(section.total_capacity / 20); // Assume ~20 seats per row
    const seatsPerRow = Math.ceil(section.total_capacity / rowCount);
    
    for (let row = 1; row <= rowCount; row++) {
      for (let seat = 1; seat <= seatsPerRow && seats.length < section.total_capacity; seat++) {
        const seatId = `${section.id}-${row}-${seat}`;
        const isWheelchair = Math.random() < 0.05; // 5% wheelchair accessible
        const isPremium = section.is_premium || Math.random() < 0.1; // 10% premium if not premium section
        const isAvailable = Math.random() < (section.available_capacity / section.total_capacity);
        
        seats.push({
          id: seatId,
          seat_number: seat.toString(),
          row_number: row.toString(),
          section: section.name,
          price: section.base_price,
          currency: section.currency,
          is_wheelchair_accessible: isWheelchair,
          is_premium: isPremium,
          status: isAvailable ? 'available' : ['reserved', 'sold'][Math.floor(Math.random() * 2)] as any
        });
      }
    }
    
    return seats;
  }, []);

  // Get seats for selected section
  const sectionSeats = useMemo(() => {
    if (!selectedSection) return [];
    return generateMockSeats(selectedSection);
  }, [selectedSection, generateMockSeats]);

  // Group seats by row for display
  const seatsByRow = useMemo(() => {
    const grouped: { [key: string]: Seat[] } = {};
    sectionSeats.forEach(seat => {
      if (!grouped[seat.row_number]) {
        grouped[seat.row_number] = [];
      }
      grouped[seat.row_number].push(seat);
    });
    
    // Sort seats within each row
    Object.keys(grouped).forEach(row => {
      grouped[row].sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number));
    });
    
    return grouped;
  }, [sectionSeats]);

  const handleSeatClick = useCallback((seat: Seat) => {
    if (seat.status !== 'available') return;
    
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      onSeatDeselect(seat);
    } else {
      if (selectedSeats.length >= maxSelectableSeats) {
        alert(t('maxSeatsReached', { max: maxSelectableSeats }));
        return;
      }
      onSeatSelect({ ...seat, status: 'selected', ticket_type: selectedTicketType?.name });
    }
  }, [selectedSeats, maxSelectableSeats, onSeatSelect, onSeatDeselect, t, selectedTicketType]);

  const getSeatClassName = useCallback((seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const baseClasses = 'w-6 h-6 m-0.5 rounded-sm border text-xs flex items-center justify-center cursor-pointer transition-all hover:scale-110';
    
    if (isSelected) {
      return `${baseClasses} bg-blue-600 border-blue-700 text-white shadow-md`;
    }
    
    switch (seat.status) {
      case 'available':
        if (seat.is_premium) {
          return `${baseClasses} bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200`;
        }
        if (seat.is_wheelchair_accessible) {
          return `${baseClasses} bg-green-100 border-green-300 text-green-800 hover:bg-green-200`;
        }
        return `${baseClasses} bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200`;
      case 'reserved':
        return `${baseClasses} bg-orange-200 border-orange-300 text-orange-800 cursor-not-allowed opacity-70`;
      case 'sold':
        return `${baseClasses} bg-red-200 border-red-300 text-red-800 cursor-not-allowed opacity-70`;
      case 'blocked':
        return `${baseClasses} bg-gray-300 border-gray-400 text-gray-600 cursor-not-allowed opacity-50`;
      default:
        return baseClasses;
    }
  }, [selectedSeats]);

  const getSectionClassName = useCallback((section: EventSection) => {
    const isSelected = selectedSection?.id === section.id;
    const isHovered = hoveredSection?.id === section.id;
    const occupancyRate = ((section.total_capacity - section.available_capacity) / section.total_capacity) * 100;
    
    let colorClass = 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'; // Default: available
    if (occupancyRate > 80) colorClass = 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200';
    else if (occupancyRate > 50) colorClass = 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
    
    return `relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
        : isHovered 
          ? `${colorClass} shadow-md scale-105` 
          : `${colorClass} hover:shadow-md`
    }`;
  }, [selectedSection, hoveredSection]);

  const handleZoom = useCallback((direction: 'in' | 'out' | 'reset') => {
    setZoomLevel(prev => {
      switch (direction) {
        case 'in': return Math.min(prev + 0.2, 2);
        case 'out': return Math.max(prev - 0.2, 0.5);
        case 'reset': return 1;
        default: return prev;
      }
    });
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('seatSelection')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedSeats.length} / {maxSelectableSeats} {t('seatsSelected')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('sections')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'sections'
                    ? 'bg-white dark:bg-gray-500 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {t('sections')}
              </button>
              <button
                onClick={() => setViewMode('seats')}
                disabled={!selectedSection}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'seats'
                    ? 'bg-white dark:bg-gray-500 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 disabled:opacity-50'
                }`}
              >
                {t('seats')}
              </button>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-1 border-l border-gray-200 dark:border-gray-600 pl-2">
              <button
                onClick={() => handleZoom('out')}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleZoom('reset')}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleZoom('in')}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                disabled={zoomLevel >= 2}
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                {showLegend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Map Area */}
        <div 
          className="flex-1 p-4 overflow-auto"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
        >
          {/* Stage Area */}
          <div className="text-center mb-8">
            <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block">
              <span className="font-medium">{t('stage')}</span>
            </div>
          </div>

          {viewMode === 'sections' ? (
            /* Sections View */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {sections.map((section) => {
                const occupancyRate = ((section.total_capacity - section.available_capacity) / section.total_capacity) * 100;
                
                return (
                  <div
                    key={section.id}
                    className={getSectionClassName(section)}
                    onClick={() => onSectionSelect(section)}
                    onMouseEnter={() => setHoveredSection(section)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <div className="text-center">
                      <h4 className="font-bold text-lg mb-1 dark:text-white">{section.name}</h4>
                      <div className="text-sm opacity-90 mb-2 dark:text-gray-300">
                        {section.available_capacity} / {section.total_capacity}
                      </div>
                      <div className="text-xs opacity-75 mb-2 dark:text-gray-400">
                        {formatPrice(section.base_price, section.currency)}
                      </div>
                      
                      {/* Features */}
                      <div className="flex justify-center space-x-1">
                        {section.is_wheelchair_accessible && (
                          <User className="h-3 w-3" />
                        )}
                        {section.is_premium && (
                          <Star className="h-3 w-3" />
                        )}
                      </div>
                      
                      {/* Occupancy Bar */}
                      <div className="mt-2 bg-white bg-opacity-50 rounded-full h-1">
                        <div
                          className="bg-current h-1 rounded-full transition-all"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Seats View */
            selectedSection && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {t('section')} {selectedSection.name}
                  </h4>
                  <p className="text-gray-600">
                    {formatPrice(selectedSection.base_price, selectedSection.currency)} • {selectedSection.available_capacity} {t('available')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(seatsByRow)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([rowNumber, rowSeats]) => (
                      <div key={rowNumber} className="flex items-center justify-center space-x-1">
                        {/* Row Label */}
                        <div className="w-8 text-center text-sm font-medium text-gray-500">
                          {rowNumber}
                        </div>
                        
                        {/* Seats */}
                        <div className="flex space-x-0.5">
                          {rowSeats.map((seat) => (
                            <div
                              key={seat.id}
                              className={getSeatClassName(seat)}
                              onClick={() => handleSeatClick(seat)}
                              title={`${t('seat')} ${seat.seat_number} - ${t('row')} ${seat.row_number}${
                                seat.is_wheelchair_accessible ? ` - ${t('wheelchairAccessible')}` : ''
                              }${seat.is_premium ? ` - ${t('premium')}` : ''}`}
                            >
                              {seat.is_wheelchair_accessible ? (
                                <User className="h-3 w-3" />
                              ) : seat.is_premium ? (
                                <Star className="h-3 w-3" />
                              ) : (
                                seat.seat_number
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-3">{t('legend')}</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded-sm mr-2"></div>
                <span>{t('available')}</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-600 border border-blue-700 rounded-sm mr-2"></div>
                <span>{t('selected')}</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 bg-yellow-100 border border-yellow-300 rounded-sm mr-2 flex items-center justify-center">
                  <Star className="h-3 w-3 text-yellow-600" />
                </div>
                <span>{t('premium')}</span>
              </div>
              
                             <div className="flex items-center">
                 <div className="w-5 h-5 bg-green-100 border border-green-300 rounded-sm mr-2 flex items-center justify-center">
                   <User className="h-3 w-3 text-green-600" />
                 </div>
                 <span>{t('wheelchairAccessible')}</span>
               </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 bg-orange-200 border border-orange-300 rounded-sm mr-2"></div>
                <span>{t('reserved')}</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-200 border border-red-300 rounded-sm mr-2"></div>
                <span>{t('sold')}</span>
              </div>
            </div>
            
            {selectedSeats.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-900 mb-2">{t('selectedSeats')}</h5>
                <div className="space-y-1 text-sm">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex justify-between">
                      <span>{seat.section} {seat.row_number}-{seat.seat_number}</span>
                      <span className="font-medium">{formatPrice(seat.price, seat.currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="flex justify-between font-semibold">
                    <span>{t('total')}</span>
                    <span>
                      {formatPrice(
                        selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0),
                        'USD'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 