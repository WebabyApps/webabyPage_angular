import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf ,TitleCasePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-product-detail',
  imports: [RouterLink, TitleCasePipe],
  template: `
    <div class="container">
      <h1>{{ slug | titlecase }} – Tutorial</h1>
      <p>Tu dodasz szczegóły, screeny i instrukcję krok-po-kroku.</p>
      <a routerLink="/">← Back</a>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 40px auto; padding: 0 16px; }
  `]
})
export class ProductDetailComponent {
  slug = this.route.snapshot.paramMap.get('slug') ?? '';
  constructor(private route: ActivatedRoute) {}
}

