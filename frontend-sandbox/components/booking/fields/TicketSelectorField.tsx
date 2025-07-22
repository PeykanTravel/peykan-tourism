'use client';

import React from 'react';

interface TicketOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface TicketSelectorFieldProps {
  value: { ticketType: string; quantity: number };
  onChange: (value: { ticketType: string; quantity: number }) => void;
  options: TicketOption[];
  label?: string;
}

export function TicketSelectorField({ value, onChange, options, label = 'انتخاب بلیط' }: TicketSelectorFieldProps) {
  const selectedTicket = options.find(option => option.id === value.ticketType);

  return (
    <div className="ticket-selector space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="space-y-3">
        {options.map((ticket) => (
          <div
            key={ticket.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              value.ticketType === ticket.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => onChange({ ...value, ticketType: ticket.id })}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{ticket.name}</h3>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {ticket.price.toLocaleString()} تومان
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.description}</p>
              </div>
              <div className="ml-4">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  value.ticketType === ticket.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {value.ticketType === ticket.id && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">تعداد بلیط:</span>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => onChange({ ...value, quantity: Math.max(1, value.quantity - 1) })}
                disabled={value.quantity <= 1}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                {value.quantity}
              </span>
              <button
                type="button"
                onClick={() => onChange({ ...value, quantity: value.quantity + 1 })}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            قیمت کل: {(selectedTicket.price * value.quantity).toLocaleString()} تومان
          </div>
        </div>
      )}
    </div>
  );
} 