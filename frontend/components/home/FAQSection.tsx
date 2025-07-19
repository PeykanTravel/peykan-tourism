'use client'

import { useTranslations } from 'next-intl'
import { Accordion, AccordionItem } from '@/components/ui'

const faqs = [
  {
    id: 'packages',
    question: 'چه نوع پکیج‌های سفر پیکان ارائه می‌دهد؟',
    answer: 'پیکان طیف گسترده‌ای از پکیج‌های سفر به مقاصد سراسر جهان ارائه می‌دهد، از جمله تورهای سفارشی، تورهای گروهی، سفرهای لوکس، سفرهای ماجراجویی و موارد دیگر. متخصصان سفر ما با شما کار می‌کنند تا برنامه سفری متناسب با نیازها و ترجیحات خاص شما ایجاد کنند.'
  },
  {
    id: 'booking',
    question: 'چگونه با پیکان سفر رزرو کنم؟',
    answer: 'برای رزرو سفر با پیکان، می‌توانید از طریق وب‌سایت ما، تماس تلفنی یا مراجعه حضوری به دفاتر ما اقدام کنید. تیم مشاوران ما آماده راهنمایی و کمک به شما در انتخاب بهترین گزینه‌های سفر هستند.'
  },
  {
    id: 'payment',
    question: 'فرآیند پرداخت پیکان چگونه است؟',
    answer: 'ما روش‌های مختلف پرداخت را پذیرش می‌کنیم شامل کارت‌های بانکی، پرداخت آنلاین، حواله بانکی و پرداخت قسطی. همچنین امکان پرداخت به صورت مرحله‌ای برای تورهای طولانی مدت وجود دارد.'
  },
  {
    id: 'cancellation',
    question: 'چگونه رزرو خود را در پیکان لغو کنم؟',
    answer: 'برای لغو رزرو، می‌توانید با تیم پشتیبانی ما تماس بگیرید. شرایط لغو بسته به نوع تور و زمان لغو متفاوت است. تیم ما شما را در مورد جزئیات و هزینه‌های احتمالی راهنمایی خواهد کرد.'
  },
  {
    id: 'support',
    question: 'آیا در طول سفر پشتیبانی دارید؟',
    answer: 'بله، ما پشتیبانی 24 ساعته در طول سفر ارائه می‌دهیم. تیم پشتیبانی ما همیشه آماده کمک و راهنمایی شما در هر شرایطی است.'
  }
]

export default function FAQSection() {
  const t = useTranslations('home')

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Title Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-4">
                faq
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                سوالاتی که مشتریان ما معمولاً در مورد خدمات و تورهای ما می‌پرسند.
              </p>
            </div>
          </div>

          {/* Accordion Column */}
          <div className="lg:col-span-8">
            <Accordion 
              items={faqs.map(faq => ({
                id: faq.id,
                title: faq.question,
                content: faq.answer
              }))}
              defaultOpen="packages"
            />
          </div>
        </div>
      </div>
    </section>
  )
} 