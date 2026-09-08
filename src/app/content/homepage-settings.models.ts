import { InjectionToken } from '@angular/core';
import { PRODUCT_SLUGS } from '../shared/models/producs.data';

export type HomepageHeroVariant = 'classic' | 'apps';

export type HomepageSettings = {
  showBlog: boolean;
  showIntro: boolean;
  heroVariant: HomepageHeroVariant;
  carouselProductSlugs: string[];
};

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  showBlog: true,
  showIntro: false,
  heroVariant: 'classic',
  carouselProductSlugs: [...PRODUCT_SLUGS],
};

export const INITIAL_HOMEPAGE_SETTINGS = new InjectionToken<HomepageSettings>(
  'INITIAL_HOMEPAGE_SETTINGS',
);

export function normalizeHomepageSettings(value: Partial<HomepageSettings> | null | undefined): HomepageSettings {
  const requestedProductSlugs = Array.isArray(value?.carouselProductSlugs)
    ? [...new Set(value.carouselProductSlugs.filter(
        (slug): slug is string => typeof slug === 'string' && PRODUCT_SLUGS.includes(slug),
      ))]
    : [];

  return {
    showBlog: typeof value?.showBlog === 'boolean' ? value.showBlog : DEFAULT_HOMEPAGE_SETTINGS.showBlog,
    showIntro: typeof value?.showIntro === 'boolean' ? value.showIntro : DEFAULT_HOMEPAGE_SETTINGS.showIntro,
    heroVariant: value?.heroVariant === 'apps' || value?.heroVariant === 'classic'
      ? value.heroVariant
      : DEFAULT_HOMEPAGE_SETTINGS.heroVariant,
    carouselProductSlugs: requestedProductSlugs.length
      ? requestedProductSlugs
      : [...DEFAULT_HOMEPAGE_SETTINGS.carouselProductSlugs],
  };
}
