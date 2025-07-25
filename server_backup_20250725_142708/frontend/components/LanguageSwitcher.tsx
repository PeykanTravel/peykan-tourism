'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales } from '../i18n/config';

const languages = [
  { code: 'fa', label: 'فارسی' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    // Get the pathname without the current locale prefix
    let pathWithoutLocale = pathname;
    
    // Remove the current locale prefix from the pathname
    if (pathname.startsWith(`/${currentLocale}/`)) {
      pathWithoutLocale = pathname.substring(currentLocale.length + 1);
    } else if (pathname === `/${currentLocale}`) {
      pathWithoutLocale = '/';
    }
    
    // Ensure we have a valid path
    if (pathWithoutLocale === '') {
      pathWithoutLocale = '/';
    }
    
    // Create the new path with the new locale prefix
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath);
  };

  return (
    <select
      className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-900"
      onChange={(e) => handleLanguageChange(e.target.value)}
      value={currentLocale}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
} 