import {
  Waves,
  Dumbbell,
  Shield,
  Car,
  TreePine,
  Gamepad2,
  Tv,
  Wifi,
  Sparkles,
  Zap,
  Coffee,
  CheckCircle2,
  Building,
  Key,
  Flame,
  Sun,
  Activity,
  Award,
  BookOpen,
  ShoppingBag,
  Bike,
  Footprints,
  Fish,
  Heart,
  Droplets,
  Trophy,
  Armchair,
  Trees,
} from 'lucide-react';

/**
 * Dynamically resolves an appropriate Lucide icon for an amenity based on icon_key, slug, or name from API.
 * @param {Record<string, any>} amenity
 * @returns {React.ComponentType} Lucide icon component
 */
export function getAmenityIcon(amenity = {}) {
  const key = (amenity.icon_key || amenity.slug || amenity.name || '').toLowerCase();

  // Convenience
  if (key.includes('market') || key.includes('shop') || key.includes('grocery')) return ShoppingBag;
  if (key.includes('library') || key.includes('book') || key.includes('read')) return BookOpen;
  if (key.includes('rest') || key.includes('lounge') || key.includes('sitting')) return Armchair;

  // Fitness
  if (key.includes('gym') || key.includes('fitness') || key.includes('workout')) return Dumbbell;
  if (key.includes('jog') || key.includes('track') || key.includes('run') || key.includes('walk')) return Footprints;
  if (key.includes('cycle') || key.includes('cycling') || key.includes('bike')) return Bike;

  // Nature
  if (key.includes('lake') || key.includes('pond') || key.includes('waterfall')) return Droplets;
  if (key.includes('fish')) return Fish;
  if (key.includes('garden') || key.includes('botanical')) return TreePine;
  if (key.includes('park') || key.includes('lawn') || key.includes('forest')) return Trees;

  // Recreation
  if (key.includes('pool') || key.includes('swim') || key.includes('aqua')) return Waves;
  if (key.includes('club') || key.includes('clubhouse') || key.includes('community')) return Building;
  if (key.includes('kid') || key.includes('play') || key.includes('child') || key.includes('game')) return Gamepad2;

  // Sports
  if (key.includes('basket') || key.includes('cricket') || key.includes('badminton') || key.includes('tennis') || key.includes('sport')) return Trophy;

  // Wellness
  if (key.includes('meditat') || key.includes('yoga') || key.includes('peace')) return Heart;
  if (key.includes('spa') || key.includes('sauna') || key.includes('jacuzzi') || key.includes('wellness')) return Sparkles;

  // Security & Utilities
  if (key.includes('security') || key.includes('cctv') || key.includes('guard')) return Shield;
  if (key.includes('car') || key.includes('parking') || key.includes('garage')) return Car;
  if (key.includes('power') || key.includes('backup') || key.includes('generator')) return Zap;
  if (key.includes('wifi') || key.includes('internet')) return Wifi;
  if (key.includes('cafe') || key.includes('coffee') || key.includes('dining')) return Coffee;

  // Default fallback
  return CheckCircle2;
}
