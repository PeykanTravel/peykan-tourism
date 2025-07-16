export default function Loading() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
    </main>
  );
} 