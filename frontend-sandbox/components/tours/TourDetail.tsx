'use client';
import { useState } from 'react';
import { PriceDisplay } from '../ui/Price';

export function TourDetail({ tour }: { tour: any }) {
  const [variant, setVariant] = useState(tour.variants[0]?.id || '');
  const [participants, setParticipants] = useState(1);

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded shadow p-6">
      <h1 className="text-2xl font-bold mb-2">{tour.title}</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">{tour.description}</p>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Variant</label>
        <select
          className="border rounded px-2 py-1"
          value={variant}
          onChange={e => setVariant(e.target.value)}
        >
          {tour.variants.map((v: any) => (
            <option key={v.id} value={v.id}>
              {v.name} (<PriceDisplay amount={v.price} currency={tour.currency || 'USD'} />)
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Participants</label>
        <input
          type="number"
          min={1}
          value={participants}
          onChange={e => setParticipants(Number(e.target.value))}
          className="border rounded px-2 py-1 w-24"
        />
      </div>
      <button className="btn-primary w-full">Add to Cart</button>
    </div>
  );
} 