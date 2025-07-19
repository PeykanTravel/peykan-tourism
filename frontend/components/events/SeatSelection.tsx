/**
 * Seat Selection Component
 * 
 * Component for selecting seats in event performances
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Seat, Check } from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface SeatData {
  id: string;
  seat_number: string;
  row: string;
  section: string;
  price: number;
  status: 'available' | 'reserved' | 'sold';
}

interface SeatSelectionProps {
  performanceId: string;
  onSeatsSelected: (seats: SeatData[]) => void;
  maxSeats?: number;
}

export default function SeatSelection({ 
  performanceId, 
  onSeatsSelected, 
  maxSeats = 10 
}: SeatSelectionProps) {
  const t = useTranslations('seatSelection');
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSeats();
  }, [performanceId]);

  useEffect(() => {
    onSeatsSelected(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  const fetchSeats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for demo
      const mockSeats: SeatData[] = [];
      const sections = ['A', 'B', 'C', 'D', 'E'];
      const rows = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      
      sections.forEach((section, sectionIndex) => {
        rows.forEach((row, rowIndex) => {
          const seatNumber = `${row}${sectionIndex + 1}`;
          mockSeats.push({
            id: `${section}_${row}_${seatNumber}`,
            seat_number: seatNumber,
            row,
            section,
            price: 50 + (sectionIndex * 10) + (rowIndex * 5),
            status: Math.random() > 0.3 ? 'available' : 'sold',
          });
        });
      });

      setSeats(mockSeats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load seats');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = (seat: SeatData) => {
    if (seat.status !== 'available') return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        if (prev.length >= maxSeats) {
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const isSeatSelected = (seatId: string) => {
    return selectedSeats.some(seat => seat.id === seatId);
  };

  const getSeatStatus = (seat: SeatData) => {
    if (seat.status === 'sold') return 'sold';
    if (seat.status === 'reserved') return 'reserved';
    if (isSeatSelected(seat.id)) return 'selected';
    return 'available';
  };

  const getSeatClassName = (seat: SeatData) => {
    const baseClasses = 'w-8 h-8 rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200';
    
    switch (getSeatStatus(seat)) {
      case 'sold':
        return `${baseClasses} bg-neutral-300 text-neutral-500 cursor-not-allowed`;
      case 'reserved':
        return `${baseClasses} bg-warning-200 text-warning-700 cursor-not-allowed`;
      case 'selected':
        return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700`;
      default:
        return `${baseClasses} bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300`;
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="w-8 h-8 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-error-600">
            <p>{error}</p>
            <Button onClick={fetchSeats} className="mt-4">
              {t('retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-neutral-600">
          {t('description', { maxSeats })}
        </p>
      </CardHeader>
      <CardContent>
        {/* Stage indicator */}
        <div className="text-center mb-6">
          <div className="bg-neutral-200 rounded-lg py-2 px-4 inline-block">
            <span className="text-sm font-medium text-neutral-700">{t('stage')}</span>
          </div>
        </div>

        {/* Seating chart */}
        <div className="space-y-4">
          {['A', 'B', 'C', 'D', 'E'].map(section => (
            <div key={section} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">
                  {t('section')} {section}
                </span>
                <span className="text-xs text-neutral-500">
                  ${Math.min(...seats.filter(s => s.section === section).map(s => s.price))} - ${Math.max(...seats.filter(s => s.section === section).map(s => s.price))}
                </span>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {seats
                  .filter(seat => seat.section === section)
                  .sort((a, b) => parseInt(a.row) - parseInt(b.row))
                  .map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      className={getSeatClassName(seat)}
                      disabled={seat.status !== 'available'}
                      title={`${t('seat')} ${seat.seat_number} - $${seat.price}`}
                    >
                      {getSeatStatus(seat) === 'selected' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        seat.seat_number
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">{t('legend')}</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-neutral-100 border border-neutral-300 rounded"></div>
              <span>{t('available')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary-600 rounded"></div>
              <span>{t('selected')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-neutral-300 rounded"></div>
              <span>{t('sold')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-warning-200 rounded"></div>
              <span>{t('reserved')}</span>
            </div>
          </div>
        </div>

        {/* Selection summary */}
        {selectedSeats.length > 0 && (
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <h4 className="text-sm font-medium text-primary-700 mb-2">
              {t('selectedSeats')} ({selectedSeats.length})
            </h4>
            <div className="space-y-1">
              {selectedSeats.map(seat => (
                <div key={seat.id} className="flex justify-between text-sm">
                  <span>{t('seat')} {seat.seat_number}</span>
                  <span>${seat.price}</span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between font-medium">
                <span>{t('total')}</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 