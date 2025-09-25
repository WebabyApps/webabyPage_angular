import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { POLICY_DEFAULT_EN, POLICY_BY_SLUG_EN } from './policy-registry.en';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  constructor(private router: Router, private route: ActivatedRoute) {}

  /** Zwraca slug produktu z aktualnej trasy (np. 'products/:slug'). */
  getCurrentProductSlug(): string | null {
    // schodzimy do najgłębszego route, szukamy paramMap 'slug'
    let r: ActivatedRoute | null = this.route;
    while (r?.firstChild) r = r.firstChild;
    const slug = r?.snapshot.paramMap.get('slug');
    return slug ?? null;
  }

  /** Tekst polityki dla danego sluga; fallback do globalnej. */
  getPolicyForSlug(slug?: string | null): { title: string; desc: string } {
    if (slug && POLICY_BY_SLUG_EN[slug]) {
      return { title: 'Privacy policy', desc: POLICY_BY_SLUG_EN[slug] };
    }
    return { title: 'Privacy policy', desc: POLICY_DEFAULT_EN };
  }

  /** Tekst polityki dla aktualnej strony. */
  getPolicyForCurrentRoute() {
    return this.getPolicyForSlug(this.getCurrentProductSlug());
  }
}