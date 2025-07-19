const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load translation files
const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../i18n/en.json'), 'utf8'));
const fa = JSON.parse(fs.readFileSync(path.join(__dirname, '../i18n/fa.json'), 'utf8'));
const tr = JSON.parse(fs.readFileSync(path.join(__dirname, '../i18n/tr.json'), 'utf8'));

// Function to flatten nested objects
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

// Function to get all used translation keys from code
function getUsedKeys() {
  const usedKeys = new Set();
  
  try {
    // Search for t('key') and t("key") patterns
    const result = execSync('findstr /r /s "t([\'\"]" app\\ components\\', { 
      encoding: 'utf8',
      cwd: __dirname + '/..'
    });
    
    const lines = result.split('\n');
    lines.forEach(line => {
      const matches = line.match(/t\(['"](.*?)['"]\)/g);
      if (matches) {
        matches.forEach(match => {
          const key = match.replace(/t\(['"](.+?)['"]\)/, '$1');
          if (key && !key.includes('defaultValue')) {
            usedKeys.add(key);
          }
        });
      }
    });
  } catch (error) {
    console.log('Could not search for translation keys:', error.message);
  }
  
  return Array.from(usedKeys);
}

// Flatten translation objects
const flatEn = flattenObject(en);
const flatFa = flattenObject(fa);
const flatTr = flattenObject(tr);

// Get all keys from English (reference)
const allEnKeys = Object.keys(flatEn);
const allFaKeys = Object.keys(flatFa);
const allTrKeys = Object.keys(flatTr);

console.log('🌐 Translation Keys Analysis\n');

// Check for missing keys in Persian
const missingInFa = allEnKeys.filter(key => !allFaKeys.includes(key));
if (missingInFa.length > 0) {
  console.log('❌ Missing keys in Persian (fa.json):');
  missingInFa.forEach(key => console.log(`  - ${key}`));
  console.log();
}

// Check for missing keys in Turkish
const missingInTr = allEnKeys.filter(key => !allTrKeys.includes(key));
if (missingInTr.length > 0) {
  console.log('❌ Missing keys in Turkish (tr.json):');
  missingInTr.forEach(key => console.log(`  - ${key}`));
  console.log();
}

// Check for extra keys in Persian
const extraInFa = allFaKeys.filter(key => !allEnKeys.includes(key));
if (extraInFa.length > 0) {
  console.log('ℹ️ Extra keys in Persian (fa.json):');
  extraInFa.forEach(key => console.log(`  - ${key}`));
  console.log();
}

// Check for extra keys in Turkish
const extraInTr = allTrKeys.filter(key => !allEnKeys.includes(key));
if (extraInTr.length > 0) {
  console.log('ℹ️ Extra keys in Turkish (tr.json):');
  extraInTr.forEach(key => console.log(`  - ${key}`));
  console.log();
}

// Try to get used keys from code
console.log('🔍 Attempting to find used translation keys from code...\n');
const usedKeys = getUsedKeys();
if (usedKeys.length > 0) {
  console.log(`Found ${usedKeys.length} translation keys used in code:`);
  usedKeys.forEach(key => console.log(`  - ${key}`));
  console.log();
  
  // Check if used keys exist in translations
  const missingUsedKeys = usedKeys.filter(key => !flatEn.hasOwnProperty(key));
  if (missingUsedKeys.length > 0) {
    console.log('❌ Used keys missing from English translations:');
    missingUsedKeys.forEach(key => console.log(`  - ${key}`));
    console.log();
  }
}

// Summary
console.log('📊 Summary:');
console.log(`  English keys: ${allEnKeys.length}`);
console.log(`  Persian keys: ${allFaKeys.length}`);
console.log(`  Turkish keys: ${allTrKeys.length}`);
console.log(`  Missing in Persian: ${missingInFa.length}`);
console.log(`  Missing in Turkish: ${missingInTr.length}`);
console.log(`  Extra in Persian: ${extraInFa.length}`);
console.log(`  Extra in Turkish: ${extraInTr.length}`);

if (missingInFa.length === 0 && missingInTr.length === 0) {
  console.log('\n✅ All translation keys are complete!');
} else {
  console.log('\n❌ Some translation keys are missing.');
} 