/**
 * Customer Info Form Component
 * 
 * Form for collecting customer information during reservation
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const customerInfoSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postal_code: z.string().min(5, 'Please enter a valid postal code'),
  country: z.string().min(2, 'Please select a country'),
  special_requests: z.string().optional(),
  newsletter: z.boolean().default(false),
  terms_accepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;

interface CustomerInfoFormProps {
  onSubmit: (data: CustomerInfoFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<CustomerInfoFormData>;
}

export default function CustomerInfoForm({ 
  onSubmit, 
  isLoading = false,
  initialData = {}
}: CustomerInfoFormProps) {
  const t = useTranslations('customerInfoForm');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      newsletter: false,
      terms_accepted: false,
      ...initialData,
    },
    mode: 'onChange',
  });

  const watchedTerms = watch('terms_accepted');

  const countries = [
    { code: 'IR', name: 'Iran' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'RO', name: 'Romania' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'HR', name: 'Croatia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LV', name: 'Latvia' },
    { code: 'EE', name: 'Estonia' },
    { code: 'IE', name: 'Ireland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GR', name: 'Greece' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'MT', name: 'Malta' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'IS', name: 'Iceland' },
    { code: 'TR', name: 'Turkey' },
    { code: 'RU', name: 'Russia' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'BY', name: 'Belarus' },
    { code: 'MD', name: 'Moldova' },
    { code: 'GE', name: 'Georgia' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'AF', name: 'Afghanistan' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'IN', name: 'India' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'NP', name: 'Nepal' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'MV', name: 'Maldives' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'KP', name: 'North Korea' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'MO', name: 'Macau' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'LA', name: 'Laos' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'PH', name: 'Philippines' },
    { code: 'BN', name: 'Brunei' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'TL', name: 'East Timor' },
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'WS', name: 'Samoa' },
    { code: 'TO', name: 'Tonga' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'NR', name: 'Nauru' },
    { code: 'PW', name: 'Palau' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'NU', name: 'Niue' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'GU', name: 'Guam' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'VI', name: 'U.S. Virgin Islands' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'VG', name: 'British Virgin Islands' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'DM', name: 'Dominica' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'BB', name: 'Barbados' },
    { code: 'GD', name: 'Grenada' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'CU', name: 'Cuba' },
    { code: 'HT', name: 'Haiti' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'MX', name: 'Mexico' },
    { code: 'BZ', name: 'Belize' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'HN', name: 'Honduras' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'PA', name: 'Panama' },
    { code: 'CO', name: 'Colombia' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'GY', name: 'Guyana' },
    { code: 'SR', name: 'Suriname' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'BR', name: 'Brazil' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'PE', name: 'Peru' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'FK', name: 'Falkland Islands' },
    { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'AQ', name: 'Antarctica' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'NA', name: 'Namibia' },
    { code: 'BW', name: 'Botswana' },
    { code: 'ZW', name: 'Zimbabwe' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CD', name: 'Democratic Republic of the Congo' },
    { code: 'CG', name: 'Republic of the Congo' },
    { code: 'GA', name: 'Gabon' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ST', name: 'São Tomé and Príncipe' },
    { code: 'AO', name: 'Angola' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GN', name: 'Guinea' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'LR', name: 'Liberia' },
    { code: 'CI', name: 'Ivory Coast' },
    { code: 'GH', name: 'Ghana' },
    { code: 'TG', name: 'Togo' },
    { code: 'BJ', name: 'Benin' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NE', name: 'Niger' },
    { code: 'TD', name: 'Chad' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'SO', name: 'Somalia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'RE', name: 'Réunion' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'IO', name: 'British Indian Ocean Territory' },
    { code: 'SH', name: 'Saint Helena' },
    { code: 'AC', name: 'Ascension Island' },
    { code: 'TA', name: 'Tristan da Cunha' },
    { code: 'CV', name: 'Cape Verde' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'ML', name: 'Mali' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'SN', name: 'Senegal' },
    { code: 'GM', name: 'Gambia' },
    { code: 'EH', name: 'Western Sahara' },
    { code: 'MA', name: 'Morocco' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'LY', name: 'Libya' },
    { code: 'EG', name: 'Egypt' },
    { code: 'IL', name: 'Israel' },
    { code: 'PS', name: 'Palestine' },
    { code: 'JO', name: 'Jordan' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'SY', name: 'Syria' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'YE', name: 'Yemen' },
    { code: 'OM', name: 'Oman' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'QA', name: 'Qatar' },
    { code: 'BH', name: 'Bahrain' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-neutral-600">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              {t('personalInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('firstName')}
                {...register('first_name')}
                error={errors.first_name?.message}
                required
              />
              <Input
                label={t('lastName')}
                {...register('last_name')}
                error={errors.last_name?.message}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label={t('email')}
                type="email"
                {...register('email')}
                error={errors.email?.message}
                required
              />
              <Input
                label={t('phone')}
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                required
              />
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              {t('addressInfo')}
            </h3>
            <div className="space-y-4">
              <Input
                label={t('address')}
                {...register('address')}
                error={errors.address?.message}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={t('city')}
                  {...register('city')}
                  error={errors.city?.message}
                  required
                />
                <Input
                  label={t('postalCode')}
                  {...register('postal_code')}
                  error={errors.postal_code?.message}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t('country')} *
                  </label>
                  <select
                    {...register('country')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">{t('selectCountry')}</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-sm text-error-600 mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              {t('additionalInfo')}
            </h3>
            <div className="space-y-4">
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
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('newsletter')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label className="text-sm text-neutral-700">
                  {t('newsletter')}
                </label>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-t pt-6">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                {...register('terms_accepted')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded mt-1"
              />
              <label className="text-sm text-neutral-700">
                {t('termsAcceptance')}{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-700 underline">
                  {t('termsLink')}
                </a>
              </label>
            </div>
            {errors.terms_accepted && (
              <p className="text-sm text-error-600 mt-1">{errors.terms_accepted.message}</p>
            )}
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