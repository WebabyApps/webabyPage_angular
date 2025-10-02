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
import { TranslocoLocaleModule, provideTranslocoLocale } from '@jsverse/transloco-locale';
import { TranslocoRootModule } from './app/i18n/transloco-root.module';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(),
    importProvidersFrom(TranslocoModule, TranslocoRootModule, TranslocoLocaleModule),
    provideTranslocoLocale({
      langToLocaleMapping: {
        en: 'en-US',
        pl: 'pl-PL',
        de: 'de-DE',
      },
      defaultLocale: 'en-US',
    }),
  ],
}).catch(err => console.error(err));
