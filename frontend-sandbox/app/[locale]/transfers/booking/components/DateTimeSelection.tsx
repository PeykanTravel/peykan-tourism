'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, ArrowRight, ArrowLeft, Plane, PlaneTakeoff } from 'lucide-react';
import { useTransferBookingStore } from '@/lib/stores/transferBookingStore';
import Select, { components, OptionProps } from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimeSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export default function DateTimeSelection({ onNext, onBack }: DateTimeSelectionProps) {
  const t = useTranslations('transfers');
  
  // Get booking state from store
  const {
    trip_type,
    outbound_date,
    outbound_time,
    return_date,
    return_time,
    setTripType,
    setDateTime,
    isStepValid,
  } = useTransferBookingStore();

  // Local state for form inputs
  const [localOutboundDate, setLocalOutboundDate] = useState(outbound_date || '');
  const [localOutboundTime, setLocalOutboundTime] = useState(outbound_time || '');
  const [localReturnDate, setLocalReturnDate] = useState(return_date || '');
  const [localReturnTime, setLocalReturnTime] = useState(return_time || '');

  // Handle trip type change
  const handleTripTypeChange = (newTripType: 'one_way' | 'round_trip') => {
    setTripType(newTripType);
    if (newTripType === 'one_way') {
      setLocalReturnDate('');
      setLocalReturnTime('');
    }
  };

  // Handle outbound date/time change
  const handleOutboundChange = (date: string, time: string) => {
    setLocalOutboundDate(date);
    setLocalOutboundTime(time);
    setDateTime(date, time, false);
  };

  // Handle return date/time change
  const handleReturnChange = (date: string, time: string) => {
    setLocalReturnDate(date);
    setLocalReturnTime(time);
    setDateTime(date, time, true);
  };

  // Handle next step
  const handleNext = () => {
    if (isStepValid('datetime')) {
      onNext();
    }
  };

  // Check if form is valid
  const isValid = isStepValid('datetime');

  // Get minimum date (today) - with timezone fix
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get minimum date for return (outbound date or today, whichever is later)
  const getMinReturnDate = () => {
    if (localOutboundDate) {
      return localOutboundDate;
    }
    return getMinDate();
  };

  // Get minimum time with 2-hour buffer for today
  const getMinTime = (date: string, isReturn: boolean = false) => {
    // Get today's date in local timezone
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const isToday = date === todayStr;
    
    if (isToday) {
      const now = new Date();
      // Add 2 hours buffer
      now.setHours(now.getHours() + 2);
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // For return time, if same date as outbound, ensure it's after outbound time
    if (isReturn && localOutboundDate && date === localOutboundDate && localOutboundTime) {
      return localOutboundTime;
    }
    
    return '';
  };

  // Validate time selection
  const validateTime = (date: string, time: string, isReturn: boolean = false) => {
    if (!date || !time) return true;
    
    const minTime = getMinTime(date, isReturn);
    if (!minTime) return true;
    
    return time >= minTime;
  };

  // Get validation message for time
  const getTimeValidationMessage = (date: string, isReturn: boolean = false) => {
    if (!date) return '';
    
    // Get today's date in local timezone
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const isToday = date === todayStr;
    
    if (isToday) {
      return t('timeValidationToday');
    }
    
    if (isReturn && localOutboundDate && date === localOutboundDate && localOutboundTime) {
      return t('timeValidationAfterOutbound');
    }
    
    return '';
  };

  // Helper: Generate time slots (every 30 min)
  const generateTimeSlots = () => {
    const slots: { value: string; label: string; surcharge?: { label: string; percent: number; color: string } }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        let surcharge = undefined;
        if ((h >= 7 && h <= 9) || (h >= 17 && h <= 19)) {
          surcharge = { label: t('peakHour'), percent: 10, color: 'bg-orange-100 text-orange-700 border-orange-300' };
        } else if ((h >= 22 && h <= 23) || (h >= 0 && h <= 6)) {
          surcharge = { label: t('midnight'), percent: 5, color: 'bg-purple-100 text-purple-700 border-purple-300' };
        }
        slots.push({ value, label: value, surcharge });
      }
    }
    return slots;
  };

  // Helper: Is time slot allowed (for today or return logic)
  const isTimeSlotAllowed = (date: string, slot: string, isReturn = false) => {
    // Get today's date in local timezone
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (!date) return false;
    
    // Check if date is today
    if (date === todayStr) {
      const now = new Date();
      // Add 2 hours buffer for today
      now.setHours(now.getHours() + 2);
      const minTime = now.toTimeString().slice(0, 5);
      if (slot < minTime) return false;
    }
    
    // For return time validation
    if (isReturn && localOutboundDate && date === localOutboundDate && localOutboundTime) {
      if (slot <= localOutboundTime) return false;
    }
    
    return true;
  };

  // Custom Option for react-select
  const TimeOption = (props: OptionProps<any>) => {
    const { data, isSelected, isDisabled } = props;
    return (
      <components.Option {...props}>
        <div className={`flex items-center justify-between ${isSelected ? 'font-bold text-blue-700' : ''} ${isDisabled ? 'opacity-40' : ''}`}>
          <span>{data.label}</span>
          {data.surcharge && (
            <span className={`ml-2 px-2 py-0.5 rounded text-xs border font-bold ${data.surcharge.color}`}>{data.surcharge.label} +{data.surcharge.percent}%</span>
          )}
        </div>
      </components.Option>
    );
  };

  // Outbound Time Dropdown with react-select
  const renderTimeDropdown = (date: string, selectedTime: string, onSelect: (time: string) => void, isReturn = false) => {
    const slots = generateTimeSlots().filter(slot => isTimeSlotAllowed(date, slot.value, isReturn));
    return (
      <Select
        className="w-full"
        classNamePrefix="react-select"
        options={slots}
        value={slots.find(opt => opt.value === selectedTime) || null}
        onChange={opt => {
          if (opt && typeof opt === 'object' && 'value' in opt) {
            onSelect(opt.value);
          } else {
            onSelect('');
          }
        }}
        isClearable
        placeholder={t('selectTime')}
        components={{ Option: TimeOption }}
        styles={{
          control: (base) => ({ ...base, minHeight: '44px', borderRadius: '0.5rem', borderColor: '#d1d5db' }),
          option: (base, state) => ({ ...base, fontSize: '1rem', padding: '0.5rem 1rem' }),
        }}
        isSearchable={false}
      />
    );
  };

  // Helper: Parse date string to Date object (with timezone fix)
  const parseDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    // Parse date with local timezone to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0); // Use 12 PM to avoid timezone issues
  };
  
  // Helper: Format Date object to yyyy-MM-dd (with timezone fix)
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    // Format date in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Outbound Date Picker
  const renderDatePicker = (selectedDate: string, onChange: (date: string) => void, minDate?: Date | null, maxDate?: Date | null) => (
    <DatePicker
      selected={parseDate(selectedDate)}
      onChange={date => onChange(formatDate(date))}
      minDate={minDate || undefined}
      maxDate={maxDate || undefined}
      dateFormat="yyyy-MM-dd"
      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholderText={t('selectDate')}
      showPopperArrow={false}
      autoComplete="off"
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('selectDateAndTime')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t('step3')}
        </p>
      </div>

      {/* Trip Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('tripType')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => handleTripTypeChange('one_way')}
            className={`
              p-4 border rounded-lg cursor-pointer transition-all
              ${trip_type === 'one_way'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:bg-gray-900'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <Plane className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{t('oneWay')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('oneWayDescription')}</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => handleTripTypeChange('round_trip')}
            className={`
              p-4 border rounded-lg cursor-pointer transition-all
              ${trip_type === 'round_trip'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:bg-gray-900'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <PlaneTakeoff className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{t('roundTrip')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('roundTripDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Outbound Date & Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('outboundDate')} & {t('outboundTime')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('date')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {renderDatePicker(localOutboundDate, (date) => handleOutboundChange(date, localOutboundTime), new Date())}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('time')}
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {renderTimeDropdown(localOutboundDate, localOutboundTime, (time) => handleOutboundChange(localOutboundDate, time))}
            </div>
            {localOutboundDate && localOutboundTime && !validateTime(localOutboundDate, localOutboundTime) && (
              <p className="mt-1 text-sm text-red-600">
                {getTimeValidationMessage(localOutboundDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Return Date & Time (for round trip) */}
      {trip_type === 'round_trip' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('returnDate')} & {t('returnTime')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('date')}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {renderDatePicker(localReturnDate, (date) => handleReturnChange(date, localReturnTime), localOutboundDate ? parseDate(localOutboundDate) : new Date())}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('time')}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {renderTimeDropdown(localReturnDate, localReturnTime, (time) => handleReturnChange(localReturnDate, time), true)}
              </div>
              {localReturnDate && localReturnTime && !validateTime(localReturnDate, localReturnTime, true) && (
                <p className="mt-1 text-sm text-red-600">
                  {getTimeValidationMessage(localReturnDate, true)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('previous')}
          </button>
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
              ${isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {t('next')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}