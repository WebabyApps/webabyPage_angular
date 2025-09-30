import { Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { getPolicyEnForSlug, tryPolicyEn } from './policy-registry.en';
import { getPolicyPlForSlug, tryPolicyPl } from './policy-registry.pl';
import { getPolicyDeForSlug, tryPolicyDe } from './policy-registry.de';

type Lang = 'en' | 'pl' | 'de';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private lang = signal<Lang>('en');

  constructor(private transloco: TranslocoService) {
    this.lang.set(this.toLang(this.transloco.getActiveLang()));
    this.transloco.langChanges$.subscribe((l:string) => this.lang.set(this.toLang(l)));
  }

  getPolicyFor(slug?: string | null): string {
  const l = this.lang();

  // najpierw sprawdź produktowe wersje w 3 językach
  const enP = tryPolicyEn(slug);
  const plP = tryPolicyPl(slug);
  const deP = tryPolicyDe(slug);

  switch (l) {
    case 'pl':
      // priorytet: PL produktowa → EN produktowa → EN globalna → PL globalna → DE produktowa → DE globalna
      return plP ?? enP ?? getPolicyEnForSlug(slug) ?? getPolicyPlForSlug(null) ?? deP ?? getPolicyDeForSlug(null);

    case 'de':
      // priorytet: DE produktowa → EN produktowa → EN globalna → DE globalna → PL produktowa → PL globalna
      return deP ?? enP ?? getPolicyEnForSlug(slug) ?? getPolicyDeForSlug(null) ?? plP ?? getPolicyPlForSlug(null);

    default: // 'en'
      // priorytet: EN produktowa → EN globalna → (opcjonalnie inne)
      return enP ?? getPolicyEnForSlug(slug) ?? plP ?? getPolicyPlForSlug(null) ?? deP ?? getPolicyDeForSlug(null);
  }
}

  private toLang(l: string): Lang {
    return l?.toLowerCase().startsWith('pl') ? 'pl' : 'en';
  }
}