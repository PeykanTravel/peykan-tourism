'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4">خطای غیرمنتظره</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.</p>
      <button onClick={() => reset()} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">تلاش مجدد</button>
    </main>
  );
} 