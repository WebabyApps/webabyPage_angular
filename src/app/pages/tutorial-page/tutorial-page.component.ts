// src/app/pages/tutorial-page/tutorial-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeroComponent } from '../../shared/hero/hero.component';
import { TutorialSectionComponent } from '../../shared/tutorial-section/tutorial-section.component'; 
import { FadeInOnScrollDirective } from '../../shared/directives/fade-in-on-scroll.directive'; // ⬅️ add this  

@Component({
  selector: 'app-tutorial-page',
  standalone: true,
  imports: [CommonModule, HeroComponent, TutorialSectionComponent, FadeInOnScrollDirective ],
  templateUrl: './tutorial-page.component.html',
  styleUrls: ['./tutorial-page.component.scss']  

 
})
export class TutorialPageComponent {
  slug = '';
  productTitle = '';

  constructor(private route: ActivatedRoute) {
    // supports both /products/:slug and the lazy static routes with route.data.slug
    const fromParam = this.route.snapshot.paramMap.get('slug') ?? '';
    const fromData  = (this.route.snapshot.data['slug'] as string) ?? '';
    this.slug = fromParam || fromData;
    this.productTitle = this.prettyTitle(this.slug);
  }

  private prettyTitle(slug: string): string {
    const names: Record<string, string> = {
      abecadlowo: 'Abecadłowo',
      'basketball-shots': 'Basketball-shots',
      'system-of-equations-trainer': 'System-of-equations-trainer'
    };
    return names[slug] ?? this.capitalize(slug);
  }

  private capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
}
