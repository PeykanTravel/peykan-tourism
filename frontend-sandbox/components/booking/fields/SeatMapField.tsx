'use client';

import React from 'react';

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'selected' | 'occupied';
  price?: number;
}

interface SeatMapFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export function SeatMapField({ value, onChange, label = 'انتخاب صندلی' }: SeatMapFieldProps) {
  // Mock seat data - in real app this would come from API
  const seats: Seat[] = [
    { id: 'A1', row: 'A', number: 1, status: 'available' },
    { id: 'A2', row: 'A', number: 2, status: 'occupied' },
    { id: 'A3', row: 'A', number: 3, status: 'available' },
    { id: 'A4', row: 'A', number: 4, status: 'available' },
    { id: 'B1', row: 'B', number: 1, status: 'available' },
    { id: 'B2', row: 'B', number: 2, status: 'available' },
    { id: 'B3', row: 'B', number: 3, status: 'occupied' },
    { id: 'B4', row: 'B', number: 4, status: 'available' },
    { id: 'C1', row: 'C', number: 1, status: 'available' },
    { id: 'C2', row: 'C', number: 2, status: 'available' },
    { id: 'C3', row: 'C', number: 3, status: 'available' },
    { id: 'C4', row: 'C', number: 4, status: 'occupied' },
  ];

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied') return;

    const newValue = value.includes(seatId)
      ? value.filter(id => id !== seatId)
      : [...value, seatId];
    
    onChange(newValue);
  };

  const getSeatStatus = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return 'available';
    
    if (seat.status === 'occupied') return 'occupied';
    if (value.includes(seatId)) return 'selected';
    return 'available';
  };

  const getSeatClassName = (seatId: string) => {
    const status = getSeatStatus(seatId);
    const baseClasses = 'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all';
    
    switch (status) {
      case 'selected':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
      case 'occupied':
        return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
      case 'available':
        return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300`;
      default:
        return baseClasses;
    }
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="seat-map space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="seat-map-container">
        {/* Stage indicator */}
        <div className="text-center mb-6">
          <div className="inline-block px-8 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
            صحنه
          </div>
        </div>

        {/* Seats */}
        <div className="space-y-4">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div key={row} className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {row}
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatClick(seat.id)}
                    disabled={seat.status === 'occupied'}
                    className={getSeatClassName(seat.id)}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-6 rtl:space-x-reverse text-sm">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">موجود</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">انتخاب شده</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">رزرو شده</span>
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            صندلی‌های انتخاب شده: {value.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
} 