// src/app/i18n/transloco-root.module.ts
import { Injectable, NgModule, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser, APP_BASE_HREF } from '@angular/common';
import { of } from 'rxjs';
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
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private baseHref = inject(APP_BASE_HREF, { optional: true }) ?? '';

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

    const path = scope
      ? `assets/i18n/${scope}/${realLang}.json`
      : `assets/i18n/${realLang}.json`;

    // 3) Na serwerze nie ładuj tłumaczeń przez HTTP — zwróć pusty obiekt synchronicznie.
    //    Klient załaduje tłumaczenia po hydratacji.
    if (!isPlatformBrowser(this.platformId)) {
      return of({} as Translation);
    }

    return this.http.get<Translation>(path);
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
