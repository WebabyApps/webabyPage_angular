// src/app/privacy/policy.service.ts
import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { startWith, switchMap, of } from 'rxjs';
import { PRODUCT_APP_NAME_EN, PRODUCT_APP_NAME_PL, PRODUCT_APP_NAME_DE } from './product-meta';
import { tryPolicyEn } from './policy-registry.en';
import { tryPolicyPl } from './policy-registry.pl';
import { tryPolicyDe } from './policy-registry.de';

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

  // ✅ globalna jako Observable (na wzór działającej już /privacy-policy)
  getGlobalPolicyHtml$() {
    return this.t.selectTranslate('policy.global.bodyHtml');
  }

  // ✅ produktowa jako Observable z parametrem appName
  getProductPolicyHtml$(slug: string) {
    const s = norm(slug);
    return this.t.langChanges$.pipe(
      startWith(this.getLang()),
      switchMap(() => {
        const appName = this.getAppName(s);
        const lang = this.getLang();
        const custom = this.getCustomPolicyForSlug(lang, s);

        if (custom) {
          return of(this.interpolateAppName(custom, appName));
        }

        return this.t.selectTranslate('policy.product.bodyHtml', { appName });
      })
    );
  }

  private getCustomPolicyForSlug(lang: Lang, slug?: string | null): string | undefined {
    switch (lang) {
      case 'pl': return tryPolicyPl(slug);
      case 'de': return tryPolicyDe(slug);
      default:   return tryPolicyEn(slug);
    }
  }

  private interpolateAppName(html: string, appName: string): string {
    return html.replace(/{{\s*appName\s*}}/g, appName);
  }
}
