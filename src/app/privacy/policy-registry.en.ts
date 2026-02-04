import { PRIVACY_POLICY_EN } from './privacy-policy-text.en';

export const POLICY_BY_SLUG_EN: Record<string, string> = {
  'abc-land': `
  <h1>Privacy Policy for {{appName}}</h1>
  <p>Last updated: April 10, 2024</p>
  <p>This Privacy Policy explains how {{appName}} collects, uses, and discloses information when you use the app.</p>

  <h2>Children Under 13</h2>
  <p>{{appName}} is intended for users of all ages, including children under 13. Where required by law, we obtain verifiable parental consent before collecting personal data from children under 13.</p>
  <p>We do not knowingly collect personal data from children under 13 without such consent. If you believe that a child has provided us personal data without consent, please contact us so we can take appropriate action.</p>

  <h2>Data We Collect</h2>
  <p>We may collect usage data, diagnostics, and limited device information to improve stability and performance.</p>

  <h2>How We Use Data</h2>
  <ul>
    <li>To provide, maintain, and improve {{appName}}.</li>
    <li>To fix bugs, ensure security, and analyze performance.</li>
    <li>To comply with legal obligations.</li>
  </ul>

  <h2>Purchases</h2>
  <p>Purchases are processed by the platform provider (Apple App Store / Google Play). We do not receive your payment details.</p>

  <h2>Contact</h2>
  <p>If you have questions about this Privacy Policy, visit <a href="https://webaby.io" target="_blank" rel="noopener">webaby.io</a>.</p>
  `,
  'bubble-world': `
  <h1>Privacy Policy for {{appName}}</h1>
  <p>Last updated: April 10, 2024</p>
  <p>This Privacy Policy explains how {{appName}} collects, uses, and discloses information when you use the app.</p>

  <h2>Children Under 13</h2>
  <p>{{appName}} is intended for users of all ages, including children under 13. Where required by law, we obtain verifiable parental consent before collecting personal data from children under 13.</p>
  <p>We do not knowingly collect personal data from children under 13 without such consent. If you believe that a child has provided us personal data without consent, please contact us so we can take appropriate action.</p>

  <h2>Data We Collect</h2>
  <p>We may collect usage data, diagnostics, and limited device information to improve stability and performance.</p>

  <h2>How We Use Data</h2>
  <ul>
    <li>To provide, maintain, and improve {{appName}}.</li>
    <li>To fix bugs, ensure security, and analyze performance.</li>
    <li>To comply with legal obligations.</li>
  </ul>

  <h2>Purchases</h2>
  <p>Purchases are processed by the platform provider (Apple App Store / Google Play). We do not receive your payment details.</p>

  <h2>Contact</h2>
  <p>If you have questions about this Privacy Policy, visit <a href="https://webaby.io" target="_blank" rel="noopener">webaby.io</a>.</p>
  `,
  'basketball-shots': `
  <h1>Privacy Policy for {{appName}}</h1>
  <p>Last updated: April 10, 2024</p>
  <p>This Privacy Policy explains how {{appName}} collects, uses, and discloses information when you use the app.</p>

  <h2>Children Under 13</h2>
  <p>{{appName}} is intended for users of all ages, including children under 13. Where required by law, we obtain verifiable parental consent before collecting personal data from children under 13.</p>
  <p>We do not knowingly collect personal data from children under 13 without such consent. If you believe that a child has provided us personal data without consent, please contact us so we can take appropriate action.</p>

  <h2>Data We Collect</h2>
  <p>We may collect usage data, diagnostics, and limited device information to improve stability and performance.</p>

  <h2>How We Use Data</h2>
  <ul>
    <li>To provide, maintain, and improve {{appName}}.</li>
    <li>To fix bugs, ensure security, and analyze performance.</li>
    <li>To comply with legal obligations.</li>
  </ul>

  <h2>Contact</h2>
  <p>If you have questions about this Privacy Policy, visit <a href="https://webaby.io" target="_blank" rel="noopener">webaby.io</a>.</p>
  `,
  'music-colours': `
  <h1>Privacy Policy</h1>
  <p>Music Colours does not collect or track personal data.</p>

  <h2>Data we do NOT collect</h2>
  <ul>
    <li>We do not collect names, emails, phone numbers, location, contacts, identifiers, or analytics.</li>
    <li>We do not use advertising SDKs and we do not track you across apps or websites.</li>
  </ul>

  <h2>What the app does locally</h2>
  <ul>
    <li>The game runs on your device.</li>
    <li>If you add your own soundtrack (Premium), the audio file stays on your device and is used only to play music and synchronize gameplay.</li>
  </ul>

  <h2>Purchases</h2>
  <p>Premium purchases are processed by Apple (StoreKit). We do not receive your payment details.</p>

  <h2>Contact</h2>
  <p>If you have questions about privacy, contact us via the website: <a href="https://webaby.io" target="_blank" rel="noopener">webaby.io</a>.</p>

  <p>Last updated: January 2026</p>
  `
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
