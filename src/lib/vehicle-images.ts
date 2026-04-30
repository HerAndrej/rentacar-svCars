import { vehicles as localVehicles } from '@/data/vehicles';
import type { Vehicle } from '@/types';

export function withFallbackImages(vehicle: Vehicle): Vehicle {
  if (vehicle.images.length > 0) return vehicle;
  const local = localVehicles.find(v => v.slug === vehicle.slug);
  if (local && local.images.length > 0) {
    return { ...vehicle, images: local.images };
  }
  return vehicle;
}

export function withFallbackImagesAll(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map(withFallbackImages);
}
