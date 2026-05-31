// src/app/i18n/transloco-root.module.ts
import { Injectable, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TranslocoModule, TranslocoLoader, Translation,
  translocoConfig, provideTransloco,
} from '@jsverse/transloco';
import { DebugMissingHandler } from './debug-missing.handler';

const SUPPORTED_LANGS = new Set(['en', 'pl', 'de']);

function normalizeLang(lang: string): string {
  const normalized = String(lang || 'en').toLowerCase().split('-')[0];
  return SUPPORTED_LANGS.has(normalized) ? normalized : 'en';
}

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string, data?: any) {
    // 1) Normalize lang: support "en" or "abc-land/en" or "tutorials/abc-land/en"
    const parts = String(lang).split('/');
    const realLang = normalizeLang(parts.pop()!); // -> "en", "pl" or "de"
    const scopeFromLang = parts.join('/');      // → "abc-land" or "tutorials/abc-land" or ""
  
    // 2) Prefer explicit scope from data, else use the scope encoded in lang (if any)
    const scope =
      (typeof data?.scope === 'string' && data.scope) ||
      (typeof data?.scopePath === 'string' && data.scopePath) ||
      (scopeFromLang || null);
 
    // 3) Build URL
    const url = scope
      ? `assets/i18n/${scope}/${realLang}.json`
      : `assets/i18n/${realLang}.json`;

    return this.http.get(url);
  }
  
}


@NgModule({
  imports: [TranslocoModule],
  exports: [TranslocoModule],
  providers: [
    provideTransloco({
      config: translocoConfig({
        availableLangs: [
          { id: 'en', label: 'English' },
          { id: 'pl', label: 'Polski' },
          { id: 'de', label: 'Deutsch' }   // ⬅️ add this
        ],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: true,
       /* missingHandler: {
          logMissingKey: true,
          useFallbackTranslation: false,
          allowEmpty: false,
        },*/
      
      }),
      loader: TranslocoHttpLoader,
    }),
      // ⬇️ This is where your custom handler is actually plugged in
  
      //  { provide: TRANSLOCO_MISSING_HANDLER, useClass: DebugMissingHandler }
     
      
  ],
})
export class TranslocoRootModule {}
