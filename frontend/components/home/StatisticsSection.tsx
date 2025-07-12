import React from 'react';

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
        <img 
          src="/ice-cave.jpg" 
          alt="Ice Cave Adventure" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              ONLY THE BEST QUALITY FOR YOU
            </h2>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
              You deserve the ultimate best quality for your memorable experiences.
            </p>
            <p className="text-lg text-blue-200 leading-relaxed">
              Take a look at our numbers for our credibility. Let's have an adventure!
            </p>
          </div>
          
          {/* Right Side - Statistics */}
          <div className="grid grid-cols-2 gap-8">
            {statistics.map((stat, index) => (
              <div 
                key={index} 
                className="text-center text-white"
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="mb-4">
                  <span className="text-4xl lg:text-5xl font-bold block">
                    {stat.number}
                  </span>
                </div>
                <div className="text-blue-200 text-sm lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
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