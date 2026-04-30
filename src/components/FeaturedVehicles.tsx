import { getFeaturedVehicles } from '@/lib/queries';
import { withFallbackImagesAll } from '@/lib/vehicle-images';
import FeaturedVehiclesClient from './FeaturedVehiclesClient';

export default async function FeaturedVehicles() {
  const vehicles = await getFeaturedVehicles(4);
  const withImages = withFallbackImagesAll(vehicles);

  return <FeaturedVehiclesClient vehicles={withImages} />;
}
