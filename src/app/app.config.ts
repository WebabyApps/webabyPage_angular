import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';

import { TranslocoModule } from '@jsverse/transloco';
import { TranslocoLocaleModule, provideTranslocoLocale } from '@jsverse/transloco-locale';
import { TranslocoRootModule } from './i18n/transloco-root.module';

import { routes } from './app.routes.module';

registerLocaleData(localePl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      })
    ),
    // withFetch() jest wymagane dla SSR
    provideHttpClient(withFetch()),
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
};
