import { PRIVACY_POLICY_PL } from './privacy-policy-text.pl';

const CHILDREN_DATA_SAFETY_POLICY_PL = `
  <h1>Polityka prywatności – Bezpieczeństwo danych</h1>
  <p>Niniejsza aplikacja ({{appName}}) jest grą przeznaczoną dla dzieci.</p>

  <h2>Zbieranie danych</h2>
  <p>Aplikacja nie zbiera, nie przechowuje ani nie udostępnia danych osobowych użytkowników.</p>
  <p>Nie wymagamy rejestracji ani podawania danych osobowych.</p>

  <h2>Reklamy</h2>
  <p>Aplikacja nie zawiera reklam.</p>

  <h2>Dane techniczne</h2>
  <p>Aplikacja może przetwarzać wyłącznie anonimowe dane techniczne niezbędne do jej prawidłowego działania (np. informacje o wersji systemu operacyjnego). Dane te nie pozwalają na identyfikację użytkownika.</p>

  <h2>Zgodność z zasadami Google Play</h2>
  <p>Aplikacja spełnia wymagania Google Play dotyczące aplikacji przeznaczonych dla dzieci.</p>

  <h2>Kontakt</h2>
  <p>W przypadku pytań dotyczących prywatności odwiedź <a href="https://webaby.io" target="_blank" rel="noopener">webaby.io</a>.</p>
`;

const BASKETBALL_SHOTS_POLICY_PL = `
  <h1>Polityka prywatności dla {{appName}}</h1>
  <p>Ostatnia aktualizacja: 10 kwietnia 2024</p>

  <h2>Dzieci poniżej 13 lat</h2>
  <p>{{appName}} jest przeznaczona dla użytkowników w każdym wieku, w tym dzieci poniżej 13 lat.</p>

  <h2>Zbieranie danych</h2>
  <p>Aplikacja nie zbiera danych osobowych takich jak imię i nazwisko, adres e-mail, numer telefonu czy dokładna lokalizacja.</p>

  <h2>Reklamy</h2>
  <p>Aplikacja może zawierać reklamy zgodne z zasadami platformy.</p>

  <h2>Dane techniczne</h2>
  <p>Aplikacja może przetwarzać anonimowe dane techniczne (np. raporty błędów i dane wydajnościowe) niezbędne do poprawy stabilności i jakości działania.</p>

  <h2>Kontakt</h2>
  <p>Jeśli masz pytania dotyczące tej Polityki prywatności, odwiedź <a href="https://webaby.io" target="_blank" rel="noopener">webaby.io</a>.</p>
`;

const BUBBLE_WORLD_POLICY_PL = `
  <h1>Polityka prywatności dla {{appName}}</h1>
  <p>Ostatnia aktualizacja: 10 kwietnia 2024</p>

  <h2>Dzieci poniżej 13 lat</h2>
  <p>{{appName}} jest przeznaczona dla użytkowników w każdym wieku, w tym dzieci poniżej 13 lat.</p>

  <h2>Zbieranie danych</h2>
  <p>Aplikacja nie zbiera danych osobowych takich jak imię i nazwisko, adres e-mail, numer telefonu czy dokładna lokalizacja.</p>

  <h2>Reklamy</h2>
  <p>Aplikacja może zawierać reklamy zgodne z zasadami platformy.</p>

  <h2>Dane techniczne</h2>
  <p>Aplikacja może przetwarzać anonimowe dane techniczne (np. raporty błędów i dane wydajnościowe) niezbędne do poprawy stabilności i jakości działania.</p>

  <h2>Zakupy</h2>
  <p>Zakupy są obsługiwane przez dostawcę platformy (Apple App Store / Google Play). Nie otrzymujemy Twoich danych płatniczych.</p>

  <h2>Kontakt</h2>
  <p>Jeśli masz pytania dotyczące tej Polityki prywatności, odwiedź <a href="https://webaby.io" target="_blank" rel="noopener">webaby.io</a>.</p>
`;

const MUSIC_COLOURS_POLICY_PL = `
  <h1>Polityka prywatności</h1>
  <p>{{appName}} nie zbiera ani nie śledzi danych osobowych.</p>

  <h2>Danych, których NIE zbieramy</h2>
  <ul>
    <li>Nie zbieramy imion i nazwisk, adresów e-mail, numerów telefonów, lokalizacji, kontaktów, identyfikatorów ani danych analitycznych.</li>
    <li>Nie używamy SDK reklamowych i nie śledzimy Cię między aplikacjami ani witrynami.</li>
  </ul>

  <h2>Co aplikacja robi lokalnie</h2>
  <ul>
    <li>Gra działa na Twoim urządzeniu.</li>
    <li>Jeśli dodasz własny soundtrack (Premium), plik audio pozostaje na Twoim urządzeniu i jest używany wyłącznie do odtwarzania muzyki i synchronizacji rozgrywki.</li>
  </ul>

  <h2>Zakupy</h2>
  <p>Zakupy Premium są obsługiwane przez Apple (StoreKit). Nie otrzymujemy Twoich danych płatniczych.</p>

  <h2>Kontakt</h2>
  <p>Jeśli masz pytania dotyczące prywatności, skontaktuj się z nami przez stronę: <a href="https://webaby.io" target="_blank" rel="noopener">webaby.io</a>.</p>

  <p>Ostatnia aktualizacja: styczeń 2026</p>
`;

export const POLICY_BY_SLUG_PL: Record<string, string> = {
  'abc-land': CHILDREN_DATA_SAFETY_POLICY_PL,
  'bubble-world': BUBBLE_WORLD_POLICY_PL,
  'basketball-shots': BASKETBALL_SHOTS_POLICY_PL,
  'music-colours': MUSIC_COLOURS_POLICY_PL
};



function normSlug(s?: string | null) {
  return (s ?? '').trim().toLowerCase().replace(/\u2013|\u2014/g, '-');
}

function normalizeHtmlPolicy(html: string): string {
  // If any CSS uses `white-space: pre-line/pre-wrap`, extra newlines from template literals
  // can turn into huge vertical gaps. This normalizes the string defensively.
  return (html ?? '')
    .replace(/\r\n?/g, '\n')
    // remove leading indentation introduced by template literal formatting
    .replace(/^\s+</gm, '<')
    // collapse 3+ blank lines into a single blank line
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

export function tryPolicyPl(slug?: string | null): string | undefined {
  const s = normSlug(slug);
  const html = s ? POLICY_BY_SLUG_PL[s] : undefined;
  return html ? normalizeHtmlPolicy(html) : undefined;
}

export function getPolicyPlForSlug(slug?: string | null): string {
  const html = tryPolicyPl(slug) ?? PRIVACY_POLICY_PL;
  return normalizeHtmlPolicy(html);
}
