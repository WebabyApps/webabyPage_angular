import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule], // <-- needed for [routerLink]/[fragment]
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  @Input() title = 'Webaby';
  @Input() subtitle = 'Play • Learn • Imagine';
  @Input() ctaText = 'Explore Products';
  @Input() ctaLink: string | any[] | null = null;   // e.g. '/' or ['/']
  @Input() ctaFragment?: string;                    // e.g. 'products'
  @Input() compact = false;

  scrollToProducts() {
    const el = document.querySelector('#products');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
