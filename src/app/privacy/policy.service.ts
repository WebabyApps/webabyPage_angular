// src/app/privacy/policy.service.ts
import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { startWith, switchMap, map } from 'rxjs';
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
      map(() => ({ appName: this.getAppName(s) })),
      switchMap(params => this.t.selectTranslate('policy.product.bodyHtml', params))
    );
  }
}
