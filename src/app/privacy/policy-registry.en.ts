import { PRIVACY_POLICY_EN } from './privacy-policy-text.en';

export const POLICY_BY_SLUG_EN: Record<string, string> = {
  // 'abc-land': `...polityka EN dla abc-land...`,
};

export function getPolicyEnForSlug(slug?: string | null): string {
  return (slug && POLICY_BY_SLUG_EN[slug]) ?? PRIVACY_POLICY_EN;
}