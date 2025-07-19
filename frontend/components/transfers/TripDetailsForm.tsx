/**
 * Trip Details Form Component
 * 
 * Form for collecting trip details for transfers
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const tripDetailsSchema = z.object({
  pickup_date: z.string().min(1, 'Pickup date is required'),
  pickup_time: z.string().min(1, 'Pickup time is required'),
  pickup_address: z.string().min(10, 'Pickup address must be at least 10 characters'),
  dropoff_address: z.string().min(10, 'Dropoff address must be at least 10 characters'),
  passengers: z.number().min(1, 'At least 1 passenger is required').max(20, 'Maximum 20 passengers'),
  luggage_pieces: z.number().min(0, 'Luggage pieces cannot be negative').max(20, 'Maximum 20 luggage pieces'),
  special_requests: z.string().optional(),
  flight_number: z.string().optional(),
  return_trip: z.boolean().default(false),
  return_date: z.string().optional(),
  return_time: z.string().optional(),
});

type TripDetailsFormData = z.infer<typeof tripDetailsSchema>;

interface TripDetailsFormProps {
  onSubmit: (data: TripDetailsFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<TripDetailsFormData>;
}

export default function TripDetailsForm({ 
  onSubmit, 
  isLoading = false,
  initialData = {}
}: TripDetailsFormProps) {
  const t = useTranslations('tripDetailsForm');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<TripDetailsFormData>({
    resolver: zodResolver(tripDetailsSchema),
    defaultValues: {
      passengers: 1,
      luggage_pieces: 0,
      return_trip: false,
      ...initialData,
    },
    mode: 'onChange',
  });

  const returnTrip = watch('return_trip');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-neutral-600">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Pickup Details */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              {t('pickupDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('pickupDate')}
                type="date"
                {...register('pickup_date')}
                error={errors.pickup_date?.message}
                required
              />
              <Input
                label={t('pickupTime')}
                type="time"
                {...register('pickup_time')}
                error={errors.pickup_time?.message}
                required
              />
            </div>
            <div className="mt-4">
              <Input
                label={t('pickupAddress')}
                {...register('pickup_address')}
                error={errors.pickup_address?.message}
                required
              />
            </div>
          </div>

          {/* Dropoff Details */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              {t('dropoffDetails')}
            </h3>
            <div className="space-y-4">
              <Input
                label={t('dropoffAddress')}
                {...register('dropoff_address')}
                error={errors.dropoff_address?.message}
                required
              />
              <Input
                label={t('flightNumber')}
                {...register('flight_number')}
                error={errors.flight_number?.message}
                placeholder={t('flightNumberPlaceholder')}
              />
            </div>
          </div>

          {/* Passenger and Luggage */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              {t('passengerInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('passengers')} *
                </label>
                <input
                  type="number"
                  {...register('passengers', { valueAsNumber: true })}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.passengers && (
                  <p className="text-sm text-error-600 mt-1">{errors.passengers.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  {t('luggagePieces')}
                </label>
                <input
                  type="number"
                  {...register('luggage_pieces', { valueAsNumber: true })}
                  min="0"
                  max="20"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.luggage_pieces && (
                  <p className="text-sm text-error-600 mt-1">{errors.luggage_pieces.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Return Trip */}
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('return_trip')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label className="text-sm font-medium text-neutral-700">
                {t('returnTrip')}
              </label>
            </div>
            
            {returnTrip && (
              <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                <h4 className="text-sm font-medium text-neutral-700 mb-3">
                  {t('returnTripDetails')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('returnDate')}
                    type="date"
                    {...register('return_date')}
                    error={errors.return_date?.message}
                  />
                  <Input
                    label={t('returnTime')}
                    type="time"
                    {...register('return_time')}
                    error={errors.return_time?.message}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              {t('additionalInfo')}
            </h3>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t('specialRequests')}
              </label>
              <textarea
                {...register('special_requests')}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('specialRequestsPlaceholder')}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              loading={isLoading}
              size="lg"
            >
              {t('continue')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 