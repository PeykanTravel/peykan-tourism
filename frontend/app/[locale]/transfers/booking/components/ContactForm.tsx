'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { MapPin, User, Phone, MessageSquare } from 'lucide-react';

interface ContactFormProps {
  onSubmit: (data: {
    pickup_address: string;
    dropoff_address: string;
    contact_name: string;
    contact_phone: string;
    special_requirements: string;
  }) => void;
  onBack: () => void;
  initialData?: {
    pickup_address: string;
    dropoff_address: string;
    contact_name: string;
    contact_phone: string;
    special_requirements: string;
  };
}

export default function ContactForm({ onSubmit, onBack, initialData }: ContactFormProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('transfers');
  
  const [formData, setFormData] = useState({
    pickup_address: initialData?.pickup_address || '',
    dropoff_address: initialData?.dropoff_address || '',
    contact_name: initialData?.contact_name || '',
    contact_phone: initialData?.contact_phone || '',
    special_requirements: initialData?.special_requirements || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickup_address.trim()) {
      newErrors.pickup_address = t('pickupAddressRequired');
    }

    if (!formData.dropoff_address.trim()) {
      newErrors.dropoff_address = t('dropoffAddressRequired');
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = t('contactNameRequired');
    }

    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = t('contactPhoneRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('contactInformation')}
        </h2>
        <p className="text-gray-600">
          {t('step6')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pickupAddress')} *
          </label>
          <div className="relative">
            <input
              type="text"
              name="pickup_address"
              value={formData.pickup_address}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.pickup_address ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('enterPickupAddress')}
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.pickup_address && (
            <p className="mt-1 text-sm text-red-600">{errors.pickup_address}</p>
          )}
        </div>

        {/* Dropoff Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dropoffAddress')} *
          </label>
          <div className="relative">
            <input
              type="text"
              name="dropoff_address"
              value={formData.dropoff_address}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dropoff_address ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('enterDropoffAddress')}
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.dropoff_address && (
            <p className="mt-1 text-sm text-red-600">{errors.dropoff_address}</p>
          )}
        </div>

        {/* Contact Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('contactName')} *
          </label>
          <div className="relative">
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.contact_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('enterContactName')}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.contact_name && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_name}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('contactPhone')} *
          </label>
          <div className="relative">
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.contact_phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('enterContactPhone')}
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.contact_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>
          )}
        </div>

        {/* Special Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('specialRequirements')}
          </label>
          <div className="relative">
            <textarea
              name="special_requirements"
              value={formData.special_requirements}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('enterSpecialRequirements')}
            />
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {t('specialRequirementsHelp')}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('previous')}
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('next')}
          </button>
        </div>
      </form>
    </div>
  );
} 