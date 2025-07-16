import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peykan Tourism',
  description: 'رزرو آنلاین تورهای استانبول، بلیط کنسرت و رویدادها، خدمات ترانسفر فرودگاه و شهری',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="bg-gray-900 text-white min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
} 