import { Component, computed, inject, OnInit } from '@angular/core';
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
      <!-- DEBUG: pokaż jaki slug widzi komponent -->
      <small style="opacity:.6">slug: {{ slug }}</small>
      <pre>{{ policyText }}</pre>
    </section>
  `,
  styles: [`.policy-page { padding: 2rem; white-space: pre-wrap; }`]
})
export class ProductPrivacyPolicyComponent {
  private route = inject(ActivatedRoute);
  private policy = inject(PolicyService);
slug: string | null = null;
  policyText = '';

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug');
    this.policyText = this.policy.getPolicyFor(this.slug);
  }

  
}