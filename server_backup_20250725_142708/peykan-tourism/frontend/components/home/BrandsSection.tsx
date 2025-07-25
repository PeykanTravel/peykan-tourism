import React from 'react';

const brands = [
  {
    name: 'Expedia',
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 200 60" fill="none">
        <rect x="10" y="15" width="180" height="30" rx="4" fill="#FFC72C" />
        <text x="100" y="35" textAnchor="middle" className="text-lg font-bold fill-white">Expedia</text>
      </svg>
    )
  },
  {
    name: 'Booking',
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 200 60" fill="none">
        <rect x="10" y="15" width="180" height="30" rx="4" fill="#003580" />
        <text x="100" y="35" textAnchor="middle" className="text-lg font-bold fill-white">Booking.com</text>
      </svg>
    )
  },
  {
    name: 'Airbnb',
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 200 60" fill="none">
        <rect x="10" y="15" width="180" height="30" rx="4" fill="#FF5A5F" />
        <circle cx="40" cy="30" r="8" fill="white" />
        <text x="120" y="35" textAnchor="middle" className="text-lg font-bold fill-white">Airbnb</text>
      </svg>
    )
  },
  {
    name: 'TripAdvisor',
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 200 60" fill="none">
        <rect x="10" y="15" width="180" height="30" rx="4" fill="#00AA6C" />
        <circle cx="50" cy="30" r="6" fill="white" />
        <circle cx="70" cy="30" r="6" fill="white" />
        <text x="130" y="35" textAnchor="middle" className="text-lg font-bold fill-white">TripAdvisor</text>
      </svg>
    )
  },
  {
    name: 'Agoda',
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 200 60" fill="none">
        <rect x="10" y="15" width="180" height="30" rx="4" fill="#D7282F" />
        <text x="100" y="35" textAnchor="middle" className="text-lg font-bold fill-white">Agoda</text>
      </svg>
    )
  },
  {
    name: 'Hotels.com',
    logo: (
      <svg className="h-8 w-auto" viewBox="0 0 200 60" fill="none">
        <rect x="10" y="15" width="180" height="30" rx="4" fill="#C8102E" />
        <text x="100" y="35" textAnchor="middle" className="text-lg font-bold fill-white">Hotels.com</text>
      </svg>
    )
  }
];

export default function BrandsSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          شرکای مورد اعتماد ما
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          با بهترین پلتفرم‌های گردشگری جهان همکاری می‌کنیم تا بهترین تجربه سفر را برای شما فراهم کنیم
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 items-center justify-items-center">
        {brands.map((brand, index) => (
          <div 
            key={brand.name}
            className="flex items-center justify-center p-4 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="opacity-70 hover:opacity-100 transition-opacity duration-300">
              {brand.logo}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          و بیش از 100 شریک دیگر در سراسر جهان
        </p>
      </div>
    </section>
  );
} 