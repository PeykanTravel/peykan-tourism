/**
 * Modern Homepage Component
 * 
 * A comprehensive homepage with hero section, featured products,
 * categories, and call-to-action sections
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { 
  ArrowRight, 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  Clock,
  Play,
  Shield,
  Award,
  Heart
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Hooks
import { useEvents } from '@/lib/hooks/useEvents';
import { useTours } from '@/lib/hooks/useTours';
import { useTransfers } from '@/lib/hooks/useTransfers';

export default function HomePage() {
  const t = useTranslations('homepage');
  
  // Data hooks
  const { events, isLoading: eventsLoading } = useEvents({ limit: 6 });
  const { tours, isLoading: toursLoading } = useTours({ limit: 6 });
  const { transfers, isLoading: transfersLoading } = useTransfers({ limit: 3 });

  // Featured categories
  const categories = [
    {
      id: 'events',
      title: t('categories.events.title'),
      description: t('categories.events.description'),
      image: '/images/categories/events.jpg',
      href: '/events',
      count: events?.length || 0,
      icon: Calendar,
    },
    {
      id: 'tours',
      title: t('categories.tours.title'),
      description: t('categories.tours.description'),
      image: '/images/categories/tours.jpg',
      href: '/tours',
      count: tours?.length || 0,
      icon: MapPin,
    },
    {
      id: 'transfers',
      title: t('categories.transfers.title'),
      description: t('categories.transfers.description'),
      image: '/images/categories/transfers.jpg',
      href: '/transfers',
      count: transfers?.length || 0,
      icon: Users,
    },
  ];

  // Features
  const features = [
    {
      icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.description'),
    },
    {
      icon: Award,
      title: t('features.quality.title'),
      description: t('features.quality.description'),
    },
    {
      icon: Clock,
      title: t('features.fast.title'),
      description: t('features.fast.description'),
    },
    {
      icon: Heart,
      title: t('features.support.title'),
      description: t('features.support.description'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl lg:text-2xl text-primary-100 mb-8">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/events">
                  <Button size="lg" className="text-lg px-8 py-4">
                    {t('hero.exploreEvents')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/tours">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-600">
                    {t('hero.discoverTours')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero/hero-image.jpg"
                  alt="Travel Experience"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600">{t('hero.video.title')}</p>
                        <p className="font-semibold text-neutral-900">{t('hero.video.description')}</p>
                      </div>
                      <button className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 transition-colors">
                        <Play className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {t('categories.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={category.image}
                    alt={category.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <p className="text-neutral-600">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {category.count} {t('categories.items')}
                    </span>
                    <Link href={category.href}>
                      <Button variant="ghost" size="sm">
                        {t('categories.explore')}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                {t('featured.events.title')}
              </h2>
              <p className="text-lg text-neutral-600">
                {t('featured.events.description')}
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline">
                {t('featured.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-neutral-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              events?.map((event) => (
                <Card key={event.id} className="group hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={event.image || '/images/events/default.jpg'}
                      alt={event.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-neutral-600" />
                      </button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <div className="flex items-center text-sm text-neutral-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary-600">
                        ${event.price}
                      </span>
                      <Link href={`/events/${event.slug}`}>
                        <Button size="sm">
                          {t('featured.bookNow')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                {t('featured.tours.title')}
              </h2>
              <p className="text-lg text-neutral-600">
                {t('featured.tours.description')}
              </p>
            </div>
            <Link href="/tours">
              <Button variant="outline">
                {t('featured.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {toursLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-neutral-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))
            ) : (
              tours?.map((tour) => (
                <Card key={tour.id} className="group hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={tour.image || '/images/tours/default.jpg'}
                      alt={tour.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-neutral-600" />
                      </button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{tour.title}</CardTitle>
                    <div className="flex items-center text-sm text-neutral-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {tour.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary-600">
                        ${tour.price}
                      </span>
                      <Link href={`/tours/${tour.slug}`}>
                        <Button size="sm">
                          {t('featured.bookNow')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {t('features.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                {t('cta.exploreEvents')}
              </Button>
            </Link>
            <Link href="/tours">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-600">
                {t('cta.discoverTours')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 