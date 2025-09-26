import { PRIVACY_POLICY_PL } from './privacy-policy-text.pl';

export const POLICY_BY_SLUG_PL: Record<string, string> = {
  // 'abc-land': `...polityka PL dla abc-land...`,
};

export function getPolicyPlForSlug(slug?: string | null): string {
  return (slug && POLICY_BY_SLUG_PL[slug]) ?? PRIVACY_POLICY_PL;
}