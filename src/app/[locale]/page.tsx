import HeroSection from '@/components/HeroSection';
import USPStrip from '@/components/USPStrip';
import AboutSection from '@/components/AboutSection';
import HowItWorks from '@/components/HowItWorks';
import FAQAccordion from '@/components/FAQAccordion';
import FeaturedVehicles from '@/components/FeaturedVehicles';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <USPStrip />
      <FeaturedVehicles />
      <AboutSection />
      <HowItWorks />
      <FAQAccordion />
    </>
  );
}
