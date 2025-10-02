import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService } from '../../privacy/policy.service';

@Component({
  selector: 'app-privacy-policy-en',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container policy-page">
      <div [innerHTML]="html"></div>
    </section>
  `,
  styles: [`.policy-page{padding:2rem}`]
})
export class PrivacyPolicyEnComponent implements OnInit {
  private policy = inject(PolicyService);
  html = '';

  ngOnInit() {
    // globalna polityka (z Transloco), z zachowaniem formatowania HTML
    this.html = this.policy.getGlobalPolicyHtml();
  }
}