import { PRIVACY_POLICY_EN } from './privacy-policy-text.en';

export const POLICY_BY_SLUG_EN: Record<string, string> = {
  'abc-land': `
  Privacy Policy — ABC Land
  (example) This policy applies specifically to the ABC Land product...
  ...replace with your product-specific text...
  `,
  'bubble-world': `
  Privacy Policy — Bubble World
  (example) Product-specific clauses for Bubble World...
  `,
  'bibble-echo': `
  Privacy Policy — Bibble Echo
  (example) Product-specific text...
  `,
  'lucky-draw': `
  Privacy Policy — Lucky Draw
  (example) Product-specific text...
  `,
  'echo-bible': `
  Privacy Policy — Echo Bible
  (example) Product-specific text...
  `,
  'basketball-shots': `
  Privacy Policy — Basketball shots
  (example) Product-specific text...
  `,
};


function normSlug(s?: string | null) {
  return (s ?? '').trim().toLowerCase().replace(/\u2013|\u2014/g, '-');
}

export function tryPolicyEn(slug?: string | null): string | undefined {
  const s = normSlug(slug);
  return s ? POLICY_BY_SLUG_EN[s] : undefined;
}

export function getPolicyEnForSlug(slug?: string | null): string {
  return tryPolicyEn(slug) ?? PRIVACY_POLICY_EN;
}