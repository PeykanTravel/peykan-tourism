import { ReactNode } from 'react';
import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'پلتفرم رزرو توریسم پیکان',
  description: 'رزرو تور، رویداد و ترنسفر با آسانی',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎭</text></svg>',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'پلتفرم رزرو توریسم پیکان',
    description: 'رزرو تور، رویداد و ترنسفر با آسانی',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html>
      <body className="bg-white text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
} 