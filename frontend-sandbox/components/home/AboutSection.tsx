'use client'

import React from 'react';
import Image from 'next/image';

export default function AboutSection() {
  const stats = [
    { number: '20+', label: 'سال تجربه' },
    { number: '100+', label: 'کشور مقصد' },
    { number: '10+', label: 'جایزه گردشگری' },
    { number: '2M+', label: 'مشتری راضی' }
  ];

  return (
    <section id="about-section" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Column */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="/images/about-image.jpg" 
                alt="About Us"
                width={600}
                height={500}
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Content Column */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                  about
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  MEMORABLE <br />
                  <span className="text-blue-600 dark:text-blue-400">TRAVELS</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  آژانس مسافرتی پیکان، آژانس مسافرتی کاملی برای تمام سفرهای به یادماندنی شماست. 
                  با راهنمایان متخصص ما، ما هم حرفه‌ای و هم شخصی هستیم. سفرهای ما شامل تجربیات 
                  فراموش‌نشدنی است و به روشی پایدار برای محافظت از محیط زیست ارائه می‌شود.
                </p>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                  بیشتر بدانید
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 