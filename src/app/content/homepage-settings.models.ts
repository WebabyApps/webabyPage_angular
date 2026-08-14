import { InjectionToken } from '@angular/core';

export type HomepageHeroVariant = 'classic' | 'apps';

export type HomepageSettings = {
  showBlog: boolean;
  showIntro: boolean;
  heroVariant: HomepageHeroVariant;
};

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  showBlog: true,
  showIntro: false,
  heroVariant: 'classic',
};

export const INITIAL_HOMEPAGE_SETTINGS = new InjectionToken<HomepageSettings>(
  'INITIAL_HOMEPAGE_SETTINGS',
);

export function normalizeHomepageSettings(value: Partial<HomepageSettings> | null | undefined): HomepageSettings {
  return {
    showBlog: typeof value?.showBlog === 'boolean' ? value.showBlog : DEFAULT_HOMEPAGE_SETTINGS.showBlog,
    showIntro: typeof value?.showIntro === 'boolean' ? value.showIntro : DEFAULT_HOMEPAGE_SETTINGS.showIntro,
    heroVariant: value?.heroVariant === 'apps' || value?.heroVariant === 'classic'
      ? value.heroVariant
      : DEFAULT_HOMEPAGE_SETTINGS.heroVariant,
  };
}
