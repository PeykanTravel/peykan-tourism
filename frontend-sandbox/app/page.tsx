import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}

// Add metadata for the root page
export const metadata = {
  title: 'پلتفرم رزرو توریسم پیکان',
  description: 'رزرو تور، رویداد و ترنسفر با آسانی',
}; 