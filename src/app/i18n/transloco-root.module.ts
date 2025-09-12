import { NgModule, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TranslocoModule,
  translocoConfig,
  TranslocoLoader,
  provideTransloco
} from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string) {
    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}

@NgModule({
  imports: [TranslocoModule],
  exports: [TranslocoModule],
  providers: [
    provideTransloco({
      config: translocoConfig({
        availableLangs: ['en', 'pl'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: true
      }),
      loader: TranslocoHttpLoader
    })
  ]
})
export class TranslocoRootModule {}
