'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface BookingStepsProps {
  step: number;
  totalSteps: number;
  children: React.ReactNode;
}

export default function BookingSteps({ step, totalSteps, children }: BookingStepsProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('transfers');

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{t('step')} {step} {t('of')} {totalSteps}</span>
        <div className="w-full h-2 bg-gray-200 rounded-full mx-4">
          <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
} 