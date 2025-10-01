import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { PRODUCT_APP_NAME_EN, PRODUCT_APP_NAME_PL, PRODUCT_APP_NAME_DE } from './product-meta';

type Lang = 'en' | 'pl' | 'de';
const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private t = inject(TranslocoService);

  private getLang(): Lang {
    const l = (this.t.getActiveLang() || '').toLowerCase();
    if (l.startsWith('pl')) return 'pl';
    if (l.startsWith('de')) return 'de';
    return 'en';
  }

  /** Nazwa aplikacji wg języka, z fallbackiem do EN, a jak brak — slug. */
  getAppName(slug?: string | null): string {
    const s = norm(slug);
    if (!s) return 'Webaby App';
    const en = (PRODUCT_APP_NAME_EN as any)[s];
    const pl = (PRODUCT_APP_NAME_PL as any)[s];
    const de = (PRODUCT_APP_NAME_DE as any)[s];
    switch (this.getLang()) {
      case 'pl': return pl ?? en ?? s;
      case 'de': return de ?? en ?? s;
      default:   return en ?? s;
    }
  }

  /** Globalna polityka (HTML z Transloco). */
  getGlobalPolicyHtml(): string {
    // Transloco samo zrobi fallback do EN, jeśli w pl/de nie będzie klucza
    return this.t.translate('policy.global.bodyHtml');
  }

  /** Produktowa polityka (HTML z Transloco + parametry). */
  getProductPolicyHtml(slug: string): string {
    const appName = this.getAppName(slug);
    return this.t.translate('policy.product.bodyHtml', { appName });
  }
}