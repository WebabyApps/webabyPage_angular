import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PolicyService } from '../../privacy/policy.service';

@Component({
  selector: 'app-product-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container policy-page">
      <div [innerHTML]="html"></div>
    </section>
  `,
  styles: [`.policy-page{
              padding: 2rem;
              margin-top: 5rem;  /* ⬅️ odsuwa treść od góry */
              white-space: pre-wrap;
    }`]
})
export class ProductPrivacyPolicyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private policy = inject(PolicyService);
  html = '';

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.html = this.policy.getProductPolicyHtml(slug);
  }
}