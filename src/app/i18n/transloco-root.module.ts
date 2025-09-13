// src/app/i18n/transloco-root.module.ts
import { Injectable, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TranslocoModule, TranslocoLoader, Translation,
  translocoConfig, provideTransloco
} from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}
 

  getTranslation(lang: string, data?: any) {
    // 1) Czasem lang przychodzi jako 'tutorials/abc-land/en'
    let actualLang = lang;
    let scopeFromLang = '';
    if (lang.includes('/')) {
      const parts = lang.split('/');
      actualLang = parts.pop()!;                 // 'en' / 'pl'
      scopeFromLang = parts.join('/');           // 'tutorials/abc-land'
    }

    // 2) Scope może też przyjść w data.scope
    let scopePath: string | undefined;
    const s = data?.scope;
    if (typeof s === 'string') scopePath = s;
    else if (Array.isArray(s)) scopePath = s.join('/');
    else if (s && typeof s === 'object' && typeof s.scope === 'string') scopePath = s.scope;

    // 3) Jeśli scope nie przyszedł w data, użyj tego z lang
    if (!scopePath && scopeFromLang) scopePath = scopeFromLang;
   // ⬇⬇⬇ TU WŁAŚNIE
    
    const url = scopePath
      ? `/assets/i18n/${scopePath}/${actualLang}.json`
      : `/assets/i18n/${actualLang}.json`;
    console.debug('[Transloco] load:', { lang, data, resolvedUrl: url });
    return this.http.get<Translation>(url);
  }
}

@NgModule({
  imports: [TranslocoModule],
  exports: [TranslocoModule],
  providers: [
    provideTransloco({
      config: translocoConfig({
        availableLangs: ['en','pl'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: true,
      }),
      loader: TranslocoHttpLoader,
    }),
  ],
})
export class TranslocoRootModule {}
