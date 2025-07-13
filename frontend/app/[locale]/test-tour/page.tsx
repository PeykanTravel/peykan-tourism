'use client'

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peykantravelistanbul.com/api/v1';

export default function TestTourPage() {
  const [tour, setTour] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/tours/`)
      .then(res => res.json())
      .then(data => {
        const tourItem = Array.isArray(data) ? data[0] : (data.results ? data.results[0] : null);
        setTour(tourItem);
        setLoading(false);
      })
      .catch(err => {
        setError('API Error: ' + err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!tour) return <div>هیچ توری یافت نشد.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">تست نمایش تور</h1>
      <div>
        <strong>عنوان:</strong> {tour.title || tour.slug}
      </div>
      <div>
        <strong>قیمت:</strong> {tour.price} {tour.currency}
      </div>
      <div>
        <strong>مدت زمان:</strong> {tour.duration_hours} ساعت
      </div>
      <div>
        <strong>Slug:</strong> {tour.slug}
      </div>
      <div>
        <strong>Active:</strong> {tour.is_active ? 'بله' : 'خیر'}
      </div>
    </div>
  );
} 