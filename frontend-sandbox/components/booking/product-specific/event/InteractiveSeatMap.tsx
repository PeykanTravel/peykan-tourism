'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Users, User, Star, Info, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Maximize2 } from 'lucide-react';

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
  ticket_type?: string;
}

interface Section {
  id: string;
  name: string;
  description: string;
  total_capacity: number;
  available_capacity: number;
  base_price: number;
  currency: string;
  is_wheelchair_accessible: boolean;
  is_premium: boolean;
}

interface InteractiveSeatMapProps {
  sections: Section[];
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  onSeatDeselect: (seat: Seat) => void;
  onSectionSelect: (section: Section) => void;
  selectedSection: Section | null;
  maxSelectableSeats?: number;
  formatPrice: (price: number, currency: string) => string;
}

export default function InteractiveSeatMap({
  sections,
  selectedSeats,
  onSeatSelect,
  onSeatDeselect,
  onSectionSelect,
  selectedSection,
  maxSelectableSeats = 8,
  formatPrice
}: InteractiveSeatMapProps) {
  const t = useTranslations('seatMap');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLegend, setShowLegend] = useState(true);
  const [viewMode, setViewMode] = useState<'sections' | 'seats'>('sections');
  const [hoveredSection, setHoveredSection] = useState<Section | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Generate mock seats for demonstration
  const generateMockSeats = useCallback((section: Section): Seat[] => {
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
          price: section.base_price + (isPremium ? 50000 : 0), // Premium seats cost more
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
    const grouped: Record<string, Seat[]> = {};
    sectionSeats.forEach(seat => {
      if (!grouped[seat.row_number]) {
        grouped[seat.row_number] = [];
      }
      grouped[seat.row_number].push(seat);
    });
    return grouped;
  }, [sectionSeats]);

  const getSeatStatus = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) return 'selected';
    return seat.status;
  };

  const getSeatClassName = (seat: Seat) => {
    const status = getSeatStatus(seat);
    const baseClasses = 'w-8 h-8 rounded-md border-2 flex items-center justify-center text-xs font-medium transition-all duration-200 cursor-pointer';
    
    switch (status) {
      case 'selected':
        return `${baseClasses} bg-purple-500 text-white border-purple-600 hover:bg-purple-600`;
      case 'available':
        return `${baseClasses} bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-900/40`;
      case 'reserved':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-700`;
      case 'sold':
        return `${baseClasses} bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700`;
      case 'blocked':
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600`;
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'available') return;
    
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      onSeatDeselect(seat);
    } else {
      if (selectedSeats.length >= maxSelectableSeats) {
        alert(t('maxSeatsReached', { max: maxSelectableSeats }));
        return;
      }
      onSeatSelect(seat);
    }
  };

  const canSelectMore = selectedSeats.length < maxSelectableSeats;

  if (sections.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <MapPin className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('noSectionsAvailable')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {t('checkBackLater')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('selectSeats')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {selectedSeats.length} / {maxSelectableSeats} {t('seatsSelected')}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showLegend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded dark:bg-green-900/20 dark:border-green-700" />
              <span className="text-gray-600 dark:text-gray-300">{t('available')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 border-2 border-purple-600 rounded" />
              <span className="text-gray-600 dark:text-gray-300">{t('selected')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded dark:bg-yellow-900/20 dark:border-yellow-700" />
              <span className="text-gray-600 dark:text-gray-300">{t('reserved')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded dark:bg-red-900/20 dark:border-red-700" />
              <span className="text-gray-600 dark:text-gray-300">{t('sold')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-300">{t('premium')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-blue-500">♿</div>
              <span className="text-gray-600 dark:text-gray-300">{t('wheelchair')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Section Selection */}
      {viewMode === 'sections' && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedSection?.id === section.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
                onClick={() => onSectionSelect(section)}
                onMouseEnter={() => setHoveredSection(section)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {section.name}
                  </h3>
                  {section.is_premium && <Star className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {section.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('available')}: {section.available_capacity}
                  </span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {formatPrice(section.base_price, section.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seat Map */}
      {viewMode === 'seats' && selectedSection && (
        <div className="p-6 overflow-auto">
          <div className="mb-4">
            <button
              onClick={() => setViewMode('sections')}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              ← {t('backToSections')}
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
              {selectedSection.name} - {t('selectSeats')}
            </h3>
          </div>

          <div 
            className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-8"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          >
            {/* Stage */}
            <div className="text-center mb-8">
              <div className="bg-gray-300 dark:bg-gray-600 rounded-lg py-4 px-8 inline-block">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {t('stage')}
                </span>
              </div>
            </div>

            {/* Seats */}
            <div className="space-y-2">
              {Object.entries(seatsByRow).map(([rowNumber, seats]) => (
                <div key={rowNumber} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-center">
                    {rowNumber}
                  </span>
                  <div className="flex space-x-1">
                    {seats.map((seat) => (
                      <div
                        key={seat.id}
                        className={getSeatClassName(seat)}
                        onClick={() => handleSeatClick(seat)}
                        onMouseEnter={() => setHoveredSeat(seat)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        title={`${t('seat')} ${seat.seat_number} - ${t('row')} ${seat.row_number} - ${formatPrice(seat.price, seat.currency)}`}
                      >
                                                 {seat.is_wheelchair_accessible && (
                           <div className="w-3 h-3 text-blue-500">♿</div>
                         )}
                        {seat.is_premium && !seat.is_wheelchair_accessible && (
                          <Star className="w-3 h-3" />
                        )}
                        {!seat.is_wheelchair_accessible && !seat.is_premium && (
                          seat.seat_number
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
            {t('selectedSeats')} ({selectedSeats.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <div
                key={seat.id}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
              >
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  {seat.section} {seat.row_number}-{seat.seat_number}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {formatPrice(seat.price, seat.currency)}
                </span>
                <button
                  onClick={() => onSeatDeselect(seat)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-purple-700 dark:text-purple-200">
            {t('total')}: {formatPrice(
              selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
              selectedSeats[0]?.currency || 'IRR'
            )}
          </div>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredSeat && (
        <div className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none">
          <div>{t('seat')} {hoveredSeat.seat_number}</div>
          <div>{t('row')} {hoveredSeat.row_number}</div>
          <div>{t('section')} {hoveredSeat.section}</div>
          <div>{formatPrice(hoveredSeat.price, hoveredSeat.currency)}</div>
          {hoveredSeat.is_premium && <div className="text-yellow-400">{t('premium')}</div>}
          {hoveredSeat.is_wheelchair_accessible && <div className="text-blue-400">{t('wheelchair')}</div>}
        </div>
      )}
    </div>
  );
} 