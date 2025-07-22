'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedCard, TourCard, EventCard, TransferCard } from '../ui/AdvancedCard';
import { AdvancedSelect, AdvancedCheckbox, AdvancedNumberInput } from '../ui/AdvancedForm';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Car, 
  Ticket, 
  Star,
  Clock,
  Navigation,
  Wifi,
  Coffee,
  Camera,
  Shield,
  Heart,
  Share2,
  Eye
} from 'lucide-react';

// ===== تور - UI مدرن و پیشرفته =====
export function ModernTourSpecificUI({ data, onSelect }: any) {
  const [selectedVariant, setSelectedVariant] = useState(data.selectedVariant);
  const [selectedSchedule, setSelectedSchedule] = useState(data.selectedSchedule);
  const [hoveredVariant, setHoveredVariant] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">انتخاب پکیج سفر</h2>
            <p className="text-blue-100">پکیج مورد نظر خود را انتخاب کنید</p>
          </div>
        </div>
        
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
        >
          <Star className="w-6 h-6 text-white" />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-4 left-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
        >
          <MapPin className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      {/* انتخاب پکیج با کارت‌های 3D */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            انتخاب پکیج
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.variants?.map((variant: any, index: number) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredVariant(variant.id)}
              onHoverEnd={() => setHoveredVariant(null)}
            >
              <AdvancedCard
                variant="3d"
                hoverEffect="lift"
                animation="slideUp"
                interactive
                onClick={() => {
                  setSelectedVariant(variant.id);
                  onSelect('variant', variant.id);
                }}
                className={`relative overflow-hidden ${
                  selectedVariant === variant.id 
                    ? 'ring-2 ring-blue-500 shadow-xl' 
                    : ''
                }`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500" />
                </div>
                
                <div className="relative z-10 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {variant.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      {variant.features?.slice(0, 2).map((_: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {variant.base_price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      تومان
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    {variant.features?.map((feature: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Capacity */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ظرفیت
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {variant.capacity} نفر
                    </span>
                  </div>
                </div>
                
                {/* Hover overlay */}
                <AnimatePresence>
                  {hoveredVariant === variant.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"
                    />
                  )}
                </AnimatePresence>
              </AdvancedCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* تقویم مدرن برای انتخاب تاریخ */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            انتخاب تاریخ سفر
          </h3>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.schedules?.map((schedule: any, index: number) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedSchedule === schedule.id
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  onClick={() => {
                    setSelectedSchedule(schedule.id);
                    onSelect('schedule', schedule.id);
                  }}
                >
                  {/* Date */}
                  <div className="text-center mb-4">
                    <div className={`text-2xl font-bold ${
                      selectedSchedule === schedule.id ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {new Date(schedule.date).getDate()}
                    </div>
                    <div className={`text-sm ${
                      selectedSchedule === schedule.id ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {new Date(schedule.date).toLocaleDateString('fa-IR', { month: 'long' })}
                    </div>
                  </div>
                  
                  {/* Time */}
                  <div className="text-center mb-4">
                    <div className={`text-lg font-semibold ${
                      selectedSchedule === schedule.id ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {schedule.time}
                    </div>
                    <div className={`text-sm ${
                      selectedSchedule === schedule.id ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      زمان حرکت
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div className="text-center">
                    <div className={`text-sm ${
                      selectedSchedule === schedule.id ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {schedule.available_capacity} نفر موجود
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(schedule.available_capacity / schedule.total_capacity) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedSchedule === schedule.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== رویداد - UI مدرن و پیشرفته =====
export function ModernEventSpecificUI({ data, onSelect }: any) {
  const [selectedTicketType, setSelectedTicketType] = useState(data.selectedTicketType);
  const [selectedSeats, setSelectedSeats] = useState(data.selectedSeats || []);
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

  const handleSeatClick = (seatNumber: number) => {
    const newSeats = selectedSeats.includes(seatNumber)
      ? selectedSeats.filter((s: number) => s !== seatNumber)
      : [...selectedSeats, seatNumber];
    
    setSelectedSeats(newSeats);
    onSelect('seats', newSeats);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">انتخاب بلیط و صندلی</h2>
            <p className="text-purple-100">بلیط و صندلی مورد نظر خود را انتخاب کنید</p>
          </div>
        </div>
        
        {/* Floating elements */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
        >
          <Ticket className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* نقشه صندلی تعاملی */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Ticket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            انتخاب صندلی
          </h3>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
          {/* Stage */}
          <div className="text-center mb-8">
            <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2" />
            <div className="text-sm text-gray-500 dark:text-gray-400">صحنه</div>
          </div>
          
          {/* Seat Map */}
          <div className="grid grid-cols-10 gap-2 mb-6">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                onHoverStart={() => setHoveredSeat(i)}
                onHoverEnd={() => setHoveredSeat(null)}
              >
                <div
                  className={`w-8 h-8 rounded cursor-pointer transition-all duration-300 relative ${
                    selectedSeats.includes(i)
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-purple-300 dark:hover:bg-purple-600'
                  }`}
                  onClick={() => handleSeatClick(i)}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </div>
                  
                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {hoveredSeat === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-20"
                      >
                        صندلی {i + 1}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <span className="text-gray-600 dark:text-gray-400">خالی</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded" />
              <span className="text-gray-600 dark:text-gray-400">انتخاب شده</span>
            </div>
          </div>
        </div>
      </div>

      {/* انتخاب نوع بلیط */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            انتخاب نوع بلیط
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.ticket_types?.map((ticket: any, index: number) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AdvancedCard
                variant="glassmorphism"
                hoverEffect="glow"
                animation="fadeIn"
                interactive
                onClick={() => {
                  setSelectedTicketType(ticket.id);
                  onSelect('ticketType', ticket.id);
                }}
                className={`relative ${
                  selectedTicketType === ticket.id 
                    ? 'ring-2 ring-purple-500 shadow-xl' 
                    : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {ticket.name}
                    </h4>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {ticket.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      تومان
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {ticket.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    {ticket.features?.map((feature: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Selection indicator */}
                {selectedTicketType === ticket.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </motion.div>
                )}
              </AdvancedCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== ترانسفر - UI مدرن و پیشرفته =====
export function ModernTransferSpecificUI({ data, onSelect }: any) {
  const [selectedRoute, setSelectedRoute] = useState(data.selectedRoute);
  const [selectedVehicle, setSelectedVehicle] = useState(data.selectedVehicle);
  const [tripType, setTripType] = useState(data.tripType || 'oneway');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">انتخاب مسیر و خودرو</h2>
            <p className="text-green-100">مسیر و نوع خودرو مورد نظر خود را انتخاب کنید</p>
          </div>
        </div>
        
        {/* Floating elements */}
        <motion.div
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
        >
          <Navigation className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* نقشه مسیر تعاملی */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            انتخاب مسیر
          </h3>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.routes?.map((route: any, index: number) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedRoute === route.id
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  onClick={() => {
                    setSelectedRoute(route.id);
                    onSelect('route', route.id);
                  }}
                >
                  {/* Route visualization */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedRoute === route.id 
                          ? 'bg-white text-green-500' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        <span className="font-bold">A</span>
                      </div>
                      <div className={`text-sm ${
                        selectedRoute === route.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {route.origin}
                      </div>
                    </div>
                    
                    <div className="flex-1 mx-4">
                      <div className={`h-px relative ${
                        selectedRoute === route.id ? 'bg-white' : 'bg-green-300'
                      }`}>
                        <motion.div
                          animate={{ x: [0, 100, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${
                            selectedRoute === route.id ? 'bg-white' : 'bg-green-500'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`text-sm ${
                        selectedRoute === route.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {route.destination}
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedRoute === route.id 
                          ? 'bg-white text-green-500' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        <span className="font-bold">B</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        selectedRoute === route.id ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        {route.base_price.toLocaleString()}
                      </div>
                      <div className={`text-sm ${
                        selectedRoute === route.id ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        تومان
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-sm ${
                        selectedRoute === route.id ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        مدت زمان
                      </div>
                      <div className={`font-semibold ${
                        selectedRoute === route.id ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        {route.duration}
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedRoute === route.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* انتخاب نوع خودرو */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            انتخاب نوع خودرو
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.vehicle_types?.map((vehicle: any, index: number) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AdvancedCard
                variant="3d"
                hoverEffect="rotate"
                animation="slideIn"
                interactive
                onClick={() => {
                  setSelectedVehicle(vehicle.id);
                  onSelect('vehicle', vehicle.id);
                }}
                className={`relative ${
                  selectedVehicle === vehicle.id 
                    ? 'ring-2 ring-green-500 shadow-xl' 
                    : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Vehicle Icon */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Car className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {vehicle.name}
                    </h4>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">ظرفیت:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {vehicle.capacity} نفر
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">ضریب قیمت:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {vehicle.price_multiplier}x
                      </span>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-1">
                    {vehicle.features?.map((feature: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Selection indicator */}
                {selectedVehicle === vehicle.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </motion.div>
                )}
              </AdvancedCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* انتخاب رفت و برگشت */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
            <Navigation className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            نوع سفر
          </h3>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                  tripType === 'oneway'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
                onClick={() => {
                  setTripType('oneway');
                  onSelect('tripType', 'oneway');
                }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Navigation className="w-6 h-6" />
                </div>
                <div className="font-bold text-lg mb-1">فقط رفت</div>
                <div className="text-sm opacity-80">یک طرفه</div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`p-6 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                  tripType === 'roundtrip'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
                onClick={() => {
                  setTripType('roundtrip');
                  onSelect('tripType', 'roundtrip');
                }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="relative">
                    <Navigation className="w-6 h-6" />
                    <Navigation className="w-6 h-6 absolute top-0 left-0 rotate-180" />
                  </div>
                </div>
                <div className="font-bold text-lg mb-1">رفت و برگشت</div>
                <div className="text-sm opacity-80">دو طرفه</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== کامپوننت اصلی برای انتخاب محصول =====
export function ModernProductSpecificSelector({ productType, data, onSelect }: any) {
  switch (productType) {
    case 'tour':
      return <ModernTourSpecificUI data={data} onSelect={onSelect} />;
    case 'event':
      return <ModernEventSpecificUI data={data} onSelect={onSelect} />;
    case 'transfer':
      return <ModernTransferSpecificUI data={data} onSelect={onSelect} />;
    default:
      return <div>محصول نامعتبر</div>;
  }
} 