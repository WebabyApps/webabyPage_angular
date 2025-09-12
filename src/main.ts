// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app/app.routes.module';

import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
registerLocaleData(localePl);

// Transloco core
import { TranslocoModule } from '@jsverse/transloco';
import { TranslocoRootModule } from './app/i18n/transloco-root.module';

// Transloco Locale (nowe API – provider funkcyjny)
import { TranslocoLocaleModule, provideTranslocoLocale } from '@jsverse/transloco-locale';

// Twój token
import { TUTORIALS } from './app/tutorials/tutorial.token';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      })
    ),

    // ⬇️ Globalne providery modułów
    importProvidersFrom(
      TranslocoModule,        // bazowe providery Transloco (pipe, service, itd.)
      TranslocoRootModule,    // Twój config + loader
      TranslocoLocaleModule   // dyrektywy/pipes locale
    ),

    // ⬇️ Kluczowe: rejestruje wszystkie tokeny locale, w tym LANG_MAPPING
    provideTranslocoLocale({
      langToLocaleMapping: {
        en: 'en-US',
        pl: 'pl-PL',
      },
      // opcjonalnie: globalne formaty
      // localeConfig: { global: { date: { dateStyle: 'long', timeStyle: 'short' } } }
    }),

    { provide: TUTORIALS, useValue: {} },
  ],
}).catch(err => console.error(err));
