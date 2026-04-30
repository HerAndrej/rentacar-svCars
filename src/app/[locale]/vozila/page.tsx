import { getVehicles } from '@/lib/queries';
import { withFallbackImagesAll } from '@/lib/vehicle-images';
import ScrollReveal from '@/components/motion/ScrollReveal';
import GradientOrb from '@/components/motion/GradientOrb';
import VehiclesPageClient from '@/components/VehiclesPageClient';
import { getTranslations } from 'next-intl/server';

export default async function VehiclesPage() {
  const t = await getTranslations('vehicles');
  const vehicles = await getVehicles();
  const withImages = withFallbackImagesAll(vehicles);

  return (
    <div className="pt-28 pb-20">
      {/* Mini hero banner */}
      <div className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb size={300} color="rgba(232, 90, 43, 0.08)" className="right-[10%] top-0" speed={8} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ScrollReveal blur>
            <div>
              <span className="text-accent font-[family-name:var(--font-montserrat)] font-bold text-xs tracking-[0.3em] uppercase">
                {t('title')}
              </span>
              <h1 className="font-[family-name:var(--font-montserrat)] font-black mt-3 mb-4" style={{ fontSize: 'var(--text-h1)' }}>
                {t('subtitle')}
              </h1>
            </div>
          </ScrollReveal>
        </div>
        <div className="gradient-divider" />
      </div>

      <VehiclesPageClient vehicles={withImages} />
    </div>
  );
}
