import { PRIVACY_POLICY_EN } from './privacy-policy-text.en';

export const POLICY_BY_SLUG_EN: Record<string, string> = {
  'abc-land': `
  Privacy Policy — ABC Land
  ...długi tekst tylko dla tego produktu...
  `,
  'abecadlowo': `
  Privacy Policy — Abecadłowo
  ...długi tekst tylko dla tego produktu...
  `
};

// Fallback – jeśli dla danego sluga nie ma osobnej polityki,
// używamy globalnej
export function getPolicyBySlug(slug?: string | null): string {
  if (slug && POLICY_BY_SLUG_EN[slug]) {
    return POLICY_BY_SLUG_EN[slug];
  }
  return PRIVACY_POLICY_EN;
}