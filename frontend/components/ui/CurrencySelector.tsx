'use client';
import { useCurrency } from '@/lib/contexts/AppContext';
import { Currency } from '@/lib/domain/value-objects/Currency';

export default function CurrencySelector() {
  const { currentCurrency, setCurrency } = useCurrency();

  const handleCurrencyChange = (currencyCode: string) => {
    const newCurrency = Currency.create(currencyCode);
    setCurrency(newCurrency);
  };

  return (
    <select
      className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={currentCurrency.getCode()}
      onChange={(e) => handleCurrencyChange(e.target.value)}
    >
      <option value="USD">$ USD - US Dollar</option>
      <option value="EUR">€ EUR - Euro</option>
      <option value="GBP">£ GBP - British Pound</option>
      <option value="IRR">ریال IRR - Iranian Rial</option>
    </select>
  );
} 