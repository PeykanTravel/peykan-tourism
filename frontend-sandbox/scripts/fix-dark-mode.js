#!/usr/bin/env node

/**
 * Dark Mode Fix Script
 * Automatically applies dark mode classes to common patterns
 */

const fs = require('fs');
const path = require('path');

// Common patterns to fix
const patterns = [
  // Background colors
  { 
    from: /bg-gray-50(?![^"]*dark:)/g, 
    to: 'bg-gray-50 dark:bg-gray-900' 
  },
  { 
    from: /bg-white(?![^"]*dark:)/g, 
    to: 'bg-white dark:bg-gray-800' 
  },
  
  // Text colors
  { 
    from: /text-gray-900(?![^"]*dark:)/g, 
    to: 'text-gray-900 dark:text-white' 
  },
  { 
    from: /text-gray-600(?![^"]*dark:)/g, 
    to: 'text-gray-600 dark:text-gray-300' 
  },
  { 
    from: /text-gray-700(?![^"]*dark:)/g, 
    to: 'text-gray-700 dark:text-gray-300' 
  },
  { 
    from: /text-gray-500(?![^"]*dark:)/g, 
    to: 'text-gray-500 dark:text-gray-400' 
  },
  
  // Border colors
  { 
    from: /border-gray-200(?![^"]*dark:)/g, 
    to: 'border-gray-200 dark:border-gray-700' 
  },
  { 
    from: /border-gray-300(?![^"]*dark:)/g, 
    to: 'border-gray-300 dark:border-gray-600' 
  },
  
  // Alert boxes
  { 
    from: /bg-blue-50(?![^"]*dark:)/g, 
    to: 'bg-blue-50 dark:bg-blue-900/20' 
  },
  { 
    from: /bg-yellow-50(?![^"]*dark:)/g, 
    to: 'bg-yellow-50 dark:bg-yellow-900/20' 
  },
  { 
    from: /bg-green-50(?![^"]*dark:)/g, 
    to: 'bg-green-50 dark:bg-green-900/20' 
  },
  { 
    from: /bg-red-50(?![^"]*dark:)/g, 
    to: 'bg-red-50 dark:bg-red-900/20' 
  },
  
  // Alert text colors
  { 
    from: /text-blue-800(?![^"]*dark:)/g, 
    to: 'text-blue-800 dark:text-blue-200' 
  },
  { 
    from: /text-yellow-800(?![^"]*dark:)/g, 
    to: 'text-yellow-800 dark:text-yellow-200' 
  },
  { 
    from: /text-green-800(?![^"]*dark:)/g, 
    to: 'text-green-800 dark:text-green-200' 
  },
  { 
    from: /text-red-800(?![^"]*dark:)/g, 
    to: 'text-red-800 dark:text-red-200' 
  }
];

// Files to process
const filesToProcess = [
  'app/[locale]/tours/[slug]/page.tsx',
  'app/[locale]/events/[slug]/page.tsx',
  'app/[locale]/transfers/booking/page.tsx',
  'app/[locale]/transfers/booking/components/BookingSteps.tsx',
  'app/[locale]/transfers/booking/components/BookingSummary.tsx',
  'app/[locale]/transfers/booking/components/ContactForm.tsx',
  'app/[locale]/transfers/booking/components/DateTimeSelection.tsx',
  'app/[locale]/transfers/booking/components/OptionsSelection.tsx',
  'app/[locale]/transfers/booking/components/PassengerSelection.tsx',
  'app/[locale]/transfers/booking/components/RouteSelection.tsx',
  'app/[locale]/transfers/booking/components/VehicleSelection.tsx',
  'app/[locale]/cart/page.tsx',
  'app/[locale]/checkout/page.tsx',
  'app/[locale]/login/page.tsx',
  'app/[locale]/register/page.tsx',
  'app/[locale]/forgot-password/page.tsx',
  'app/[locale]/reset-password/page.tsx',
  'app/[locale]/verify-email/page.tsx',
  'app/[locale]/profile/page.tsx',
  'components/cart/EventCartItem.tsx',
  'components/cart/TourCartItem.tsx',
  'components/cart/TransferCartItem.tsx',
  'components/cart/ImprovedCartItem.tsx',
  'components/events/EventCard.tsx',
  'components/tours/TourCard.tsx',
  'components/transfers/TransferCard.tsx'
];

function processFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let changes = 0;
  
  // Apply patterns
  patterns.forEach(pattern => {
    const matches = content.match(pattern.from);
    if (matches) {
      content = content.replace(pattern.from, pattern.to);
      changes += matches.length;
    }
  });
  
  if (changes > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${changes} patterns in ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
  }
}

function main() {
  console.log('🎨 Starting Dark Mode Fixes...\n');
  
  filesToProcess.forEach(file => {
    processFile(file);
  });
  
  console.log('\n✨ Dark mode fixes completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the changes');
  console.log('2. Test in both light and dark modes');
  console.log('3. Check for any broken layouts');
  console.log('4. Commit the changes');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, patterns }; 