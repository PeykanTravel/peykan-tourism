import React from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const destinations = [
  {
    title: 'Italy',
    persianTitle: 'ایتالیا',
    image: '/destinations/italy.jpg',
    rating: 4.9,
    packages: 20,
    desc: 'کشوری زیبا در جنوب اروپا با تاریخ غنی و فرهنگ بی‌نظیر',
    size: 'small',
    href: '/tours'
  },
  {
    title: 'Italy',
    persianTitle: 'ایتالیا',
    image: '/destinations/italy-large.jpg',
    rating: 4.9,
    packages: 20,
    desc: 'سوئیس، رسماً کنفدراسیون سوئیس، کشوری محاط به خشکی است که در قسمت شمالی اروپا قرار دارد.',
    size: 'large',
    href: '/tours'
  },
  {
    title: 'Greece',
    persianTitle: 'یونان',
    image: '/destinations/greece.jpg',
    rating: 4.8,
    packages: 20,
    desc: 'جزایر زیبا و تاریخ کهن یونان باستان',
    size: 'small',
    href: '/tours'
  }
];

function SmallDestinationCard({ title, persianTitle, image, rating, packages, desc, href }: any) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div className="h-80 w-full relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <div className="flex items-center gap-2 mb-3">
            <FaMapMarkerAlt className="w-4 h-4 text-blue-400" />
            <span className="text-sm">{packages} Packages</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LargeDestinationCard({ title, persianTitle, image, rating, packages, desc, href }: any) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="h-96 w-full relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h3 className="text-4xl font-bold mb-3">{title}</h3>
          <div className="flex items-center gap-2 mb-4">
            <FaMapMarkerAlt className="w-5 h-5 text-blue-400" />
            <span className="text-lg">{packages} Packages</span>
          </div>
          <p className="text-gray-200 text-base leading-relaxed mb-6 max-w-md">
            {desc}
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold">
              Book Now
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-gray-900 transition-all duration-300 font-bold">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PopularDestinationsSection() {
  return (
    <section className="mb-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
          POPULAR DESTINATIONS
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Explore our top destinations right from our beloved clients' reviews.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Column - Small Card */}
        <div className="lg:col-span-1">
          <SmallDestinationCard {...destinations[0]} />
        </div>
        
        {/* Middle Column - Large Card */}
        <div className="lg:col-span-1">
          <LargeDestinationCard {...destinations[1]} />
        </div>
        
        {/* Right Column - Small Card */}
        <div className="lg:col-span-1">
          <SmallDestinationCard {...destinations[2]} />
        </div>
      </div>
    </section>
  );
} 