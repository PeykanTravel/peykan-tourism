'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { MapPin } from 'lucide-react';

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
}

interface RouteSelectionProps {
  routes: Route[];
  onSubmit: (route: Route) => void;
  initialRouteId?: string;
}

export default function RouteSelection({ routes, onSubmit, initialRouteId }: RouteSelectionProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('transfers');
  const [selectedRouteId, setSelectedRouteId] = useState(initialRouteId || (routes[0]?.id ?? ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const route = routes.find(r => r.id === selectedRouteId);
    if (route) onSubmit(route);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('routeSelection')}</h2>
        <p className="text-gray-600">{t('step1')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectRoute')}</label>
          <select value={selectedRouteId} onChange={e => setSelectedRouteId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {routes.map(route => (
              <option key={route.id} value={route.id}>{route.name} ({route.origin} → {route.destination})</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-6">
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{t('next')}</button>
        </div>
      </form>
    </div>
  );
}