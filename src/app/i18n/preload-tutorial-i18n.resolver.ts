import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

export function preloadTutorialI18nResolver() {
  const t = inject(TranslocoService);
  // czekamy tylko na globalne tłumaczenia aktywnego języka
  return firstValueFrom(t.selectTranslation());
}
