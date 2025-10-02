import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco'; // ⬅️ DODAJ

@Component({
  selector: 'app-privacy-policy-en',
  standalone: true,
  imports: [CommonModule, TranslocoModule], // ⬅️ DODAJ TranslocoModule
  template: `
    <section class="container policy-page">
      <!-- zamiast this.policy.getGlobalPolicyHtml() -->
      <div [innerHTML]="'policy.global.bodyHtml' | transloco"></div>
    </section>
  `,
  styles: [`.policy-page{padding:2rem}`]
})
export class PrivacyPolicyEnComponent {}
