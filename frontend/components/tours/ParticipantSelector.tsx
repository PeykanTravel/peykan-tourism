/**
 * Participant Selector Component
 * 
 * Component for selecting number of participants for tours
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Plus, Minus, User, Baby, Child } from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ParticipantCounts {
  adults: number;
  children: number;
  infants: number;
}

interface ParticipantSelectorProps {
  maxParticipants: number;
  onParticipantsChange: (counts: ParticipantCounts) => void;
  initialCounts?: ParticipantCounts;
}

export default function ParticipantSelector({
  maxParticipants,
  onParticipantsChange,
  initialCounts = { adults: 1, children: 0, infants: 0 },
}: ParticipantSelectorProps) {
  const t = useTranslations('participantSelector');
  const [counts, setCounts] = useState<ParticipantCounts>(initialCounts);

  const totalParticipants = counts.adults + counts.children + counts.infants;

  const updateCounts = (newCounts: ParticipantCounts) => {
    setCounts(newCounts);
    onParticipantsChange(newCounts);
  };

  const handleIncrement = (type: keyof ParticipantCounts) => {
    if (totalParticipants >= maxParticipants) return;

    const newCounts = { ...counts };
    newCounts[type] += 1;
    updateCounts(newCounts);
  };

  const handleDecrement = (type: keyof ParticipantCounts) => {
    const newCounts = { ...counts };
    
    if (type === 'adults' && newCounts.adults <= 1) return;
    if (newCounts[type] <= 0) return;

    newCounts[type] -= 1;
    updateCounts(newCounts);
  };

  const participantTypes = [
    {
      key: 'adults' as keyof ParticipantCounts,
      label: t('adults'),
      description: t('adultsDescription'),
      icon: User,
      minCount: 1,
    },
    {
      key: 'children' as keyof ParticipantCounts,
      label: t('children'),
      description: t('childrenDescription'),
      icon: Child,
      minCount: 0,
    },
    {
      key: 'infants' as keyof ParticipantCounts,
      label: t('infants'),
      description: t('infantsDescription'),
      icon: Baby,
      minCount: 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>{t('title')}</span>
        </CardTitle>
        <p className="text-sm text-neutral-600">
          {t('description', { maxParticipants })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participantTypes.map(({ key, label, description, icon: Icon, minCount }) => {
            const count = counts[key];
            const canDecrement = count > minCount;
            const canIncrement = totalParticipants < maxParticipants;

            return (
              <div key={key} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Icon className="h-5 w-5 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">{label}</h4>
                    <p className="text-sm text-neutral-600">{description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDecrement(key)}
                    disabled={!canDecrement}
                    className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium text-lg">
                    {count}
                  </span>
                  
                  <button
                    onClick={() => handleIncrement(key)}
                    disabled={!canIncrement}
                    className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-neutral-700">{t('summary')}</h4>
            <span className="text-sm text-neutral-500">
              {totalParticipants} / {maxParticipants} {t('participants')}
            </span>
          </div>
          
          <div className="space-y-2">
            {counts.adults > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('adults')} × {counts.adults}</span>
                <span>{t('free')}</span>
              </div>
            )}
            {counts.children > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('children')} × {counts.children}</span>
                <span>{t('free')}</span>
              </div>
            )}
            {counts.infants > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('infants')} × {counts.infants}</span>
                <span>{t('free')}</span>
              </div>
            )}
          </div>

          {totalParticipants >= maxParticipants && (
            <div className="mt-3 p-2 bg-warning-50 border border-warning-200 rounded text-sm text-warning-700">
              {t('maxParticipantsReached')}
            </div>
          )}
        </div>

        {/* Age Guidelines */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-700 mb-2">
            {t('ageGuidelines')}
          </h4>
          <div className="space-y-1 text-sm text-blue-600">
            <p>• {t('adultsAge')}</p>
            <p>• {t('childrenAge')}</p>
            <p>• {t('infantsAge')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 