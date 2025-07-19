'use client';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from '@/lib/currency-context';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
    >
      {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
        <option key={code} value={code}>
          {info.symbol} {code} - {info.name}
        </option>
      ))}
    </select>
  );
} 