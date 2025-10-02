// src/app/pages/product-privacy-policy/product-privacy-policy.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { PolicyService } from '../../privacy/policy.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-product-privacy-policy',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  template: `
    <section class="container policy-page">
      <div [innerHTML]="html$ | async"></div>
      <small style="opacity:.6">slug: {{ (slug$ | async) || '—' }}</small>
    </section>
  `,
  styles: [`
    .policy-page {
      padding: 2rem;
      margin-top: 5rem;
      white-space: pre-wrap;
    }
  `]
})
export class ProductPrivacyPolicyComponent {
  private route = inject(ActivatedRoute);
  private policy = inject(PolicyService);

  // slug jako observable (działa też przy przejściach między produktami)
  slug$ = this.route.paramMap.pipe(
    map(pm => (pm.get('slug') ?? '').trim().toLowerCase())
  );

  // HTML z Transloco asynchronicznie (czeka aż i18n się załaduje)
  html$ = this.slug$.pipe(
    switchMap(slug => this.policy.getProductPolicyHtml$(slug))
  );
}
