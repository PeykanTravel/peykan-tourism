import { useLocale } from 'next-intl';

// Utility function to get RTL-aware text alignment
export function getTextAlign(isRTL: boolean, defaultAlign: 'left' | 'right' | 'center' = 'left') {
  if (isRTL) {
    return defaultAlign === 'left' ? 'right' : defaultAlign === 'right' ? 'left' : 'center';
  }
  return defaultAlign;
}

// Utility function to get RTL-aware flex direction
export function getFlexDirection(isRTL: boolean, defaultDirection: 'row' | 'row-reverse' = 'row') {
  if (isRTL) {
    return defaultDirection === 'row' ? 'row-reverse' : 'row';
  }
  return defaultDirection;
}

// Utility function to get RTL-aware margin/padding
export function getSpacing(isRTL: boolean, leftValue: string, rightValue: string) {
  return isRTL ? { marginRight: leftValue, marginLeft: rightValue } : { marginLeft: leftValue, marginRight: rightValue };
}

// Hook for RTL-aware styling
export function useRTLStyles() {
  const locale = useLocale();
  const isRTL = locale === 'fa';

  return {
    isRTL,
    textAlign: (defaultAlign: 'left' | 'right' | 'center' = 'left') => getTextAlign(isRTL, defaultAlign),
    flexDirection: (defaultDirection: 'row' | 'row-reverse' = 'row') => getFlexDirection(isRTL, defaultDirection),
    spacing: (leftValue: string, rightValue: string) => getSpacing(isRTL, leftValue, rightValue),
    className: {
      text: isRTL ? 'text-right' : 'text-left',
      flex: isRTL ? 'flex-row-reverse' : 'flex-row',
      margin: isRTL ? 'mr-4' : 'ml-4',
      padding: isRTL ? 'pr-4' : 'pl-4',
    }
  };
} 