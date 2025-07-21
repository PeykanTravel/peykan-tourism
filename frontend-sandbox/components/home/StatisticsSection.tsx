import React from 'react';
import Image from 'next/image';

const statistics = [
  {
    number: '20+',
    label: 'years of experience',
    persianLabel: 'سال تجربه'
  },
  {
    number: '100+',
    label: 'destination countries',
    persianLabel: 'کشور مقصد'
  },
  {
    number: '10+',
    label: 'tour & travel awards',
    persianLabel: 'جایزه گردشگری'
  },
  {
    number: '2,237,216',
    label: 'delighted clients',
    persianLabel: 'مشتری راضی'
  }
];

export default function StatisticsSection() {
  return (
    <section className="relative py-20 mb-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image 
          src="/ice-cave.jpg" 
          alt="Ice Cave Adventure" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-blue-900/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            آمار و ارقام ما
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            سال‌ها تجربه و هزاران مشتری راضی
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-sm lg:text-base font-medium">
                  {stat.persianLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      {/* Floating Particles */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
      <div className="absolute top-20 right-20 w-3 h-3 bg-blue-300/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-20 w-2 h-2 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-32 right-32 w-4 h-4 bg-blue-200/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
    </section>
  );
} 