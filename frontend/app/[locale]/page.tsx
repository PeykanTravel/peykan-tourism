import HeroSection from '../../components/home/HeroSection';
import AboutSection from '../../components/home/AboutSection';
import PackageTripsSection from '../../components/home/PackageTripsSection';
import EventsSection from '../../components/home/EventsSection';
import TransferBookingSection from '../../components/home/TransferBookingSection';
import FAQSection from '../../components/home/FAQSection';
import CTASection from '../../components/home/CTASection';
import Footer from '../../components/home/Footer';

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section - Full Width Background */}
      <HeroSection />

      {/* Package Trips Section */}
      <PackageTripsSection />

      {/* Events Section */}
      <EventsSection />

      {/* Transfer Booking Section */}
      <TransferBookingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />

      {/* About Section */}
      <AboutSection />

      {/* Footer */}
      <Footer />
    </div>
  );
} 