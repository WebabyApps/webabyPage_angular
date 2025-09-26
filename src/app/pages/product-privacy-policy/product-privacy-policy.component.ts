import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PolicyService } from '../../privacy/policy.service';

@Component({
  selector: 'app-product-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container policy-page">
      <h1>Privacy Policy</h1>
      <pre>{{ policyText() }}</pre>
    </section>
  `,
  styles: [`.policy-page { padding: 2rem; white-space: pre-wrap; }`]
})
export class ProductPrivacyPolicyComponent {
  private route = inject(ActivatedRoute);
  private policy = inject(PolicyService);

  policyText = computed(() => {
    const slug = this.route.snapshot.paramMap.get('slug');
    return this.policy.getPolicyFor(slug); // globalna lub produktowa
  });
}