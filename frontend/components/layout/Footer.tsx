/**
 * Footer Component
 * 
 * Main footer with links, contact info, newsletter signup, and social media
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUp
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';

export default function Footer() {
  const t = useTranslations('footer');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: t('links.about'), href: '/about' },
      { label: t('links.careers'), href: '/careers' },
      { label: t('links.press'), href: '/press' },
      { label: t('links.contact'), href: '/contact' },
    ],
    services: [
      { label: t('links.events'), href: '/events' },
      { label: t('links.tours'), href: '/tours' },
      { label: t('links.transfers'), href: '/transfers' },
      { label: t('links.corporate'), href: '/corporate' },
    ],
    support: [
      { label: t('links.help'), href: '/help' },
      { label: t('links.faq'), href: '/faq' },
      { label: t('links.safety'), href: '/safety' },
      { label: t('links.terms'), href: '/terms' },
    ],
    legal: [
      { label: t('links.privacy'), href: '/privacy' },
      { label: t('links.terms'), href: '/terms' },
      { label: t('links.cookies'), href: '/cookies' },
      { label: t('links.accessibility'), href: '/accessibility' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="ml-3 text-xl font-bold">Peykan Tourism</span>
            </div>
            <p className="text-neutral-300 mb-6 max-w-md">
              {t('description')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-neutral-300">
                <Mail className="h-4 w-4 mr-3" />
                <a href="mailto:info@peykan-tourism.com" className="hover:text-white transition-colors">
                  info@peykan-tourism.com
                </a>
              </div>
              <div className="flex items-center text-neutral-300">
                <Phone className="h-4 w-4 mr-3" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center text-neutral-300">
                <MapPin className="h-4 w-4 mr-3" />
                <span>Tehran, Iran</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('sections.company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('sections.services')}</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('sections.support')}</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2">{t('newsletter.title')}</h3>
            <p className="text-neutral-300 mb-4">{t('newsletter.description')}</p>
            <div className="flex">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-l-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button className="rounded-l-none">
                {t('newsletter.subscribe')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="text-neutral-300 text-sm mb-4 md:mb-0">
              © {currentYear} Peykan Tourism. {t('copyright')}
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center text-neutral-300 hover:text-white transition-colors mt-4 md:mt-0"
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              {t('backToTop')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
} 