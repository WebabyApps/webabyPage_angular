import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeroComponent } from '../../shared/hero/hero.component';
import { TutorialSectionComponent } from '../../shared/tutorial-section/tutorial-section.component';
import { FadeInOnScrollDirective } from '../../shared/directives/fade-in-on-scroll.directive';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-tutorial-page',
  standalone: true,
  imports: [CommonModule, HeroComponent, TutorialSectionComponent, FadeInOnScrollDirective, TranslocoModule],
  templateUrl: './tutorial-page.component.html',
  styleUrls: ['./tutorial-page.component.scss']
})
export class TutorialPageComponent implements OnInit {
  slug = '';
  productTitle = '';
  scopePath: string | null = null; // <- do Transloco scope: 'tutorials/<slug>'

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // reaguj na zmiany :slug (np. nawigacja w obrębie tego samego komponentu)
    this.route.paramMap.subscribe(pm => {
      const fromParam = pm.get('slug') ?? '';
      const fromData  = (this.route.snapshot.data['slug'] as string) ?? '';
      this.slug = fromParam || fromData;

      this.productTitle = this.prettyTitle(this.slug);
      this.scopePath = this.slug ? `tutorials/${this.slug}` : null;
    });
  }

  private prettyTitle(slug: string): string {
    const names: Record<string, string> = {
      abecadlowo: 'Abecadłowo',
      'basketball-shots': 'Basketball-shots',
      'system-of-equations-trainer': 'System-of-equations-trainer',
      'abc-land': 'ABC Land'
    };
    return names[slug] ?? this.capitalize(slug);
  }

  private capitalize(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
}
