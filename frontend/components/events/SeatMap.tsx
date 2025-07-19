'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Users, Star, Accessibility } from 'lucide-react';
import { EventPerformance, EventSection, TicketType } from '@/lib/types/api';

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
  performance: EventPerformance;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  onSeatDeselect: (seat: Seat) => void;
  onSectionSelect: (section: EventSection) => void;
  selectedSection: EventSection | null;
}

export default function SeatMap({
  performance,
  selectedSeats,
  onSeatSelect,
  onSeatDeselect,
  onSectionSelect,
  selectedSection
}: SeatMapProps) {
  const t = useTranslations('eventDetail');
  const [sections, setSections] = useState<EventSection[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sections and seats for the performance
  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would fetch this data from the API
        // For now, we'll create mock data
        const mockSections: EventSection[] = [
          {
            id: '1',
            name: 'VIP',
            description: 'Premium front row seats',
            total_capacity: 50,
            available_capacity: 30,
            reserved_capacity: 10,
            sold_capacity: 10,
            base_price: 150,
            currency: 'USD',
            is_wheelchair_accessible: false,
            is_premium: true,
            ticket_types: []
          },
          {
            id: '2',
            name: 'A',
            description: 'Orchestra section',
            total_capacity: 200,
            available_capacity: 150,
            reserved_capacity: 30,
            sold_capacity: 20,
            base_price: 100,
            currency: 'USD',
            is_wheelchair_accessible: true,
            is_premium: false,
            ticket_types: []
          },
          {
            id: '3',
            name: 'B',
            description: 'Mezzanine section',
            total_capacity: 150,
            available_capacity: 120,
            reserved_capacity: 20,
            sold_capacity: 10,
            base_price: 80,
            currency: 'USD',
            is_wheelchair_accessible: true,
            is_premium: false,
            ticket_types: []
          },
          {
            id: '4',
            name: 'C',
            description: 'Balcony section',
            total_capacity: 100,
            available_capacity: 80,
            reserved_capacity: 15,
            sold_capacity: 5,
            base_price: 60,
            currency: 'USD',
            is_wheelchair_accessible: false,
            is_premium: false,
            ticket_types: []
          }
        ];

        const mockSeats: Seat[] = [];
        
        // Generate seats for each section
        mockSections.forEach(section => {
          const rows = section.name === 'VIP' ? 5 : 10;
          const seatsPerRow = section.total_capacity / rows;
          
          for (let row = 1; row <= rows; row++) {
            for (let seat = 1; seat <= seatsPerRow; seat++) {
              const seatId = `${section.name}-${row}-${seat}`;
              const isSold = Math.random() < 0.2; // 20% chance of being sold
              const isReserved = Math.random() < 0.1; // 10% chance of being reserved
              
              mockSeats.push({
                id: seatId,
                seat_number: seat.toString(),
                row_number: row.toString(),
                section: section.name,
                price: section.base_price,
                currency: section.currency,
                is_wheelchair_accessible: section.is_wheelchair_accessible && seat === 1,
                is_premium: section.is_premium,
                status: isSold ? 'sold' : isReserved ? 'reserved' : 'available',
                ticket_type: undefined
              });
            }
          }
        });

        setSections(mockSections);
        setSeats(mockSeats);
        
        // Auto-select first section
        if (mockSections.length > 0) {
          onSectionSelect(mockSections[0]);
        }
        
      } catch (error) {
        console.error('Failed to fetch seat data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeatData();
  }, [performance.id, onSectionSelect]);

  const getSeatStatus = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) {
      return 'selected';
    }
    return seat.status;
  };

  const getSeatColor = (seat: Seat) => {
    const status = getSeatStatus(seat);
    switch (status) {
      case 'selected':
        return 'bg-blue-500 text-white border-blue-600';
      case 'sold':
        return 'bg-red-500 text-white border-red-600 cursor-not-allowed';
      case 'reserved':
        return 'bg-yellow-500 text-white border-yellow-600 cursor-not-allowed';
      case 'blocked':
        return 'bg-gray-500 text-white border-gray-600 cursor-not-allowed';
      default:
        return 'bg-white text-gray-900 border-gray-300 hover:border-blue-400 hover:bg-blue-50';
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'available') {
      const isSelected = selectedSeats.find(s => s.id === seat.id);
      if (isSelected) {
        onSeatDeselect(seat);
      } else {
        onSeatSelect(seat);
      }
    }
  };

  const getSectionSeats = (sectionName: string) => {
    return seats.filter(seat => seat.section === sectionName);
  };

  const getSectionRows = (sectionName: string) => {
    const sectionSeats = getSectionSeats(sectionName);
    const rows = [...new Set(sectionSeats.map(seat => seat.row_number))].sort((a, b) => parseInt(a) - parseInt(b));
    return rows;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('loadingSeatMap')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <div>
        <h3 className="text-lg font-medium mb-4">{t('selectSection')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionSelect(section)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedSection?.id === section.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{section.name}</h4>
                {section.is_premium && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{section.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {section.available_capacity} {t('available')}
                </span>
                <span className="font-semibold text-blue-600">
                  ${section.base_price}
                </span>
              </div>
              
              {section.is_wheelchair_accessible && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Accessibility className="h-3 w-3 mr-1" />
                  {t('wheelchairAccessible')}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Seat Map */}
      {selectedSection && (
        <div>
          <h3 className="text-lg font-medium mb-4">
            {t('selectSeats')} - {selectedSection.name} {t('section')}
          </h3>
          
          <div className="bg-gray-100 rounded-lg p-6">
            {/* Stage Indicator */}
            <div className="text-center mb-8">
              <div className="bg-gray-300 rounded-lg py-4 px-8 inline-block">
                <div className="text-lg font-semibold text-gray-700">{t('stage')}</div>
                <div className="text-sm text-gray-600">{t('front')}</div>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="space-y-4">
              {getSectionRows(selectedSection.name).map((row) => (
                <div key={row} className="flex items-center justify-center space-x-2">
                  <div className="w-12 text-center text-sm font-medium text-gray-600">
                    {t('row')} {row}
                  </div>
                  
                  <div className="flex space-x-1">
                    {getSectionSeats(selectedSection.name)
                      .filter(seat => seat.row_number === row)
                      .sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number))
                      .map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status !== 'available'}
                          className={`w-8 h-8 rounded border-2 text-xs font-medium transition-colors ${getSeatColor(seat)}`}
                          title={`${t('row')} ${seat.row_number}, ${t('seat')} ${seat.seat_number} - $${seat.price}`}
                        >
                          {seat.seat_number}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">{t('legend')}</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                <span>{t('available')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded"></div>
                <span>{t('selected')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-red-500 border-2 border-red-600 rounded"></div>
                <span>{t('sold')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-500 border-2 border-yellow-600 rounded"></div>
                <span>{t('reserved')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-500 border-2 border-gray-600 rounded"></div>
                <span>{t('blocked')}</span>
              </div>
            </div>
          </div>

          {/* Selected Seats Summary */}
          {selectedSeats.length > 0 && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">{t('selectedSeats')}</h4>
              <div className="space-y-1">
                {selectedSeats.map((seat) => (
                  <div key={seat.id} className="flex items-center justify-between text-sm">
                    <span>
                      {seat.section} - {t('row')} {seat.row_number}, {t('seat')} {seat.seat_number}
                    </span>
                    <span className="font-semibold">${seat.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between font-semibold">
                  <span>{t('total')}</span>
                  <span>${selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 