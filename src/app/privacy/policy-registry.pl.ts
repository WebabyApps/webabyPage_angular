import { PRIVACY_POLICY_PL } from './privacy-policy-text.pl';

export const POLICY_BY_SLUG_PL: Record<string, string> = {
  'abc-land': `
  Polityka prywatności — ABC Land
  (example) This policy applies specifically to the ABC Land product...
  ...replace with your product-specific text...
  `,
  'bubble-world': `
  Polityka prywatności — Bubble World
  (example) Product-specific clauses for Bubble World...
  `,
  'bibble-echo': `
  Polityka prywatności — Bibble Echo
  (example) Product-specific text...
  `,
  'lucky-draw': `
  Polityka prywatności — Lucky Draw
  (example) Product-specific text...
  `,
  'echo-bible': `
  Polityka prywatności — Echo Bible
  (example) Product-specific text...
  `,
  'basketball-shots': `
  Polityka prywatności — Basketball shots
  (example) Product-specific text...
  `
};


function normSlug(s?: string | null) {
  return (s ?? '').trim().toLowerCase().replace(/\u2013|\u2014/g, '-');
}

export function tryPolicyPl(slug?: string | null): string | undefined {
  const s = normSlug(slug);
  return s ? POLICY_BY_SLUG_PL[s] : undefined;
}

export function getPolicyPlForSlug(slug?: string | null): string {
  return tryPolicyPl(slug) ?? PRIVACY_POLICY_PL;
}