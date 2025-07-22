'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

interface AdvancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glassmorphism' | 'gradient' | '3d';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'rotate';
  animation?: 'fadeIn' | 'slideUp' | 'slideIn' | 'bounce';
  delay?: number;
  onClick?: () => void;
  interactive?: boolean;
}

export function AdvancedCard({
  children,
  className = '',
  variant = 'default',
  hoverEffect = 'lift',
  animation = 'fadeIn',
  delay = 0,
  onClick,
  interactive = false
}: AdvancedCardProps) {
  // Animation variants
  const animationVariants = {
    fadeIn: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    slideUp: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.8, ease: 'easeOut' }
    },
    slideIn: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    bounce: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const animationIn = {
    fadeIn: { opacity: 1, y: 0 },
    slideUp: { opacity: 1, y: 0 },
    slideIn: { opacity: 1, x: 0 },
    bounce: { opacity: 1, scale: 1 }
  };

  // Hover variants
  const hoverVariants = {
    lift: {
      y: -8,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    glow: {
      boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    scale: {
      scale: 1.05,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    rotate: {
      rotateY: 5,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'glassmorphism':
        return 'backdrop-blur-md bg-white/10 border border-white/20 shadow-xl';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/20';
      case '3d':
        return 'bg-white shadow-2xl transform-gpu perspective-1000';
      default:
        return 'bg-white dark:bg-gray-800 shadow-lg';
    }
  };

  const baseClasses = `
    relative overflow-hidden rounded-xl transition-all duration-300
    ${getVariantStyles()}
    ${interactive ? 'cursor-pointer' : ''}
    ${className}
  `;

  return (
    <motion.div
      initial={animationVariants[animation]}
      animate={animationIn[animation]}
      whileHover={interactive ? hoverVariants[hoverEffect] : {}}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      onClick={onClick}
      className={baseClasses}
    >
      {/* Gradient overlay for glassmorphism */}
      {variant === 'glassmorphism' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      )}
      
      {/* 3D effect overlay */}
      {variant === '3d' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Shine effect on hover */}
      {interactive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}

// Specialized card components
export function TourCard({ tour, onClick }: { tour: any; onClick?: () => void }) {
  return (
    <AdvancedCard
      variant="gradient"
      hoverEffect="lift"
      animation="slideUp"
      interactive
      onClick={onClick}
      className="group"
    >
      <div className="space-y-4">
        {/* Image */}
        <div className="relative h-48 rounded-lg overflow-hidden">
          <img
            src={tour.image || '/images/default-tour.jpg'}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <div className="text-sm opacity-80">{tour.location}</div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {tour.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
            {tour.short_description}
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {tour.features?.slice(0, 3).map((feature: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tour.base_price?.toLocaleString()} تومان
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {tour.duration}
            </div>
          </div>
        </div>
      </div>
    </AdvancedCard>
  );
}

export function EventCard({ event, onClick }: { event: any; onClick?: () => void }) {
  return (
    <AdvancedCard
      variant="glassmorphism"
      hoverEffect="glow"
      animation="fadeIn"
      interactive
      onClick={onClick}
      className="group"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              رویداد
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {event.date}
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
          {event.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
          {event.description}
        </p>
        
        {/* Venue */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span>{event.venue}</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {event.price?.toLocaleString()} تومان
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {event.time}
          </div>
        </div>
      </div>
    </AdvancedCard>
  );
}

export function TransferCard({ transfer, onClick }: { transfer: any; onClick?: () => void }) {
  return (
    <AdvancedCard
      variant="3d"
      hoverEffect="rotate"
      animation="slideIn"
      interactive
      onClick={onClick}
      className="group"
    >
      <div className="space-y-4">
        {/* Route */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-bold">A</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {transfer.origin}
            </div>
          </div>
          
          <div className="flex-1 mx-4">
            <div className="h-px bg-gradient-to-r from-green-200 to-green-400 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {transfer.destination}
            </div>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-bold">B</span>
            </div>
          </div>
        </div>
        
        {/* Vehicle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {transfer.vehicle_type}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {transfer.duration}
          </div>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {transfer.price?.toLocaleString()} تومان
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {transfer.capacity} نفر
          </div>
        </div>
      </div>
    </AdvancedCard>
  );
} 