'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TransferBookingSection() {
  const [carIn, setCarIn] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setCarIn(true), 100);
    if (typeof document !== 'undefined') {
      setIsRTL(document.dir === 'rtl');
    }
  }, []);
  
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">
        <div className={`flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10`}>
          {/* Left: Text Content */}
          <div className={`flex-1 max-w-xl ${isRTL ? 'order-2 lg:order-1 lg:pr-0 lg:pl-32 xl:pl-40 text-right' : 'order-1 lg:order-2 lg:pl-0 lg:pr-32 xl:pr-40'}`}>
            <div className="text-blue-600 font-bold text-lg mb-2 uppercase tracking-wider">For Drivers</div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">DO YOU WANT TO EARN WITH US?</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
              Quisque sollicitudin feugiat risus, eu posuere ex euismod eu. Phasellus hendrerit, massa efficitur dapibus pulvinar, sapien eros sodales ante, euismod aliquet nulla metus a mauris.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <ul className="space-y-3 text-base text-gray-900 dark:text-white font-semibold">
                <li className="flex items-center gap-2 rtl:gap-2"><span className="text-blue-600 text-xl">✔</span> Luxury cars</li>
                <li className="flex items-center gap-2 rtl:gap-2"><span className="text-blue-600 text-xl">✔</span> No fee</li>
                <li className="flex items-center gap-2 rtl:gap-2"><span className="text-blue-600 text-xl">✔</span> Weekly payment</li>
              </ul>
              <ul className="space-y-3 text-base text-gray-900 dark:text-white font-semibold">
                <li className="flex items-center gap-2 rtl:gap-2"><span className="text-blue-600 text-xl">✔</span> Fixed price</li>
                <li className="flex items-center gap-2 rtl:gap-2"><span className="text-blue-600 text-xl">✔</span> Good application</li>
                <li className="flex items-center gap-2 rtl:gap-2"><span className="text-blue-600 text-xl">✔</span> Stable orders</li>
              </ul>
            </div>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
              BECOME A DRIVER
            </button>
          </div>
        </div>
        {/* Car image: static and full width below text on md and below, absolutely positioned on lg+ */}
        <div className={`w-full relative order-2 mt-8 lg:mt-0 lg:absolute lg:inset-y-0 ${isRTL ? 'lg:left-0' : 'lg:right-0'} lg:w-1/2 flex items-center z-0`} style={{pointerEvents: 'none', overflow: 'hidden'}}>
          <div
            className={`relative w-full h-[180px] sm:h-[220px] md:h-[340px] lg:h-[540px] xl:h-[1100px] transition-transform duration-700 ease-out`
              + (carIn
                ? ' translate-x-0 opacity-100'
                : (isRTL ? ' -translate-x-full opacity-0' : ' translate-x-full opacity-0'))}
            style={{
              maxWidth: '100vw',
              left: 0,
              right: 0,
              position: 'relative',
            }}
          >
            <Image
              src="/images/_car-big-side33.png"
              alt="Taxi Top View"
              fill
              sizes="100vw"
              style={{
                objectFit: 'contain',
                objectPosition: isRTL ? 'left' : 'right',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
              className={`select-none pointer-events-none scale-110 lg:scale-100 xl:scale-90`}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
} 