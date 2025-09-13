import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule], // ⬅️ dodane Transloco
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  @Input() title?: string;                // ⬅️ bez wartości domyślnej
  @Input() subtitle?: string;             // ⬅️ j.w.
  @Input() ctaText?: string;              // ⬅️ j.w.
  @Input() ctaLink: string | any[] | null = null;   // '/' lub ['/']
  @Input() ctaFragment?: string;                    // 'products'
  @Input() compact = false;

  scrollToProducts() {
    const el = document.querySelector('#products');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
