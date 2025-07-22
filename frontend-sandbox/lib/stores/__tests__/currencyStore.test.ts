import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { useCurrencyStore } from '../currencyStore';

describe('CurrencyStore', () => {
  it('has default currency USD', () => {
    const { result } = renderHook(() => useCurrencyStore());
    expect(result.current.currentCurrency).toBe('USD');
  });

  it('can set currency', async () => {
    const { result } = renderHook(() => useCurrencyStore());
    await act(async () => {
      await result.current.setCurrency('EUR');
    });
    expect(result.current.currentCurrency).toBe('EUR');
  });
}); 