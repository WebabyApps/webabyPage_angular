import { Injectable, signal } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { getPolicyEnForSlug } from './policy-registry.en';
import { getPolicyPlForSlug } from './policy-registry.pl';

type Lang = 'en' | 'pl';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private lang = signal<Lang>('en');

  constructor(private transloco: TranslocoService) {
    this.lang.set(this.toLang(this.transloco.getActiveLang()));
    this.transloco.langChanges$.subscribe(l => this.lang.set(this.toLang(l)));
  }

  getPolicyFor(slug?: string | null): string {
    return this.lang() === 'pl'
      ? getPolicyPlForSlug(slug) || getPolicyEnForSlug(slug)
      : getPolicyEnForSlug(slug);
  }

  private toLang(l: string): Lang {
    return l.toLowerCase().startsWith('pl') ? 'pl' : 'en';
  }
}