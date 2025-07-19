'use client'

import React from 'react'
import { FaInstagram, FaTelegram, FaWhatsapp, FaPlane } from 'react-icons/fa'
import { Button, Input } from '@/components/ui'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Newsletter Column */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="space-y-6">
              <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wide">
                NEWS-LETTER
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                برای دریافت پیشنهادات سفر در خبرنامه ما عضو شوید. همین امروز به ما بپیوندید!
              </p>

              {/* Subscribe Box */}
              <div className="space-y-4">
                <div className="flex">
                  <Input
                    type="email"
                    placeholder="آدرس ایمیل"
                    className="flex-1 rounded-r-none border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    variant="primary"
                    className="rounded-l-none hover:scale-105"
                  >
                    عضویت
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Logo & Navigation Column */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="space-y-8">
              {/* Plane Icon */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaPlane className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Logo */}
              <div className="text-center lg:text-right">
                <h2 className="text-2xl lg:text-3xl font-bold">
                  پلتفرم گردشگری پیکان
                </h2>
              </div>

              {/* Navigation */}
              <nav className="flex flex-wrap justify-center lg:justify-start gap-8">
                <a href="/destinations" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">
                  مقاصد
                </a>
                <a href="/tours" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">
                  تورها
                </a>
                <a href="/about" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">
                  درباره ما
                </a>
                <a href="/blog" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">
                  بلاگ
                </a>
                <a href="/contact" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">
                  تماس
                </a>
              </nav>

              {/* Social Media */}
              <div className="flex justify-center lg:justify-start gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaTelegram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <FaWhatsapp className="w-5 h-5" />
                </a>
              </div>

              {/* Footer Bottom */}
              <div className="pt-8 border-t border-gray-800">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                  <div className="text-gray-400 text-sm">
                    کپی‌رایت © {new Date().getFullYear()} پیکان. تمام حقوق محفوظ است.
                  </div>
                  <div className="flex gap-6 text-sm">
                    <a href="/privacy" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105">
                      حریم خصوصی
                    </a>
                    <a href="/terms" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105">
                      شرایط و قوانین
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 