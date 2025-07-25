'use client';
import { useState } from 'react';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'IRR', symbol: 'ریال', name: 'Iranian Rial' },
];

export default function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  return (
    <select
      className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900"
      value={selectedCurrency}
      onChange={(e) => setSelectedCurrency(e.target.value)}
    >
      {currencies.map(currency => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} {currency.code}
        </option>
      ))}
    </select>
  );
} 