import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  year = new Date().getFullYear();
  private route = inject(ActivatedRoute);

  /** Pobiera slug produktu, jeśli jesteśmy na stronie /products/:slug */
  get productSlug(): string | null {
    let snap = this.route.snapshot;
    while (snap.firstChild) snap = snap.firstChild;
    return snap.paramMap.get('slug');
  }
}